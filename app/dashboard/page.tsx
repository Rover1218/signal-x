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
    const [greeting, setGreeting] = useState('Welcome back');

    // Set greeting based on time
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 17) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

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

    const activeJobs = jobs.filter(j => j.isPublic).length;
    const scheduledJobs = jobs.filter(j => j.scheduledAt && !j.isPublic).length;
    const draftJobs = jobs.filter(j => !j.isPublic && !j.scheduledAt).length;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Hero Welcome Section */}
            <div className="relative mb-10 p-8 rounded-3xl bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-cyan-900/40 border border-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        {profile?.photoURL && (
                            <img
                                src={profile.photoURL}
                                alt=""
                                className="w-16 h-16 rounded-2xl border-2 border-purple-500/50"
                            />
                        )}
                        <div>
                            <h1 className="text-3xl font-bold mb-1">
                                {greeting}, <span className="gradient-text">{profile?.displayName?.split(' ')[0]}</span>!
                            </h1>
                            <p className="text-gray-400">{profile?.company || profile?.email}</p>
                        </div>
                    </div>
                    <p className="text-gray-300 text-lg">
                        Here's an overview of your job postings and activity.
                    </p>
                </div>
            </div>

            {/* Stats Grid - Redesigned */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Jobs */}
                <div className="group p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-xs text-gray-500 group-hover:text-purple-400 transition-colors">All</span>
                    </div>
                    <div className="text-4xl font-bold text-purple-400 mb-1">{jobs.length}</div>
                    <div className="text-sm text-gray-400">Total Jobs</div>
                </div>

                {/* Active Jobs */}
                <div className="group p-5 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-xs text-gray-500 group-hover:text-green-400 transition-colors">Live</span>
                    </div>
                    <div className="text-4xl font-bold text-green-400 mb-1">{activeJobs}</div>
                    <div className="text-sm text-gray-400">Active Jobs</div>
                </div>

                {/* Scheduled */}
                <div className="group p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-xs text-gray-500 group-hover:text-amber-400 transition-colors">Pending</span>
                    </div>
                    <div className="text-4xl font-bold text-amber-400 mb-1">{scheduledJobs}</div>
                    <div className="text-sm text-gray-400">Scheduled</div>
                </div>

                {/* Drafts */}
                <div className="group p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <span className="text-xs text-gray-500 group-hover:text-cyan-400 transition-colors">Draft</span>
                    </div>
                    <div className="text-4xl font-bold text-cyan-400 mb-1">{draftJobs}</div>
                    <div className="text-sm text-gray-400">Drafts</div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Quick Actions - Left Side */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-300 mb-4">Quick Actions</h2>

                    <Link href="/dashboard/jobs/new" className="block p-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-semibold text-white">Post New Job</div>
                                <div className="text-xs text-white/70">Create a new job posting</div>
                            </div>
                        </div>
                    </Link>

                    <Link href="/dashboard/jobs" className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-semibold text-white">Manage Jobs</div>
                                <div className="text-xs text-gray-400">View and edit postings</div>
                            </div>
                        </div>
                    </Link>

                    <Link href="/dashboard/ai-insights" className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-semibold text-white">AI Insights</div>
                                <div className="text-xs text-gray-400">West Bengal analytics</div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Recent Jobs - Right Side */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-300">Recent Jobs</h2>
                        <Link href="/dashboard/jobs" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                            View All
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>

                    <div className="glass-card p-4">
                        {loadingJobs ? (
                            <div className="flex justify-center py-12">
                                <div className="spinner" />
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                                    <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
                                <p className="text-gray-400 text-sm mb-4">Start by creating your first job posting</p>
                                <Link href="/dashboard/jobs/new" className="btn-primary inline-flex">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Post Your First Job
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {jobs.slice(0, 5).map((job, index) => (
                                    <Link
                                        key={job.id}
                                        href={`/dashboard/jobs/${job.id}/edit`}
                                        className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors first:rounded-t-lg last:rounded-b-lg"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${job.isPublic ? 'bg-green-400' : job.scheduledAt ? 'bg-amber-400' : 'bg-gray-400'}`} />
                                            <div>
                                                <div className="font-medium">{job.title}</div>
                                                <div className="text-sm text-gray-400 flex items-center gap-2">
                                                    <span>{job.location}</span>
                                                    {job.salary && (
                                                        <>
                                                            <span className="text-gray-600">•</span>
                                                            <span className="text-green-400">{job.salary}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {job.jobType && (
                                                <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-xs hidden sm:block">
                                                    {job.jobType}
                                                </span>
                                            )}
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${job.isPublic
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : job.scheduledAt
                                                        ? 'bg-amber-500/20 text-amber-400'
                                                        : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {job.isPublic ? 'Live' : job.scheduledAt ? 'Scheduled' : 'Draft'}
                                            </span>
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-500/20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">SignalX AI Insights</h3>
                            <p className="text-gray-400 text-sm">Analyze West Bengal livelihood data with Groq AI</p>
                        </div>
                    </div>
                    <Link href="/dashboard/ai-insights" className="btn-secondary whitespace-nowrap">
                        Explore Insights →
                    </Link>
                </div>
            </div>
        </div>
    );
}
