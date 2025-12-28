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

interface JobAlertEmailProps {
    workerName: string;
    jobTitle: string;
    employerName: string;
    location: string;
    salary: string;
    skills: string[];
    jobId: string;
    dashboardUrl: string;
}

export default function JobAlertEmail({
    workerName,
    jobTitle,
    employerName,
    location,
    salary,
    skills,
    jobId,
    dashboardUrl,
}: JobAlertEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>নতুন কাজের সুযোগ - New Job Opportunity: {jobTitle}</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={header}>
                        <Heading style={h1}>SignalX</Heading>
                        <Text style={tagline}>নতুন কাজের সুযোগ | New Job Alert</Text>
                    </Section>

                    {/* Greeting */}
                    <Text style={greeting}>
                        নমস্কার {workerName}, | Hello {workerName},
                    </Text>

                    {/* Main Message */}
                    <Text style={paragraph}>
                        আপনার দক্ষতা এবং এলাকার সাথে মিলে যায় এমন একটি নতুন কাজ পাওয়া গেছে।
                    </Text>
                    <Text style={paragraph}>
                        A new job matching your skills and location is now available!
                    </Text>

                    {/* Job Details Card */}
                    <Section style={jobCard}>
                        <Heading style={jobTitle}>{jobTitle}</Heading>

                        <Text style={jobDetail}>
                            <strong>নিয়োগকর্তা | Employer:</strong> {employerName}
                        </Text>
                        <Text style={jobDetail}>
                            <strong>অবস্থান | Location:</strong> {location}
                        </Text>
                        <Text style={jobDetail}>
                            <strong>বেতন | Salary:</strong> ₹{salary}
                        </Text>
                        <Text style={jobDetail}>
                            <strong>প্রয়োজনীয় দক্ষতা | Skills:</strong> {skills.join(', ')}
                        </Text>
                    </Section>

                    {/* CTA Button */}
                    <Section style={buttonContainer}>
                        <Button
                            style={button}
                            href={`${dashboardUrl}/jobs/${jobId}`}
                        >
                            এখনই আবেদন করুন | Apply Now
                        </Button>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            আপনি এই ইমেল পাচ্ছেন কারণ আপনি SignalX-এ চাকরির সতর্কতার জন্য সদস্যতা নিয়েছেন।
                        </Text>
                        <Text style={footerText}>
                            You're receiving this because you subscribed to job alerts on SignalX.
                        </Text>
                        <Text style={link}>
                            <a href={`${dashboardUrl}/profile/settings`}>
                                সদস্যতা বাতিল করুন | Unsubscribe
                            </a>
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
};

const footerText = {
    fontSize: '12px',
    lineHeight: '1.5',
    color: '#8898aa',
    margin: '8px 0',
};

const link = {
    fontSize: '12px',
    color: '#1E40AF',
    margin: '8px 0',
};
