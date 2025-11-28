import { Credential, OANEvent } from './types';
import { hashData } from './crypto';

// In-memory storage for the prototype
// In a real system, this would be a Postgres database
const credentials: Map<string, Credential> = new Map();
const eventLog: OANEvent[] = [];

export const db = {
    addCredential: (credential: Credential) => {
        credentials.set(credential.id, credential);
    },

    getCredential: (id: string) => {
        return credentials.get(id);
    },

    addEvent: (type: OANEvent['type'], payload: any, signature: string) => {
        const previousHash = eventLog.length > 0
            ? hashData(JSON.stringify(eventLog[eventLog.length - 1]))
            : '0000000000000000000000000000000000000000000000000000000000000000';

        const event: OANEvent = {
            id: crypto.randomUUID(),
            type,
            payload,
            timestamp: new Date().toISOString(),
            previousHash,
            signature,
        };

        eventLog.push(event);
        return event;
    },

    getLog: () => {
        return [...eventLog];
    },
};
