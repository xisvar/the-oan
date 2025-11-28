import fs from 'fs';
import path from 'path';
import { generateKeys, KeyPair } from './crypto';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const KEYSTORE_PATH = path.join(process.cwd(), 'keystore.json');
// 32 bytes = 64 hex characters
const ENCRYPTION_KEY = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
const IV_LENGTH = 16;

interface StoredKey {
    did: string;
    encryptedPrivateKey: string;
    publicKey: string;
    iv: string;
}

// Simple encryption for the prototype
function encrypt(text: string): { encrypted: string; iv: string } {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { encrypted: encrypted.toString('hex'), iv: iv.toString('hex') };
}

function decrypt(encrypted: string, ivHex: string): string {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

export class KeyStore {
    private keys: Map<string, StoredKey> = new Map();

    constructor() {
        this.load();
    }

    private load() {
        if (fs.existsSync(KEYSTORE_PATH)) {
            const data = JSON.parse(fs.readFileSync(KEYSTORE_PATH, 'utf-8'));
            data.forEach((k: StoredKey) => this.keys.set(k.did, k));
        }
    }

    private save() {
        const data = Array.from(this.keys.values());
        fs.writeFileSync(KEYSTORE_PATH, JSON.stringify(data, null, 2));
    }

    getOrCreateKey(did: string): KeyPair {
        if (this.keys.has(did)) {
            const stored = this.keys.get(did)!;
            return {
                publicKey: stored.publicKey,
                privateKey: decrypt(stored.encryptedPrivateKey, stored.iv),
            };
        }

        const newKeys = generateKeys();
        const { encrypted, iv } = encrypt(newKeys.privateKey);

        this.keys.set(did, {
            did,
            encryptedPrivateKey: encrypted,
            publicKey: newKeys.publicKey,
            iv,
        });
        this.save();

        return newKeys;
    }

    getPublicKey(did: string): string | undefined {
        return this.keys.get(did)?.publicKey;
    }
}

export const keyStore = new KeyStore();
