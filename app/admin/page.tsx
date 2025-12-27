'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { getPendingUsers, approveUser, rejectUser, UserProfile } from '../lib/db';
import { logOut } from '../lib/firebase';
import Link from 'next/link';

export default function AdminPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        if (!loading && profile && profile.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [user, profile, loading, router]);

    useEffect(() => {
        const fetchPendingUsers = async () => {
            try {
                const users = await getPendingUsers();
                setPendingUsers(users);
            } catch (error) {
                console.error('Error fetching pending users:', error);
            } finally {
                setLoadingUsers(false);
            }
        };

        if (profile?.role === 'admin') {
            fetchPendingUsers();
        }
    }, [profile]);

    const handleApprove = async (uid: string) => {
        await approveUser(uid);
        setPendingUsers(prev => prev.filter(u => u.uid !== uid));
    };

    const handleReject = async (uid: string) => {
        await rejectUser(uid);
        setPendingUsers(prev => prev.filter(u => u.uid !== uid));
    };

    const handleLogout = async () => {
        await logOut();
        router.push('/');
    };

    if (loading || profile?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b border-white/10 px-8 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <span className="text-2xl font-bold gradient-text">SignalX Admin</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">{profile?.email}</span>
                        <button onClick={handleLogout} className="btn-secondary py-2 px-4 text-sm">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-8 py-12">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-gray-400">Manage user approvals and platform settings</p>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    <div className="stat-card">
                        <div className="text-3xl font-bold gradient-text mb-1">{pendingUsers.length}</div>
                        <div className="text-gray-400">Pending Approvals</div>
                    </div>
                    <div className="stat-card">
                        <div className="text-3xl font-bold text-green-400 mb-1">-</div>
                        <div className="text-gray-400">Approved Users</div>
                    </div>
                    <div className="stat-card">
                        <div className="text-3xl font-bold text-cyan-400 mb-1">-</div>
                        <div className="text-gray-400">Active Jobs</div>
                    </div>
                    <div className="stat-card">
                        <div className="text-3xl font-bold text-amber-400 mb-1">AI</div>
                        <div className="text-gray-400">Gemini Status</div>
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className="glass-card p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                        <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                        Pending Approvals
                    </h2>

                    {loadingUsers ? (
                        <div className="flex justify-center py-12">
                            <div className="spinner" />
                        </div>
                    ) : pendingUsers.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>No pending approvals</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingUsers.map((pendingUser) => (
                                <div key={pendingUser.uid} className="glass-card p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {pendingUser.photoURL ? (
                                            <img src={pendingUser.photoURL} alt="" className="w-14 h-14 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                                                <span className="text-xl font-bold text-white">
                                                    {pendingUser.displayName?.[0]?.toUpperCase() || '?'}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-semibold text-lg">{pendingUser.displayName || 'No Name'}</div>
                                            <div className="text-gray-400">{pendingUser.email}</div>
                                            {pendingUser.company && (
                                                <div className="text-sm text-cyan-400">{pendingUser.company}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApprove(pendingUser.uid)}
                                            className="btn-primary py-2 px-6"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(pendingUser.uid)}
                                            className="btn-secondary py-2 px-6 text-red-400 border-red-500/30 hover:bg-red-500/10"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
