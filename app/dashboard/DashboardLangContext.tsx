'use client';

import { createContext, useContext } from 'react';

// Translations for dashboard
export const dashboardTranslations = {
    en: {
        overview: 'Overview',
        jobs: 'Jobs',
        aiInsights: 'AI Insights',
        profile: 'Profile',
        logout: 'Logout',
    },
    bn: {
        overview: 'সংক্ষিপ্ত বিবরণ',
        jobs: 'চাকরি',
        aiInsights: 'AI অন্তর্দৃষ্টি',
        profile: 'প্রোফাইল',
        logout: 'লগআউট',
    }
};

// Language context for dashboard
export const DashboardLangContext = createContext<{
    lang: 'en' | 'bn';
    setLang: (lang: 'en' | 'bn') => void;
    t: typeof dashboardTranslations.en;
}>({
    lang: 'en',
    setLang: () => { },
    t: dashboardTranslations.en,
});

export const useDashboardLang = () => useContext(DashboardLangContext);
