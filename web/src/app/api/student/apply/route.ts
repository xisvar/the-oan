import { NextResponse } from 'next/server';
import { ledger } from '@/lib/ledger';
import { keyStore } from '@/lib/keystore';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { did, program, institutionDid } = body;

        if (!did || !program || !institutionDid) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Ensure student keys exist (for signing)
        // In a real wallet, the student signs client-side.
        // Here we simulate it by using the keystore.
        keyStore.getOrCreateKey(did);

        const event = await ledger.appendEvent(
            'APPLICATION_SUBMITTED',
            {
                program,
                institutionDid
            },
            did, // Actor is student
            did  // Signer is student
        );

        return NextResponse.json({
            success: true,
            eventId: event.id
        });

    } catch (error) {
        console.error('Error submitting application:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
