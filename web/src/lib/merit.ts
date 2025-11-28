import { ApplicantScore, PriorityFlags } from './merit-types';

// Constants for scaling
const SCALE = 10000;

export class MeritEngine {

    /**
     * Computes the Merit Index (MI) deterministically.
     * All inputs must be integers or scaled integers.
     */
    computeMeritIndex(
        applicantId: string,
        programId: string,
        examScore: number, // Raw score (e.g. 250)
        normalizationParams: { min: number, max: number }, // For Min-Max normalization
        programDifficulty: number, // Scaled x1e4 (e.g. 1.1 -> 11000)
        subjectWeights: Record<string, number>, // Scaled x1e4
        priorityFlags: PriorityFlags,
        timestamp: string
    ): ApplicantScore {

        // 1. Normalize Score (Min-Max)
        // normalized = round(((s - minS) / (maxS - minS)) * 10000)
        const range = normalizationParams.max - normalizationParams.min;
        let normalizedScore = 0;
        if (range > 0) {
            // Use BigInt for intermediate multiplication to avoid overflow before division
            const num = BigInt(examScore - normalizationParams.min) * BigInt(SCALE);
            const den = BigInt(range);
            // Rounding: (num + den/2) / den
            normalizedScore = Number((num + (den / 2n)) / den);
        }
        // Clamp to 0-10000
        normalizedScore = Math.max(0, Math.min(SCALE, normalizedScore));


        // 2. Apply Subject Weights
        // subjectWeighted = Σ (normalizedScore * subjectWeights[subj]) / 1e4
        // For simplicity in this prototype, we assume 'subjectWeights' contains an 'aggregate' weight 
        // or we just apply a base weight if not specified.
        // Let's assume the examScore IS the aggregate for now, so we treat it as having weight 1.0 (10000)
        // unless specific subject weights are passed to adjust components.
        // To strictly follow the formula: "normalizedScore * subjectWeights[subj]" implies we need scores PER subject.
        // We will simplify: The input `examScore` is the aggregate. We apply a "Relevance Weight" to the whole score.
        const relevanceWeight = subjectWeights['aggregate'] || SCALE;

        const base = Math.round((normalizedScore * relevanceWeight) / SCALE);


        // 3. Apply Program Difficulty
        // adjusted = (base * programDifficulty) / 10000
        const adjusted = Math.round((base * programDifficulty) / SCALE);


        // 4. Calculate Priority Boost
        // ELDS +3 (30000), Catchment +1 (10000), Disability +5 (50000)
        let priorityBoost = 0;
        if (priorityFlags.elds) priorityBoost += 30000;
        if (priorityFlags.catchment) priorityBoost += 10000;
        if (priorityFlags.disability) priorityBoost += 50000;


        // 5. Calculate Penalties
        const penalties = 0; // Default 0 for now


        // 6. Final MI
        const mi = adjusted + priorityBoost - penalties;


        return {
            id: crypto.randomUUID(),
            applicantId,
            programId,
            examScore,
            normalizedScore,
            subjectWeights,
            programDifficulty,
            priorityFlags,
            priorityBoost,
            penalties,
            mi,
            computedAt: new Date().toISOString(),
            explain: {
                normalization: { method: "minmax", ...normalizationParams, value: normalizedScore },
                base,
                difficultyApplied: adjusted,
                priorityBoost,
                penalties,
                mi
            }
        };
    }
}

export const meritEngine = new MeritEngine();
