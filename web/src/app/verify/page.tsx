'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function VerifyPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData(e.currentTarget);
        const credentialStr = formData.get('credential') as string;
        const publicKey = formData.get('publicKey') as string;

        try {
            let credential;
            try {
                credential = JSON.parse(credentialStr);
            } catch {
                throw new Error('Invalid JSON format for credential');
            }

            const res = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    credential,
                    publicKey,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to verify credential');
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8 text-slate-900">Public Verifier</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Verify Credential</CardTitle>
                    <CardDescription>Paste a signed credential JSON. If the issuer is registered, you don't need to provide a public key.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="credential">Credential JSON</Label>
                            <Textarea
                                id="credential"
                                name="credential"
                                placeholder="{ ... }"
                                className="font-mono text-xs h-48"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="publicKey">Issuer Public Key (PEM) <span className="text-slate-400 font-normal">(Optional if Issuer is registered)</span></Label>
                            <Textarea
                                id="publicKey"
                                name="publicKey"
                                placeholder="Leave empty to auto-resolve from DID..."
                                className="font-mono text-xs h-32"
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verify Signature'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="mt-8">
                {error && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6 flex items-start gap-4 text-red-700">
                            <ShieldAlert className="h-6 w-6 shrink-0" />
                            <div>
                                <h3 className="font-bold">Verification Failed</h3>
                                <p>{error}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {result && (
                    <Card className={`border-${result.isValid ? 'green' : 'red'}-200 bg-${result.isValid ? 'green' : 'red'}-50`}>
                        <CardContent className={`pt-6 flex items-start gap-4 text-${result.isValid ? 'green' : 'red'}-800`}>
                            {result.isValid ? <ShieldCheck className="h-6 w-6 shrink-0" /> : <ShieldAlert className="h-6 w-6 shrink-0" />}
                            <div>
                                <h3 className="font-bold">{result.isValid ? 'Valid Signature' : 'Invalid Signature'}</h3>
                                <p>{result.details}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
