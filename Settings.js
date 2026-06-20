// ============================================================
// SETTINGS
// ============================================================
// ============================================================
function Settings(_a) {
    var isOpen = _a.isOpen, _b = _a.history, history = _b === void 0 ? [] : _b, onSelectHistory = _a.onSelectHistory, activeReaderModel = _a.activeReaderModel, activeStructureModel = _a.activeStructureModel, structureMode = _a.structureMode, activeScanningModel = _a.activeScanningModel, activeOcrPromptMode = _a.activeOcrPromptMode, readerTheme = _a.readerTheme, boldingLevel = _a.boldingLevel, lineSpacing = _a.lineSpacing, boldness = _a.boldness, autoPlayTTS = _a.autoPlayTTS, apiKey1 = _a.apiKey1, apiKey2 = _a.apiKey2, activeKeyIndex = _a.activeKeyIndex, autoScrollSpeed = _a.autoScrollSpeed, onSelectReaderModel = _a.onSelectReaderModel, onSelectStructureModel = _a.onSelectStructureModel, onSelectStructureMode = _a.onSelectStructureMode, onSelectScanningModel = _a.onSelectScanningModel, onSelectOcrPromptMode = _a.onSelectOcrPromptMode, onSelectTheme = _a.onSelectTheme, onSelectBoldingLevel = _a.onSelectBoldingLevel, onSetLineSpacing = _a.onSetLineSpacing, onSetBoldness = _a.onSetBoldness, onToggleAutoPlayTTS = _a.onToggleAutoPlayTTS, onSetApiKey1 = _a.onSetApiKey1, onSetApiKey2 = _a.onSetApiKey2, onSetAutoScrollSpeed = _a.onSetAutoScrollSpeed, onClose = _a.onClose;
    var _c = useState('general'), activeTab = _c[0], setActiveTab = _c[1];
    var _d = useState(0), dragY = _d[0], setDragY = _d[1];
    var _f = useState(false), isDragging = _f[0], setIsDragging = _f[1];
    var _g = useState(false), closing = _g[0], setClosing = _g[1];
    var startY = useRef(0);
    var handleClose = function () {
        setClosing(true);
        setTimeout(function () { setClosing(false); onClose(); }, 380);
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
    if (!isOpen && !closing)
        return null;
    var MODEL_OPTIONS = [
        { id: 'gemini-lite', label: 'Gemini 3.1 Flash-Lite', provider: 'Google · Default', color: 'from-indigo-500/20 to-indigo-900/5' },
        
        { id: 'kimi', label: 'Kimi K2', provider: 'Moonshot/Groq', color: 'from-emerald-500/20 to-emerald-900/5' },
        { id: 'llama-maverick', label: 'Llama Maverick', provider: 'Meta/Groq', color: 'from-blue-500/20 to-blue-900/5' },
    ];
    var SCANNING_OPTIONS = [
        { id: 'gemini-lite', label: 'Gemini 3.5 Flash', provider: 'Google Vision · Default', color: 'from-indigo-600/30 to-indigo-900/10' },
    ];
    var THEMES = [
        { id: 'dark', label: 'Dark', color: 'bg-[#0c0c0c]', border: 'border-slate-700' },
        { id: 'light', label: 'Light', color: 'bg-[#f8fafc]', border: 'border-slate-300' },
        { id: 'sepia', label: 'Sepia', color: 'bg-[#f4ecd8]', border: 'border-amber-200' },
        { id: 'midnight', label: 'Midnight', color: 'bg-[#020617]', border: 'border-blue-900' },
        { id: 'forest', label: 'Forest', color: 'bg-[#052e16]', border: 'border-emerald-900' },
    ];
    var TABS = ['general', 'ocr', 'reader', 'structure', 'history', 'vocab'];
    var BOLD_MAP = { lower: 0, 'lower-medium': 1, medium: 2, 'medium-high': 3, high: 4 };
    var BOLD_REV = ['lower', 'lower-medium', 'medium', 'medium-high', 'high'];
    return (React.createElement("div", { className: "fixed inset-0 z-[100] flex flex-col justify-end" },
        React.createElement("div", { className: "bottom-drawer-backdrop".concat(closing ? ' closing' : ''), onClick: handleClose }),
        React.createElement("div", { className: "bottom-drawer-shell".concat(closing ? ' slide-out-down' : ' slide-in-from-bottom-full'), style: { height: '88vh', maxWidth: '768px', transform: "translateY(".concat(dragY, "px)") } },
            React.createElement("div", __assign({ className: "bottom-drawer-handle" }, dragHandlers),
                React.createElement("div", { className: "bottom-drawer-handle-bar" })),
            React.createElement("div", { className: "flex items-center justify-between px-6 pb-4 shrink-0 border-b border-white/5" },
                React.createElement("h2", { className: "display-serif text-xl text-white font-medium hidden md:block" }, "Preferences"),
                React.createElement("div", { className: "cyber-switch-wrap mx-auto md:mx-0" },
                    [
                        { id: 'cst-1', tab: 'general', icon: '⌂', label: 'General' },
                        { id: 'cst-2', tab: 'ocr', icon: '⊡', label: 'OCR' },
                        { id: 'cst-3', tab: 'reader', icon: '◉', label: 'Reader' },
                        { id: 'cst-4', tab: 'structure', icon: '⬡', label: 'Structure' },
                        { id: 'cst-5', tab: 'history', icon: '◷', label: 'History' },
                        { id: 'cst-6', tab: 'vocab', icon: '✦', label: 'Vocab' },
                    ].map(function (t) { return (React.createElement(React.Fragment, { key: t.id },
                        React.createElement("input", { type: "radio", id: t.id, name: "settings-cyber-tab", checked: activeTab === t.tab, onChange: function () { return setActiveTab(t.tab); } }),
                        React.createElement("label", { htmlFor: t.id, className: "cyber-tab-label" },
                            React.createElement("span", { className: "ct-icon" }, t.icon),
                            React.createElement("span", { className: "ct-text" }, t.label),
                            React.createElement("span", { className: "ct-glare" })))); }),
                    React.createElement("div", { className: "cyber-highlight" },
                        React.createElement("div", { className: "cyber-highlight-inner" })))),
            React.createElement("div", { className: "flex-grow overflow-y-auto custom-scrollbar p-6" },
                (function() {
                if (activeTab === 'general') return React.createElement("div", { className: "space-y-8 animate-in fade-in" },
                    React.createElement("div", { className: "bg-[#121214] rounded-3xl p-5 border border-white/5 max-w-lg" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", { className: "flex items-center space-x-4" },
                                React.createElement("div", { className: "w-12 h-12 rounded-2xl flex items-center justify-center border ".concat(autoPlayTTS ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/5 text-slate-500') },
                                    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                                        React.createElement("path", { d: "M11 5L6 9H2v6h4l5 4V5z" }),
                                        React.createElement("path", { d: "M15.54 8.46a5 5 0 0 1 0 7.07" }))),
                                React.createElement("div", null,
                                    React.createElement("div", { className: "text-base font-bold text-slate-200" }, "Audio Pronunciation"),
                                    React.createElement("div", { className: "text-[10px] text-slate-500 uppercase tracking-widest" }, "Auto-play TTS"))),
                            React.createElement("button", { onClick: onToggleAutoPlayTTS, className: "w-14 h-8 rounded-full p-1 transition-all ".concat(autoPlayTTS ? 'bg-indigo-600 border border-indigo-400' : 'bg-[#1a1a1d] border border-white/10') },
                                React.createElement("div", { className: "w-5 h-5 rounded-full bg-white shadow-sm transition-transform ".concat(autoPlayTTS ? 'translate-x-6' : 'translate-x-0') })))),
                    React.createElement("div", { className: "space-y-6 max-w-xl" },
                        React.createElement("p", { className: "text-[10px] font-bold uppercase tracking-widest text-slate-500" }, "Reading Style"),
                        [
                            { label: 'Auto Scroll Speed', color: 'cyan', val: autoScrollSpeed, min: 1, max: 10, step: 1, fmt: function (v) { return "".concat(v, "x"); }, onChange: function (v) { return onSetAutoScrollSpeed(parseInt(v)); } },
                            { label: 'Bolding Amount', color: 'indigo', val: BOLD_MAP[boldingLevel] || 0, min: 0, max: 4, step: 1, fmt: function (v) { return (BOLD_REV[v] ? BOLD_REV[v].replace('-', ' ') : ''); }, onChange: function (v) { return onSelectBoldingLevel(BOLD_REV[parseInt(v)]); } },
                            { label: 'Bold Brightness', color: 'fuchsia', val: boldness, min: 0.3, max: 1.0, step: 0.1, fmt: function (v) { return "".concat(Math.round(v * 100), "%"); }, onChange: function (v) { return onSetBoldness(parseFloat(v)); } },
                            { label: 'Line Spacing', color: 'emerald', val: lineSpacing, min: 1.0, max: 3.0, step: 0.1, fmt: function (v) { return "".concat(parseFloat(v).toFixed(1), "x"); }, onChange: function (v) { return onSetLineSpacing(parseFloat(v)); } },
                        ].map(function (_a, i) {
                            var label = _a.label, color = _a.color, val = _a.val, min = _a.min, max = _a.max, step = _a.step, fmt = _a.fmt, onChange = _a.onChange;
                            return (React.createElement("div", { key: i, className: "space-y-3" },
                                React.createElement("div", { className: "flex justify-between" },
                                    React.createElement("label", { className: "text-xs font-bold text-".concat(color, "-400 uppercase tracking-widest") }, label),
                                    React.createElement("span", { className: "text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded" }, fmt(val))),
                                React.createElement("div", { className: "h-12 bg-[#121214] rounded-2xl border border-white/5 flex items-center px-4" },
                                    React.createElement("input", { type: "range", min: min, max: max, step: step, value: val, onChange: function (e) { return onChange(e.target.value); }, className: "w-full accent-".concat(color, "-500 cursor-pointer") }))));
                        })),
                    React.createElement("div", { className: "space-y-3 max-w-xl" },
                        React.createElement("label", { className: "text-xs font-bold text-amber-400 uppercase tracking-widest block" }, "Reading Atmosphere"),
                        React.createElement("div", { className: "grid grid-cols-5 gap-3" }, THEMES.map(function (theme) { return (React.createElement("button", { key: theme.id, onClick: function () { return onSelectTheme(theme.id); }, className: "aspect-square rounded-2xl border-2 transition-all flex items-center justify-center ".concat(theme.color, " ").concat(readerTheme === theme.id ? 'scale-110 ' + theme.border + ' shadow-xl' : 'border-transparent opacity-60 hover:opacity-100'), title: theme.label }, readerTheme === theme.id && React.createElement("div", { className: "w-2 h-2 rounded-full ".concat(theme.id === 'light' || theme.id === 'sepia' ? 'bg-slate-900' : 'bg-white') }))); }))));
                if (activeTab === 'ocr') return React.createElement("div", { className: "space-y-6 animate-in fade-in" },
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3" }, "Select Scanning Model"),
                        React.createElement("div", { className: "bg-[#121214] rounded-2xl border border-white/5 p-4 max-w-xs" },
                            React.createElement("div", { className: "radio-container scanning-radio", style: { '--total-radio': 3 } },
                                SCANNING_OPTIONS.map(function (m) {
                                    var icons = { 'llama': '⬡', 'llama-maverick': '⬡' };
                                    var subs = { 'llama': 'Meta · Groq Vision' };
                                    var rid = "ocr-radio-".concat(m.id);
                                    return (React.createElement(React.Fragment, { key: m.id },
                                        React.createElement("input", { id: rid, name: "ocr-model-radio", type: "radio", checked: activeScanningModel === m.id, onChange: function () { return onSelectScanningModel(m.id); } }),
                                        React.createElement("label", { htmlFor: rid },
                                            React.createElement("span", { className: "r-icon" }, icons[m.id] || '◉'),
                                            React.createElement("span", null,
                                                m.label,
                                                React.createElement("span", { className: "r-sub" }, subs[m.id] || m.provider)))));
                                }),
                                React.createElement("div", { className: "glider-container" },
                                    React.createElement("div", { className: "glider" }))))),
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3" }, "OCR Enhancement Mode"),
                        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl" }, [
                            { id: 'default', color: 'slate', label: 'Default', desc: 'Standard OCR with no special enhancement.' },
                            { id: 'noise', color: 'amber', label: 'Noise & Low Light', desc: 'Shadows, low contrast, blurry text compensation.' },
                            { id: 'hybrid', color: 'emerald', label: 'Hybrid Text Layer', desc: 'Compares raw PDF text with image for accuracy.' },
                            { id: 'bengali', color: 'rose', label: 'Bengali Ligatures', desc: 'Complex scripts, small fonts, যুক্তবর্ণ handling.' },
                            { id: 'multicolumn', color: 'cyan', label: 'Multi-Column', desc: 'Newspapers, academic papers with column layout.' },
                            { id: 'context', color: 'violet', label: 'Context-Aware', desc: 'Uses previous page context for spelling consistency.' }
                        ].map(function (_a) {
                            var id = _a.id, color = _a.color, label = _a.label, desc = _a.desc;
                            return (React.createElement("button", { key: id, onClick: function () { return onSelectOcrPromptMode(id); }, className: "relative p-4 rounded-2xl border transition-all text-left ".concat(activeOcrPromptMode === id ? 'bg-' + color + '-500/10 border-' + color + '-500/40' : 'bg-white/5 border-white/5 hover:bg-white/10') },
                                React.createElement("div", { className: "flex items-center space-x-2 mb-2" },
                                    React.createElement("div", { className: 'w-7 h-7 rounded-lg flex items-center justify-center ' + (activeOcrPromptMode === id ? 'bg-' + color + '-500 text-black' : 'bg-white/10 text-slate-400') },
                                        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                                            React.createElement("path", { d: "M4 7V4h16v3" }),
                                            React.createElement("path", { d: "M9 20h6" }),
                                            React.createElement("path", { d: "M12 4v16" }))),
                                    React.createElement("span", { className: 'text-xs font-bold uppercase ' + (activeOcrPromptMode === id ? 'text-' + color + '-200' : 'text-slate-400') }, label)),
                                React.createElement("p", { className: "text-[10px] text-slate-500" }, desc)));
                        }))));
                if (activeTab === 'reader') return React.createElement("div", { className: "space-y-6 animate-in fade-in" },
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3" }, "Select Reader AI Model"),
                        React.createElement("div", { className: "bg-[#121214] rounded-2xl border border-white/5 p-4 max-w-xs" },
                            React.createElement("div", { className: "radio-container" },
                                MODEL_OPTIONS.map(function (m, i) {
                                    var icons = { 'kimi': '◈', 'llama-maverick': '⬡' };
                                    var subs = { 'kimi': 'Moonshot · Groq', 'llama-maverick': 'Meta · Groq' };
                                    var rid = "reader-radio-".concat(m.id);
                                    return (React.createElement(React.Fragment, { key: m.id },
                                        React.createElement("input", { id: rid, name: "reader-model-radio", type: "radio", checked: activeReaderModel === m.id, onChange: function () { return onSelectReaderModel(m.id); } }),
                                        React.createElement("label", { htmlFor: rid },
                                            React.createElement("span", { className: "r-icon" }, icons[m.id] || '◉'),
                                            React.createElement("span", null,
                                                m.label,
                                                React.createElement("span", { className: "r-sub" }, subs[m.id] || m.provider)))));
                                }),
                                React.createElement("div", { className: "glider-container" },
                                    React.createElement("div", { className: "glider" }))))));
                if (activeTab === 'structure') return React.createElement("div", { className: "space-y-6 animate-in fade-in" },
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl" }, [{ id: 'original', color: 'amber', icon: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                                React.createElement("path", { d: "M4 7V4h16v3" }),
                                React.createElement("path", { d: "M9 20h6" }),
                                React.createElement("path", { d: "M12 4v16" })), label: 'Preserve Original', desc: 'Keep original text. Fix punctuation only.' }, { id: 'organized', color: 'indigo', icon: React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                                React.createElement("path", { d: "M21 10H3" }),
                                React.createElement("path", { d: "M21 6H3" }),
                                React.createElement("path", { d: "M21 14H3" }),
                                React.createElement("path", { d: "M21 18H3" })), label: 'Well Organized', desc: 'AI creates organized summary with headers.' }].map(function (_a) {
                        var id = _a.id, color = _a.color, icon = _a.icon, label = _a.label, desc = _a.desc;
                        return (React.createElement("button", { key: id, onClick: function () { return onSelectStructureMode(id); }, className: "relative p-4 rounded-2xl border transition-all text-left ".concat(structureMode === id ? 'bg-' + color + '-500/10 border-' + color + '-500/40' : 'bg-white/5 border-white/5 hover:bg-white/10') },
                            React.createElement("div", { className: "flex items-center space-x-2 mb-2" },
                                React.createElement("div", { className: 'w-7 h-7 rounded-lg flex items-center justify-center ' + (structureMode === id ? 'bg-' + color + '-500 text-black' : 'bg-white/10 text-slate-400') }, icon),
                                React.createElement("span", { className: 'text-xs font-bold uppercase ' + (structureMode === id ? 'text-' + color + '-200' : 'text-slate-400') }, label)),
                            React.createElement("p", { className: "text-[10px] text-slate-500" }, desc)));
                    })),
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3" }, "Select Structure Model"),
                        React.createElement("div", { className: "bg-[#121214] rounded-2xl border border-white/5 p-4 max-w-xs" },
                            React.createElement("div", { className: "radio-container structure-radio" },
                                MODEL_OPTIONS.map(function (m) {
                                    var icons = { 'kimi': '◈', 'llama-maverick': '⬡' };
                                    var subs = { 'kimi': 'Moonshot · Groq', 'llama-maverick': 'Meta · Groq' };
                                    var rid = "struct-radio-".concat(m.id);
                                    return (React.createElement(React.Fragment, { key: m.id },
                                        React.createElement("input", { id: rid, name: "struct-model-radio", type: "radio", checked: activeStructureModel === m.id, onChange: function () { return onSelectStructureModel(m.id); } }),
                                        React.createElement("label", { htmlFor: rid },
                                            React.createElement("span", { className: "r-icon" }, icons[m.id] || '◉'),
                                            React.createElement("span", null,
                                                m.label,
                                                React.createElement("span", { className: "r-sub" }, subs[m.id] || m.provider)))));
                                }),
                                React.createElement("div", { className: "glider-container" },
                                    React.createElement("div", { className: "glider" }))))));
                if (activeTab === 'history') return React.createElement("div", { className: "space-y-4 animate-in fade-in" }, (!history || history.length === 0) ? (React.createElement("div", { className: "flex flex-col items-center justify-center py-16 space-y-3" },
                    React.createElement("div", { className: "text-4xl opacity-20" }, "\u25F7"),
                    React.createElement("p", { className: "text-sm font-serif italic text-slate-600" }, "No reading history yet."),
                    React.createElement("p", { className: "text-[10px] text-slate-700 uppercase tracking-widest" }, "Start reading to see your history here"))) : (React.createElement("div", { className: "space-y-3 max-w-xl" },
                    React.createElement("div", { style:{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px'} },
                        React.createElement("span", { style:{fontSize:'10px', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(100,120,160,0.5)'} }, history.length + " saved sessions"),
                        React.createElement("button", { onClick: function() {
                            try { localStorage.removeItem('maxofpdf_history'); } catch(e) {}
                            window.dispatchEvent(new CustomEvent('maxofpdf_clear_history'));
                        }, style:{fontSize:'10px', color:'rgba(239,68,68,0.6)', background:'none', border:'none', cursor:'pointer', fontWeight:700, padding:'4px 8px', borderRadius:'6px'} }, "Clear All")),
                    history.map(function (item) {
                        var wordCount = item.data && item.data.rawText ? item.data.rawText.trim().split(/\s+/).filter(function(w){return w.length>0;}).length : 0;
                        var readMins = Math.ceil(wordCount / 200);
                        return (React.createElement("div", { key: item.id, style:{display:'flex', alignItems:'center', gap:'12px', padding:'14px', borderRadius:'16px', background:'rgba(18,18,20,1)', border:'1px solid rgba(255,255,255,0.05)', transition:'all 0.2s'} },
                            React.createElement("button", { onClick: function () { (onSelectHistory && onSelectHistory(item)); handleClose(); }, style:{display:'flex', alignItems:'center', gap:'14px', flex:1, minWidth:0, textAlign:'left', background:'none', border:'none', cursor:'pointer', padding:0} },
                                React.createElement("div", { style:{width:'44px', height:'44px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background: item.type === 'pdf' ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)', color: item.type === 'pdf' ? '#f87171' : '#a5b4fc'} },
                                    item.type === 'pdf'
                                        ? React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                                            React.createElement("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
                                            React.createElement("polyline", { points: "14 2 14 8 20 8" }))
                                        : React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                                            React.createElement("path", { d: "M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" }))),
                                React.createElement("div", { style:{flex:1, minWidth:0} },
                                    React.createElement("div", { style:{fontSize:'13px', fontWeight:600, color:'rgba(226,232,240,0.9)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'3px'} }, item.title),
                                    React.createElement("div", { style:{display:'flex', gap:'10px', flexWrap:'wrap'} },
                                        React.createElement("span", { style:{fontSize:'10px', color:'rgba(100,116,139,0.8)', textTransform:'uppercase', letterSpacing:'0.08em'} }, new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })),
                                        wordCount > 0 && React.createElement("span", { style:{fontSize:'10px', color:'rgba(99,102,241,0.7)', fontWeight:700} }, wordCount.toLocaleString() + ' words'),
                                        wordCount > 0 && React.createElement("span", { style:{fontSize:'10px', color:'rgba(110,231,183,0.6)', fontWeight:700} }, readMins + ' min read'),
                                        (item.data.highlights && item.data.highlights.length > 0) && React.createElement("span", { style:{fontSize:'10px', color:'rgba(251,191,36,0.7)', fontWeight:700} }, '✦ ' + item.data.highlights.length + ' highlights'),
                                        (item.data.xrayCache && Object.keys(item.data.xrayCache).length > 0) && React.createElement("span", { style:{fontSize:'10px', color:'rgba(56,189,248,0.7)', fontWeight:700} }, '⬡ X-Ray'),
                                        (item.data.rewrittenPages && Object.keys(item.data.rewrittenPages).length > 0) && React.createElement("span", { style:{fontSize:'10px', color:'rgba(167,139,250,0.7)', fontWeight:700} }, '✎ Rewritten')
                                    ))),
                            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", style:{color:'rgba(100,116,139,0.4)', flexShrink:0} },
                                React.createElement("path", { d: "m9 18 6-6-6-6" }))
                        ));
                    })
                )));
                if (activeTab === 'vocab') return React.createElement(VocabTab, null);
                return null;
                }())))));
}
