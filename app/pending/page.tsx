'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import Link from 'next/link';
import { logOut } from '../lib/firebase';

export default function PendingPage() {
    const { user, profile, loading, refreshProfile } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        if (profile?.status === 'approved') {
            router.push('/dashboard');
        }
        if (profile?.role === 'admin') {
            router.push('/admin');
        }
    }, [user, profile, loading, router]);

    // Poll for approval status
    useEffect(() => {
        const interval = setInterval(() => {
            refreshProfile();
        }, 10000); // Check every 10 seconds

        return () => clearInterval(interval);
    }, [refreshProfile]);

    const handleLogout = async () => {
        await logOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-float" style={{ background: 'rgba(30, 58, 95, 0.25)' }} />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
            </div>

            <div className="glass-card p-10 max-w-lg text-center relative z-10">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow" style={{ background: '#f59e0b', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)' }}>
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold mb-4">
                    <span className="text-amber-500">Pending Approval</span>
                </h1>

                <p className="text-gray-400 mb-8 leading-relaxed">
                    Your profile has been submitted for review. Our team will verify your information
                    and approve your account shortly. You'll be automatically redirected once approved.
                </p>

                <div className="glass-card p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-400">Status</span>
                        <span className="flex items-center gap-2 text-amber-400">
                            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                            Pending Review
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-400">Email</span>
                        <span className="text-white">{profile?.email}</span>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button onClick={handleLogout} className="btn-secondary px-12 text-red-400 border-red-500/30 hover:bg-red-500/10">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
