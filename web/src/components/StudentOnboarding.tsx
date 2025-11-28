"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface OnboardingProps {
    did: string;
    onComplete: () => void;
}

export function StudentOnboarding({ did, onComplete }: OnboardingProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        jambRegNo: '',
        firstName: '',
        lastName: '',
        state: '',
        lga: '',
        jambScore: '',
        waecSubjects: [] as { subject: string, grade: string }[]
    });

    const [subjectInput, setSubjectInput] = useState({ subject: '', grade: '' });

    const handleNext = () => setStep(step + 1);

    const addSubject = () => {
        if (subjectInput.subject && subjectInput.grade) {
            setFormData({
                ...formData,
                waecSubjects: [...formData.waecSubjects, subjectInput]
            });
            setSubjectInput({ subject: '', grade: '' });
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 1. Submit Profile Data (Simulated via Events)
            // In real app, we'd call an API that appends APPLICANT_UPDATED, UTME_RESULT_ADDED, EXAM_RESULT_ADDED

            // Mocking the API calls
            // A. Profile Update (Name, etc)
            await fetch('/api/debug/mock-credential', { // Reusing mock endpoint for simplicity or create new?
                // Actually, let's just use the mock-credential endpoint to add the WAEC results
                // And we need a way to set the UTME result.
                // I should probably create a proper /api/student/onboard endpoint.
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'ONBOARD',
                    did,
                    profile: {
                        name: `${formData.firstName} ${formData.lastName}`,
                        state: formData.state
                    },
                    utme: {
                        jambScore: parseInt(formData.jambScore),
                        subjectCombo: [] // TODO
                    },
                    waec: formData.waecSubjects
                })
            });

            onComplete();
        } catch (e) {
            console.error(e);
            alert('Onboarding Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto mt-8">
            <CardHeader>
                <CardTitle>Student Onboarding (Step {step}/3)</CardTitle>
            </CardHeader>
            <CardContent>
                {step === 1 && (
                    <div className="space-y-4">
                        <h3 className="font-semibold">Identity & Personal Data</h3>
                        <div>
                            <Label>JAMB Registration Number</Label>
                            <Input
                                value={formData.jambRegNo}
                                onChange={e => setFormData({ ...formData, jambRegNo: e.target.value })}
                                placeholder="2026/..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>First Name</Label>
                                <Input
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Last Name</Label>
                                <Input
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>
                        <Button onClick={handleNext} className="w-full">Next</Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <h3 className="font-semibold">Academic Records (UTME)</h3>
                        <div>
                            <Label>JAMB Score</Label>
                            <Input
                                type="number"
                                value={formData.jambScore}
                                onChange={e => setFormData({ ...formData, jambScore: e.target.value })}
                            />
                        </div>
                        <Button onClick={handleNext} className="w-full">Next</Button>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                        <h3 className="font-semibold">O-Level Results (WAEC/NECO)</h3>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Subject (e.g. Math)"
                                value={subjectInput.subject}
                                onChange={e => setSubjectInput({ ...subjectInput, subject: e.target.value })}
                            />
                            <Input
                                placeholder="Grade (e.g. A1)"
                                className="w-24"
                                value={subjectInput.grade}
                                onChange={e => setSubjectInput({ ...subjectInput, grade: e.target.value })}
                            />
                            <Button onClick={addSubject} variant="outline">Add</Button>
                        </div>
                        <div className="border p-2 rounded min-h-[100px]">
                            {formData.waecSubjects.map((s, i) => (
                                <div key={i} className="flex justify-between text-sm p-1 border-b">
                                    <span>{s.subject}</span>
                                    <span className="font-bold">{s.grade}</span>
                                </div>
                            ))}
                        </div>
                        <Button onClick={handleSubmit} disabled={loading} className="w-full">
                            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                            Complete Profile
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
