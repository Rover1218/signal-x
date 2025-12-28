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

interface ApplicationStatusEmailProps {
    workerName: string;
    jobTitle: string;
    employerName: string;
    status: 'accepted' | 'rejected';
    message?: string;
    employerContact?: string;
    dashboardUrl: string;
}

export default function ApplicationStatusEmail({
    workerName,
    jobTitle,
    employerName,
    status,
    message,
    employerContact,
    dashboardUrl,
}: ApplicationStatusEmailProps) {
    const isAccepted = status === 'accepted';

    return (
        <Html>
            <Head />
            <Preview>
                {isAccepted ? 'আপনার আবেদন গৃহীত হয়েছে - Application Accepted' : 'আবেদন সম্পর্কে আপডেট - Application Update'}: {jobTitle}
            </Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={isAccepted ? headerAccepted : headerRejected}>
                        <Heading style={h1}>SignalX</Heading>
                        <Text style={tagline}>
                            {isAccepted ? '✅ আবেদন গৃহীত | Application Accepted' : 'আবেদন আপডেট | Application Update'}
                        </Text>
                    </Section>

                    {/* Greeting */}
                    <Text style={greeting}>
                        নমস্কার {workerName}, | Hello {workerName},
                    </Text>

                    {/* Main Message */}
                    {isAccepted ? (
                        <>
                            <Text style={paragraph}>
                                <strong>শুভ সংবাদ!</strong> আপনার আবেদন গৃহীত হয়েছে।
                            </Text>
                            <Text style={paragraph}>
                                <strong>Good news!</strong> Your application has been accepted.
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={paragraph}>
                                আপনার আবেদন সম্পর্কে আপডেট আছে।
                            </Text>
                            <Text style={paragraph}>
                                We have an update about your application.
                            </Text>
                        </>
                    )}

                    {/* Job Details */}
                    <Section style={jobCard}>
                        <Heading style={jobTitle}>{jobTitle}</Heading>
                        <Text style={jobDetail}>
                            <strong>নিয়োগকর্তা | Employer:</strong> {employerName}
                        </Text>
                        {employerContact && isAccepted && (
                            <Text style={jobDetail}>
                                <strong>যোগাযোগ | Contact:</strong> {employerContact}
                            </Text>
                        )}
                    </Section>

                    {/* Custom Message */}
                    {message && (
                        <Section style={messageBox}>
                            <Text style={messageText}>
                                <strong>বার্তা | Message:</strong>
                            </Text>
                            <Text style={messageText}>{message}</Text>
                        </Section>
                    )}

                    {/* CTA Button */}
                    {isAccepted ? (
                        <Section style={buttonContainer}>
                            <Button style={button} href={`${dashboardUrl}/applications`}>
                                আমার আবেদনগুলি দেখুন | View My Applications
                            </Button>
                        </Section>
                    ) : (
                        <>
                            <Text style={paragraph}>
                                আরও সুযোগের জন্য আমাদের কাজের তালিকা দেখুন।
                            </Text>
                            <Text style={paragraph}>
                                Check out our job listings for more opportunities!
                            </Text>
                            <Section style={buttonContainer}>
                                <Button style={button} href={`${dashboardUrl}/jobs`}>
                                    আরও কাজ খুঁজুন | Find More Jobs
                                </Button>
                            </Section>
                        </>
                    )}

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            SignalX - আপনার জীবিকার সঙ্গী | Your Livelihood Partner
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

const headerAccepted = {
    padding: '32px 24px',
    background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    textAlign: 'center' as const,
};

const headerRejected = {
    padding: '32px 24px',
    background: 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)',
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
    margin: '24px',
};

const jobTitle = {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: '16px',
};

const jobDetail = {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#334155',
    margin: '8px 0',
};

const messageBox = {
    background: '#fef3c7',
    borderLeft: '4px solid #f59e0b',
    padding: '16px 24px',
    margin: '24px',
    borderRadius: '4px',
};

const messageText = {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#334155',
    margin: '4px 0',
};

const buttonContainer = {
    padding: '24px',
    textAlign: 'center' as const,
};

const button = {
    backgroundColor: '#1E40AF',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '14px 32px',
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
