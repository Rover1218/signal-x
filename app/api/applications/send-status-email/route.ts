import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { sendEmail } from '@/lib/email/emailService';
import ApplicationStatusEmail from '@/lib/email/templates/ApplicationStatusEmail';

// API route to send application status emails (server-side only)
export async function POST(request: NextRequest) {
  try {
    const { applicationId, status } = await request.json();

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'Missing applicationId or status' },
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
    const jobId = appData.jobId;

    // Fetch worker and job data
    const workerRef = doc(db, 'workers', workerId);
    const workerDoc = await getDoc(workerRef);
    const jobRef = doc(db, 'jobs', jobId);
    const jobDoc = await getDoc(jobRef);

    if (!workerDoc.exists() || !jobDoc.exists()) {
      return NextResponse.json(
        { error: 'Worker or job not found' },
        { status: 404 }
      );
    }

    const workerData = workerDoc.data();
    const jobData = jobDoc.data();

    if (!workerData.email) {
      return NextResponse.json(
        { error: 'Worker has no email address' },
        { status: 400 }
      );
    }

    // Send email
    const result = await sendEmail({
      to: workerData.email,
      subject: status === 'accepted'
        ? 'আপনার আবেদন গৃহীত হয়েছে - Application Accepted'
        : 'আবেদন সম্পর্কে আপডেট - Application Update',
      template: ApplicationStatusEmail,
      data: {
        workerName: workerData.name,
        jobTitle: jobData.title,
        employerName: jobData.employerName || 'Employer',
        status: status as 'accepted' | 'rejected',
        message: status === 'accepted'
          ? 'Congratulations! Your application has been accepted. The employer will contact you soon.'
          : 'Thank you for your interest. We found a candidate with different requirements. Please check our other job listings.',
        employerContact: status === 'accepted' ? (jobData.contact || jobData.employerPhone) : undefined,
        dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      },
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Send status email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
