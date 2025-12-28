'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithGoogle, signInWithEmail } from '../lib/firebase';
import { useAuth } from '../components/AuthProvider';

// Translations
const translations = {
    en: {
        welcomeBack: 'Welcome Back',
        signInSubtitle: 'Sign in to access your dashboard and opportunities',
        continueWithGoogle: 'Continue with Google',
        signingIn: 'Signing in...',
        or: 'or',
        emailAddress: 'Email Address',
        password: 'Password',
        show: 'Show',
        hide: 'Hide',
        signIn: 'Sign In',
        noAccount: "Don't have an account?",
        createNow: 'Create one now',
    },
    bn: {
        welcomeBack: 'স্বাগতম',
        signInSubtitle: 'আপনার ড্যাশবোর্ড এবং সুযোগগুলি পেতে সাইন ইন করুন',
        continueWithGoogle: 'Google দিয়ে চালিয়ে যান',
        signingIn: 'সাইন ইন হচ্ছে...',
        or: 'অথবা',
        emailAddress: 'ইমেইল ঠিকানা',
        password: 'পাসওয়ার্ড',
        show: 'দেখান',
        hide: 'লুকান',
        signIn: 'সাইন ইন',
        noAccount: 'অ্যাকাউন্ট নেই?',
        createNow: 'এখনই তৈরি করুন',
    }
};

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [lang, setLang] = useState<'en' | 'bn'>('en');
    const router = useRouter();
    const { profile } = useAuth();

    const t = translations[lang];

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        const { user, error } = await signInWithGoogle();
        if (error) {
            setError(error);
            setLoading(false);
        } else if (user) {
            router.push('/redirect'); // Go to branded loading page
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
            router.push('/redirect'); // Go to branded loading page
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8">
            {/* Enhanced Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'rgba(30, 58, 95, 0.1)' }} />
                <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-float" style={{ background: 'rgba(30, 58, 95, 0.25)' }} />
                <div className="absolute bottom-20 right-20 w-[500px] h-[500px] rounded-full blur-3xl animate-float" style={{ background: 'rgba(13, 148, 136, 0.15)', animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: 'rgba(16, 185, 129, 0.08)' }} />
            </div>

            {/* Language Toggle - Top Right */}
            <button
                onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                className="absolute top-4 right-4 z-20 flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105"
                style={{
                    background: 'rgba(30, 58, 95, 0.3)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(30, 58, 95, 0.4)',
                    boxShadow: '0 4px 16px rgba(30, 58, 95, 0.15)',
                }}
            >
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span className="text-white">{lang === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            <div className="glass-card p-8 sm:p-10 md:p-12 w-full max-w-md lg:max-w-lg relative z-10 backdrop-blur-xl">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 justify-center mb-8 sm:mb-10 group">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all" style={{ background: '#1e3a5f', boxShadow: '0 8px 24px rgba(30, 58, 95, 0.5)' }}>
                        <span className="text-white font-bold text-2xl sm:text-3xl">S</span>
                    </div>
                    <span className="text-3xl sm:text-4xl font-bold text-emerald-500">SignalX</span>
                </Link>

                <div className="text-center mb-8 sm:mb-10">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">{t.welcomeBack}</h1>
                    <p className="text-gray-400 text-sm sm:text-base">{t.signInSubtitle}</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-3">
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* Google Sign In */}
                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="btn-google w-full justify-center mb-6 hover:scale-105 transition-all"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {loading ? t.signingIn : t.continueWithGoogle}
                </button>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <span className="text-gray-500 text-sm font-medium">{t.or}</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailSignIn} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2.5">{t.emailAddress}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input text-base"
                            placeholder="you@example.com"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2.5">
                            <label className="block text-sm font-semibold text-gray-300">{t.password}</label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
                            >
                                {showPassword ? t.hide : t.show}
                            </button>
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input text-base"
                            placeholder="••••••••"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full justify-center mt-7 py-4 text-base font-semibold hover:scale-105 transition-all shadow-xl"
                        style={{ boxShadow: '0 8px 24px rgba(30, 58, 95, 0.4)' }}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="spinner w-5 h-5" />
                                <span>{t.signingIn}</span>
                            </div>
                        ) : (
                            t.signIn
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-400 mt-8 text-sm sm:text-base">
                    {t.noAccount}{' '}
                    <Link href="/signup" className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors underline decoration-emerald-500/30 hover:decoration-emerald-400">
                        {t.createNow}
                    </Link>
                </p>
            </div>
        </div>
    );
}
