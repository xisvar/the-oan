import { prisma } from './prisma';
import { hashData, signData } from './crypto';
import { keyStore } from './keystore';

export class LedgerService {
    /**
     * Appends a new event to the ledger.
     * Ensures the event is linked to the previous one via hash.
     */
    async appendEvent(
        type: string,
        payload: any,
        actorDid: string,
        signerDid: string // The DID of the entity signing this event (usually the actor or the system)
    ) {
        // 1. Get the last event to establish the chain
        const lastEvent = await prisma.ledgerEvent.findFirst({
            orderBy: { timestamp: 'desc' },
        });

        const prevHash = lastEvent ? lastEvent.hash : 'GENESIS_HASH';
        const timestamp = new Date();
        const payloadStr = JSON.stringify(payload);

        // 2. Compute the hash of this new event
        // Hash = SHA256(prevHash + payload + timestamp + type + actor)
        // We canonicalize implicitly by strict ordering here
        const dataToHash = `${prevHash}|${type}|${payloadStr}|${timestamp.toISOString()}|${actorDid}`;
        const hash = hashData(dataToHash);

        // 3. Sign the event hash
        // The signer proves they authorized this specific chain extension
        const keys = keyStore.getOrCreateKey(signerDid);
        const signature = signData(hash, keys.privateKey);

        // 4. Persist
        const event = await prisma.ledgerEvent.create({
            data: {
                type,
                payload: payloadStr,
                prevHash,
                hash,
                signature,
                timestamp,
                actor: actorDid,
            },
        });

        return event;
    }

    async getLedger() {
        return prisma.ledgerEvent.findMany({
            orderBy: { timestamp: 'asc' },
        });
    }

    async verifyChain(): Promise<{ isValid: boolean; error?: string }> {
        const events = await this.getLedger();

        if (events.length === 0) return { isValid: true };

        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const prevHash = i === 0 ? 'GENESIS_HASH' : events[i - 1].hash;

            if (event.prevHash !== prevHash) {
                return { isValid: false, error: `Broken link at index ${i}. Expected prevHash ${prevHash}, got ${event.prevHash}` };
            }

            const dataToHash = `${prevHash}|${event.type}|${event.payload}|${event.timestamp.toISOString()}|${event.actor}`;
            const recomputedHash = hashData(dataToHash);

            if (recomputedHash !== event.hash) {
                return { isValid: false, error: `Invalid hash at index ${i}. Data may have been tampered.` };
            }

            // Verify signature (optional but recommended)
            // const keys = keyStore.getOrCreateKey(event.actor);
            // if (!verifySignature(event.hash, event.signature, keys.publicKey)) {
            //   return { isValid: false, error: `Invalid signature at index ${i}` };
            // }
        }

        return { isValid: true };
    }
}

export const ledger = new LedgerService();
