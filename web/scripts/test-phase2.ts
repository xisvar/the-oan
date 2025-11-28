import { ledger } from '../src/lib/ledger';
import { keyStore } from '../src/lib/keystore';

async function run() {
    try {
        console.log('--- Starting Phase 2 Test: Ledger ---');

        const actor = 'did:oan:institution:test';
        // Ensure actor has keys
        keyStore.getOrCreateKey(actor);

        // 1. Append Event 1
        console.log('\n1. Appending Event 1...');
        const event1 = await ledger.appendEvent('TEST_EVENT', { msg: 'Hello 1' }, actor, actor);
        console.log('Event 1 Hash:', event1.hash);
        console.log('Event 1 PrevHash:', event1.prevHash);

        // 2. Append Event 2
        console.log('\n2. Appending Event 2...');
        const event2 = await ledger.appendEvent('TEST_EVENT', { msg: 'Hello 2' }, actor, actor);
        console.log('Event 2 Hash:', event2.hash);
        console.log('Event 2 PrevHash:', event2.prevHash);

        // 3. Verify Chain Integrity
        console.log('\n3. Verifying Chain Integrity...');
        if (event2.prevHash === event1.hash) {
            console.log('✅ Chain Link: SUCCESS (Event 2 links to Event 1)');
        } else {
            console.error('❌ Chain Link: FAILED');
        }

        const verification = await ledger.verifyChain();
        if (verification.isValid) {
            console.log('✅ Full Chain Verification: SUCCESS');
        } else {
            console.error('❌ Full Chain Verification: FAILED', verification.error);
        }

        console.log('\n--- End Phase 2 Test ---');
    } catch (error) {
        console.error('CRITICAL ERROR:', error);
    }
}

run();
