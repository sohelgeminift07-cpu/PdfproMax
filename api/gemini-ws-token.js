export const config = { runtime: 'nodejs' };

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const GEMINI_KEYS = process.env.GEMINI_KEYS
    ? process.env.GEMINI_KEYS.split(',').map(k => k.trim()).filter(Boolean)
    : [];
  if (process.env.GEMINI_KEY_2) GEMINI_KEYS.push(process.env.GEMINI_KEY_2.trim());
  if (process.env.GEMINI_KEY_3) GEMINI_KEYS.push(process.env.GEMINI_KEY_3.trim());
  if (process.env.GEMINI_KEY_4) GEMINI_KEYS.push(process.env.GEMINI_KEY_4.trim());

  const key = GEMINI_KEYS[0] || '';
  if (!key) return res.status(500).json({ error: 'No Gemini API key configured' });

  return res.status(200).json({ key });
}
