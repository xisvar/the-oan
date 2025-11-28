export type ApplicantEventType =
    | 'APPLICANT_CREATED'
    | 'EXAM_RESULT_ADDED'
    | 'PREFERENCE_UPDATED'
    | 'DOCUMENT_UPLOADED';

export interface ApplicantProfile {
    did: string;
    name?: string;
    email?: string;
    examResults: ExamResult[];
    preferences: {
        course?: string;
        institution?: string;
    };
    documents: DocumentRef[];
    createdAt: string;
    updatedAt: string;
}

export interface ExamResult {
    credentialId: string;
    subject: string;
    score: number;
    grade: string;
    issuer: string;
    dateAdded: string;
}

export interface DocumentRef {
    id: string;
    type: string;
    url: string;
    hash: string;
    dateAdded: string;
}

// Event Payloads
export interface ApplicantCreatedPayload {
    did: string;
    name: string;
    email: string;
}

export interface ExamResultAddedPayload {
    credentialId: string;
    subject: string;
    score: number;
    grade: string;
    issuer: string;
}

export interface PreferenceUpdatedPayload {
    course?: string;
    institution?: string;
}

export interface DocumentUploadedPayload {
    id: string;
    type: string;
    url: string;
    hash: string;
}
