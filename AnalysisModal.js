// ============================================================
// ANALYSIS MODAL
// ============================================================
function AnalysisModal(_a) {
    var _this = this;
    var data = _a.data, isOpen = _a.isOpen, _b = _a.isAutoOpen, isAutoOpen = _b === void 0 ? false : _b, isLoading = _a.isLoading, autoPlayTTS = _a.autoPlayTTS, onClose = _a.onClose, onModelChange = _a.onModelChange, googleApiKey = _a.googleApiKey;
    var _c = useState(false), isPlaying = _c[0], setIsPlaying = _c[1];
    var _d = useState(false), isModelDropdownOpen = _d[0], setIsModelDropdownOpen = _d[1];
    var _f = useState('analysis'), activeTab = _f[0], setActiveTab = _f[1];

    var _h = useState(null), localAudio = _h[0], setLocalAudio = _h[1];
    var _j = useState(false), isGeneratingAudio = _j[0], setIsGeneratingAudio = _j[1];
    var audioCtxRef = useRef(null);
    var audioSrcRef = useRef(null);
    var modalContentRef = useRef(null);
    var shouldCloseOnLiftRef = useRef(false);
    var _k = useState(0), dragY = _k[0], setDragY = _k[1];
    var _l = useState(false), isDragging = _l[0], setIsDragging = _l[1];
    var _ac = useState([]), analysisChatMessages = _ac[0], setAnalysisChatMessages = _ac[1];
    var _ad = useState(''), analysisChatInput = _ad[0], setAnalysisChatInput = _ad[1];
    var _ae = useState(false), isAnalysisChatLoading = _ae[0], setIsAnalysisChatLoading = _ae[1];
    var _af = useState(''), imgSource = _af[0], setImgSource = _af[1];
    var _pq1 = useState(null), preloadedQuestions = _pq1[0], setPreloadedQuestions = _pq1[1];
    var _pq2 = useState({}), preloadedAnswers = _pq2[0], setPreloadedAnswers = _pq2[1];
    var _pq3 = useState(null), loadingAnswerIdx = _pq3[0], setLoadingAnswerIdx = _pq3[1];
    var _pq4 = useState(true), isGeneratingQuestions = _pq4[0], setIsGeneratingQuestions = _pq4[1];
    var analysisChatEndRef = useRef(null);
    var startY = useRef(0);
    useEffect(function () { setLocalAudio(null); setIsGeneratingAudio(false); setActiveTab('analysis'); setAnalysisChatMessages([]); setAnalysisChatInput(''); setPreloadedQuestions(null); setPreloadedAnswers({}); setLoadingAnswerIdx(null); setIsGeneratingQuestions(true); }, [(data && data.word ? data.word : undefined)]);
    /* Generate 3 preloaded questions when data arrives */
    useEffect(function() {
        if (!data || !data.word || !isOpen) return;
        setIsGeneratingQuestions(true);
        setPreloadedQuestions(null);
        setPreloadedAnswers({});
        var modelKey = (typeof MAVERICK_KEY !== 'undefined') ? MAVERICK_KEY : GROQ_API_KEY;
        var modelId = 'meta-llama/llama-4-maverick-17b-128e-instruct';
        var sys = 'You are a question generator. Given a selected word/phrase and its meaning, generate exactly 3 short, distinct, insightful questions that a curious reader would want answered. Questions should be in the same language as the meaning text (Bengali or English). Return ONLY valid JSON: {"questions":["q1","q2","q3"]}';
        var userP = 'Word/phrase: "' + data.word + '"\nMeaning: ' + data.meaning + '\nContext clues: ' + (data.context || '');
        fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + modelKey },
            body: JSON.stringify({ messages: [{ role: 'system', content: sys }, { role: 'user', content: userP }], model: modelId, response_format: { type: 'json_object' }, max_tokens: 300 })
        }).then(function(r) { return r.json(); }).then(function(d) {
            var text = (d.choices && d.choices[0] && d.choices[0].message ? d.choices[0].message.content : '') || '{}';
            var clean = text.replace(/```json\n?|```/g, '').trim();
            var parsed;
            try { parsed = JSON.parse(clean); } catch(e) { parsed = {}; }
            var qs = Array.isArray(parsed.questions) ? parsed.questions.slice(0,3) : [];
            setPreloadedQuestions(qs.length > 0 ? qs : null);
        }).catch(function() {
            setPreloadedQuestions(null);
        }).finally(function() {
            setIsGeneratingQuestions(false);
        });
    }, [(data && data.word ? data.word : undefined), isOpen]);
    useEffect(function() { analysisChatEndRef.current && analysisChatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [analysisChatMessages]);
    useEffect(function () { if (isOpen) {
        setDragY(0);
        setIsDragging(false);
    } }, [isOpen]);
    useEffect(function () { if (!isOpen) {
        stopAudio();
        setIsModelDropdownOpen(false);
    } }, [isOpen]);
    var stopAudio = function () {
        if (audioSrcRef.current) {
            try {
                audioSrcRef.current.stop();
                audioSrcRef.current.disconnect();
            }
            catch (_e) { }
            audioSrcRef.current = null;
        }
        if (audioCtxRef.current) {
            if (audioCtxRef.current.state !== 'closed')
                audioCtxRef.current.close().catch(function () { });
            audioCtxRef.current = null;
        }
        setIsPlaying(false);
    };
    var playAudio = function (b64) { return __awaiter(_this, void 0, void 0, function () {
        var bin, len, bytes, i, i16, AC, ctx, buf, ch, i, src;
        return __generator(this, function (_a) {
            if (isPlaying)
                stopAudio();
            try {
                bin = atob(b64), len = bin.length;
                bytes = new Uint8Array(len);
                for (i = 0; i < len; i++)
                    bytes[i] = bin.charCodeAt(i);
                i16 = new Int16Array(bytes.buffer);
                AC = window.AudioContext || window.webkitAudioContext;
                ctx = new AC({ sampleRate: 24000 });
                audioCtxRef.current = ctx;
                buf = ctx.createBuffer(1, i16.length, 24000);
                ch = buf.getChannelData(0);
                for (i = 0; i < i16.length; i++)
                    ch[i] = i16[i] / 32768.0;
                src = ctx.createBufferSource();
                src.buffer = buf;
                src.connect(ctx.destination);
                src.onended = function () { setIsPlaying(false); if ((audioCtxRef.current && audioCtxRef.current.state !== 'closed'))
                    (audioCtxRef.current && audioCtxRef.current.close()); audioCtxRef.current = null; audioSrcRef.current = null; };
                audioSrcRef.current = src;
                src.start(0);
                setIsPlaying(true);
            }
            catch (e) {
                console.error(e);
                setIsPlaying(false);
            }
            return [2 /*return*/];
        });
    }); };
    var generateAndPlayAudio = function () { return __awaiter(_this, void 0, void 0, function () {
        var hasBengali, textToSpeak, res, b64, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (isGeneratingAudio || !data)
                        return [2 /*return*/];
                    setIsGeneratingAudio(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    hasBengali = /[\u0980-\u09FF]/.test(data.word);
                    textToSpeak = hasBengali ? data.meaning : data.word;
                    return [4 /*yield*/, geminiGenerate(googleApiKey, 'gemini-2.5-flash-preview-tts', [{ parts: [{ text: textToSpeak }], role: 'user' }], { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } } })];
                case 2:
                    res = _a.sent();
                    b64 = ((res.candidates && res.candidates[0] && res.candidates[0].content && res.candidates[0].content.parts) ? ((res.candidates[0].content.parts.find(function (p) { return p.inlineData; }) || {}).inlineData || {}).data : undefined);
                    if (b64) {
                        setLocalAudio(b64);
                        playAudio(b64);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [3 /*break*/, 5];
                case 4:
                    setIsGeneratingAudio(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    useEffect(function () {
        if (isOpen && data && autoPlayTTS && !isLoading && activeTab === 'analysis') {
            var t_1 = setTimeout(function () { if (localAudio)
                playAudio(localAudio);
            else
                generateAndPlayAudio(); }, 100);
            return function () { return clearTimeout(t_1); };
        }
    }, [isOpen, data, autoPlayTTS, isLoading, localAudio, activeTab]);
    useEffect(function () {
        if (!isOpen || !isAutoOpen)
            return;
        var onDown = function (e) { shouldCloseOnLiftRef.current = !(modalContentRef.current && modalContentRef.current.contains(e.target)); };
        var onUp = function (e) { if (shouldCloseOnLiftRef.current) {
            onClose();
            shouldCloseOnLiftRef.current = false;
        } };
        window.addEventListener('pointerdown', onDown);
        window.addEventListener('pointerup', onUp);
        return function () { window.removeEventListener('pointerdown', onDown); window.removeEventListener('pointerup', onUp); };
    }, [isOpen, isAutoOpen, onClose]);
    var handleAnalysisChatSend = function () { return __awaiter(_this, void 0, void 0, function () {
        var userMsg, sysPrompt, userPrompt, r, d, aiText, e;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!analysisChatInput.trim() || isAnalysisChatLoading || !data) return [2];
                    userMsg = analysisChatInput.trim();
                    setAnalysisChatInput('');
                    setAnalysisChatMessages(function(p) { return __spreadArray(__spreadArray([], p, true), [{ role: 'user', content: userMsg }], false); });
                    setIsAnalysisChatLoading(true);
                    sysPrompt = 'You are an expert literary and language AI assistant. Be concise, insightful, and use Markdown formatting (bold, bullets). Answer in the same language as the user\'s question.';
                    userPrompt = 'The user is analyzing the selection: "' + (data.word || '') + '".\nMeaning/Translation: ' + (data.meaning || '') + '\nContext: ' + (data.context || '') + '\n\nUser question: ' + userMsg;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    return [4, fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_API_KEY }, body: JSON.stringify({ messages: [{ role: 'system', content: sysPrompt }, { role: 'user', content: userPrompt }], model: 'moonshotai/kimi-k2-instruct-0905' }) })];
                case 2:
                    r = _b.sent();
                    return [4, r.json()];
                case 3:
                    d = _b.sent();
                    aiText = (d.choices && d.choices[0] && d.choices[0].message ? d.choices[0].message.content : '') || 'No response.';
                    setAnalysisChatMessages(function(p) { return __spreadArray(__spreadArray([], p, true), [{ role: 'ai', content: aiText }], false); });
                    return [3, 6];
                case 4:
                    e = _b.sent();
                    setAnalysisChatMessages(function(p) { return __spreadArray(__spreadArray([], p, true), [{ role: 'ai', content: 'Error: ' + e.message }], false); });
                    return [3, 6];
                case 5:
                    setIsAnalysisChatLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    if (!isOpen || !data)
        return null;
    var handlePreloadedTap = function(question, idx) {
        if (loadingAnswerIdx !== null || preloadedAnswers[idx] !== undefined || isAnalysisChatLoading) return;
        setLoadingAnswerIdx(idx);
        var modelKey = (typeof MAVERICK_KEY !== 'undefined') ? MAVERICK_KEY : GROQ_API_KEY;
        var modelId = 'meta-llama/llama-4-maverick-17b-128e-instruct';
        var sysPrompt = 'You are an expert literary and language AI assistant. Be concise, insightful, and use Markdown formatting (bold, bullets). Answer in the same language as the question. Keep the answer short — 2-4 sentences or a brief bullet list.';
        var userPrompt = 'The user is analyzing: "' + (data.word || '') + '".\nMeaning: ' + (data.meaning || '') + '\nContext: ' + (data.context || '') + '\n\nQuestion: ' + question;
        fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + modelKey },
            body: JSON.stringify({ messages: [{ role: 'system', content: sysPrompt }, { role: 'user', content: userPrompt }], model: modelId, max_tokens: 400 })
        }).then(function(r) { return r.json(); }).then(function(d) {
            var text = (d.choices && d.choices[0] && d.choices[0].message ? d.choices[0].message.content : '') || 'কোনো উত্তর পাওয়া যায়নি।';
            setPreloadedAnswers(function(prev) { var n = {}; Object.keys(prev).forEach(function(k){n[k]=prev[k];}); n[idx]=text; return n; });
        }).catch(function(e) {
            setPreloadedAnswers(function(prev) { var n = {}; Object.keys(prev).forEach(function(k){n[k]=prev[k];}); n[idx]='Error: ' + e.message; return n; });
        }).finally(function() {
            setLoadingAnswerIdx(null);
        });
    };
    var renderMeaning = function (text) {
        var parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map(function (p, i) { return p.startsWith('**') && p.endsWith('**') ? React.createElement("span", { key: i, className: "font-bold text-white bg-emerald-500/20 px-1.5 rounded-md mx-0.5 border border-emerald-500/30" }, p.slice(2, -2)) : React.createElement("span", { key: i }, p); });
    };
    var renderContext = function (text) {
        var lines = String(text || '').split('\n').filter(function (l) { return l.trim(); });
        var nums = ['①','②','③','④','⑤'];
        return React.createElement("div", { className: "ctx-cards" }, lines.map(function (line, i) {
            var clean = line.replace(/^[-*•]\s+/, '');
            var parts = clean.split(/(\*\*.*?\*\*)/g);
            return React.createElement("div", { key: i, className: "ctx-card" },
                React.createElement("div", { className: "ctx-num" }, nums[i] || (i+1)),
                React.createElement("div", { className: "ctx-text" },
                    parts.map(function (p, j) {
                        return p.startsWith('**') && p.endsWith('**')
                            ? React.createElement("span", { key: j, className: "ctx-text-bold" }, p.slice(2,-2))
                            : React.createElement("span", { key: j }, p);
                    })));
        }));
    };
    var wordCount = data.word.trim().split(/\s+/).length;
    var displayTitle = wordCount > 3 ? "\"".concat(data.word.trim().split(/\s+/).slice(0, 3).join(' '), "...\"") : "\"".concat(data.word, "\"");
    var entityType = ((data.entityType) || 'other').toLowerCase();
    var searchTerm = data.searchQuery || data.word;
    var wikiTitle = data.wikiTitle || searchTerm;
    /* For person/place: prefer wikiTitle (always English) for image search to avoid Bengali spelling issues */
    var isBengaliQuery = /[\u0980-\u09FF]/.test(searchTerm);
    var imgSearchTerm = (entityType === 'person' || entityType === 'place') && isBengaliQuery && wikiTitle && !/[\u0980-\u09FF]/.test(wikiTitle)
        ? wikiTitle   /* use English wikiTitle if searchQuery is Bengali */
        : searchTerm; /* otherwise use searchQuery as-is */
    var googleImgUrl = "https://www.google.com/search?igu=1&tbm=isch&q=" + encodeURIComponent(
        entityType === 'person' ? imgSearchTerm + ' portrait photo' :
        entityType === 'place'  ? imgSearchTerm + ' landmark' : searchTerm
    );
    var wikiUrl = "https://en.wikipedia.org/wiki/" + encodeURIComponent(wikiTitle.replace(/\s+/g,'_'));
    var wikimediaUrl = "https://commons.wikimedia.org/w/index.php?search=" + encodeURIComponent(imgSearchTerm) + "&title=Special:MediaSearch&type=image";
    var googleMapsUrl = "https://www.google.com/maps/search/" + encodeURIComponent(imgSearchTerm);
    var googleAiUrl = "https://www.google.com/search?q=" + encodeURIComponent(imgSearchTerm) + "&udm=50";
    var imgSources = entityType === 'person'
        ? [{ id:'wikimedia', label:'Wikimedia', icon:'\u{1F5BC}', url: wikimediaUrl }, { id:'aimode', label:'AI Mode', icon:'\u2728', url: googleAiUrl }, { id:'google', label:'Google', icon:'\u{1F50D}', url: googleImgUrl }]
        : entityType === 'place'
        ? [{ id:'wikimedia', label:'Wikimedia', icon:'\u{1F5BC}', url: wikimediaUrl }, { id:'aimode', label:'AI Mode', icon:'\u2728', url: googleAiUrl }, { id:'maps', label:'Maps', icon:'\u{1F5FA}', url: googleMapsUrl }]
        : [{ id:'google', label:'Images', icon:'\u{1F50D}', url: googleImgUrl }, { id:'aimode', label:'AI Mode', icon:'\u2728', url: googleAiUrl }, { id:'wikimedia', label:'Wikimedia', icon:'\u{1F5BC}', url: wikimediaUrl }];
    var activeImgSource = imgSources.find(function(s) { return s.id === imgSource; }) || imgSources[0];

    return (React.createElement("div", { className: "fixed inset-0 z-[120] flex flex-col justify-end animate-in fade-in" },
        React.createElement("div", { className: "absolute inset-0 bg-black/60 backdrop-blur-sm ".concat(isAutoOpen ? 'pointer-events-none' : ''), onClick: onClose }),
        React.createElement("div", { ref: modalContentRef, className: "relative w-full max-w-4xl mx-auto h-[85vh] glass-dock rounded-t-[32px] border-b-0 border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.7)] slide-in-from-bottom-full flex flex-col pointer-events-auto", style: { transform: "translateY(".concat(dragY, "px)") }, onClick: function (e) { if (!e.target.closest('button,a,input,select,iframe'))
                onClose(); } },
            React.createElement("div", { className: "p-6 pb-2 shrink-0 relative bg-[#0c0c0e]/80 backdrop-blur-xl z-10 rounded-t-[32px] border-b border-white/5 touch-none", onTouchStart: function (e) { setIsDragging(true); startY.current = e.touches[0].clientY; }, onTouchMove: function (e) { if (!isDragging)
                    return; var d = e.touches[0].clientY - startY.current; if (d > 0)
                    setDragY(d); }, onTouchEnd: function () { setIsDragging(false); if (dragY > 150)
                    onClose();
                else
                    setDragY(0); } },
                React.createElement("div", { className: "w-16 h-1.5 bg-white/10 rounded-full mx-auto mb-6 cursor-grab" }),
                React.createElement("div", { className: "flex justify-between items-start mb-4 px-2" },
                    React.createElement("div", { className: "flex-grow pr-4" },
                        React.createElement("div", { className: "flex items-center space-x-3 mb-2" },
                            React.createElement("h3", { className: "text-[10px] caps-spacing text-indigo-400/70 font-bold uppercase tracking-widest" }, "Selection Analysis"),
                            React.createElement("div", { className: "relative", onTouchStart: function (e) { return e.stopPropagation(); } },
                                React.createElement("button", { onClick: function () { return setIsModelDropdownOpen(!isModelDropdownOpen); }, className: "flex items-center space-x-1.5 px-2 py-0.5 bg-white/5 rounded-md border border-white/5 hover:bg-white/10" },
                                    isLoading ? React.createElement(React.Fragment, null,
                                        React.createElement("div", { className: "w-2 h-2 border border-slate-500 border-t-transparent rounded-full animate-spin" }),
                                        React.createElement("span", { className: "text-[9px] font-bold text-slate-500 uppercase" }, "Updating...")) : React.createElement(React.Fragment, null,
                                        React.createElement("div", { className: "w-1 h-1 rounded-full ".concat((data.modelName && data.modelName.includes('Gemini')) ? 'bg-indigo-500' : 'bg-emerald-500') }),
                                        React.createElement("span", { className: "text-[9px] font-bold text-slate-500 uppercase tracking-wider" }, data.modelName || 'AI')),
                                    React.createElement("svg", { className: "w-2 h-2 text-slate-600 transition-transform ".concat(isModelDropdownOpen ? 'rotate-180' : ''), viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3" },
                                        React.createElement("path", { d: "m6 9 6 6 6-6" }))),
                                isModelDropdownOpen && (React.createElement("div", { className: "absolute left-0 top-full mt-2 w-48 glass-dock rounded-xl p-1 border border-white/10 shadow-2xl z-[130] max-h-48 overflow-y-auto custom-scrollbar" }, Object.keys(MODEL_LABELS).map(function (k) { return (React.createElement("button", { key: k, onClick: function () { setIsModelDropdownOpen(false); if (onModelChange)
                                        onModelChange(k); }, className: "w-full text-left px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ".concat(data.modelId === k ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-500 hover:bg-white/5 hover:text-white') }, MODEL_LABELS[k])); }))))),
                        React.createElement("h2", { className: "display-serif text-3xl text-slate-200 font-medium italic animate-in fade-in break-words line-clamp-1" }, displayTitle)),
                    React.createElement("button", { onClick: onClose, className: "p-3 hover:bg-white/5 rounded-full text-slate-500 hover:text-slate-200 transition-all" },
                        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                            React.createElement("path", { d: "M18 6 6 18" }),
                            React.createElement("path", { d: "m6 6 12 12" })))),
                React.createElement("div", { className: "flex space-x-6 px-2", onTouchStart: function (e) { return e.stopPropagation(); } }, ['analysis', 'images'].map(function (tab) { return (React.createElement("button", { key: tab, onClick: function () { return setActiveTab(tab); }, className: "pb-3 text-xs font-black uppercase tracking-widest transition-all relative ".concat(activeTab === tab ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400') },
                    tab === 'analysis' ? 'Analysis' : 'Web & Images',
                    activeTab === tab && React.createElement("div", { className: "absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-full animate-in fade-in" }))); }))),
            React.createElement("div", { className: "flex-grow ".concat(activeTab === 'images' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto custom-scrollbar px-6 py-6 space-y-6') }, activeTab === 'analysis' ? (isLoading ? (React.createElement("div", { className: "flex-grow flex flex-col items-center justify-center p-10 space-y-4" },
                React.createElement("div", { className: "w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" }),
                React.createElement("p", { className: "text-[10px] text-indigo-400 font-bold uppercase tracking-widest animate-pulse" }, "Regenerating..."))) : (React.createElement(React.Fragment, null,
                React.createElement("a", {
                    href: entityType === 'place'
                        ? 'https://www.google.com/maps/search/' + encodeURIComponent(searchTerm)
                        : entityType === 'person'
                        ? 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(searchTerm + ' photo')
                        : 'https://www.google.com/search?q=' + encodeURIComponent(data.smartQuery || searchTerm) + '&udm=50',
                    target: '_blank', rel: 'noopener noreferrer',
                    className: 'smart-action-bar',
                    onClick: function(e) { e.stopPropagation(); },
                    style: {
                        display: 'flex', alignItems: 'stretch', gap: 0,
                        borderRadius: '18px', overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.07)',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                        textDecoration: 'none',
                        background: entityType === 'place'
                            ? 'linear-gradient(135deg,#065f46,#047857)'
                            : entityType === 'person'
                            ? 'linear-gradient(135deg,#1e1b4b,#3730a3)'
                            : 'linear-gradient(135deg,#1e3a5f,#1d4ed8)'
                    }
                },
                    React.createElement("div", { style:{flex:1,display:'flex',alignItems:'center',gap:'12px',padding:'14px 18px',color:'#fff'} },
                        React.createElement("div", { style:{width:38,height:38,borderRadius:10,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:20} },
                            entityType === 'place' ? '🗺️' : entityType === 'person' ? '🔍' : '✨'),
                        React.createElement("div", { style:{display:'flex',flexDirection:'column',gap:2,flex:1,overflow:'hidden'} },
                            React.createElement("span", { style:{fontSize:10,fontWeight:900,letterSpacing:'0.1em',textTransform:'uppercase',opacity:0.7,color:'#fff'} },
                                entityType === 'place' ? 'Open in Google Maps' : entityType === 'person' ? 'Search on Google Images' : 'Search in Google AI Mode'),
                            React.createElement("span", { style:{fontSize:13,fontWeight:700,lineHeight:1.3,color:'#fff',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'} },
                                entityType === 'place' ? searchTerm
                                : entityType === 'person' ? searchTerm
                                : (data.smartQuery || searchTerm))),
                        React.createElement("div", { style:{fontSize:22,color:'rgba(255,255,255,0.7)',flexShrink:0,marginLeft:'auto'} }, '›')),
                ),

                React.createElement("div", { className: "relative" },
                    React.createElement("div", { className: "relative bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-6 min-h-[100px] flex flex-col justify-center backdrop-blur-md" },
                        React.createElement("div", { className: "flex items-center justify-between mb-3" },
                            React.createElement("span", { className: "text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]" }, wordCount > 2 ? 'Translation & Meaning' : 'Definition'),
                            (localAudio || isGeneratingAudio) && (React.createElement("button", { onClick: function (e) { e.stopPropagation(); localAudio && playAudio(localAudio); }, disabled: isGeneratingAudio, className: "px-4 py-2 rounded-full transition-all flex items-center space-x-2 ".concat(isPlaying ? 'bg-emerald-500 text-black' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20') },
                                isGeneratingAudio ? React.createElement("div", { className: "w-3 h-3 border border-emerald-400 border-t-transparent rounded-full animate-spin" }) : isPlaying ? React.createElement("div", { className: "flex space-x-1" },
                                    React.createElement("div", { className: "w-0.5 h-3 bg-black animate-bounce" }),
                                    React.createElement("div", { className: "w-0.5 h-3 bg-black animate-bounce", style: { animationDelay: '0.2s' } }),
                                    React.createElement("div", { className: "w-0.5 h-3 bg-black animate-bounce", style: { animationDelay: '0.4s' } })) : React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5" },
                                    React.createElement("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }),
                                    React.createElement("path", { d: "M15.54 8.46a5 5 0 0 1 0 7.07" })),
                                React.createElement("span", { className: "text-[10px] font-bold uppercase" }, isGeneratingAudio ? 'Generating...' : isPlaying ? 'Playing' : 'Listen')))),
                        React.createElement("p", { className: "serif text-[15px] text-emerald-100 font-medium leading-relaxed" }, renderMeaning(data.meaning)))),
                React.createElement("div", { className: "space-y-3" },
                    React.createElement("h4", { className: "text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2 px-1" },
                        React.createElement("span", { className: "w-3 h-px bg-indigo-500/50 rounded-full" }),
                        wordCount > 2 ? 'Contextual Analysis' : 'Usage',
                        React.createElement("span", { className: "w-3 h-px bg-indigo-500/50 rounded-full" })),
                    renderContext(data.context)),

                /* ── Inline Chat Panel ── */
                React.createElement("div", { className: "analysis-chat-panel" },
                    /* Header */
                    React.createElement("div", { className: "analysis-chat-header" },
                        React.createElement("div", { className: "analysis-chat-header-icon" },
                            React.createElement("svg", { xmlns:"http://www.w3.org/2000/svg", width:"14", height:"14", viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2.2" },
                                React.createElement("path", { d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }))),
                        React.createElement("span", { className: "analysis-chat-header-label" }, "Ask about this"),
                        isAnalysisChatLoading && React.createElement("div", { className: "analysis-chat-thinking" },
                            React.createElement("span", { className: "analysis-chat-thinking-dot" }),
                            React.createElement("span", { className: "analysis-chat-thinking-dot" }),
                            React.createElement("span", { className: "analysis-chat-thinking-dot" }))),

                    /* Preloaded Questions */
                    analysisChatMessages.length === 0 && React.createElement("div", { className: "preloaded-questions-wrap" },
                        React.createElement("span", { className: "preloaded-qs-label" }, "Suggested questions"),
                        isGeneratingQuestions
                            ? React.createElement("div", { className: "pq-generating" },
                                React.createElement("div", { className: "pq-gen-line" }),
                                React.createElement("div", { className: "pq-gen-line" }),
                                React.createElement("div", { className: "pq-gen-line" }))
                            : preloadedQuestions && preloadedQuestions.length > 0
                            ? React.createElement("div", { className: "pq-list" },
                                preloadedQuestions.map(function(q, i) {
                                    var ans = preloadedAnswers[i];
                                    var isLoading = loadingAnswerIdx === i;
                                    var isAnswered = ans !== undefined;
                                    return React.createElement("button", {
                                        key: i,
                                        className: "pq-chip " + (isAnswered ? 'answered' : isLoading ? 'loading' : ''),
                                        onClick: function() { handlePreloadedTap(q, i); },
                                        disabled: isLoading || loadingAnswerIdx !== null
                                    },
                                        React.createElement("div", { className: "pq-num" }, i+1),
                                        React.createElement("div", { className: "pq-content" },
                                            React.createElement("div", { className: "pq-question" }, q),
                                            isLoading && React.createElement("div", { className: "pq-skeleton" },
                                                React.createElement("div", { className: "pq-sk-line", style:{width:'90%'} }),
                                                React.createElement("div", { className: "pq-sk-line", style:{width:'75%',animationDelay:'0.15s'} }),
                                                React.createElement("div", { className: "pq-sk-line", style:{width:'60%',animationDelay:'0.3s'} })),
                                            isAnswered && React.createElement("div", { className: "pq-answer" },
                                                React.createElement(FormattedContent, { content: ans }))));
                                }))
                            : React.createElement("div", { className: "analysis-chat-hint" },
                                React.createElement("span", null, "Ask a follow-up question about this selection…"))),

                    /* Messages (shown after user starts chatting) */
                    analysisChatMessages.length > 0 && React.createElement("div", { className: "analysis-chat-messages" },
                        analysisChatMessages.map(function(msg, i) {
                            return React.createElement("div", { key:i, className: "analysis-chat-msg-row " + (msg.role === 'user' ? 'user' : 'ai') },
                                msg.role === 'user'
                                    ? React.createElement("div", { className: "analysis-chat-bubble user" }, msg.content)
                                    : React.createElement("div", { className: "analysis-chat-bubble ai" }, React.createElement(FormattedContent, { content: msg.content })));
                        }),
                        React.createElement("div", { ref: analysisChatEndRef })),

                    /* Input row */
                    React.createElement("div", { className: "analysis-chat-input-row", onTouchStart: function(e) { e.stopPropagation(); } },
                        React.createElement("input", {
                            type: "text",
                            className: "analysis-chat-input",
                            placeholder: "Ask anything about this…",
                            value: analysisChatInput,
                            disabled: isAnalysisChatLoading,
                            onChange: function(e) { return setAnalysisChatInput(e.target.value); },
                            onKeyDown: function(e) { if (e.key === 'Enter' && !isAnalysisChatLoading) handleAnalysisChatSend(); }
                        }),
                        React.createElement("button", {
                            className: "analysis-chat-send" + ((!analysisChatInput.trim() || isAnalysisChatLoading) ? ' disabled' : ''),
                            disabled: !analysisChatInput.trim() || isAnalysisChatLoading,
                            onClick: handleAnalysisChatSend
                        },
                            React.createElement("svg", { xmlns:"http://www.w3.org/2000/svg", width:"15", height:"15", viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2.5" },
                                React.createElement("line", { x1:"22", y1:"2", x2:"11", y2:"13" }),
                                React.createElement("polygon", { points:"22 2 15 22 11 13 2 9 22 2" }))))),

                React.createElement("div", { className: "h-8" })))) : (React.createElement("div", { className: "flex-grow flex flex-col overflow-hidden" },

                /* ── Entity badge + source tabs ── */
                React.createElement("div", { className: "entity-img-header", onTouchStart: function(e){e.stopPropagation();} },
                    React.createElement("div", { className: "entity-img-badge " + entityType },
                        entityType === 'person' ? React.createElement(React.Fragment,null,
                            React.createElement("svg",{width:"11",height:"11",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5"},React.createElement("path",{d:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"}),React.createElement("circle",{cx:"12",cy:"7",r:"4"})),
                            " Person")
                        : entityType === 'place' ? React.createElement(React.Fragment,null,
                            React.createElement("svg",{width:"11",height:"11",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5"},React.createElement("path",{d:"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"}),React.createElement("circle",{cx:"12",cy:"10",r:"3"})),
                            " Place")
                        : React.createElement(React.Fragment,null,
                            React.createElement("svg",{width:"11",height:"11",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5"},React.createElement("circle",{cx:"11",cy:"11",r:"8"}),React.createElement("line",{x1:"21",y1:"21",x2:"16.65",y2:"16.65"})),
                            " Search")),
                    React.createElement("div", { className: "entity-img-sources" },
                        imgSources.map(function(src) {
                            return React.createElement("button", { key: src.id,
                                className: "entity-img-src-btn" + (imgSource === src.id ? " active" : ""),
                                onClick: function(){ setImgSource(src.id); } },
                                src.icon, " ", src.label);
                        })),
                    React.createElement("div", { className: "entity-img-actions" },
                        React.createElement("a", { href: activeImgSource.url, target: "_blank", rel: "noopener noreferrer",
                            onClick: function(e){e.stopPropagation();}, className: "entity-img-action-btn", title: "Open in new tab" },
                            React.createElement("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2"},
                                React.createElement("path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"}),
                                React.createElement("polyline",{points:"15 3 21 3 21 9"}),
                                React.createElement("line",{x1:"10",y1:"14",x2:"21",y2:"3"}))))),

                /* ── Smart entity hint ── */
                entityType !== 'other' && React.createElement("div", { className: "entity-img-hint" },
                    entityType === 'person'
                        ? React.createElement(React.Fragment,null, React.createElement("span",{className:"entity-img-hint-name"}, searchTerm), " — portraits, AI overview & images. Switch tabs for more.")
                        : React.createElement(React.Fragment,null, React.createElement("span",{className:"entity-img-hint-name"}, searchTerm), " — landmark photos, AI overview & maps. Switch tabs for more.")),

                /* ── Open-in-browser card (replaces iframe — blocked by X-Frame-Options) ── */
                React.createElement("div", {
                    key: activeImgSource.url,
                    className: "w-full flex-grow flex flex-col items-center justify-center gap-5 px-6",
                    style: { background: 'linear-gradient(135deg,#0e0e18 0%,#12121f 100%)' }
                },
                    React.createElement("div", { style: { fontSize: '3rem', lineHeight: 1 } }, activeImgSource.icon),
                    React.createElement("div", { style: { textAlign:'center' } },
                        React.createElement("div", { style: { color:'#e2e8f0', fontWeight:700, fontSize:'1.15rem', marginBottom:'0.3rem' } },
                            activeImgSource.label),
                        React.createElement("div", { style: { color:'#64748b', fontSize:'0.75rem', wordBreak:'break-all', maxWidth:'280px', margin:'0 auto' } },
                            activeImgSource.url.length > 60 ? activeImgSource.url.slice(0,60)+'…' : activeImgSource.url)
                    ),
                    React.createElement("a", {
                        href: activeImgSource.url,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: function(e){ e.stopPropagation(); },
                        style: {
                            display:'inline-flex', alignItems:'center', gap:'0.5rem',
                            background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                            color:'#fff', fontWeight:600, fontSize:'0.95rem',
                            padding:'0.75rem 1.75rem', borderRadius:'999px',
                            textDecoration:'none', boxShadow:'0 4px 20px rgba(99,102,241,0.4)'
                        }
                    },
                        React.createElement("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5"},
                            React.createElement("path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"}),
                            React.createElement("polyline",{points:"15 3 21 3 21 9"}),
                            React.createElement("line",{x1:"10",y1:"14",x2:"21",y2:"3"})),
                        "Open in Browser"
                    ),
                    React.createElement("div", { style:{ color:'#475569', fontSize:'0.7rem', textAlign:'center', maxWidth:'260px', lineHeight:1.5 } },
                        activeImgSource.id === 'wikimedia' ? "Wikimedia Commons blocks embedding — tap to open in your browser." :
                        activeImgSource.id === 'aimode'   ? "Google AI Mode blocks embedding — tap to open in your browser." :
                        "This site blocks embedding — tap to open in your browser."
                    )
                )))))));
}
// ============================================================
