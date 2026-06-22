export const config = { runtime: 'nodejs' };

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.status(200).json({
    GEMINI_KEYS: process.env.GEMINI_KEYS ? process.env.GEMINI_KEYS.split(',').map((k) => k.trim()).filter(Boolean) : [],
    GROQ_API_KEY: process.env.GROQ_API_KEY || '',
    MAVERICK_KEY: process.env.MAVERICK_KEY || '',
  });
}
