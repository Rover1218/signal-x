'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../components/AuthProvider';
import { getPendingUsers, getApprovedUsers, getAllJobs, approveUser, rejectUser, deleteJob, UserProfile, Job } from '../lib/db';
import { logOut } from '../lib/firebase';
import { analyzeLivelihood } from '../lib/gemini';
import { westBengalStats, highRiskBlocks } from '../lib/wb-stats';

type TabType = 'pending' | 'users' | 'jobs' | 'reviews' | 'ai' | 'alerts';

export default function AdminPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
    const [approvedUsers, setApprovedUsers] = useState<UserProfile[]>([]);
    const [activeJobs, setActiveJobs] = useState<Job[]>([]);
    const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [deleteJobConfirm, setDeleteJobConfirm] = useState<string | null>(null);
    // AI State
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');
    const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
    // Alerts State
    const [alertsLoading, setAlertsLoading] = useState(false);
    const [alertResults, setAlertResults] = useState<any[]>([]);

    const toggleJobExpand = (jobId: string) => {
        setExpandedJobs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(jobId)) {
                newSet.delete(jobId);
            } else {
                newSet.add(jobId);
            }
            return newSet;
        });
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        if (!loading && profile && profile.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [user, profile, loading, router]);

    useEffect(() => {
        if (profile?.role === 'admin') {
            refreshData();
        }
    }, [profile]);

    const refreshData = async () => {
        setLoadingData(true);
        try {
            const [pending, approved, jobs] = await Promise.all([
                getPendingUsers(),
                getApprovedUsers(),
                getAllJobs()
            ]);
            setPendingUsers(pending);
            setApprovedUsers(approved);
            setActiveJobs(jobs.filter(j => j.status === 'approved' && j.isPublic));
            // Include jobs with undefined status as pending to catch legacy data
            setPendingJobs(jobs.filter(j => j.status === 'pending' || !j.status));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleApprove = async (uid: string) => {
        await approveUser(uid);
        setPendingUsers(prev => prev.filter(u => u.uid !== uid));
        const approved = await getApprovedUsers();
        setApprovedUsers(approved);
    };

    const handleReject = async (uid: string) => {
        await rejectUser(uid);
        setPendingUsers(prev => prev.filter(u => u.uid !== uid));
    };

    const handleDeleteJob = async (jobId: string) => {
        await deleteJob(jobId);
        setActiveJobs(prev => prev.filter(j => j.id !== jobId));
        setDeleteJobConfirm(null);
    };

    const handleJobReview = async (jobId: string, action: 'approve' | 'reject') => {
        try {
            // Import dynamically to avoid circular dependency issues if any, though db functions are safe
            const { updateJob } = await import('../lib/db');

            if (action === 'approve') {
                await updateJob(jobId, { status: 'approved', isPublic: true });
                // Move from pending to active/approved list
                const job = pendingJobs.find(j => j.id === jobId);
                if (job) {
                    setPendingJobs(prev => prev.filter(j => j.id !== jobId));
                    setActiveJobs(prev => [...prev, { ...job, status: 'approved', isPublic: true }]);
                }
            } else {
                await updateJob(jobId, { status: 'rejected', isPublic: false });
                setPendingJobs(prev => prev.filter(j => j.id !== jobId));
            }
        } catch (error) {
            console.error('Error reviewing job:', error);
        }
    };

    const handleLogout = async () => {
        await logOut();
        router.push('/login');
    };

    if (loading || (!profile && user)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    const tabs = [
        { id: 'pending' as TabType, label: 'Pending Approvals', count: pendingUsers.length, color: 'amber' },
        { id: 'users' as TabType, label: 'Approved Users', count: approvedUsers.length, color: 'green' },
        { id: 'jobs' as TabType, label: 'Active Jobs', count: activeJobs.length, color: 'teal' },
        { id: 'reviews' as TabType, label: 'Job Reviews', count: pendingJobs.length, color: 'slate' },
        { id: 'ai' as TabType, label: 'AI Insights', count: null, color: 'teal' },
        { id: 'alerts' as TabType, label: 'Supply Alerts', count: null, color: 'red' },
    ];

    const handleAiAnalyze = async () => {
        if (!aiQuery.trim()) return;
        setAiLoading(true);
        setAiError('');
        setAiResponse('');
        try {
            const result = await analyzeLivelihood(aiQuery);
            setAiResponse(result);
        } catch (err) {
            setAiError(err instanceof Error ? err.message : 'Failed to analyze');
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="glass-card rounded-none border-x-0 border-t-0 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#1e3a5f' }}>
                            <span className="text-white font-bold">S</span>
                        </div>
                        <span className="text-xl font-bold text-emerald-500">SignalX Admin</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400 hidden md:block">{user?.email}</span>
                        <button onClick={handleLogout} className="btn-secondary py-2 px-4">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                        <p className="text-gray-400">Manage users and jobs</p>
                    </div>
                    <button
                        onClick={refreshData}
                        disabled={loadingData}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-50"
                        title="Refresh All"
                    >
                        <svg className={`w-5 h-5 ${loadingData ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'border text-white'
                                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                            style={activeTab === tab.id ? { background: 'rgba(30, 58, 95, 0.3)', borderColor: 'rgba(16, 185, 129, 0.4)' } : {}}
                        >
                            <span className={`w-2 h-2 rounded-full ${tab.color === 'amber' ? 'bg-amber-400' :
                                tab.color === 'green' ? 'bg-emerald-400' :
                                    tab.color === 'teal' ? 'bg-teal-400' :
                                        tab.color === 'red' ? 'bg-red-400' : 'bg-slate-400'
                                }`} />
                            {tab.label}
                            {tab.count !== null && (
                                <span className={`px-2 py-0.5 text-sm rounded-full ${tab.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                                    tab.color === 'green' ? 'bg-emerald-500/20 text-emerald-400' :
                                        tab.color === 'teal' ? 'bg-teal-500/20 text-teal-400' :
                                            tab.color === 'slate' ? 'bg-slate-500/20 text-slate-400' :
                                                tab.color === 'red' ? 'bg-red-500/20 text-red-400' : 'bg-teal-500/20 text-teal-400'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                            {tab.id === 'ai' && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-teal-500/20 text-teal-300">Groq</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="glass-card p-6">
                    {loadingData ? (
                        <div className="flex justify-center py-12">
                            <div className="spinner" />
                        </div>
                    ) : (
                        <>
                            {/* Pending Approvals Tab */}
                            {activeTab === 'pending' && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-6">Pending Approvals</h2>
                                    {pendingUsers.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400">
                                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p>No pending approvals</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {pendingUsers.map((pendingUser) => (
                                                <div key={pendingUser.uid} className="glass-card p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        {pendingUser.photoURL ? (
                                                            <img src={pendingUser.photoURL} alt="" className="w-12 h-12 rounded-full object-cover" />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#1e3a5f' }}>
                                                                <span className="text-lg font-bold text-white">
                                                                    {pendingUser.displayName?.[0]?.toUpperCase() || '?'}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-semibold">{pendingUser.displayName || 'No Name'}</div>
                                                            <div className="text-sm text-gray-400">{pendingUser.email}</div>
                                                            {pendingUser.company && (
                                                                <div className="text-xs text-teal-400">{pendingUser.company}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleApprove(pendingUser.uid)} className="btn-primary py-2 px-4 text-sm">
                                                            Approve
                                                        </button>
                                                        <button onClick={() => handleReject(pendingUser.uid)} className="btn-secondary py-2 px-4 text-sm text-red-400 border-red-500/30 hover:bg-red-500/10">
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Approved Users Tab */}
                            {activeTab === 'users' && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-6">Approved Users</h2>
                                    {approvedUsers.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400">
                                            <p>No approved users yet</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                            {approvedUsers.map((approvedUser) => (
                                                <div key={approvedUser.uid} className="glass-card p-4 flex items-center gap-4">
                                                    {approvedUser.photoURL ? (
                                                        <img src={approvedUser.photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#10b981' }}>
                                                            <span className="text-sm font-bold text-white">
                                                                {approvedUser.displayName?.[0]?.toUpperCase() || '?'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold truncate">{approvedUser.displayName || 'No Name'}</div>
                                                        <div className="text-sm text-gray-400 truncate">{approvedUser.email}</div>
                                                    </div>
                                                    <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 shrink-0">Active</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Active Jobs Tab */}
                            {activeTab === 'jobs' && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-6">Active Jobs</h2>
                                    {activeJobs.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400">
                                            <p>No active jobs</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {activeJobs.map((job) => (
                                                <div key={job.id} className="glass-card p-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                                <h3 className="font-semibold">{job.title}</h3>
                                                                {job.jobType && (
                                                                    <span className="px-2 py-0.5 text-xs rounded-full bg-teal-500/20 text-teal-400">
                                                                        {job.jobType}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Expandable Description */}
                                                            <div className="mb-2">
                                                                <p className={`text-sm text-gray-400 ${!expandedJobs.has(job.id!) ? 'line-clamp-2' : ''}`}>
                                                                    {job.description}
                                                                </p>
                                                                {job.description && job.description.length > 150 && (
                                                                    <button
                                                                        onClick={() => toggleJobExpand(job.id!)}
                                                                        className="mt-1 text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
                                                                    >
                                                                        {expandedJobs.has(job.id!) ? (
                                                                            <>
                                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                                                </svg>
                                                                                Show less
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                                </svg>
                                                                                Show more
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Expanded Details Panel */}
                                                            {expandedJobs.has(job.id!) && (
                                                                <div className="mb-3 p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                                                                    {job.requirements && (
                                                                        <div>
                                                                            <h4 className="text-xs font-semibold text-white mb-1">Requirements</h4>
                                                                            <p className="text-xs text-gray-400">{job.requirements}</p>
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <h4 className="text-xs font-semibold text-white mb-1">Posted By</h4>
                                                                        <p className="text-xs text-gray-400">User ID: {job.userId}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                                                                <span className="flex items-center gap-1">
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    </svg>
                                                                    {job.location}
                                                                </span>
                                                                {job.salary && <span>₹ {job.salary}</span>}
                                                            </div>
                                                            {job.skills && job.skills.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {job.skills.slice(0, 4).map(skill => (
                                                                        <span key={skill} className="px-2 py-0.5 text-xs rounded-full" style={{ background: 'rgba(30, 58, 95, 0.4)', color: '#94a3b8' }}>
                                                                            {skill}
                                                                        </span>
                                                                    ))}
                                                                    {job.skills.length > 4 && (
                                                                        <span className="text-xs text-gray-500">+{job.skills.length - 4}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="shrink-0">
                                                            {deleteJobConfirm === job.id ? (
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleDeleteJob(job.id!)}
                                                                        className="px-3 py-1 text-sm rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setDeleteJobConfirm(null)}
                                                                        className="px-3 py-1 text-sm rounded bg-white/10 text-gray-400 hover:text-white"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setDeleteJobConfirm(job.id!)}
                                                                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
                                                                    title="Delete Job"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Job Reviews Tab */}
                            {activeTab === 'reviews' && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-6">Pending Job Reviews</h2>
                                    {pendingJobs.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400">
                                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p>No jobs pending review</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {pendingJobs.map((job) => (
                                                <div key={job.id} className="glass-card p-6 border-l-4 border-l-slate-500">
                                                    <div className="flex items-start justify-between gap-6">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h3 className="text-lg font-bold">{job.title}</h3>
                                                                {job.jobType && (
                                                                    <span className="px-2 py-0.5 text-xs rounded-full bg-teal-500/20 text-teal-400">
                                                                        {job.jobType}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Expandable Description */}
                                                            <div className="mb-4">
                                                                <div className={`text-sm text-gray-300 bg-white/5 p-3 rounded-lg ${!expandedJobs.has(job.id!) ? 'line-clamp-3' : ''}`}>
                                                                    {job.description}
                                                                </div>
                                                                <button
                                                                    onClick={() => toggleJobExpand(job.id!)}
                                                                    className="mt-2 text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
                                                                >
                                                                    {expandedJobs.has(job.id!) ? (
                                                                        <>
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                                            </svg>
                                                                            Show less
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                            </svg>
                                                                            Show more
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>

                                                            {/* Expanded Details Panel */}
                                                            {expandedJobs.has(job.id!) && job.requirements && (
                                                                <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                                                                    <div>
                                                                        <h4 className="text-sm font-semibold text-white mb-2">Requirements</h4>
                                                                        <p className="text-sm text-gray-400">{job.requirements}</p>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-sm font-semibold text-white mb-2">Posted By</h4>
                                                                        <p className="text-sm text-gray-400">User ID: {job.userId}</p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-4">
                                                                <div className="flex items-center gap-2">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                    </svg>
                                                                    {job.location}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    {job.salary || 'Not specified'}
                                                                </div>
                                                            </div>

                                                            {/* User Info (Ideally fetch user details here but we can skip for now or show ID) */}
                                                            {/* <div className="text-xs text-gray-500">Posted by User ID: {job.userId}</div> */}
                                                        </div>

                                                        <div className="flex flex-col gap-2 shrink-0">
                                                            <button
                                                                onClick={() => job.id && handleJobReview(job.id, 'approve')}
                                                                className="btn-primary py-2 px-4 shadow-lg shadow-emerald-500/20"
                                                                style={{ background: '#10b981' }}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => job.id && handleJobReview(job.id, 'reject')}
                                                                className="btn-secondary py-2 px-4 text-red-400 border-red-500/30 hover:bg-red-500/10"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* AI Insights Tab */}
                            {activeTab === 'ai' && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold">AI Insights & Trends</h2>
                                        <span className="px-3 py-1 text-xs rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30">
                                            Powered by Groq Llama3
                                        </span>
                                    </div>

                                    {/* Stats Overview */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div className="text-xs text-gray-400 mb-1">Active Workers</div>
                                            <div className="text-xl font-bold text-green-400">{(westBengalStats.mgnrega.activeWorkers / 1000000).toFixed(1)}M</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div className="text-xs text-gray-400 mb-1">Migrant Est.</div>
                                            <div className="text-xl font-bold text-amber-400">{(westBengalStats.migration.estimatedMigrants / 10).toFixed(1)}M</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div className="text-xs text-gray-400 mb-1">High Risk Dists.</div>
                                            <div className="text-xl font-bold text-red-400">{westBengalStats.migration.highRiskDistricts.length}</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div className="text-xs text-gray-400 mb-1">Daily Avg Wage</div>
                                            <div className="text-xl font-bold text-teal-400">₹{westBengalStats.mgnrega.averageWage}</div>
                                        </div>
                                    </div>

                                    {/* Quick Info Grid */}
                                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">High Risk Blocks</h3>
                                            <div className="grid grid-cols-1 gap-2">
                                                {highRiskBlocks.slice(0, 3).map(item => (
                                                    <div key={item.district} className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                                                        <div className="text-xs font-semibold text-red-400 mb-1">{item.district}</div>
                                                        <div className="text-[10px] text-gray-500 truncate">
                                                            {item.blocks.join(', ')}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Migration Hotspots</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {westBengalStats.migration.topDestinations.map(dest => (
                                                    <span key={dest} className="px-3 py-1.5 text-xs rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                        {dest}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Query Box */}
                                    <div className="p-6 rounded-2xl border mb-6" style={{ background: 'rgba(13, 148, 136, 0.1)', borderColor: 'rgba(13, 148, 136, 0.3)' }}>
                                        <div className="flex gap-4">
                                            <input
                                                type="text"
                                                value={aiQuery}
                                                onChange={(e) => setAiQuery(e.target.value)}
                                                className="input flex-1 bg-black/20 border-white/10 focus:border-teal-500/50"
                                                placeholder="Ask about migration trends, livelihood gaps, or scheme impact..."
                                                onKeyDown={(e) => e.key === 'Enter' && handleAiAnalyze()}
                                            />
                                            <button
                                                onClick={handleAiAnalyze}
                                                disabled={aiLoading}
                                                className="btn-primary px-8"
                                            >
                                                {aiLoading ? <div className="spinner w-5 h-5" /> : 'Analyze'}
                                            </button>
                                        </div>
                                        {aiError && (
                                            <p className="text-red-400 text-sm mt-3 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {aiError}
                                            </p>
                                        )}
                                    </div>

                                    {/* Response Display */}
                                    {aiResponse && (
                                        <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex items-center gap-2 mb-4 text-emerald-400">
                                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                                <span className="text-sm font-semibold">SignalX Analysis Complete</span>
                                            </div>
                                            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-emerald-400 prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-teal-400 prose-strong:font-semibold prose-li:text-gray-300 prose-ul:my-2 prose-ol:my-2">
                                                <ReactMarkdown>{aiResponse}</ReactMarkdown>
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Queries */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-gray-400">Suggested Inquiries</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                'Analyze migration patterns in Purulia vs Bankura',
                                                'Impact of seasonal migration on Sundarbans economy',
                                                'Effectiveness of MGNREGA in reducing distress migration',
                                                'Skill gaps in high-risk migration blocks',
                                                'Alternative livelihood opportunities in Murshidabad'
                                            ].map((preset) => (
                                                <button
                                                    key={preset}
                                                    onClick={() => {
                                                        setAiQuery(preset);
                                                        // Auto-trigger analysis for quick queries? 
                                                        // Let's just set the query for now as per dashboard behavior
                                                    }}
                                                    className="px-4 py-2 text-xs rounded-xl bg-white/5 border border-white/10 hover:border-teal-500/50 hover:bg-white/10 transition-all text-gray-400 hover:text-white"
                                                >
                                                    {preset}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Supply-Demand Alerts Tab */}
                            {activeTab === 'alerts' && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold">Supply-Demand Alerts</h2>
                                        <button
                                            onClick={async () => {
                                                setAlertsLoading(true);
                                                setAlertResults([]);
                                                const districts = ['Kolkata', 'Purulia', 'Bankura', 'Murshidabad', 'Malda', 'South 24 Parganas', 'North 24 Parganas'];
                                                const validReports = [];

                                                for (const district of districts) {
                                                    try {
                                                        // Call with dryRun: true to get data without sending individual email
                                                        const res = await fetch('/api/admin/check-supply-demand', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ districtName: district, dryRun: true }),
                                                        });
                                                        const responseData = await res.json();

                                                        if (responseData.success && responseData.data) {
                                                            const report = responseData.data;
                                                            setAlertResults(prev => [...prev, { district, ...report }]);

                                                            // Collect for bulk email if risk is medium+ or critical (or send all for complete report)
                                                            // Sending all for the summary report
                                                            validReports.push(report);
                                                        }
                                                    } catch (error) {
                                                        console.error(`Failed to check ${district}`, error);
                                                        setAlertResults(prev => [...prev, { district, error: true }]);
                                                    }
                                                }

                                                // Send single bulk email if we have reports
                                                if (validReports.length > 0) {
                                                    try {
                                                        await fetch('/api/admin/send-bulk-alert', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ reports: validReports }),
                                                        });
                                                        // Show custom success toast instead of browser alert
                                                        const toast = document.createElement('div');
                                                        toast.className = 'fixed bottom-5 right-5 bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl z-50 flex items-center animate-bounce';
                                                        toast.innerHTML = `
                                                            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                                            <div>
                                                                <h4 class="font-bold">Analysis Complete! 🚀</h4>
                                                                <p class="text-sm">Sent 1 summary email for ${validReports.length} districts.</p>
                                                            </div>
                                                        `;
                                                        document.body.appendChild(toast);
                                                        setTimeout(() => {
                                                            toast.style.opacity = '0';
                                                            toast.style.transition = 'opacity 0.5s';
                                                            setTimeout(() => document.body.removeChild(toast), 500);
                                                        }, 5000);

                                                    } catch (e) {
                                                        console.error('Failed to send bulk email', e);
                                                        alert('Analysis complete, but failed to send summary email.');
                                                    }
                                                }

                                                setAlertsLoading(false);
                                            }}
                                            disabled={alertsLoading}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {alertsLoading ? 'Analyzing...' : '🚨 Check All Districts'}
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {alertsLoading && (
                                            <div className="text-center py-12">
                                                <div className="spinner mx-auto mb-4" />
                                                <p className="text-gray-400">Analyzing supply-demand ratios...</p>
                                            </div>
                                        )}

                                        {alertResults.length > 0 && (
                                            <div className="grid gap-4">
                                                {alertResults.map((result, idx) => (
                                                    <div key={idx} className={`glass-card p-4 border-l-4 ${result.error ? 'border-gray-500' :
                                                        result.riskLevel === 'critical' ? 'border-red-500' :
                                                            result.riskLevel === 'high' ? 'border-orange-500' :
                                                                result.riskLevel === 'medium' ? 'border-yellow-500' :
                                                                    'border-green-500'
                                                        }`}>
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h3 className="font-semibold text-lg">{result.district}</h3>
                                                                {result.error ? (
                                                                    <p className="text-gray-400 text-sm">Error checking district</p>
                                                                ) : (
                                                                    <>
                                                                        <p className={`text-sm font-medium ${result.riskLevel === 'critical' ? 'text-red-400' :
                                                                            result.riskLevel === 'high' ? 'text-orange-400' :
                                                                                result.riskLevel === 'medium' ? 'text-yellow-400' :
                                                                                    'text-green-400'
                                                                            }`}>
                                                                            {result.riskLevel?.toUpperCase() || 'LOW'} RISK - Ratio: {result.ratio || 'N/A'}
                                                                        </p>
                                                                        <p className="text-gray-400 text-xs mt-1">
                                                                            {result.message || result.success ? '✅ Alert sent to admin' : 'ℹ️ No alert needed'}
                                                                        </p>
                                                                    </>
                                                                )}
                                                            </div>
                                                            {!result.error && result.riskLevel && ['critical', 'high', 'medium'].includes(result.riskLevel) && (
                                                                <div className="text-right">
                                                                    <span className="text-2xl">
                                                                        {result.riskLevel === 'critical' ? '🚨' : result.riskLevel === 'high' ? '⚠️' : '⚡'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {!alertsLoading && alertResults.length === 0 && (
                                            <div className="text-center py-12 text-gray-400">
                                                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <p>Click "Check All Districts" to monitor supply-demand ratios</p>
                                                <p className="text-sm mt-2">System will automatically send email alerts for high-risk areas</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main >
        </div >
    );
}
