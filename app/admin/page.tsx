'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../components/AuthProvider';
import { getPendingUsers, getApprovedUsers, getAllJobs, approveUser, rejectUser, deleteJob, UserProfile, Job } from '../lib/db';
import { logOut } from '../lib/firebase';
import { analyzeLivelihood } from '../lib/gemini';
import { westBengalStats, highRiskBlocks } from '../lib/wb-stats';

type TabType = 'pending' | 'users' | 'jobs' | 'ai';

export default function AdminPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
    const [approvedUsers, setApprovedUsers] = useState<UserProfile[]>([]);
    const [activeJobs, setActiveJobs] = useState<Job[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [deleteJobConfirm, setDeleteJobConfirm] = useState<string | null>(null);
    // AI State
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');

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
            setActiveJobs(jobs.filter(j => j.isPublic));
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
        { id: 'jobs' as TabType, label: 'Active Jobs', count: activeJobs.length, color: 'cyan' },
        { id: 'ai' as TabType, label: 'AI Insights', count: null, color: 'purple' },
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
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold">S</span>
                        </div>
                        <span className="text-xl font-bold gradient-text">SignalX Admin</span>
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
                                ? 'bg-gradient-to-r from-purple-600/20 to-cyan-500/20 border border-purple-500/30 text-white'
                                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${tab.color === 'amber' ? 'bg-amber-400' :
                                tab.color === 'green' ? 'bg-green-400' :
                                    tab.color === 'purple' ? 'bg-purple-400' : 'bg-cyan-400'
                                }`} />
                            {tab.label}
                            {tab.count !== null && (
                                <span className={`px-2 py-0.5 text-sm rounded-full ${tab.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                                    tab.color === 'green' ? 'bg-green-500/20 text-green-400' :
                                        tab.color === 'purple' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                            {tab.id === 'ai' && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300">Groq</span>
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
                                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                                                                <span className="text-lg font-bold text-white">
                                                                    {pendingUser.displayName?.[0]?.toUpperCase() || '?'}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-semibold">{pendingUser.displayName || 'No Name'}</div>
                                                            <div className="text-sm text-gray-400">{pendingUser.email}</div>
                                                            {pendingUser.company && (
                                                                <div className="text-xs text-cyan-400">{pendingUser.company}</div>
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
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-cyan-500 flex items-center justify-center">
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
                                                                    <span className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/20 text-cyan-400">
                                                                        {job.jobType}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-400 mb-2 line-clamp-2">{job.description}</p>
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
                                                                        <span key={skill} className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400">
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

                            {/* AI Insights Tab */}
                            {activeTab === 'ai' && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold">AI Insights & Trends</h2>
                                        <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
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
                                            <div className="text-xl font-bold text-cyan-400">₹{westBengalStats.mgnrega.averageWage}</div>
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
                                    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-600/10 to-cyan-500/10 border border-purple-500/20 mb-6">
                                        <div className="flex gap-4">
                                            <input
                                                type="text"
                                                value={aiQuery}
                                                onChange={(e) => setAiQuery(e.target.value)}
                                                className="input flex-1 bg-black/20 border-white/10 focus:border-purple-500/50"
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
                                        <div className="glass-card p-6 border-green-500/20 bg-green-500/5 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex items-center gap-2 mb-4 text-green-400">
                                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                                <span className="text-sm font-semibold">SignalX Analysis Complete</span>
                                            </div>
                                            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-purple-400 prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-cyan-400 prose-strong:font-semibold prose-li:text-gray-300 prose-ul:my-2 prose-ol:my-2">
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
                                                    className="px-4 py-2 text-xs rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all text-gray-400 hover:text-white"
                                                >
                                                    {preset}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
