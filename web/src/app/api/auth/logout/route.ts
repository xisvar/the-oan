import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/session';

export async function POST(request: NextRequest) {
    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', clearSessionCookie());
    return response;
}
