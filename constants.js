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
var GROQ_API_KEY = "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";
var MAVERICK_KEY = "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";
var GEMINI_KEYS = [
    "AIzaSyAYZh4z6B7auyHj8LHNgTWWDUcevd6D1Tk",
    "AIzaSyA-Ce5Uo5cmX2b984iZD_GLiJ6i2-5lN2c",
    "AIzaSyBK1PM_dEejUssljAoeHMT_9S4LVwrAQcM",
    "AIzaSyCJ9b7y7-XXKHgKh4jwg6NVGdR-mEW1uKA",
    "AIzaSyCr8197yFllVFnpsf9o7A1llgKXwTbK7Qs"
];
var MODEL_LABELS = {
    "gemini-lite": "Gemini 3.1 Flash-Lite",
    "llama-maverick": "Llama 4 Scout",
};
function stripThink(text) {
    if (!text) return text;
    return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}
// ============================================================
// GEMINI API HELPER (replaces @google/genai)
// ============================================================
