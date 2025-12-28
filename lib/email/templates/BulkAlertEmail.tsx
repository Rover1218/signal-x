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
    // Determine overall risk
    const highRiskCount = reports.filter(r => ['critical', 'high'].includes(r.riskLevel)).length;

    return (
        <Html>
            <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f6f9fc', padding: '20px' }}>
                <Container style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px' }}>
                    <Section style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
                        <Heading style={{ margin: 0, color: '#1e293b' }}>West Bengal Migration Risk Report</Heading>
                        <Text style={{ marginTop: '8px', color: '#64748b' }}>
                            {reports.length} Districts Analyzed • {highRiskCount} High/Critical Risk Areas
                        </Text>
                    </Section>

                    {reports.map((report, idx) => (
                        <Section key={idx} style={{
                            marginBottom: '20px',
                            padding: '16px',
                            backgroundColor: report.riskLevel === 'critical' ? '#fef2f2' : report.riskLevel === 'high' ? '#fff7ed' : '#f8fafc',
                            borderLeft: `4px solid ${report.riskLevel === 'critical' ? '#dc2626' :
                                    report.riskLevel === 'high' ? '#f59e0b' :
                                        report.riskLevel === 'medium' ? '#3b82f6' : '#10b981'
                                }`,
                            borderRadius: '4px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <Text style={{ margin: 0, fontWeight: 'bold', color: '#334155' }}>
                                    {report.districtName} {report.blockName ? `(${report.blockName})` : ''}
                                </Text>
                                <Text style={{ margin: 0, fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px', color: report.riskLevel === 'critical' ? '#dc2626' : '#64748b' }}>
                                    {report.riskLevel} Risk
                                </Text>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                <Text style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                                    Supply (Jobs): <span style={{ color: '#1e293b', fontWeight: 'bold' }}>{report.supplyCount}</span>
                                </Text>
                                <Text style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                                    Demand (Seekers): <span style={{ color: '#1e293b', fontWeight: 'bold' }}>{report.demandCount}</span>
                                </Text>
                            </div>

                            <Text style={{ margin: '8px 0', fontSize: '14px', color: '#475569' }}>
                                {report.description}
                            </Text>

                            {/* Show truncated AI summary if present */}
                            {report.aiSummary && (
                                <Text style={{
                                    margin: '8px 0 0',
                                    fontSize: '12px',
                                    color: '#64748b',
                                    fontStyle: 'italic',
                                    borderTop: '1px dashed #cbd5e1',
                                    paddingTop: '8px'
                                }}>
                                    🤖 AI: {report.aiSummary.substring(0, 150)}...
                                </Text>
                            )}
                        </Section>
                    ))}

                    <Section style={{ textAlign: 'center', marginTop: '32px' }}>
                        <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/admin`} style={{ backgroundColor: '#1E40AF', color: '#ffffff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
                            Open Admin Dashboard
                        </Link>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default BulkAlertEmail;
