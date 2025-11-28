import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createSession, createSessionCookie } from '@/lib/session';

export async function POST(request: NextRequest) {
    try {
        const { did } = await request.json();

        if (!did) {
            return NextResponse.json(
                { success: false, error: 'DID is required' },
                { status: 400 }
            );
        }

        // Read institutions registry
        const registryPath = join(process.cwd(), 'public', 'data', 'institutions.json');
        const registryContent = readFileSync(registryPath, 'utf-8');
        const registry = JSON.parse(registryContent);

        // Find matching institution
        const institution = registry.institutions.find(
            (inst: any) => inst.did === did
        );

        if (!institution) {
            return NextResponse.json(
                { success: false, error: 'Institution DID not found in registry' },
                { status: 401 }
            );
        }

        // Create session
        const sessionToken = await createSession({
            userId: institution.did,
            userType: 'institution',
            name: institution.name,
            code: institution.code
        });

        // Set cookie
        const response = NextResponse.json({
            success: true,
            institution: {
                did: institution.did,
                name: institution.name,
                code: institution.code
            }
        });

        response.headers.set('Set-Cookie', createSessionCookie(sessionToken));

        return response;

    } catch (error) {
        console.error('Institution auth error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
