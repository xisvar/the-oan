"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function StudentLogin() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        dob: '',
        jambReg: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                router.push('/student/dashboard');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Student Portal Login</CardTitle>
                    <CardDescription>
                        Enter your OAN pre-registration details to access your dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                                placeholder="student@example.com"
                            />
                        </div>

                        <div>
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input
                                id="dob"
                                type="date"
                                value={formData.dob}
                                onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="jambReg">JAMB Registration Number</Label>
                            <Input
                                id="jambReg"
                                value={formData.jambReg}
                                onChange={e => setFormData({ ...formData, jambReg: e.target.value })}
                                required
                                placeholder="2026/1234567"
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
                                    Verifying...
                                </>
                            ) : (
                                'Login to Dashboard'
                            )}
                        </Button>
                    </form>

                    <div className="mt-4 text-sm text-muted-foreground text-center">
                        <p>Test Credentials:</p>
                        <p className="font-mono text-xs mt-1">student1@example.com | 2005-03-15 | 2026/1234567</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
