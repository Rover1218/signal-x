'use client';

import { useState } from 'react';
import { analyzeLivelihood } from '../../lib/gemini';

export default function AIInsightsPage() {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResponse('');

        try {
            const result = await analyzeLivelihood(query);
            setResponse(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to analyze. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-2">AI Insights</h1>
                <p className="text-gray-400">Powered by Google Gemini</p>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="stat-card border-l-4 border-l-red-500">
                    <div className="text-sm text-gray-400 mb-1">High Risk Blocks</div>
                    <div className="text-3xl font-bold text-red-400">23</div>
                </div>
                <div className="stat-card border-l-4 border-l-amber-500">
                    <div className="text-sm text-gray-400 mb-1">Medium Risk</div>
                    <div className="text-3xl font-bold text-amber-400">87</div>
                </div>
                <div className="stat-card border-l-4 border-l-green-500">
                    <div className="text-sm text-gray-400 mb-1">Stable</div>
                    <div className="text-3xl font-bold text-green-400">231</div>
                </div>
            </div>

            {/* AI Query Section */}
            <div className="glass-card p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Ask Gemini
                </h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="input flex-1"
                        placeholder="e.g. What are the livelihood gaps in Murshidabad district?"
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    />
                    <button onClick={handleAnalyze} disabled={loading} className="btn-primary">
                        {loading ? <div className="spinner w-5 h-5" /> : 'Analyze'}
                    </button>
                </div>
                {error && (
                    <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
            </div>

            {/* Response Section */}
            {response && (
                <div className="glass-card p-6 mb-8">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        AI Response
                    </h3>
                    <div className="prose prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-gray-300 font-sans text-sm leading-relaxed">{response}</pre>
                    </div>
                </div>
            )}

            {/* Preset Queries */}
            <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Quick Queries</h3>
                <div className="flex flex-wrap gap-3">
                    {[
                        'High risk blocks in West Bengal',
                        'MSME opportunities in Howrah',
                        'Agricultural labor surplus areas',
                        'Available government schemes',
                        'Skill gap analysis'
                    ].map((preset) => (
                        <button
                            key={preset}
                            onClick={() => {
                                setQuery(preset);
                                handleAnalyze();
                            }}
                            className="px-4 py-2 text-sm glass-card hover:border-purple-500/50 transition-all"
                        >
                            {preset}
                        </button>
                    ))}
                </div>
            </div>

            {/* Info Banner */}
            <div className="mt-8 glass-card p-6 border-l-4 border-l-cyan-500">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    SignalX AI - West Bengal Focus
                </h3>
                <p className="text-gray-400 text-sm">
                    Powered by Google Gemini with comprehensive West Bengal livelihood intelligence. Analyzes 341 blocks across 23 districts,
                    covering agriculture, MSMEs, textiles, and government schemes like MGNREGA, Lakshmir Bhandar, and Karma Sathi Prakalpa.
                </p>
            </div>
        </div>
    );
}
