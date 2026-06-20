// ============================================================
// MAX DRAWER
// ============================================================
function MaxDrawer(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose, text = _a.text, _b = _a.currentPageText, currentPageText = _b === void 0 ? '' : _b, pageIndex = _a.pageIndex, drawerStateRef = _a.drawerStateRef, drawerActionsRef = _a.drawerActionsRef, activeStructureModel = _a.activeStructureModel, googleApiKey = _a.googleApiKey, onTabChange = _a.onTabChange;
    var _c = useState('summary'), activeTab = _c[0], setActiveTab = _c[1];
    var _d = useState('current'), contextScope = _d[0], setContextScope = _d[1];
    var _f = useState(''), summary = _f[0], setSummary = _f[1];
    var _g = useState({}), summaryCache = _g[0], setSummaryCache = _g[1];
    var _h = useState(false), isSummaryLoading = _h[0], setIsSummaryLoading = _h[1];
    var _j = useState(''), chatInput = _j[0], setChatInput = _j[1];
    var _k = useState([]), messages = _k[0], setMessages = _k[1];
    var _l = useState(false), isChatLoading = _l[0], setIsChatLoading = _l[1];
    var _m = useState('gemini-lite'), activeChatModel = _m[0], setActiveChatModel = _m[1];
    var _o = useState('gemini-lite'), activeSummaryModel = _o[0], setActiveSummaryModel = _o[1];
    var _p = useState(false), isModelMenuOpen = _p[0], setIsModelMenuOpen = _p[1];
    var _q = useState(0), dragY = _q[0], setDragY = _q[1];
    var _r = useState(false), isDragging = _r[0], setIsDragging = _r[1];
    var _s = useState(false), closing = _s[0], setClosing = _s[1];
    /* ── Timeline state ── */
    var _tl0 = useState([]), timelineEvents = _tl0[0], setTimelineEvents = _tl0[1];
    var _tl1 = useState({}), timelineCache = _tl1[0], setTimelineCache = _tl1[1];
    var _tl2 = useState(false), isTimelineLoading = _tl2[0], setIsTimelineLoading = _tl2[1];
    var _tl3 = useState('gemini-lite'), activeTimelineModel = _tl3[0], setActiveTimelineModel = _tl3[1];
    var startY = useRef(0);
    var messagesEndRef = useRef(null);
    var handleClose = function () {
        setClosing(true);
        setTimeout(function () { setClosing(false); onClose(); }, 360);
    };
    useEffect(function () { if (isOpen) {
        setDragY(0);
        setClosing(false);
    } }, [isOpen]);
    var dragHandlers = {
        onMouseDown: function (e) { setIsDragging(true); startY.current = e.clientY; },
        onMouseMove: function (e) { if (!isDragging)
            return; var d = e.clientY - startY.current; if (d > 0)
            setDragY(d); },
        onMouseUp: function () { setIsDragging(false); if (dragY > 90)
            handleClose();
        else
            setDragY(0); },
        onMouseLeave: function () { if (isDragging) {
            setIsDragging(false);
            if (dragY > 90)
                handleClose();
            else
                setDragY(0);
        } },
        onTouchStart: function (e) { setIsDragging(true); startY.current = e.touches[0].clientY; },
        onTouchMove: function (e) { if (!isDragging)
            return; var d = e.touches[0].clientY - startY.current; if (d > 0)
            setDragY(d); },
        onTouchEnd: function () { setIsDragging(false); if (dragY > 90)
            handleClose();
        else
            setDragY(0); },
    };
    var contentAreaTouchHandlers = {
        onTouchStart: function(e) { e.stopPropagation(); setIsDragging(false); },
    };
    var MODEL_NAMES = { 'gemini-lite': 'Gemini 3.1 Flash-Lite', 'kimi-2': 'Kimi K2', 'llama-maverick': 'Llama Maverick' };
    useEffect(function () { (messagesEndRef.current && messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })); }, [messages]);
    useEffect(function () { if (drawerStateRef)
        drawerStateRef.current.isChatActive = (activeTab === 'chat'); }, [activeTab, drawerStateRef]);
    /* Auto-generate summary when drawer opens or page/scope changes */
    useEffect(function () {
        if (!isOpen) return;
        var cacheKey = pageIndex + '-' + contextScope;
        if (summaryCache[cacheKey]) { setSummary(summaryCache[cacheKey]); return; }
        generateSummary(activeSummaryModel);
    }, [isOpen, pageIndex, contextScope]);
    /* Re-generate when summary model changes (always bypass cache) */
    useEffect(function () {
        if (!isOpen) return;
        generateSummary(activeSummaryModel, true);
    }, [activeSummaryModel]);
    /* Auto-generate timeline when timeline tab opens or scope/page changes */
    useEffect(function () {
        if (!isOpen || activeTab !== 'timeline') return;
        var cacheKey = 'tl-' + pageIndex + '-' + contextScope;
        if (timelineCache[cacheKey]) { setTimelineEvents(timelineCache[cacheKey]); return; }
        generateTimeline(activeTimelineModel);
    }, [isOpen, activeTab, pageIndex, contextScope]);
    /* Re-generate timeline when model changes */
    useEffect(function () {
        if (!isOpen || activeTab !== 'timeline') return;
        generateTimeline(activeTimelineModel, true);
    }, [activeTimelineModel]);
    var getGroqModel = function (m) {
        if (m === 'kimi-2')
            return { modelId: 'moonshotai/kimi-k2-instruct-0905', key: GROQ_API_KEY, endpoint: 'https://api.groq.com/openai/v1/chat/completions' };
        if (m === 'llama-maverick')
            return { modelId: 'meta-llama/llama-4-maverick-17b-128e-instruct', key: MAVERICK_KEY, endpoint: 'https://api.groq.com/openai/v1/chat/completions' };
        return { modelId: 'moonshotai/kimi-k2-instruct-0905', key: GROQ_API_KEY, endpoint: 'https://api.groq.com/openai/v1/chat/completions' };
    };
    var generateSummary = function (modelOverride, forceRegen) { return __awaiter(_this, void 0, void 0, function () {
        var mToUse, cacheKey, srcText, promptCtx, result_1, gemApiModel, r, _a, modelId, key, endpoint, r, d, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    mToUse = modelOverride || activeSummaryModel;
                    cacheKey = "".concat(pageIndex, "-").concat(contextScope);
                    if (!forceRegen && !modelOverride && summaryCache[cacheKey]) {
                        setSummary(summaryCache[cacheKey]);
                        return [2 /*return*/];
                    }
                    srcText = contextScope === 'cumulative' ? text : currentPageText;
                    if (!(srcText && srcText.trim())) {
                        setSummary('No text available.');
                        return [2 /*return*/];
                    }
                    setIsSummaryLoading(true);
                    setSummary('');
                    promptCtx = contextScope === 'cumulative'
                        ? 'তুমি একজন বিশেষজ্ঞ সম্পাদক। নিচের পুরো লেখার সারাংশ বাংলায় লেখো।\nকঠোরভাবে মেনে চলো:\n— মোট ৪-৫টি অনুচ্ছেদ, প্রতিটি সর্বোচ্চ ২ বাক্য।\n— প্রতিটি বাক্যে শুধু সবচেয়ে জরুরি তথ্য রাখো — বাকি সব বাদ দাও।\n— গুরুত্বপূর্ণ ব্যক্তি, স্থান, সংখ্যা, তারিখ, সংজ্ঞা ও মূল শব্দগুলো **এভাবে** bold করো।\n— কোনো ভূমিকা, উপসংহার, বুলেট, হেডার বা তালিকা লেখা যাবে না।\n— "এই লেখায়", "লেখক বলেছেন", "প্রথমে" এই ধরনের শব্দ ব্যবহার করা যাবে না।\n— সরাসরি তথ্য দাও, যেন পাঠক লেখাটি না পড়েও মূল বিষয়গুলো জানতে পারে।'
                        : 'তুমি একজন বিশেষজ্ঞ সম্পাদক। নিচের পাতার সারাংশ বাংলায় লেখো।\nকঠোরভাবে মেনে চলো:\n— মোট ২-৩টি অনুচ্ছেদ, প্রতিটি সর্বোচ্চ ২ বাক্য।\n— প্রতিটি বাক্যে শুধু সবচেয়ে জরুরি তথ্য রাখো।\n— গুরুত্বপূর্ণ ব্যক্তি, স্থান, সংখ্যা, তারিখ, সংজ্ঞা ও মূল শব্দগুলো **এভাবে** bold করো।\n— কোনো ভূমিকা, উপসংহার, বুলেট, হেডার বা তালিকা লেখা যাবে না।\n— "এই পাতায়", "লেখক বলেছেন" এই ধরনের শব্দ ব্যবহার করা যাবে না।\n— সরাসরি তথ্য দাও।';
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, 8, 9]);
                    result_1 = '';
                    if (!(mToUse === 'gemini-lite')) return [3 /*break*/, 3];
                    gemApiModel = mToUse === 'gemini-lite' ? 'gemini-3.5-flash' : 'gemini-2.0-flash';
                    return [4 /*yield*/, geminiGenerate(googleApiKey, gemApiModel, srcText, { systemInstruction: promptCtx })];
                case 2:
                    r = _b.sent();
                    result_1 = r.text || 'সারাংশ তৈরি করা যায়নি।';
                    return [3 /*break*/, 6];
                case 3:
                    _a = getGroqModel(mToUse), modelId = _a.modelId, key = _a.key, endpoint = _a.endpoint;
                    return [4 /*yield*/, fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': "Bearer ".concat(key) }, body: JSON.stringify({ messages: [{ role: 'system', content: "You are a professional editor. ".concat(promptCtx) }, { role: 'user', content: srcText }], model: modelId, temperature: 0.7 }) })];
                case 4:
                    r = _b.sent();
                    return [4 /*yield*/, r.json()];
                case 5:
                    d = _b.sent();
                    result_1 = (d.choices && d.choices[0] && d.choices[0].message ? d.choices[0].message.content : '') || 'সারাংশ তৈরি করা যায়নি।';
                    _b.label = 6;
                case 6:
                    setSummary(result_1);
                    setSummaryCache(function (p) {
                        var _a;
                        return (__assign(__assign({}, p), (_a = {}, _a[cacheKey] = result_1, _a)));
                    });
                    return [3 /*break*/, 9];
                case 7:
                    e_2 = _b.sent();
                    setSummary("Error: ".concat(e_2.message));
                    return [3 /*break*/, 9];
                case 8:
                    setIsSummaryLoading(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    /* ── Timeline Generation ── */
    var generateTimeline = function (modelOverride, forceRegen) {
        var mToUse = modelOverride || activeTimelineModel;
        var cacheKey = 'tl-' + pageIndex + '-' + contextScope;
        if (!forceRegen && timelineCache[cacheKey]) {
            setTimelineEvents(timelineCache[cacheKey]);
            return;
        }
        var srcText = contextScope === 'cumulative' ? text : currentPageText;
        if (!srcText || !srcText.trim()) { setTimelineEvents([]); return; }
        setIsTimelineLoading(true);
        setTimelineEvents([]);
        var sysPrompt = 'Extract dates and events from the text. Write "event" and "description" fields in Bengali. Reply ONLY with valid JSON, no markdown fences: {"events":[{"date":"...","event":"...","description":"...","category":"war|birth|death|law|treaty|rule|other"}]}';
        var userPrompt = 'Extract all dates and events:\n\n' + srcText.slice(0, 2500);
        var gemApiModel = mToUse === 'gemini-lite' ? 'gemini-3.5-flash' : 'gemini-2.0-flash';
        geminiGenerate(googleApiKey, gemApiModel, userPrompt, { systemInstruction: sysPrompt, maxOutputTokens: 800 })
            .then(function(r) {
                var raw = (r && r.text) ? r.text : '{"events":[]}';
                var parsed = safeExtractJSON(raw);
                var events = (parsed && Array.isArray(parsed.events)) ? parsed.events : [];
                setTimelineEvents(events);
                setTimelineCache(function(prev) { var n = Object.assign({}, prev); n[cacheKey] = events; return n; });
            })
            .catch(function() { setTimelineEvents([]); })
            .finally(function() { setIsTimelineLoading(false); });
    };
    var handleSend = function () { return __awaiter(_this, void 0, void 0, function () {
        var userMsg, sysPrompt, userPrompt, aiText_1, gemApiModel, r, _a, modelId, key, endpoint, r, d, e_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!chatInput.trim() || isChatLoading)
                        return [2 /*return*/];
                    userMsg = chatInput;
                    setChatInput('');
                    setMessages(function (p) { return __spreadArray(__spreadArray([], p, true), [{ role: 'user', content: userMsg }], false); });
                    setIsChatLoading(true);
                    sysPrompt = 'You are an AI assistant. Format output with Markdown headers, bold, bullets, and tables. Be informative.';
                    userPrompt = "Context: ".concat(text.substring(0, 5000), "\n\nUser: ").concat(userMsg);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, 8, 9]);
                    aiText_1 = '';
                    if (!(activeChatModel === 'gemini-lite')) return [3 /*break*/, 3];
                    gemApiModel = activeChatModel === 'gemini-lite' ? 'gemini-3.5-flash' : 'gemini-2.0-flash';
                    return [4 /*yield*/, geminiGenerate(googleApiKey, gemApiModel, userPrompt, { systemInstruction: sysPrompt })];
                case 2:
                    r = _b.sent();
                    aiText_1 = r.text || 'No response.';
                    return [3 /*break*/, 6];
                case 3:
                    _a = getGroqModel(activeChatModel), modelId = _a.modelId, key = _a.key, endpoint = _a.endpoint;
                    return [4 /*yield*/, fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': "Bearer ".concat(key) }, body: JSON.stringify({ messages: [{ role: 'system', content: sysPrompt }, { role: 'user', content: userPrompt }], model: modelId }) })];
                case 4:
                    r = _b.sent();
                    return [4 /*yield*/, r.json()];
                case 5:
                    d = _b.sent();
                    aiText_1 = (d.choices && d.choices[0] && d.choices[0].message ? d.choices[0].message.content : '') || 'Error.';
                    _b.label = 6;
                case 6:
                    setMessages(function (p) { return __spreadArray(__spreadArray([], p, true), [{ role: 'ai', content: aiText_1 }], false); });
                    return [3 /*break*/, 9];
                case 7:
                    e_3 = _b.sent();
                    setMessages(function (p) { return __spreadArray(__spreadArray([], p, true), [{ role: 'ai', content: "Error: ".concat(e_3.message) }], false); });
                    return [3 /*break*/, 9];
                case 8:
                    setIsChatLoading(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    if (!isOpen && !closing)
        return null;
    var isSummary = activeTab === 'summary';
    var isTimeline = activeTab === 'timeline';

    /* Extract keywords from summary text — parse bold words and bullet headers */
    var extractKeywords = function(text) {
        if (!text) return [];
        var keywords = [];
        var seen = new Set();
        /* Priority 1: Bold words — most important */
        var boldRe = /\*\*([^*]{2,20})\*\*/g, m;
        while ((m = boldRe.exec(text)) !== null) {
            var w = m[1].trim().replace(/[*#`_]/g, '');
            if (!seen.has(w) && w.length > 1) { seen.add(w); keywords.push(w); }
            if (keywords.length >= 5) break;
        }
        /* Priority 2: First word/phrase of bullet lines if still under 5 */
        if (keywords.length < 4) {
            text.split('\n').forEach(function(line) {
                if (keywords.length >= 5) return;
                var l = line.replace(/^[\s\-\*•#`_]+/, '').trim();
                if (!l) return;
                var phrase = l.split(/[:,।]/)[0].trim().replace(/[*#`_]/g, '').split(/\s+/).slice(0,2).join(' ');
                if (phrase.length > 2 && !seen.has(phrase)) {
                    seen.add(phrase); keywords.push(phrase);
                }
            });
        }
        return keywords.slice(0, 5);
    };

    /* Assign an icon to each keyword based on common Bengali/English patterns */
    var kwIcon = function(word) {
        var w = word.toLowerCase();
        if (/pdf|ফাইল|file|document|doc/.test(w)) return '📄';
        if (/react|framework|code|api|প্রযুক্তি|tech/.test(w)) return '⚛️';
        if (/ai|model|gemini|llm|বুদ্ধিম/.test(w)) return '🤖';
        if (/feature|ফিচার|function|ক্ষমত/.test(w)) return '✨';
        if (/app|pwa|mobile|অ্যাপ/.test(w)) return '📱';
        if (/user|ব্যবহারকারী|person|মানু/.test(w)) return '👤';
        if (/data|তথ্য|info/.test(w)) return '🗂️';
        if (/text|লেখা|বাংলা|language|ভাষা/.test(w)) return '📝';
        if (/summary|সারাংশ|সংক্ষেপ/.test(w)) return '📋';
        if (/history|ইতিহাস|timeline/.test(w)) return '🕰️';
        if (/search|অনুসন্ধান|find/.test(w)) return '🔍';
        if (/read|পড়|reader/.test(w)) return '📖';
        if (/design|ui|ডিজাইন/.test(w)) return '🎨';
        if (/version|সংস্করণ|update/.test(w)) return '🔄';
        if (/library|লাইব্রেরি/.test(w)) return '📚';
        if (/premium|প্রিমিয়াম/.test(w)) return '💎';
        return '•';
    };

    var summaryKeywords = isSummary ? extractKeywords(summary) : [];

    return (React.createElement("div", { className: "fixed inset-0 z-[100] flex flex-col justify-end" },
        React.createElement("div", { className: "bottom-drawer-backdrop".concat(closing ? ' closing' : ''), onClick: handleClose }),
        React.createElement("div", { className: "bottom-drawer-shell".concat(closing ? ' slide-out-down' : ' slide-in-from-bottom-full'), style: { height: '82vh', transform: "translateY(".concat(dragY, "px)") } },

            /* ── Drag Handle ── */
            React.createElement("div", __assign({ className: "bottom-drawer-handle" }, dragHandlers),
                React.createElement("div", { className: "bottom-drawer-handle-bar" })),

            /* ── Premium loading overlay ── */
            (isSummaryLoading || isTimelineLoading) && React.createElement("div", { className: "md-loading-overlay" },
                React.createElement("div", { className: "md-loading-box ".concat(isTimeline ? 'timeline' : '') }),
                React.createElement("span", { className: "md-loading-label" }, isTimeline ? 'খুঁজছি…' : 'তৈরি হচ্ছে…')),

            /* ── Header: scope bar + model chip ── */
            React.createElement("div", { className: "max-drawer-header" },
                React.createElement("div", { style:{ display:'flex', alignItems:'center', gap:'10px' } },
                    /* Scope bar */
                    React.createElement("div", { className: "max-drawer-scope-bar", style:{ flex:1 } },
                        React.createElement("button", { className: "max-drawer-scope-btn ".concat(contextScope === 'current' ? 'active' : ''),
                            onClick: function() { return setContextScope('current'); } }, "📄 এই পাতা"),
                        React.createElement("button", { className: "max-drawer-scope-btn ".concat(contextScope === 'cumulative' ? 'active' : ''),
                            onClick: function() { return setContextScope('cumulative'); } }, "📚 পুরো বই")),
                    /* Model chip + dropdown */
                    React.createElement("div", { style:{ position:'relative', flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'6px' } },
                        React.createElement("button", { onClick: function() { return setIsModelMenuOpen(!isModelMenuOpen); },
                            className: "md-model-chip ".concat(isSummary ? 'summary' : 'timeline') },
                            MODEL_NAMES[isSummary ? activeSummaryModel : activeTimelineModel],
                            React.createElement("svg", { width:"8", height:"8", viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2.5", style:{ transition:'transform 0.2s', transform: isModelMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' } },
                                React.createElement("path", { d:"m6 9 6 6 6-6" }))),
                        isModelMenuOpen && React.createElement("div", { className: "max-drawer-model-menu", style:{ right:0, left:'auto' } },
                            Object.keys(MODEL_NAMES).map(function(m) {
                                var curModel = isSummary ? activeSummaryModel : activeTimelineModel;
                                var isSelected = curModel === m;
                                return React.createElement("button", { key:m,
                                    className: "max-drawer-model-item ".concat(isSelected ? 'selected ' + (isSummary ? 'summary' : 'timeline') : ''),
                                    onClick: function() {
                                        if (isSummary) setActiveSummaryModel(m);
                                        else setActiveTimelineModel(m);
                                        setIsModelMenuOpen(false);
                                    } },
                                    isSelected && React.createElement("svg", { width:"8", height:"8", viewBox:"0 0 24 24", fill:"currentColor" }, React.createElement("circle", { cx:"12", cy:"12", r:"6" })),
                                    !isSelected && React.createElement("span", { style:{width:'8px', display:'inline-block'} }),
                                    MODEL_NAMES[m]);
                            })),
                        /* Compact regen button below model chip */
                        React.createElement("button", {
                            className: "md-regen-compact ".concat(isTimeline ? 'timeline' : ''),
                            disabled: isSummary ? isSummaryLoading : isTimelineLoading,
                            onClick: function() {
                                if (isSummary) generateSummary(activeSummaryModel, true);
                                else generateTimeline(activeTimelineModel, true);
                            }},
                            (isSummary ? isSummaryLoading : isTimelineLoading) ? 'তৈরি হচ্ছে…' : 'পুনরায় তৈরি করুন')
                        ))),

            /* ── Generate button below model row (hidden via CSS) ── */
            (isSummary || isTimeline) && React.createElement("div", { className: "md-gen-row" },
                React.createElement("button", {
                    className: "md-gen-btn ".concat(isTimeline ? 'timeline' : ''),
                    disabled: isSummary ? isSummaryLoading : isTimelineLoading,
                    onClick: function() {
                        if (isSummary) generateSummary(activeSummaryModel, true);
                        else generateTimeline(activeTimelineModel, true);
                    }},
                    React.createElement("svg", { width:"14", height:"14", viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2" },
                        React.createElement("path", { d:"M12 3a9 9 0 1 0 9 9" }),
                        React.createElement("path", { d:"M21 3v6h-6" })),
                    (isSummary ? isSummaryLoading : isTimelineLoading) ? 'তৈরি হচ্ছে…' : 'পুনরায় তৈরি করুন')),

            /* ── Keywords row (summary only) ── */
            isSummary && !isSummaryLoading && summaryKeywords.length > 0 && React.createElement("div", { className: "md-keywords-row" },
                summaryKeywords.map(function(kw, i) {
                    return React.createElement("span", { key: i, className: "md-kw-chip", style:{ animationDelay: (i * 0.04) + 's' } },
                        React.createElement("span", null, kwIcon(kw)),
                        kw);
                })),

            /* ── Scrollable content area ── */
            React.createElement("div", { className: "md-content-area custom-scrollbar", onTouchStart: function(e) { e.stopPropagation(); setIsDragging(false); } },

                /* ── SUMMARY TAB ── */
                isSummary && React.createElement(React.Fragment, null,
                    /* Status chip */
                    React.createElement("div", null,
                        !isSummaryLoading && React.createElement("span", { className: "md-status-chip" },
                            React.createElement("span", { className: "md-status-dot ready" }),
                            contextScope === 'cumulative' ? 'পুরো বই' : 'এই পাতা')),

                    /* Summary — plain markdown */
                    !isSummaryLoading && !summary && React.createElement("p", { style:{ color:'rgba(120,150,200,0.45)', fontStyle:'italic', fontSize:'13px', padding:'4px 0' } },
                        "Generate বাটন চাপুন।"),
                    !isSummaryLoading && summary && React.createElement(FormattedContent, { content: summary })),

                /* ── TIMELINE TAB ── */
                isTimeline && React.createElement(React.Fragment, null,
                    React.createElement("div", null,
                        !isTimelineLoading && React.createElement("span", { className: "md-status-chip" },
                            React.createElement("span", { className: "md-status-dot ready", style:{ background:'#f59e0b', boxShadow:'0 0 6px rgba(245,158,11,0.5)' } }),
                            timelineEvents.length > 0 ? timelineEvents.length + 'টি ঘটনা' : 'কোনো তারিখ পাওয়া যায়নি')),

                    /* Timeline cards */
                    !isTimelineLoading && timelineEvents.length > 0 && React.createElement("div", { className:"tl-container" },
                        React.createElement("div", { className:"tl-spine" }),
                        timelineEvents.map(function(ev, idx) {
                            var cat = (ev.category || 'other').toLowerCase();
                            var catEmoji = { war:'⚔️', birth:'🌱', death:'🕯️', law:'⚖️', treaty:'🤝', rule:'👑', other:'📌' }[cat] || '📌';
                            return React.createElement("div", { key:idx, className:"tl-item", style:{ animationDelay:(idx*0.06)+'s' } },
                                React.createElement("div", { className:"tl-dot-wrap" },
                                    React.createElement("div", { className:"tl-dot ".concat(cat) })),
                                React.createElement("div", { className:"tl-card" },
                                    React.createElement("div", { className:"tl-date" }, ev.date || '—'),
                                    React.createElement("div", { className:"tl-event" }, ev.event || 'অজানা ঘটনা'),
                                    ev.description && React.createElement("div", { className:"tl-desc" }, ev.description),
                                    React.createElement("div", { className:"tl-badge ".concat(cat) }, catEmoji, " ", cat)));
                        })),
                    /* Empty */
                    !isTimelineLoading && timelineEvents.length === 0 && React.createElement("div", { className:"tl-empty" },
                        React.createElement("div", { className:"tl-empty-icon" }, "🕰️"),
                        React.createElement("p", { className:"tl-empty-text" }, "ইতিহাস, জীবনী বা আইনি দলিলে তারিখ পাওয়া যাবে।")))),

            /* ── Bottom Navigation ── */
            React.createElement("div", { className: "md-bottom-nav" },
                /* Summary tab */
                React.createElement("button", { className: "md-nav-tab ".concat(isSummary ? 'active-summary' : ''),
                    onClick: function() { setActiveTab('summary'); setIsModelMenuOpen(false); } },
                    React.createElement("svg", { width:"20", height:"20", viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:isSummary ? "2.2" : "1.8" },
                        React.createElement("path", { d:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
                        React.createElement("path", { d:"M14 2v6h6" }),
                        React.createElement("line", { x1:"16", y1:"13", x2:"8", y2:"13" }),
                        React.createElement("line", { x1:"16", y1:"17", x2:"8", y2:"17" })),
                    React.createElement("span", { className:"md-nav-label" }, "সারসংক্ষেপ")),
                /* Timeline tab */
                React.createElement("button", { className: "md-nav-tab ".concat(isTimeline ? 'active-timeline' : ''),
                    onClick: function() { setActiveTab('timeline'); setIsModelMenuOpen(false); } },
                    timelineEvents.length > 0 && React.createElement("span", { className:"md-nav-badge" }, timelineEvents.length),
                    React.createElement("svg", { width:"20", height:"20", viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:isTimeline ? "2.2" : "1.8" },
                        React.createElement("circle", { cx:"12", cy:"12", r:"10" }),
                        React.createElement("polyline", { points:"12 6 12 12 16 14" })),
                    React.createElement("span", { className:"md-nav-label" }, "টাইমলাইন")))

        )));
}
