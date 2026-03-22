// ============================================================
// STORAGE UTILITIES
// localStorage read/write helpers for history, settings, vocab
// ============================================================

function loadHistory() {
    try {
        var saved = localStorage.getItem('maxofpdf_history');
        if (saved) {
            var parsed = JSON.parse(saved);
            return parsed.filter(function(x){ return x && x.data && !x.data.pdfFile; });
        }
    } catch(e) {}
    return [];
}

function saveHistory(history) {
    try {
        var serializable = history.filter(function(x){ return !x.data.pdfFile; });
        localStorage.setItem('maxofpdf_history', JSON.stringify(serializable));
    } catch(e) {}
}

function loadVocab() {
    try {
        var raw = localStorage.getItem('maxofpdf_vocab') || '{}';
        var store = JSON.parse(raw);
        return Object.values(store).sort(function(a, b) { return (b.ts || b.timestamp || 0) - (a.ts || a.timestamp || 0); });
    } catch(e) { return []; }
}

function saveVocabWord(word, meaning, entityType) {
    try {
        var raw = localStorage.getItem('maxofpdf_vocab');
        var store = raw ? JSON.parse(raw) : {};
        var key = word.trim().toLowerCase();
        store[key] = { word: word, meaning: meaning, m: meaning, entityType: entityType, ts: Date.now() };
        localStorage.setItem('maxofpdf_vocab', JSON.stringify(store));
        window.dispatchEvent(new CustomEvent('maxofpdf_vocab_updated'));
    } catch(e) {}
}

function deleteVocabWord(wordKey) {
    try {
        var raw = localStorage.getItem('maxofpdf_vocab') || '{}';
        var store = JSON.parse(raw);
        delete store[wordKey];
        localStorage.setItem('maxofpdf_vocab', JSON.stringify(store));
    } catch(e) {}
}

function clearAllVocab() {
    try { localStorage.removeItem('maxofpdf_vocab'); } catch(e) {}
}

function loadSetting(key, defaultVal) {
    try {
        var val = localStorage.getItem('maxofpdf_setting_' + key);
        return val !== null ? JSON.parse(val) : defaultVal;
    } catch(e) { return defaultVal; }
}

function saveSetting(key, val) {
    try { localStorage.setItem('maxofpdf_setting_' + key, JSON.stringify(val)); } catch(e) {}
}
