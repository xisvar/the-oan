"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function InstitutionDashboard() {
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Rule Form State
    const [program, setProgram] = useState('Computer Science');
    const [cutoff, setCutoff] = useState('200');
    const [quota, setQuota] = useState('10');
    const [subject, setSubject] = useState('Math');
    const [minGrade, setMinGrade] = useState('C6');

    // Matching State
    const [matchProgram, setMatchProgram] = useState('Computer Science');
    const [matchResult, setMatchResult] = useState<any>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/session');
            const data = await res.json();

            if (!data.success) {
                router.push('/institution/login');
                return;
            }

            setSession(data.session);
        } catch (error) {
            console.error('Auth check failed:', error);
            router.push('/institution/login');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
    };

    const defineRule = async () => {
        if (!session) return;
        setLoading(true);
        try {
            const rule = {
                institutionDid: session.userId,
                program,
                requirements: {
                    minScore: parseInt(cutoff),
                    requiredSubjects: [{ subject, minGrade }]
                },
                enforcement: {
                    quotaType: 'HARD_CAP',
                    finalQuota: parseInt(quota),
                    finalCutoff: parseInt(cutoff),
                    requiredSubjects: [{ subject, minGrade }]
                },
                derivation: {
                    cutoffParams: { baseCutoff: parseInt(cutoff), capacityScore: 1, rigorScore: 1, tierScore: 1, distributionStats: { mean: 200, median: 200, percentile75: 200, percentile90: 200 } },
                    quotaParams: { constraints: { physicalCapacity: parseInt(quota), accreditationLimit: parseInt(quota), budgetLimit: parseInt(quota) }, yieldRate: 1, strategyMultiplier: 1 }
                }
            };

            const res = await fetch('/api/institution/rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rule)
            });
            const data = await res.json();
            if (data.success) {
                alert('Rule Defined Successfully!');
            } else {
                alert('Error: ' + data.error);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to define rule');
        } finally {
            setLoading(false);
        }
    };

    const runMatching = async () => {
        if (!session) return;
        setLoading(true);
        try {
            const res = await fetch('/api/institution/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    institutionDid: session.userId,
                    program: matchProgram
                })
            });
            const data = await res.json();
            if (data.success) {
                setMatchResult(data);
                alert('Matching Complete!');
            } else {
                alert('Error: ' + data.error);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to run matching');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Institution Dashboard</h1>
                    {session && <p className="text-muted-foreground mt-1">{session.name}</p>}
                </div>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>

            <Tabs defaultValue="rules">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="rules">Define Rules</TabsTrigger>
                    <TabsTrigger value="matching">Run Matching</TabsTrigger>
                </TabsList>

                <TabsContent value="rules">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Admission Rule</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Program Name</Label>
                                <Input value={program} onChange={(e) => setProgram(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Cutoff Score</Label>
                                    <Input type="number" value={cutoff} onChange={(e) => setCutoff(e.target.value)} />
                                </div>
                                <div>
                                    <Label>Quota (Seats)</Label>
                                    <Input type="number" value={quota} onChange={(e) => setQuota(e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Required Subject</Label>
                                    <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
                                </div>
                                <div>
                                    <Label>Min Grade</Label>
                                    <Input value={minGrade} onChange={(e) => setMinGrade(e.target.value)} />
                                </div>
                            </div>
                            <Button onClick={defineRule} disabled={loading} className="w-full">
                                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                Publish Rule to Ledger
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="matching">
                    <Card>
                        <CardHeader>
                            <CardTitle>Execute Matching Round</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Target Program</Label>
                                <Input value={matchProgram} onChange={(e) => setMatchProgram(e.target.value)} />
                            </div>
                            <Button onClick={runMatching} disabled={loading} className="w-full">
                                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                Run Matching Algorithm
                            </Button>

                            {matchResult && (
                                <div className="mt-6">
                                    <h3 className="font-bold mb-2">Results</h3>
                                    <div className="bg-slate-100 p-4 rounded-md">
                                        <h4 className="font-semibold text-green-600">Admitted ({matchResult.admitted.length})</h4>
                                        <ul className="list-disc pl-5 mb-4">
                                            {matchResult.admitted.map((a: any, i: number) => (
                                                <li key={i}>{a.applicantId} (MI: {a.mi})</li>
                                            ))}
                                        </ul>
                                        <h4 className="font-semibold text-yellow-600">Waitlisted ({matchResult.waitlisted.length})</h4>
                                        <ul className="list-disc pl-5">
                                            {matchResult.waitlisted.map((w: any, i: number) => (
                                                <li key={i}>{w.applicantId} (MI: {w.mi})</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
