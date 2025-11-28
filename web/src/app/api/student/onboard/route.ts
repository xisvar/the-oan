import { NextResponse } from 'next/server';
import { ledger } from '@/lib/ledger';
import { ApplicantEventType, UtmeResultAddedPayload, ExamResultAddedPayload } from '@/lib/events';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { did, profile, utme, waec } = body;

        if (!did || !profile || !utme || !waec) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Update Profile (Name, State, etc)
        await ledger.appendEvent(
            'APPLICANT_CREATED',
            JSON.stringify({
                did,
                name: profile.name,
                email: `${did}@example.com` // Mock email
            }),
            did,
            did // signer
        );

        // 2. Add UTME Result
        const utmePayload: UtmeResultAddedPayload = {
            jambScore: utme.jambScore,
            subjectCombo: utme.subjectCombo,
            postUtmeScore: utme.postUtmeScore
        };
        await ledger.appendEvent(
            'UTME_RESULT_ADDED',
            JSON.stringify(utmePayload),
            did,
            did
        );

        // 3. Add WAEC Results
        for (const subject of waec) {
            const waecPayload: ExamResultAddedPayload = {
                credentialId: crypto.randomUUID(),
                subject: subject.subject,
                score: 0, // Not used for WAEC in this model, we use grade
                grade: subject.grade,
                issuer: 'did:oan:issuer:waec'
            };
            await ledger.appendEvent(
                'EXAM_RESULT_ADDED',
                JSON.stringify(waecPayload),
                did,
                did
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error in onboarding:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
