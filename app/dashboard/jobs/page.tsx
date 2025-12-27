'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../components/AuthProvider';
import { getUserJobs, updateJob, Job } from '../../lib/db';

export default function JobsPage() {
    const { profile } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            if (profile?.uid) {
                const userJobs = await getUserJobs(profile.uid);
                setJobs(userJobs);
                setLoading(false);
            }
        };
        fetchJobs();
    }, [profile]);

    const togglePublic = async (jobId: string, currentStatus: boolean) => {
        await updateJob(jobId, { isPublic: !currentStatus });
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isPublic: !currentStatus } : j));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Jobs</h1>
                    <p className="text-gray-400">Manage your job postings</p>
                </div>
                <Link href="/dashboard/jobs/new" className="btn-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Post New Job
                </Link>
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
                                        <span className={`px-3 py-1 rounded-full text-xs ${job.isPublic ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                            {job.isPublic ? 'Public' : 'Draft'}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 mb-4">{job.description?.slice(0, 150)}...</p>
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
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {job.salary}
                                            </span>
                                        )}
                                        {job.scheduledAt && (
                                            <span className="flex items-center gap-1 text-amber-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Scheduled
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => job.id && togglePublic(job.id, job.isPublic)}
                                        className={`toggle ${job.isPublic ? 'active' : ''}`}
                                        title={job.isPublic ? 'Make Private' : 'Make Public'}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
