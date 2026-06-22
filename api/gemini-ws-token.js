export const config = { runtime: 'nodejs' };

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const GEMINI_KEYS = process.env.GEMINI_KEYS
    ? process.env.GEMINI_KEYS.split(',')
    : [];

  const key = GEMINI_KEYS[0] ? GEMINI_KEYS[0].trim() : '';
  if (!key) return res.status(500).json({ error: 'No Gemini API key configured' });

  return res.status(200).json({ key });
}
