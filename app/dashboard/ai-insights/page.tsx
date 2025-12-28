'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { analyzeLivelihood } from '../../lib/gemini';
import { getAllJobs, getApprovedUsers, Job, UserProfile } from '../../lib/db';
import { westBengalStats, districtRiskScores, highRiskBlocks, migrationJobsData, sourceDistrictData } from '../../lib/wb-stats';

export default function AIInsightsPage() {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statsLoading, setStatsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [platformStats, setPlatformStats] = useState({
        activeJobs: 0,
        employers: 0,
        loadingStats: true
    });

    const refreshStats = async () => {
        setStatsLoading(true);
        try {
            const [jobs, users] = await Promise.all([
                getAllJobs(),
                getApprovedUsers()
            ]);
            setPlatformStats({
                activeJobs: jobs.filter(j => j.isPublic).length,
                employers: users.length,
                loadingStats: false
            });
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to fetch stats:', err);
            setPlatformStats(prev => ({ ...prev, loadingStats: false }));
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        refreshStats();
    }, []);

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

    const formatNumber = (num: number) => {
        if (num >= 10000000) return (num / 10000000).toFixed(1) + ' Cr';
        if (num >= 100000) return (num / 100000).toFixed(1) + ' L';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">AI Insights</h1>
                    <p className="text-gray-400">Powered by Groq AI • Data from Official Sources</p>
                </div>
                <div className="flex items-center gap-3">
                    {lastUpdated && (
                        <span className="text-xs text-gray-500">
                            Updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                    <button
                        onClick={refreshStats}
                        disabled={statsLoading}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-50"
                        title="Refresh Stats"
                    >
                        <svg className={`w-5 h-5 ${statsLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* MGNREGA & Employment Stats */}
            <div className="glass-card p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full" />
                        West Bengal MGNREGA Statistics
                    </h2>
                    <span className="text-xs text-gray-500">Source: nrega.nic.in</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 rounded-lg bg-white/5">
                        <div className="text-2xl font-bold text-green-400">{formatNumber(westBengalStats.mgnrega.totalJobCards)}</div>
                        <div className="text-xs text-gray-400">Job Cards</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                        <div className="text-2xl font-bold text-teal-400">{formatNumber(westBengalStats.mgnrega.activeWorkers)}</div>
                        <div className="text-xs text-gray-400">Active Workers</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                        <div className="text-2xl font-bold text-teal-400">{westBengalStats.mgnrega.personDaysGenerated} L</div>
                        <div className="text-xs text-gray-400">Person-Days Generated</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                        <div className="text-2xl font-bold text-amber-400">₹{westBengalStats.mgnrega.averageWage}</div>
                        <div className="text-xs text-gray-400">Daily Wage</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white/5">
                        <div className="text-2xl font-bold text-pink-400">{westBengalStats.mgnrega.womenParticipation}%</div>
                        <div className="text-xs text-gray-400">Women Workers</div>
                    </div>
                </div>
            </div>

            {/* State Schemes Stats */}
            <div className="glass-card p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 bg-teal-400 rounded-full" />
                        State Scheme Coverage
                    </h2>
                    <span className="text-xs text-gray-500">Source: wb.gov.in</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg border" style={{ background: 'rgba(30, 58, 95, 0.15)', borderColor: 'rgba(30, 58, 95, 0.3)' }}>
                        <div className="text-2xl font-bold text-teal-400">{formatNumber(westBengalStats.schemes.lakshirBhandar.beneficiaries)}</div>
                        <div className="text-sm text-gray-300">Lakshmir Bhandar</div>
                        <div className="text-xs text-gray-500">Women Beneficiaries</div>
                    </div>
                    <div className="p-4 rounded-lg border" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
                        <div className="text-2xl font-bold text-emerald-400">{formatNumber(westBengalStats.schemes.krishakBandhu.beneficiaries)}</div>
                        <div className="text-sm text-gray-300">Krishak Bandhu</div>
                        <div className="text-xs text-gray-500">Farmer Beneficiaries</div>
                    </div>
                    <div className="p-4 rounded-lg border" style={{ background: 'rgba(13, 148, 136, 0.1)', borderColor: 'rgba(13, 148, 136, 0.25)' }}>
                        <div className="text-2xl font-bold text-teal-400">{formatNumber(westBengalStats.schemes.kanyashree.beneficiaries)}</div>
                        <div className="text-sm text-gray-300">Kanyashree</div>
                        <div className="text-xs text-gray-500">Girls Enrolled</div>
                    </div>
                    <div className="p-4 rounded-lg border" style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.25)' }}>
                        <div className="text-2xl font-bold text-amber-400">{formatNumber(westBengalStats.schemes.bhabishyatCredit.loansDisbursed)}</div>
                        <div className="text-sm text-gray-300">Bhabishyat Credit</div>
                        <div className="text-xs text-gray-500">Loans Disbursed</div>
                    </div>
                </div>
            </div>

            {/* Migration Risk Analysis */}
            <div className="glass-card p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                        Migration Risk Analysis
                    </h2>
                    <span className="text-xs text-gray-500">~{westBengalStats.migration.estimatedMigrants}L seasonal migrants</span>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="text-lg font-bold text-red-400 mb-2">{westBengalStats.migration.highRiskDistricts.length} High-Risk</div>
                        <div className="space-y-1">
                            {westBengalStats.migration.highRiskDistricts.map(d => (
                                <div key={d} className="text-xs text-gray-400 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                                    {d}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <div className="text-lg font-bold text-amber-400 mb-2">{westBengalStats.migration.mediumRiskDistricts.length} Medium-Risk</div>
                        <div className="space-y-1">
                            {westBengalStats.migration.mediumRiskDistricts.map(d => (
                                <div key={d} className="text-xs text-gray-400 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                                    {d}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="text-lg font-bold text-green-400 mb-2">{westBengalStats.migration.stableDistricts.length} Stable</div>
                        <div className="space-y-1">
                            {westBengalStats.migration.stableDistricts.slice(0, 5).map(d => (
                                <div key={d} className="text-xs text-gray-400 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                                    {d}
                                </div>
                            ))}
                            {westBengalStats.migration.stableDistricts.length > 5 && (
                                <div className="text-xs text-gray-500">+{westBengalStats.migration.stableDistricts.length - 5} more</div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                    <div className="text-xs text-gray-400 mb-2">Top Migration Destinations:</div>
                    <div className="flex flex-wrap gap-2">
                        {westBengalStats.migration.topDestinations.map(dest => (
                            <span key={dest} className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                                {dest}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* High-Risk Blocks */}
            <div className="glass-card p-5 mb-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full" />
                    High-Risk Blocks (Priority Intervention)
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {highRiskBlocks.map(item => (
                        <div key={item.district} className="p-3 rounded-lg bg-white/5">
                            <div className="text-sm font-medium text-orange-400 mb-2">{item.district}</div>
                            <div className="flex flex-wrap gap-1">
                                {item.blocks.map(block => (
                                    <span key={block} className="px-2 py-0.5 text-xs rounded bg-orange-500/10 text-gray-400">
                                        {block}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Migration Jobs & Salaries by Destination */}
            <div className="glass-card p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 bg-teal-400 rounded-full" />
                        Migration Jobs & Salaries by Destination
                    </h2>
                    <span className="text-xs text-gray-500">Based on field surveys & labor reports</span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {migrationJobsData.slice(0, 4).map(dest => (
                        <div key={dest.destination} className="p-4 rounded-xl border" style={{ background: 'rgba(30, 58, 95, 0.15)', borderColor: 'rgba(30, 58, 95, 0.3)' }}>
                            <div className="text-lg font-bold text-teal-400 mb-3">{dest.destination}</div>
                            <div className="space-y-2">
                                {dest.jobs.map(job => (
                                    <div key={job.type} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span>{job.icon}</span>
                                            <span className="text-gray-300">{job.type}</span>
                                        </div>
                                        <span className="text-emerald-400 font-medium text-xs">{job.salaryRange}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                {/* Additional destinations in collapsible or scrollable view */}
                <div className="mt-4 grid md:grid-cols-3 gap-4">
                    {migrationJobsData.slice(4).map(dest => (
                        <div key={dest.destination} className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="text-sm font-semibold text-emerald-400 mb-2">{dest.destination}</div>
                            <div className="space-y-1">
                                {dest.jobs.slice(0, 3).map(job => (
                                    <div key={job.type} className="flex items-center justify-between text-xs">
                                        <span className="text-gray-400">{job.icon} {job.type}</span>
                                        <span className="text-green-400">{job.salaryRange}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Source Districts - Where Migrants Come From */}
            <div className="glass-card p-5 mb-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-rose-400 rounded-full" />
                    Source Districts - Migration Patterns
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b border-white/10">
                                <th className="pb-3 text-gray-400 font-medium">District</th>
                                <th className="pb-3 text-gray-400 font-medium">Migrant Pop.</th>
                                <th className="pb-3 text-gray-400 font-medium">Top Jobs</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sourceDistrictData.map(item => (
                                <tr key={item.district} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="py-3 font-medium text-rose-400">{item.district}</td>
                                    <td className="py-3 text-amber-400 font-semibold">{item.migrantPopulation}</td>
                                    <td className="py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {item.topJobs.map(job => (
                                                <span key={job} className="px-2 py-0.5 text-xs rounded bg-gray-500/20 text-gray-300">
                                                    {job}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Platform Stats */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="stat-card border-l-4 border-l-emerald-500">
                    <div className="text-sm text-gray-400 mb-1">SignalX Platform Jobs</div>
                    <div className="text-3xl font-bold text-emerald-400">
                        {platformStats.loadingStats ? '...' : platformStats.activeJobs}
                    </div>
                    <div className="text-xs text-gray-500">Active Postings</div>
                </div>
                <div className="stat-card border-l-4 border-l-teal-500">
                    <div className="text-sm text-gray-400 mb-1">Registered Employers</div>
                    <div className="text-3xl font-bold text-teal-400">
                        {platformStats.loadingStats ? '...' : platformStats.employers}
                    </div>
                    <div className="text-xs text-gray-500">On Platform</div>
                </div>
            </div>

            {/* AI Query Section */}
            <div className="glass-card p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Ask SignalX AI
                </h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="input flex-1"
                        placeholder="e.g. What are the livelihood gaps in Purulia district?"
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
                <div className="glass-card p-6 mb-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        SignalX Analysis
                    </h3>
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:text-emerald-400 prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-teal-400 prose-strong:font-semibold prose-li:text-gray-300 prose-ul:my-2 prose-ol:my-2">
                        <ReactMarkdown>{response}</ReactMarkdown>
                    </div>
                </div>
            )}

            {/* Quick Queries */}
            <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Quick Queries</h3>
                <div className="flex flex-wrap gap-2">
                    {[
                        'Migration patterns in Sundarbans',
                        'MGNREGA implementation in Purulia',
                        'Livelihood opportunities in Murshidabad',
                        'Scheme eligibility for landless workers',
                        'Seasonal employment calendar',
                        'Block-level risk assessment for Bankura'
                    ].map((preset) => (
                        <button
                            key={preset}
                            onClick={() => setQuery(preset)}
                            className="px-3 py-2 text-sm glass-card hover:border-teal-500/50 transition-all"
                        >
                            {preset}
                        </button>
                    ))}
                </div>
            </div>

            {/* Data Sources & Citations */}
            <div className="glass-card p-5 mt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Data Sources & Reliability
                </h3>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* Official Sources */}
                    <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 font-medium">✓ Official</span>
                            <span className="text-xs text-gray-500">Verified Government Sources</span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <a href="https://nrega.nic.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                                MGNREGA MIS Dashboard
                                <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                            <a href="https://wb.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                                West Bengal State Portal (Scheme Data)
                                <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                            <a href="https://censusindia.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                                Census of India 2011
                                <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                            <a href="https://niti.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                                NITI Aayog (District Classification)
                                <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Estimated Sources */}
                    <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400 font-medium">⚠ Estimated</span>
                            <span className="text-xs text-gray-500">Research-Based Approximations</span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                                Migration salary data - Field surveys & news reports
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                                Worker count estimates - ILO & CPR studies
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                                District risk scores - NSSO labor surveys
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                                Migrant population % - Academic research papers
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-white/5">
                    <span>📅 Data Period: FY 2023-24 • Last Updated: December 2024</span>
                    <span>For real-time data, visit official portals directly</span>
                </div>
            </div>
        </div>
    );
}
