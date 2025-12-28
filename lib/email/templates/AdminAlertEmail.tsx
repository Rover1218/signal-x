import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Button,
} from '@react-email/components';
import * as React from 'react';

interface AdminAlertEmailProps {
    alertType: 'high-risk' | 'low-supply' | 'stats-change';
    districtName: string;
    blockName?: string;
    supplyCount: number;
    demandCount: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    aiSummary?: string;
    dashboardUrl: string;
}

export default function AdminAlertEmail({
    alertType,
    districtName,
    blockName,
    supplyCount,
    demandCount,
    riskLevel,
    description,
    aiSummary,
    dashboardUrl,
}: AdminAlertEmailProps) {
    const getRiskColor = () => {
        switch (riskLevel) {
            case 'critical': return '#DC2626';
            case 'high': return '#F59E0B';
            case 'medium': return '#3B82F6';
            default: return '#10B981';
        }
    };

    const getRiskLabel = () => {
        switch (riskLevel) {
            case 'critical': return '🚨 CRITICAL';
            case 'high': return '⚠️ HIGH RISK';
            case 'medium': return '⚡ MEDIUM RISK';
            default: return '✅ LOW RISK';
        }
    };

    const supplyDemandRatio = supplyCount > 0 ? ((supplyCount / demandCount) * 100).toFixed(1) : '0';

    return (
        <Html>
            <Head />
            <Preview>
                {getRiskLabel()} Alert: {districtName} {blockName ? `- ${blockName}` : ''}
            </Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={{ ...header, background: getRiskColor() }}>
                        <Heading style={h1}>SignalX Admin Alert</Heading>
                        <Text style={tagline}>{getRiskLabel()}</Text>
                    </Section>

                    {/* Alert Summary */}
                    <Section style={alertBox}>
                        <Heading style={alertTitle}>
                            {alertType === 'high-risk' && 'High Migration Risk Area Detected'}
                            {alertType === 'low-supply' && 'Low Employment Supply Alert'}
                            {alertType === 'stats-change' && 'Significant Statistics Change'}
                        </Heading>

                        <Text style={location}>
                            <strong>📍 Location:</strong> {districtName}{blockName ? ` → ${blockName}` : ''}
                        </Text>
                    </Section>

                    {/* Metrics */}
                    <Section style={metricsContainer}>
                        <div style={metricBox}>
                            <Text style={metricLabel}>Available Jobs (Supply)</Text>
                            <Text style={metricValue}>{supplyCount.toLocaleString()}</Text>
                        </div>
                        <div style={metricBox}>
                            <Text style={metricLabel}>Job Seekers (Demand)</Text>
                            <Text style={metricValue}>{demandCount.toLocaleString()}</Text>
                        </div>
                        <div style={metricBox}>
                            <Text style={metricLabel}>Supply/Demand Ratio</Text>
                            <Text style={{ ...metricValue, color: getRiskColor() }}>
                                {supplyDemandRatio}%
                            </Text>
                        </div>
                    </Section>

                    {/* Description */}
                    <Section style={descriptionBox}>
                        <Text style={descriptionText}>
                            <strong>Analysis:</strong>
                        </Text>
                        <Text style={descriptionText}>{description}</Text>
                    </Section>

                    {/* AI Summary (if provided) */}
                    {aiSummary && (
                        <Section style={aiSummaryBox}>
                            <Text style={aiSummaryTitle}>
                                <strong>🤖 AI Insights:</strong>
                            </Text>
                            <Text style={aiSummaryText}>{aiSummary}</Text>
                        </Section>
                    )}

                    {/* Recommended Actions */}
                    <Section style={actionsBox}>
                        <Text style={actionsTitle}>
                            <strong>Recommended Actions:</strong>
                        </Text>
                        {riskLevel === 'critical' || riskLevel === 'high' ? (
                            <>
                                <Text style={actionItem}>
                                    • Immediately notify local authorities and employment cell
                                </Text>
                                <Text style={actionItem}>
                                    • Activate MGNREGA work creation in affected blocks
                                </Text>
                                <Text style={actionItem}>
                                    • Deploy job counselors for migration deterrence
                                </Text>
                                <Text style={actionItem}>
                                    • Engage with employers to post urgent job opportunities
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={actionItem}>
                                    • Monitor supply-demand trends closely
                                </Text>
                                <Text style={actionItem}>
                                    • Encourage local business engagement
                                </Text>
                                <Text style={actionItem}>
                                    • Review government scheme implementation
                                </Text>
                            </>
                        )}
                    </Section>

                    {/* CTA Button */}
                    <Section style={buttonContainer}>
                        <Button style={button} href={`${dashboardUrl}/dashboard/analytics`}>
                            View Full Dashboard
                        </Button>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            SignalX Hyperlocal Livelihood Intelligence Platform
                        </Text>
                        <Text style={footerText}>
                            This is an automated alert. Review dashboard for detailed analysis.
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
    maxWidth: '700px',
};

const header = {
    padding: '32px 24px',
    textAlign: 'center' as const,
};

const h1 = {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: '700',
    margin: '0',
};

const tagline = {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    margin: '8px 0 0',
};

const alertBox = {
    padding: '24px',
    borderLeft: '4px solid #DC2626',
    background: '#fef2f2',
};

const alertTitle = {
    fontSize: '22px',
    fontWeight: '600',
    color: '#DC2626',
    margin: '0 0 12px',
};

const location = {
    fontSize: '16px',
    color: '#334155',
    margin: '8px 0',
};

const metricsContainer = {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '24px',
    background: '#f8fafc',
    margin: '24px',
    borderRadius: '8px',
};

const metricBox = {
    textAlign: 'center' as const,
    flex: '1',
};

const metricLabel = {
    fontSize: '12px',
    color: '#64748b',
    textTransform: 'uppercase' as const,
    fontWeight: '600',
    margin: '0 0 8px',
};

const metricValue = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1E293B',
    margin: '0',
};

const descriptionBox = {
    padding: '24px',
    background: '#fff7ed',
    borderRadius: '8px',
    margin: '24px',
};

const descriptionText = {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#334155',
    margin: '4px 0',
};

const aiSummaryBox = {
    padding: '24px',
    background: '#f0f9ff',
    borderRadius: '8px',
    margin: '24px',
    borderLeft: '4px solid #3B82F6',
};

const aiSummaryTitle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: '12px',
};

const aiSummaryText = {
    fontSize: '14px',
    lineHeight: '1.7',
    color: '#334155',
    margin: '4px 0',
    whiteSpace: 'pre-wrap' as const,
};


const actionsBox = {
    padding: '24px',
    background: '#ecfdf5',
    borderRadius: '8px',
    margin: '24px',
};

const actionsTitle = {
    fontSize: '16px',
    color: '#065f46',
    marginBottom: '12px',
};

const actionItem = {
    fontSize: '14px',
    lineHeight: '1.8',
    color: '#166534',
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
