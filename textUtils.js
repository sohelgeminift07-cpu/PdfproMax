// ============================================================
// TEXT UTILITIES
// safeExtractJSON() — JSON parser with fallback
// splitIntoPages()  — splits text into word-count pages
// ============================================================

// HELPERS
// ============================================================
var safeExtractJSON = function (text) {
    try {
        var clean = text.replace(/```json\n?|```/g, '').trim();
        var si = clean.indexOf('{'), ei = clean.lastIndexOf('}');
        if (si !== -1 && ei !== -1)
            clean = clean.substring(si, ei + 1);
        return JSON.parse(clean);
    }
    catch (_e) {
        try {
            var clean = text.replace(/```json\n?|```/g, '').trim();
            var si = clean.indexOf('{'), ei = clean.lastIndexOf('}');
            if (si !== -1 && ei !== -1)
                clean = clean.substring(si, ei + 1);
            var sanitized = clean.replace(/(: ")([\s\S]*?)(")/g, function (_, a, val, b) { return a + val.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + b; });
            return JSON.parse(sanitized);
        }
        catch (_e) {
            return null;
        }
    }
};
var WORDS_PER_PAGE = 600;
function splitIntoPages(text) {
    /* Preserve markdown: split by lines, count words, break pages at
       safe boundaries (blank lines / headings / bullets) */
    var lines = text.split('\n');
    var pages = [];
    var buf = [];
    var wc = 0;
    function cw(l) { return l.trim() ? l.trim().split(/\s+/).length : 0; }
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var lw = cw(line);
        if (wc + lw > WORDS_PER_PAGE && wc > 0) {
            var safe = line.trim() === '' ||
                /^#+\s/.test(line.trim()) ||
                /^[-*]\s/.test(line.trim()) ||
                /^[\d\u09E6-\u09EF]+[.\u0964]/.test(line.trim());
            if (safe || wc >= Math.floor(WORDS_PER_PAGE * 1.1)) {
                pages.push(buf.join('\n').trim());
                buf = [];
                wc = 0;
            }
        }
        buf.push(line);
        wc += lw;
    }
    if (buf.some(function(l) { return l.trim(); }))
        pages.push(buf.join('\n').trim());
    return pages.length ? pages : [''];
}
// ============================================================
// SKELETON LOADER
