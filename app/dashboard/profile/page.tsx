'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { updateUserProfile } from '../../lib/db';
import { useDashboardLang } from '../DashboardLangContext';

// Page-specific translations
const pageTranslations = {
    en: {
        profile: 'Profile',
        manageAccount: 'Manage your account information',
        profileUpdated: 'Profile updated successfully!',
        changePhoto: 'Change Photo',
        fullName: 'Full Name',
        email: 'Email',
        company: 'Company',
        phone: 'Phone',
        location: 'Location',
        bio: 'Bio',
        saveChanges: 'Save Changes',
        cloudinaryNotConfigured: 'Cloudinary not configured',
        failedToUpload: 'Failed to upload image',
    },
    bn: {
        profile: 'প্রোফাইল',
        manageAccount: 'আপনার অ্যাকাউন্ট তথ্য পরিচালনা করুন',
        profileUpdated: 'প্রোফাইল সফলভাবে আপডেট হয়েছে!',
        changePhoto: 'ছবি পরিবর্তন করুন',
        fullName: 'পুরো নাম',
        email: 'ইমেইল',
        company: 'কোম্পানি',
        phone: 'ফোন',
        location: 'অবস্থান',
        bio: 'জীবনী',
        saveChanges: 'পরিবর্তন সংরক্ষণ করুন',
        cloudinaryNotConfigured: 'Cloudinary কনফিগার করা হয়নি',
        failedToUpload: 'ছবি আপলোড করতে ব্যর্থ',
    }
};

export default function ProfilePage() {
    const { lang } = useDashboardLang();
    const t = pageTranslations[lang];
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
                <h1 className="text-3xl font-bold mb-2">{t.profile}</h1>
                <p className="text-gray-400">{t.manageAccount}</p>
            </div>

            <div className="glass-card p-8">
                {success && (
                    <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {t.profileUpdated}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Profile Photo */}
                    <div className="flex items-center gap-6 mb-8">
                        {photoURL ? (
                            <img src={photoURL} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/30" />
                        ) : (
                            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: '#1e3a5f' }}>
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
                                        setUploadError(t.cloudinaryNotConfigured);
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
                                        setUploadError(t.failedToUpload);
                                    }
                                }}
                                className="hidden"
                                id="profile-photo-upload"
                            />
                            <label htmlFor="profile-photo-upload" className="btn-secondary text-sm py-2 px-4 cursor-pointer">
                                {t.changePhoto}
                            </label>
                            {uploadError && <p className="text-red-400 text-xs mt-2">{uploadError}</p>}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t.fullName}</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t.email}</label>
                            <input
                                type="email"
                                value={profile?.email || ''}
                                className="input opacity-60"
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t.company}</label>
                            <input
                                type="text"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{t.phone}</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="input"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t.location}</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t.bio}</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="input min-h-[120px] resize-none"
                        />
                    </div>

                    <button type="submit" disabled={saving} className="btn-primary">
                        {saving ? <div className="spinner w-5 h-5" /> : t.saveChanges}
                    </button>
                </form>
            </div>
        </div>
    );
}
