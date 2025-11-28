import { NextResponse } from 'next/server';
import { verifySignature, canonicalize } from '@/lib/crypto';
import { registry } from '@/lib/registry';
import { Credential } from '@/lib/types';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { credential, publicKey: providedKey } = body;

        if (!credential) {
            return NextResponse.json({ error: 'Missing credential' }, { status: 400 });
        }

        const cred = credential as Credential;
        let publicKey = providedKey;

        // If no key provided, try to resolve from registry
        if (!publicKey) {
            const issuerRecord = registry.resolve(cred.issuer);
            if (issuerRecord) {
                publicKey = issuerRecord.publicKey;
            } else {
                return NextResponse.json({
                    isValid: false,
                    details: `Unknown issuer: ${cred.issuer}. Public key not found in registry.`
                });
            }
        }

        // Reconstruct the signed data
        // MUST match exactly how it was constructed in issue/route.ts
        const dataToVerify = canonicalize({
            id: cred.id,
            type: cred.type, // Added type
            issuer: cred.issuer,
            issuanceDate: cred.issuanceDate,
            metadata: cred.metadata, // Added metadata
            credentialSubject: cred.credentialSubject,
        });

        const isValid = verifySignature(dataToVerify, cred.proof.jws, publicKey);

        return NextResponse.json({
            isValid,
            details: isValid ? 'Signature verified successfully' : 'Invalid signature'
        });

    } catch (error) {
        console.error('Error verifying credential:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
