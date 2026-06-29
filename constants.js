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
    'AIzaSy_YOUR_FIRST_KEY_HERE',
    'AIzaSy_YOUR_SECOND_KEY_HERE',
    'AIzaSy_YOUR_THIRD_KEY_HERE'
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
