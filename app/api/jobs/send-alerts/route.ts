import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { sendBulkEmails } from '@/lib/email/emailService';
import JobAlertEmail from '@/lib/email/templates/JobAlertEmail';

// Send job alert emails to matching workers
export async function POST(request: NextRequest) {
    try {
        const { jobData, jobId } = await request.json();

        if (!jobId || !jobData) {
            return NextResponse.json(
                { error: 'Missing job data or jobId' },
                { status: 400 }
            );
        }

        // Find workers with matching skills and location
        const workersRef = collection(db, 'workers');

        // Query workers by district/location
        const locationQuery = query(
            workersRef,
            where('district', '==', jobData.district || jobData.location)
        );

        const locationSnapshot = await getDocs(locationQuery);

        // Filter workers by skills and email opt-in
        const matchingWorkerEmails: string[] = [];

        locationSnapshot.docs.forEach((doc) => {
            const workerData = doc.data();

            // Check if worker has email and opted in for notifications
            if (!workerData.email) return;

            // Check if worker has any matching skills
            const workerSkills = workerData.skills || [];
            const jobSkills = jobData.requiredSkills || [];

            const hasMatchingSkill = workerSkills.some((skill: string) =>
                jobSkills.some((jobSkill: string) =>
                    skill.toLowerCase().includes(jobSkill.toLowerCase()) ||
                    jobSkill.toLowerCase().includes(skill.toLowerCase())
                )
            );

            if (hasMatchingSkill) {
                matchingWorkerEmails.push(workerData.email);
            }
        });

        if (matchingWorkerEmails.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No matching workers found',
                emailsSent: 0,
            });
        }

        // Send bulk emails
        const result = await sendBulkEmails({
            recipients: matchingWorkerEmails,
            subject: `নতুন কাজের সুযোগ - New Job: ${jobData.title}`,
            template: JobAlertEmail,
            data: {
                workerName: 'Worker', // Generic since it's bulk
                jobTitle: jobData.title,
                employerName: jobData.employerName || 'Employer',
                location: jobData.location,
                salary: jobData.salary || 'Negotiable',
                skills: jobData.requiredSkills || [],
                jobId,
                dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            },
        });

        return NextResponse.json({
            success: true,
            message: `Job alerts sent to ${result.successful} workers`,
            emailsSent: result.successful,
            emailsFailed: result.failed,
        });
    } catch (error) {
        console.error('Send job alerts error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
