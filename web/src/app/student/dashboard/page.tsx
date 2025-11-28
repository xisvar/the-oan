"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CredentialCard } from "@/components/CredentialCard";
import { ApplicationStatusCard } from "@/components/ApplicationStatusCard";
import { Loader2 } from "lucide-react";
import { StudentOnboarding } from "@/components/StudentOnboarding";

export default function StudentDashboard() {
    const router = useRouter();
    const [session, setSession] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [eligiblePrograms, setEligiblePrograms] = useState<any[]>([]);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/session');
            const data = await res.json();

            if (!data.success) {
                router.push('/student/login');
                return;
            }

            setSession(data.session);
            await fetchProfile(data.session.userId);
        } catch (error) {
            console.error('Auth check failed:', error);
            router.push('/student/login');
        }
    };

    const fetchProfile = async (did: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/student/profile?did=${did}`);
            const data = await res.json();

            if (data.success) {
                setProfile(data.profile);

                if (!data.profile.utmeResult) {
                    setShowOnboarding(true);
                    setLoading(false);
                    return;
                }
                setShowOnboarding(false);

                const eligRes = await fetch(`/api/student/eligible-programs?did=${did}`);
                const eligData = await eligRes.json();
                if (eligData.success) {
                    setEligiblePrograms(eligData.programs);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
    };

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
        if (session) fetchProfile(session.userId);
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
                    <h1 className="text-3xl font-bold">Student Dashboard</h1>
                    {session && <p className="text-muted-foreground mt-1">Welcome, {session.name}</p>}
                </div>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>

            {showOnboarding && session && (
                <StudentOnboarding did={session.userId} onComplete={handleOnboardingComplete} />
            )}

            {!showOnboarding && profile && (
                <Tabs defaultValue="credentials">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="credentials">My Credentials</TabsTrigger>
                        <TabsTrigger value="applications">Applications</TabsTrigger>
                    </TabsList>

                    <TabsContent value="credentials">
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">My Credentials</h3>
                            </div>

                            <div className="grid gap-4">
                                {/* UTME Card */}
                                {profile.utmeResult && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>UTME Result</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p><strong>JAMB Score:</strong> {profile.utmeResult.jambScore}</p>
                                            <p><strong>Date:</strong> {new Date(profile.utmeResult.dateAdded).toLocaleDateString()}</p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* WAEC Results */}
                                {profile.examResults.length === 0 ? (
                                    <p className="text-muted-foreground">No other credentials found.</p>
                                ) : (
                                    profile.examResults.map((cred: any, i: number) => (
                                        <CredentialCard key={i} credential={cred} />
                                    ))
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="applications">
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-4">Eligible Programs</h3>
                            {eligiblePrograms.length === 0 ? (
                                <p className="text-muted-foreground">No eligible programs found.</p>
                            ) : (
                                eligiblePrograms.map((prog: any, i: number) => {
                                    const existingApp = profile.applications.find((a: any) =>
                                        a.program === prog.rule.program && a.institutionDid === prog.rule.institutionDid
                                    );

                                    const status = existingApp ? existingApp.status : 'ELIGIBLE';

                                    const handleApply = async () => {
                                        if (!confirm(`Apply to ${prog.rule.program}?`)) return;
                                        try {
                                            const res = await fetch('/api/student/apply', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    did: profile.did,
                                                    program: prog.rule.program,
                                                    institutionDid: prog.rule.institutionDid
                                                })
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                alert('Application Submitted!');
                                                fetchProfile(session.userId);
                                            } else {
                                                alert('Error: ' + data.error);
                                            }
                                        } catch (e) {
                                            console.error(e);
                                            alert('Failed to apply');
                                        }
                                    };

                                    return (
                                        <div key={i} className="mb-4">
                                            <ApplicationStatusCard
                                                program={prog.rule.program}
                                                institution={prog.rule.institutionDid}
                                                status={status}
                                                score={prog.score}
                                            />
                                            {status === 'ELIGIBLE' && (
                                                <Button onClick={handleApply} size="sm" className="mt-2">Apply Now</Button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
