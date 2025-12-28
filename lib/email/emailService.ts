import nodemailer from 'nodemailer';
import { render } from '@react-email/components';

// SMTP Configuration from environment variables
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

// Verify SMTP connection
export async function verifyEmailService() {
    try {
        await transporter.verify();
        console.log('✅ Email service ready');
        return true;
    } catch (error) {
        console.error('❌ Email service error:', error);
        return false;
    }
}

// Send email using React Email template
export async function sendEmail({
    to,
    subject,
    template,
    data,
}: {
    to: string;
    subject: string;
    template: any;
    data: any;
}) {
    try {
        const html = await render(template(data));

        const info = await transporter.sendMail({
            from: `${process.env.SMTP_FROM_NAME || 'SignalX'} <${process.env.SMTP_FROM_EMAIL}>`,
            to,
            subject,
            html,
        });

        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email send error:', error);
        return { success: false, error };
    }
}

// Send bulk emails (for job alerts to multiple workers)
export async function sendBulkEmails({
    recipients,
    subject,
    template,
    data,
}: {
    recipients: string[];
    subject: string;
    template: any;
    data: any;
}) {
    const results = await Promise.allSettled(
        recipients.map((email) =>
            sendEmail({ to: email, subject, template, data })
        )
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.log(`📧 Bulk email complete: ${successful} sent, ${failed} failed`);
    return { successful, failed, results };
}

// Send admin alert email
export async function sendAdminAlert({
    subject,
    template,
    data,
}: {
    subject: string;
    template: any;
    data: any;
}) {
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
        console.warn('⚠️ Admin email not configured');
        return { success: false, error: 'Admin email not set' };
    }

    return sendEmail({
        to: adminEmail,
        subject,
        template,
        data,
    });
}
