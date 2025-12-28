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
            {/* Hero Welcome Section - Professional Glassmorphism */}
            <div
                className="relative mb-10 p-8 rounded-2xl overflow-hidden"
                style={{
                    background: 'rgba(30, 58, 95, 0.25)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
                }}
            >
                <div className="relative z-10">
                    <div className="flex items-center gap-5 mb-4">
                        {profile?.photoURL ? (
                            <div className="relative">
                                <img
                                    src={profile.photoURL}
                                    alt=""
                                    className="w-16 h-16 rounded-2xl object-cover"
                                    style={{
                                        border: '2px solid rgba(16, 185, 129, 0.5)',
                                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                                    }}
                                />
                                <div
                                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                                    style={{ background: '#10b981' }}
                                >
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                                style={{
                                    background: '#1e3a5f',
                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                                }}
                            >
                                {profile?.displayName?.charAt(0) || 'U'}
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold mb-1 text-white">
                                {greeting}, <span className="text-emerald-400">{profile?.displayName?.split(' ')[0]}</span>!
                            </h1>
                            <p className="text-white/60">{profile?.company || profile?.email}</p>
                        </div>
                    </div>
                    <p className="text-white/70 text-lg">
                        Here's an overview of your job postings and activity.
                    </p>
                </div>
            </div>

            {/* Stats Grid - Professional Solid Colors */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Jobs */}
                <div
                    className="group p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                    style={{
                        background: 'rgba(30, 58, 95, 0.2)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(30, 58, 95, 0.3)',
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: '#1e3a5f' }}
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-xs text-white/40 group-hover:text-white/70 transition-colors">All</span>
                    </div>
                    <div className="text-4xl font-bold text-white mb-1">{jobs.length}</div>
                    <div className="text-sm text-white/50">Total Jobs</div>
                </div>

                {/* Active Jobs */}
                <div
                    className="group p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                    style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: '#10b981' }}
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-xs text-white/40 group-hover:text-emerald-400 transition-colors">Live</span>
                    </div>
                    <div className="text-4xl font-bold text-emerald-400 mb-1">{activeJobs}</div>
                    <div className="text-sm text-white/50">Active Jobs</div>
                </div>

                {/* Scheduled */}
                <div
                    className="group p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                    style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: '#f59e0b' }}
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-xs text-white/40 group-hover:text-amber-400 transition-colors">Pending</span>
                    </div>
                    <div className="text-4xl font-bold text-amber-400 mb-1">{scheduledJobs}</div>
                    <div className="text-sm text-white/50">Scheduled</div>
                </div>

                {/* Drafts */}
                <div
                    className="group p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                    style={{
                        background: 'rgba(100, 116, 139, 0.1)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(100, 116, 139, 0.2)',
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: '#64748b' }}
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <span className="text-xs text-white/40 group-hover:text-slate-400 transition-colors">Draft</span>
                    </div>
                    <div className="text-4xl font-bold text-slate-400 mb-1">{draftJobs}</div>
                    <div className="text-sm text-white/50">Drafts</div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Quick Actions - Left Side */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="text-lg font-semibold text-white/80 mb-4">Quick Actions</h2>

                    <Link
                        href="/dashboard/jobs/new"
                        className="block p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] group"
                        style={{
                            background: '#1e3a5f',
                            boxShadow: '0 4px 20px rgba(30, 58, 95, 0.4)',
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: 'rgba(255, 255, 255, 0.15)' }}
                            >
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

                    <Link
                        href="/dashboard/jobs"
                        className="block p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] group"
                        style={{
                            background: 'rgba(30, 58, 95, 0.2)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(30, 58, 95, 0.3)',
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: 'rgba(30, 58, 95, 0.5)' }}
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-semibold text-white">Manage Jobs</div>
                                <div className="text-xs text-white/50">View and edit postings</div>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/dashboard/ai-insights"
                        className="block p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] group"
                        style={{
                            background: 'rgba(13, 148, 136, 0.15)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(13, 148, 136, 0.25)',
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: '#0d9488' }}
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-semibold text-white">AI Insights</div>
                                <div className="text-xs text-white/50">West Bengal analytics</div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Recent Jobs - Right Side */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white/80">Recent Jobs</h2>
                        <Link href="/dashboard/jobs" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                            View All
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>

                    <div
                        className="rounded-2xl p-1 overflow-hidden"
                        style={{
                            background: 'rgba(30, 58, 95, 0.15)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                    >
                        {loadingJobs ? (
                            <div className="flex justify-center py-12">
                                <div className="spinner" />
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <div
                                    className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                                    style={{ background: 'rgba(30, 58, 95, 0.3)' }}
                                >
                                    <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold mb-2 text-white">No jobs posted yet</h3>
                                <p className="text-white/50 text-sm mb-4">Start by creating your first job posting</p>
                                <Link
                                    href="/dashboard/jobs/new"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105"
                                    style={{
                                        background: '#1e3a5f',
                                        boxShadow: '0 4px 16px rgba(30, 58, 95, 0.3)',
                                    }}
                                >
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
                                        className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors first:rounded-t-xl last:rounded-b-xl"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2.5 h-2.5 rounded-full ${job.isPublic ? 'bg-emerald-400' : job.scheduledAt ? 'bg-amber-400' : 'bg-slate-400'}`} />
                                            <div>
                                                <div className="font-medium text-white">{job.title}</div>
                                                <div className="text-sm text-white/50 flex items-center gap-2">
                                                    <span>{job.location}</span>
                                                    {job.salary && (
                                                        <>
                                                            <span className="text-white/20">•</span>
                                                            <span className="text-emerald-400">{job.salary}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {job.jobType && (
                                                <span
                                                    className="px-3 py-1 rounded-lg text-xs hidden sm:block text-white/70"
                                                    style={{ background: 'rgba(30, 58, 95, 0.4)' }}
                                                >
                                                    {job.jobType}
                                                </span>
                                            )}
                                            <span
                                                className="px-3 py-1.5 rounded-full text-xs font-medium"
                                                style={{
                                                    background: job.isPublic
                                                        ? 'rgba(16, 185, 129, 0.2)'
                                                        : job.scheduledAt
                                                            ? 'rgba(245, 158, 11, 0.2)'
                                                            : 'rgba(100, 116, 139, 0.2)',
                                                    color: job.isPublic ? '#10b981' : job.scheduledAt ? '#f59e0b' : '#94a3b8',
                                                }}
                                            >
                                                {job.isPublic ? 'Live' : job.scheduledAt ? 'Scheduled' : 'Draft'}
                                            </span>
                                            <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* AI Banner - Professional Glassmorphism */}
            <div
                className="p-6 rounded-2xl overflow-hidden relative"
                style={{
                    background: 'rgba(13, 148, 136, 0.15)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    border: '1px solid rgba(13, 148, 136, 0.25)',
                }}
            >
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center"
                            style={{ background: '#0d9488' }}
                        >
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-white">SignalX AI Insights</h3>
                            <p className="text-white/50 text-sm">Analyze West Bengal livelihood data with Groq AI</p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/ai-insights"
                        className="whitespace-nowrap px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105"
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                        }}
                    >
                        Explore Insights →
                    </Link>
                </div>
            </div>
        </div>
    );
}
