import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ApplicationStatusCardProps {
    program: string;
    institution: string;
    status: 'APPLIED' | 'ADMITTED' | 'WAITLISTED' | 'REJECTED' | 'ELIGIBLE' | 'SUBMITTED' | 'OFFER_RECEIVED' | 'UNDER_REVIEW';
    score?: number;
}

export function ApplicationStatusCard({ program, institution, status, score }: ApplicationStatusCardProps) {
    const getStatusColor = (s: string) => {
        switch (s) {
            case 'ADMITTED':
            case 'OFFER_RECEIVED': return 'bg-green-500 hover:bg-green-600';
            case 'WAITLISTED': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'REJECTED': return 'bg-red-500 hover:bg-red-600';
            case 'ELIGIBLE': return 'bg-blue-500 hover:bg-blue-600';
            case 'SUBMITTED':
            case 'APPLIED': return 'bg-purple-500 hover:bg-purple-600';
            default: return 'bg-gray-500';
        }
    };

    return (
        <Card className="w-full mb-4">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>{program}</CardTitle>
                        <CardDescription>{institution}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(status)}>
                        {status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {score !== undefined && (
                    <div className="text-sm text-muted-foreground">
                        Merit Score: {score}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
