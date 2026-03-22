// ============================================================
// APP ROOT
// ============================================================
function App() {
    var _a = useState({ rawText: '', isReading: false }), state = _a[0], setState = _a[1];
    var _b = useState(null), pdfFile = _b[0], setPdfFile = _b[1];
    var _c = useState(null), pdfRange = _c[0], setPdfRange = _c[1];
    var _d = useState({}), extractedCache = _d[0], setExtractedCache = _d[1];
    var _f = useState(0), lastPageIndex = _f[0], setLastPageIndex = _f[1];
    var _g = useState(function() {
        try {
            var saved = localStorage.getItem('maxofpdf_history');
            if (saved) {
                var parsed = JSON.parse(saved);
                return parsed.filter(function(x){ return x && x.data && !x.data.pdfFile; });
            }
        } catch(e) {}
        return [];
    }), history = _g[0], setHistory = _g[1];
    /* Rich session state cache */
    var _rc1 = useState([]), cachedHighlights = _rc1[0], setCachedHighlights = _rc1[1];
    var _rc2 = useState({}), cachedRewrittenPages = _rc2[0], setCachedRewrittenPages = _rc2[1];
    var _rc3 = useState({}), cachedXrayCache = _rc3[0], setCachedXrayCache = _rc3[1];
    var _h = useState(false), isSettingsOpen = _h[0], setIsSettingsOpen = _h[1];
    var _j = useState('gemini-lite'), activeReaderModel = _j[0], setActiveReaderModel = _j[1];
    var _k = useState('gemini-lite'), activeStructureModel = _k[0], setActiveStructureModel = _k[1];
    var _l = useState('gemini-lite'), activeScanningModel = _l[0], setActiveScanningModel = _l[1];
    var _m = useState('original'), structureMode = _m[0], setStructureMode = _m[1];
    var _o = useState('dark'), readerTheme = _o[0], setReaderTheme = _o[1];
    var _p = useState('lower'), boldingLevel = _p[0], setBoldingLevel = _p[1];
    var _q = useState(1.2), lineSpacing = _q[0], setLineSpacing = _q[1];
    var _r = useState(0.8), boldness = _r[0], setBoldness = _r[1];
    var _s = useState(2), autoScrollSpeed = _s[0], setAutoScrollSpeed = _s[1];
    var _t = useState(false), autoPlayTTS = _t[0], setAutoPlayTTS = _t[1];
    var _u = useState(0), activeKeyIndex = _u[0], setActiveKeyIndex = _u[1];
    var googleApiKey = GEMINI_KEYS[activeKeyIndex % GEMINI_KEYS.length];
    var handleRotateKey = function () { var next = (activeKeyIndex + 1) % GEMINI_KEYS.length; setActiveKeyIndex(next); console.log("Switched to Gemini API Key #".concat(next + 1)); };
    /* Listen for clear-history event dispatched from Settings */
    useEffect(function() {
        var handler = function() { setHistory([]); };
        window.addEventListener('maxofpdf_clear_history', handler);
        return function() { window.removeEventListener('maxofpdf_clear_history', handler); };
    }, []);
    var addToHistory = function (finalLastPage, finalExtracted, file, range, text, richState) {
        var item = {
            id: crypto.randomUUID(),
            type: file ? 'pdf' : 'text',
            title: file ? file.name : (text.slice(0, 30) + '...'),
            timestamp: Date.now(),
            data: {
                rawText: text, pdfFile: file, pdfRange: range,
                extractedPages: finalExtracted, lastPageIndex: finalLastPage,
                highlights: (richState && richState.highlights) || [],
                rewrittenPages: (richState && richState.rewrittenPages) || {},
                xrayCache: (richState && richState.xrayCache) || {}
            }
        };
        setHistory(function (p) {
            var next = __spreadArray([item], p.filter(function (x) { return x.title !== item.title; }), true).slice(0, 10);
            /* Persist to localStorage — skip PDF entries (File objects not serializable) */
            try {
                var serializable = next.filter(function(x){ return !x.data.pdfFile; });
                localStorage.setItem('maxofpdf_history', JSON.stringify(serializable));
            } catch(e) {}
            return next;
        });
    };
    var handleStartReading = function (text) {
        setPdfFile(null); setPdfRange(null); setExtractedCache({}); setLastPageIndex(0);
        setCachedHighlights([]); setCachedRewrittenPages({}); setCachedXrayCache({});
        /* Save entry to history immediately */
        var item = { id: crypto.randomUUID(), type: 'text', title: text.slice(0, 30) + '...', timestamp: Date.now(), data: { rawText: text, pdfFile: null, pdfRange: null, extractedPages: {}, lastPageIndex: 0, highlights: [], rewrittenPages: {}, xrayCache: {} } };
        setHistory(function(p) {
            var next = __spreadArray([item], p.filter(function(x){ return x.title !== item.title; }), true).slice(0, 10);
            try { localStorage.setItem('maxofpdf_history', JSON.stringify(next.filter(function(x){ return !x.data.pdfFile; }))); } catch(e) {}
            return next;
        });
        setState({ rawText: text, isReading: true });
    };
    var handleStartPdfReading = function (file, range) {
        var isSameFile = pdfFile && pdfFile.name === file.name && pdfFile.size === file.size;
        var isSameRange = (pdfRange ? pdfRange.start : undefined) === (range ? range.start : undefined) && (pdfRange ? pdfRange.end : undefined) === (range ? range.end : undefined);
        if (!isSameFile || !isSameRange) {
            setExtractedCache({}); setLastPageIndex(0);
            setCachedHighlights([]); setCachedRewrittenPages({}); setCachedXrayCache({});
        }
        setPdfFile(file);
        setPdfRange(range || null);
        /* Save entry to history immediately */
        var item = { id: crypto.randomUUID(), type: 'pdf', title: file.name, timestamp: Date.now(), data: { rawText: '', pdfFile: file, pdfRange: range || null, extractedPages: (!isSameFile || !isSameRange) ? {} : extractedCache, lastPageIndex: (!isSameFile || !isSameRange) ? 0 : lastPageIndex, highlights: (!isSameFile || !isSameRange) ? [] : cachedHighlights, rewrittenPages: (!isSameFile || !isSameRange) ? {} : cachedRewrittenPages, xrayCache: (!isSameFile || !isSameRange) ? {} : cachedXrayCache } };
        setHistory(function(p) { return __spreadArray([item], p.filter(function(x){ return x.title !== item.title; }), true).slice(0, 10); });
        setState({ rawText: '', isReading: true });
    };
    var handleExitReader = function (curPage, curExtracted, richState) {
        setExtractedCache(curExtracted); setLastPageIndex(curPage);
        if (richState) { setCachedHighlights(richState.highlights || []); setCachedRewrittenPages(richState.rewrittenPages || {}); setCachedXrayCache(richState.xrayCache || {}); }
        addToHistory(curPage, curExtracted, pdfFile, pdfRange, state.rawText, richState);
        setState(function (p) { return (__assign(__assign({}, p), { isReading: false })); });
    };
    var handleRestoreHistory = function (item) {
        setPdfFile(item.data.pdfFile);
        setPdfRange(item.data.pdfRange);
        setExtractedCache(item.data.extractedPages || {});
        setLastPageIndex(item.data.lastPageIndex || 0);
        setCachedHighlights(item.data.highlights || []);
        setCachedRewrittenPages(item.data.rewrittenPages || {});
        setCachedXrayCache(item.data.xrayCache || {});
        setState({ rawText: item.data.rawText, isReading: true });
    };
    /* Called by Reader whenever state changes — keeps history in sync */
    var handleReaderStateChange = function (richState) {
        setCachedHighlights(richState.highlights || []);
        setCachedRewrittenPages(richState.rewrittenPages || {});
        setCachedXrayCache(richState.xrayCache || {});
        if (richState.extractedPages) setExtractedCache(richState.extractedPages);
        if (richState.currentPage !== undefined) setLastPageIndex(richState.currentPage);
        /* Live-update the top history entry */
        setHistory(function(prev) {
            if (!prev || prev.length === 0) return prev;
            var top = prev[0];
            var updated = __assign(__assign({}, top), { timestamp: Date.now(), data: __assign(__assign({}, top.data), { lastPageIndex: richState.currentPage !== undefined ? richState.currentPage : top.data.lastPageIndex, extractedPages: richState.extractedPages || top.data.extractedPages, highlights: richState.highlights || top.data.highlights, rewrittenPages: richState.rewrittenPages || top.data.rewrittenPages, xrayCache: richState.xrayCache || top.data.xrayCache }) });
            return __spreadArray([updated], prev.slice(1), true);
        });
    };
    var getBg = function () {
        if (!state.isReading)
            return 'bg-[#020202]';
        switch (readerTheme) {
            case 'light': return 'bg-[#f8fafc]';
            case 'sepia': return 'bg-[#f4ecd8]';
            case 'midnight': return 'bg-[#020617]';
            case 'forest': return 'bg-[#052e16]';
            default: return 'bg-gradient-to-b from-[#0a0c10] to-black';
        }
    };
    return (React.createElement("div", { className: "min-h-screen transition-colors duration-700 font-sans ".concat(getBg()) },
        React.createElement("main", { className: "flex-grow flex flex-col items-center justify-center min-h-screen" }, !state.isReading ? (React.createElement(Editor, { onStart: handleStartReading, onPdfUpload: handleStartPdfReading, initialValue: state.rawText, initialPdfFile: pdfFile, initialPdfRange: pdfRange, history: history, onRestoreHistory: handleRestoreHistory, activeStructureModel: activeStructureModel, structureMode: structureMode, boldingLevel: boldingLevel, onOpenSettings: function () { return setIsSettingsOpen(true); }, googleApiKey: googleApiKey, onRotateKey: handleRotateKey })) : (React.createElement(Reader, { text: state.rawText, pdfFile: pdfFile, pdfRange: pdfRange, initialExtractedPages: extractedCache, initialPageIndex: lastPageIndex, activeModel: activeReaderModel, activeStructureModel: activeStructureModel, structureMode: structureMode, onModelChange: setActiveReaderModel, activeScanningModel: activeScanningModel, readerTheme: readerTheme, boldingLevel: boldingLevel, lineSpacing: lineSpacing, boldness: boldness, autoScrollSpeed: autoScrollSpeed, autoPlayTTS: autoPlayTTS, onBack: handleExitReader, onOpenSettings: function () { return setIsSettingsOpen(true); }, googleApiKey: googleApiKey, onRotateKey: handleRotateKey, initialHighlights: cachedHighlights, initialRewrittenPages: cachedRewrittenPages, initialXrayCache: cachedXrayCache, onStateChange: handleReaderStateChange }))),
        React.createElement(Settings, { isOpen: isSettingsOpen, history: history, onSelectHistory: function (item) { handleRestoreHistory(item); setIsSettingsOpen(false); }, activeReaderModel: activeReaderModel, activeStructureModel: activeStructureModel, structureMode: structureMode, activeScanningModel: activeScanningModel, readerTheme: readerTheme, boldingLevel: boldingLevel, lineSpacing: lineSpacing, boldness: boldness, autoPlayTTS: autoPlayTTS, apiKey1: GEMINI_KEYS[0], apiKey2: GEMINI_KEYS[1], activeKeyIndex: activeKeyIndex, autoScrollSpeed: autoScrollSpeed, onSelectReaderModel: setActiveReaderModel, onSelectStructureModel: setActiveStructureModel, onSelectStructureMode: setStructureMode, onSelectScanningModel: setActiveScanningModel, onSelectTheme: setReaderTheme, onSelectBoldingLevel: setBoldingLevel, onSetLineSpacing: setLineSpacing, onSetBoldness: setBoldness, onToggleAutoPlayTTS: function () { return setAutoPlayTTS(!autoPlayTTS); }, onSetApiKey1: function(){}, onSetApiKey2: function(){}, onSetAutoScrollSpeed: setAutoScrollSpeed, onClose: function () { return setIsSettingsOpen(false); } })));
}
var container = document.getElementById('root');
ReactDOM.render(React.createElement(App, null), container);

