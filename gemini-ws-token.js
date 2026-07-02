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

  return res.status(403).json({
    error: 'Direct API key exposure is disabled for security reasons. Vercel does not support WebSocket proxying. For the Live Audio feature, use the local dev server (npm start) which includes a secure proxy, or use a restricted Gemini API key if client-side exposure is acceptable for your use case.'
  });
}
