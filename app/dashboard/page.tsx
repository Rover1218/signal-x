'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useRouter } from 'next/navigation';
import { getUserJobs, Job } from '../lib/db';
import Link from 'next/link';

export default function DashboardPage() {
    const { profile, loading } = useAuth();
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);

    // Redirect admins to admin dashboard
    useEffect(() => {
        if (!loading && profile?.role === 'admin') {
            router.push('/admin');
        }
    }, [profile, loading, router]);

    useEffect(() => {
        const fetchJobs = async () => {
            if (profile?.uid) {
                const userJobs = await getUserJobs(profile.uid);
                setJobs(userJobs);
                setLoadingJobs(false);
            }
        };
        fetchJobs();
    }, [profile]);

    // Show loading while checking admin status
    if (loading || profile?.role === 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.displayName?.split(' ')[0]}!</h1>
                <p className="text-gray-400">Here's what's happening with your jobs</p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
                <div className="stat-card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">{jobs.length}</div>
                    <div className="text-gray-400">Total Jobs</div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">{jobs.filter(j => j.isPublic).length}</div>
                    <div className="text-gray-400">Active Jobs</div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold mb-1">{jobs.filter(j => j.scheduledAt).length}</div>
                    <div className="text-gray-400">Scheduled</div>
                </div>

                <div className="stat-card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-bold gradient-text mb-1">AI</div>
                    <div className="text-gray-400">Gemini Ready</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <Link href="/dashboard/jobs/new" className="btn-primary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Post New Job
                    </Link>
                    <Link href="/dashboard/ai-insights" className="btn-secondary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        View AI Insights
                    </Link>
                </div>
            </div>

            {/* Recent Jobs */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Recent Jobs</h2>
                    <Link href="/dashboard/jobs" className="text-purple-400 hover:text-purple-300 text-sm">
                        View All →
                    </Link>
                </div>

                {loadingJobs ? (
                    <div className="flex justify-center py-8">
                        <div className="spinner" />
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p className="mb-4">No jobs posted yet</p>
                        <Link href="/dashboard/jobs/new" className="btn-primary">Post Your First Job</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.slice(0, 5).map((job) => (
                            <div key={job.id} className="glass-card p-4 flex items-center justify-between">
                                <div>
                                    <div className="font-semibold">{job.title}</div>
                                    <div className="text-sm text-gray-400">{job.location}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs ${job.isPublic ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                        {job.isPublic ? 'Public' : 'Draft'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
