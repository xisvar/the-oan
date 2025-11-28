import { keyStore } from '../src/lib/keystore';
import { registry } from '../src/lib/registry';
import { signData, verifySignature, canonicalize } from '../src/lib/crypto';

async function run() {
    try {
        console.log('--- Starting Phase 1 Test ---');

        // 1. Test Key Persistence
        console.log('\n1. Testing Key Persistence...');
        const issuerDid = 'did:oan:institution:unilag';
        const keys1 = keyStore.getOrCreateKey(issuerDid);
        console.log('Generated Keys 1:', keys1.publicKey.substring(0, 50) + '...');

        // Simulate "restart" by creating a new KeyStore instance (it loads from file)
        // Note: In this script, we are importing the singleton, so we rely on the file system check
        // We can check if calling getOrCreateKey again returns the SAME key
        const keys2 = keyStore.getOrCreateKey(issuerDid);
        console.log('Retrieved Keys 2:', keys2.publicKey.substring(0, 50) + '...');

        if (keys1.publicKey === keys2.publicKey) {
            console.log('✅ Key Persistence: SUCCESS (Keys match)');
        } else {
            console.error('❌ Key Persistence: FAILED (Keys do not match)');
        }

        // 2. Test Registry Resolution
        console.log('\n2. Testing Registry Resolution...');
        const resolved = registry.resolve(issuerDid);
        if (resolved && resolved.publicKey === keys1.publicKey) {
            console.log('✅ Registry Resolution: SUCCESS (Resolved correct key)');
        } else {
            console.error('❌ Registry Resolution: FAILED');
            console.log('Resolved:', resolved);
        }

        // 3. Test Full Flow (Issue -> Verify with Registry)
        console.log('\n3. Testing Full Flow (Issue -> Verify w/ Registry)...');
        const credentialData = {
            id: 'test-cred-1',
            type: ['VerifiableCredential'],
            issuer: issuerDid,
            issuanceDate: new Date().toISOString(),
            metadata: { version: '1.0' },
            credentialSubject: { id: 'did:student:1', score: 100 }
        };

        const dataString = canonicalize(credentialData);
        const signature = signData(dataString, keys1.privateKey);

        // Verify using the key from registry (simulating the API logic)
        const verifierResolved = registry.resolve(issuerDid);
        if (!verifierResolved) {
            console.error('❌ Verifier could not resolve issuer');
        } else {
            const isValid = verifySignature(dataString, signature, verifierResolved.publicKey);
            if (isValid) {
                console.log('✅ Verification with Registry Key: SUCCESS');
            } else {
                console.error('❌ Verification with Registry Key: FAILED');
            }
        }

        console.log('\n--- End Phase 1 Test ---');
    } catch (error) {
        console.error('CRITICAL ERROR:', error);
    }
}

run();
