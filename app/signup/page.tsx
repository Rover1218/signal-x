'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUpWithEmail, signInWithGoogle } from '../lib/firebase';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        if (!agreedToTerms) {
            setError('Please agree to the terms and conditions');
            return;
        }
        setLoading(true);
        setError('');
        const { user, error } = await signInWithGoogle();
        if (error) {
            setError(error);
            setLoading(false);
        } else if (user) {
            router.push('/profile-setup');
        }
    };

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreedToTerms) {
            setError('Please agree to the terms and conditions');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');
        const { user, error } = await signUpWithEmail(email, password);
        if (error) {
            setError(error);
            setLoading(false);
        } else if (user) {
            router.push('/profile-setup');
        }
    };

    const passwordStrength = () => {
        if (password.length === 0) return { label: '', color: '' };
        if (password.length < 6) return { label: 'Weak', color: 'text-red-500' };
        if (password.length < 10) return { label: 'Medium', color: 'text-yellow-500' };
        return { label: 'Strong', color: 'text-green-500' };
    };

    const strength = passwordStrength();

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8">
            {/* Enhanced Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20" />
                <div className="absolute top-20 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-600/10 to-purple-600/10 rounded-full blur-3xl" />
            </div>

            <div className="glass-card p-8 sm:p-10 md:p-12 w-full max-w-md lg:max-w-lg relative z-10 backdrop-blur-xl">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 justify-center mb-8 sm:mb-10 group">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:shadow-purple-500/70 transition-all group-hover:scale-110">
                        <span className="text-white font-bold text-2xl sm:text-3xl">S</span>
                    </div>
                    <span className="text-3xl sm:text-4xl font-bold gradient-text">SignalX</span>
                </Link>

                <div className="text-center mb-8 sm:mb-10">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">Create Account</h1>
                    <p className="text-gray-400 text-sm sm:text-base">Join SignalX and make an impact in West Bengal</p>
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
                    {loading ? 'Creating account...' : 'Continue with Google'}
                </button>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <span className="text-gray-500 text-sm font-medium">or</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailSignUp} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2.5">Email Address</label>
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
                            <label className="block text-sm font-semibold text-gray-300">Password</label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                {showPassword ? 'Hide' : 'Show'}
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
                        {password && (
                            <p className={`text-xs mt-2 ${strength.color} font-medium`}>
                                Strength: {strength.label}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2.5">Confirm Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input text-base"
                            placeholder="••••••••"
                            required
                            disabled={loading}
                        />
                        {confirmPassword && password !== confirmPassword && (
                            <p className="text-xs mt-2 text-red-500 font-medium">
                                Passwords don't match
                            </p>
                        )}
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start gap-3 pt-2">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-2 cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-xs sm:text-sm text-gray-400 cursor-pointer">
                            I agree to the{' '}
                            <a href="#" className="text-purple-400 hover:text-purple-300 underline">Terms of Service</a>
                            {' '}and{' '}
                            <a href="#" className="text-purple-400 hover:text-purple-300 underline">Privacy Policy</a>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !agreedToTerms}
                        className="btn-primary w-full justify-center mt-7 py-4 text-base font-semibold hover:scale-105 transition-all shadow-xl shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="spinner w-5 h-5" />
                                <span>Creating account...</span>
                            </div>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-400 mt-8 text-sm sm:text-base">
                    Already have an account?{' '}
                    <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors underline decoration-purple-400/30 hover:decoration-purple-300">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
