'use server';

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface ModerationResult {
    isSafe: boolean;
    reason?: string;
}

export async function checkJobSafety(title: string, description: string): Promise<ModerationResult> {
    // Fail-safe: If no API key, default to manual review
    if (!GROQ_API_KEY) {
        console.warn('Groq API key missing. Defaulting to manual review.');
        return { isSafe: false, reason: 'Auto-moderation unavailable. Pending admin review.' };
    }

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: `You are a job moderation AI for SignalX, a livelihood platform in West Bengal.

REJECT jobs that contain:
- Illegal activities (drugs, weapons, etc.)
- Scams or pyramid schemes ("earn ₹50,000/week from home")
- Hate speech or discrimination
- Adult/explicit content
- Extremely vague offers with no real job details

APPROVE legitimate jobs like:
- Agriculture, construction, driving, tailoring, etc.
- Clear job descriptions with location and salary
- MGNREGA, government schemes, MSMEs
- Local businesses hiring workers

Respond ONLY with JSON: { "safe": true/false, "reason": "brief explanation" }`
                    },
                    {
                        role: 'user',
                        content: `Moderate this job:\nTitle: "${title}"\nDescription: "${description}"`
                    }
                ],
                temperature: 0.2,
                max_tokens: 150,
            }),
        });

        if (!response.ok) {
            throw new Error(`Groq API Error: ${response.statusText}`);
        }

        const data = await response.json();
        let output = data.choices?.[0]?.message?.content || '';

        console.log('🤖 Groq AI Response:', output);

        try {
            output = output.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(output);
            console.log('✅ Moderation Result:', parsed);
            return {
                isSafe: parsed.safe === true,
                reason: parsed.reason || ''
            };
        } catch (e) {
            const lower = output.toLowerCase();
            const isSafe = !lower.includes('unsafe') && !lower.includes('reject') && !lower.includes('flag');
            console.log('⚠️ Fallback Moderation:', { isSafe, reason: output });
            return { isSafe, reason: output };
        }

    } catch (error) {
        console.error('❌ Moderation Check Failed:', error);
        return {
            isSafe: false,
            reason: 'Auto-moderation failed. Pending admin review.'
        };
    }
}
