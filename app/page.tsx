'use client';

import Link from "next/link";
import { useAuth } from "./components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RippleButton } from "./components/ui/ripple-button";
import { Highlight } from "./components/ui/hero-highlight";

// Translations
const translations = {
  en: {
    heroTitle1: 'Prevent Distress Migration',
    heroTitle2: 'Before It Happens',
    heroSubtitle: 'AI-powered livelihood intelligence for rural West Bengal',
    explorePlatform: 'Explore Platform',
    recruitWorkers: 'Recruit Workers',
    contact: 'Contact',
    privacyTitle: 'Privacy & Data Promise',
    privacyText: 'Your data is encrypted and never shared without consent. We comply with all Indian data protection laws.',
    partners: 'Our Partners',
    govtWB: 'Govt. of West Bengal',
    digitalIndia: 'Digital India',
    skillIndia: 'Skill India',
    footerText: '© 2025 SignalX. Empowering West Bengal through AI.',
    problemsTitle: 'The',
    problemsHighlight: 'Problems',
    problemsEnd: 'We Solve',
    incomeCollapse: 'Income Collapse',
    incomeCollapseDesc: 'Seasonal unemployment forces migration',
    incomeCollapseStat: 'workers face seasonal income loss',
    noLocalJobs: 'No Local Job Visibility',
    noLocalJobsDesc: 'Workers unaware of nearby opportunities',
    noLocalJobsStat: 'hidden local job opportunities',
    schemeGap: 'Scheme Awareness Gap',
    schemeGapDesc: 'Government benefits remain unclaimed',
    schemeGapStat: 'unclaimed scheme benefits',
    howItWorks: 'How',
    howItWorksHighlight: 'SignalX',
    howItWorksEnd: 'Works',
    step1Title: 'Workers Register',
    step1Desc: 'Simple phone OTP-based registration. Add your skills and location.',
    step2Title: 'AI Matches Jobs + Schemes',
    step2Desc: 'Gemini AI finds the best local opportunities and eligible government schemes.',
    step3Title: 'Admin Sees Block-Level Alerts',
    step3Desc: 'Real-time alerts help administrators intervene before income collapse.',
    getStarted: 'Get Started Now',
  },
  bn: {
    heroTitle1: 'দুর্দশাগ্রস্ত অভিবাসন রোধ করুন',
    heroTitle2: 'এটা ঘটার আগেই',
    heroSubtitle: 'গ্রামীণ পশ্চিমবঙ্গের জন্য AI-চালিত জীবিকা বুদ্ধিমত্তা',
    explorePlatform: 'প্ল্যাটফর্ম দেখুন',
    recruitWorkers: 'শ্রমিক নিয়োগ করুন',
    contact: 'যোগাযোগ',
    privacyTitle: 'গোপনীয়তা ও তথ্য প্রতিশ্রুতি',
    privacyText: 'আপনার তথ্য এনক্রিপ্ট করা এবং সম্মতি ছাড়া কখনও শেয়ার করা হয় না। আমরা সমস্ত ভারতীয় তথ্য সুরক্ষা আইন মেনে চলি।',
    partners: 'আমাদের অংশীদার',
    govtWB: 'পশ্চিমবঙ্গ সরকার',
    digitalIndia: 'ডিজিটাল ইন্ডিয়া',
    skillIndia: 'স্কিল ইন্ডিয়া',
    footerText: '© ২০২৫ সিগন্যালএক্স। AI-এর মাধ্যমে পশ্চিমবঙ্গকে ক্ষমতায়ন।',
    problemsTitle: 'যে',
    problemsHighlight: 'সমস্যাগুলি',
    problemsEnd: 'আমরা সমাধান করি',
    incomeCollapse: 'আয় পতন',
    incomeCollapseDesc: 'মৌসুমী বেকারত্ব অভিবাসনে বাধ্য করে',
    incomeCollapseStat: 'শ্রমিক মৌসুমী আয় ক্ষতির সম্মুখীন',
    noLocalJobs: 'স্থানীয় চাকরির দৃশ্যমানতা নেই',
    noLocalJobsDesc: 'শ্রমিকরা কাছাকাছি সুযোগ সম্পর্কে অবগত নয়',
    noLocalJobsStat: 'লুকানো স্থানীয় চাকরির সুযোগ',
    schemeGap: 'স্কিম সচেতনতার অভাব',
    schemeGapDesc: 'সরকারি সুবিধা দাবিহীন থাকে',
    schemeGapStat: 'দাবিহীন স্কিম সুবিধা',
    howItWorks: 'কিভাবে',
    howItWorksHighlight: 'সিগন্যালএক্স',
    howItWorksEnd: 'কাজ করে',
    step1Title: 'শ্রমিক নিবন্ধন',
    step1Desc: 'সহজ ফোন OTP-ভিত্তিক নিবন্ধন। আপনার দক্ষতা এবং অবস্থান যোগ করুন।',
    step2Title: 'AI চাকরি + স্কিম মেলায়',
    step2Desc: 'Gemini AI সেরা স্থানীয় সুযোগ এবং যোগ্য সরকারি স্কিম খুঁজে বের করে।',
    step3Title: 'অ্যাডমিন ব্লক-স্তরের সতর্কতা দেখে',
    step3Desc: 'রিয়েল-টাইম সতর্কতা প্রশাসকদের আয় পতনের আগে হস্তক্ষেপ করতে সাহায্য করে।',
    getStarted: 'এখনই শুরু করুন',
  }
};

