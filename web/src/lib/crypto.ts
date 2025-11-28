import { generateKeyPairSync, sign, verify, createHash } from 'node:crypto';

export interface KeyPair {
    publicKey: string;
    privateKey: string;
}

/**
 * Generates a new ECDSA key pair (prime256v1 / P-256).
 * Returns keys in PEM format.
 */
export function generateKeys(): KeyPair {
    const { publicKey, privateKey } = generateKeyPairSync('ec', {
        namedCurve: 'prime256v1',
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
        },
    });

    return { publicKey, privateKey };
}

/**
 * Signs data using the private key.
 * @param data The string data to sign.
 * @param privateKey The PEM encoded private key.
 * @returns The signature in hex format.
 */
export function signData(data: string, privateKey: string): string {
    const signFunc = sign('sha256', Buffer.from(data), privateKey);
    return signFunc.toString('hex');
}

/**
 * Verifies a signature against the data and public key.
 * @param data The original string data.
 * @param signature The signature in hex format.
 * @param publicKey The PEM encoded public key.
 * @returns True if valid, false otherwise.
 */
export function verifySignature(data: string, signature: string, publicKey: string): boolean {
    try {
        return verify(
            'sha256',
            Buffer.from(data),
            publicKey,
            Buffer.from(signature, 'hex')
        );
    } catch (error) {
        console.error('Verification error:', error);
        return false;
    }
}

/**
 * Computes SHA-256 hash of data.
 */
export function hashData(data: string): string {
    return createHash('sha256').update(data).digest('hex');
}

/**
 * Canonicalizes an object to a deterministic JSON string.
 * Sorts keys recursively.
 */
export function canonicalize(obj: any): string {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
        return JSON.stringify(obj);
    }

    const sortedKeys = Object.keys(obj).sort();
    const parts = sortedKeys.map(key => {
        return `"${key}":${canonicalize(obj[key])}`;
    });

    return `{${parts.join(',')}}`;
}
