import { ledger } from './ledger';
import { stateEngine } from './state';
import { rulesEngine } from './rules-engine';
import { AdmissionRule } from './rules';
import { ApplicantProfile } from './events';

export class EligibilityService {

    /**
     * Finds all programs an applicant is eligible for.
     */
    async findEligiblePrograms(applicantDid: string): Promise<{ rule: AdmissionRule, score: number }[]> {
        // 1. Get Applicant Profile
        const profile = await stateEngine.computeApplicantState(applicantDid);
        if (!profile) return [];

        // 2. Get All Active Rules
        // In a real system, we would query a "Rules View" table.
        // Here, we scan the ledger for RULE_DEFINED events.
        // Optimization: We should cache the latest rule for each (institution, program) pair.
        const events = await ledger.getLedger();
        const rulesMap = new Map<string, AdmissionRule>();

        for (const event of events) {
            if (event.type === 'RULE_DEFINED') {
                const rule = JSON.parse(event.payload) as AdmissionRule;
                const key = `${rule.institutionDid}:${rule.program}`;
                // Overwrite with latest (assuming ledger order is chronological)
                rulesMap.set(key, rule);
            }
        }

        // 3. Evaluate against each rule
        const eligiblePrograms: { rule: AdmissionRule, score: number }[] = [];

        for (const rule of rulesMap.values()) {
            const result = rulesEngine.evaluateApplicant(profile, rule);
            if (result.eligible) {
                eligiblePrograms.push({ rule, score: result.score });
            }
        }

        return eligiblePrograms;
    }

    /**
     * Finds all applicants eligible for a specific rule.
     * WARNING: Expensive operation (O(N*M)). Needs indexing in production.
     */
    async findEligibleApplicants(institutionDid: string, program: string): Promise<{ profile: ApplicantProfile, score: number }[]> {
        // 1. Get the specific rule
        // (Reusing the scan logic for prototype simplicity)
        const events = await ledger.getLedger();
        let targetRule: AdmissionRule | null = null;

        for (const event of events) {
            if (event.type === 'RULE_DEFINED') {
                const rule = JSON.parse(event.payload) as AdmissionRule;
                if (rule.institutionDid === institutionDid && rule.program === program) {
                    targetRule = rule; // Keep updating to get the latest
                }
            }
        }

        if (!targetRule) return [];

        // 2. Get All Applicants
        // We need to find all unique DIDs that have APPLICANT_CREATED events
        const applicantDids = new Set<string>();
        for (const event of events) {
            if (event.type === 'APPLICANT_CREATED') {
                const payload = JSON.parse(event.payload);
                applicantDids.add(payload.did);
            }
        }

        // 3. Evaluate each applicant
        const eligibleApplicants: { profile: ApplicantProfile, score: number }[] = [];

        for (const did of applicantDids) {
            const profile = await stateEngine.computeApplicantState(did);
            if (profile) {
                const result = rulesEngine.evaluateApplicant(profile, targetRule);
                if (result.eligible) {
                    eligibleApplicants.push({ profile, score: result.score });
                }
            }
        }

        return eligibleApplicants;
    }
}

export const eligibilityService = new EligibilityService();
