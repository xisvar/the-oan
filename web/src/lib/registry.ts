import { keyStore } from './keystore';

export interface IssuerRecord {
    did: string;
    name: string;
    publicKey: string;
    status: 'ACTIVE' | 'REVOKED';
}

// In a real system, this would be a smart contract or a public database
// For Phase 1, we mock it using the KeyStore and some hardcoded metadata
export class Registry {
    private issuers: Map<string, Omit<IssuerRecord, 'publicKey'>> = new Map();

    constructor() {
        // Seed some known issuers
        this.issuers.set('did:oan:institution:unilag', {
            did: 'did:oan:institution:unilag',
            name: 'University of Lagos',
            status: 'ACTIVE',
        });
        this.issuers.set('did:oan:institution:waec', {
            did: 'did:oan:institution:waec',
            name: 'West African Examinations Council',
            status: 'ACTIVE',
        });
    }

    resolve(did: string): IssuerRecord | null {
        // 1. Check if we have metadata for this issuer
        // For the prototype, we allow any DID that exists in our KeyStore to be "resolved"
        // effectively auto-registering them if they are local.

        const publicKey = keyStore.getPublicKey(did);
        if (!publicKey) return null;

        const meta = this.issuers.get(did) || {
            did,
            name: 'Unknown Issuer',
            status: 'ACTIVE',
        };

        return {
            ...meta,
            publicKey,
        };
    }

    register(did: string, name: string) {
        this.issuers.set(did, { did, name, status: 'ACTIVE' });
    }
}

export const registry = new Registry();
