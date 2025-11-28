import { ledger } from '../src/lib/ledger';
import { keyStore } from '../src/lib/keystore';
import { matchingService } from '../src/lib/matching';
import { stateEngine } from '../src/lib/state';

async function run() {
    try {
        console.log('--- Starting Phase 8 Test: End-to-End Pipeline ---');

        const institutionDid = 'did:oan:institution:p8-uni';
        const studentDid = 'did:oan:student:p8-s1';
        const program = 'Computer Science';

        // Ensure keys
        keyStore.getOrCreateKey(institutionDid);
        keyStore.getOrCreateKey(studentDid);

        // 1. Setup: Create Student, Exam, and Rule
        console.log('\n1. Setup...');
        await ledger.appendEvent('APPLICANT_CREATED', { did: studentDid, name: 'P8 Student', email: 'p8@test.com' }, studentDid, studentDid);
        await ledger.appendEvent('EXAM_RESULT_ADDED', { credentialId: 'c-p8-1', subject: 'Math', score: 300, grade: 'A1', issuer: 'waec' }, studentDid, studentDid);

        await ledger.appendEvent('RULE_DEFINED', {
            id: 'rule-p8',
            institutionDid,
            program,
            enforcement: {
                finalCutoff: 200,
                finalQuota: 10,
                requiredSubjects: [{ subject: 'Math', minGrade: 'C6' }]
            },
            derivation: {
                cutoffParams: { baseCutoff: 200, capacityScore: 1, rigorScore: 1, tierScore: 1, distributionStats: { mean: 200, median: 200, percentile75: 200, percentile90: 200 } },
                quotaParams: { constraints: { physicalCapacity: 10, accreditationLimit: 10, budgetLimit: 10 }, yieldRate: 1, strategyMultiplier: 1 }
            }
        }, institutionDid, institutionDid);

        // 2. Verify Eligibility but NO Match (Before Applying)
        console.log('\n2. Verify No Match Before Application...');
        const result1 = await matchingService.runMatchingRound(institutionDid, program);
        if (result1.admitted.length === 0) {
            console.log('✅ Correctly skipped student who has not applied.');
        } else {
            console.error('❌ FAILED: Matched student who has not applied!');
        }

        // 3. Submit Application
        console.log('\n3. Submitting Application...');
        await ledger.appendEvent('APPLICATION_SUBMITTED', {
            program,
            institutionDid
        }, studentDid, studentDid);

        // 4. Verify Match (After Applying)
        console.log('\n4. Verify Match After Application...');
        const result2 = await matchingService.runMatchingRound(institutionDid, program);
        if (result2.admitted.find(a => a.applicantId === studentDid)) {
            console.log('✅ Successfully matched applied student.');
        } else {
            console.error('❌ FAILED: Did not match applied student.');
        }

        // 5. Verify Regulator Stats (Simulate)
        console.log('\n5. Verifying Regulator Stats...');
        const events = await ledger.getLedger();
        const appCount = events.filter(e => e.type === 'APPLICATION_SUBMITTED').length;
        if (appCount >= 1) {
            console.log(`✅ Regulator Stats: Found ${appCount} applications.`);
        } else {
            console.error('❌ Regulator Stats: Application count incorrect.');
        }

        console.log('\n--- End Phase 8 Test ---');

    } catch (error) {
        console.error('CRITICAL ERROR:', error);
    }
}

run();
