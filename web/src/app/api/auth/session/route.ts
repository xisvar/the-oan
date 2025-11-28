import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, verifySession } from '@/lib/session';

export async function GET(request: NextRequest) {
    try {
        const token = getSessionFromRequest(request);

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const session = await verifySession(token);

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Invalid session' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            session
        });

    } catch (error) {
        console.error('Session verification error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
