// Vercel Serverless Function — proxies Gemini API calls so the API key
// never reaches the browser.
//
// Route: /api/gemini/:model/generateContent  (rewritten by vercel.json to
//        /api/gemini?model=:model)
//
// Env var: GEMINI_API_KEY  (set in Vercel → Project → Settings → Environment
//          Variables). You may set multiple keys as a comma-separated list
//          — e.g. "key1,key2,key3" — and this function will automatically
//          rotate to the next key if one is rate-limited (HTTP 429) or
//          temporarily unavailable (HTTP 503).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { model } = req.query;
  const modelName = model ? decodeURIComponent(model) : 'gemini-2.5-flash';

  const rawKeys = process.env.GEMINI_API_KEY || '';
  const keys = rawKeys.split(',').map((k) => k.trim()).filter(Boolean);

  if (keys.length === 0) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured. Add it in Vercel → Settings → Environment Variables.',
    });
  }

  // Basic guard against obviously malformed model names being used to
  // reach arbitrary paths on the upstream API.
  if (!/^[a-zA-Z0-9._-]+$/.test(modelName)) {
    return res.status(400).json({ error: 'Invalid model name.' });
  }

  let lastError = null;

  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);

    try {
      const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const response = await fetch(googleUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Rotate to the next key on rate-limit / transient upstream errors,
      // as long as another key is available.
      if ((response.status === 429 || response.status === 503) && i < keys.length - 1) {
        lastError = await response.text().catch(() => '');
        continue;
      }

      const data = await response.json().catch(() => ({ error: 'Invalid JSON from upstream API.' }));
      return res.status(response.status).json(data);
    } catch (error) {
      clearTimeout(timeout);
      lastError = error.name === 'AbortError' ? 'Request to Gemini API timed out.' : error.message;
      // Try the next key on network-level failures too, if any remain.
      if (i < keys.length - 1) continue;
    }
  }

  return res.status(502).json({ error: lastError || 'All configured Gemini API keys failed.' });
}
