import { NextResponse } from 'next/server';
import { eligibilityService } from '@/lib/eligibility';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const institutionDid = searchParams.get('institutionDid');
        const program = searchParams.get('program');

        if (!institutionDid || !program) {
            return NextResponse.json({ error: 'Missing institutionDid or program parameter' }, { status: 400 });
        }

        const eligibleApplicants = await eligibilityService.findEligibleApplicants(institutionDid, program);

        return NextResponse.json({
            institutionDid,
            program,
            count: eligibleApplicants.length,
            applicants: eligibleApplicants.map(a => ({
                did: a.profile.did,
                name: a.profile.name,
                score: a.score
            }))
        });

    } catch (error) {
        console.error('Error finding eligible applicants:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
