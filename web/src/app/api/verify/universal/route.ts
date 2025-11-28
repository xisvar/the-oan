import { NextResponse } from 'next/server';
import { registry } from '@/lib/registry';
import { verifySignature, canonicalize } from '@/lib/crypto';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const credential = body;

        // Basic Schema Validation
        if (!credential.issuer || !credential.credentialSubject || !credential.proof || !credential.proof.signatureValue) {
            return NextResponse.json({
                isValid: false,
                error: 'Invalid Credential Format. Missing required fields.'
            }, { status: 400 });
        }

        // 1. Resolve Issuer
        const issuerRecord = registry.resolve(credential.issuer);
        if (!issuerRecord) {
            return NextResponse.json({
                isValid: false,
                error: `Unknown Issuer: ${credential.issuer}`
            });
        }

        // 2. Reconstruct Signed Data
        // We must exclude the proof object itself from the signed data, 
        // but typically the proof contains the signature over the REST of the document.
        // In our simple Phase 1 implementation, we signed the canonicalized object WITHOUT the proof property.
        // Let's check how we issued it.
        // In `issue/route.ts`:
        /*
            const dataToSign = canonicalize({
                id: credentialId,
                type: ['VerifiableCredential'],
                issuer,
                issuanceDate,
                metadata,
                credentialSubject,
            });
        */
        // So we need to reconstruct exactly that object.

        const dataToVerify = {
            id: credential.id,
            type: credential.type,
            issuer: credential.issuer,
            issuanceDate: credential.issuanceDate,
            metadata: credential.metadata,
            credentialSubject: credential.credentialSubject
        };

        const canonicalData = canonicalize(dataToVerify);
        const signature = credential.proof.signatureValue;

        // 3. Verify Signature
        const isValid = verifySignature(canonicalData, signature, issuerRecord.publicKey);

        return NextResponse.json({
            isValid,
            issuer: issuerRecord,
            credentialId: credential.id
        });

    } catch (error) {
        console.error('Error verifying credential:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
