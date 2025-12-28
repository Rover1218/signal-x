import { NextRequest, NextResponse } from 'next/server';
import { sendAdminAlert } from '@/lib/email/emailService';
import BulkAlertEmail from '@/lib/email/templates/BulkAlertEmail';

export async function POST(request: NextRequest) {
    try {
        const { reports } = await request.json();

        if (!reports || !Array.isArray(reports) || reports.length === 0) {
            return NextResponse.json({ error: 'No reports data provided' }, { status: 400 });
        }

        const highRiskCount = reports.filter(r => ['critical', 'high'].includes(r.riskLevel)).length;

        // Send email with the imported template
        await sendAdminAlert({
            subject: `📢 West Bengal Migration Summary: ${reports.length} Districts Analyzed`,
            template: BulkAlertEmail,
            data: { reports }
        });

        return NextResponse.json({ success: true, message: 'Bulk report sent' });
    } catch (error) {
        console.error('Bulk email error:', error);
        return NextResponse.json({ error: 'Failed to send bulk email' }, { status: 500 });
    }
}
