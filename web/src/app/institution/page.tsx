'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, AlertCircle, Copy } from 'lucide-react';

export default function InstitutionDashboard() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleIssue = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData(e.currentTarget);
        const subjectId = formData.get('subjectId');
        const score = formData.get('score');
        const subject = formData.get('subject');

        try {
            const res = await fetch('/api/issue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subjectId,
                    claims: {
                        subject,
                        score: Number(score),
                        grade: 'A', // Hardcoded for demo
                    },
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to issue credential');
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-slate-900">Institution Portal</h1>

            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Issue Academic Credential</CardTitle>
                        <CardDescription>Generate a cryptographically signed result for a student.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleIssue} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="subjectId">Student ID (DID)</Label>
                                <Input id="subjectId" name="subjectId" placeholder="did:oan:student:123" required defaultValue="did:oan:student:alice" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" name="subject" placeholder="Mathematics" required defaultValue="Mathematics" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="score">Score</Label>
                                <Input id="score" name="score" type="number" placeholder="95" required defaultValue="95" />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Issue Credential'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {error && (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="pt-6 flex items-start gap-4 text-red-700">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <p>{error}</p>
                            </CardContent>
                        </Card>
                    )}

                    {result && (
                        <Card className="border-green-200 bg-green-50">
                            <CardHeader>
                                <CardTitle className="text-green-800 flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5" />
                                    Credential Issued
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="relative">
                                    <div className="bg-white p-4 rounded border border-green-100 overflow-auto max-h-[300px] text-xs font-mono">
                                        <pre>{JSON.stringify(result.credential, null, 2)}</pre>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute top-2 right-2 h-6 w-6"
                                        onClick={() => copyToClipboard(JSON.stringify(result.credential, null, 2))}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-green-800 mb-1">Public Key (for verification):</p>
                                    <div className="relative bg-white p-2 rounded border border-green-100 text-[10px] font-mono overflow-auto">
                                        <pre>{result.publicKey}</pre>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="absolute top-2 right-2 h-6 w-6"
                                            onClick={() => copyToClipboard(result.publicKey)}
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
