import { NextResponse } from 'next/server';
import { ledger } from '@/lib/ledger';
import { keyStore } from '@/lib/keystore';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { did, subject, score } = body;

        if (!did || !subject || !score) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Ensure keys exist
        keyStore.getOrCreateKey(did);

        // Append EXAM_RESULT_ADDED
        await ledger.appendEvent(
            'EXAM_RESULT_ADDED',
            {
                credentialId: `mock-${Date.now()}`,
                subject,
                score,
                grade: 'A1',
                issuer: 'did:oan:institution:waec'
            },
            did,
            did
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error adding mock credential:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
