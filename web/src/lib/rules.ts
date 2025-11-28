export interface AdmissionRule {
    institutionDid: string;
    program: string;

    // The actual values used for decision making
    enforcement: {
        finalCutoff: number;
        finalQuota: number;
        requiredSubjects: {
            subject: string;
            minGrade: string; // e.g., "C6", "A1"
            minScore?: number;
        }[];
    };

    // The "proof of work" showing how the enforcement values were calculated
    derivation: {
        cutoffParams: {
            capacityScore: number; // Based on class size, faculty count
            rigorScore: number; // Multiplier for program difficulty
            distributionStats: {
                mean: number;
                median: number;
                percentile75: number;
                percentile90: number;
            };
            tierScore: number; // Institutional ranking adjustment
            baseCutoff: number; // The raw calculated cutoff before adjustments
        };
        quotaParams: {
            constraints: {
                physicalCapacity: number;
                accreditationLimit: number;
                budgetLimit: number;
            };
            yieldRate: number; // Expected student acceptance rate (0.0 - 1.0)
            strategyMultiplier: number; // Growth/shrinkage factor
        };
    };

    timestamp: string;
}

export interface EligibilityResult {
    eligible: boolean;
    score: number;
    reasons: string[];
}
