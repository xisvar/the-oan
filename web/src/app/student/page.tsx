import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileCheck } from 'lucide-react';

export default function StudentDashboard() {
    // Mock data for the prototype
    // In a real app, this would fetch from the student's wallet or local storage
    const credentials = [
        {
            id: 'cred-1',
            issuer: 'West African Examinations Council',
            type: 'WASSCE Result',
            date: '2024-06-15',
            status: 'Verified',
            data: {
                Mathematics: 'A1',
                English: 'B2',
                Physics: 'A1',
                Chemistry: 'B3'
            }
        }
    ];

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-slate-900">Student Wallet</h1>

            <div className="grid gap-6">
                {credentials.map((cred) => (
                    <Card key={cred.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <FileCheck className="h-5 w-5 text-indigo-600" />
                                    {cred.type}
                                </CardTitle>
                                <CardDescription>{cred.issuer} • Issued {cred.date}</CardDescription>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                {cred.status}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {Object.entries(cred.data).map(([subject, grade]) => (
                                    <div key={subject} className="bg-slate-50 p-3 rounded border">
                                        <div className="text-xs text-slate-500 uppercase font-semibold">{subject}</div>
                                        <div className="text-lg font-bold text-slate-900">{grade}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <Card className="border-dashed border-2 bg-slate-50/50">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <p>No other credentials found.</p>
                        <p className="text-sm">Connect more issuers to see them here.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
