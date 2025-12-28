import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { sendAdminAlert } from '@/lib/email/emailService';
import AdminAlertEmail from '@/lib/email/templates/AdminAlertEmail';
import { analyzeLivelihood } from '@/app/lib/gemini';

// Check supply-demand and send admin alerts
// Check supply-demand and send admin alerts
export async function POST(request: NextRequest) {
    try {
        const { districtName, blockName, dryRun } = await request.json();

        if (!districtName) {
            return NextResponse.json(
                { error: 'Missing district name' },
                { status: 400 }
            );
        }

        // 1. Initial Data Fetch from DB
        const jobsRef = collection(db, 'jobs');
        let jobQuery = query(jobsRef, where('district', '==', districtName));
        if (blockName) jobQuery = query(jobsRef, where('block', '==', blockName));
        const jobSnapshot = await getCountFromServer(jobQuery);
        let supplyCount = jobSnapshot.data().count;

        const workersRef = collection(db, 'workers');
        let workerQuery = query(workersRef, where('district', '==', districtName));
        if (blockName) workerQuery = query(workersRef, where('block', '==', blockName));
        const workerSnapshot = await getCountFromServer(workerQuery);
        let demandCount = workerSnapshot.data().count;

        // Variables for Alert
        let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
        let alertType: 'high-risk' | 'low-supply' | 'stats-change' = 'stats-change';
        let aiSummary = '';
        let description = '';

        // 2. Logic Branch: AI Fallback vs Real Data
        if (supplyCount === 0 && demandCount === 0) {
            // ---> AI ESTIMATION PATH <---
            try {
                console.log(`No data for ${districtName}, requesting AI estimates...`);
                const estimateQuery = `
                    Generate realistic ESTIMATED employment statistics for ${districtName}${blockName ? `, ${blockName}` : ''}, West Bengal.
                    Return ONLY a valid JSON object (no markdown, no comments):
                    {
                        "supply": <number_jobs>,
                        "demand": <number_seekers>,
                        "risk": "<critical|high|medium|low>",
                        "analysis": "<short_text_analysis>"
                    }
                    Based on real-world socio-economic data for this region.
                `;

                const aiResponse = await analyzeLivelihood(estimateQuery);
                const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                const estimates = JSON.parse(cleanJson);

                // Override counts with AI estimates
                supplyCount = typeof estimates.supply === 'number' ? estimates.supply : 50;
                demandCount = typeof estimates.demand === 'number' ? estimates.demand : 500;

                // Map risk
                const aiRisk = estimates.risk?.toLowerCase() || 'high';
                if (['critical', 'high', 'medium', 'low'].includes(aiRisk)) {
                    riskLevel = aiRisk as any;
                } else {
                    riskLevel = 'high';
                }

                aiSummary = `(AI ESTIMATED DATA) ${estimates.analysis}`;
                description = `Data estimated by AI due to lack of live records. Analysis suggests ${riskLevel} migration risk.`;

                // Set alert type based on mapped risk
                if (riskLevel === 'critical') alertType = 'high-risk';
                else if (riskLevel === 'high') alertType = 'low-supply';
                else alertType = 'stats-change';

            } catch (e) {
                console.error('AI estimation failed:', e);
                // Hard fallback if AI fails
                return NextResponse.json({ success: true, message: 'No data and AI failed' });
            }

        } else {
            // ---> REAL DATA PATH <---
            const ratio = demandCount > 0 ? supplyCount / demandCount : 0;

            if (ratio < 0.1) {
                riskLevel = 'critical';
                alertType = 'high-risk';
            } else if (ratio < 0.2) {
                riskLevel = 'high';
                alertType = 'low-supply';
            } else if (ratio < 0.4) {
                riskLevel = 'medium';
                alertType = 'stats-change';
            } else {
                riskLevel = 'low';
                alertType = 'stats-change';
            }

            // Generate AI analysis for real data if risk is significant
            if (riskLevel !== 'low') {
                try {
                    const aiQuery = `Analyze: ${districtName}. Supply: ${supplyCount}, Demand: ${demandCount}. Risk: ${riskLevel}. Brief root cause & actions.`;
                    aiSummary = await analyzeLivelihood(aiQuery);
                } catch (err) { console.error(err); }
            }

            description = ratio < 0.1
                ? `Critical situation. Ratio ${(ratio * 100).toFixed(1)}%. Immediate intervention needed.`
                : `Supply-demand imbalance at ${(ratio * 100).toFixed(1)}%. Monitor closely.`;
        }

        // 3. Send Alert (Skip if low risk and no AI override)
        if (riskLevel === 'low' && !aiSummary.includes('ESTIMATED')) {
            return NextResponse.json({
                success: true,
                message: 'No alert needed - healthy ratio',
                ratio: supplyCount > 0 ? ((supplyCount / demandCount) * 100).toFixed(1) + '%' : '0%'
            });
        }

        if (dryRun) {
            return NextResponse.json({
                success: true,
                message: 'Dry run complete',
                data: {
                    alertType,
                    districtName,
                    blockName,
                    supplyCount,
                    demandCount,
                    riskLevel,
                    description,
                    aiSummary,
                    isEstimated: aiSummary.includes('ESTIMATED')
                }
            });
        }

        // Send Email
        const result = await sendAdminAlert({
            subject: `${riskLevel === 'critical' ? '🚨 CRITICAL' : riskLevel === 'high' ? '⚠️ HIGH RISK' : '⚡ MEDIUM RISK'} ALERT: ${districtName}${blockName ? ` - ${blockName}` : ''}`,
            template: AdminAlertEmail,
            data: {
                alertType,
                districtName,
                blockName,
                supplyCount,
                demandCount,
                riskLevel,
                description,
                aiSummary,
                dashboardUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            },
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Admin alert sent successfully',
                riskLevel,
                isEstimated: aiSummary.includes('ESTIMATED')
            });
        } else {
            return NextResponse.json({ error: 'Failed to send admin alert' }, { status: 500 });
        }

    } catch (error) {
        console.error('Send admin alert error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

