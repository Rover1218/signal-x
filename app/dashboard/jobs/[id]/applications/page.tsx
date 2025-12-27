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
                    className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
                >
                    ← Back to Jobs
                </button>
                <h1 className="text-3xl font-bold mb-2">Applications for {jobTitle}</h1>
                <p className="text-gray-600">{applications.length} total applications</p>
            </div>

            {applications.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
                    <p className="text-gray-500 mt-2">Check back later for worker applications</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map(app => (
                        <div key={app.id} className="glass-card p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    {/* Worker Avatar */}
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                                        {app.workerProfile?.fullName?.[0]?.toUpperCase() || 'W'}
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold">
                                            {app.workerProfile?.fullName || 'Unknown Worker'}
                                        </h3>
                                        <p className="text-gray-600">{app.workerProfile?.phoneNumber}</p>
                                        <p className="text-gray-500 text-sm">{app.workerProfile?.location}</p>

                                        {/* Worker Rating */}
                                        {app.workerProfile?.rating !== undefined && app.workerProfile.rating > 0 && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-yellow-500">★</span>
                                                <span className="text-sm font-medium">
                                                    {app.workerProfile.rating} completed jobs
                                                </span>
                                            </div>
                                        )}

                                        {/* Skil ls */}
                                        {app.workerProfile?.skills && app.workerProfile.skills.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {app.workerProfile.skills.map(skill => (
                                                    <span key={skill} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Status/Actions */}
                                <div className="flex flex-col items-end gap-2">
                                    {app.status === 'accepted' ? (
                                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                                            ✓ Accepted
                                        </span>
                                    ) : app.status === 'rejected' ? (
                                        <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium">
                                            ✗ Rejected
                                        </span>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAccept(app.id)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleReject(app.id)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    <span className="text-sm text-gray-500">
                                        Applied {app.appliedAt?.toDate?.()?.toLocaleDateString() || 'recently'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
