export const config = { runtime: 'nodejs' };

/* Map frontend model aliases to real Gemini API model IDs */
const MODEL_MAP = {
  'gemini-lite': 'gemini-2.5-flash-lite',
  'gemini-flash': 'gemini-2.5-flash',
  'gemini-pro': 'gemini-2.5-pro',
};

/* In-memory cache for identical requests (5 min TTL) */
const requestCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; /* 5 minutes */

function getCacheKey(model, body) {
  /* Hash the model + request body to create a cache key */
  const str = model + JSON.stringify(body);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; /* Convert to 32-bit integer */
  }
  return 'cache_' + Math.abs(hash).toString(36);
}

function getCachedResponse(model, body) {
  const key = getCacheKey(model, body);
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  if (cached) requestCache.delete(key);
  return null;
}

function setCachedResponse(model, body, data) {
  const key = getCacheKey(model, body);
  requestCache.set(key, { data, timestamp: Date.now() });
  /* Cleanup: remove oldest entries if cache grows too large */
  if (requestCache.size > 100) {
    const firstKey = requestCache.keys().next().value;
    requestCache.delete(firstKey);
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawModel = req.query?.model || req.params?.model || '';
  const incoming = Array.isArray(rawModel) ? rawModel[0] : rawModel;

  if (!incoming) {
    return res.status(400).json({ error: 'Missing model parameter' });
  }

  /* Resolve alias to real Gemini API model ID */
  const model = MODEL_MAP[incoming] || incoming;

  /* Check cache first */
  const cachedResponse = getCachedResponse(model, req.body);
  if (cachedResponse) {
    return res.status(200).json(cachedResponse);
  }

  const GEMINI_KEYS = process.env.GEMINI_KEYS
    ? process.env.GEMINI_KEYS.split(',')
    : [];

  if (!GEMINI_KEYS.length) {
    return res.status(500).json({ error: 'No Gemini API key configured' });
  }

  let lastError = null;

  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const apiKey = GEMINI_KEYS[i % GEMINI_KEYS.length].trim();
    if (!apiKey) continue;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });

      const data = await upstream.json();

      if (upstream.ok) {
        /* Cache successful responses */
        setCachedResponse(model, req.body, data);
        return res.status(200).json(data);
      }

      if ([429, 400, 403].includes(upstream.status)) {
        lastError = { status: upstream.status, data };
        continue;
      }

      return res.status(upstream.status).json(data);
    } catch (err) {
      lastError = { status: 500, data: { error: err.message } };
      continue;
    }
  }

  const s = lastError ? lastError.status || 500 : 500;
  const d = lastError ? lastError.data || {} : { error: 'All keys failed' };
  return res.status(s).json(d);
}
