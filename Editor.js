// ============================================================
// EDITOR COMPONENT
// ============================================================
function Editor(_a) {
    var _this = this;
    var onStart = _a.onStart, onPdfUpload = _a.onPdfUpload, initialValue = _a.initialValue, initialPdfFile = _a.initialPdfFile, initialPdfRange = _a.initialPdfRange, history = _a.history, onRestoreHistory = _a.onRestoreHistory, activeStructureModel = _a.activeStructureModel, structureMode = _a.structureMode, boldingLevel = _a.boldingLevel, onOpenSettings = _a.onOpenSettings, googleApiKey = _a.googleApiKey, onRotateKey = _a.onRotateKey;
    var _b = useState(initialValue || ''), text = _b[0], setText = _b[1];
    var _c = useState(false), isProcessing = _c[0], setIsProcessing = _c[1];
    var _d = useState(false), isReadAnimating = _d[0], setIsReadAnimating = _d[1];
    var _f = useState('idle'), pasteStatus = _f[0], setPasteStatus = _f[1];
    var textareaRef = useRef(null);
    var fileInputRef = useRef(null);
    var _g = useState(initialPdfFile || null), pdfFile = _g[0], setPdfFile = _g[1];
    var _h = useState(initialPdfFile ? 100 : 0), uploadProgress = _h[0], setUploadProgress = _h[1];
    var _j = useState(false), isPdfLoading = _j[0], setIsPdfLoading = _j[1];
    var _k = useState(null), pdfDoc = _k[0], setPdfDoc = _k[1];
    var _l = useState(0), totalPdfPages = _l[0], setTotalPdfPages = _l[1];
    var _m = useState(initialPdfRange || { start: 1, end: 1 }), selectedRange = _m[0], setSelectedRange = _m[1];
    var _o = useState(false), isRangeModalOpen = _o[0], setIsRangeModalOpen = _o[1];
    var _p = useState(null), previewImage = _p[0], setPreviewImage = _p[1];
    var _q = useState(1), activePreviewPage = _q[0], setActivePreviewPage = _q[1];
    var _r = useState(null), aiResult = _r[0], setAiResult = _r[1];
    var _s = useState(null), notification = _s[0], setNotification = _s[1];
    var _t = useState(1), zoomLevel = _t[0], setZoomLevel = _t[1];
    var _u = useState('start'), editModeInternal = _u[0], setEditModeInternal = _u[1];
    var apiKeyRef = useRef(googleApiKey);
    useEffect(function () { apiKeyRef.current = googleApiKey; }, [googleApiKey]);
    var hasContent = text.trim().length > 0 || pdfFile !== null;
    useEffect(function () { setText(initialValue || ''); }, [initialValue]);
    useEffect(function () {
        if (initialPdfFile) {
            setPdfFile(initialPdfFile);
            if (initialPdfRange)
                setSelectedRange(initialPdfRange);
            setUploadProgress(100);
            var reader = new FileReader();
            reader.onload = function (e) { return __awaiter(_this, void 0, void 0, function () {
                var doc;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(e.target && e.target.result && pdfjsLib)) return [3 /*break*/, 2];
                            return [4 /*yield*/, pdfjsLib.getDocument(e.target.result).promise];
                        case 1:
                            doc = _a.sent();
                            setPdfDoc(doc);
                            setTotalPdfPages(doc.numPages);
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            }); };
            reader.readAsArrayBuffer(initialPdfFile);
        }
    }, [initialPdfFile]);
    useEffect(function () {
        if (isRangeModalOpen && !isPdfLoading && pdfDoc)
            generatePreview(activePreviewPage);
    }, [activePreviewPage, isRangeModalOpen, pdfDoc, isPdfLoading]);
    var generatePreview = function (pageNum) { return __awaiter(_this, void 0, void 0, function () {
        var page, viewport, canvas, ctx, e_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!pdfDoc)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, pdfDoc.getPage(pageNum)];
                case 2:
                    page = _a.sent();
                    viewport = page.getViewport({ scale: 2.0 });
                    canvas = document.createElement('canvas');
                    ctx = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    if (!ctx) return [3 /*break*/, 4];
                    return [4 /*yield*/, page.render({ canvasContext: ctx, viewport: viewport }).promise];
                case 3:
                    _a.sent();
                    setPreviewImage(canvas.toDataURL('image/jpeg'));
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    e_6 = _a.sent();
                    console.error(e_6);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleAIAction = function (action_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([action_1], args_1, true), void 0, function (action, retryCount) {
            var boldMap, boldI, systemPrompt, result, gemM, r, modelId, key, endpoint, r, e, d, err_3, isQuota;
            if (retryCount === void 0) { retryCount = 0; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!text.trim() || isProcessing)
                            return [2 /*return*/];
                        if (retryCount === 0)
                            setIsProcessing(true);
                        boldMap = { lower: 'MINIMAL BOLDING. Bold ONLY core subjects (5-10%).', lower_medium: 'LIGHT BOLDING. Bold key nouns and verbs (15-20%).', medium: 'MODERATE BOLDING. Bold significant nouns, verbs, phrases (25-30%).', medium_high: 'HEAVY BOLDING. Bold most nouns, verbs, adjectives (35-45%).', high: 'EXTREMELY AGGRESSIVE BOLDING. Bold almost every significant word (50%+).' };
                        boldI = boldMap[boldingLevel] || boldMap.high;
                        systemPrompt = action === 'structure'
                            ? (structureMode === 'original'
                                ? "Text reading assistant. Apply markdown bolding (**word**). CRITICAL: 1. PRESERVE CONTENT: Do NOT change words. 2. Fix punctuation/spacing. 3. BOLDING: ".concat(boldI, " Output ONLY formatted text.")
                                : "Text reading assistant. Create WELL-ORGANIZED version with headers (#) and bullets (-). BOLDING: ".concat(boldI, " Output ONLY structured text."))
                            : 'Professional summarizer. Provide concise beautiful Bengali summary with Markdown bullets. Output ONLY summary.';
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, 10, 11]);
                        result = '';
                        if (!activeStructureModel.includes('gemini')) return [3 /*break*/, 3];
                        gemM = activeStructureModel === 'gemini-lite' ? 'gemini-2.0-flash' : 'gemini-2.0-flash';
                        return [4 /*yield*/, geminiGenerate(apiKeyRef.current, gemM, text, { systemInstruction: systemPrompt, temperature: 0.3, maxOutputTokens: 16384 })];
                    case 2:
                        r = _a.sent();
                        result = r.text || '';
                        return [3 /*break*/, 8];
                    case 3:
                        modelId = 'moonshotai/kimi-k2-instruct-0905', key = GROQ_API_KEY, endpoint = 'https://api.groq.com/openai/v1/chat/completions';
                        if (activeStructureModel === 'kimi')
                            modelId = 'moonshotai/kimi-k2-instruct-0905';
                        else if (activeStructureModel === 'llama-maverick') {
                            modelId = 'meta-llama/llama-4-maverick-17b-128e-instruct';
                            key = MAVERICK_KEY;
                        }
                        return [4 /*yield*/, fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': "Bearer ".concat(key) }, body: JSON.stringify({ messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: text }], model: modelId, temperature: 0.3, max_tokens: 16384 }) })];
                    case 4:
                        r = _a.sent();
                        if (!!r.ok) return [3 /*break*/, 6];
                        return [4 /*yield*/, r.text()];
                    case 5:
                        e = _a.sent();
                        throw new Error("Groq ".concat(r.status, ": ").concat(e));
                    case 6: return [4 /*yield*/, r.json()];
                    case 7:
                        d = _a.sent();
                        result = (d.choices && d.choices[0] && d.choices[0].message ? d.choices[0].message.content : '') || '';
                        _a.label = 8;
                    case 8:
                        if (result) {
                            if (action === 'structure')
                                setText(result);
                            else
                                setAiResult({ title: 'সারাংশ (Bengali Summary)', content: result });
                        }
                        else {
                            throw new Error('AI returned an empty response. Please try again.');
                        }
                        return [3 /*break*/, 11];
                    case 9:
                        err_3 = _a.sent();
                        console.error('Structure error:', err_3);
                        isQuota = (err_3.message && err_3.message.includes('429')) || (err_3.message && err_3.message.includes('403')) || (err_3.message && err_3.message.includes('RESOURCE_EXHAUSTED'));
                        if (isQuota && retryCount < 1) {
                            onRotateKey();
                            setTimeout(function () { return handleAIAction(action, retryCount + 1); }, 800);
                            return [2 /*return*/];
                        }
                        setNotification({ message: isQuota ? 'Quota exceeded — switched to backup key. Retrying…' : "Failed: ".concat(err_3.message), type: 'error' });
                        return [3 /*break*/, 11];
                    case 10:
                        setIsProcessing(false);
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /* ── Normalise pasted markdown from Google AI Studio / ChatGPT etc. ── */
    var normalizeMarkdownPaste = function (raw) {
        var s = raw;
        /* 1. Normalise Windows line endings */
        s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        /* 2. Remove stray ** wrapping whole lines (e.g. **২. heading**) */
        s = s.replace(/^\*\*(.+?)\*\*\s*$/gm, '$1');
        /* 3. Convert "* **word**" or "*  **word**" bullet → "- **word**" */
        s = s.replace(/^\*\s+\*\*(.*?)\*\*/gm, '- **$1**');
        /* 4. Convert bare "* " bullets → "- " */
        s = s.replace(/^\*\s+/gm, '- ');
        /* 5. If text looks like one long line (no \n or very few), split on
              inline bullet patterns: " – **word**" or " - **word**" or " – word —" */
        if ((s.match(/\n/g) || []).length < 3) {
            /* Split before "– **bold**" or "- **bold**" patterns (inline bullets) */
            s = s.replace(/\s*[–\-]\s+\*\*/g, '\n- **');
            /* Split before numbered section headings like "২." "3." "১." */
            s = s.replace(/\s*([\d০-৯]+[.।])\s+/g, '\n\n$1 ');
            /* Split after sentence-ending "।" followed by space+capital/bold */
            s = s.replace(/।\s+(?=\*\*|[A-Z০-৯])/g, '।\n');
        }
        /* 6. Ensure blank line before headings (lines starting with #, number+., emoji+heading) */
        s = s.replace(/\n(?=[#])/g, '\n\n');
        /* 7. Collapse 3+ blank lines → 2 */
        s = s.replace(/\n{3,}/g, '\n\n');
        return s.trim();
    };
    var handlePaste = function () { return __awaiter(_this, void 0, void 0, function () {
        var ct_1, _e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setPasteStatus('idle');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    if (!(navigator.clipboard ? navigator.clipboard.readText.bind(navigator.clipboard) : null)) return [3 /*break*/, 3];
                    return [4 /*yield*/, navigator.clipboard.readText()];
                case 2:
                    ct_1 = _a.sent();
                    if ((ct_1 && ct_1.trim())) {
                        setPasteStatus('success');
                        var normalized_1 = normalizeMarkdownPaste(ct_1);
                        setText(function (p) { return p ? p + '\n\n' + normalized_1 : normalized_1; });
                        setTimeout(function () { return setPasteStatus('idle'); }, 2000);
                        return [2 /*return*/];
                    }
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    _e_1 = _a.sent();
                    return [3 /*break*/, 5];
                case 5:
                    (textareaRef.current && textareaRef.current.focus());
                    setPasteStatus('error');
                    setTimeout(function () { return setPasteStatus('idle'); }, 2000);
                    alert('Clipboard access restricted. Please press Ctrl+V to paste.');
                    return [2 /*return*/];
            }
        });
    }); };
    var handleRead = function () {
        setIsReadAnimating(true);
        setTimeout(function () {
            setIsReadAnimating(false);
            if (pdfFile)
                onPdfUpload(pdfFile, selectedRange);
            else if (text.trim())
                onStart(text);
        }, 420);
    };
    var handleFileSelect = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var file, reader;
        var _this = this;
        return __generator(this, function (_a) {
            if (e.target && e.target.files && e.target.files[0]) {
                file = e.target.files[0];
                if (file.type === 'application/pdf') {
                    setPdfFile(file);
                    setUploadProgress(0);
                    setIsPdfLoading(true);
                    setIsRangeModalOpen(true);
                    reader = new FileReader();
                    reader.onprogress = function (e) { if (e.lengthComputable)
                        setUploadProgress(Math.round(e.loaded / e.total * 100)); };
                    reader.onload = function (e) { return __awaiter(_this, void 0, void 0, function () {
                        var doc, err_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    setUploadProgress(100);
                                    if (!(e.target && e.target.result && pdfjsLib)) return [3 /*break*/, 5];
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, 4, 5]);
                                    return [4 /*yield*/, pdfjsLib.getDocument(e.target.result).promise];
                                case 2:
                                    doc = _a.sent();
                                    setPdfDoc(doc);
                                    setTotalPdfPages(doc.numPages);
                                    setSelectedRange({ start: 1, end: doc.numPages });
                                    setActivePreviewPage(1);
                                    return [3 /*break*/, 5];
                                case 3:
                                    err_4 = _a.sent();
                                    console.error(err_4);
                                    return [3 /*break*/, 5];
                                case 4:
                                    setIsPdfLoading(false);
                                    return [7 /*endfinally*/];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); };
                    reader.readAsArrayBuffer(file);
                }
            }
            return [2 /*return*/];
        });
    }); };
    var handleRangeChange = function (type, value) {
        var v = Math.max(1, Math.min(value, totalPdfPages));
        if (type === 'start') {
            if (v > selectedRange.end)
                v = selectedRange.end;
            setSelectedRange(function (p) { return (__assign(__assign({}, p), { start: v })); });
            setActivePreviewPage(v);
            setEditModeInternal('start');
        }
        else {
            if (v < selectedRange.start)
                v = selectedRange.start;
            setSelectedRange(function (p) { return (__assign(__assign({}, p), { end: v })); });
            setActivePreviewPage(v);
            setEditModeInternal('end');
        }
    };
    var handleClear = function () { setText(''); setPdfFile(null); setPdfDoc(null); setTotalPdfPages(0); setSelectedRange({ start: 1, end: 1 }); setUploadProgress(0); setPreviewImage(null); if (fileInputRef.current)
        fileInputRef.current.value = ''; };
    return (React.createElement("div", { className: "w-full flex flex-col items-center justify-center min-h-[85vh] px-6 relative" },
        aiResult && (React.createElement("div", { className: "fixed inset-0 z-[120] flex items-center justify-center px-6" },
            React.createElement("div", { className: "absolute inset-0 bg-black/80 backdrop-blur-md", onClick: function () { return setAiResult(null); } }),
            React.createElement("div", { className: "relative w-full max-w-lg glass-dock rounded-[32px] border border-white/10 p-8 shadow-2xl zoom-in-95" },
                React.createElement("div", { className: "flex justify-between items-center mb-6" },
                    React.createElement("h3", { className: "display-serif text-2xl text-white" }, aiResult.title),
                    React.createElement("button", { onClick: function () { return setAiResult(null); }, className: "p-2 text-slate-500 hover:text-white" },
                        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                            React.createElement("path", { d: "M18 6 6 18" }),
                            React.createElement("path", { d: "m6 6 12 12" })))),
                React.createElement("div", { className: "max-h-[50vh] overflow-y-auto text-slate-300 font-serif leading-relaxed whitespace-pre-wrap text-base custom-scrollbar" }, aiResult.content),
                React.createElement("button", { onClick: function () { return setAiResult(null); }, className: "mt-6 w-full py-4 bg-indigo-600 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest" }, "Back to Text")))),
        isRangeModalOpen && (React.createElement("div", { className: "fixed inset-0 z-[100] flex items-center justify-center px-4" },
            React.createElement("div", { className: "absolute inset-0 bg-black/80 backdrop-blur-sm", onClick: function () { return setIsRangeModalOpen(false); } }),
            React.createElement("div", { className: "relative w-full max-w-md bg-[#0f0f11] rounded-[32px] border border-white/10 shadow-2xl p-6 zoom-in-95" },
                React.createElement("div", { className: "flex justify-between items-center mb-6" },
                    React.createElement("div", null,
                        React.createElement("h3", { className: "display-serif text-xl text-white" }, "Select Range"),
                        isPdfLoading ? React.createElement("p", { className: "text-[10px] uppercase text-indigo-400 font-bold mt-1 animate-pulse" },
                            "Uploading ",
                            uploadProgress,
                            "%") : React.createElement("p", { className: "text-[10px] uppercase text-slate-500 font-bold mt-1" },
                            "Total ",
                            totalPdfPages,
                            " Pages")),
                    !isPdfLoading && React.createElement("button", { onClick: function () { return setIsRangeModalOpen(false); }, className: "p-2 bg-white/5 rounded-full hover:bg-white/10 text-slate-400" },
                        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                            React.createElement("path", { d: "M18 6 6 18" }),
                            React.createElement("path", { d: "m6 6 12 12" })))),
                React.createElement("div", { className: "relative w-full h-72 mb-6 rounded-2xl border border-white/5 bg-[#050505] overflow-hidden" }, isPdfLoading ? (React.createElement("div", { className: "w-full h-full flex flex-col items-center justify-center space-y-4" },
                    React.createElement("div", { className: "w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" }),
                    React.createElement("div", { className: "text-[10px] font-bold text-slate-500 uppercase tracking-widest" }, "Generating Preview..."),
                    React.createElement("div", { className: "w-32 h-1 bg-white/10 rounded-full overflow-hidden" },
                        React.createElement("div", { className: "h-full bg-indigo-500 transition-all", style: { width: "".concat(uploadProgress, "%") } })))) : (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "w-full h-full overflow-auto flex items-center justify-center", onTouchStart: function (e) { var x = e.touches[0].clientX; e.currentTarget._startX = x; }, onTouchEnd: function (e) { var dx = e.changedTouches[0].clientX - (e.currentTarget._startX || 0); if (Math.abs(dx) > 40) {
                            if (dx > 0 && activePreviewPage > 1)
                                handleRangeChange(editModeInternal, activePreviewPage - 1);
                            else if (dx < 0 && activePreviewPage < totalPdfPages)
                                handleRangeChange(editModeInternal, activePreviewPage + 1);
                        } } }, previewImage ? React.createElement("img", { src: previewImage, alt: "Preview", className: "max-h-full max-w-full shadow-2xl rounded-sm object-contain", style: { transform: "scale(".concat(zoomLevel, ")"), transition: 'transform 0.3s' }, onDoubleClick: function () { return setZoomLevel(function (z) { return z >= 2 ? 1 : z + 1; }); } }) : React.createElement("div", { className: "animate-pulse w-32 h-44 bg-white/5 rounded-md" })),
                    React.createElement("div", { className: "absolute top-3 right-3 flex flex-col space-y-1 z-20" },
                        React.createElement("button", { onClick: function () { return setZoomLevel(function (z) { return Math.min(3, z + 1); }); }, className: "p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white" },
                            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                                React.createElement("line", { x1: "12", x2: "12", y1: "5", y2: "19" }),
                                React.createElement("line", { x1: "5", x2: "19", y1: "12", y2: "12" }))),
                        React.createElement("button", { onClick: function () { return setZoomLevel(function (z) { return Math.max(1, z - 1); }); }, className: "p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white" },
                            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                                React.createElement("line", { x1: "5", y1: "12", x2: "19", y2: "12" })))),
                    React.createElement("div", { className: "absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest z-20" },
                        "Page ",
                        activePreviewPage),
                    React.createElement("div", { className: "absolute inset-y-0 left-0 w-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10" },
                        React.createElement("button", { onClick: function () { return activePreviewPage > 1 && handleRangeChange(editModeInternal, activePreviewPage - 1); }, className: "p-2 bg-black/40 rounded-full text-white" },
                            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5" },
                                React.createElement("path", { d: "m15 18-6-6 6-6" })))),
                    React.createElement("div", { className: "absolute inset-y-0 right-0 w-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-10" },
                        React.createElement("button", { onClick: function () { return activePreviewPage < totalPdfPages && handleRangeChange(editModeInternal, activePreviewPage + 1); }, className: "p-2 bg-black/40 rounded-full text-white" },
                            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5" },
                                React.createElement("path", { d: "m9 18 6-6-6-6" }))))))),
                React.createElement("div", { className: "space-y-4 ".concat(isPdfLoading ? 'opacity-50 pointer-events-none' : '') }, [{ type: 'start', color: 'indigo', val: selectedRange.start }, { type: 'end', color: 'rose', val: selectedRange.end }].map(function (_a) {
                    var type = _a.type, color = _a.color, val = _a.val;
                    return (React.createElement("div", { key: type, className: "space-y-2 p-3 rounded-2xl cursor-pointer transition-colors ".concat(editModeInternal === type ? 'bg-' + color + '-500/10 border border-' + color + '-500/20' : 'border border-transparent hover:bg-white/5'), onClick: function () { return setEditModeInternal(type); } },
                        React.createElement("div", { className: "flex justify-between items-center" },
                            React.createElement("label", { className: "text-xs font-bold uppercase tracking-widest ".concat(editModeInternal === type ? 'text-' + color + '-400' : 'text-slate-500') }, type === 'start' ? 'Start Page' : 'End Page'),
                            React.createElement("input", { type: "number", value: val, onChange: function (e) { return handleRangeChange(type, parseInt(e.target.value)); }, className: "w-16 bg-white/5 border border-white/10 rounded-lg text-center text-sm font-bold text-white focus:outline-none" })),
                        React.createElement("input", { type: "range", min: "1", max: totalPdfPages || 100, value: val, onChange: function (e) { return handleRangeChange(type, parseInt(e.target.value)); }, className: "w-full accent-".concat(color, "-500") })));
                })),
                React.createElement("button", { disabled: isPdfLoading, onClick: function () { return setIsRangeModalOpen(false); }, className: "mt-6 w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-slate-500 text-white font-bold text-xs uppercase tracking-[0.2em] rounded-xl transition-transform active:scale-95" }, isPdfLoading ? 'Processing...' : 'Set Range')))),
        React.createElement("div", { className: "w-full max-w-2xl relative z-10 -mt-10" },
            React.createElement("div", { className: "mb-6 flex flex-col items-center space-y-1" },
                React.createElement("div", { className: "spin-loader" },
                    React.createElement("span", { className: "static-word" }, "Let's"),
                    React.createElement("div", { className: "spin-words" },
                        React.createElement("span", { className: "spin-word" }, "go Premium"),
                        React.createElement("span", { className: "spin-word" }, "read PDFs"),
                        React.createElement("span", { className: "spin-word" }, "read Smart"),
                        React.createElement("span", { className: "spin-word" }, "have fun"),
                        React.createElement("span", { className: "spin-word" }, "learn more"),
                        React.createElement("span", { className: "spin-word" }, "read Books"),
                        React.createElement("span", { className: "spin-word" }, "go Premium")))),
            pdfFile && (React.createElement("div", { className: "mb-4 animate-in fade-in" },
                React.createElement("div", { className: "glass-dock rounded-2xl p-4 flex items-center border border-white/10 bg-[#151518]/90" },
                    React.createElement("button", { onClick: function () { return setIsRangeModalOpen(true); }, className: "p-3 mr-3 text-indigo-400 hover:bg-white/5 rounded-xl border border-indigo-500/20 bg-indigo-500/10" },
                        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                            React.createElement("line", { x1: "4", x2: "20", y1: "21", y2: "21" }),
                            React.createElement("line", { x1: "20", x2: "4", y1: "3", y2: "3" }),
                            React.createElement("line", { x1: "4", x2: "20", y1: "12", y2: "12" }))),
                    React.createElement("div", { className: "flex-1 min-w-0" },
                        React.createElement("h3", { className: "text-sm font-bold text-white truncate pr-2" }, pdfFile.name),
                        React.createElement("div", { className: "flex items-center space-x-2 mt-1" },
                            React.createElement("div", { className: "h-1 w-24 bg-white/10 rounded-full overflow-hidden" },
                                React.createElement("div", { className: "h-full bg-indigo-500 transition-all", style: { width: "".concat(uploadProgress, "%") } })),
                            React.createElement("span", { className: "text-[10px] text-slate-400 font-bold" },
                                selectedRange.start,
                                "-",
                                selectedRange.end,
                                "/",
                                totalPdfPages)))))),
            React.createElement("div", { className: "shine-card w-full" },
                React.createElement("div", { className: "shine-orb" }),
                React.createElement("div", { className: "shine-card-inner" },
                    React.createElement("textarea", { ref: textareaRef, value: text, onChange: function (e) { return setText(e.target.value); }, onPaste: function (e) { var t = e.clipboardData.getData('text'); if ((t && t.trim())) { e.preventDefault(); setText(function (p) { var n = normalizeMarkdownPaste(t); return p ? p + '\n\n' + n : n; }); } }, disabled: pdfFile !== null, placeholder: pdfFile ? 'PDF Selected. Click Read Now to begin.' : 'Paste or type your manuscript...', className: "relative w-full min-h-[200px] bg-transparent text-center text-xl border-none focus:ring-0 focus:outline-none resize-none leading-relaxed font-serif p-6 z-[2] ".concat(pdfFile ? 'text-slate-600' : 'text-slate-300 placeholder-slate-700') }))),
            React.createElement("div", { className: "flex justify-center mt-6 opacity-80" },
                React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", height: "160", width: "160", viewBox: "0 0 200 200" },
                    React.createElement("defs", null,
                        React.createElement("linearGradient", { y2: "100%", x2: "10%", y1: "0%", x1: "0%", id: "iso-g1" },
                            React.createElement("stop", { style: { stopColor: '#1e2026', stopOpacity: 1 }, offset: "20%" }),
                            React.createElement("stop", { style: { stopColor: '#414750', stopOpacity: 1 }, offset: "60%" })),
                        React.createElement("linearGradient", { y2: "100%", x2: "0%", y1: "-17%", x1: "10%", id: "iso-g2" },
                            React.createElement("stop", { style: { stopColor: '#1f474400', stopOpacity: 1 }, offset: "20%" }),
                            React.createElement("stop", { id: "iso-animStop", style: { stopColor: '#10c6d354', stopOpacity: 1 }, offset: "100%" })),
                        React.createElement("linearGradient", { y2: "100%", x2: "10%", y1: "0%", x1: "0%", id: "iso-g3" },
                            React.createElement("stop", { style: { stopColor: '#10ccd300', stopOpacity: 1 }, offset: "20%" }),
                            React.createElement("stop", { style: { stopColor: '#10c6d354', stopOpacity: 1 }, offset: "100%" }))),
                    React.createElement("g", null,
                        React.createElement("polygon", { id: "iso-bounce",  transform: "rotate(45 100 100)", strokeWidth: "1", stroke: "#17afbd", fill: "none", points: "70,70 148,50 130,130 50,150" }),
                        React.createElement("polygon", { id: "iso-bounce2", transform: "rotate(45 100 100)", strokeWidth: "1", stroke: "#07e7fca4", fill: "none", points: "70,70 148,50 130,130 50,150" }),
                        React.createElement("polygon", { transform: "rotate(45 100 100)", strokeWidth: "2", fill: "#414750", points: "70,70 150,50 130,130 50,150" }),
                        React.createElement("polygon", { strokeWidth: "2", fill: "url(#iso-g1)", points: "100,70 150,100 100,130 50,100" }),
                        React.createElement("polygon", { transform: "translate(20, 31)", strokeWidth: "2", fill: "#227f8b", points: "80,50 80,75 80,99 40,75" }),
                        React.createElement("polygon", { transform: "translate(20, 31)", strokeWidth: "2", fill: "url(#iso-g2)", points: "40,-40 80,-40 80,99 40,75" }),
                        React.createElement("polygon", { transform: "rotate(180 100 100) translate(20, 20)", strokeWidth: "2", fill: "#17afbd", points: "80,50 80,75 80,99 40,75" }),
                        React.createElement("polygon", { transform: "rotate(0 100 100) translate(60, 20)", strokeWidth: "2", fill: "url(#iso-g3)", points: "40,-40 80,-40 80,85 40,110.2" }),
                        React.createElement("polygon", { id: "iso-particles",  transform: "rotate(45 100 100) translate(80, 95)", strokeWidth: "2", fill: "#ffffff", points: "5,0 5,5 0,5 0,0" }),
                        React.createElement("polygon", { id: "iso-particles2", transform: "rotate(45 100 100) translate(80, 55)", strokeWidth: "2", fill: "#17afbd", points: "6,0 6,6 0,6 0,0" }),
                        React.createElement("polygon", { id: "iso-particles3", transform: "rotate(45 100 100) translate(70, 80)", strokeWidth: "2", fill: "#17afbd", points: "2,0 2,2 0,2 0,0" }),
                        React.createElement("polygon", { strokeWidth: "2", fill: "#292d34", points: "29.5,99.8 100,142 100,172 29.5,130" }),
                        React.createElement("polygon", { transform: "translate(50, 92)", strokeWidth: "2", fill: "#1f2127", points: "50,50 120.5,8 120.5,35 50,80" })))),
        React.createElement("input", { type: "file", ref: fileInputRef, onChange: handleFileSelect, accept: "application/pdf", className: "hidden" }),
        React.createElement("div", { className: "fixed bottom-10 left-1/2 -translate-x-1/2 z-40" },
            React.createElement("div", { className: "glass-dock px-3 py-2.5 rounded-full flex items-center space-x-1 md:space-x-3 shadow-2xl border-white/10" },
                React.createElement("button", { onClick: onOpenSettings, className: "p-3.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all" },
                    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                        React.createElement("path", { d: "M20 7h-9" }),
                        React.createElement("path", { d: "M14 17H5" }),
                        React.createElement("circle", { cx: "17", cy: "17", r: "3" }),
                        React.createElement("circle", { cx: "7", cy: "7", r: "3" }))),
                React.createElement("div", { className: "w-px h-6 bg-white/5" }),
                !pdfFile && (React.createElement("button", { onClick: handlePaste, className: "p-3.5 rounded-full transition-all ".concat(pasteStatus === 'success' ? 'text-emerald-500 bg-emerald-500/10' : pasteStatus === 'error' ? 'text-rose-500 bg-rose-500/10' : 'text-slate-500 hover:text-white hover:bg-white/5'), title: "Paste" },
                    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                        React.createElement("rect", { width: "8", height: "4", x: "8", y: "2", rx: "1" }),
                        React.createElement("path", { d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" })))),
                hasContent ? (React.createElement("button", { onClick: handleRead, className: "btn-3d".concat(isReadAnimating ? ' btn-3d-pressing' : '') },
                    React.createElement("div", { className: "btn-3d-top".concat(isReadAnimating ? ' translate-y-[6px]' : ''), style: { transition: 'transform 0.2s' } },
                        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5" },
                            React.createElement("path", { d: "m5 3 14 9-14 9V3z" })),
                        "Read Now"),
                    React.createElement("div", { className: "btn-3d-bottom" }),
                    React.createElement("div", { className: "btn-3d-base" }))) : (React.createElement("button", { onClick: function () { return (fileInputRef.current && fileInputRef.current.click()); }, className: "pearl-button" },
                    React.createElement("div", { className: "pearl-wrap" },
                        React.createElement("p", null,
                            React.createElement("span", null, "\u2727"),
                            React.createElement("span", null, "\u2726"),
                            "Upload PDF")))),
                hasContent && !pdfFile && (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "w-px h-6 bg-white/5" }),
                    React.createElement("button", { onClick: function () { return handleAIAction('structure'); }, disabled: isProcessing, className: "p-3.5 text-amber-500 hover:bg-amber-500/10 rounded-full transition-all", title: "Structure text" },
                        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                            React.createElement("path", { d: "M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m-9 0h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" }))))),
                React.createElement("div", { className: "w-px h-6 bg-white/5" }),
                React.createElement("button", { onClick: handleClear, disabled: !hasContent, className: "group relative flex h-10 w-10 flex-col items-center justify-center overflow-hidden rounded-xl border-2 transition-all ".concat(hasContent ? 'border-red-800 bg-red-950 hover:bg-red-700' : 'border-white/5 bg-white/5 opacity-30 cursor-not-allowed') },
                    React.createElement("svg", { viewBox: "0 0 1.625 1.625", className: "absolute -top-7 fill-white delay-100 group-hover:top-5 group-hover:animate-[spin_1.4s] group-hover:duration-1000", height: "12", width: "12" },
                        React.createElement("path", { d: "M.471 1.024v-.52a.1.1 0 0 0-.098.098v.618c0 .054.044.098.098.098h.487a.1.1 0 0 0 .098-.099h-.39c-.107 0-.195 0-.195-.195" }),
                        React.createElement("path", { d: "M1.219.601h-.163A.1.1 0 0 1 .959.504V.341A.033.033 0 0 0 .926.309h-.26a.1.1 0 0 0-.098.098v.618c0 .054.044.098.098.098h.487a.1.1 0 0 0 .098-.099v-.39a.033.033 0 0 0-.032-.033" }),
                        React.createElement("path", { d: "m1.245.465-.15-.15a.02.02 0 0 0-.016-.006.023.023 0 0 0-.023.022v.108c0 .036.029.065.065.065h.107a.023.023 0 0 0 .023-.023.02.02 0 0 0-.007-.016" })),
                    React.createElement("svg", { width: "13", fill: "none", viewBox: "0 0 39 7", className: "origin-right duration-500 group-hover:rotate-90" },
                        React.createElement("line", { strokeWidth: "4", stroke: "white", y2: "5", x2: "39", y1: "5" }),
                        React.createElement("line", { strokeWidth: "3", stroke: "white", y2: "1.5", x2: "26.0357", y1: "1.5", x1: "12" })),
                    React.createElement("svg", { width: "13", fill: "none", viewBox: "0 0 33 39" },
                        React.createElement("mask", { fill: "white", id: "path-1-inside-1_8_19" },
                            React.createElement("path", { d: "M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z" })),
                        React.createElement("path", { mask: "url(#path-1-inside-1_8_19)", fill: "white", d: "M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z" }),
                        React.createElement("path", { strokeWidth: "4", stroke: "white", d: "M12 6L12 29" }),
                        React.createElement("path", { strokeWidth: "4", stroke: "white", d: "M21 6V29" }))))),
        notification && (React.createElement("div", { className: "fixed top-6 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-2" },
            React.createElement("div", { className: "flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl text-sm font-semibold ".concat(notification.type === 'error' ? 'bg-rose-950/90 border-rose-500/30 text-rose-200' : 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200') },
                React.createElement("span", null, notification.type === 'error' ? '⚠' : '✓'),
                React.createElement("span", null, notification.message),
                React.createElement("button", { onClick: function () { return setNotification(null); }, className: "ml-2 opacity-60 hover:opacity-100" }, "\u2715")))),
        isProcessing && (React.createElement("div", { className: "fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm" },
            React.createElement("div", { className: "flex flex-col items-center space-y-10" },
                React.createElement("div", { className: "flex items-center", style: { transform: 'scale(2)', transformOrigin: 'center' } },
                    React.createElement("div", { className: "shape-loader" },
                        React.createElement("svg", { viewBox: "0 0 80 80" },
                            React.createElement("circle", { r: "32", cy: "40", cx: "40" }))),
                    React.createElement("div", { className: "shape-loader triangle" },
                        React.createElement("svg", { viewBox: "0 0 86 80" },
                            React.createElement("polygon", { points: "43 8 79 72 7 72" }))),
                    React.createElement("div", { className: "shape-loader" },
                        React.createElement("svg", { viewBox: "0 0 80 80" },
                            React.createElement("rect", { height: "64", width: "64", y: "8", x: "8" })))),
                React.createElement("div", { className: "text-center space-y-2 mt-8" },
                    React.createElement("p", { className: "text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400 animate-pulse" }, "Structuring"),
                    React.createElement("p", { className: "text-[9px] text-slate-500 uppercase tracking-widest" }, "AI is processing your text"))))))));
}
