import { ledger } from '../src/lib/ledger';
import { keyStore } from '../src/lib/keystore';
import { registry } from '../src/lib/registry';
import { stateEngine } from '../src/lib/state';

async function run() {
    try {
        console.log('--- Starting Phase 7 Test: Wallet & Verification ---');

        const institutionDid = 'did:oan:institution:unilag';
        const studentDid = 'did:oan:student:p7-s1';

        // Ensure keys
        keyStore.getOrCreateKey(institutionDid);
        keyStore.getOrCreateKey(studentDid);

        // 1. Issue Credential (Simulate)
        console.log('\n1. Issuing Credential...');
        // We use the ledger directly to simulate issuance + exam result addition
        await ledger.appendEvent('APPLICANT_CREATED', { did: studentDid, name: 'Wallet Student', email: 'wallet@test.com' }, studentDid, studentDid);

        // In a real flow, the institution issues a VC, and the student adds it to their profile.
        // Here we just add the exam result to the profile state.
        await ledger.appendEvent('EXAM_RESULT_ADDED', {
            credentialId: 'c-wallet-1',
            subject: 'WalletMath',
            score: 250,
            grade: 'A1',
            issuer: institutionDid
        }, studentDid, studentDid);

        // 2. Fetch Profile (Simulate API)
        console.log('\n2. Fetching Profile...');
        const profile = await stateEngine.computeApplicantState(studentDid);
        if (profile && profile.examResults.length > 0) {
            console.log('✅ Profile Fetch: SUCCESS');
            console.log('Credentials:', profile.examResults.map(c => c.subject).join(', '));
        } else {
            console.error('❌ Profile Fetch: FAILED');
        }

        // 3. Universal Verification (Simulate API)
        console.log('\n3. Universal Verification...');
        // We need a real signed VC to test verification.
        // Let's create one using the crypto lib directly (mocking the Issue API)
        const { signData, canonicalize } = require('../src/lib/crypto');
        const keys = keyStore.getOrCreateKey(institutionDid);

        const credential = {
            id: 'vc-123',
            type: ['VerifiableCredential'],
            issuer: institutionDid,
            issuanceDate: new Date().toISOString(),
            metadata: { version: '1.0' },
            credentialSubject: {
                id: studentDid,
                degree: {
                    type: 'BachelorDegree',
                    name: 'Computer Science'
                }
            }
        };

        const dataToSign = canonicalize(credential);
        const signature = signData(dataToSign, keys.privateKey);

        const signedCredential = {
            ...credential,
            proof: {
                type: 'EcdsaSecp256r1Signature2019',
                created: new Date().toISOString(),
                verificationMethod: `${institutionDid}#key-1`,
                proofPurpose: 'assertionMethod',
                signatureValue: signature
            }
        };

        // Now verify it using the logic from the API (we can't call API directly in script easily without fetch)
        // We'll use the registry and verifySignature directly to simulate the API logic
        const { verifySignature } = require('../src/lib/crypto');
        const issuerRecord = registry.resolve(signedCredential.issuer);

        if (issuerRecord) {
            // Reconstruct data
            const dataToVerify = {
                id: signedCredential.id,
                type: signedCredential.type,
                issuer: signedCredential.issuer,
                issuanceDate: signedCredential.issuanceDate,
                metadata: signedCredential.metadata,
                credentialSubject: signedCredential.credentialSubject
            };
            const canonicalVerify = canonicalize(dataToVerify);
            const isValid = verifySignature(canonicalVerify, signedCredential.proof.signatureValue, issuerRecord.publicKey);

            if (isValid) {
                console.log('✅ Universal Verification: SUCCESS');
            } else {
                console.error('❌ Universal Verification: FAILED (Invalid Signature)');
            }
        } else {
            console.error('❌ Universal Verification: FAILED (Issuer not found)');
        }

        console.log('\n--- End Phase 7 Test ---');

    } catch (error) {
        console.error('CRITICAL ERROR:', error);
    }
}

run();
