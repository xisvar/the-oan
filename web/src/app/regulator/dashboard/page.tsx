"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Activity, Users, FileText, CheckCircle } from "lucide-react";

export default function RegulatorDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/regulator/stats');
                const data = await res.json();
                if (data.success) {
                    setStats(data.stats);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    if (loading && !stats) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="container mx-auto p-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8">Regulator Oversight Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalApplicants || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalRules || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Applications Submitted</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalMatches || 0}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Ledger Events:</span>
                            <span className="font-mono">{stats?.totalEvents || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Activity:</span>
                            <span className="font-mono">{stats?.lastActivity ? new Date(stats.lastActivity).toLocaleString() : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="text-green-500 font-bold">OPERATIONAL</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
