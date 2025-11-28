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
            // Extract priority flags from profile (mocking for now as profile doesn't have them explicitly)
            const priorityFlags = {
                elds: false,
                catchment: false,
                disability: false
            };

            // Extract raw score (sum of exams)
            const examScore = candidate.score;

            return meritEngine.computeMeritIndex(
                candidate.profile.did,
                program,
                examScore,
                { min: 0, max: 1000 }, // Increased range to handle test duplicates
                10000, // Difficulty 1.0
                { aggregate: 10000 }, // Weight 1.0
                priorityFlags,
                new Date().toISOString() // Should use application timestamp
            );
        });

        // 4. Sort Deterministically
        // Sort by MI DESC, then Timestamp ASC, then ID ASC
        rankedList.sort((a, b) => {
            if (b.mi !== a.mi) return b.mi - a.mi;
            // Timestamp comparison (string ISO)
            if (a.computedAt !== b.computedAt) return a.computedAt.localeCompare(b.computedAt);
            return a.applicantId.localeCompare(b.applicantId);
        });

        // 5. Allocate Seats
        const result = quotaEngine.allocateSeats(rankedList, quotaRule);

        return {
            admitted: result.allocations,
            waitlisted: result.waitlist
        };
    }
}

export const matchingService = new MatchingService();
