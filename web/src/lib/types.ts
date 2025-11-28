export interface CredentialMetadata {
    version: string;
    schemaId?: string;
}

export interface CredentialSubject {
    id: string;
    [key: string]: any;
}

export interface Credential {
    id: string;
    type: string[];
    issuer: string;
    issuanceDate: string;
    metadata?: CredentialMetadata;
    credentialSubject: CredentialSubject;
    proof: {
        type: string;
        created: string;
        verificationMethod: string;
        proofPurpose: string;
        jws: string;
    };
}

export interface OANEvent {
    id: string;
    type: 'CREDENTIAL_ISSUED' | 'CREDENTIAL_REVOKED' | 'RULE_UPDATED';
    payload: any;
    timestamp: string;
    previousHash: string;
    signature: string;
}
