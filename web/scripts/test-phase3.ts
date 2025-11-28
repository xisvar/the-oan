import { ledger } from '../src/lib/ledger';
import { stateEngine } from '../src/lib/state';
import { keyStore } from '../src/lib/keystore';

async function run() {
    try {
        console.log('--- Starting Phase 3 Test: Applicant State ---');

        const studentDid = 'did:oan:student:phase3-test';
        // Ensure student has keys
        keyStore.getOrCreateKey(studentDid);

        // 1. Create Applicant
        console.log('\n1. Creating Applicant...');
        await ledger.appendEvent('APPLICANT_CREATED', {
            did: studentDid,
            name: 'Phase 3 Student',
            email: 'student@test.com'
        }, studentDid, studentDid);

        // 2. Add Exam Result
        console.log('\n2. Adding Exam Result...');
        await ledger.appendEvent('EXAM_RESULT_ADDED', {
            credentialId: 'cred-123',
            subject: 'Physics',
            score: 88,
            grade: 'A',
            issuer: 'did:oan:institution:waec'
        }, studentDid, studentDid);

        // 3. Update Preference
        console.log('\n3. Updating Preference...');
        await ledger.appendEvent('PREFERENCE_UPDATED', {
            course: 'Computer Science',
            institution: 'Unilag'
        }, studentDid, studentDid);

        // 4. Compute State
        console.log('\n4. Computing State...');
        const state = await stateEngine.computeApplicantState(studentDid);
        console.log('Computed State:', JSON.stringify(state, null, 2));

        // 5. Verify State
        console.log('\n5. Verifying State...');
        if (state && state.name === 'Phase 3 Student' && state.examResults.length === 1 && state.preferences.course === 'Computer Science') {
            console.log('✅ State Reconstruction: SUCCESS');
        } else {
            console.error('❌ State Reconstruction: FAILED');
        }

        console.log('\n--- End Phase 3 Test ---');
    } catch (error) {
        console.error('CRITICAL ERROR:', error);
    }
}

run();
