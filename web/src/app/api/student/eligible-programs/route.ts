import { NextResponse } from 'next/server';
import { eligibilityService } from '@/lib/eligibility';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const did = searchParams.get('did');

        if (!did) {
            return NextResponse.json({ error: 'Missing did parameter' }, { status: 400 });
        }

        const eligiblePrograms = await eligibilityService.findEligiblePrograms(did);

        return NextResponse.json({
            did,
            count: eligiblePrograms.length,
            programs: eligiblePrograms.map(p => ({
                institution: p.rule.institutionDid,
                program: p.rule.program,
                score: p.score,
                cutoff: p.rule.enforcement.finalCutoff
            }))
        });

    } catch (error) {
        console.error('Error finding eligible programs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
