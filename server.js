const express = require('express');
const path = require('path');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

const GEMINI_KEYS = [
    process.env.GEMINI_KEY_1,
    process.env.GEMINI_KEY_2,
    process.env.GEMINI_KEY_3,
    process.env.GEMINI_KEY_4,
    process.env.GEMINI_KEY_5,
].filter(Boolean);

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MAVERICK_KEY = process.env.MAVERICK_KEY;

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

app.post('/api/gemini/:model/generateContent', async (req, res) => {
    const { model } = req.params;
    const apiKey = nextGeminiKey();
    if (!apiKey) return res.status(500).json({ error: 'No Gemini API key configured' });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
        const fetch = (await import('node-fetch')).default;
        const upstream = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });
        const data = await upstream.json();
        res.status(upstream.status).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`MaxOfPdf server running on port ${PORT}`);
});
