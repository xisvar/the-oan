import { ledger } from '../src/lib/ledger';
import { stateEngine } from '../src/lib/state';
import { rulesEngine } from '../src/lib/rules-engine';
import { keyStore } from '../src/lib/keystore';
import { AdmissionRule } from '../src/lib/rules';

async function run() {
    try {
        console.log('--- Starting Phase 4 Test: Rules Engine ---');

        const institutionDid = 'did:oan:institution:unilag';
        const studentDid = 'did:oan:student:phase4-test';

        // Ensure keys exist
        keyStore.getOrCreateKey(institutionDid);
        keyStore.getOrCreateKey(studentDid);

        // 1. Setup Applicant (Reusing Phase 3 logic)
        console.log('\n1. Setting up Applicant...');
        await ledger.appendEvent('APPLICANT_CREATED', {
            did: studentDid,
            name: 'Phase 4 Student',
            email: 'p4@test.com'
        }, studentDid, studentDid);

        await ledger.appendEvent('EXAM_RESULT_ADDED', {
            credentialId: 'cred-math',
            subject: 'Mathematics',
            score: 75,
            grade: 'B2',
            issuer: 'did:oan:institution:waec'
        }, studentDid, studentDid);

        await ledger.appendEvent('EXAM_RESULT_ADDED', {
            credentialId: 'cred-eng',
            subject: 'English',
            score: 68,
            grade: 'C4',
            issuer: 'did:oan:institution:waec'
        }, studentDid, studentDid);

        const profile = await stateEngine.computeApplicantState(studentDid);
        console.log('Applicant Profile Score:', profile?.examResults.reduce((a, b) => a + b.score, 0));

        // 2. Define Admission Rule
        console.log('\n2. Defining Admission Rule (Computer Science)...');
        const rule: AdmissionRule = {
            institutionDid,
            program: 'Computer Science',
            timestamp: new Date().toISOString(),
            enforcement: {
                finalCutoff: 140, // 75 + 68 = 143. Should pass.
                finalQuota: 100,
                requiredSubjects: [
                    { subject: 'Mathematics', minGrade: 'C6', minScore: 50 }
                ]
            },
            derivation: {
                cutoffParams: {
                    capacityScore: 85,
                    rigorScore: 1.2,
                    distributionStats: { mean: 130, median: 135, percentile75: 150, percentile90: 165 },
                    tierScore: 1.1,
                    baseCutoff: 130
                },
                quotaParams: {
                    constraints: { physicalCapacity: 120, accreditationLimit: 100, budgetLimit: 150 },
                    yieldRate: 0.8,
                    strategyMultiplier: 1.0
                }
            }
        };

        // Publish to ledger
        await ledger.appendEvent('RULE_DEFINED', rule, institutionDid, institutionDid);
        console.log('Rule Published to Ledger.');

        // 3. Evaluate Applicant
        console.log('\n3. Evaluating Applicant...');
        if (!profile) throw new Error('Profile not found');

        const result = rulesEngine.evaluateApplicant(profile, rule);
        console.log('Evaluation Result:', result);

        if (result.eligible && result.score === 143) {
            console.log('✅ Evaluation: SUCCESS (Eligible)');
        } else {
            console.error('❌ Evaluation: FAILED');
        }

        // 4. Test Failure Case (Higher Cutoff)
        console.log('\n4. Testing Failure Case (Cutoff 150)...');
        const strictRule = { ...rule };
        strictRule.enforcement.finalCutoff = 150;

        const strictResult = rulesEngine.evaluateApplicant(profile, strictRule);
        console.log('Strict Evaluation Result:', strictResult);

        if (!strictResult.eligible && strictResult.reasons[0].includes('below cutoff')) {
            console.log('✅ Strict Evaluation: SUCCESS (Correctly Rejected)');
        } else {
            console.error('❌ Strict Evaluation: FAILED');
        }

        console.log('\n--- End Phase 4 Test ---');

    } catch (error) {
        console.error('CRITICAL ERROR:', error);
    }
}

run();
