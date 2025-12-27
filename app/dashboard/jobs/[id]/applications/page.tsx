'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getJobApplications, acceptApplication, rejectApplication, getJobById } from '../../../../lib/db';

interface Application {
    id: string;
    workerId: string;
    jobId: string;
    status: string;
    appliedAt: any;
    workerProfile?: {
        fullName?: string;
        phoneNumber?: string;
        location?: string;
        skills?: string[];
        rating?: number;
        photoURL?: string;
        district?: string;
        block?: string;
        village?: string;
    };
}

export default function JobApplicationsPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id as string;

    const [applications, setApplications] = useState<Application[]>([]);
    const [jobTitle, setJobTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadApplications();
    }, [jobId]);

    const loadApplications = async () => {
        try {
            const job = await getJobById(jobId);
            if (job) {
                setJobTitle(job.title);
            }

            const apps = await getJobApplications(jobId);
            setApplications(apps as Application[]);
        } catch (error) {
            console.error('Failed to load applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLocation = (profile: any) => {
        if (!profile) return 'Location not set';
        const parts = [];
        if (profile.village) parts.push(profile.village);
        if (profile.block) parts.push(profile.block);
        if (profile.district) parts.push(profile.district);
        return parts.length > 0 ? parts.join(', ') : 'Location not set';
    };

    const handleAccept = async (appId: string) => {
        try {
            await acceptApplication(appId);
            setApplications(prev =>
                prev.map(app => app.id === appId ? { ...app, status: 'accepted' } : app)
            );
        } catch (error) {
            console.error('Failed to accept application:', error);
        }
    };

    const handleReject = async (appId: string) => {
        try {
            await rejectApplication(appId);
            setApplications(prev =>
                prev.map(app => app.id === appId ? { ...app, status: 'rejected' } : app)
            );
        } catch (error) {
            console.error('Failed to reject application:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="group mb-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                >
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Jobs
                </button>

                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">
                            Applications for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{jobTitle || 'Job'}</span>
                        </h1>
                        <p className="text-gray-400 text-lg">Manage candidates and view profiles</p>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-2xl font-bold text-white">{applications.length}</span>
                        <span className="text-gray-400 ml-2">Total Applicants</span>
                    </div>
                </div>
            </div>

            {applications.length === 0 ? (
                <div className="glass-card p-16 text-center border-dashed border-2 border-white/10">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <svg className="w-12 h-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">No applications yet</h3>
                    <p className="text-gray-400 max-w-md mx-auto text-lg">
                        Candidates who apply to your job will appear here. Their profiles and contact details will be listed below.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {applications.map(app => (
                        <div key={app.id} className="glass-card p-6 transition-all hover:bg-white/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    {/* Worker Avatar */}
                                    {app.workerProfile?.photoURL ? (
                                        <img
                                            src={app.workerProfile.photoURL}
                                            alt={app.workerProfile.fullName}
                                            className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500/50 shadow-lg shadow-purple-500/20"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-purple-500/20">
                                            {app.workerProfile?.fullName?.[0]?.toUpperCase() || 'W'}
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-1">
                                            {app.workerProfile?.fullName || 'Unknown Worker'}
                                        </h3>
                                        <div className="flex items-center gap-4 text-gray-400 text-sm mb-2">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                {app.workerProfile?.phoneNumber}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {getLocation(app.workerProfile)}
                                            </span>
                                        </div>

                                        {/* Skills */}
                                        {app.workerProfile?.skills && app.workerProfile.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {app.workerProfile.skills.map(skill => (
                                                    <span key={skill} className="px-2.5 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-lg text-xs font-medium">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions & Status */}
                                <div className="flex flex-col items-end gap-3 min-w-[140px]">
                                    <div className="text-xs text-gray-500">
                                        Applied {app.appliedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                                    </div>

                                    {app.status === 'accepted' ? (
                                        <span className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl font-medium flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Accepted
                                        </span>
                                    ) : app.status === 'rejected' ? (
                                        <span className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-medium flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Rejected
                                        </span>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleAccept(app.id)}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl transition shadow-lg shadow-green-600/20 font-medium"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleReject(app.id)}
                                                className="px-4 py-2 bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-xl transition font-medium"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
