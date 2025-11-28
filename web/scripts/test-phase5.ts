import { ledger } from '../src/lib/ledger';
import { eligibilityService } from '../src/lib/eligibility';
import { keyStore } from '../src/lib/keystore';
import { AdmissionRule } from '../src/lib/rules';

async function run() {
    try {
        console.log('--- Starting Phase 5 Test: Eligibility Engine ---');

        const institutionDid = 'did:oan:institution:unilag';
        const student1Did = 'did:oan:student:p5-s1'; // High Score
        const student2Did = 'did:oan:student:p5-s2'; // Low Score

        // Ensure keys
        keyStore.getOrCreateKey(institutionDid);
        keyStore.getOrCreateKey(student1Did);
        keyStore.getOrCreateKey(student2Did);

        // 1. Setup Rules
        console.log('\n1. Defining Rules...');
        const csRule: AdmissionRule = {
            institutionDid,
            program: 'Computer Science',
            timestamp: new Date().toISOString(),
            enforcement: { finalCutoff: 200, finalQuota: 50, requiredSubjects: [{ subject: 'Math', minGrade: 'C6' }] },
            derivation: { cutoffParams: { baseCutoff: 180, capacityScore: 1, rigorScore: 1, tierScore: 1, distributionStats: { mean: 150, median: 150, percentile75: 180, percentile90: 200 } }, quotaParams: { constraints: { physicalCapacity: 50, accreditationLimit: 50, budgetLimit: 50 }, yieldRate: 1, strategyMultiplier: 1 } }
        };
        await ledger.appendEvent('RULE_DEFINED', csRule, institutionDid, institutionDid);

        const historyRule: AdmissionRule = {
            institutionDid,
            program: 'History',
            timestamp: new Date().toISOString(),
            enforcement: { finalCutoff: 150, finalQuota: 50, requiredSubjects: [{ subject: 'English', minGrade: 'C6' }] },
            derivation: { cutoffParams: { baseCutoff: 130, capacityScore: 1, rigorScore: 1, tierScore: 1, distributionStats: { mean: 120, median: 120, percentile75: 140, percentile90: 160 } }, quotaParams: { constraints: { physicalCapacity: 50, accreditationLimit: 50, budgetLimit: 50 }, yieldRate: 1, strategyMultiplier: 1 } }
        };
        await ledger.appendEvent('RULE_DEFINED', historyRule, institutionDid, institutionDid);


        // 2. Setup Students
        console.log('\n2. Setting up Students...');

        // Student 1: Math + English, High Score (220) -> Eligible for both
        await ledger.appendEvent('APPLICANT_CREATED', { did: student1Did, name: 'High Scorer', email: 's1@test.com' }, student1Did, student1Did);
        await ledger.appendEvent('EXAM_RESULT_ADDED', { credentialId: 'c1', subject: 'Math', score: 120, grade: 'A1', issuer: 'waec' }, student1Did, student1Did);
        await ledger.appendEvent('EXAM_RESULT_ADDED', { credentialId: 'c2', subject: 'English', score: 100, grade: 'A1', issuer: 'waec' }, student1Did, student1Did);

        // Student 2: English only, Low Score (160) -> Eligible for History only
        await ledger.appendEvent('APPLICANT_CREATED', { did: student2Did, name: 'Low Scorer', email: 's2@test.com' }, student2Did, student2Did);
        await ledger.appendEvent('EXAM_RESULT_ADDED', { credentialId: 'c3', subject: 'English', score: 160, grade: 'B2', issuer: 'waec' }, student2Did, student2Did);


        // 3. Test Student Eligibility (Find Programs)
        console.log('\n3. Testing Student Eligibility...');
        const s1Programs = await eligibilityService.findEligiblePrograms(student1Did);
        console.log(`Student 1 Eligible for: ${s1Programs.map(p => p.rule.program).join(', ')}`);

        const s2Programs = await eligibilityService.findEligiblePrograms(student2Did);
        console.log(`Student 2 Eligible for: ${s2Programs.map(p => p.rule.program).join(', ')}`);

        if (s1Programs.length === 2 && s2Programs.length === 1 && s2Programs[0].rule.program === 'History') {
            console.log('✅ Student Eligibility: SUCCESS');
        } else {
            console.error('❌ Student Eligibility: FAILED');
        }


        // 4. Test Institution Eligibility (Find Applicants)
        console.log('\n4. Testing Institution Eligibility...');
        const csApplicants = await eligibilityService.findEligibleApplicants(institutionDid, 'Computer Science');
        console.log(`CS Applicants: ${csApplicants.map(a => a.profile.name).join(', ')}`);

        if (csApplicants.length === 1 && csApplicants[0].profile.name === 'High Scorer') {
            console.log('✅ Institution Eligibility: SUCCESS');
        } else {
            console.error('❌ Institution Eligibility: FAILED');
        }

        console.log('\n--- End Phase 5 Test ---');

    } catch (error) {
        console.error('CRITICAL ERROR:', error);
    }
}

run();
