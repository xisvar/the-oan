import { NextResponse } from 'next/server';
import { matchingService } from '@/lib/matching';
import { keyStore } from '@/lib/keystore';
import { ledger } from '@/lib/ledger';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { institutionDid, program } = body;

        if (!institutionDid || !program) {
            return NextResponse.json({ error: 'Missing institutionDid or program' }, { status: 400 });
        }

        // 1. Ensure institution keys exist (for signing offers)
        keyStore.getOrCreateKey(institutionDid);

        // 2. Run Matching
        const result = await matchingService.runMatchingRound(institutionDid, program);

        // 3. Record Offers on Ledger
        for (const allocation of result.admitted) {
            await ledger.appendEvent(
                'OFFER_MADE',
                {
                    institutionDid,
                    program,
                    applicantDid: allocation.applicantId,
                    mi: allocation.mi,
                    bucketId: allocation.bucketId,
                    timestamp: new Date().toISOString()
                },
                institutionDid,
                institutionDid
            );
        }

        return NextResponse.json({
            success: true,
            admitted: result.admitted.map(a => ({
                applicantId: a.applicantId,
                mi: a.mi,
                bucketId: a.bucketId
            })),
            waitlisted: result.waitlisted.map(w => ({
                applicantId: w.applicantId,
                mi: w.mi
            }))
        });

    } catch (error) {
        console.error('Error running matching:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
