import { ApplicantProfile } from './events';
import { AdmissionRule, EligibilityResult } from './rules';

export class RulesEngine {

    evaluateApplicant(profile: ApplicantProfile, rule: AdmissionRule): EligibilityResult {
        const reasons: string[] = [];
        let eligible = true;
        let totalScore = 0;

        // 1. Calculate Aggregate Score
        // For this prototype, we sum the scores of all exam results.
        // In a real system, this would use specific weights defined in the rule or a standard formula.
        totalScore = profile.examResults.reduce((sum, result) => sum + result.score, 0);

        // 2. Check Cutoff
        if (totalScore < rule.enforcement.finalCutoff) {
            eligible = false;
            reasons.push(`Score ${totalScore} is below cutoff ${rule.enforcement.finalCutoff}`);
        }

        // 3. Check Required Subjects
        for (const req of rule.enforcement.requiredSubjects) {
            const match = profile.examResults.find(
                r => r.subject.toLowerCase() === req.subject.toLowerCase()
            );

            if (!match) {
                eligible = false;
                reasons.push(`Missing required subject: ${req.subject}`);
                continue;
            }

            // Check Grade (Simple check: A > B > C...)
            // In production, use a proper grade value map
            if (req.minGrade && match.grade > req.minGrade) { // Lexicographical comparison (A < B is false, wait... A < B is true in ASCII)
                // A=65, B=66. So 'A' < 'B'. 
                // If minGrade is 'C' (67), and student has 'B' (66). 'B' < 'C'.
                // So if studentGrade > minGrade, it means student grade is WORSE (e.g. D > C).
                // Wait, standard grading: A1, B2, B3, C4, C5, C6, D7, E8, F9.
                // Let's assume simple A, B, C, D, F for now where A is best.
                // So 'A' < 'C' is true. 
                // If student has 'D', 'D' > 'C' is true. So D is worse than C.
                // So if match.grade > req.minGrade, they fail.

                eligible = false;
                reasons.push(`Grade ${match.grade} in ${req.subject} is below minimum ${req.minGrade}`);
            }

            if (req.minScore && match.score < req.minScore) {
                eligible = false;
                reasons.push(`Score ${match.score} in ${req.subject} is below minimum ${req.minScore}`);
            }
        }

        return {
            eligible,
            score: totalScore,
            reasons
        };
    }
}

export const rulesEngine = new RulesEngine();
