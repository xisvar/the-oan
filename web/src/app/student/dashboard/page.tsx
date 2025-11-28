"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CredentialCard } from "@/components/CredentialCard";
import { ApplicationStatusCard } from "@/components/ApplicationStatusCard";
import { Loader2 } from "lucide-react";

export default function StudentDashboard() {
    const [did, setDid] = useState('');
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [eligiblePrograms, setEligiblePrograms] = useState<any[]>([]);

    const fetchProfile = async () => {
        if (!did) return;
        setLoading(true);
        try {
            // 1. Fetch Profile
            const res = await fetch(`/api/student/profile?did=${did}`);
            const data = await res.json();
            if (data.success) {
                setProfile(data.profile);

                // 2. Fetch Eligible Programs (Simulating "Applications" view)
                // In a real app, we'd check for actual submitted applications.
                // Here we just show what they are eligible for as "Potential Applications"
                const eligRes = await fetch(`/api/student/eligible-programs?did=${did}`);
                const eligData = await eligRes.json();
                if (eligData.success) {
                    setEligiblePrograms(eligData.programs);
                }
            } else {
                alert('Profile not found');
                setProfile(null);
            }
        } catch (e) {
            console.error(e);
            alert('Error fetching profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Student Wallet & Dashboard</h1>

            {/* Login Section */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Access Your Wallet</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <Input
                        placeholder="Enter your DID (e.g., did:oan:student:p6-s1)"
                        value={did}
                        onChange={(e) => setDid(e.target.value)}
                    />
                    <Button onClick={fetchProfile} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Connect'}
                    </Button>
                </CardContent>
            </Card>

            {profile && (
                <Tabs defaultValue="credentials">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="credentials">My Credentials</TabsTrigger>
                        <TabsTrigger value="applications">Applications</TabsTrigger>
                    </TabsList>

                    <TabsContent value="credentials">
                        <div className="mt-4">
                            {profile.examResults.length === 0 ? (
                                <p className="text-muted-foreground">No credentials found.</p>
                            ) : (
                                profile.examResults.map((cred: any, i: number) => (
                                    <CredentialCard key={i} credential={cred} />
                                ))
                            )}
                        </div>
                        );
}
