'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../components/AuthProvider';
import { createJob } from '../../../lib/db';
import { Timestamp } from 'firebase/firestore';

export default function NewJobPage() {
    const { profile } = useAuth();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [salary, setSalary] = useState('');
    const [requirements, setRequirements] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.uid) return;

        setSaving(true);
        setError('');

        try {
            let scheduledAt = null;
            if (scheduleDate && scheduleTime) {
                scheduledAt = Timestamp.fromDate(new Date(`${scheduleDate}T${scheduleTime}`));
            }

            await createJob(profile.uid, {
                title,
                description,
                location,
                salary,
                requirements,
                scheduledAt
            });

            router.push('/dashboard/jobs');
        } catch (err) {
            setError('Failed to create job. Please try again.');
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl">
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-2">Post New Job</h1>
                <p className="text-gray-400">Create a new job opportunity</p>
            </div>

            <div className="glass-card p-8">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Job Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input"
                            placeholder="e.g. Agricultural Worker, MSME Operator"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input min-h-[150px] resize-none"
                            placeholder="Describe the job responsibilities, requirements, and benefits..."
                            required
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Location *</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="input"
                                placeholder="e.g. Murshidabad, West Bengal"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Salary/Wages</label>
                            <input
                                type="text"
                                value={salary}
                                onChange={(e) => setSalary(e.target.value)}
                                className="input"
                                placeholder="e.g. ₹15,000/month or ₹500/day"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Requirements</label>
                        <textarea
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                            className="input min-h-[100px] resize-none"
                            placeholder="Skills, experience, documents required..."
                        />
                    </div>

                    {/* Schedule Section */}
                    <div className="glass-card p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Schedule Publication (Optional)
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">Set when this job should go live automatically</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                                <input
                                    type="time"
                                    value={scheduleTime}
                                    onChange={(e) => setScheduleTime(e.target.value)}
                                    className="input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                            {saving ? <div className="spinner w-5 h-5" /> : 'Create Job'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
