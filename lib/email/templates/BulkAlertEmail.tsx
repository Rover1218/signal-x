import { Html, Body, Container, Section, Heading, Text, Link } from '@react-email/components';
import React from 'react';

interface AlertReport {
    alertType: string;
    districtName: string;
    blockName?: string;
    supplyCount: number;
    demandCount: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    aiSummary?: string;
    isEstimated?: boolean;
}

interface BulkAlertEmailProps {
    reports: AlertReport[];
}

export const BulkAlertEmail = ({ reports }: BulkAlertEmailProps) => {
    // Determine overall risk summary
    const highRiskCount = reports.filter(r => ['critical', 'high'].includes(r.riskLevel)).length;
    const criticalCount = reports.filter(r => r.riskLevel === 'critical').length;

    return (
        <Html>
            <Body style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                backgroundColor: '#f1f5f9',
                padding: '40px 0',
                margin: 0
            }}>
                <Container style={{
                    backgroundColor: '#ffffff',
                    padding: '0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    maxWidth: '600px',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <Section style={{
                        backgroundImage: 'linear-gradient(to right, #2563eb, #4f46e5)',
                        backgroundColor: '#2563eb', // Fallback
                        padding: '40px 24px',
                        textAlign: 'center'
                    }}>
                        <Heading style={{
                            margin: 0,
                            color: '#ffffff',
                            fontSize: '28px',
                            fontWeight: '800',
                            letterSpacing: '-0.5px',
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            SignalX Intelligence
                        </Heading>
                        <Text style={{
                            margin: '8px 0 0',
                            color: '#e0e7ff',
                            fontSize: '15px',
                            fontWeight: '500'
                        }}>
                            West Bengal Migration Surveillance Report
                        </Text>
                    </Section>

                    {/* Summary Stats */}
                    <Section style={{
                        padding: '24px',
                        borderBottom: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <Text style={{ margin: 0, color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                                    Districts Analyzed
                                </Text>
                                <Text style={{ margin: '4px 0 0', color: '#0f172a', fontSize: '24px', fontWeight: 'bold' }}>
                                    {reports.length}
                                </Text>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <Text style={{ margin: 0, color: '#dc2626', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                                    Critical / High Risk
                                </Text>
                                <Text style={{ margin: '4px 0 0', color: '#dc2626', fontSize: '24px', fontWeight: 'bold' }}>
                                    {highRiskCount}
                                </Text>
                            </div>
                        </div>
                    </Section>

                    {/* Reports List */}
                    <Section style={{ padding: '24px' }}>
                        {reports.map((report, idx) => {
                            const isCritical = report.riskLevel === 'critical';
                            const isHigh = report.riskLevel === 'high';
                            const borderColor = isCritical ? '#ef4444' : isHigh ? '#f59e0b' : '#3b82f6';
                            const badgeBg = isCritical ? '#fef2f2' : isHigh ? '#fffbeb' : '#eff6ff';
                            const badgeColor = isCritical ? '#991b1b' : isHigh ? '#92400e' : '#1e40af';

                            return (
                                <div key={idx} style={{
                                    marginBottom: '20px',
                                    padding: '20px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderLeft: `4px solid ${borderColor}`,
                                    borderRadius: '8px',
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <Text style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                                            {report.districtName}
                                            {report.blockName && <span style={{ color: '#64748b', fontWeight: '400', fontSize: '16px' }}> • {report.blockName}</span>}
                                        </Text>
                                        <span style={{
                                            backgroundColor: badgeBg,
                                            color: badgeColor,
                                            padding: '4px 12px',
                                            borderRadius: '9999px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase'
                                        }}>
                                            {report.riskLevel} Risk
                                        </span>
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '12px',
                                        marginBottom: '16px',
                                        backgroundColor: '#f8fafc',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <Text style={{ margin: 0, fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                                                Available Jobs
                                            </Text>
                                            <Text style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                                                {report.supplyCount.toLocaleString()}
                                            </Text>
                                        </div>
                                        <div style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>
                                            <Text style={{ margin: 0, fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>
                                                Job Seekers
                                            </Text>
                                            <Text style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                                                {report.demandCount.toLocaleString()}
                                            </Text>
                                        </div>
                                    </div>

                                    <Text style={{ margin: '0 0 16px', fontSize: '14px', lineHeight: '24px', color: '#334155' }}>
                                        {report.description}
                                    </Text>

                                    {/* AI Summary Section */}
                                    {report.aiSummary && (
                                        <div style={{
                                            backgroundColor: '#f0f9ff', // Light blue background for AI
                                            padding: '16px',
                                            borderRadius: '8px',
                                            border: '1px solid #bae6fd'
                                        }}>
                                            <Text style={{
                                                margin: '0 0 8px',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                color: '#0369a1',
                                                textTransform: 'uppercase',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                🤖 AI Insights {report.isEstimated && <span style={{ backgroundColor: '#e0f2fe', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', marginLeft: '6px' }}>ESTIMATED DATA</span>}
                                            </Text>
                                            <Text style={{ margin: 0, fontSize: '14px', lineHeight: '22px', color: '#0c4a6e', fontStyle: 'normal' }}>
                                                {/* Clean up the text by removing the redundant prefix if it exists */}
                                                {report.aiSummary.replace(/^\(AI ESTIMATED DATA\)\s*/i, '').replace(/^AI Summary:\s*/i, '')}
                                            </Text>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </Section>

                    <Section style={{ textAlign: 'center', padding: '0 24px 32px' }}>
                        <Link
                            href={`${process.env.NEXT_PUBLIC_APP_URL}/admin`}
                            style={{
                                display: 'inline-block',
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                padding: '14px 32px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600',
                                fontSize: '16px',
                                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                            }}
                        >
                            Open Live Dashboard
                        </Link>
                        <Text style={{ marginTop: '24px', fontSize: '12px', color: '#94a3b8' }}>
                            © {new Date().getFullYear()} SignalX Intelligence System. All rights reserved.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default BulkAlertEmail;
