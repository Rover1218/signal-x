'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';

export default function RedirectPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const [message, setMessage] = useState('Signing you in...');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        if (!loading && profile) {
            // Show appropriate message based on role
            if (profile.role === 'admin') {
                setMessage('Welcome Admin! Preparing dashboard...');
            } else if (profile.status === 'approved') {
                setMessage('Welcome back! Loading your dashboard...');
            } else if (profile.status === 'pending') {
                setMessage('Your account is pending approval...');
            } else {
                setMessage('Setting up your profile...');
            }

            // Redirect after a brief delay for smooth transition
            const timer = setTimeout(() => {
                if (profile.role === 'admin') {
                    router.push('/admin');
                } else if (profile.status === 'approved') {
                    router.push('/dashboard');
                } else if (profile.status === 'pending') {
                    router.push('/pending');
                } else {
                    router.push('/profile-setup');
                }
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [user, profile, loading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/30 via-transparent to-cyan-900/30" />
                <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
            </div>

            <div className="text-center relative z-10">
                {/* Logo */}
                <div className="flex items-center gap-4 justify-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-pulse-glow">
                        <span className="text-white font-bold text-4xl">S</span>
                    </div>
                </div>

                <h1 className="text-4xl font-bold gradient-text mb-4">SignalX</h1>

                {/* Custom Loader */}
                <div className="flex justify-center mb-6">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                    </div>
                </div>

                <p className="text-gray-400 text-lg animate-pulse">{message}</p>
            </div>
        </div>
    );
}
