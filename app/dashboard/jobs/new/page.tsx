'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../components/AuthProvider';
import { createJob, AVAILABLE_SKILLS, JOB_TYPES } from '../../../lib/db';
import { checkJobSafety } from '../../../lib/moderation';
import { Timestamp } from 'firebase/firestore';

export default function NewJobPage() {
    const { profile } = useAuth();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [salary, setSalary] = useState('');
    const [requirements, setRequirements] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [jobType, setJobType] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const toggleSkill = (skill: string) => {
        if (selectedSkills.includes(skill)) {
            setSelectedSkills(selectedSkills.filter(s => s !== skill));
        } else {
            setSelectedSkills([...selectedSkills, skill]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.uid) return;

        if (selectedSkills.length === 0) {
            setError('Please select at least one skill to target workers');
            return;
        }

        if (!jobType) {
            setError('Please select a job type');
            return;
        }

        setSaving(true);
        setError('');

        try {
            let scheduledAt = null;
            if (scheduleDate && scheduleTime) {
                scheduledAt = Timestamp.fromDate(new Date(`${scheduleDate}T${scheduleTime}`));
            }

            // AI Moderation Check
            const moderation = await checkJobSafety(title, description);

            let status: 'pending' | 'approved' | 'rejected' = 'pending';
            let isPublic = false;

            if (moderation.isSafe) {
                status = 'approved';
                isPublic = true;
            }

            await createJob(profile.uid, {
                title,
                description,
                location,
                salary,
                requirements,
                skills: selectedSkills,
                jobType,
                scheduledAt,
                status: status,
                isPublic: isPublic,
                moderationStatus: moderation.isSafe ? 'auto-approved' : 'flagged',
                moderationReason: moderation.reason || ''
            });

            const redirectUrl = moderation.isSafe ? '/dashboard/jobs' : '/dashboard/jobs?moderation=flagged';
            router.push(redirectUrl);
        } catch (err) {
            setError('Failed to create job. Please try again.');
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl">
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-2">Post New Job</h1>
                <p className="text-gray-400">Create a job and target workers by skills using AI matching</p>
            </div>

            <div className="glass-card p-8">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
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

                    {/* Skills Selection - AI Targeting */}
                    <div className="glass-card p-6">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Target Skills (AI Matching) *
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">Select skills to match workers from the Flutter app</p>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_SKILLS.map((skill) => (
                                <button
                                    key={skill}
                                    type="button"
                                    onClick={() => toggleSkill(skill)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedSkills.includes(skill)
                                        ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-500/30'
                                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-purple-500/50 hover:text-white'
                                        }`}
                                >
                                    {skill}
                                    {selectedSkills.includes(skill) && (
                                        <span className="ml-2">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                        {selectedSkills.length > 0 && (
                            <p className="text-green-400 text-sm mt-3 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {selectedSkills.length} skill{selectedSkills.length > 1 ? 's' : ''} selected
                            </p>
                        )}
                    </div>

                    {/* Job Type Selection */}
                    <div className="glass-card p-6">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Job Type *
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">What type of employment is this?</p>
                        <div className="flex flex-wrap gap-2">
                            {JOB_TYPES.map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setJobType(type)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${jobType === type
                                        ? 'bg-gradient-to-r from-cyan-500 to-green-500 text-white shadow-lg shadow-cyan-500/30'
                                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-cyan-500/50 hover:text-white'
                                        }`}
                                >
                                    {type}
                                    {jobType === type && (
                                        <span className="ml-2">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Additional Requirements</label>
                        <textarea
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                            className="input min-h-[100px] resize-none"
                            placeholder="Experience, documents, certifications required..."
                        />
                    </div>

                    {/* Schedule Section */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold flex items-center gap-2">
                                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Schedule Publication (Optional)
                            </h3>
                            {(scheduleDate || scheduleTime) && (
                                <button
                                    type="button"
                                    onClick={() => { setScheduleDate(''); setScheduleTime(''); }}
                                    className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear
                                </button>
                            )}
                        </div>
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
