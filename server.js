const express = require('express');
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

const GEMINI_KEYS = process.env.GEMINI_KEYS ? process.env.GEMINI_KEYS.split(',') : [];
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const MAVERICK_KEY = process.env.MAVERICK_KEY || '';

let geminiKeyIndex = 0;
function nextGeminiKey() {
    const key = GEMINI_KEYS[geminiKeyIndex % GEMINI_KEYS.length];
    geminiKeyIndex++;
    return key;
}

app.get('/api/config', (req, res) => {
    res.json({
        hasGemini: GEMINI_KEYS.length > 0,
        hasGroq: !!GROQ_API_KEY,
        hasMaverick: !!MAVERICK_KEY,
    });
});

/* Map frontend model aliases to real Gemini API model IDs */
const MODEL_MAP = {
  'gemini-lite': 'gemini-2.5-flash',
  'gemini-flash': 'gemini-2.5-flash',
  'gemini-pro': 'gemini-2.5-flash',
};

app.post('/api/gemini/:model/generateContent', async (req, res) => {
    const rawModel = req.params.model;
    const model = MODEL_MAP[rawModel] || rawModel;

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
            if (upstream.ok) return res.status(200).json(data);
            if (upstream.status === 429 || upstream.status === 400 || upstream.status === 403) {
                lastError = { status: upstream.status, data };
                continue;
            }
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`MaxOfPdf server running on port ${PORT}`);
});
