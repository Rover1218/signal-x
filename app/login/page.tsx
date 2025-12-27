'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithGoogle, signInWithEmail } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { profile } = useAuth();

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        const { user, error } = await signInWithGoogle();
        if (error) {
            setError(error);
            setLoading(false);
        } else if (user) {
            // AuthProvider will handle redirect
            router.push('/profile-setup');
        }
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const { user, error } = await signInWithEmail(email, password);
        if (error) {
            setError(error);
            setLoading(false);
        } else if (user) {
            router.push('/profile-setup');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
            </div>

            <div className="glass-card p-10 md:p-12 w-full max-w-lg relative z-10">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 justify-center mb-10">
                    <div className="w-14 h-14 from-purple-600 to-cyan-500 rounded-xl flex items-center justify-center animate-pulse-glow">
                        <span className="text-white font-bold text-2xl">S</span>
                    </div>
                    <span className="text-3xl md:text-4xl font-bold gradient-text">SignalX</span>
                </Link>

                <h1 className="text-2xl md:text-3xl font-bold text-center mb-3 text-white">Welcome Back</h1>
                <p className="text-gray-400 text-center mb-10 text-base">Sign in to continue to your dashboard</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                {/* Google Sign In */}
                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="btn-google w-full justify-center mb-6"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-white/10"></div>
                    <span className="text-gray-500 text-sm">or</span>
                    <div className="flex-1 h-px bg-white/10"></div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailSignIn} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2.5">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input text-base"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input text-base"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-7 py-4 text-base font-semibold">
                        {loading ? <div className="spinner w-5 h-5" /> : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-gray-400 mt-8 text-base">
                    Don't have an account?{' '}
                    <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
