'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../components/AuthProvider';
import { updateJob, AVAILABLE_SKILLS, JOB_TYPES, Job } from '../../../../lib/db';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';

export default function EditJobPage() {
    const { profile } = useAuth();
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;

    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const jobRef = doc(db, 'jobs', jobId);
                const jobSnap = await getDoc(jobRef);
                if (jobSnap.exists()) {
                    const data = jobSnap.data() as Job;
                    setTitle(data.title || '');
                    setDescription(data.description || '');
                    setLocation(data.location || '');
                    setSalary(data.salary || '');
                    setRequirements(data.requirements || '');
                    setSelectedSkills(data.skills || []);
                    setJobType(data.jobType || '');

                    if (data.scheduledAt) {
                        const date = data.scheduledAt.toDate();
                        setScheduleDate(date.toISOString().split('T')[0]);
                        setScheduleTime(date.toTimeString().slice(0, 5));
                    }
                }
            } catch (err) {
                setError('Failed to load job');
            } finally {
                setLoading(false);
            }
        };

        if (jobId) fetchJob();
    }, [jobId]);

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

            await updateJob(jobId, {
                title,
                description,
                location,
                salary,
                requirements,
                skills: selectedSkills,
                jobType,
                scheduledAt
            });

            router.push('/dashboard/jobs');
        } catch (err) {
            setError('Failed to update job. Please try again.');
            setSaving(false);
        }
    };

    const clearSchedule = () => {
        setScheduleDate('');
        setScheduleTime('');
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl">
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-2">Edit Job</h1>
                <p className="text-gray-400">Update your job posting</p>
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

                    {/* Skills Selection */}
                    <div className="glass-card p-6">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Target Skills *
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">Select skills to match workers</p>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_SKILLS.map((skill) => (
                                <button
                                    key={skill}
                                    type="button"
                                    onClick={() => toggleSkill(skill)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedSkills.includes(skill)
                                        ? 'text-white shadow-lg'
                                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-emerald-500/50'
                                        }`}
                                    style={selectedSkills.includes(skill) ? { background: '#1e3a5f', boxShadow: '0 8px 16px rgba(30, 58, 95, 0.3)' } : {}}
                                >
                                    {skill}
                                    {selectedSkills.includes(skill) && <span className="ml-2">✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Job Type Selection */}
                    <div className="glass-card p-6">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Job Type *
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {JOB_TYPES.map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setJobType(type)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${jobType === type
                                        ? 'text-white shadow-lg'
                                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-teal-500/50'
                                        }`}
                                    style={jobType === type ? { background: '#10b981', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)' } : {}}
                                >
                                    {type}
                                    {jobType === type && <span className="ml-2">✓</span>}
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
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Schedule Publication
                            </h3>
                            {(scheduleDate || scheduleTime) && (
                                <button
                                    type="button"
                                    onClick={clearSchedule}
                                    className="text-sm text-red-400 hover:text-red-300"
                                >
                                    Clear Schedule
                                </button>
                            )}
                        </div>
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
                            {saving ? <div className="spinner w-5 h-5" /> : 'Save Changes'}
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
