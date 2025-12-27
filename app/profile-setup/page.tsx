'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { updateUserProfile } from '../lib/db';

export default function ProfileSetupPage() {
    const { user, profile, loading, refreshProfile } = useAuth();
    const router = useRouter();
    const [displayName, setDisplayName] = useState('');
    const [company, setCompany] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        if (profile) {
            setDisplayName(profile.displayName || '');
            setCompany(profile.company || '');
            setPhone(profile.phone || '');
            setLocation(profile.location || '');
            setBio(profile.bio || '');
            setPhotoURL(profile.photoURL || '');

            // If already approved, go to dashboard
            if (profile.status === 'approved') {
                router.push('/dashboard');
            }
        }
    }, [user, profile, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setError('');

        try {
            await updateUserProfile(user.uid, {
                displayName,
                company,
                phone,
                location,
                bio,
                photoURL,
                status: 'pending'
            });
            await refreshProfile();
            router.push('/pending');
        } catch (err) {
            setError('Failed to save profile. Please try again.');
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
            </div>

            <div className="max-w-2xl mx-auto relative z-10">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold mb-4">
                        <span className="gradient-text">Complete Your Profile</span>
                    </h1>
                    <p className="text-gray-400">Tell us about yourself to get started</p>
                </div>

                <div className="glass-card p-8">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Photo */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative mb-4">
                                {photoURL ? (
                                    <img src={photoURL} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-purple-500/30" />
                                ) : (
                                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                                        <span className="text-4xl font-bold text-white">
                                            {displayName ? displayName[0].toUpperCase() : '?'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    const cloudinaryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL || '';
                                    const match = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
                                    if (!match) {
                                        setError('Cloudinary not configured');
                                        return;
                                    }
                                    const cloudName = match[3];

                                    const formData = new FormData();
                                    formData.append('file', file);
                                    formData.append('upload_preset', 'signalx_preset');

                                    try {
                                        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                                            method: 'POST',
                                            body: formData
                                        });
                                        const data = await res.json();
                                        if (data.secure_url) {
                                            setPhotoURL(data.secure_url);
                                        }
                                    } catch (err) {
                                        setError('Failed to upload image');
                                    }
                                }}
                                className="hidden"
                                id="photo-upload"
                            />
                            <label htmlFor="photo-upload" className="btn-secondary text-sm py-2 px-4 cursor-pointer">
                                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Upload Photo
                            </label>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="input"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Company/Organization</label>
                                <input
                                    type="text"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    className="input"
                                    placeholder="Your organization"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="input"
                                    placeholder="+91 1234567890"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="input"
                                    placeholder="Kolkata, West Bengal"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">About You</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="input min-h-[120px] resize-none"
                                placeholder="Tell us about your work and how you plan to use SignalX..."
                            />
                        </div>

                        <button type="submit" disabled={saving} className="btn-primary w-full justify-center text-lg py-4">
                            {saving ? (
                                <div className="spinner w-5 h-5" />
                            ) : (
                                <>
                                    Submit for Approval
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
