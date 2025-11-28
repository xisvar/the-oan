import { NextResponse } from 'next/server';
import { ledger } from '@/lib/ledger';
import { stateEngine } from '@/lib/state';
import { keyStore } from '@/lib/keystore';

// POST /api/applicant/event - Append a new event to the applicant's log
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, payload, actorDid } = body;

        if (!type || !payload || !actorDid) {
            return NextResponse.json({ error: 'Missing type, payload, or actorDid' }, { status: 400 });
        }

        // Ensure actor has keys (in a real app, the request would be signed by the actor)
        // Here we simulate the actor signing it
        keyStore.getOrCreateKey(actorDid);

        const event = await ledger.appendEvent(type, payload, actorDid, actorDid);

        return NextResponse.json({ success: true, event });
    } catch (error) {
        console.error('Error appending event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// GET /api/applicant/[did] - Get the computed state of an applicant
// Note: Next.js App Router dynamic routes are handled via folder structure [did]/route.ts
// This file is likely /api/applicant/event/route.ts or similar based on the POST above.
// To handle GET /api/applicant/[did], we need a separate file.
// So this file will just be /api/applicant/event/route.ts
