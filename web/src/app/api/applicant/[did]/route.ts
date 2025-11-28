import { NextResponse } from 'next/server';
import { stateEngine } from '@/lib/state';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ did: string }> }
) {
    try {
        const { did } = await params;
        const state = await stateEngine.computeApplicantState(did);

        if (!state) {
            return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
        }

        return NextResponse.json({ state });
    } catch (error) {
        console.error('Error fetching applicant state:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
