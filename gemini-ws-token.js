// Vercel Serverless Function — supplies the Gemini API key used to open the
// client-side WebSocket connection for the Live Audio (streaming TTS)
// feature.
//
// NOTE ON SECURITY: Gemini's Live API (BidiGenerateContent over WebSocket)
// is opened directly from the browser, so the key is necessarily visible on
// that connection. To limit blast radius, create a separate, restricted
// Gemini API key for this purpose if possible (e.g. restrict it to the
// Live API / low quota) rather than reusing a high-privilege key.
//
// Env var: GEMINI_API_KEY (same variable used by /api/gemini). If you set
// multiple comma-separated keys, the first one is used here.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const rawKeys = process.env.GEMINI_API_KEY || '';
  const key = rawKeys.split(',').map((k) => k.trim()).filter(Boolean)[0];

  if (!key) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured. Add it in Vercel → Settings → Environment Variables.',
    });
  }

  return res.status(200).json({ key });
}
