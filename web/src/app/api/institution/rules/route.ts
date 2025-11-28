import { NextResponse } from 'next/server';
import { ledger } from '@/lib/ledger';
import { keyStore } from '@/lib/keystore';
import { AdmissionRule } from '@/lib/rules';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { rule, issuerDid } = body;

        if (!rule || !issuerDid) {
            return NextResponse.json({ error: 'Missing rule or issuerDid' }, { status: 400 });
        }

        // Validate rule structure (basic check)
        const r = rule as AdmissionRule;
        if (!r.enforcement || !r.derivation) {
            return NextResponse.json({ error: 'Invalid rule structure. Must contain enforcement and derivation.' }, { status: 400 });
        }

        // Ensure issuer has keys
        keyStore.getOrCreateKey(issuerDid);

        // Publish Rule to Ledger
        const event = await ledger.appendEvent(
            'RULE_DEFINED',
            rule,
            issuerDid,
            issuerDid
        );

        return NextResponse.json({ success: true, event });
    } catch (error) {
        console.error('Error publishing rule:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
