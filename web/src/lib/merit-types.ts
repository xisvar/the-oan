export type UUID = string; // UUIDv4

export interface PriorityFlags {
    elds: boolean;
    catchment: boolean;
    disability: boolean;
}

export interface ApplicantScore {
    id: UUID;
    applicantId: UUID;
    programId: UUID;
    examScore: number;           // raw integer
    normalizedScore: number;     // scaled int (x1e4)
    subjectWeights: Record<string, number>; // e.g., { math: 12000, eng: 8000 } scaled x1e4
    programDifficulty: number;   // multiplier scaled x1e4
    priorityFlags: PriorityFlags;
    priorityBoost: number;       // scaled x1e4
    penalties: number;           // scaled x1e4
    mi: number;                  // final merit index scaled x1e4
    computedAt: string;          // ISO timestamp
    explain?: any;               // structured trace of calculation
}

export type QuotaBucketType = "MERIT" | "RESERVED" | "INTERNATIONAL" | "DIVERSITY" | "SPECIAL";

export interface QuotaBucket {
    bucketId: string;       // e.g., 'MERIT_MAIN', 'STATE_RESERVED'
    type: QuotaBucketType;
    count: number;          // seats allocated to this bucket
    minRequired?: number;   // minimum seats to satisfy (for diversity minima)
    priority?: number;      // resolution priority when filling
}

export interface QuotaRule {
    id: UUID;
    programId: UUID;
    seats: number;          // total seats (hard cap)
    quotaBuckets: QuotaBucket[];
    yieldEstimate: number;  // e.g., 0.6 (60% expected turnout)
    constraints?: {
        accreditationLimit?: number;
        budgetLimit?: number;
    };
    createdAt: string;
    version: number;
}

export interface Allocation {
    id: UUID;
    programId: UUID;
    applicantId: UUID;
    bucketId: string;
    mi: number;
    rankInBucket: number;
    allocatedAt: string;
    evidence: any;
}
