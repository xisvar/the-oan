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
        const events = await ledger.getLedger();
        const rulesMap = new Map<string, AdmissionRule>();

        for (const event of events) {
            if (event.type === 'RULE_DEFINED') {
                const rule = JSON.parse(event.payload) as AdmissionRule;
                const key = `${rule.institutionDid}:${rule.program}`;
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
     */
    async findEligibleApplicants(institutionDid: string, program: string): Promise<{ profile: ApplicantProfile, score: number }[]> {
        console.log(`EligibilityService: Finding applicants for ${program} at ${institutionDid}`);

        // 1. Get the specific rule
        const events = await ledger.getLedger();
        let targetRule: AdmissionRule | null = null;

        for (const event of events) {
            if (event.type === 'RULE_DEFINED') {
                const rule = JSON.parse(event.payload) as AdmissionRule;
                if (rule.institutionDid === institutionDid && rule.program === program) {
                    targetRule = rule;
                }
            }
        }

        if (!targetRule) {
            console.log(`EligibilityService: Rule not found.`);
            return [];
        }

        // 2. Get All Applicants
        const applicantDids = new Set<string>();
        for (const event of events) {
            if (event.type === 'APPLICANT_CREATED') {
                const payload = JSON.parse(event.payload);
                applicantDids.add(payload.did);
            }
        }
        console.log(`EligibilityService: Found ${applicantDids.size} total applicants.`);

        // 3. Evaluate each applicant
        const eligibleApplicants: { profile: ApplicantProfile, score: number }[] = [];

        for (const did of applicantDids) {
            const profile = await stateEngine.computeApplicantState(did);
            if (profile) {
                const result = rulesEngine.evaluateApplicant(profile, targetRule);
                if (result.eligible) {
                    eligibleApplicants.push({ profile, score: result.score });
                } else {
                    console.log(`Applicant ${profile.name} (${did}) NOT eligible: ${result.reasons.join(', ')}`);
                }
            }
        }

        return eligibleApplicants;
    }
}

export const eligibilityService = new EligibilityService();
