import { NextResponse } from 'next/server';
import { signData, canonicalize } from '@/lib/crypto';
import { keyStore } from '@/lib/keystore';
import { ledger } from '@/lib/ledger';
import { Credential } from '@/lib/types';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { subjectId, claims, issuerDid } = body; // Expect issuerDid from request or default

        if (!subjectId || !claims) {
            return NextResponse.json({ error: 'Missing subjectId or claims' }, { status: 400 });
        }

        // Default to a demo issuer if not provided
        const issuer = issuerDid || 'did:oan:institution:unilag';

        // Get persistent keys for this issuer
        const keys = keyStore.getOrCreateKey(issuer);

        const credentialId = crypto.randomUUID();
        const issuanceDate = new Date().toISOString();

        const credentialSubject = {
            id: subjectId,
            ...claims,
        };

        const metadata = {
            version: '1.0',
            schemaId: 'schema:oan:generic:v1'
        };

        // Construct the data to sign
        const dataToSign = canonicalize({
            id: credentialId,
            type: ['VerifiableCredential'],
            issuer,
            issuanceDate,
            metadata,
            credentialSubject,
        });

        const signature = signData(dataToSign, keys.privateKey);

        const credential: Credential = {
            id: credentialId,
            type: ['VerifiableCredential'],
            issuer,
            issuanceDate,
            metadata,
            credentialSubject,
            proof: {
                type: 'EcdsaSecp256r1Signature2019',
                created: issuanceDate,
                verificationMethod: `${issuer}#key-1`,
                proofPurpose: 'assertionMethod',
                jws: signature,
            },
        };

        // Log event to the immutable ledger
        await ledger.appendEvent(
            'CREDENTIAL_ISSUED',
            { credentialId, issuer, subjectId },
            issuer, // Actor
            issuer  // Signer
        );

        return NextResponse.json({
            credential,
            publicKey: keys.publicKey
        });

    } catch (error) {
        console.error('Error issuing credential:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
