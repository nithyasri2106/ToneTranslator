export const TONES = ['Professional', 'Friendly', 'Firm / Assertive', 'Empathetic', 'Concise', 'Formal', 'Casual / Gen-Z'] as const;
export type Tone = typeof TONES[number];
export type RewriteResult = { tone: Tone; text: string; explanation: string };
