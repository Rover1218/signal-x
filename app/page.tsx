'use client';

import Link from "next/link";
import { useAuth } from "./components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'admin') {
        router.push('/admin');
      } else if (profile.status === 'approved') {
        router.push('/dashboard');
      } else if (profile.status === 'pending') {
        router.push('/pending');
      } else {
        router.push('/profile-setup');
      }
    }
  }, [user, profile, loading, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse-glow">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
            <span className="text-3xl font-bold gradient-text">SignalX</span>
          </Link>

          <div className="hidden md:flex items-center gap-12">
            <a href="#features" className="text-gray-400 hover:text-white transition-all font-medium hover:scale-105">Features</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition-all font-medium hover:scale-105">How it Works</a>
            <a href="#impact" className="text-gray-400 hover:text-white transition-all font-medium hover:scale-105">Impact</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block px-6 py-3 text-gray-300 hover:text-white transition-all font-medium">
              Sign In
            </Link>
            <Link href="/signup" className="btn-primary px-8 py-3.5">
              Get Started
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-8 pt-24 pb-32">
        <div className="w-full text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 glass-card px-6 py-3 mb-12 animate-fade-in">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm md:text-base text-gray-200 font-semibold">Bengal's First AI-Powered Livelihood Platform</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="gradient-text">Preventing Distress</span>
            <br />
            <span className="text-white">Migration Through AI</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-400 mb-14 max-w-4xl mx-auto leading-relaxed">
            AI-powered local supply and demand intelligence system that predicts livelihood gaps
            at block level and connects workers, MSMEs, cooperatives with government schemes
            <span className="text-cyan-400 font-bold"> before income collapse happens</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Link href="/signup" className="btn-primary text-lg px-12 py-5 group">
              <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Free Today
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-12 py-5">
              Recruiter Login
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-500">
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium text-gray-400">Powered by Google Gemini AI</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium text-gray-400">341 Blocks Covered</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium text-gray-400">100% Free for Workers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Features</span> <span className="text-white">Built for Impact</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            A comprehensive platform designed to prevent distress migration through intelligent job matching and scheme discovery.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {/* Feature 1 */}
          <div className="glass-card p-10 hover:border-purple-500/50 transition-all duration-300 group cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Gemini AI Predictions</h3>
            <p className="text-gray-400 leading-relaxed">Predict livelihood gaps at block level using advanced AI before income collapse happens.</p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-10 hover:border-cyan-500/50 transition-all duration-300 group cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Smart Job Matching</h3>
            <p className="text-gray-400 leading-relaxed">Connect workers with MSMEs, cooperatives, and government schemes proactively.</p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-10 hover:border-green-500/50 transition-all duration-300 group cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-green-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Block-Level Intelligence</h3>
            <p className="text-gray-400 leading-relaxed">Real-time supply and demand data at the district block level for targeted interventions.</p>
          </div>

          {/* Feature 4 */}
          <div className="glass-card p-10 hover:border-amber-500/50 transition-all duration-300 group cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Government Schemes</h3>
            <p className="text-gray-400 leading-relaxed">Discover MGNREGA, Lakshmir Bhandar, PM-SVANidhi, and other eligible schemes instantly.</p>
          </div>

          {/* Feature 5 */}
          <div className="glass-card p-10 hover:border-pink-500/50 transition-all duration-300 group cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-700 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Mobile-First Design</h3>
            <p className="text-gray-400 leading-relaxed">Beautiful Flutter app for workers with OTP login - no email or complex passwords needed.</p>
          </div>

          {/* Feature 6 */}
          <div className="glass-card p-10 hover:border-indigo-500/50 transition-all duration-300 group cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">AI Chat Assistant</h3>
            <p className="text-gray-400 leading-relaxed">Ask questions in Bengali, Hindi, or English and get instant AI-powered answers about jobs and schemes.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 py-32">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">How </span><span className="gradient-text">SignalX</span><span className="text-white"> Works</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Three simple steps to connect with local opportunities and prevent distress migration.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 w-full">
          <div className="text-center group">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-3xl flex items-center justify-center text-4xl font-bold mx-auto shadow-2xl shadow-purple-500/40 group-hover:scale-110 transition-transform">
                1
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Register Your Profile</h3>
            <p className="text-gray-400 leading-relaxed text-lg">
              Workers: Download app, OTP login, add skills & location.<br />
              Recruiters: Sign up on web, get approved, start hiring.
            </p>
          </div>

          <div className="text-center group">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-3xl flex items-center justify-center text-4xl font-bold mx-auto shadow-2xl shadow-cyan-500/40 group-hover:scale-110 transition-transform">
                2
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">AI Matches Opportunities</h3>
            <p className="text-gray-400 leading-relaxed text-lg">
              Gemini AI analyzes your skills, location, and preferences to find the best local job matches and eligible schemes.
            </p>
          </div>

          <div className="text-center group">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-3xl flex items-center justify-center text-4xl font-bold mx-auto shadow-2xl shadow-green-500/40 group-hover:scale-110 transition-transform">
                3
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Connect & Earn Locally</h3>
            <p className="text-gray-400 leading-relaxed text-lg">
              Apply to jobs, enroll in schemes, and build a sustainable livelihood without leaving your home district.
            </p>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 py-32">
        <div className="glass-card p-8 sm:p-16 w-full mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Our </span><span className="gradient-text">Impact</span>
            </h2>
            <p className="text-xl text-gray-400">Building a sustainable livelihood ecosystem across West Bengal</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <div className="text-center group cursor-pointer">
              <div className="text-5xl md:text-6xl font-bold gradient-text mb-4 group-hover:scale-110 transition-transform">341</div>
              <div className="text-gray-400 text-lg font-medium">Blocks Covered</div>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="text-5xl md:text-6xl font-bold gradient-text mb-4 group-hover:scale-110 transition-transform">23</div>
              <div className="text-gray-400 text-lg font-medium">Districts</div>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="text-5xl md:text-6xl font-bold gradient-text mb-4 group-hover:scale-110 transition-transform">AI</div>
              <div className="text-gray-400 text-lg font-medium">Gemini Powered</div>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="text-5xl md:text-6xl font-bold gradient-text mb-4 group-hover:scale-110 transition-transform">24/7</div>
              <div className="text-gray-400 text-lg font-medium">Real-time Alerts</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-8 py-32">
        <div className="glass-card p-8 sm:p-16 w-full mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to <span className="gradient-text">Transform Lives</span>?
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Whether you're a worker looking for opportunities or a recruiter seeking skilled talent, SignalX connects you intelligently.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/signup" className="btn-primary text-lg px-12 py-5">
              Create Free Account
            </Link>
            <a href="#" className="btn-secondary text-lg px-12 py-5">
              Download Workers App
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="text-2xl font-bold gradient-text">SignalX</span>
              </div>
              <p className="text-gray-500 leading-relaxed">
                AI-powered livelihood intelligence platform preventing distress migration across West Bengal.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Platform</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#impact" className="text-gray-400 hover:text-white transition-colors">Impact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Get Started</h4>
              <ul className="space-y-3">
                <li><Link href="/signup" className="text-gray-400 hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Download App</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Resources</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-10 text-center">
            <p className="text-gray-500">
              © 2024 SignalX. Empowering West Bengal through AI. Built with <span className="text-red-500">❤️</span> for rural communities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
