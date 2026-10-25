import { NextRequest, NextResponse } from 'next/server';
import { TONES, type Tone } from '@/lib/types';

export const runtime = 'nodejs';
const SYSTEM_PROMPT = `You are ToneTranslator, a precise message editor. Rewrite the user's message for the requested tone(s), optionally taking the recipient into account.
Non-negotiable rules:
- Preserve the original meaning, intent, facts, names, dates, promises, requests, and level of certainty.
- Change only tone, style, and wording. Never invent context, add claims, commitments, details, or assumptions.
- Do not omit important information. Keep the language natural and suitable for the stated recipient.
- If the source is ambiguous, preserve the ambiguity rather than guessing.
- Return valid JSON only, in this exact shape: {"results":[{"tone":"Professional","text":"...","explanation":"..."}]}
- Return one result per requested tone. Each explanation should be a concise sentence describing the stylistic change, not a claim about changed meaning.
- Keep the rewritten message in the same language as the original unless the user explicitly asks otherwise.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const recipient = typeof body.recipient === 'string' ? body.recipient.trim().slice(0, 120) : '';
    const tones: Tone[] = Array.isArray(body.tones) ? body.tones.filter((tone: unknown): tone is Tone => typeof tone === 'string' && TONES.includes(tone as Tone)).slice(0, 3) : [];

    if (!message) return NextResponse.json({ error: 'Add a message first, then choose a tone.' }, { status: 400 });
    if (message.length > 6000) return NextResponse.json({ error: 'Please keep your message under 6,000 characters.' }, { status: 400 });
    if (!tones.length) return NextResponse.json({ error: 'Choose at least one tone (up to three).' }, { status: 400 });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI is not configured yet. Add GROQ_API_KEY to your .env.local file and restart the app.' }, { status: 503 });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        temperature: 0.35,
        max_tokens: 1800,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify({ originalMessage: message, recipient: recipient || 'Not specified', requestedTones: tones }) },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('Groq API error:', response.status, detail);
      return NextResponse.json({ error: response.status === 401 ? 'The AI API key was rejected. Check GROQ_API_KEY.' : 'The AI service could not complete the rewrite. Please try again.' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== 'string') throw new Error('The AI returned an empty response.');
    const parsed = JSON.parse(content);
    const allowed = new Set(tones);
    const results = Array.isArray(parsed.results) ? parsed.results.filter((r: any) => r && allowed.has(r.tone) && typeof r.text === 'string' && typeof r.explanation === 'string').map((r: any) => ({ tone: r.tone, text: r.text.trim(), explanation: r.explanation.trim() })).slice(0, tones.length) : [];
    if (!results.length) throw new Error('The AI response did not contain valid results.');
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Rewrite route error:', error);
    return NextResponse.json({ error: 'Something went wrong while rewriting your message. Please try again.' }, { status: 500 });
  }
}
