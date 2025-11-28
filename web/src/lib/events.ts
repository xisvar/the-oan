export type ApplicantEventType =
    | 'APPLICANT_CREATED'
    | 'EXAM_RESULT_ADDED'
    | 'PREFERENCE_UPDATED'
    | 'DOCUMENT_UPLOADED'
    | 'APPLICATION_SUBMITTED'
    | 'UTME_RESULT_ADDED';

export interface Application {
    program: string;
    institutionDid: string;
    dateSubmitted: string;
    status: 'SUBMITTED' | 'UNDER_REVIEW' | 'OFFER_RECEIVED' | 'REJECTED';
}

export interface ApplicantProfile {
    did: string;
    name?: string;
    email?: string;
    examResults: ExamResult[];
    utmeResult?: UTMEResult;
    preferences: {
        course?: string;
        institution?: string;
    };
    documents: DocumentRef[];
    applications: Application[];
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

export interface ApplicationSubmittedPayload {
    program: string;
    institutionDid: string;
}

export interface UtmeResultAddedPayload {
    jambScore: number;
    subjectCombo: string[];
    postUtmeScore?: number;
}

export interface UTMEResult {
    jambScore: number;
    subjectCombo: string[];
    postUtmeScore?: number;
    dateAdded: string;
}
