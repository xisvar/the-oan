import { classifyStream } from '../src/lib/classifier';
import { meritEngine } from '../src/lib/merit';
import { matchingService } from '../src/lib/matching';
import { ledger } from '../src/lib/ledger';
import { stateEngine } from '../src/lib/state';
import { AdmissionRule } from '../src/lib/rules';

async function testPhase10() {
    console.log('--- Starting Phase 10 Verification ---');

    // 1. Test Stream Classifier
    console.log('\n1. Testing Stream Classifier...');
    const scienceSubjects = [
        { subject: 'Mathematics', grade: 'A1' },
        { subject: 'English', grade: 'B2' },
        { subject: 'Physics', grade: 'B3' },
        { subject: 'Chemistry', grade: 'C4' },
        { subject: 'Biology', grade: 'A1' }
    ];
    const stream = classifyStream(scienceSubjects);
    console.log('Classified Stream:', stream);
    if (stream.stream !== 'SCIENCE') throw new Error('Classification Failed');

    // 2. Test Advanced Merit Engine
    console.log('\n2. Testing Advanced Merit Engine...');
    // JAMB: 280/400 = 70% -> *0.6 = 42
    // WAEC: A1(8), B2(7), B3(6), C4(5), A1(8) -> Avg 6.8 -> (6.8/8)*100 = 85% -> *0.3 = 25.5
    // PostUTME: 60/100 -> *0.1 = 6
    // Total: 42 + 25.5 + 6 = 73.5
    const waecGrades = scienceSubjects.map(s => s.grade);
    const mi = meritEngine.computeAdvancedMeritIndex(280, waecGrades, 60);
    console.log('Computed Merit Index:', mi);
    if (Math.abs(mi - 73.5) > 0.1) throw new Error(`Merit Calc Failed. Expected ~73.5, got ${mi}`);

    // 4. Test Matching with Quotas
    console.log('\n4. Testing Quota Matching...');
    const instDid = `did:oan:institution:p10-uni`;
    const program = 'Computer Science';

    // Define Rule
    const rule: AdmissionRule = {
        id: 'rule-1',
        institutionDid: instDid,
        program,
        requirements: { minAge: 16 },
        enforcement: {
            finalCutoff: 50,
            finalQuota: 10, // 7 Merit, 2 Catchment, 1 ELDS
            requiredSubjects: []
        },
        version: 1,
        createdAt: new Date().toISOString()
    };
    await ledger.appendEvent('RULE_DEFINED', rule, instDid, instDid);

    // Apply
    await ledger.appendEvent('APPLICATION_SUBMITTED', {
        program,
        institutionDid: instDid
    }, did, did);

    // Run Matching
    // We need to ensure eligibility passes. 
    // Eligibility service checks rules. Our rule has no subjects, so should pass.
    // But we need to make sure 'eligibilityService' sees the rule.
    // It fetches from ledger.

    const result = await matchingService.runMatchingRound(instDid, program);
    console.log('Match Result:', result.admitted.length > 0 ? 'Admitted' : 'Rejected');

    const admitted = result.admitted.find(a => a.applicantId === did);
    if (!admitted) throw new Error('Student not admitted');
    console.log('Allocation Bucket:', admitted.bucketId);

    console.log('\n--- Phase 10 Verification Successful ---');
}

testPhase10().catch(e => {
    console.error(e);
    process.exit(1);
});
