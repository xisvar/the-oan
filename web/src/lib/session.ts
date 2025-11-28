import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'oan-secret-key-change-in-production'
);

export interface SessionData {
    userId: string;
    userType: 'student' | 'institution' | 'regulator';
    name?: string;
    email?: string;
    [key: string]: any;
}

export async function createSession(data: SessionData): Promise<string> {
    const token = await new SignJWT(data)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET);

    return token;
}

export async function verifySession(token: string): Promise<SessionData | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as SessionData;
    } catch {
        return null;
    }
}

export function getSessionFromRequest(request: NextRequest): string | null {
    const cookie = request.cookies.get('oan_session');
    return cookie?.value || null;
}

export function createSessionCookie(token: string): string {
    return `oan_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`;
}

export function clearSessionCookie(): string {
    return 'oan_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0';
}
