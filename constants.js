// ============================================================
// GLOBALS & CONSTANTS
// ============================================================
var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef, useMemo = React.useMemo, useCallback = React.useCallback;
// Setup PDF.js worker
if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}
var pdfjsLib = window.pdfjsLib;
var katex = window.katex;

// Hardcoded Gemini API keys for direct client-side access
// Add your actual API keys here — the app will rotate through them on rate limit errors
var GEMINI_KEYS = [
    'AIzaSyA-Ce5Uo5cmX2b984iZD_GLiJ6i2-5lN2c',
    'AIzaSyBK1PM_dEejUssljAoeHMT_9S4LVwrAQcM',
    'AIzaSyCJ9b7y7-XXKHgKh4jwg6NVGdR-mEW1uKA'
];

var MODEL_LABELS = {
    "gemini-lite": "Gemini 2.5 Flash",
    "gemini-flash": "Gemini 2.5 Flash",
    "gemini-pro": "Gemini 2.5 Flash",
};
function stripThink(text) {
    if (!text) return text;
    return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}
// ============================================================
// GEMINI API HELPER (replaces @google/genai)
// ============================================================