export default function Home() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [lang, setLang] = useState<'en' | 'bn'>('en');

  const t = translations[lang];

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'admin') {
        router.push('/admin');
      } else if (profile.status === 'approved') {
        router.push('/dashboard');
      } else if (profile.status === 'pending') {
        router.push('/pending');
      } else if (profile.status === 'incomplete') {
        router.push('/profile-setup');
      } else {
        router.push('/profile-setup');
      }
    }
  }, [user, profile, loading, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col overflow-x-hidden">
      {/* Animated Background with West Bengal Map */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Professional orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-float" style={{ background: 'rgba(30, 58, 95, 0.25)' }} />
        <div className="absolute top-40 right-20 w-[500px] h-[500px] rounded-full blur-3xl animate-float" style={{ background: 'rgba(13, 148, 136, 0.15)', animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full blur-3xl animate-float" style={{ background: 'rgba(16, 185, 129, 0.1)', animationDelay: '2s' }} />

        {/* West Bengal Map Background - Ready for Three.js */}
        <div className="absolute inset-0 flex items-center justify-center opacity-15">
          <div id="wb-map-container" className="w-[70vmin] h-[90vmin] relative">
            <svg viewBox="0 0 400 600" className="w-full h-full">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* West Bengal outline - stylized */}
              <path
                d="M180,30 L220,35 L260,50 L290,80 L310,120 L330,170 L345,230 L350,290 L345,350 L330,410 L300,470 L260,520 L220,555 L180,570 L140,555 L100,520 L70,470 L50,410 L45,350 L50,290 L60,230 L80,170 L110,120 L140,80 L160,50 Z"
                fill="rgba(30, 58, 95, 0.3)"
                stroke="rgba(13, 148, 136, 0.5)"
                strokeWidth="2"
                filter="url(#glow)"
                className="animate-pulse"
                style={{ animationDuration: '4s' }}
              />
              {/* District divisions - subtle lines */}
              <path d="M100,200 L300,180" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <path d="M80,300 L320,280" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <path d="M90,400 L310,380" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <path d="M200,50 L200,560" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>

      {/* Navigation - Minimal */}
      <nav className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: '#1e3a5f', boxShadow: '0 8px 24px rgba(30, 58, 95, 0.4)' }}>
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <span className="text-3xl font-bold text-emerald-500">SignalX</span>
          </Link>

          {/* Language Toggle Button */}
          <RippleButton
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            rippleColor="rgba(30, 58, 95, 0.4)"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(30, 58, 95, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(30, 58, 95, 0.4)',
              boxShadow: '0 4px 16px rgba(30, 58, 95, 0.15)',
            }}
          >
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span className="text-white">{lang === 'en' ? 'বাংলা' : 'English'}</span>
          </RippleButton>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
        <div className="w-full text-center">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
            <span className="text-white block mb-4">{t.heroTitle1}</span>
            <Highlight className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl from-emerald-500 to-teal-500">
              {t.heroTitle2}
            </Highlight>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-12 sm:mb-16 max-w-3xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* CTA Buttons - Premium Glassmorphism */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            {/* Explore Platform Button */}
            <RippleButton
              onClick={() => setShowExploreModal(true)}
              rippleColor="rgba(16,185,129,0.5)"
              className="group relative px-12 py-5 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{
                background: 'rgba(16,185,129,0.08)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(16,185,129,0.25)',
                boxShadow: '0 8px 32px rgba(16,185,129,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              <span className="flex items-center justify-center gap-3 text-green-400">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span>
                {t.explorePlatform}
              </span>
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
            </RippleButton>

            {/* Recruit Workers Button */}
            <RippleButton
              href="/signup"
              rippleColor="rgba(30, 58, 95, 0.5)"
              className="group relative px-12 py-5 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105"
              style={{
                background: 'rgba(30, 58, 95, 0.15)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(30, 58, 95, 0.3)',
                boxShadow: '0 8px 32px rgba(30, 58, 95, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              <span className="flex items-center justify-center gap-3 text-teal-400">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                {t.recruitWorkers}
              </span>
              <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
            </RippleButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 w-full mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            {/* Contact */}
            <div>
              <h4 className="font-bold text-white mb-4 text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t.contact}
              </h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>signalx2004@gmail.com</li>
                <li>+91 9163681186</li>
                <li>{lang === 'en' ? 'Kolkata, West Bengal' : 'কলকাতা, পশ্চিমবঙ্গ'}</li>
              </ul>
            </div>

            {/* Privacy & Data Promise */}
            <div>
              <h4 className="font-bold text-white mb-4 text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {t.privacyTitle}
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t.privacyText}
              </p>
            </div>

            {/* Partner Logos */}
            <div>
              <h4 className="font-bold text-white mb-4 text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {t.partners}
              </h4>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs">
                  {t.govtWB}
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs">
                  {t.digitalIndia}
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs">
                  {t.skillIndia}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-gray-500 text-sm">
              {t.footerText}
            </p>
          </div>
        </div>
      </footer>

      {/* Explore Platform Modal */}
      {showExploreModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowExploreModal(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(15,15,25,0.98) 0%, rgba(10,10,15,0.99) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
          >
            {/* Close Button */}
            <RippleButton
              onClick={() => setShowExploreModal(false)}
              rippleColor="rgba(255,255,255,0.3)"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </RippleButton>

            <div className="p-8 sm:p-12">
              {/* Section 1: Problem Snapshot */}
              <div className="mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">
                  {t.problemsTitle} <span className="text-emerald-500">{t.problemsHighlight}</span> {t.problemsEnd}
                </h2>

                <div className="grid md:grid-cols-3 gap-5">
                  {/* Problem Card 1 */}
                  <div className="group p-5 rounded-2xl bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{t.incomeCollapse}</h3>
                    <p className="text-gray-400 text-sm mb-3">{t.incomeCollapseDesc}</p>
                    <div className="text-2xl font-bold text-red-400">45%</div>
                    <p className="text-gray-500 text-xs">{t.incomeCollapseStat}</p>
                  </div>

                  {/* Problem Card 2 */}
                  <div className="group p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{t.noLocalJobs}</h3>
                    <p className="text-gray-400 text-sm mb-3">{t.noLocalJobsDesc}</p>
                    <div className="text-2xl font-bold text-amber-400">2.3L</div>
                    <p className="text-gray-500 text-xs">{t.noLocalJobsStat}</p>
                  </div>

                  {/* Problem Card 3 */}
                  <div className="group p-5 rounded-2xl bg-orange-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{t.schemeGap}</h3>
                    <p className="text-gray-400 text-sm mb-3">{t.schemeGapDesc}</p>
                    <div className="text-2xl font-bold text-orange-400">{lang === 'en' ? '₹12K Cr' : '₹১২ হাজার কোটি'}</div>
                    <p className="text-gray-500 text-xs">{t.schemeGapStat}</p>
                  </div>
                </div>
              </div>

              {/* Section 2: How SignalX Works */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">
                  {t.howItWorks} <span className="text-emerald-500">{t.howItWorksHighlight}</span> {t.howItWorksEnd}
                </h2>

                {/* Horizontal Flow Diagram */}
                <div className="relative">
                  {/* Connection Line */}
                  <div className="hidden md:block absolute top-9 left-[17%] right-[17%] h-1 rounded-full" style={{ background: '#0d9488' }} />

                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Step 1 */}
                    <div className="relative text-center">
                      <div className="relative z-10 w-[72px] h-[72px] mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-xl" style={{ background: '#1e3a5f', boxShadow: '0 8px 24px rgba(30, 58, 95, 0.4)' }}>
                        <span className="text-2xl font-bold text-white">{lang === 'en' ? '1' : '১'}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{t.step1Title}</h3>
                      <p className="text-gray-400 text-sm">
                        {t.step1Desc}
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="relative text-center">
                      <div className="relative z-10 w-[72px] h-[72px] mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-xl" style={{ background: '#0d9488', boxShadow: '0 8px 24px rgba(13, 148, 136, 0.4)' }}>
                        <span className="text-2xl font-bold text-white">{lang === 'en' ? '2' : '২'}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{t.step2Title}</h3>
                      <p className="text-gray-400 text-sm">
                        {t.step2Desc}
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="relative text-center">
                      <div className="relative z-10 w-[72px] h-[72px] mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-xl" style={{ background: '#10b981', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)' }}>
                        <span className="text-2xl font-bold text-white">{lang === 'en' ? '3' : '৩'}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{t.step3Title}</h3>
                      <p className="text-gray-400 text-sm">
                        {t.step3Desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA in Modal */}
                <div className="mt-10 text-center">
                  <RippleButton
                    href="/signup"
                    rippleColor="rgba(255,255,255,0.3)"
                    className="inline-flex items-center justify-center px-12 py-4 rounded-full font-semibold text-lg text-white transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'rgba(30, 58, 95, 0.3)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      boxShadow: '0 8px 32px rgba(30, 58, 95, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                    }}
                  >
                    <span className="text-emerald-400 font-bold">
                      {t.getStarted}
                    </span>
                  </RippleButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
