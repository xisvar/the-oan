import { NextResponse } from 'next/server';
import { ledger } from '@/lib/ledger';

export async function GET() {
    try {
        const events = await ledger.getLedger();
        const verification = await ledger.verifyChain();

        return NextResponse.json({
            events,
            integrity: verification
        });
    } catch (error) {
        console.error('Error fetching ledger:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
