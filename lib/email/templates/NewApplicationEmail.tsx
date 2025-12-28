import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface NewApplicationEmailProps {
    employerName: string;
    workerName: string;
    workerPhone: string;
    workerEmail?: string;
    jobTitle: string;
    workerSkills: string[];
    workerExperience: number;
    workerEducation: string;
    applicationId: string;
    dashboardUrl: string;
}

export default function NewApplicationEmail({
    employerName,
    workerName,
    workerPhone,
    workerEmail,
    jobTitle,
    workerSkills,
    workerExperience,
    workerEducation,
    applicationId,
    dashboardUrl,
}: NewApplicationEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>New Application Received: {workerName} applied for {jobTitle}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={header}>
                        <Heading style={h1}>SignalX</Heading>
                        <Text style={tagline}>📋 New Application Received</Text>
                    </Section>

                    {/* Greeting */}
                    <Text style={greeting}>
                        Hello {employerName},
                    </Text>

                    {/* Main Message */}
                    <Text style={paragraph}>
                        You have received a new application for your job posting.
                    </Text>

                    {/* Job Details */}
                    <Section style={jobCard}>
                        <Heading style={jobTitleStyle}>{jobTitle}</Heading>
                        <Text style={labelStyle}>Applicant Details:</Text>
                    </Section>

                    {/* Applicant Info */}
                    <Section style={applicantCard}>
                        <Text style={applicantName}>{workerName}</Text>

                        <Text style={detail}>
                            <strong>📞 Phone:</strong> {workerPhone}
                        </Text>
                        {workerEmail && (
                            <Text style={detail}>
                                <strong>✉️ Email:</strong> {workerEmail}
                            </Text>
                        )}
                        <Text style={detail}>
                            <strong>💼 Experience:</strong> {workerExperience} years
                        </Text>
                        <Text style={detail}>
                            <strong>🎓 Education:</strong> {workerEducation}
                        </Text>
                        <Text style={detail}>
                            <strong>🔧 Skills:</strong> {workerSkills.join(', ')}
                        </Text>
                    </Section>

                    {/* CTA Buttons */}
                    <Section style={buttonContainer}>
                        <Button
                            style={acceptButton}
                            href={`${dashboardUrl}/dashboard/applications?action=accept&id=${applicationId}`}
                        >
                            ✅ Accept Application
                        </Button>
                        <Button
                            style={rejectButton}
                            href={`${dashboardUrl}/dashboard/applications?action=reject&id=${applicationId}`}
                        >
                            ❌ Decline
                        </Button>
                    </Section>

                    <Section style={buttonContainer}>
                        <Button
                            style={viewButton}
                            href={`${dashboardUrl}/dashboard/applications`}
                        >
                            View All Applications
                        </Button>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            SignalX - Connecting Employers and Workers
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

// Styles
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    maxWidth: '600px',
};

const header = {
    padding: '32px 24px',
    background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
    textAlign: 'center' as const,
};

const h1 = {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: '700',
    margin: '0',
    padding: '0',
};

const tagline = {
    color: '#ffffff',
    fontSize: '14px',
    margin: '8px 0 0',
};

const greeting = {
    fontSize: '18px',
    lineHeight: '1.4',
    color: '#484848',
    padding: '24px 24px 0',
};

const paragraph = {
    fontSize: '16px',
    lineHeight: '1.4',
    color: '#484848',
    padding: '0 24px',
};

const jobCard = {
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    margin: '24px 24px 0',
};

const jobTitleStyle = {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1E40AF',
    margin: '0 0 16px',
};

const labelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase' as const,
    margin: '16px 0 0',
};

const applicantCard = {
    background: '#ffffff',
    borderRadius: '8px',
    border: '2px solid #3B82F6',
    padding: '24px',
    margin: '8px 24px 24px',
};

const applicantName = {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1E293B',
    margin: '0 0 16px',
};

const detail = {
    fontSize: '15px',
    lineHeight: '1.8',
    color: '#334155',
    margin: '8px 0',
};

const buttonContainer = {
    padding: '12px 24px',
    textAlign: 'center' as const,
};

const acceptButton = {
    backgroundColor: '#10B981',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '14px 32px',
    margin: '0 8px',
};

const rejectButton = {
    backgroundColor: '#EF4444',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '14px 32px',
    margin: '0 8px',
};

const viewButton = {
    backgroundColor: '#6B7280',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 28px',
};

const footer = {
    padding: '24px 24px 0',
    borderTop: '1px solid #e2e8f0',
    marginTop: '32px',
    textAlign: 'center' as const,
};

const footerText = {
    fontSize: '12px',
    lineHeight: '1.5',
    color: '#8898aa',
    margin: '8px 0',
};
