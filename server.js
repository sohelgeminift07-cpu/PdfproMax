const express = require('express');
const path = require('path');

const app = express();
app.use(express.json({ limit: '10mb' }));

// Only serve static files in local development (not in Vercel serverless)
if (require.main === module) {
    app.use(express.static(path.join(__dirname)));
}

const GEMINI_KEYS = [
    process.env.GEMINI_KEY_1 || 'AIzaSyAYZh4z6B7auyHj8LHNgTWWDUcevd6D1Tk',
    process.env.GEMINI_KEY_2 || 'AIzaSyA-Ce5Uo5cmX2b984iZD_GLiJ6i2-5lN2c',
    process.env.GEMINI_KEY_3 || 'AIzaSyBK1PM_dEejUssljAoeHMT_9S4LVwrAQcM',
    process.env.GEMINI_KEY_4 || 'AIzaSyCJ9b7y7-XXKHgKh4jwg6NVGdR-mEW1uKA',
    process.env.GEMINI_KEY_5 || 'AIzaSyCr8197yFllVFnpsf9o7A1llgKXwTbK7Qs',
].filter(Boolean);

const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';
const MAVERICK_KEY = process.env.MAVERICK_KEY || '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';

let geminiKeyIndex = 0;
function nextGeminiKey() {
    const key = GEMINI_KEYS[geminiKeyIndex % GEMINI_KEYS.length];
    geminiKeyIndex++;
    return key;
}

app.get('/api/config', (req, res) => {
    res.json({
        geminiKeys: GEMINI_KEYS,
        groqKey: GROQ_API_KEY || null,
        maverickKey: MAVERICK_KEY || null,
        hasGemini: GEMINI_KEYS.length > 0,
        hasGroq: !!GROQ_API_KEY,
        hasMaverick: !!MAVERICK_KEY,
    });
});

app.post('/api/gemini/:model/generateContent', async (req, res) => {
    const { model } = req.params;
    const fetch = (await import('node-fetch')).default;

    let lastError = null;
    for (let i = 0; i < GEMINI_KEYS.length; i++) {
        const apiKey = nextGeminiKey();
        if (!apiKey) break;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        try {
            const upstream = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req.body),
            });
            const data = await upstream.json();
            // If OK, return immediately
            if (upstream.ok) return res.status(200).json(data);
            // If rate limit (429) or key error (400/403), try next key
            if (upstream.status === 429 || upstream.status === 400 || upstream.status === 403) {
                lastError = { status: upstream.status, data };
                continue;
            }
            // For other errors (e.g. 404 model not found), return immediately
            return res.status(upstream.status).json(data);
        } catch (err) {
            lastError = { error: err.message };
            continue;
        }
    }

    if (lastError) {
        res.status(lastError.status || 500).json(lastError.data || { error: lastError.error || 'All keys failed' });
    } else {
        res.status(500).json({ error: 'No Gemini API key configured' });
    }
});

app.post('/api/groq', async (req, res) => {
    const { maverick } = req.query;
    const key = maverick ? MAVERICK_KEY : GROQ_API_KEY;
    if (!key) return res.status(500).json({ error: 'No Groq API key configured' });

    try {
        const fetch = (await import('node-fetch')).default;
        const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
            },
            body: JSON.stringify(req.body),
        });
        const data = await upstream.json();
        res.status(upstream.status).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/gemini-ws-token', (req, res) => {
    const key = nextGeminiKey();
    if (!key) return res.status(500).json({ error: 'No Gemini API key configured' });
    res.json({ key });
});

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`MaxOfPdf server running on port ${PORT}`);
    });
}
