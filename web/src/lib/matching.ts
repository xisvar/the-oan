import { ledger } from './ledger';
import { eligibilityService } from './eligibility';
import { AdmissionRule } from './rules';
import { ApplicantProfile } from './events';
import { meritEngine } from './merit';
import { quotaEngine } from './quota';
import { ApplicantScore, QuotaRule, Allocation } from './merit-types';

export interface MatchResult {
    admitted: Allocation[];
    waitlisted: ApplicantScore[];
}

export class MatchingService {

    async runMatchingRound(institutionDid: string, program: string): Promise<MatchResult> {
        console.log(`MatchingService: Finding eligible applicants for ${program}...`);

        // 1. Get Eligible Applicants (Raw Profiles)
        const allEligible = await eligibilityService.findEligibleApplicants(institutionDid, program);

        // Filter: Only those who have APPLIED
        const eligiblePool = allEligible.filter(c => {
            const hasApplied = c.profile.applications.some(
                app => app.program === program && app.institutionDid === institutionDid
            );
            if (!hasApplied) {
                console.log(`MatchingService: Skipping ${c.profile.did} - Eligible but not applied.`);
            }
            return hasApplied;
        });

        console.log(`MatchingService: Found ${eligiblePool.length} eligible AND applied applicants.`);

        // 2. Get Rules (AdmissionRule + QuotaRule)
        const events = await ledger.getLedger();
        let admissionRule: AdmissionRule | null = null;
        for (const event of events) {
            if (event.type === 'RULE_DEFINED') {
                const r = JSON.parse(event.payload) as AdmissionRule;
                if (r.institutionDid === institutionDid && r.program === program) {
                    admissionRule = r;
                }
            }
        }

        if (!admissionRule) throw new Error(`Rule not found for ${institutionDid} - ${program}`);

        // Construct QuotaRule from AdmissionRule (Bridge)
        const quotaRule: QuotaRule = {
            id: crypto.randomUUID(),
            programId: crypto.randomUUID(), // Placeholder
            seats: admissionRule.enforcement.finalQuota,
            yieldEstimate: 1.0,
            version: 1,
            createdAt: new Date().toISOString(),
            quotaBuckets: [
                { bucketId: 'MERIT_MAIN', type: 'MERIT', count: admissionRule.enforcement.finalQuota, priority: 10 }
            ]
        };

        // 3. Compute Merit Index (MI) for each applicant
        const rankedList: ApplicantScore[] = eligiblePool.map(candidate => {
            // Extract priority flags (Mocking for now)
            const priorityFlags = {
                elds: false, // In real system, derived from State/LGA
                catchment: false, // Derived from State/LGA vs School State
                disability: false
            };

            // Extract Scores
            const jambScore = candidate.profile.utmeResult?.jambScore || 0;
            const waecGrades = candidate.profile.examResults.map(r => r.grade);
            const postUtmeScore = candidate.profile.utmeResult?.postUtmeScore || 0;

            const mi = meritEngine.computeAdvancedMeritIndex(jambScore, waecGrades, postUtmeScore);

            return {
                id: crypto.randomUUID(),
                applicantId: candidate.profile.did,
                programId: program,
                examScore: jambScore, // Keeping for reference
                normalizedScore: 0, // Legacy
                subjectWeights: {},
                programDifficulty: 10000,
                priorityFlags,
                priorityBoost: 0,
                penalties: 0,
                mi,
                computedAt: new Date().toISOString(),
                explain: {
                    normalization: { method: "advanced", min: 0, max: 100, value: mi },
                    base: mi,
                    difficultyApplied: mi,
                    priorityBoost: 0,
                    penalties: 0,
                    mi
                }
            };
        });

        // 4. Sort Deterministically (MI DESC)
        rankedList.sort((a, b) => {
            if (b.mi !== a.mi) return b.mi - a.mi;
            if (a.computedAt !== b.computedAt) return a.computedAt.localeCompare(b.computedAt);
            return a.applicantId.localeCompare(b.applicantId);
        });

        // 5. Allocate Seats (Quota Logic: 70/20/10)
        const totalQuota = admissionRule.enforcement.finalQuota;
        const qMerit = Math.floor(totalQuota * 0.70);
        const qCatchment = Math.floor(totalQuota * 0.20);
        const qElds = totalQuota - qMerit - qCatchment;

        const admitted: Allocation[] = [];
        const waitlisted: ApplicantScore[] = [];

        const remainingPool = [...rankedList];

        // Helper to move students to admitted
        const admitTop = (count: number, bucketId: string, filter?: (a: ApplicantScore) => boolean) => {
            let admittedCount = 0;
            for (let i = 0; i < remainingPool.length; i++) {
                if (admittedCount >= count) break;
                const candidate = remainingPool[i];
                if (!filter || filter(candidate)) {
                    admitted.push({
                        id: crypto.randomUUID(),
                        applicantId: candidate.applicantId,
                        programId: program,
                        bucketId: bucketId,
                        allocatedAt: new Date().toISOString(),
                        mi: candidate.mi,
                        rankInBucket: admitted.length + 1,
                        evidence: {
                            score: candidate.mi,
                            bucket: bucketId
                        }
                    });
                    remainingPool.splice(i, 1);
                    i--; // Adjust index
                    admittedCount++;
                }
            }
            return count - admittedCount; // Return leftovers
        };

        // A. Merit Bucket
        admitTop(qMerit, 'MERIT');

        // B. Catchment Bucket
        const catchmentLeftover = admitTop(qCatchment, 'CATCHMENT', (c) => c.priorityFlags.catchment);

        // C. ELDS Bucket
        const eldsLeftover = admitTop(qElds, 'ELDS', (c) => c.priorityFlags.elds);

        // D. Transfer Leftovers to Merit
        const totalLeftover = catchmentLeftover + eldsLeftover;
        if (totalLeftover > 0) {
            admitTop(totalLeftover, 'MERIT_LEFTOVER');
        }

        // Rest are waitlisted
        waitlisted.push(...remainingPool);

        return {
            admitted,
            waitlisted
        };
    }
}

export const matchingService = new MatchingService();
