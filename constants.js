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

// API keys are now managed securely on the server.
// Client code uses /api/* proxy routes instead.
var GEMINI_KEYS = [];

var MODEL_LABELS = {
    "gemini-lite": "Gemini 2.5 Flash-Lite",
    "gemini-flash": "Gemini 2.5 Flash",
    "gemini-pro": "Gemini 2.5 Pro",
};
function stripThink(text) {
    if (!text) return text;
    return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}
// ============================================================
// GEMINI API HELPER (replaces @google/genai)
// ============================================================
