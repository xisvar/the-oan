import { ledger } from './ledger';
import {
    ApplicantProfile,
    ApplicantEventType,
    ApplicantCreatedPayload,
    ExamResultAddedPayload,
    PreferenceUpdatedPayload,
    DocumentUploadedPayload
} from './events';

export class StateEngine {

    async computeApplicantState(did: string): Promise<ApplicantProfile | null> {
        // 1. Fetch all events related to this DID (where actor is the student or subject is the student)
        // For simplicity in this prototype, we filter in memory. 
        // In production, we'd use a DB query with an index on `actor` or a separate `subject` column.
        const allEvents = await ledger.getLedger();

        // Filter events relevant to this applicant
        // We assume the `actor` is the applicant for self-actions, 
        // or the payload contains the `subjectId` (e.g. for credentials issued by others)
        const applicantEvents = allEvents.filter(e => {
            // Direct action by applicant
            if (e.actor === did) return true;

            // Action targeting applicant (e.g. Issuance)
            try {
                const payload = JSON.parse(e.payload);
                if (payload.subjectId === did || payload.did === did) return true;
            } catch {
                return false;
            }
            return false;
        });

        if (applicantEvents.length === 0) return null;

        // 2. Replay events to build state
        let state: ApplicantProfile = {
            did,
            examResults: [],
            preferences: {},
            documents: [],
            createdAt: '',
            updatedAt: '',
        };

        for (const event of applicantEvents) {
            const payload = JSON.parse(event.payload);
            const timestamp = event.timestamp.toISOString();

            switch (event.type as ApplicantEventType) {
                case 'APPLICANT_CREATED':
                    const p1 = payload as ApplicantCreatedPayload;
                    state.name = p1.name;
                    state.email = p1.email;
                    state.createdAt = timestamp;
                    break;

                case 'EXAM_RESULT_ADDED':
                    const p2 = payload as ExamResultAddedPayload;
                    // Avoid duplicates
                    if (!state.examResults.find(r => r.credentialId === p2.credentialId)) {
                        state.examResults.push({
                            ...p2,
                            dateAdded: timestamp
                        });
                    }
                    break;

                case 'PREFERENCE_UPDATED':
                    const p3 = payload as PreferenceUpdatedPayload;
                    state.preferences = {
                        ...state.preferences,
                        ...p3
                    };
                    break;

                case 'DOCUMENT_UPLOADED':
                    const p4 = payload as DocumentUploadedPayload;
                    state.documents.push({
                        ...p4,
                        dateAdded: timestamp
                    });
                    break;

                // Handle CREDENTIAL_ISSUED from the Issue API (Phase 1/2 legacy event)
                // We map it to an exam result if it fits
                case 'CREDENTIAL_ISSUED' as any:
                    // In a real system, we might need to fetch the full credential content if not in payload
                    // For now, we assume the payload has what we need or we skip
                    break;
            }

            state.updatedAt = timestamp;
        }

        return state;
    }
}

export const stateEngine = new StateEngine();
