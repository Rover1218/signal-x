'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { updateUserProfile } from '../../lib/db';

export default function ProfilePage() {
    const { user, profile, refreshProfile } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [company, setCompany] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [uploadError, setUploadError] = useState('');

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.displayName || '');
            setCompany(profile.company || '');
            setPhone(profile.phone || '');
            setLocation(profile.location || '');
            setBio(profile.bio || '');
            setPhotoURL(profile.photoURL || '');
        }
    }, [profile]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setSuccess(false);

        try {
            await updateUserProfile(user.uid, {
                displayName,
                company,
                phone,
                location,
                bio,
                photoURL
            });
            await refreshProfile();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl">
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-2">Profile</h1>
                <p className="text-gray-400">Manage your account information</p>
            </div>

            <div className="glass-card p-8">
                {success && (
                    <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Profile updated successfully!
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Profile Photo */}
                    <div className="flex items-center gap-6 mb-8">
                        {photoURL ? (
                            <img src={photoURL} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-purple-500/30" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                                <span className="text-3xl font-bold text-white">
                                    {displayName ? displayName[0].toUpperCase() : '?'}
                                </span>
                            </div>
                        )}
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setUploadError('');

                                    const cloudinaryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL || '';
                                    const match = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@(.+)/);
                                    if (!match) {
                                        setUploadError('Cloudinary not configured');
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
                                        setUploadError('Failed to upload image');
                                    }
                                }}
                                className="hidden"
                                id="profile-photo-upload"
                            />
                            <label htmlFor="profile-photo-upload" className="btn-secondary text-sm py-2 px-4 cursor-pointer">
                                Change Photo
                            </label>
                            {uploadError && <p className="text-red-400 text-xs mt-2">{uploadError}</p>}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input
                                type="email"
                                value={profile?.email || ''}
                                className="input opacity-60"
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                            <input
                                type="text"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="input"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="input min-h-[120px] resize-none"
                        />
                    </div>

                    <button type="submit" disabled={saving} className="btn-primary">
                        {saving ? <div className="spinner w-5 h-5" /> : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}
