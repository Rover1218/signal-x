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
                <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'rgba(30, 58, 95, 0.1)' }} />
                <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-float" style={{ background: 'rgba(30, 58, 95, 0.25)' }} />
                <div className="absolute bottom-20 right-20 w-[500px] h-[500px] rounded-full blur-3xl animate-float" style={{ background: 'rgba(13, 148, 136, 0.15)', animationDelay: '1s' }} />
            </div>

            <div className="text-center relative z-10">
                {/* Logo */}
                <div className="flex items-center gap-4 justify-center mb-8">
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse-glow" style={{ background: '#1e3a5f', boxShadow: '0 12px 40px rgba(30, 58, 95, 0.5)' }}>
                        <span className="text-white font-bold text-4xl">S</span>
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-emerald-500 mb-4">SignalX</h1>

                {/* Custom Loader */}
                <div className="flex justify-center mb-6">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full animate-bounce" style={{ background: '#1e3a5f', animationDelay: '0ms' }} />
                        <div className="w-3 h-3 rounded-full animate-bounce" style={{ background: '#0d9488', animationDelay: '150ms' }} />
                        <div className="w-3 h-3 rounded-full animate-bounce" style={{ background: '#10b981', animationDelay: '300ms' }} />
                        <div className="w-3 h-3 rounded-full animate-bounce" style={{ background: '#0d9488', animationDelay: '450ms' }} />
                    </div>
                </div>

                <p className="text-gray-400 text-lg animate-pulse">{message}</p>
            </div>
        </div>
    );
}
