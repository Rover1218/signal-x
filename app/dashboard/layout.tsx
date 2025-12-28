'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { logOut } from '../lib/firebase';
import Link from 'next/link';
import { DashboardLangContext, dashboardTranslations } from './DashboardLangContext';
import { getLocalizedName } from '../lib/transliterate';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [lang, setLang] = useState<'en' | 'bn'>('en');
    const t = dashboardTranslations[lang];

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        if (!loading && profile) {
            if (profile.status !== 'approved') {
                router.push('/pending');
            }
        }
    }, [user, profile, loading, router]);

    const handleLogout = async () => {
        await logOut();
        router.push('/');
    };

    if (loading || !profile || profile.status !== 'approved') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner" />
            </div>
        );
    }

    const navItems = [
        { href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: t.overview },
        { href: '/dashboard/jobs', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: t.jobs },
        { href: '/dashboard/ai-insights', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', label: t.aiInsights },
        { href: '/dashboard/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: t.profile },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className={`sidebar w-64 min-h-screen p-6 ${sidebarOpen ? '' : 'hidden'}`}>
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#1e3a5f' }}>
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <span className="text-xl font-bold text-emerald-500">SignalX</span>
                </div>

                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto pt-10">
                    <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:bg-red-500/10">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {t.logout}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
                {/* Header */}
                <header className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-4">
                        {/* Language Toggle */}
                        <button
                            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105"
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
                        <div className="text-right">
                            <div className="font-medium">{getLocalizedName(profile.displayName || '', lang)}</div>
                            <div className="text-sm text-gray-400">{profile.company || profile.email}</div>
                        </div>
                        {profile.photoURL ? (
                            <img src={profile.photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#1e3a5f' }}>
                                <span className="font-bold text-white">{profile.displayName?.[0]?.toUpperCase()}</span>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8">
                    <DashboardLangContext.Provider value={{ lang, setLang, t }}>
                        {children}
                    </DashboardLangContext.Provider>
                </main>
            </div>
        </div>
    );
}
