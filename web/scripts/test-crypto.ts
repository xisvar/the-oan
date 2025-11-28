import { generateKeys, signData, verifySignature, canonicalize } from '../src/lib/crypto';

console.log('--- Starting Crypto Test ---');

// 1. Generate Keys
const keys = generateKeys();
console.log('Keys generated.');

// 2. Create Data
const data = {
    id: 'test-id',
    issuer: 'did:test',
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
        id: 'did:subject',
        score: 99
    }
};

// 3. Canonicalize
const dataString = canonicalize(data);
console.log('Canonicalized Data:', dataString);

// 4. Sign
const signature = signData(dataString, keys.privateKey);
console.log('Signature:', signature);

// 5. Verify (Positive Case)
const isValid = verifySignature(dataString, signature, keys.publicKey);
console.log('Verification Result (Should be true):', isValid);

// 6. Verify (Negative Case - Tampered Data)
const tamperedData = { ...data, credentialSubject: { ...data.credentialSubject, score: 100 } };
const tamperedString = canonicalize(tamperedData);
const isTamperedValid = verifySignature(tamperedString, signature, keys.publicKey);
console.log('Tampered Verification Result (Should be false):', isTamperedValid);

// 7. Verify (Negative Case - Wrong Key)
const otherKeys = generateKeys();
const isWrongKeyValid = verifySignature(dataString, signature, otherKeys.publicKey);
console.log('Wrong Key Verification Result (Should be false):', isWrongKeyValid);

console.log('--- End Crypto Test ---');
