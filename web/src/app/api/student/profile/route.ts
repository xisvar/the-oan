import { NextResponse } from 'next/server';
import { stateEngine } from '@/lib/state';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const did = searchParams.get('did');

        if (!did) {
            return NextResponse.json({ error: 'Missing did parameter' }, { status: 400 });
        }

        const profile = await stateEngine.computeApplicantState(did);

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            profile
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
