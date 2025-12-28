import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendAdminAlert, verifyEmailService } from '@/lib/email/emailService';
import JobAlertEmail from '@/lib/email/templates/JobAlertEmail';
import ApplicationStatusEmail from '@/lib/email/templates/ApplicationStatusEmail';
import AdminAlertEmail from '@/lib/email/templates/AdminAlertEmail';

// Test email service
export async function GET(request: NextRequest) {
    try {
        // Verify SMTP connection
        const isReady = await verifyEmailService();

        if (!isReady) {
            return NextResponse.json(
                { error: 'Email service not configured properly' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            status: 'ready',
            message: 'Email service is configured and ready',
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Email service error', details: error },
            { status: 500 }
        );
    }
}

// Send test emails
export async function POST(request: NextRequest) {
    try {
        const { type, to } = await request.json();

        if (!to) {
            return NextResponse.json(
                { error: 'Recipient email (to) is required' },
                { status: 400 }
            );
        }

        let result;

        switch (type) {
            case 'job-alert':
                result = await sendEmail({
                    to,
                    subject: 'নতুন কাজের সুযোগ - New Job Opportunity: Driver',
                    template: JobAlertEmail,
                    data: {
                        workerName: 'রাম কুমার',
                        jobTitle: 'ড্রাইভার (Driver)',
                        employerName: 'ABC Transport Company',
                        location: 'Kolkata, West Bengal',
                        salary: '15,000 - 18,000',
                        skills: ['Driving', 'License'],
                        jobId: 'test-123',
                        dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                    },
                });
                break;

            case 'application-accepted':
                result = await sendEmail({
                    to,
                    subject: 'আপনার আবেদন গৃহীত হয়েছে - Application Accepted',
                    template: ApplicationStatusEmail,
                    data: {
                        workerName: 'রাম কুমার',
                        jobTitle: 'ড্রাইভার (Driver)',
                        employerName: 'ABC Transport Company',
                        status: 'accepted',
                        message: 'Congratulations! Please visit our office tomorrow at 10 AM.',
                        employerContact: '+91 98765 43210',
                        dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                    },
                });
                break;

            case 'application-rejected':
                result = await sendEmail({
                    to,
                    subject: 'আবেদন সম্পর্কে আপডেট - Application Update',
                    template: ApplicationStatusEmail,
                    data: {
                        workerName: 'রাম কুমার',
                        jobTitle: 'ড্রাইভার (Driver)',
                        employerName: 'ABC Transport Company',
                        status: 'rejected',
                        message: 'Thank you for your interest. We found a candidate with more experience.',
                        dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                    },
                });
                break;

            case 'admin-alert':
                result = await sendAdminAlert({
                    subject: '🚨 HIGH RISK ALERT: Purulia District - Critical Supply Shortage',
                    template: AdminAlertEmail,
                    data: {
                        alertType: 'high-risk',
                        districtName: 'Purulia',
                        blockName: 'Jhalda',
                        supplyCount: 45,
                        demandCount: 523,
                        riskLevel: 'critical',
                        description: 'Supply-demand ratio has fallen to 8.6%, indicating severe employment shortage. Historical migration data shows 40% out-migration from this block. Immediate intervention recommended.',
                        dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                    },
                });
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid email type. Use: job-alert, application-accepted, application-rejected, admin-alert' },
                    { status: 400 }
                );
        }

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: `Test email sent successfully to ${to}`,
                messageId: result.messageId,
            });
        } else {
            return NextResponse.json(
                { error: 'Failed to send email', details: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Test email error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error },
            { status: 500 }
        );
    }
}
