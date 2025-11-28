import { ledger } from '../src/lib/ledger';
import { matchingService } from '../src/lib/matching';
import { keyStore } from '../src/lib/keystore';
import { AdmissionRule } from '../src/lib/rules';

async function run() {
    try {
        console.log('--- Starting Phase 6 Test: Rigorous Matching ---');

        const institutionDid = 'did:oan:institution:unilag';
        const s1 = 'did:oan:student:p6-s1'; // Score 200
        const s2 = 'did:oan:student:p6-s2'; // Score 180
        const s3 = 'did:oan:student:p6-s3'; // Score 220 (Highest)

        // Ensure keys
        keyStore.getOrCreateKey(institutionDid);
        keyStore.getOrCreateKey(s1);
        keyStore.getOrCreateKey(s2);
        keyStore.getOrCreateKey(s3);

        // 1. Define Rule (Quota = 2)
        console.log('\n1. Defining Rule (Quota = 2)...');
        const rule: AdmissionRule = {
            institutionDid,
            program: 'Software Engineering Rigorous',
            timestamp: new Date().toISOString(),
            enforcement: { finalCutoff: 150, finalQuota: 2, requiredSubjects: [{ subject: 'RigorousMath', minGrade: 'C6' }] },
            derivation: { cutoffParams: { baseCutoff: 150, capacityScore: 1, rigorScore: 1, tierScore: 1, distributionStats: { mean: 150, median: 150, percentile75: 180, percentile90: 200 } }, quotaParams: { constraints: { physicalCapacity: 2, accreditationLimit: 2, budgetLimit: 2 }, yieldRate: 1, strategyMultiplier: 1 } }
        };
        await ledger.appendEvent('RULE_DEFINED', rule, institutionDid, institutionDid);

        // 2. Setup Students
        console.log('\n2. Setting up Students...');

        // S1: 200
        await ledger.appendEvent('APPLICANT_CREATED', { did: s1, name: 'Student 1', email: 's1@test.com' }, s1, s1);
        await ledger.appendEvent('EXAM_RESULT_ADDED', { credentialId: 'c1-rigorous', subject: 'RigorousMath', score: 200, grade: 'A1', issuer: 'waec' }, s1, s1);

        // S2: 180
        await ledger.appendEvent('APPLICANT_CREATED', { did: s2, name: 'Student 2', email: 's2@test.com' }, s2, s2);
        await ledger.appendEvent('EXAM_RESULT_ADDED', { credentialId: 'c2-rigorous', subject: 'RigorousMath', score: 180, grade: 'A1', issuer: 'waec' }, s2, s2);

        // S3: 220
        await ledger.appendEvent('APPLICANT_CREATED', { did: s3, name: 'Student 3', email: 's3@test.com' }, s3, s3);
        await ledger.appendEvent('EXAM_RESULT_ADDED', { credentialId: 'c3-rigorous', subject: 'RigorousMath', score: 220, grade: 'A1', issuer: 'waec' }, s3, s3);


        // 3. Run Matching
        console.log('\n3. Running Matching...');
        const result = await matchingService.runMatchingRound(institutionDid, 'Software Engineering Rigorous');

        console.log('Admitted:', result.admitted.map(a => `${a.applicantId} (MI: ${a.mi})`).join(', '));
        console.log('Waitlisted:', result.waitlisted.map(w => `${w.applicantId} (MI: ${w.mi})`).join(', '));

        // Expect: S3 (Highest MI), S1 (Next MI) -> Admitted. S2 -> Waitlisted.
        if (result.admitted.length === 2 && result.waitlisted.length === 1) {
            // Check Order (S3 > S1)
            if (result.admitted[0].applicantId === s3 && result.admitted[1].applicantId === s1) {
                console.log('✅ Merit Sorting: SUCCESS');
            } else {
                console.error('❌ Merit Sorting: FAILED (Wrong Order)');
            }

            if (result.waitlisted[0].applicantId === s2) {
                console.log('✅ Quota Enforcement: SUCCESS');
            } else {
                console.error('❌ Quota Enforcement: FAILED');
            }

        } else {
            console.error('❌ Matching Logic: FAILED (Wrong Counts)');
        }

        console.log('\n--- End Phase 6 Test ---');

    } catch (error) {
        console.error('CRITICAL ERROR:', error);
    }
}

run();
