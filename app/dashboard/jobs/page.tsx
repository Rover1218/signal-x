'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';
import { getUserJobs, updateJob, deleteJob, Job, getJobApplicationCount } from '../../lib/db';
import { Timestamp } from 'firebase/firestore';

export default function JobsPage() {
    const { profile } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        if (profile?.uid) {
            refreshJobs();
        }
    }, [profile]);

    const refreshJobs = async () => {
        setLoading(true);
        if (profile?.uid) {
            const userJobs = await getUserJobs(profile.uid);

            // Show jobs immediately
            setJobs(userJobs);
            setLoading(false);

            // Fetch application counts
            const counts: Record<string, number> = {};
            await Promise.all(userJobs.map(async (job) => {
                if (job.id) {
                    counts[job.id] = await getJobApplicationCount(job.id);
                }
            }));
            setApplicationCounts(counts);

            // Auto-publish jobs in background (parallelize)
            const now = new Date();
            const jobsToPublish = userJobs.filter(job =>
                job.scheduledAt && !job.isPublic && job.scheduledAt.toDate() <= now && job.id
            );

            if (jobsToPublish.length > 0) {
                // Update all at once in parallel
                await Promise.all(jobsToPublish.map(job => updateJob(job.id!, { isPublic: true })));
                // Update UI
                setJobs(prev => prev.map(j =>
                    jobsToPublish.some(p => p.id === j.id) ? { ...j, isPublic: true } : j
                ));
            }
        }
    };

    const togglePublic = async (jobId: string, currentStatus: boolean) => {
        await updateJob(jobId, { isPublic: !currentStatus });
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isPublic: !currentStatus } : j));
    };

    const handleDelete = async (jobId: string) => {
        await deleteJob(jobId);
        setJobs(prev => prev.filter(j => j.id !== jobId));
        setDeleteConfirm(null);
    };

    const handleSaveSchedule = async (jobId: string) => {
        // Require both date and time to be set
        if (!scheduleDate || !scheduleTime) {
            alert('Please select both date and time to schedule');
            return;
        }

        const scheduledAt = Timestamp.fromDate(new Date(`${scheduleDate}T${scheduleTime}`));
        await updateJob(jobId, { scheduledAt });
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, scheduledAt } : j));
        setEditingSchedule(null);
        setScheduleDate('');
        setScheduleTime('');
    };

    const handleClearSchedule = async (jobId: string) => {
        await updateJob(jobId, { scheduledAt: null });
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, scheduledAt: null } : j));
        setEditingSchedule(null);
    };

    const formatScheduleDate = (timestamp: Timestamp) => {
        const date = timestamp.toDate();
        return date.toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Jobs</h1>
                    <p className="text-gray-400">Manage your job postings</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={refreshJobs}
                        disabled={loading}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-50"
                        title="Refresh Jobs"
                    >
                        <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                    <Link href="/dashboard/jobs/new" className="btn-primary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Post New Job
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="spinner" />
                </div>
            ) : jobs.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <svg className="w-20 h-20 mx-auto mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h2 className="text-xl font-semibold mb-2">No Jobs Yet</h2>
                    <p className="text-gray-400 mb-6">Start by posting your first job opportunity</p>
                    <Link href="/dashboard/jobs/new" className="btn-primary">Create Your First Job</Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {jobs.map((job) => (
                        <div key={job.id} className="glass-card p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-semibold">{job.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${job.status === 'approved'
                                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                            : job.status === 'rejected'
                                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                            }`}>
                                            {job.status === 'approved' ? 'Active' : job.status === 'rejected' ? 'Rejected' : 'Under Review'}
                                        </span>
                                        {job.jobType && (
                                            <span className="px-3 py-1 rounded-full text-xs bg-teal-500/20 text-teal-400">
                                                {job.jobType}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 mb-3">{job.description?.slice(0, 150)}...</p>

                                    {/* Skills Tags */}
                                    {job.skills && job.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {job.skills.map(skill => (
                                                <span key={skill} className="px-2 py-1 text-xs rounded-full" style={{ background: 'rgba(30, 58, 95, 0.3)', color: '#64b5f6' }}>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {job.location}
                                        </span>
                                        {job.salary && (
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {job.salary}
                                            </span>
                                        )}
                                        {job.scheduledAt && (
                                            <span className="flex items-center gap-1 text-amber-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {formatScheduleDate(job.scheduledAt)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                    {/* View Applications */}
                                    <Link
                                        href={`/dashboard/jobs/${job.id}/applications`}
                                        className={`relative p-2 rounded-lg transition-all ${(applicationCounts[job.id!] || 0) > 0
                                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                            : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                                            }`}
                                        title="View Applications"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        {(applicationCounts[job.id!] || 0) > 0 && (
                                            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">
                                                {applicationCounts[job.id!]}
                                            </span>
                                        )}
                                    </Link>

                                    {/* Edit */}
                                    <Link
                                        href={`/dashboard/jobs/${job.id}/edit`}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                        title="Edit Job"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </Link>

                                    {/* Schedule */}
                                    <button
                                        onClick={() => setEditingSchedule(editingSchedule === job.id ? null : job.id!)}
                                        className={`p-2 rounded-lg transition-all ${editingSchedule === job.id ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'}`}
                                        title="Schedule Publication"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </button>

                                    {/* Delete */}
                                    <button
                                        onClick={() => setDeleteConfirm(job.id!)}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
                                        title="Delete Job"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>

                                    {/* Toggle */}
                                    <div className="relative group">
                                        <button
                                            onClick={() => job.status === 'approved' && job.id && togglePublic(job.id, job.isPublic)}
                                            className={`toggle ${job.isPublic ? 'active' : ''} ${job.status !== 'approved' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={job.status !== 'approved'}
                                        />
                                        {job.status !== 'approved' && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-black/80 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                Wait for approval
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Editor */}
                            {editingSchedule === job.id && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <p className="text-sm text-gray-400 mb-3">Select both date and time to schedule publication</p>
                                    <div className="flex flex-wrap items-end gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Date <span className="text-red-400">*</span></label>
                                            <input
                                                type="date"
                                                value={scheduleDate}
                                                onChange={(e) => setScheduleDate(e.target.value)}
                                                className={`input py-2 ${!scheduleDate ? 'border-amber-500/50' : 'border-green-500/50'}`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Time <span className="text-red-400">*</span></label>
                                            <input
                                                type="time"
                                                value={scheduleTime}
                                                onChange={(e) => setScheduleTime(e.target.value)}
                                                className={`input py-2 ${!scheduleTime ? 'border-amber-500/50' : 'border-green-500/50'}`}
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleSaveSchedule(job.id!)}
                                            disabled={!scheduleDate || !scheduleTime}
                                            className="btn-primary py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Save Schedule
                                        </button>
                                        {job.scheduledAt && (
                                            <button
                                                onClick={() => handleClearSchedule(job.id!)}
                                                className="btn-secondary py-2 px-4 text-red-400 border-red-500/30 hover:bg-red-500/10"
                                            >
                                                Clear Schedule
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setEditingSchedule(null)}
                                            className="btn-secondary py-2 px-4"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Delete Confirmation */}
                            {deleteConfirm === job.id && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-4">
                                        <span className="text-red-400">Are you sure you want to delete this job?</span>
                                        <button
                                            onClick={() => handleDelete(job.id!)}
                                            className="btn-secondary py-2 px-4 text-red-400 border-red-500/30 hover:bg-red-500/10"
                                        >
                                            Yes, Delete
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(null)}
                                            className="btn-secondary py-2 px-4"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
