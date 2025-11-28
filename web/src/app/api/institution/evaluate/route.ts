import { NextResponse } from 'next/server';
import { stateEngine } from '@/lib/state';
import { rulesEngine } from '@/lib/rules-engine';
import { AdmissionRule } from '@/lib/rules';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { applicantDid, rule } = body;

        if (!applicantDid || !rule) {
            return NextResponse.json({ error: 'Missing applicantDid or rule' }, { status: 400 });
        }

        // 1. Reconstruct Applicant State
        const profile = await stateEngine.computeApplicantState(applicantDid);
        if (!profile) {
            return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
        }

        // 2. Evaluate
        const result = rulesEngine.evaluateApplicant(profile, rule as AdmissionRule);

        return NextResponse.json({
            applicant: profile.name,
            result
        });

    } catch (error) {
        console.error('Error evaluating applicant:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
