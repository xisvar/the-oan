import { NextRequest, NextResponse } from 'next/server';
import { createSession, createSessionCookie } from '@/lib/session';

interface StudentRecord {
    email: string;
    dob: string;
    jamb_reg: string;
    name: string;
    did: string;
    jamb_score: string;
    state: string;
}

export async function POST(request: NextRequest) {
    try {
        const { email, dob, jambReg } = await request.json();

        if (!email || !dob || !jambReg) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Hardcoded test students
        const students: StudentRecord[] = [
            {
                email: 'student1@example.com',
                dob: '2005-03-15',
                jamb_reg: '2026/1234567',
                name: 'Ada Okonkwo',
                did: 'did:oan:student:s001',
                jamb_score: '285',
                state: 'Lagos'
            },
            {
                email: 'student2@example.com',
                dob: '2004-07-22',
                jamb_reg: '2026/2345678',
                name: 'Chidi Nwankwo',
                did: 'did:oan:student:s002',
                jamb_score: '310',
                state: 'Anambra'
            }
        ];

        console.log('Login attempt:', { email, dob, jambReg });

        // Find matching student
        const student = students.find(
            s => s.email.toLowerCase() === email.toLowerCase() &&
                s.dob === dob &&
                s.jamb_reg === jambReg
        );

        if (!student) {
            console.log('No match. Expected:', students[0]);
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        console.log('Match found:', student.name);

        // Create session
        const sessionToken = await createSession({
            userId: student.did,
            userType: 'student',
            name: student.name,
            email: student.email,
            jambScore: parseInt(student.jamb_score),
            state: student.state
        });

        // Set cookie
        const response = NextResponse.json({
            success: true,
            student: {
                did: student.did,
                name: student.name,
                email: student.email
            }
        });

        response.headers.set('Set-Cookie', createSessionCookie(sessionToken));

        return response;

    } catch (error) {
        console.error('Student auth error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
