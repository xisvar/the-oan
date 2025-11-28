import { ApplicantScore, QuotaRule, Allocation, QuotaBucket } from './merit-types';

export class QuotaEngine {

    /**
     * Allocates seats based on Quota Rules and Merit Index.
     */
    allocateSeats(
        rankedList: ApplicantScore[], // Sorted by MI DESC, then Timestamp ASC
        quotaRule: QuotaRule
    ): { allocations: Allocation[], waitlist: ApplicantScore[] } {

        const allocations: Allocation[] = [];
        const bucketCounts = new Map<string, number>();
        const allocatedApplicantIds = new Set<string>();
        const totalSeats = quotaRule.seats;

        // Initialize bucket counts
        quotaRule.quotaBuckets.forEach(b => bucketCounts.set(b.bucketId, 0));

        // Helper to allocate
        const allocate = (candidate: ApplicantScore, bucketId: string, reason: string) => {
            allocations.push({
                id: crypto.randomUUID(),
                programId: quotaRule.programId,
                applicantId: candidate.applicantId,
                bucketId,
                mi: candidate.mi,
                rankInBucket: (bucketCounts.get(bucketId) || 0) + 1,
                allocatedAt: new Date().toISOString(),
                evidence: {
                    mi: candidate.mi,
                    reason,
                    quotaRuleVersion: quotaRule.version
                }
            });
            bucketCounts.set(bucketId, (bucketCounts.get(bucketId) || 0) + 1);
            allocatedApplicantIds.add(candidate.applicantId);
        };

        // 1. Primary Fill Loop
        // Sort buckets by priority
        const sortedBuckets = [...quotaRule.quotaBuckets].sort((a, b) => (b.priority || 0) - (a.priority || 0));

        for (const bucket of sortedBuckets) {
            for (const candidate of rankedList) {
                if (allocatedApplicantIds.has(candidate.applicantId)) continue;

                const currentCount = bucketCounts.get(bucket.bucketId) || 0;
                if (currentCount >= bucket.count) break; // Bucket full

                // Check if candidate satisfies bucket criteria
                if (this.satisfiesCriteria(candidate, bucket)) {
                    allocate(candidate, bucket.bucketId, 'allocated_by_priority');
                }
            }
        }

        // 2. Fill Remaining Seats (Merit / Overflow)
        // If sum(bucketCounts) < totalSeats, fill from rankedList ignoring bucket constraints (usually into MERIT or generic bucket)
        let currentTotal = Array.from(bucketCounts.values()).reduce((a, b) => a + b, 0);
        let remaining = totalSeats - currentTotal;

        // Find the "General" or "Merit" bucket to dump overflow into, or just pick the first one
        const overflowBucketId = quotaRule.quotaBuckets.find(b => b.type === 'MERIT')?.bucketId || quotaRule.quotaBuckets[0].bucketId;

        if (remaining > 0) {
            for (const candidate of rankedList) {
                if (remaining === 0) break;
                if (allocatedApplicantIds.has(candidate.applicantId)) continue;

                allocate(candidate, overflowBucketId, 'allocated_merit_overflow');
                remaining--;
            }
        }

        // 3. Enforce Minima (Diversity Quotas)
        // For each bucket with minRequired > 0
        for (const bucket of quotaRule.quotaBuckets) {
            if (bucket.minRequired && bucket.minRequired > 0) {
                const current = bucketCounts.get(bucket.bucketId) || 0;
                let deficit = bucket.minRequired - current;

                if (deficit > 0) {
                    // Find top 'deficit' candidates who belong to this group but are NOT allocated
                    const protectedCandidates = rankedList.filter(c =>
                        !allocatedApplicantIds.has(c.applicantId) && this.satisfiesCriteria(c, bucket)
                    );

                    // Try to replace
                    // We need to find the "lowest MI non-protected admits" to kick out.
                    // "Non-protected" means they are in a bucket that isn't this one (or maybe specifically MERIT).
                    // For simplicity, we look for the lowest MI allocation overall that isn't in a protected bucket.

                    // Sort current allocations by MI ASC (lowest first)
                    const sortedAllocations = [...allocations].sort((a, b) => a.mi - b.mi);

                    let replacedCount = 0;
                    for (const pCandidate of protectedCandidates) {
                        if (replacedCount >= deficit) break;

                        // Find a victim
                        const victimIndex = sortedAllocations.findIndex(a =>
                            a.mi < pCandidate.mi && // Only replace if the protected candidate has higher MI? 
                            // Wait, user said: "replace lowest MI non-protected admits with the highest MI protected applicants"
                            // Usually diversity quotas imply admitting someone with LOWER MI to satisfy the quota.
                            // But user text says: "replace the lowest MI non-protected admits with the highest MI protected applicants until deficit resolved"
                            // It doesn't explicitly say "only if pCandidate.mi > victim.mi". 
                            // However, usually you don't replace a 200 MI student with a 100 MI student unless it's a hard quota.
                            // User logic: "if lowestAdmit.mi < c.mi: unallocate... else: log deficit".
                            // This implies we ONLY replace if the protected candidate actually has a HIGHER score? 
                            // No, "lowestAdmit.mi < c.mi" means the victim has a LOWER score than the protected candidate.
                            // So we are just fixing the fact that the protected candidate was skipped?
                            // If the protected candidate had a higher score, they should have been admitted in Step 2 (Merit Overflow) if they were eligible?
                            // Ah, maybe they weren't eligible for the specific buckets in Step 1, and Step 2 filled up with others?
                            // Let's follow the user's pseudocode exactly: "if lowestAdmit.mi < c.mi".

                            // We need to check if the victim is "non-protected". 
                            // Let's assume "MERIT" type buckets are non-protected.
                            this.isNonProtected(a.bucketId, quotaRule)
                        );

                        if (victimIndex !== -1) {
                            const victim = sortedAllocations[victimIndex];
                            if (victim.mi < pCandidate.mi) {
                                // Swap
                                // Remove victim from allocations
                                const realIndex = allocations.findIndex(a => a.id === victim.id);
                                allocations.splice(realIndex, 1);
                                allocatedApplicantIds.delete(victim.applicantId);
                                bucketCounts.set(victim.bucketId, (bucketCounts.get(victim.bucketId) || 0) - 1);

                                // Add protected
                                allocate(pCandidate, bucket.bucketId, 'allocated_diversity_replacement');

                                // Update sorted list (inefficient but safe)
                                // actually we just continue, the loop will re-evaluate or we just take the next one.
                                replacedCount++;
                            }
                        }
                    }
                }
            }
        }

        // Build Waitlist
        const waitlist = rankedList.filter(c => !allocatedApplicantIds.has(c.applicantId));

        return { allocations, waitlist };
    }

    private satisfiesCriteria(candidate: ApplicantScore, bucket: QuotaBucket): boolean {
        if (bucket.type === 'MERIT') return true; // Everyone eligible for merit
        if (bucket.type === 'RESERVED' && candidate.priorityFlags.catchment) return true;
        if (bucket.type === 'DIVERSITY' && candidate.priorityFlags.elds) return true;
        if (bucket.type === 'SPECIAL' && candidate.priorityFlags.disability) return true;
        // Add more logic as needed
        return false;
    }

    private isNonProtected(bucketId: string, rule: QuotaRule): boolean {
        const bucket = rule.quotaBuckets.find(b => b.bucketId === bucketId);
        return bucket?.type === 'MERIT';
    }
}

export const quotaEngine = new QuotaEngine();
