export type StreamType = 'SCIENCE' | 'COMMERCIAL' | 'ARTS' | 'UNCLASSIFIED';

const SCIENCE_CORE = ['mathematics', 'english', 'biology', 'chemistry', 'physics'];
const COMMERCIAL_CORE = ['mathematics', 'english', 'economics', 'commerce', 'accounting'];
const ARTS_CORE = ['english', 'government', 'literature', 'crk', 'irk', 'history'];

export interface SubjectGrade {
    subject: string;
    grade: string; // A1, B2, etc.
}

export function classifyStream(subjects: SubjectGrade[]): { stream: StreamType; confidence: number; source: string } {
    const subjectNames = subjects.map(s => s.subject.toLowerCase());

    const scienceCount = SCIENCE_CORE.filter(core => subjectNames.includes(core)).length;
    const commercialCount = COMMERCIAL_CORE.filter(core => subjectNames.includes(core)).length;
    const artsCount = ARTS_CORE.filter(core => subjectNames.includes(core)).length;

    let stream: StreamType = 'UNCLASSIFIED';
    let maxCount = 0;

    // Priority: Science > Commercial > Arts (Arbitrary tie-breaker, but usually distinct)
    // Rule: At least 3 core subjects required

    if (scienceCount >= 3 && scienceCount >= maxCount) {
        stream = 'SCIENCE';
        maxCount = scienceCount;
    }

    if (commercialCount >= 3 && commercialCount > maxCount) { // Strict > to prefer Science in tie? No, let's just pick highest.
        // Actually, if Science=3 and Commercial=3 (e.g. Math, Eng, Econ + Bio?), it's ambiguous.
        // Let's stick to simple max logic.
        stream = 'COMMERCIAL';
        maxCount = commercialCount;
    } else if (commercialCount >= 3 && commercialCount === maxCount) {
        // Tie with Science? 
        // Math, Eng are shared. 
        // If they have Bio, Chem, Phys (Science=5) vs Econ, Comm, Acc (Comm=5).
        // Unlikely to have both fully.
    }

    if (artsCount >= 3 && artsCount > maxCount) {
        stream = 'ARTS';
        maxCount = artsCount;
    }

    return {
        stream,
        confidence: maxCount, // Simple confidence metric
        source: 'AUTOMATED_RULE_ENGINE'
    };
}
