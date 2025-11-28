"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function InstitutionLogin() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [did, setDid] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/institution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ did })
            });

            const data = await res.json();

            if (data.success) {
                router.push('/institution/dashboard');
            } else {
                setError(data.error || 'Authentication failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Institution Portal Login</CardTitle>
                    <CardDescription>
                        Enter your institution DID to access the dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="did">Institution DID</Label>
                            <Input
                                id="did"
                                value={did}
                                onChange={e => setDid(e.target.value)}
                                required
                                placeholder="did:oan:institution:..."
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                'Access Dashboard'
                            )}
                        </Button>
                    </form>

                    <div className="mt-4 text-sm text-muted-foreground text-center">
                        <p>Test DID:</p>
                        <p className="font-mono text-xs mt-1">did:oan:institution:unilag</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
