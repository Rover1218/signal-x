import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { sendEmail } from '@/lib/email/emailService';
import NewApplicationEmail from '@/lib/email/templates/NewApplicationEmail';

// Send new application notification to employer
export async function POST(request: NextRequest) {
    try {
        const { applicationId, jobId } = await request.json();

        if (!applicationId || !jobId) {
            return NextResponse.json(
                { error: 'Missing applicationId or jobId' },
                { status: 400 }
            );
        }

        // Fetch application data
        const appRef = doc(db, 'applications', applicationId);
        const appDoc = await getDoc(appRef);

        if (!appDoc.exists()) {
            return NextResponse.json(
                { error: 'Application not found' },
                { status: 404 }
            );
        }

        const appData = appDoc.data();
        const workerId = appData.workerId;

        // Fetch worker data
        const workerRef = doc(db, 'workers', workerId);
        const workerDoc = await getDoc(workerRef);

        if (!workerDoc.exists()) {
            return NextResponse.json(
                { error: 'Worker not found' },
                { status: 404 }
            );
        }

        const workerData = workerDoc.data();

        // Fetch job and employer data
        const jobRef = doc(db, 'jobs', jobId);
        const jobDoc = await getDoc(jobRef);

        if (!jobDoc.exists()) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        const jobData = jobDoc.data();

        // Get employer email
        const employerId = jobData.userId;
        const employerRef = doc(db, 'users', employerId);
        const employerDoc = await getDoc(employerRef);

        if (!employerDoc.exists()) {
            return NextResponse.json(
                { error: 'Employer not found' },
                { status: 404 }
            );
        }

        const employerData = employerDoc.data();

        if (!employerData.email) {
            return NextResponse.json(
                { error: 'Employer has no email address' },
                { status: 400 }
            );
        }

        // Send email to employer
        const result = await sendEmail({
            to: employerData.email,
            subject: `📋 New Application: ${workerData.name} applied for ${jobData.title}`,
            template: NewApplicationEmail,
            data: {
                employerName: employerData.name || employerData.email,
                workerName: workerData.name,
                workerPhone: workerData.phone,
                workerEmail: workerData.email,
                jobTitle: jobData.title,
                workerSkills: workerData.skills || [],
                workerExperience: workerData.experience || 0,
                workerEducation: workerData.education || 'Not specified',
                applicationId,
                dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            },
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Application notification sent to employer',
            });
        } else {
            return NextResponse.json(
                { error: 'Failed to send email' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Send application notification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
