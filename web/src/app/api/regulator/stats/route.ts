import { NextResponse } from 'next/server';
import { ledger } from '@/lib/ledger';

export async function GET(request: Request) {
    try {
        const events = await ledger.getLedger();

        const stats = {
            totalEvents: events.length,
            totalApplicants: 0,
            totalRules: 0,
            totalApplications: 0,
            totalMatches: 0,
            lastActivity: events.length > 0 ? events[events.length - 1].timestamp : null
        };

        const uniqueApplicants = new Set<string>();

        for (const event of events) {
            if (event.type === 'APPLICANT_CREATED') {
                const p = JSON.parse(event.payload);
                uniqueApplicants.add(p.did);
            }
            if (event.type === 'RULE_DEFINED') {
                stats.totalRules++;
            }
            if (event.type === 'APPLICATION_SUBMITTED') {
                stats.totalApplications++;
            }
            if (event.type === 'OFFER_MADE') {
                stats.totalMatches++;
            }
        }

        stats.totalApplicants = uniqueApplicants.size;

        return NextResponse.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Error fetching regulator stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
