// ============================================================
// LLAMA SCOUT PAGE DESIGN PROCESSOR
// ============================================================
function runLlamaScoutPageDesign(pageText, pageNum, highlightsArray) {
    if (!pageText) return '';

    var safeText = pageText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    if (highlightsArray && highlightsArray.length > 0) {
        highlightsArray.forEach(function(hl) {
            if (hl.pageNumber === pageNum && hl.text && hl.text.trim().length > 1) {
                var escapedHlText = hl.text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                var hlRegex = new RegExp('(' + escapedHlText + ')', 'gi');
                safeText = safeText.replace(hlRegex, '<span class="looked-up-word-marker" style="border-bottom: 2px dotted #fbbf24; cursor: pointer; background: rgba(251, 191, 36, 0.08);">$1</span>');
            }
        });
    }

    var styled = safeText
        .replace(/(\*\*.*?\*\*)/g, '<span class="llama-scout-bold" style="color: #a78bfa; font-weight: 700; text-shadow: 0 0 12px rgba(167,139,250,0.4);">$1</span>')
        .replace(/(\*.*?\*)/g, '<span class="llama-scout-italic" style="color: #fbbf24; font-style: italic;">$1</span>')
        .replace(/(\n\s*\n)/g, '$1<div class="llama-scout-spacer" style="height: 0.75rem; border-left: 2px dashed rgba(255,255,255,0.07); margin: 0.25rem 0;"></div>');

    return styled;
}

// ============================================================
// READER COMPONENT
// ============================================================
function Reader(_a) {
    var _this = this;
    var text = _a.text, pdfFile = _a.pdfFile, pdfRange = _a.pdfRange, initialExtractedPages = _a.initialExtractedPages, initialPageIndex = _a.initialPageIndex, activeModel = _a.activeModel, activeStructureModel = _a.activeStructureModel, structureMode = _a.structureMode, onModelChange = _a.onModelChange, activeScanningModel = _a.activeScanningModel, activeOcrPromptMode = _a.activeOcrPromptMode, readerTheme = _a.readerTheme, boldingLevel = _a.boldingLevel, lineSpacing = _a.lineSpacing, boldness = _a.boldness, autoScrollSpeed = _a.autoScrollSpeed, autoPlayTTS = _a.autoPlayTTS, onBack = _a.onBack, onOpenSettings = _a.onOpenSettings, googleApiKey = _a.googleApiKey, onRotateKey = _a.onRotateKey, initialHighlights = _a.initialHighlights, initialRewrittenPages = _a.initialRewrittenPages, initialXrayCache = _a.initialXrayCache, onStateChange = _a.onStateChange;
    var _b = useState(initialPageIndex || 0), currentPage = _b[0], setCurrentPage = _b[1];
    var _c = useState(initialHighlights || []), highlights = _c[0], setHighlights = _c[1];
    var _d = useState([]), pendingHighlights = _d[0], setPendingHighlights = _d[1];
    var _lu = useState([]), lookedUpHighlights = _lu[0], setLookedUpHighlights = _lu[1];
    var _f = useState(null), modalData = _f[0], setModalData = _f[1];
    var _g = useState(false), isModalOpen = _g[0], setIsModalOpen = _g[1];
    var _h = useState(false), isAutoOpen = _h[0], setIsAutoOpen = _h[1];
    var _j = useState(false), isMaxDrawerOpen = _j[0], setIsMaxDrawerOpen = _j[1];
    var _k = useState(null), notification = _k[0], setNotification = _k[1];
    var _l = useState(false), isRegenerating = _l[0], setIsRegenerating = _l[1];
    var _m = useState(initialRewrittenPages || {}), rewrittenPages = _m[0], setRewrittenPages = _m[1];
    var _o = useState({}), rewritingStatus = _o[0], setRewritingStatus = _o[1];
    var _p = useState(false), isCustomizerOpen = _p[0], setIsCustomizerOpen = _p[1];
    var _q = useState(false), isCustomizerClosing = _q[0], setIsCustomizerClosing = _q[1];
    var custIsDragging = useRef(false);
    var custStartY = useRef(0);
    var custShellRef = useRef(null);
    var custRaf = useRef(null);
    var custDragY = useRef(0);
    var closeCustomizer = function () {
        setIsCustomizerClosing(true);
        setTimeout(function () { setIsCustomizerClosing(false); setIsCustomizerOpen(false); }, 260);
    };
    var _snapDrawer = function () {
        var el = custShellRef.current;
        if (!el) return;
        var d = custDragY.current;
        if (d > 80) { closeCustomizer(); return; }
        el.style.transition = 'transform 0.28s cubic-bezier(0.22,1,0.36,1)';
        el.style.transform = 'translate3d(0,0,0)';
        var onEnd = function (e) {
            if (e.propertyName === 'transform') {
                el.style.transition = '';
                el.removeEventListener('transitionend', onEnd);
            }
        };
        el.addEventListener('transitionend', onEnd);
    };
    var _setDragY = function (y) {
        custDragY.current = y;
        if (custRaf.current) cancelAnimationFrame(custRaf.current);
        custRaf.current = requestAnimationFrame(function () {
            var el = custShellRef.current;
            if (el) el.style.transform = 'translate3d(0,' + y + 'px,0)';
            custRaf.current = null;
        });
    };
    var custDragHandlers = {
        onMouseDown: function (e) { custIsDragging.current = true; custStartY.current = e.clientY; },
        onMouseMove: function (e) {
            if (!custIsDragging.current) return;
            var d = e.clientY - custStartY.current;
            if (d > 0) _setDragY(d);
        },
        onMouseUp: function () {
            if (!custIsDragging.current) return;
            custIsDragging.current = false;
            _snapDrawer();
        },
        onMouseLeave: function () {
            if (!custIsDragging.current) return;
            custIsDragging.current = false;
            _snapDrawer();
        },
        onTouchStart: function (e) { custIsDragging.current = true; custStartY.current = e.touches[0].clientY; },
        onTouchMove: function (e) {
            if (!custIsDragging.current) return;
            var d = e.touches[0].clientY - custStartY.current;
            if (d > 0) _setDragY(d);
        },
        onTouchEnd: function () {
            if (!custIsDragging.current) return;
            custIsDragging.current = false;
            _snapDrawer();
        },
    };
    var _t = useState('gemini-lite'), customizerModel = _t[0], setCustomizerModel = _t[1];
    var _u = useState('Bengali'), customizerLanguage = _u[0], setCustomizerLanguage = _u[1];
    var _prefetch = useState(true), autoPrefetchNext = _prefetch[0], setAutoPrefetchNext = _prefetch[1];
    var _prefetchCfg = useState(null), lastRewriteConfig = _prefetchCfg[0], setLastRewriteConfig = _prefetchCfg[1];
    var _v = useState(false), showCustomInput = _v[0], setShowCustomInput = _v[1];
    var _w = useState(''), customPromptInput = _w[0], setCustomPromptInput = _w[1];
    var _x = useState(false), isAutoScrolling = _x[0], setIsAutoScrolling = _x[1];
    var _y = useState(false), isOriginalPdfOpen = _y[0], setIsOriginalPdfOpen = _y[1];
    var _z = useState(1.0), pdfViewerZoom = _z[0], setPdfViewerZoom = _z[1];
    var pdfCanvasRef = useRef(null);
    var _0 = useState(null), pdfDoc = _0[0], setPdfDoc = _0[1];
    var _1 = useState(initialExtractedPages || {}), extractedPages = _1[0], setExtractedPages = _1[1];
    var _2 = useState({}), scanningStatus = _2[0], setScanningStatus = _2[1];
    var _3 = useState(false), isComparing = _3[0], setIsComparing = _3[1];
    var _4 = useState(false), showHistoryControls = _4[0], setShowHistoryControls = _4[1];
    /* Selection-based partial rewrite */
    var _5 = useState(null), selectionRewrite = _5[0], setSelectionRewrite = _5[1];
    /* Char-offset based inline skeleton and highlight for partial rewrite */
    var _6 = useState(null), partialRewritePending = _6[0], setPartialRewritePending = _6[1];
    var _6b = useState(null), rewrittenRange = _6b[0], setRewrittenRange = _6b[1];
    var _7 = useState(null), selectionToolbar = _7[0], setSelectionToolbar = _7[1];
    var selToolbarRef = useRef(null);
    var _8 = useState(false), isSelectingPortion = _8[0], setIsSelectingPortion = _8[1];
    var isSelectingPortionRef = useRef(false);
    var _9 = useState(null), capturedPortion = _9[0], setCapturedPortion = _9[1];
    var capturedPortionRef = useRef(null);
    var _5 = useState('summary'), drawerTab = _5[0], setDrawerTab = _5[1];
    var _6 = useState([]), historyStack = _6[0], setHistoryStack = _6[1];
    var _7 = useState(-1), historyIndex = _7[0], setHistoryIndex = _7[1];
    var containerRef = useRef(null);
    var apiKeyRef = useRef(googleApiKey);
    var selectionTimerRef = useRef(null);
    var isPointerDownRef = useRef(false);
    var abortControllersRef = useRef(new Map());
    var drawerStateRef = useRef({ isChatActive: false, lastTranscribed: '', isInputStructured: false });
    var drawerActionsRef = useRef({ structureText: function () { }, revertText: function () { } });
    var autoScrollRef = useRef(null);
    /* ── X-Ray state ── */
    var _xr0 = useState(false), isXRayOpen = _xr0[0], setIsXRayOpen = _xr0[1];
    var _xr1 = useState(false), isXRayLoading = _xr1[0], setIsXRayLoading = _xr1[1];
    var _xr2 = useState(initialXrayCache || {}), xrayCache = _xr2[0], setXrayCache = _xr2[1];
    var _xr3 = useState('all'), xrayFilter = _xr3[0], setXrayFilter = _xr3[1];
    var _xr4 = useState(null), expandedXrayCard = _xr4[0], setExpandedXrayCard = _xr4[1];
    var xrayAbortRef = useRef(null);
    /* ── Interlinear Translation state ── */
    var _il0 = useState(false), interlinearMode = _il0[0], setInterlinearMode = _il0[1];
    var _il1 = useState({}), interlinearCache = _il1[0], setInterlinearCache = _il1[1];
    var _il2 = useState(false), interlinearLoading = _il2[0], setInterlinearLoading = _il2[1];
    var interlinearAbortRef = useRef(null);
    /* ── Entity Highlight (Binocular) state ── */
    var _eh0 = useState(false), entityHighlightMode = _eh0[0], setEntityHighlightMode = _eh0[1];
    var _eh1 = useState(null), ehTooltip = _eh1[0], setEhTooltip = _eh1[1];
    var _ehD = useState(null), ehImageDrawer = _ehD[0], setEhImageDrawer = _ehD[1];
    var _ehDT = useState(0), ehDrawerTabIdx = _ehDT[0], setEhDrawerTabIdx = _ehDT[1];
    var _ehDO = useState(false), ehDrawerOpen = _ehDO[0], setEhDrawerOpen = _ehDO[1];
    var _agb = useState(null), activeGlowBtn = _agb[0], setActiveGlowBtn = _agb[1];
    /* ── BS Detector (Skeptic Mode) state ── */
    var glowTimerRef = useRef(null);
    var triggerGlow = function(btnId) {
        if (glowTimerRef.current) clearTimeout(glowTimerRef.current);
        setActiveGlowBtn(btnId);
        glowTimerRef.current = setTimeout(function() { setActiveGlowBtn(null); }, 2100);
    };
    var ehTooltipTimer = useRef(null);
    useEffect(function () { apiKeyRef.current = googleApiKey; }, [googleApiKey]);
    /* Close X-Ray panel on page navigation */
    useEffect(function () { setIsXRayOpen(false); setXrayFilter('all'); }, [currentPage]);
    /* ── Auto-prefetch next page rewrite in background ── */
    useEffect(function () {
        if (!autoPrefetchNext || !lastRewriteConfig) return;
        var nextPage = currentPage + 1;
        if (nextPage >= totalPages) return;
        if (rewrittenPages[nextPage]) return;
        if (rewritingStatus[nextPage]) return;
        var cfg = lastRewriteConfig;
        var timer = setTimeout(function () {
            performRewrite(cfg.mode, cfg.instruction || '', nextPage);
        }, 800);
        return function () { clearTimeout(timer); };
    }, [currentPage, totalPages, autoPrefetchNext, lastRewriteConfig]);
    /* Auto-save rich session state to parent whenever key state changes */
    useEffect(function () {
        if (onStateChange) {
            onStateChange({
                currentPage: currentPage,
                extractedPages: extractedPages,
                highlights: highlights,
                rewrittenPages: rewrittenPages,
                xrayCache: xrayCache
            });
        }
    }, [currentPage, highlights, rewrittenPages, xrayCache, extractedPages]);
    var displayPages = useMemo(function () { return text ? splitIntoPages(text) : []; }, [text]);
    var totalPages = pdfFile ? (pdfRange ? pdfRange.end - pdfRange.start + 1 : ((pdfDoc ? pdfDoc.numPages : 1) || 1)) : displayPages.length;
    /* ── Shared markdown sanitizer: strips hallucinated syntax from AI output ── */
    var sanitizeMarkdown = function(b) {
        if (!b) return b;
        /* 1. *** triple-asterisk bold+italic → ** bold only */
        b = b.replace(/\*\*\*(.*?)\*\*\*/g, '**$1**');
        /* 2. Stray lone * not part of ** and not a list bullet → remove */
        b = b.replace(/(?<!\*)\*(?!\*)(?!\s)/g, '');
        /* 3. __ double-underscore bold → ** */
        b = b.replace(/__(.*?)__/g, '**$1**');
        /* 4. ##### or deeper headings → strip entirely, make plain text */
        b = b.replace(/^#{5,}\s+/gm, '');
        /* 5. ### used as decorative separator (only dashes/stars/spaces after) → remove */
        b = b.replace(/^#{1,3}\s*[-=*_]{2,}\s*$/gm, '');
        /* 6. # ## ### with NO space after the hashes → strip hashes, treat as plain */
        b = b.replace(/^(#{1,3})([^\s#\n])/gm, '$2');
        /* 7. Lone heading lines that are just a number e.g. "# 3" → plain */
        b = b.replace(/^#{1,3}\s+(\d+\.?\s*)$/gm, '$1');
        /* 8. Unclosed ** (odd number of **) on a single line → strip all ** on that line */
        b = b.replace(/^([^\n]*)\*\*([^\n]*)$/gm, function(line) {
            var count = (line.match(/\*\*/g) || []).length;
            return count % 2 !== 0 ? line.replace(/\*\*/g, '') : line;
        });
        /* 9. Collapse 3+ blank lines → 2 */
        b = b.replace(/\n{3,}/g, '\n\n');
        return b;
    };
    // Load PDF
    useEffect(function () {
        if (!pdfFile || !pdfjsLib)
            return;
        var reader = new FileReader();
        reader.onload = function (e) { return __awaiter(_this, void 0, void 0, function () {
            var doc, start, end, count, status_1, i, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, pdfjsLib.getDocument(e.target.result).promise];
                    case 1:
                        doc = _a.sent();
                        setPdfDoc(doc);
                        start = (pdfRange ? pdfRange.start : 1) || 1, end = (pdfRange ? pdfRange.end : doc.numPages) || doc.numPages;
                        count = end - start + 1;
                        status_1 = {};
                        for (i = 0; i < count; i++)
                            status_1[i] = extractedPages[i] ? 'complete' : 'pending';
                        setScanningStatus(status_1);
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        console.error(err_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        reader.readAsArrayBuffer(pdfFile);
    }, [pdfFile]);
    // PDF Page Viewer
    useEffect(function () {
        if (!isOriginalPdfOpen || !pdfDoc || !pdfCanvasRef.current)
            return;
        var render = function () { return __awaiter(_this, void 0, void 0, function () {
            var pageNum, page, viewport, canvas, ctx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pageNum = ((pdfRange ? pdfRange.start : 1) || 1) + currentPage;
                        return [4 /*yield*/, pdfDoc.getPage(pageNum)];
                    case 1:
                        page = _a.sent();
                        var dpr = window.devicePixelRatio || 1;
                        var baseScale = window.innerWidth / page.getViewport({ scale: 1 }).width;
                        var renderScale = baseScale * pdfViewerZoom * dpr;
                        viewport = page.getViewport({ scale: renderScale });
                        canvas = pdfCanvasRef.current;
                        if (!canvas)
                            return [2 /*return*/];
                        /* Canvas internal pixels = full resolution */
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        /* CSS display size = zoom * screen fit (no dpr multiply — browser handles density) */
                        var displayW = window.innerWidth * pdfViewerZoom;
                        canvas.style.width = displayW + 'px';
                        canvas.style.height = (viewport.height / dpr) + 'px';
                        ctx = canvas.getContext('2d');
                        return [4 /*yield*/, page.render({ canvasContext: ctx, viewport: viewport }).promise];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        render().catch(console.error);
    }, [isOriginalPdfOpen, pdfDoc, currentPage, pdfViewerZoom]);
    // Auto-scroll
    useEffect(function () {
        if (isAutoScrolling) {
            autoScrollRef.current = setInterval(function () { window.scrollBy(0, autoScrollSpeed * 0.5); }, 16);
        }
        else {
            if (autoScrollRef.current)
                clearInterval(autoScrollRef.current);
        }
        return function () { if (autoScrollRef.current)
            clearInterval(autoScrollRef.current); };
    }, [isAutoScrolling, autoScrollSpeed]);
    // PDF OCR scanning
    var OCR_ROTATION = ['gemini-lite'];
    var OCR_PROMPT_LIBRARY = {
        default: '',
        noise: 'ENHANCEMENT: You are a noise-tolerant OCR engine. The input image might have shadows, low contrast, or slightly blurry text. Mentally enhance the contrast, filter out background noise, and focus strictly on the text outlines. Pay close attention to thin strokes, dots, and diacritics (such as Bengali matras or vowels). Do not hallucinate characters that are not present. If a word is partially obscured, use the grammatical structure of the sentence to make an accurate visual deduction.\n\n',
        hybrid: 'ENHANCEMENT: You are a hybrid document reconstruction assistant. Alongside the image, a raw text layer may have been extracted from the PDF. Compare any available raw text with the image. Re-insert missing line breaks, paragraphs, and list structures as visually shown. Correct any corrupted characters or spacing issues by looking at the image. Preserve the exact words from the source; do not paraphrase or summarize.\n\n',
        bengali: 'ENHANCEMENT: You are an expert linguist and OCR transcriber specializing in complex scripts, including Bengali ligatures (যুক্তবর্ণ) and small font sizes. Analyze the image carefully. Bengali glyphs can sometimes merge visually when rendered in low resolution. Carefully isolate overlapping characters (e.g., শ্ল, ক্ষ, ন্ধ, জ্ঞ). Ensure prefixes and suffixes (যেমন: কে, রে, র, এর, তে) are kept attached to their main words inside any bold markers. Do not confuse visually similar characters (e.g., \'র\' and \'ব\', \'উ\' and \'ঊ\').\n\n',
        multicolumn: 'ENHANCEMENT: You are a layout-aware document reader. The document may contain multi-column formats (such as newspapers or academic articles). Identify the column boundaries before transcribing. Read and transcribe the text column-by-column (top-to-bottom for the first column, then top-to-bottom for the next column). Never read horizontally across column dividers. Maintain paragraph breaks exactly as they flow within each individual column.\n\n',
        context: 'ENHANCEMENT: You are a context-aware OCR editor. Maintain narrative and grammatical flow across the page boundary. Resolve ambiguous words or spelling variations on the current page based on the vocabulary and subject matter established on preceding pages. Keep character names, technical terms, and formatting style strictly consistent with the preceding text.\n\n'
    };
    useEffect(function () {
        if (!pdfDoc)
            return;
        var startPage = (pdfRange ? pdfRange.start : 1) || 1;
        var endPage = (pdfRange ? pdfRange.end : pdfDoc.numPages) || pdfDoc.numPages;
        var totalInRange = endPage - startPage + 1;
        var scanPage = function (pageIndex_1) {
            var args_1 = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args_1[_i - 1] = arguments[_i];
            }
            return __awaiter(_this, __spreadArray([pageIndex_1], args_1, true), void 0, function (pageIndex, retryCount, modelOverride) {
                var currentModel, pdfPageNum, page, viewport, canvas, context, base64Image, boldingMap, boldingInstruction, structureInstruction, prevText, contextPrompt, prompt_1, result_2, geminiModel, url, body, r, d, txt, modelId, key, endpoint, r, d, cleanPN_1, cleanH_1, e_4, isQuota, idx;
                if (retryCount === void 0) { retryCount = 0; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if ((scanningStatus[pageIndex] === 'scanning' && retryCount === 0) || scanningStatus[pageIndex] === 'complete')
                                return [2 /*return*/];
                            if (extractedPages[pageIndex] && retryCount === 0) {
                                setScanningStatus(function (p) {
                                    var _a;
                                    return (__assign(__assign({}, p), (_a = {}, _a[pageIndex] = 'complete', _a)));
                                });
                                return [2 /*return*/];
                            }
                            setScanningStatus(function (p) {
                                var _a;
                                return (__assign(__assign({}, p), (_a = {}, _a[pageIndex] = 'scanning', _a)));
                            });
                            currentModel = modelOverride || (activeScanningModel.includes('gemini') ? OCR_ROTATION[pageIndex % OCR_ROTATION.length] : activeScanningModel);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 10, , 15]);
                            pdfPageNum = startPage + pageIndex;
                            return [4 /*yield*/, pdfDoc.getPage(pdfPageNum)];
                        case 2:
                            page = _a.sent();
                            viewport = page.getViewport({ scale: 2.0 });
                            canvas = document.createElement('canvas');
                            context = canvas.getContext('2d');
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;
                            if (!context)
                                throw new Error('Canvas context failed');
                            return [4 /*yield*/, page.render({ canvasContext: context, viewport: viewport }).promise];
                        case 3:
                            _a.sent();
                            base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
                            boldingMap = { lower: 'Bold ONLY proper nouns (minimal).', upper_medium: 'Bold key nouns and main verbs.', medium: 'Bold key entities, verbs, numbers.', medium_high: 'Bold most nouns, verbs, adjectives.', high: 'Bold almost every significant word.' };
                            boldingInstruction = (boldingMap[boldingLevel] || boldingMap.high) + ' CRITICAL: When bolding a word, always include its attached suffixes and prefixes inside the ** markers. Example: write **শাহ ফাহাদকে** not **শাহ ফাহাদ**কে, write **সৌদির** not **সৌদি**র. The suffix/prefix must be inside the closing **.';
                            structureInstruction = structureMode === 'original' ? '1. STRUCTURE: Transcribe verbatim. Fix punctuation/spacing only.' : '1. STRUCTURE: Create organized version with headers and bullets.';
                            prevText = (extractedPages[pageIndex - 1] ? extractedPages[pageIndex - 1].body : '') || '';
                            contextPrompt = prevText ? "PREVIOUS: \"...".concat(prevText.slice(-800), "\". Continue flow naturally.") : 'First page.';
                            var ocrEnhancement = OCR_PROMPT_LIBRARY[activeOcrPromptMode || 'default'] || '';
                            prompt_1 = ocrEnhancement + "You are a precise OCR engine. Your ONLY job is to read and transcribe the text EXACTLY as it appears in the image.\n\nCRITICAL RULES — follow without exception:\n1. TRANSCRIBE ONLY what is visually present in the image. Do NOT invent, paraphrase, complete, or assume any text.\n2. If a word is blurry or unclear, transcribe your best visual read — do NOT skip or replace it.\n3. Do NOT add commentary, explanations, or text that is not in the image.\n4. Preserve the original language exactly — do NOT translate.\n5. ".concat(structureInstruction, "\n6. BOLDING: ").concat(boldingInstruction, "\n7. After sentence-ending punctuation (. | \u0964), ensure exactly one space.\n8. Headers, footers, page numbers, watermarks: prefix with '^^ '.\n9. Math formulas: wrap in LaTeX $formula$. Tables: use Markdown.\n10. Context (do NOT copy this): ").concat(contextPrompt, "\n\nSTRICT MARKDOWN RULES — violations will break the reader:\n- ONLY allowed markdown: **bold**, # H1, ## H2, ### H3, - list, ^^ footer\n- NEVER output *** (triple asterisk) — use ** for bold only\n- NEVER output __ (double underscore) for bold\n- NEVER output a lone * on a word without a closing * on the same word\n- NEVER use ### for decorative separators — only use it if the text actually has a heading level 3\n- NEVER add extra # symbols beyond what the original text's visual hierarchy shows\n- If unsure whether something is a heading, treat it as a plain paragraph\n\nReturn ONLY this valid JSON — no other text:\n{\"header\": \"chapter or section title if visible, else empty\", \"pageNumber\": \"page number if visible, else empty\", \"body\": \"full transcribed text\"}");
                            result_2 = {};
                            geminiModel = 'gemini-2.5-flash-lite';
                            if (!currentModel.includes('gemini')) return [3 /*break*/, 6];
                            url = '/api/gemini/' + encodeURIComponent(geminiModel) + '/generateContent';
                            /* OCR via gemini-2.5-flash-lite: text prompt first, then image */
                            body = { contents: [{ parts: [{ text: prompt_1 + ' Return JSON only.' }, { inlineData: { mimeType: 'image/jpeg', data: base64Image } }], role: 'user' }], generationConfig: { responseMimeType: 'application/json', temperature: 0.1, maxOutputTokens: 8192 } };
                            return [4 /*yield*/, fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })];
                        case 4:
                            r = _a.sent();
                            if (!r.ok) {
                                return [2 /*return*/, r.text().then(function (errBody) { throw new Error("Gemini " + r.status + ": " + errBody); })];
                            }
                            return [4 /*yield*/, r.json()];
                        case 5:
                            d = _a.sent();
                            txt = ((d.candidates && d.candidates[0] && d.candidates[0].content && d.candidates[0].content.parts) ? d.candidates[0].content.parts.map(function (p) { return p.text || ''; }).join('') : '{}');
                            result_2 = safeExtractJSON(txt) || {};
                            return [3 /*break*/, 9];
                        case 6:
                            modelId = 'meta-llama/llama-4-scout-17b-16e-instruct';
                            key = MAVERICK_KEY, endpoint = 'https://api.groq.com/openai/v1/chat/completions';
                            return [4 /*yield*/, fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': "Bearer ".concat(key) }, body: JSON.stringify({ messages: [{ role: 'user', content: [{ type: 'text', text: prompt_1 + ' Output valid JSON.' }, { type: 'image_url', image_url: { url: "data:image/jpeg;base64,".concat(base64Image) } }] }], model: modelId, temperature: 0.1, max_completion_tokens: 4096 }) })];
                        case 7:
                            r = _a.sent();
                            if (!r.ok)
                                throw new Error("API ".concat(r.status));
                            return [4 /*yield*/, r.json()];
                        case 8:
                            d = _a.sent();
                            result_2 = safeExtractJSON(stripThink((d.choices && d.choices[0] && d.choices[0].message ? d.choices[0].message.content : '')) || '{}') || {};
                            _a.label = 9;
                        case 9:
                            if (!result_2 || !result_2.body)
                                throw new Error('Invalid JSON response');
                            cleanPN_1 = (result_2.pageNumber || '').replace(/(www\.|https?:\/\/)[^\s]+|[\w-]+\.(com|net|org|edu|gov|io)/gi, '').replace(/page\s+/i, '').trim();
                            cleanH_1 = (result_2.header || '').replace(/(www\.|https?:\/\/)[^\s]+|[\w-]+\.(com|net|org|edu|gov|io)/gi, '').trim();
                            if (result_2.body)
                                result_2.body = result_2.body.replace(/(\||\.)(?=[^\s\n"''])/g, '$1 ').replace(/  +/g, ' ');
                            /* ── Sanitize hallucinated markdown syntax ── */
                            if (result_2.body) result_2.body = sanitizeMarkdown(result_2.body);
                            setExtractedPages(function (p) {
                                var _a;
                                return (__assign(__assign({}, p), (_a = {}, _a[pageIndex] = { body: result_2.body || '', header: cleanH_1, pageNumber: cleanPN_1, model: currentModel }, _a)));
                            });
                            setScanningStatus(function (p) {
                                var _a;
                                return (__assign(__assign({}, p), (_a = {}, _a[pageIndex] = 'complete', _a)));
                            });
                            return [3 /*break*/, 13];
                        case 10:
                            e_4 = _a.sent();
                            console.error("Scan error page ".concat(pageIndex), e_4);
                            /* Client holds no Gemini keys (server proxy rotates them). Only rotate
                               client-side when keys actually exist, to avoid NaN/undefined crashes. */
                            if (!(GEMINI_KEYS.length > 0 && retryCount < GEMINI_KEYS.length)) return [3 /*break*/, 12];
                            onRotateKey();
                            apiKeyRef.current = GEMINI_KEYS[(GEMINI_KEYS.indexOf(apiKeyRef.current) + 1) % GEMINI_KEYS.length];
                            return [4 /*yield*/, scanPage(pageIndex, retryCount + 1, currentModel)];
                        case 11:
                            _a.sent();
                            return [2 /*return*/];
                        case 12:
                            if (!(activeScanningModel.includes('gemini') && !modelOverride && retryCount < 3)) return [3 /*break*/, 14];
                            idx = OCR_ROTATION.indexOf(currentModel);
                            if (!(idx !== -1)) return [3 /*break*/, 14];
                            return [4 /*yield*/, scanPage(pageIndex, retryCount + 1, OCR_ROTATION[(idx + 1) % OCR_ROTATION.length])];
                        case 13:
                            _a.sent();
                            return [2 /*return*/];
                        case 14:
                            setScanningStatus(function (p) {
                                var _a;
                                return (__assign(__assign({}, p), (_a = {}, _a[pageIndex] = 'error', _a)));
                            });
                            return [3 /*break*/, 15];
                        case 15: return [2 /*return*/];
                    }
                });
            });
        };
        for (var i = 0; i <= 2; i++) {
            var target = currentPage + i;
            if (target >= totalInRange)
                break;
            var status_2 = scanningStatus[target];
            if (status_2 === 'scanning') {
                if (i === 0)
                    return;
                continue;
            }
            if (status_2 === 'pending' || !status_2) {
                scanPage(target);
                if (i === 0)
                    return;
            }
        }
    }, [pdfDoc, currentPage, scanningStatus, pdfRange, activeScanningModel, activeOcrPromptMode, googleApiKey, boldingLevel, structureMode]);
    var getSelectionOffsets = function (container) {
        if (!container) return null;
        var sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed)
            return null;
        var range;
        try { range = sel.getRangeAt(0); } catch(e) { return null; }
        if (!range || !container.contains(range.commonAncestorContainer))
            return null;
        var getOffset = function (node, offset) {
            var el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
            if (!el)
                return null;
            var block = el.closest('[data-offset]');
            if (!block)
                return null;
            var blockStart = parseInt(block.dataset.offset || '0', 10);
            var r = document.createRange();
            r.selectNodeContents(block);
            r.setEnd(node, offset);
            return blockStart + r.toString().length;
        };
        var start = getOffset(range.startContainer, range.startOffset);
        var end = getOffset(range.endContainer, range.endOffset);
        if (start === null || end === null)
            return null;
        return { pageIndex: currentPage, id: "".concat(currentPage, "-").concat(start, "-").concat(end), start: start, end: end, text: range.toString() };
    };
    var analyzeText = function (selection_1, fullContext_1, selectedModel_1) {
        var args_1 = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args_1[_i - 3] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([selection_1, fullContext_1, selectedModel_1], args_1, true), void 0, function (selection, fullContext, selectedModel, retryCount) {
            var ctrl, cleanText, wc, isSentence, wordSys, sentSys, sys, userP, analysis, modelName, geminiM, r, modelId, key, endpoint, r, d, result, newHL_1, err_2;
            if (retryCount === void 0) { retryCount = 0; }
            setIsRegenerating(true);
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctrl = new AbortController();
                        abortControllersRef.current.set(selection.id, ctrl);
                        cleanText = selection.text.replace(/^(\*\*|__)|(\*\*|__)$/g, '').trim();
                        wc = cleanText.split(/\s+/).length;
                        isSentence = wc > 2;
                        wordSys = "You are an expert dictionary, entity-identification and image-search assistant with deep historical and cultural knowledge.\n\nThe user has selected a word or short phrase. Use ALL surrounding context to identify EXACTLY what/who this refers to.\n\nRULES:\n1. Determine if this is a PERSON name, PLACE name, or OTHER.\n2. 'meaning': Bengali meaning/synonyms, or if a name — 1-line Bengali description.\n3. 'explanation': EXACTLY 3 SHORT bullet points IN BENGALI.\n4. 'entityType': exactly one of 'person', 'place', or 'other'.\n5. PERSON: Identify the FULL real-world English name. 'searchQuery' MUST be in ENGLISH ONLY — never Bengali — specific enough to find THIS exact person on Google Images (e.g. 'Humayun Ahmed Bangladeshi author', 'Harry Truman US President 1945', 'Shah Jahan Mughal Emperor India'). 'wikiTitle': exact English Wikipedia article title.\n6. PLACE: 'searchQuery' MUST be in ENGLISH ONLY (e.g. 'Hiroshima Japan city', 'Dhaka Bangladesh capital'). 'wikiTitle': exact English Wikipedia article title.\n7. OTHER: 'searchQuery' = best English Google Image search query.\n8. 'smartQuery': natural curious reader question in Bengali or English.\nOutput ONLY valid JSON: {\"meaning\":\"...\",\"explanation\":\"...\",\"entityType\":\"person|place|other\",\"searchQuery\":\"...\",\"wikiTitle\":\"...\",\"smartQuery\":\"...\"}";
                        sentSys = "You are an expert explanatory and entity-identification assistant with deep historical and cultural knowledge.\n\nThe user has selected a phrase from a text. Use ALL surrounding context to understand EXACTLY what this refers to.\n\nRULES:\n1. Determine if the main subject is a PERSON, PLACE, or OTHER.\n2. 'meaning': clear simple Bengali explanation.\n3. 'explanation': EXACTLY 3 SHORT bullet points IN BENGALI.\n4. 'entityType': exactly one of 'person', 'place', or 'other'.\n5. PERSON: Identify the FULL real-world English name. 'searchQuery' MUST be in ENGLISH ONLY — never Bengali — specific enough to find THIS exact person on Google Images (e.g. 'Humayun Ahmed Bangladeshi author', 'Harry Truman US President 1945', 'Shah Jahan Mughal Emperor India'). 'wikiTitle': exact English Wikipedia article title.\n6. PLACE: 'searchQuery' MUST be in ENGLISH ONLY (e.g. 'Hiroshima Japan city', 'Dhaka Bangladesh capital'). 'wikiTitle': exact English Wikipedia article title.\n7. OTHER: 'searchQuery' = best English descriptive Google Image search query.\n8. 'smartQuery': natural curious reader question in Bengali or English.\nOutput ONLY valid JSON: {\"meaning\":\"...\",\"explanation\":\"...\",\"entityType\":\"person|place|other\",\"searchQuery\":\"...\",\"wikiTitle\":\"...\",\"smartQuery\":\"...\"}";
                        sys = isSentence ? sentSys : wordSys;
                        userP = "Context: \"".concat(fullContext, "\"\nAnalyze: \"").concat(cleanText, "\"");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, 8, 9]);
                        analysis = {};
                        modelName = MODEL_LABELS[selectedModel] || 'AI';
                        /* Try Llama Maverick first, fallback to Kimi K2 */
                        return [4 /*yield*/, (function() {
                            var tryFetch = function(apiKey, modelId) {
                                return fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey }, body: JSON.stringify({ messages: [{ role: 'system', content: sys + ' Return JSON.' }, { role: 'user', content: userP }], model: modelId, response_format: { type: 'json_object' } }), signal: ctrl.signal });
                            };
                            return tryFetch(MAVERICK_KEY, 'meta-llama/llama-4-scout-17b-16e-instruct');
                        })()];
                    case 2:
                        r = _a.sent();
                        if (ctrl.signal.aborted)
                            throw new Error('Aborted');
                        return [4 /*yield*/, r.json()];
                    case 3:
                        d = _a.sent();
                        analysis = safeExtractJSON(stripThink((d.choices && d.choices[0] && d.choices[0].message ? d.choices[0].message.content : '')) || '{}') || {};
                        return [3 /*break*/, 6];
                    case 4: return [3 /*break*/, 6];
                    case 5: return [3 /*break*/, 6];
                        _a.label = 6;
                    case 6:
                        if (ctrl.signal.aborted)
                            return [2 /*return*/];
                        result = { word: cleanText, meaning: String((analysis && analysis.meaning ? analysis.meaning : '') || 'নির্ধারিত নয়'), context: String((analysis && analysis.explanation ? analysis.explanation : '') || 'বিশ্লেষণ পাওয়া যায়নি।'), searchQuery: (analysis ? analysis.searchQuery : undefined), entityType: (analysis ? analysis.entityType : 'other') || 'other', wikiTitle: (analysis ? analysis.wikiTitle : undefined), smartQuery: (analysis ? analysis.smartQuery : undefined), modelName: modelName, modelId: selectedModel, rawSelection: selection };
                        newHL_1 = { pageIndex: selection.pageIndex, start: selection.start, end: selection.end, data: result, id: selection.id };
                        setHighlights(function (p) { return __spreadArray(__spreadArray([], p.filter(function (h) { return h.id !== selection.id; }), true), [newHL_1], false); });
                        setPendingHighlights(function (p) { return p.filter(function (ph) { return ph.id !== selection.id; }); });
                        try { var _vRaw = localStorage.getItem('maxofpdf_vocab'); var _vStore = _vRaw ? JSON.parse(_vRaw) : {}; var _vKey = cleanText.trim().toLowerCase(); _vStore[_vKey] = { word: result.word, meaning: result.meaning, m: result.meaning, entityType: result.entityType, ts: Date.now() }; localStorage.setItem('maxofpdf_vocab', JSON.stringify(_vStore)); window.dispatchEvent(new CustomEvent('maxofpdf_vocab_updated')); } catch(_e) {}
                        setModalData(result);
                        return [3 /*break*/, 9];
                    case 7:
                        err_2 = _a.sent();
                        if (err_2.name === 'AbortError' || err_2.message === 'Aborted')
                            return [2 /*return*/];
                        if (err_2.name === 'AbortError' || err_2.message === 'Aborted') return [2 /*return*/];
                        if (retryCount < 1) {
                            onRotateKey();
                            setTimeout(function () { return analyzeText(selection, fullContext, selectedModel, retryCount + 1); }, 800);
                        }
                        else {
                            setNotification({ message: 'API error — check your keys or try again.', type: 'error' });
                            setPendingHighlights(function (p) { return p.filter(function (ph) { return ph.id !== selection.id; }); });
                        }
                        return [3 /*break*/, 9];
                    case 8:
                        abortControllersRef.current.delete(selection.id);
                        setIsRegenerating(false);
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /* Capture selection immediately while in portion-select mode (before browser clears it) */
    useEffect(function () {
        if (!isSelectingPortion) { setCapturedPortion(null); capturedPortionRef.current = null; return; }
        var onSel = function () {
            var nativeSel = window.getSelection();
            var selText = nativeSel ? nativeSel.toString().trim() : '';
            if (!selText) return;
            var pageText = rewrittenPages[currentPage] || (pdfFile ? (extractedPages[currentPage] ? extractedPages[currentPage].body : '') : displayPages[currentPage]) || '';
            var lines = pageText.split('\n');
            /* Find startLine/endLine by locating selText in pageText by character position */
            var startLine = 0, endLine = lines.length - 1;
            /* Normalize: collapse whitespace for matching (renderer collapses whitespace too) */
            var normPage = pageText.replace(/\s+/g, ' ');
            var normSel = selText.replace(/\s+/g, ' ');
            var charIdx = normPage.indexOf(normSel);
            if (charIdx !== -1) {
                var selEndIdx = charIdx + normSel.length;
                /* Map char positions back to line indices in original (non-normalized) text */
                var cum = 0;
                startLine = 0; endLine = lines.length - 1;
                var foundStart = false, foundEnd = false;
                for (var li = 0; li < lines.length; li++) {
                    var lineEnd = cum + lines[li].length;
                    if (!foundStart && charIdx <= lineEnd) { startLine = li; foundStart = true; }
                    if (!foundEnd && selEndIdx <= lineEnd + 1) { endLine = li; foundEnd = true; break; }
                    cum += lines[li].length + 1;
                }
                if (!foundEnd) endLine = lines.length - 1;
            }
            var captured = { text: selText, startLine: startLine, endLine: endLine };
            setCapturedPortion(captured);
            capturedPortionRef.current = captured;
        };
        document.addEventListener('selectionchange', onSel);
        return function () { document.removeEventListener('selectionchange', onSel); };
    }, [isSelectingPortion, currentPage, rewrittenPages, extractedPages, pdfFile, displayPages]);

    var processSelection = function () {
        var container = containerRef.current;
        if (!container || isPointerDownRef.current)
            return;
        /* Don't analyze while in portion-select mode (use ref for sync check) */
        if (isSelectingPortionRef.current)
            return;
        var sel = getSelectionOffsets(container);
        if (sel && sel.text.trim().length > 0) {
            var already = highlights.some(function (h) { return h.pageIndex === currentPage && h.start === sel.start && h.end === sel.end; });
            var pending = pendingHighlights.some(function (p) { return p.id === sel.id; });
            if (!already && !pending) {
                setPendingHighlights(function (p) { return __spreadArray(__spreadArray([], p, true), [sel], false); });
                var curText = rewrittenPages[currentPage] || (pdfFile ? (extractedPages[currentPage] ? extractedPages[currentPage].body : undefined) : displayPages[currentPage]);
                setIsModalOpen(true); setIsAutoOpen(true); setIsRegenerating(true);
                analyzeText(sel, curText, activeModel);
                (window.getSelection() && window.getSelection().removeAllRanges());
            }
            /* Push looked-up text into persistent tracker for dotted underline rendering */
            var newLu = { id: 'lookup-' + Date.now(), pageNumber: currentPage, text: sel.text, timestamp: new Date().toISOString() };
            setLookedUpHighlights(function (prev) { return prev.concat(newLu); });
        }
    };
    useEffect(function () {
        var onSelChange = function () { if (selectionTimerRef.current)
            clearTimeout(selectionTimerRef.current); if (!isPointerDownRef.current)
            selectionTimerRef.current = setTimeout(processSelection, 50); };
        var onPtrDown = function (e) { if (e.target.closest('button'))
            return; isPointerDownRef.current = true; };
        var onPtrUp = function () { isPointerDownRef.current = false; processSelection(); };
        document.addEventListener('selectionchange', onSelChange);
        window.addEventListener('pointerup', onPtrUp);
        var c = containerRef.current;
        if (c)
            c.addEventListener('pointerdown', onPtrDown);
        return function () { document.removeEventListener('selectionchange', onSelChange); window.removeEventListener('pointerup', onPtrUp); if (c)
            c.removeEventListener('pointerdown', onPtrDown); };
    }, [currentPage, highlights, pendingHighlights, activeModel, rewrittenPages, extractedPages, pdfFile, displayPages]);
    var performRewrite = function (mode_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([mode_1], args_1, true), void 0, function (mode, customInstruction, targetPage, retryCount) {
            var origText, prevText, nextText, boldMap, boldI, promptI, prevBlock, nextBlock, fullP, newText_1, gemM, r, modelId, key, endpoint, r, d, e_5;
            if (customInstruction === void 0) { customInstruction = ''; }
            if (targetPage === void 0) { targetPage = currentPage; }
            if (retryCount === void 0) { retryCount = 0; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (rewritingStatus[targetPage])
                            return [2 /*return*/];
                        setRewritingStatus(function (p) {
                            var _a;
                            return (__assign(__assign({}, p), (_a = {}, _a[targetPage] = true, _a)));
                        });
                        setHighlights(function (p) { return p.filter(function (h) { return h.pageIndex !== targetPage; }); });
                        setPendingHighlights(function (p) { return p.filter(function (h) { return h.pageIndex !== targetPage; }); });
                        origText = pdfFile ? (extractedPages[targetPage] ? extractedPages[targetPage].body : undefined) : displayPages[targetPage];
                        if (!origText) {
                            setRewritingStatus(function (p) {
                                var _a;
                                return (__assign(__assign({}, p), (_a = {}, _a[targetPage] = false, _a)));
                            });
                            return [2 /*return*/];
                        }
                        prevText = targetPage > 0 ? (pdfFile ? ((extractedPages[targetPage - 1] ? extractedPages[targetPage - 1].body : '') || '') : (displayPages[targetPage - 1] || '')) : '';
                        nextText = targetPage < totalPages - 1 ? (pdfFile ? ((extractedPages[targetPage + 1] ? extractedPages[targetPage + 1].body : '') || '') : (displayPages[targetPage + 1] || '')) : '';
                        boldMap = { lower: 'MINIMAL BOLDING (5-10%).', lower_medium: 'LIGHT BOLDING (15-20%).', medium: 'MODERATE BOLDING (25-30%).', medium_high: 'HEAVY BOLDING (35-45%).', high: 'EXTREMELY HEAVY BOLDING (50%+).' };
                        boldI = boldMap[boldingLevel] || boldMap.high;
                        promptI = mode === 'simple' ? 'Rewrite simpler. Replace complex words.' : mode === 'intermediate' ? 'Rewrite intermediate level.' : mode === 'advanced' ? 'Rewrite advanced, literary vocabulary.' : ("Rewrite style: '".concat(customInstruction, "'."));
                        prevBlock = prevText ? '=== PREVIOUS ===\\n"' + prevText + '"\\n\\n' : '';
                        nextBlock = nextText ? '=== NEXT ===\\n"' + nextText + '"\\n\\n' : '';
                        fullP = "Task: ".concat(promptI, "\\nTarget Language: ").concat(customizerLanguage, "\\nFORMATTING: ").concat(boldI, "\\n\\n").concat(prevBlock, "=== CURRENT ===\\n\"").concat(origText, "\"\\n\\n").concat(nextBlock, "Output ONLY rewritten Current Page.");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, 8, 9]);
                        newText_1 = '';
                        if (!customizerModel.includes('gemini')) return [3 /*break*/, 3];
                        gemM = customizerModel === 'gemini-lite' ? 'gemini-3.1-flash-lite' : 'gemini-3.1-flash-lite';
                        return [4 /*yield*/, geminiGenerate(apiKeyRef.current, gemM, fullP)];
                    case 2:
                        r = _a.sent();
                        newText_1 = r.text || '';
                        return [3 /*break*/, 6];
                    case 3:
                        modelId = 'meta-llama/llama-4-scout-17b-16e-instruct';
                        key = MAVERICK_KEY;
                        endpoint = 'https://api.groq.com/openai/v1/chat/completions';
                        return [4 /*yield*/, fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': "Bearer ".concat(key) }, body: JSON.stringify({ messages: [{ role: 'system', content: 'Professional editor.' }, { role: 'user', content: fullP }], model: modelId }) })];
                    case 4:
                        r = _a.sent();
                        return [4 /*yield*/, r.json()];
                    case 5:
                        d = _a.sent();
                        newText_1 = stripThink((d.choices && d.choices[0] && d.choices[0].message ? d.choices[0].message.content : '')) || '';
                        _a.label = 6;
                    case 6:
                        if (newText_1)
                            setRewrittenPages(function (p) {
                                var _a;
                                return (__assign(__assign({}, p), (_a = {}, _a[targetPage] = sanitizeMarkdown(newText_1), _a)));
                            });
                        return [3 /*break*/, 9];
                    case 7:
                        e_5 = _a.sent();
                        if (((e_5.message && e_5.message.includes('429'))) && retryCount < 1) {
                            onRotateKey();
                            setTimeout(function () { setRewritingStatus(function (p) {
                                var _a;
                                return (__assign(__assign({}, p), (_a = {}, _a[targetPage] = false, _a)));
                            }); performRewrite(mode, customInstruction, targetPage, retryCount + 1); }, 500);
                            return [2 /*return*/];
                        }
                        setNotification({ message: "Customization failed: ".concat(e_5.message), type: 'error' });
                        return [3 /*break*/, 9];
                    case 8:
                        setRewritingStatus(function (p) {
                            var _a;
                            return (__assign(__assign({}, p), (_a = {}, _a[targetPage] = false, _a)));
                        });
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    var handleRewriteUI = function (mode, instruction) {
        if (instruction === void 0) { instruction = ''; }
        setLastRewriteConfig({ mode: mode, instruction: instruction || '', model: customizerModel, language: customizerLanguage });
        performRewrite(mode, instruction, currentPage);
        closeCustomizer();
    };
    var handleRestoreOriginal = function () { setRewrittenPages(function (p) { var n = __assign({}, p); delete n[currentPage]; return n; }); setHighlights(function (p) { return p.filter(function (h) { return h.pageIndex !== currentPage; }); }); closeCustomizer(); };
    /* ── Interlinear Translation ── */
    /* ── Interlinear Translation (indexed array approach) ── */
    var performInterlinearTranslation = function(pageIdx) {
        if (interlinearCache[pageIdx]) return;
        var pageText = rewrittenPages[pageIdx] || (pdfFile ? (extractedPages[pageIdx] ? extractedPages[pageIdx].body : '') : displayPages[pageIdx]) || '';
        if (!pageText.trim()) return;
        var allLines = pageText.split('\n');
        var nonEmptyLines = allLines.filter(function(l) { return l.trim().length > 3; });
        if (nonEmptyLines.length === 0) return;
        setInterlinearLoading(true);
        if (interlinearAbortRef.current) try { interlinearAbortRef.current.abort(); } catch(_e) {}
        interlinearAbortRef.current = new AbortController();
        var isBangla = /[\u0980-\u09FF]/.test(nonEmptyLines[0] || '');
        var sysMsg = isBangla
            ? 'You are a Bengali language expert and educator specializing in Bengali literature. Given an array of Bengali text lines (which may contain markdown like **bold**, ## headings, - bullets), return a JSON array of the same length. For each line:\n- If it is a heading or short label (starts with #): return a slightly expanded Bengali version that clarifies what the section is about\n- If it is a bullet or list item: return a clear, enriched Bengali explanation with concrete detail\n- If it is a paragraph: return a simple, easy-to-understand Bengali explanation (সহজবোধ্য বাংলা অর্থ) that captures the core meaning in plain, modern Bengali — NOT a shortened version, but a rephrasing that makes the meaning crystal clear to a general reader\n- Preserve markdown formatting in your output: use **bold** for key terms, keep structure\n- Write naturally flowing Bengali, not robotic or dictionary-like\nRespond with ONLY a raw JSON array: ["enriched line 1","enriched line 2",...]. No explanation, no markdown fences.'
            : 'You are an expert Bengali translator and educator. Given an array of text lines (may contain markdown like **bold**, ## headings, - bullets), return a JSON array of the same length where each element is a rich, detailed Bengali translation of the corresponding input line.\n- Preserve markdown formatting: use **bold** for key terms, keep heading levels, keep bullet structure\n- For technical or complex lines, add brief clarifying context in Bengali\n- Write naturally flowing Bengali, not robotic\nRespond with ONLY a raw JSON array: ["translation 1","translation 2",...]. No explanation, no markdown fences.';
        var userMsg = JSON.stringify(nonEmptyLines);
        geminiGenerate(apiKeyRef.current, 'gemini-3.1-flash-lite', userMsg, {
            systemInstruction: sysMsg,
            temperature: 0.2,
            maxOutputTokens: 4096
        }).then(function(r) {
            var raw = r.text || '';
            /* Strip markdown fences */
            var clean = raw.replace(/```json\n?|```/g, '').trim();
            /* Try parse as array */
            var parsed = null;
            try { parsed = JSON.parse(clean); } catch(_e) {
                /* Try extracting array */
                var ai = clean.indexOf('['), ei = clean.lastIndexOf(']');
                if (ai !== -1 && ei !== -1) try { parsed = JSON.parse(clean.substring(ai, ei+1)); } catch(_e2) {}
            }
            if (Array.isArray(parsed)) {
                /* Build map: original line trim -> translation */
                var lineMap = {};
                nonEmptyLines.forEach(function(l, i) {
                    if (parsed[i]) lineMap[l.trim()] = parsed[i];
                });
                setInterlinearCache(function(p) { var n = Object.assign({}, p); n[pageIdx] = lineMap; return n; });
            }
        }).catch(function(e) {
            if (e && e.name !== 'AbortError') console.error('Interlinear error:', e);
        }).finally(function() {
            setInterlinearLoading(false);
        });
    };
    /* Toggle interlinear mode */
    var toggleInterlinear = function() {
        var next = !interlinearMode;
        setInterlinearMode(next);
        if (next && !interlinearCache[currentPage]) {
            performInterlinearTranslation(currentPage);
        }
    };
    useEffect(function() {
        if (interlinearMode && !interlinearCache[currentPage] && !interlinearLoading) {
            performInterlinearTranslation(currentPage);
        }
    }, [currentPage, interlinearMode]);

    /* ── Entity Highlight (independent from X-Ray) ── */
    var _es0 = useState(false), entityScanLoading = _es0[0], setEntityScanLoading = _es0[1];
    var _es1 = useState({}), entityCache = _es1[0], setEntityCache = _es1[1];
    var entityAbortRef = useRef(null);
    var performEntityScan = function(pageIdx) {
        if (entityCache[pageIdx]) return;
        var pageText = rewrittenPages[pageIdx] || (pdfFile ? (extractedPages[pageIdx] ? extractedPages[pageIdx].body : '') : displayPages[pageIdx]) || '';
        if (!pageText.trim()) return;
        setEntityScanLoading(true);
        if (entityAbortRef.current) try { entityAbortRef.current.abort(); } catch(_e) {}
        entityAbortRef.current = new AbortController();
        var sysMsg = 'You are an elite named entity recognition engine specialized in Bengali and English text. Your job is to extract EVERY single named entity — missing even one important name is a failure.\n\nGiven a page of text (Bengali, English, or mixed), you MUST:\n1. Extract ALL people (historical figures, politicians, authors, scientists, religious leaders, military commanders, rulers, etc.)\n2. Extract ALL places (cities, countries, regions, rivers, mountains, buildings, battlefields, etc.)\n3. Extract ALL organizations (governments, armies, parties, institutions, companies, etc.)\n4. Extract ALL important concepts, events, treaties, laws, doctrines\n5. Extract ALL technical/scientific terms\n\nCRITICAL RULES:\n- NEVER skip a person\'s name, even if mentioned only once\n- For Bengali text: detect names written in Bengali script (e.g. হিরোশিমা, হ্যারি ট্রুম্যান, মুজিবুর রহমান, হুমায়ূন আহমেদ)\n- "name" field MUST be the EXACT substring as it appears in the text — copy character-for-character, do NOT correct spelling, do NOT translate, do NOT paraphrase\n- For each entity provide:\n  * "name": EXACT string as it appears in the input text (copy verbatim)\n  * "type": one of person|place|org|concept|term\n  * "description": 1 concise sentence in BENGALI explaining who/what this is\n- Extract up to 40 entities — PRIORITIZE people and places\n- Return ONLY a raw JSON array, NO markdown, NO code fences, NO explanation\n\nExample: if text says "হুমায়ন আহমেদ" then name must be "হুমায়ন আহমেদ" exactly as written.';
        geminiGenerate(apiKeyRef.current, 'gemini-3.1-flash-lite', 'Text:\n' + pageText.slice(0, 5000), {
            systemInstruction: sysMsg,
            temperature: 0.1,
            maxOutputTokens: 3000
        }).then(function(r) {
            var raw = r.text || '';
            console.log('[LENS] raw response:', raw.slice(0, 300));
            var clean = raw.replace(/```json\n?|```/g, '').trim();
            var parsed = null;
            /* 1) Try clean parse first */
            try { parsed = JSON.parse(clean); } catch(_e) {}
            /* 2) Try extracting array slice */
            if (!Array.isArray(parsed)) {
                var ai = clean.indexOf('[');
                var ei = clean.lastIndexOf(']');
                if (ai !== -1 && ei !== -1 && ei > ai) {
                    try { parsed = JSON.parse(clean.substring(ai, ei + 1)); } catch(_e2) {}
                }
            }
            /* 3) Response was truncated — extract every complete {...} object individually */
            if (!Array.isArray(parsed)) {
                var ai = clean.indexOf('[');
                var start = ai !== -1 ? ai : 0;
                var recovered = [];
                var depth = 0, objStart = -1;
                for (var ci = start; ci < clean.length; ci++) {
                    if (clean[ci] === '{') { if (depth === 0) objStart = ci; depth++; }
                    else if (clean[ci] === '}') {
                        depth--;
                        if (depth === 0 && objStart !== -1) {
                            try {
                                var obj = JSON.parse(clean.substring(objStart, ci + 1));
                                if (obj && obj.name && obj.type) recovered.push(obj);
                            } catch(_e3) {}
                            objStart = -1;
                        }
                    }
                }
                if (recovered.length > 0) { parsed = recovered; console.log('[LENS] recovered', recovered.length, 'entities from truncated JSON'); }
                else { console.log('[LENS] parse failed: could not recover any entities'); }
            }
            console.log('[LENS] parsed entities:', parsed);
            if (Array.isArray(parsed) && parsed.length > 0) {
                setEntityCache(function(p) { var n = Object.assign({}, p); n[pageIdx] = parsed; return n; });
            }
        }).catch(function(e) {
            if (e && e.name !== 'AbortError') console.error('[LENS] entity scan error:', e);
        }).finally(function() {
            setEntityScanLoading(false);
        });
    };
    var toggleEntityHighlight = function() {
        var next = !entityHighlightMode;
        setEntityHighlightMode(next);
        if (next && !entityCache[currentPage]) {
            performEntityScan(currentPage);
        }
    };
    useEffect(function() {
        if (entityHighlightMode && !entityCache[currentPage] && !entityScanLoading) {
            performEntityScan(currentPage);
        }
    }, [currentPage, entityHighlightMode]);
    /* ── Partial (selection-based) rewrite ── */
    var performPartialRewrite = function (mode, instruction) { return __awaiter(_this, void 0, void 0, function () {
        var sel, pageText, lines, startLine, endLine, originalText, blockIndices, boldMap, boldI, promptI, sysMsgContent, userMsgContent, newChunk, gemM, r, modelId, key, endpoint, rr, d, e_sel;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sel = selectionRewrite;
                    if (!sel) return [2 /*return*/];
                    pageText = rewrittenPages[currentPage] || (pdfFile ? (extractedPages[currentPage] ? extractedPages[currentPage].body : '') : displayPages[currentPage]) || '';
                    lines = pageText.split('\n');
                    startLine = sel.startLine;
                    endLine = sel.endLine;
                    /* Use the exact captured selection text as the source of truth */
                    originalText = sel.text;
                    /* Find exact char offset of selected text in page text */
                    var selCharStart = pageText.indexOf(originalText);
                    if (selCharStart === -1) {
                        /* Try normalized match */
                        var normPage2 = pageText.replace(/\s+/g, ' ');
                        var normSel2 = originalText.replace(/\s+/g, ' ');
                        selCharStart = normPage2.indexOf(normSel2);
                    }
                    var selCharEnd = selCharStart !== -1 ? selCharStart + originalText.length : -1;
                    /* Set inline skeleton range */
                    if (selCharStart !== -1) {
                        setPartialRewritePending({ start: selCharStart, end: selCharEnd });
                    }
                    setSelectionRewrite(null);
                    closeCustomizer();
                    boldMap = { lower: 'MINIMAL BOLDING (5-10%).', lower_medium: 'LIGHT BOLDING (15-20%).', medium: 'MODERATE BOLDING (25-30%).', medium_high: 'HEAVY BOLDING (35-45%).', high: 'EXTREMELY HEAVY BOLDING (50%+).' };
                    boldI = boldMap[boldingLevel] || boldMap.medium;
                    promptI = mode === 'simple' ? 'Rewrite simpler with easier words.' : mode === 'intermediate' ? 'Rewrite with balanced natural flow.' : mode === 'advanced' ? 'Rewrite with sophisticated literary vocabulary.' : ("Rewrite with this style: '" + instruction + "'.");
                    /* Very strict system prompt that prevents any extra output */
                    sysMsgContent = 'You are a precise text editor. You will be given a text excerpt delimited by <TEXT> tags. Your job: ' + promptI + ' Target language: ' + customizerLanguage + '. ' + boldI + ' CRITICAL RULES: (1) Output ONLY the rewritten version of the text inside <TEXT> tags. (2) Do NOT include any explanation, preamble, commentary, or text outside the excerpt. (3) Do NOT rewrite anything that was not inside the <TEXT> tags. (4) Preserve the original structure and line count as much as possible.';
                    userMsgContent = '<TEXT>\n' + originalText + '\n</TEXT>';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 9]);
                    newChunk = '';
                    if (!customizerModel.includes('gemini')) return [3 /*break*/, 3];
                    gemM = customizerModel === 'gemini-lite' ? 'gemini-3.1-flash-lite' : 'gemini-3.1-flash-lite';
                    return [4 /*yield*/, geminiGenerate(apiKeyRef.current, gemM, userMsgContent, { systemInstruction: sysMsgContent })];
                case 2:
                    r = _a.sent();
                    newChunk = (r && r.text) ? r.text : '';
                    return [3 /*break*/, 6];
                case 3:
                    modelId = 'meta-llama/llama-4-scout-17b-16e-instruct'; key = MAVERICK_KEY; endpoint = 'https://api.groq.com/openai/v1/chat/completions';
                    return [4 /*yield*/, fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key }, body: JSON.stringify({ messages: [{ role: 'system', content: sysMsgContent }, { role: 'user', content: userMsgContent }], model: modelId }) })];
                case 4:
                    rr = _a.sent();
                    return [4 /*yield*/, rr.json()];
                case 5:
                    d = _a.sent();
                    newChunk = stripThink((d.choices && d.choices[0] && d.choices[0].message ? d.choices[0].message.content : '')) || '';
                    _a.label = 6;
                case 6:
                    if (newChunk) {
                        /* Strip any accidental <TEXT> tags the model might echo back */
                        var cleaned = newChunk.trim().replace(/^<TEXT>\n?/i, '').replace(/\n?<\/TEXT>$/i, '').trim();
                        /* Replace only the exact original text in the page — string replacement,
                           not line-index splice, so scope is strictly bounded */
                        var newPageText = pageText.replace(originalText, cleaned);
                        /* Fallback to line-splice if exact string not found (e.g. whitespace diff) */
                        if (newPageText === pageText) {
                            var newLines = lines.slice();
                            var chunkLines = cleaned.split('\n');
                            newLines.splice.apply(newLines, [startLine, endLine - startLine + 1].concat(chunkLines));
                            newPageText = newLines.join('\n');
                        }
                        setRewrittenPages(function (p) { var _a = {}; _a[currentPage] = sanitizeMarkdown(newPageText); return __assign(__assign({}, p), _a); });
                        /* Find char offset of the rewritten chunk in the new page text for highlight */
                        var cleanedForHL = cleaned;
                        var hlStart = newPageText.indexOf(cleanedForHL);
                        if (hlStart !== -1) {
                            setRewrittenRange({ start: hlStart, end: hlStart + cleanedForHL.length });
                        }
                    }
                    return [3 /*break*/, 9];
                case 7:
                    e_sel = _a.sent();
                    setNotification({ message: 'Partial rewrite failed: ' + e_sel.message, type: 'error' });
                    return [3 /*break*/, 9];
                case 8:
                    setPartialRewritePending(null);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    /* ── X-Ray: scan current page for key entities ── */
    var performXRay = function () { return __awaiter(_this, void 0, void 0, function () {
        var pageText, cached, sysPrompt, userMsg, xrayModelId, xrayKey, xrayEndpoint, r, d, rawText, clean, parsed, entities, xErr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pageText = rewrittenPages[currentPage] || (pdfFile ? (extractedPages[currentPage] ? extractedPages[currentPage].body : '') : displayPages[currentPage]) || '';
                    if (!pageText.trim()) return [2 /*return*/];
                    cached = xrayCache[currentPage];
                    if (cached) { setIsXRayOpen(true); return [2 /*return*/]; }
                    setIsXRayOpen(true);
                    setIsXRayLoading(true);
                    if (xrayAbortRef.current) { try { xrayAbortRef.current.abort(); } catch(e2) {} }
                    xrayAbortRef.current = new AbortController();
                    sysPrompt = 'You are a Kindle X-Ray engine. Given a page of text, extract the key entities (characters, places, organizations, concepts, technical terms, acronyms) that appear on this page. For each entity, provide a brief, helpful reminder of who/what they are — as if helping a reader who might have forgotten them from earlier in the book. Return ONLY a valid JSON object with this structure: {"entities":[{"name":"...","type":"person|place|org|concept|term|other","description":"1-2 sentence reminder"},...]}. Extract 5-12 entities max. Be concise. No markdown, no preamble, just the JSON object.';
                    userMsg = 'Page text:\n\n' + pageText.slice(0, 3000);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    xrayModelId = 'meta-llama/llama-4-scout-17b-16e-instruct';
                    xrayKey = MAVERICK_KEY;
                    xrayEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
                    return [4 /*yield*/, fetch(xrayEndpoint, { method: 'POST', signal: xrayAbortRef.current.signal, headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + xrayKey }, body: JSON.stringify({ messages: [{ role: 'system', content: sysPrompt }, { role: 'user', content: userMsg }], model: xrayModelId, max_tokens: 1500, response_format: { type: 'json_object' } }) })];
                case 2:
                    r = _a.sent();
                    return [4 /*yield*/, r.json()];
                case 3:
                    d = _a.sent();
                    rawText = stripThink((d.choices && d.choices[0] && d.choices[0].message ? d.choices[0].message.content : '')) || '{}';
                    clean = rawText.replace(/```json\n?|```/g, '').trim();
                    try { parsed = JSON.parse(clean); } catch(e3) { parsed = {}; }
                    entities = Array.isArray(parsed.entities) ? parsed.entities : [];
                    setXrayCache(function(prev) { var n = Object.assign({}, prev); n[currentPage] = entities; return n; });
                    return [3 /*break*/, 6];
                case 4:
                    xErr = _a.sent();
                    if (xErr.name !== 'AbortError') { setNotification({ message: 'X-Ray failed: ' + xErr.message, type: 'error' }); setIsXRayOpen(false); }
                    return [3 /*break*/, 6];
                case 5:
                    setIsXRayLoading(false);
                    xrayAbortRef.current = null;
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var getThemeTextClass = function () { switch (readerTheme) {
        case 'light': return 'text-slate-800';
        case 'sepia': return 'text-[#422006]';
        case 'midnight': return 'text-slate-300';
        case 'forest': return 'text-emerald-100/80';
        default: return 'text-[#a1a1aa]';
    } };
    var headerBgClass = function () { switch (readerTheme) {
        case 'light': return 'bg-white border-slate-200 text-slate-900';
        case 'sepia': return 'bg-[#f4ecd8] border-amber-900/10 text-slate-900';
        case 'midnight': return 'bg-[#020617] border-blue-500/10 text-white';
        case 'forest': return 'bg-[#052e16] border-emerald-500/10 text-emerald-100';
        default: return 'bg-[#0c0c0c] border-white/5 text-slate-300';
    } };
    var getPageHeader = function () { if (pdfFile && (extractedPages[currentPage] ? extractedPages[currentPage].header : undefined))
        return extractedPages[currentPage].header; return "Folio ".concat((pdfRange ? pdfRange.start : 1) + currentPage); };
    var handleModelChange = function (newModel) {
        onModelChange(newModel);
        if (modalData) {
            setIsRegenerating(true);
            var sel_1 = modalData.rawSelection;
            setHighlights(function (p) { return p.filter(function (h) { return h.id !== sel_1.id; }); });
            setPendingHighlights(function (p) { return __spreadArray(__spreadArray([], p, true), [sel_1], false); });
            var curText = rewrittenPages[currentPage] || (pdfFile ? (extractedPages[currentPage] ? extractedPages[currentPage].body : undefined) : displayPages[currentPage]);
            analyzeText(sel_1, curText, newModel);
        }
    };
    var cumulativeText = useMemo(function () {
        var combined = '';
        for (var i = 0; i <= currentPage; i++) {
            combined += '--- Folio ' + (i + 1) + ' ---\n' + (pdfFile ? ((extractedPages[i] ? extractedPages[i].body : '[Scanning...]')) : (displayPages[i] || '')) + '\n\n';
        }
        return combined;
    }, [currentPage, extractedPages, displayPages, pdfFile]);
    var currentPageText = useMemo(function () { return pdfFile ? (extractedPages[currentPage] ? extractedPages[currentPage].body : '') || '' : displayPages[currentPage] || ''; }, [currentPage, extractedPages, displayPages, pdfFile]);
    // Render content
    var renderContent = function () {
        if (rewritingStatus[currentPage])
            return (React.createElement("div", { className: "flex flex-col items-center justify-center pt-16 space-y-4" },
                React.createElement("div", { className: "w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" }),
                React.createElement("p", { className: "text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em] animate-pulse" }, "Rewriting...")));
        var isViewOrig = !rewrittenPages[currentPage] || isComparing;
        var pageText = isViewOrig ? null : rewrittenPages[currentPage];
        if (!pageText) {
            if (pdfFile) {
                var ext = extractedPages[currentPage];
                if (scanningStatus[currentPage] === 'error')
                    return React.createElement("div", { className: "flex flex-col items-center justify-center pt-24 space-y-4" },
                        React.createElement("p", { className: "text-lg font-bold text-rose-200" }, "Scan Failed"),
                        React.createElement("button", { onClick: function () { return setScanningStatus(function (p) {
                                var _a;
                                return (__assign(__assign({}, p), (_a = {}, _a[currentPage] = 'pending', _a)));
                            }); }, className: "mt-4 px-8 py-2 rounded-full bg-white/5 text-xs font-bold uppercase" }, "Retry"));
                if (!ext) {
                    var pageLabel = ((pdfRange ? pdfRange.start : 1) || 1) + currentPage;
                    var modelLabel = activeScanningModel === 'gemini-lite' ? 'Gemini 3.1 Flash-Lite' : 'Llama 4 Maverick';
                    var keyNum = GEMINI_KEYS.indexOf(apiKeyRef.current) + 1 || 1;
                    return (React.createElement("div", { className: "flex flex-col items-center justify-center pt-16 space-y-6" },
                        React.createElement("div", { className: "ocr-upload" },
                            React.createElement("div", { className: "ocr-up-head" },
                                React.createElement("div", { className: "ocr-icon" }, "\u22A1"),
                                React.createElement("div", null,
                                    React.createElement("div", { className: "ocr-sk ocr-sk-title" }),
                                    React.createElement("div", { className: "ocr-sk ocr-sk-sub" })),
                                React.createElement("div", { className: "ocr-pill" }, "Scanning")),
                            React.createElement("div", { className: "ocr-up-mid" },
                                React.createElement("div", { className: "ocr-sk ocr-sk-wide" }),
                                React.createElement("div", { className: "ocr-sk ocr-sk-wide" }),
                                React.createElement("div", { className: "ocr-sk ocr-sk-short" })),
                            React.createElement("div", { className: "ocr-up-bar" },
                                React.createElement("span", { className: "bar" }),
                                React.createElement("span", { className: "shine" })),
                            React.createElement("div", { className: "ocr-footer" },
                                React.createElement("span", { className: "ocr-footer-page" },
                                    "Folio ",
                                    pageLabel),
                                React.createElement("span", { className: "ocr-footer-model" },
                                    modelLabel,
                                    " · K",
                                    keyNum)))));
                }
                pageText = ext.body;
            }
            else {
                pageText = displayPages[currentPage];
            }
        }
        if (!pageText)
            return null;
        var lines = pageText.split('\n');
        var blocks = [];
        var tableRows = [];
        var isTableLine = function (l) { return l.trim().startsWith('|') && l.trim().endsWith('|'); };
        var offset = 0;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.trim().startsWith('^^^FIGURE') && line.trim().endsWith('^^^')) {
                if (tableRows.length > 0) {
                    blocks.push({ type: 'table', content: tableRows, offset: offset });
                    offset += tableRows.join('\n').length + 1;
                    tableRows = [];
                }
                blocks.push({ type: 'figure', content: line, lineIndex: i, offset: offset });
                offset += line.length + 1;
                continue;
            }
            if (isTableLine(line)) {
                tableRows.push(line);
                continue;
            }
            if (tableRows.length > 0) {
                var tc = tableRows.join('\n');
                blocks.push({ type: 'table', content: tableRows, offset: offset });
                offset += tc.length + 1;
                tableRows = [];
            }
            if (line.trim() !== '') {
                blocks.push({ type: 'text', content: line, lineIndex: i, offset: offset });
            }
            offset += line.length + 1;
        }
        if (tableRows.length > 0) {
            var tc = tableRows.join('\n');
            blocks.push({ type: 'table', content: tableRows, offset: offset });
            offset += tc.length + 1;
        }
        /* ── Page-level entity hit counter: max 2 highlights per entity per page ── */
        var entityHitCount = {};
        return blocks.map(function (block, bi) {
            if (block.type === 'text')
                return renderTextLine(block.content, block.lineIndex, block.offset, pageText, isViewOrig, entityHitCount);
            if (block.type === 'table')
                return renderTable(block.content, bi, block.offset);
            if (block.type === 'figure')
                return renderFigure(block.content, block.lineIndex, block.offset);
            return null;
        });
    };
    var renderFigure = function (line, lineIdx, lineStart) {
        try {
            var jc = line.trim().substring(9, line.trim().length - 3);
            var figData = JSON.parse(jc);
            return (React.createElement("div", { key: "fig-".concat(lineIdx), className: "my-8 relative min-h-[200px] w-full border-2 border-dashed border-slate-600 rounded-xl bg-slate-900/30 overflow-hidden", "data-offset": lineStart },
                Array.isArray(figData) && figData.map(function (item, idx) { return (React.createElement("div", { key: idx, className: "absolute transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-indigo-300 bg-black/60 px-2 py-1 rounded backdrop-blur-sm cursor-pointer hover:bg-indigo-600 hover:text-white border border-white/10 transition-colors", style: { left: "".concat(item.x, "%"), top: "".concat(item.y, "%") }, onClick: function (e) { e.stopPropagation(); var fs = { pageIndex: currentPage, id: "fig-".concat(lineIdx, "-").concat(idx), start: lineStart, end: lineStart + item.text.length, text: item.text }; analyzeText(fs, line, activeModel); } }, item.text)); }),
                React.createElement("div", { className: "absolute bottom-2 right-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold opacity-50 pointer-events-none" }, "Diagram")));
        }
        catch (_e) {
            return null;
        }
    };
    var renderTable = function (rows, idx, offset) {
        var parsed = rows.map(function (r) { return r.trim().replace(/^\||\\|$/g, '').split('|').map(function (c) { return c.trim(); }); });
        var headerRow = parsed[0];
        var sepIdx = parsed.findIndex(function (r) { return r.every(function (c) { return /^[-\s:]+$/.test(c); }); });
        var hasHeader = sepIdx === 1;
        var bodyRows = hasHeader ? parsed.slice(2) : parsed;
        var renderCell = function (ct) {
            var ps = ct.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
            return ps.map(function (p, i) {
                if (p.startsWith('$') && katex) {
                    try {
                        var isBlk = p.startsWith('$$');
                        var html = katex.renderToString(isBlk ? p.slice(2, -2) : p.slice(1, -1), { displayMode: isBlk, throwOnError: false });
                        return React.createElement("span", { key: i, dangerouslySetInnerHTML: { __html: html } });
                    }
                    catch (_e) {
                        return p;
                    }
                }
                return p;
            });
        };
        return (React.createElement("div", { key: "tbl-".concat(idx), className: "my-6 w-full table-scroll-container overflow-x-auto rounded-xl border border-white/10 bg-white/5 pb-2", "data-offset": offset },
            React.createElement("table", { className: "w-full text-left border-collapse", style: { minWidth: 'max-content' } },
                hasHeader && React.createElement("thead", null,
                    React.createElement("tr", { className: "border-b border-white/10 ".concat(readerTheme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-white/10 text-slate-200') }, headerRow.map(function (c, i) { return React.createElement("th", { key: i, className: "p-3 text-xs font-bold border-r border-white/5 last:border-0" }, renderCell(c)); }))),
                React.createElement("tbody", null, bodyRows.map(function (row, ri) { return React.createElement("tr", { key: ri, className: "border-b border-white/5 last:border-0 ".concat(readerTheme === 'light' ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-white/5 text-slate-400') }, row.map(function (c, ci) { return React.createElement("td", { key: ci, className: "p-3 text-xs border-r border-white/5 last:border-0 font-serif" }, renderCell(c)); })); })))));
    };
    var renderTextLine = function (line, lineIdx, lineStart, textContent, isViewOrig, entityHitCount) {
        var type = 'p', markerLength = 0;
        var cl = line.trim();
        if (cl.startsWith('# ')) {
            type = 'h1';
            markerLength = 2;
        }
        else if (cl.startsWith('## ')) {
            type = 'h2';
            markerLength = 3;
        }
        else if (cl.startsWith('### ')) {
            type = 'h3';
            markerLength = 4;
        }
        else if (cl.startsWith('#### ')) {
            type = 'h4';
            markerLength = 5;
        }
        else if (cl.match(/^[-*]\s/)) {
            type = 'li';
            markerLength = 2;
        }
        else if (cl.startsWith('^^')) {
            type = 'ref';
            markerLength = cl.startsWith('^^ ') ? 3 : 2;
        }
        var ranges = [];
        if (markerLength > 0)
            ranges.push({ start: line.indexOf(cl[0]), end: line.indexOf(cl[0]) + markerLength, type: 'marker' });
        var boldRx = /\*\*(.*?)\*\*/g;
        var match;
        while ((match = boldRx.exec(line)) !== null)
            ranges.push({ start: match.index, end: match.index + match[0].length, type: 'bold' });
        if (katex) {
            var mathRx = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
            while ((match = mathRx.exec(line)) !== null)
                ranges.push({ start: match.index, end: match.index + match[0].length, type: 'math' });
        }
        var lineEnd = lineStart + line.length;
        var pageHL = __spreadArray(__spreadArray([], highlights.filter(function (h) { return h.pageIndex === currentPage && h.start < lineEnd && h.end > lineStart; }).map(function (h) { return (__assign(__assign({}, h), { isPending: false })); }), true), pendingHighlights.filter(function (ph) { return ph.pageIndex === currentPage && ph.start < lineEnd && ph.end > lineStart; }).map(function (ph) { return (__assign(__assign({}, ph), { isPending: true })); }), true);
        pageHL.forEach(function (h) { return ranges.push({ start: Math.max(0, h.start - lineStart), end: Math.min(line.length, h.end - lineStart), type: h.isPending ? 'pending-highlight' : 'highlight', data: h }); });
        /* Inline looked-up word highlight markers */
        lookedUpHighlights.filter(function (lu) { return lu.pageNumber === currentPage && lu.text && lu.text.length > 1; }).forEach(function (lu) {
            var idx = line.indexOf(lu.text);
            if (idx !== -1)
                ranges.push({ start: idx, end: idx + lu.text.length, type: 'looked-up' });
        });
        /* Inline partial-rewrite skeleton */
        if (partialRewritePending && partialRewritePending.start < lineEnd && partialRewritePending.end > lineStart) {
            ranges.push({ start: Math.max(0, partialRewritePending.start - lineStart), end: Math.min(line.length, partialRewritePending.end - lineStart), type: 'partial-skeleton' });
        }
        /* Inline rewritten highlight */
        if (rewrittenRange && rewrittenRange.start < lineEnd && rewrittenRange.end > lineStart) {
            ranges.push({ start: Math.max(0, rewrittenRange.start - lineStart), end: Math.min(line.length, rewrittenRange.end - lineStart), type: 'rewritten-glow' });
        }
        var pts = new Set([0, line.length]);
        ranges.forEach(function (r) { pts.add(r.start); pts.add(r.end); if (r.type === 'bold') {
            pts.add(r.start + 2);
            pts.add(r.end - 2);
        } });
        var sorted = Array.from(pts).sort(function (a, b) { return a - b; });
        var nodes = [];
        var _loop_1 = function (i) {
            var p1 = sorted[i], p2 = sorted[i + 1];
            var seg = line.substring(p1, p2);
            if (!seg)
                return "continue";
            var mathR = ranges.find(function (r) { return r.type === 'math' && r.start <= p1 && r.end >= p2; });
            if (mathR && katex) {
                var isBlk = seg.startsWith('$$');
                var raw = isBlk ? seg.slice(2, -2) : seg.slice(1, -1);
                try {
                    var html = katex.renderToString(raw, { displayMode: isBlk, throwOnError: false });
                    nodes.push(React.createElement("span", { key: "m".concat(p1), dangerouslySetInnerHTML: { __html: html }, className: "mx-1" }));
                }
                catch (_e) {
                    nodes.push(seg);
                }
                return "continue";
            }
            var boldR = ranges.find(function (r) { return r.type === 'bold' && r.start <= p1 && r.end >= p2; });
            var markerR = ranges.find(function (r) { return r.type === 'marker' && r.start <= p1 && r.end >= p2; });
            var hlR = ranges.find(function (r) { return (r.type === 'highlight' || r.type === 'pending-highlight') && r.start <= p1 && r.end >= p2; });
            var isBoldMk = false;
            if (boldR) {
                if (p1 === boldR.start && p2 === boldR.start + 2)
                    isBoldMk = true;
                if (p1 === boldR.end - 2 && p2 === boldR.end)
                    isBoldMk = true;
            }
            var content = seg;
            if (isBoldMk || markerR)
                content = React.createElement("span", { className: "md-marker" }, seg);
            else if (boldR) {
                var ac = readerTheme === 'dark' || readerTheme === 'midnight' ? '#ffffff' : '#000000';
                content = React.createElement("span", { className: "md-bold-text", style: { color: ac, opacity: boldness } }, content);
            }
            if (hlR) {
                var h_1 = hlR.data;
                var hid = h_1.id || "".concat(h_1.pageIndex, "-").concat(h_1.start, "-").concat(h_1.end);
                var isPend_1 = hlR.type === 'pending-highlight';
                content = React.createElement("mark", { key: "hl".concat(p1), "data-hid": hid, className: "premium-highlight ".concat(isPend_1 ? 'highlight-pending' : 'highlight-final', " transition-colors cursor-pointer"), onClick: function (e) { if (isPend_1)
                        return; e.preventDefault(); e.stopPropagation(); setModalData(h_1.data); setIsAutoOpen(false); setIsModalOpen(true); } }, content);
            }
            var skR = ranges.find(function (r) { return r.type === 'partial-skeleton' && r.start <= p1 && r.end >= p2; });
            if (skR) {
                content = React.createElement("span", { key: "sk".concat(p1), className: "inline-partial-sk", style: { display: 'inline-block', minWidth: seg.length * 0.55 + 'em', height: '1em', verticalAlign: 'middle', borderRadius: '4px' } });
            }
            var glowR = ranges.find(function (r) { return r.type === 'rewritten-glow' && r.start <= p1 && r.end >= p2; });
            if (glowR) {
                content = React.createElement("mark", { key: "gw".concat(p1), className: "rewritten-inline-glow" }, content);
            }
            var luR = ranges.find(function (r) { return r.type === 'looked-up' && r.start <= p1 && r.end >= p2; });
            if (luR) {
                content = React.createElement("span", { className: "looked-up-word-marker" }, content);
            }
            nodes.push(React.createElement(React.Fragment, { key: "s".concat(p1) }, content));
        };
        for (var i = 0; i < sorted.length - 1; i++) {
            _loop_1(i);
        }
        var nlNode = lineIdx < textContent.split('\n').length - 1 ? React.createElement("span", { className: "md-hidden-nl" }, '\n') : null;
        /* ── Entity Highlight: re-parse nodes if entityHighlightMode ── */
        if (entityHighlightMode) {
            var pageEntities = entityCache[currentPage];
            if (pageEntities && pageEntities.length > 0) {
                var plainLine = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/^(#+\s|[-*]\s)/, '');
                /* Bengali combining characters: matras, hasanta, anusvara, visarga, nukta, virama range */
                var isBengaliCombining = function(ch) {
                    if (!ch) return false;
                    var cp = ch.codePointAt(0);
                    return (cp >= 0x0981 && cp <= 0x0983) ||
                           (cp >= 0x09BE && cp <= 0x09CC) ||
                           cp === 0x09CD || cp === 0x09D7 || cp === 0x09BC ||
                           cp === 0x200C || cp === 0x200D;
                };
                /* Normalize Bengali: remove nukta, normalize vowel signs that are visually similar */
                var normBengali = function(s) {
                    return s
                        .replace(/\u09BC/g, '')          /* remove nukta */
                        .replace(/\u09CB/g, '\u09CB')    /* keep o-kar */
                        .replace(/\u09C2/g, '\u09C1')    /* uu-kar → u-kar (হুমায়ূন→হুমায়ুন) */
                        .replace(/\u09C0/g, '\u09BF')    /* ii-matra → i-matra */
                        .replace(/\u0985/g, '\u0985')    /* a */
                        .replace(/\u09E0/g, '\u098B')    /* vocalic rr → rr */
                        .toLowerCase();
                };
                /* Build grapheme array */
                var buildGraphemes = function(str) {
                    try {
                        return Array.from(new Intl.Segmenter('bn', { granularity: 'grapheme' }).segment(str), function(s) { return s.segment; });
                    } catch(e) {
                        return Array.from(str);
                    }
                };
                var graphemes = buildGraphemes(plainLine);
                var normLine = normBengali(plainLine);
                var graphemesNorm = buildGraphemes(normLine);
                var ehSpans = [];
                pageEntities.forEach(function(ent) {
                    var name = (ent.name || '').trim();
                    if (!name || name.length < 2) return;
                    /* Try exact match first, then normalized match */
                    var tryMatch = function(lineG, entKey) {
                        var entG = buildGraphemes(entKey);
                        var nameLen = entG.length;
                        var lineLen = lineG.length;
                        if (nameLen < 2 || lineLen < nameLen) return;
                        for (var ci = 0; ci <= lineLen - nameLen; ci++) {
                            if (entityHitCount && (entityHitCount[name.toLowerCase()] || 0) >= 2) break;
                            var match = true;
                            for (var ni = 0; ni < nameLen; ni++) {
                                if (lineG[ci + ni] !== entG[ni]) { match = false; break; }
                            }
                            if (match) {
                                var afterIdx = ci + nameLen;
                                var afterG = afterIdx < lineLen ? lineG[afterIdx] : '';
                                var isLatinName = /^[a-z]/.test(entG[0]);
                                if (isLatinName && afterG && /[a-z0-9]/.test(afterG)) continue;
                                var extEnd = afterIdx;
                                while (extEnd < lineLen && isBengaliCombining(lineG[extEnd])) extEnd++;
                                /* Convert grapheme index back to original plainLine string index */
                                var strStart = graphemes.slice(0, ci).join('').length;
                                var strEnd = graphemes.slice(0, Math.min(extEnd, graphemes.length)).join('').length;
                                if (strEnd <= strStart) strEnd = strStart + name.length;
                                ehSpans.push({ start: strStart, end: strEnd, entity: ent, matched: plainLine.substring(strStart, strEnd) });
                                if (entityHitCount) entityHitCount[name.toLowerCase()] = (entityHitCount[name.toLowerCase()] || 0) + 1;
                                ci += extEnd - ci - 1;
                            }
                        }
                    };
                    /* 1) Exact (lowercase) match */
                    tryMatch(buildGraphemes(plainLine.toLowerCase()), name.toLowerCase());
                    /* 2) Normalized match (handles হুমায়ূন vs হুমায়ুন etc.) */
                    if ((entityHitCount[name.toLowerCase()] || 0) === 0) {
                        tryMatch(graphemesNorm, normBengali(name));
                    }
                    /* 3) For multi-word Bengali names: try matching just first word if ≥4 graphemes */
                    if ((entityHitCount[name.toLowerCase()] || 0) === 0) {
                        var isBengali = /[\u0980-\u09FF]/.test(name);
                        if (isBengali) {
                            var words = name.trim().split(/\s+/);
                            if (words.length >= 2) {
                                /* Try each individual word (≥4 chars) as a fallback highlight */
                                words.forEach(function(w) {
                                    if (w.length >= 4 && (entityHitCount[name.toLowerCase()] || 0) < 2) {
                                        tryMatch(buildGraphemes(plainLine.toLowerCase()), w.toLowerCase());
                                    }
                                });
                            }
                        }
                    }
                });
                if (ehSpans.length > 0) {
                    ehSpans.sort(function(a,b){ return a.start - b.start; });
                    var dedupedSpans = [];
                    var lastEnd2 = -1;
                    ehSpans.forEach(function(sp) {
                        if (sp.start >= lastEnd2) { dedupedSpans.push(sp); lastEnd2 = sp.end; }
                    });
                    var newNodes = [];
                    var cursor2 = 0;
                    dedupedSpans.forEach(function(sp, si) {
                        if (sp.start > cursor2) newNodes.push(plainLine.substring(cursor2, sp.start));
                        var etype = (sp.entity.type || 'other').toLowerCase();
                        var spEntity = sp.entity;
                        var handleEhTap = function(e) {
                            e.stopPropagation();
                            /* Capture rect synchronously before React clears the event */
                            var target = e.currentTarget;
                            var rect = target ? target.getBoundingClientRect() : null;
                            /* Toggle: if same entity already shown, hide it */
                            setEhTooltip(function(prev) {
                                if (prev && prev.entity === spEntity) return null;
                                if (!rect) return prev;
                                if (ehTooltipTimer.current) clearTimeout(ehTooltipTimer.current);
                                return { entity: spEntity, x: rect.left, y: rect.top };
                            });
                        };
                        newNodes.push(React.createElement("span", {
                            key: "eh"+lineIdx+"-"+si,
                            className: "eh " + etype,
                            onClick: handleEhTap
                        }, sp.matched));
                        cursor2 = sp.end;
                    });
                    if (cursor2 < plainLine.length) newNodes.push(plainLine.substring(cursor2));
                    nodes = newNodes;
                }
            }
        }
        var bk = "blk".concat(lineIdx);
        var h1c = readerTheme === 'light' || readerTheme === 'sepia' ? 'text-slate-900' : 'text-[#e2e8f0]';
        var h2c = readerTheme === 'light' || readerTheme === 'sepia' ? 'text-slate-800' : 'text-[#cbd5e1]';
        var h3c = readerTheme === 'light' || readerTheme === 'sepia' ? 'text-slate-700' : 'text-[#94a3b8]';
        var rewriteGlow = '';
        /* ── Interlinear injection ── */
        var lineKey = line.replace(/^(#+\s|[-*]\s|\^\^\s?)/, '').trim();
        var ilPageCache = interlinearCache[currentPage];
        var ilText = ilPageCache ? (ilPageCache[lineKey] || ilPageCache[line.trim()] || '') : '';
        var showIlSkeleton = interlinearMode && interlinearLoading && !ilPageCache && line.trim().length > 2;
        var ilNode = null;
        if (interlinearMode && line.trim().length > 2) {
            if (ilText) {
                /* Render markdown in interlinear: parse **bold** into <strong> */
                var ilParts = ilText.split(/(\*\*.*?\*\*)/g);
                var ilRendered = ilParts.map(function(p, pi) {
                    if (p.startsWith('**') && p.endsWith('**')) {
                        return React.createElement('strong', { key: pi, style: { fontWeight: 800, fontStyle: 'normal', color: 'rgba(255,255,255,0.9)' } }, p.slice(2, -2));
                    }
                    return p;
                });
                ilNode = React.createElement("span", { key: bk+"-il", className: "interlinear-line" }, ilRendered);
            } else if (showIlSkeleton) {
                ilNode = React.createElement("span", { key: bk+"-ilsk", className: "interlinear-skeleton", style:{width: (55 + Math.abs(lineIdx * 7) % 35) + '%'} });
            }
        }
        switch (type) {
            case 'h1': return React.createElement(React.Fragment, { key: bk },
                React.createElement("h1", { "data-offset": lineStart, className: ("md-h1 ".concat(h1c) + rewriteGlow) }, nodes, nlNode),
                ilNode);
            case 'h2': return React.createElement(React.Fragment, { key: bk },
                React.createElement("h2", { "data-offset": lineStart, className: ("md-h2 ".concat(h2c) + rewriteGlow) }, nodes, nlNode),
                ilNode);
            case 'h3': return React.createElement(React.Fragment, { key: bk },
                React.createElement("h3", { "data-offset": lineStart, className: ("md-h3 ".concat(h3c) + rewriteGlow) }, nodes, nlNode),
                ilNode);
            case 'h4':
                var h4c = readerTheme === 'light' || readerTheme === 'sepia' ? 'text-slate-600' : 'text-slate-500';
                return React.createElement(React.Fragment, { key: bk },
                React.createElement("h4", { "data-offset": lineStart, className: ("md-h4 ".concat(h4c) + rewriteGlow) }, nodes, nlNode),
                ilNode);
            case 'li': return React.createElement(React.Fragment, { key: bk },
                React.createElement("div", { "data-offset": lineStart, className: ("md-list-item" + rewriteGlow) },
                    React.createElement("span", { className: "md-list-bullet" }),
                    React.createElement("div", { className: "inline" }, nodes),
                    nlNode),
                ilNode);
            case 'ref': return React.createElement(React.Fragment, { key: bk },
                React.createElement("p", { "data-offset": lineStart, className: ("text-[10px] text-slate-500 leading-relaxed mb-2 opacity-75" + rewriteGlow) }, nodes, nlNode),
                ilNode);
            default: return React.createElement(React.Fragment, { key: bk },
                React.createElement("p", { "data-offset": lineStart, className: ("mb-4" + rewriteGlow) }, nodes, nlNode),
                ilNode);
        }
    };
    /* Dismiss entity tooltip on scroll — same pattern for all floating UI */
    useEffect(function() {
        if (!ehTooltip) return;
        var dismiss = function() { setEhTooltip(null); if (ehTooltipTimer.current) clearTimeout(ehTooltipTimer.current); };
        window.addEventListener('scroll', dismiss, { passive: true });
        document.addEventListener('touchmove', dismiss, { passive: true });
        return function() {
            window.removeEventListener('scroll', dismiss);
            document.removeEventListener('touchmove', dismiss);
        };
    }, [ehTooltip]);


    var displayHeader = (function () { var t = getPageHeader(); var ws = t.split(' '); return ws.length > 2 ? ws.slice(0, 2).join(' ') + '...' : t; })();
    return (React.createElement("div", { className: "w-full flex flex-col min-h-screen px-4 pb-40" },
        React.createElement(AnalysisModal, { isOpen: isModalOpen, isAutoOpen: isAutoOpen, data: modalData, isLoading: isRegenerating, autoPlayTTS: autoPlayTTS, onClose: function () { return setIsModalOpen(false); }, onModelChange: handleModelChange, googleApiKey: googleApiKey }),
        React.createElement(MaxDrawer, { isOpen: isMaxDrawerOpen, text: cumulativeText, currentPageText: currentPageText, pageIndex: currentPage, onClose: function () { return setIsMaxDrawerOpen(false); }, drawerStateRef: drawerStateRef, drawerActionsRef: drawerActionsRef, activeStructureModel: activeStructureModel, googleApiKey: googleApiKey, onTabChange: setDrawerTab }),
        /* ── LENS Scanning Overlay ── */
        entityScanLoading && React.createElement("div", { className: "lens-scan-overlay" },
            React.createElement("div", { className: "lens-loader" },
                (function() {
                    var lensPath = "M63,37c-6.7-4-4-27-13-27s-6.3,23-13,27-27,4-27,13,20.3,9,27,13,4,27,13,27,6.3-23,13-27,27-4,27-13-20.3-9-27-13Z";
                    var makeSvg = function(id) {
                        return React.createElement("svg", { id: id, xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 100 100" },
                            React.createElement("defs", null,
                                React.createElement("filter", { id: "ls-shine" }, React.createElement("feGaussianBlur", { stdDeviation: "3" })),
                                React.createElement("mask", { id: "ls-mask" }, React.createElement("path", { d: lensPath, fill: "white" })),
                                React.createElement("radialGradient", { id: "ls-g1", cx: "50", cy: "66", r: "30", gradientTransform: "translate(0 35) scale(1 0.5)", gradientUnits: "userSpaceOnUse" },
                                    React.createElement("stop", { offset: "0%", stopColor: "black", stopOpacity: "0.3" }),
                                    React.createElement("stop", { offset: "100%", stopColor: "black", stopOpacity: "0" })),
                                React.createElement("radialGradient", { id: "ls-g2", cx: "55", cy: "20", r: "30", gradientUnits: "userSpaceOnUse" },
                                    React.createElement("stop", { offset: "0%", stopColor: "white", stopOpacity: "0.3" }),
                                    React.createElement("stop", { offset: "100%", stopColor: "white", stopOpacity: "0" }))),
                            React.createElement("g", null,
                                React.createElement("path", { d: lensPath, fill: "currentColor" }),
                                React.createElement("path", { d: lensPath, fill: "url(#ls-g1)" }),
                                React.createElement("path", { d: lensPath, fill: "none", stroke: "white", opacity: "0.3", strokeWidth: "3", filter: "url(#ls-shine)", mask: "url(#ls-mask)" }),
                                React.createElement("path", { d: lensPath, fill: "url(#ls-g2)" })));
                    };
                    return [makeSvg("lp1"), makeSvg("lp2"), makeSvg("lp3")];
                })())),
        /* ── Entity Tooltip Overlay ── */
        ehTooltip && React.createElement("div", {
            className: "eh-tooltip-wrap",
            style: {
                left: Math.min(Math.max(8, ehTooltip.x), window.innerWidth - 248) + 'px',
                top: Math.max(64, ehTooltip.y - 115) + 'px'
            },
            onTouchStart: function(e) { e.stopPropagation(); }
        },
            React.createElement("div", { className: "eh-tooltip", style: { pointerEvents: 'auto' } },
                React.createElement("div", { style: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'4px' } },
                    React.createElement("div", { className: "eh-tooltip-type " + (ehTooltip.entity.type||'other').toLowerCase() },
                        (ehTooltip.entity.type || 'OTHER').toUpperCase()),
                    React.createElement("button", {
                        onClick: function() { setEhTooltip(null); },
                        style: { background:'none', border:'none', color:'rgba(148,163,184,0.5)', cursor:'pointer', fontSize:'14px', lineHeight:1, padding:'0 0 0 8px' }
                    }, "×")),
                React.createElement("div", { className: "eh-tooltip-name" }, ehTooltip.entity.name),
                React.createElement("div", { className: "eh-tooltip-desc" },
                    (ehTooltip.entity.description || '').split('\n').map(function(para, pi) {
                        if (!para.trim()) return null;
                        /* Parse **bold** and *italic* inline */
                        var parts = para.split(/(\*\*.*?\*\*|\*.*?\*)/g);
                        var rendered = parts.map(function(part, i) {
                            if (part.startsWith('**') && part.endsWith('**'))
                                return React.createElement('strong', { key: i }, part.slice(2, -2));
                            if (part.startsWith('*') && part.endsWith('*'))
                                return React.createElement('em', { key: i }, part.slice(1, -1));
                            return part;
                        });
                        return React.createElement('p', { key: pi }, rendered);
                    })),
                (['person','place','org'].indexOf((ehTooltip.entity.type||'other').toLowerCase()) !== -1) &&
                React.createElement("button", {
                    className: "eh-tooltip-img-btn",
                    onClick: function(e) {
                        e.stopPropagation();
                        setEhTooltip(null);
                        setEhImageDrawer(ehTooltip.entity);
                        setEhDrawerTabIdx(0);
                        setTimeout(function(){ setEhDrawerOpen(true); }, 30);
                    }
                },
                    React.createElement("svg", { width:"12", height:"12", viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2.5" },
                        React.createElement("rect", { x:"3", y:"3", width:"18", height:"18", rx:"2", ry:"2" }),
                        React.createElement("circle", { cx:"8.5", cy:"8.5", r:"1.5" }),
                        React.createElement("polyline", { points:"21 15 16 10 5 21" })),
                    "View Image"))),
        /* ── Entity Image Drawer ── */
        React.createElement(React.Fragment, null,
            ehImageDrawer && React.createElement("div", {
                className: "fixed inset-0 z-[1090] bg-black/50",
                onClick: function() { setEhDrawerOpen(false); setTimeout(function(){ setEhImageDrawer(null); }, 400); }
            }),
            React.createElement("div", {
                className: "eh-img-drawer" + (ehDrawerOpen ? " open" : ""),
                style: { zIndex: 1095 },
                onTouchStart: function(e){ e.stopPropagation(); }
            },
                ehImageDrawer && (function() {
                    var etype = (ehImageDrawer.type || 'other').toLowerCase();
                    var name = ehImageDrawer.name || '';
                    var desc = ehImageDrawer.description || '';
                    /* Build best English search query:
                       Priority 1: entity has a searchQuery field (set by Lens scan if we store it — not available here)
                       Priority 2: extract capitalized English words from description (e.g. "Humayun Ahmed", "Hiroshima")
                       Priority 3: extract any English words from the name itself
                       Priority 4: use name as-is (Bengali) — Google will try to correct */
                    var isBengaliName = /[\u0980-\u09FF]/.test(name);
                    var searchName = name;
                    if (isBengaliName) {
                        /* Try multi-word English name pattern from description */
                        var multiEng = desc.match(/\b([A-Z][a-z]{1,15}(?:\s+[A-Z][a-z]{1,15}){1,4})\b/);
                        if (multiEng) {
                            searchName = multiEng[1];
                        } else {
                            /* Try single capitalized English word */
                            var singleEng = desc.match(/\b([A-Z][a-zA-Z]{2,})\b/);
                            if (singleEng) searchName = singleEng[1];
                        }
                    }
                    /* For person add role hint from description if short enough */
                    var roleHint = '';
                    if (etype === 'person' && isBengaliName) {
                        var roleMatch = desc.match(/(?:লেখক|কবি|রাজনীতিবিদ|রাজা|সম্রাট|নেতা|বিজ্ঞানী|শিল্পী|চলচ্চিত্র|ক্রিকেটার|খেলোয়াড়)/);
                        var roleMap = { 'লেখক':'author writer', 'কবি':'poet', 'রাজনীতিবিদ':'politician', 'রাজা':'king', 'সম্রাট':'emperor', 'নেতা':'leader', 'বিজ্ঞানী':'scientist', 'শিল্পী':'artist', 'চলচ্চিত্র':'filmmaker', 'ক্রিকেটার':'cricketer', 'খেলোয়াড়':'player' };
                        if (roleMatch) roleHint = ' ' + (roleMap[roleMatch[0]] || '');
                    }
                    var finalSearchName = searchName + roleHint;
                    var googleImgQ = etype === 'person' ? finalSearchName + ' portrait photo' : etype === 'place' ? finalSearchName + ' landmark' : finalSearchName;
                    var wikimediaQ = 'https://commons.wikimedia.org/w/index.php?search=' + encodeURIComponent(finalSearchName) + '&title=Special:MediaSearch&type=image';
                    var googleImgTabUrl = 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(googleImgQ);
                    var googleMapsUrl = 'https://www.google.com/maps/search/' + encodeURIComponent(finalSearchName);
                    var wikiUrl = 'https://en.wikipedia.org/wiki/' + encodeURIComponent(finalSearchName.trim().replace(/\s+/g,'_'));
                    var tabs = etype === 'person'
                        ? [{ label:'🔍 Google Images', url: googleImgTabUrl }, { label:'🖼 Wikimedia', url: wikimediaQ }, { label:'📖 Wikipedia', url: wikiUrl }]
                        : etype === 'place'
                        ? [{ label:'🔍 Google Images', url: googleImgTabUrl }, { label:'🗺️ Maps', url: googleMapsUrl }, { label:'🖼 Wikimedia', url: wikimediaQ }]
                        : [{ label:'🔍 Google Images', url: googleImgTabUrl }, { label:'🖼 Wikimedia', url: wikimediaQ }, { label:'📖 Wikipedia', url: wikiUrl }];
                    var activeTab = tabs[Math.min(ehDrawerTabIdx, tabs.length-1)];
                    return React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "eh-img-drawer-handle" }),
                        React.createElement("div", { className: "eh-img-drawer-header" },
                            React.createElement("div", { className: "eh-img-drawer-title" },
                                React.createElement("span", { className: "eh-img-drawer-type " + etype }, etype.toUpperCase()),
                                React.createElement("span", { className: "eh-img-drawer-name" }, name)),
                            React.createElement("button", {
                                className: "eh-img-drawer-close",
                                onClick: function() { setEhDrawerOpen(false); setTimeout(function(){ setEhImageDrawer(null); }, 400); }
                            }, "×")),
                        React.createElement("div", { className: "eh-img-drawer-tabs" },
                            tabs.map(function(tab, ti) {
                                return React.createElement("button", {
                                    key: ti,
                                    className: "eh-img-drawer-tab" + (ehDrawerTabIdx === ti ? " active" : ""),
                                    onClick: function() { setEhDrawerTabIdx(ti); }
                                }, tab.label);
                            })),
                        React.createElement("div", { className: "eh-img-drawer-body" },
                            React.createElement("div", { style: { fontSize:'2.8rem', lineHeight:1 } },
                                etype === 'person' ? '👤' : etype === 'place' ? '📍' : etype === 'org' ? '🏢' : '🔍'),
                            React.createElement("div", { style: { textAlign:'center', color:'#94a3b8', fontSize:'12px', lineHeight:1.6, maxWidth:'260px' } }, desc.length > 120 ? desc.slice(0,120)+'…' : desc),
                            React.createElement("div", { className: "eh-img-drawer-url" }, activeTab.url.length > 55 ? activeTab.url.slice(0,55)+'…' : activeTab.url),
                            React.createElement("a", {
                                href: activeTab.url,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "eh-img-drawer-open-btn",
                                onClick: function(e){ e.stopPropagation(); }
                            },
                                React.createElement("svg", { width:"16", height:"16", viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2.5" },
                                    React.createElement("path", { d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }),
                                    React.createElement("polyline", { points:"15 3 21 3 21 9" }),
                                    React.createElement("line", { x1:"10", y1:"14", x2:"21", y2:"3" })),
                                "Open " + activeTab.label.replace(/^[^ ]+ /,''))));
                })())),
        isOriginalPdfOpen && pdfFile && (React.createElement("div", { className: "fixed inset-0 z-[200] flex flex-col bg-[#0a0a0c]" },
            /* Scrollable canvas area */
            React.createElement("div", { className: "flex-1 overflow-auto", style: { paddingTop: '60px', paddingBottom: '70px' } },
                React.createElement("div", { style: { display: 'flex', justifyContent: 'center', minHeight: '100%', padding: '12px' } },
                    React.createElement("canvas", { ref: pdfCanvasRef, style: {
                        display: 'block',
                        borderRadius: '6px',
                        boxShadow: '0 8px 48px rgba(0,0,0,0.8)',
                        filter: 'brightness(0.92) contrast(1.08)'
                    } }))),
            /* Top bar */
            React.createElement("div", { style: {
                position: 'absolute', top: 0, left: 0, right: 0, height: '56px',
                background: 'rgba(10,10,14,0.99)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 16px', zIndex: 10
            } },
                /* Page info */
                React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                    React.createElement("span", { style: { fontSize: '11px', fontWeight: 800, color: 'rgba(148,163,184,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase' } },
                        "Page ", ((pdfRange ? pdfRange.start : 1) || 1) + currentPage,
                        " / ", (pdfRange ? pdfRange.end : (pdfDoc ? pdfDoc.numPages : 1)) || 1)),
                /* Zoom controls */
                React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                    React.createElement("button", { onClick: function() { setPdfViewerZoom(function(z) { return Math.max(0.5, z - 0.15); }); }, style: { width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', fontWeight: 300 } }, "−"),
                    React.createElement("span", { style: { fontSize: '11px', fontWeight: 800, color: '#94a3b8', minWidth: '38px', textAlign: 'center' } }, Math.round(pdfViewerZoom * 100) + "%"),
                    React.createElement("button", { onClick: function() { setPdfViewerZoom(function(z) { return Math.min(3.0, z + 0.15); }); }, style: { width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', fontWeight: 300 } }, "+"),
                    React.createElement("button", { onClick: function() { setPdfViewerZoom(1.0); }, style: { height: '34px', padding: '0 10px', borderRadius: '10px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc', fontSize: '10px', fontWeight: 800, cursor: 'pointer', letterSpacing: '0.08em' } }, "FIT"),
                    React.createElement("button", { onClick: function() { setIsOriginalPdfOpen(false); }, style: { width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '4px' } },
                        React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5" },
                            React.createElement("path", { d: "M18 6 6 18" }),
                            React.createElement("path", { d: "m6 6 12 12" }))))),
            /* Bottom page nav */
            React.createElement("div", { style: {
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '62px',
                background: 'rgba(10,10,14,0.99)',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', zIndex: 10
            } },
                React.createElement("button", { onClick: function() { currentPage > 0 && setCurrentPage(function(p) { return p - 1; }); }, disabled: currentPage === 0, style: { width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: currentPage === 0 ? 0.25 : 1 } },
                    React.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5" },
                        React.createElement("path", { d: "m15 18-6-6 6-6" }))),
                React.createElement("span", { style: { fontSize: '12px', fontWeight: 700, color: 'rgba(148,163,184,0.6)', minWidth: '80px', textAlign: 'center' } },
                    "Folio ", currentPage + 1),
                React.createElement("button", { onClick: function() { currentPage < totalPages - 1 && setCurrentPage(function(p) { return p + 1; }); }, disabled: currentPage === totalPages - 1, style: { width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: currentPage === totalPages - 1 ? 0.25 : 1 } },
                    React.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5" },
                        React.createElement("path", { d: "m9 18 6-6-6-6" })))))),
        notification && (React.createElement("div", { className: "fixed top-20 left-1/2 -translate-x-1/2 z-[150] slide-in-from-top-2" },
            React.createElement("div", { className: "".concat(notification.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200', " border px-5 py-3 rounded-full shadow-2xl flex items-center space-x-3 backdrop-blur-md") },
                notification.type === 'error' ? React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                    React.createElement("circle", { cx: "12", cy: "12", r: "10" }),
                    React.createElement("line", { x1: "12", y1: "8", x2: "12", y2: "12" }),
                    React.createElement("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })) : React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                    React.createElement("path", { d: "M20 6 9 17l-5-5" })),
                React.createElement("span", { className: "text-xs font-bold" }, notification.message),
                React.createElement("button", { onClick: function () { return setNotification(null); }, className: "hover:text-white" },
                    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                        React.createElement("path", { d: "M18 6 6 18" }),
                        React.createElement("path", { d: "m6 6 12 12" })))))),
        React.createElement("header", { className: "fixed top-0 left-0 w-full py-4 px-6 flex justify-between items-center z-50 border-b ".concat(headerBgClass()), style: { willChange: 'transform', transform: 'translateZ(0)' } },
            React.createElement("div", { className: "flex items-center min-w-0 flex-1 mr-4" },
                React.createElement("button", { onClick: function () { return setShowHistoryControls(!showHistoryControls); }, className: "flex items-center space-x-3 text-left group focus:outline-none" },
                    React.createElement("div", { className: "w-8 h-8 shrink-0 rounded-lg flex items-center justify-center border transition-colors ".concat(readerTheme === 'light' || readerTheme === 'sepia' ? 'bg-slate-200 border-slate-300' : 'bg-slate-900 border-white/5 group-hover:border-white/20') },
                        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: readerTheme === 'light' || readerTheme === 'sepia' ? '#475569' : '#4f46e5', strokeWidth: "2" },
                            React.createElement("path", { d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" }),
                            React.createElement("path", { d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" }))),
                    React.createElement("div", { className: "flex flex-col min-w-0" },
                        React.createElement("span", { className: "display-serif text-sm font-medium truncate transition-colors ".concat(readerTheme === 'light' || readerTheme === 'sepia' ? 'text-slate-900' : 'text-slate-300 group-hover:text-white') }, displayHeader),
                        React.createElement("span", { className: "text-[9px] text-slate-500 uppercase tracking-widest" },
                            "Folio ",
                            currentPage + 1,
                            "/",
                            totalPages)))),
            React.createElement("div", { className: "flex items-center space-x-3 shrink-0" },
                React.createElement("button", { onClick: function () { return setIsAutoScrolling(!isAutoScrolling); }, className: "p-2 rounded-full border transition-all ".concat(isAutoScrolling ? 'text-cyan-400 bg-cyan-500/20 border-cyan-500/20 animate-pulse' : 'border-white/5 bg-white/5 text-slate-500'), title: "Auto-scroll" },
                    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, isAutoScrolling ? React.createElement(React.Fragment, null,
                        React.createElement("rect", { x: "6", y: "4", width: "4", height: "16" }),
                        React.createElement("rect", { x: "14", y: "4", width: "4", height: "16" })) : React.createElement(React.Fragment, null,
                        React.createElement("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                        React.createElement("polyline", { points: "7 10 12 15 17 10" }),
                        React.createElement("line", { x1: "12", x2: "12", y1: "15", y2: "3" })))),
                React.createElement("button", { onClick: onOpenSettings, className: "p-2 rounded-full border transition-all ".concat(readerTheme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-600' : 'border-white/5 bg-white/5 text-slate-500 hover:text-white') },
                    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                        React.createElement("path", { d: "M20 7h-9" }),
                        React.createElement("path", { d: "M14 17H5" }),
                        React.createElement("circle", { cx: "17", cy: "17", r: "3" }),
                        React.createElement("circle", { cx: "7", cy: "7", r: "3" }))),
                React.createElement("button", { onClick: function () { return onBack(currentPage, extractedPages, { highlights: highlights, rewrittenPages: rewrittenPages, xrayCache: xrayCache }); }, className: "text-[10px] font-bold tracking-[0.2em] uppercase transition-all px-4 py-2 rounded-full border ".concat(readerTheme === 'light' ? 'text-slate-600 border-slate-200' : 'text-slate-500 hover:text-slate-200 border-white/5') }, "Exit"))),
        /* ── Portion Selection Mode Banner ── */
        isSelectingPortion && React.createElement("div", {
            style:{
                position:'fixed', bottom:'120px', left:0, right:0, zIndex:150,
                padding:'16px', background:'linear-gradient(to top, #0a0f1a, transparent)'
            }
        },
            React.createElement("div", {
                style:{
                    maxWidth:'640px', margin:'0 auto',
                    background:'linear-gradient(135deg,#0f1623,#0d1220)',
                    border:'1px solid rgba(99,130,200,0.25)',
                    borderRadius:'18px', padding:'14px 18px',
                    display:'flex', alignItems:'center', gap:'14px',
                    boxShadow:'0 -8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(120,160,255,0.05) inset'
                }
            },
                React.createElement("div", {
                    style:{
                        width:'36px', height:'36px', borderRadius:'10px', flexShrink:0,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        background:'rgba(99,130,200,0.12)', border:'1px solid rgba(99,130,200,0.2)',
                        animation:'pulse 2s ease-in-out infinite'
                    }
                },
                    React.createElement("svg", { width:"16", height:"16", viewBox:"0 0 24 24", fill:"none", stroke:"rgba(150,180,240,0.9)", strokeWidth:"2.5" },
                        React.createElement("path", { d:"M9 3H5a2 2 0 0 0-2 2v4" }),
                        React.createElement("path", { d:"M15 3h4a2 2 0 0 1 2 2v4" }),
                        React.createElement("path", { d:"M9 21H5a2 2 0 0 1-2-2v-4" }),
                        React.createElement("path", { d:"M15 21h4a2 2 0 0 0 2-2v-4" }))),
                React.createElement("div", { style:{flex:1, minWidth:0, overflow:'hidden'} },
                    React.createElement("div", { style:{fontSize:'12px', fontWeight:700, color:'rgba(180,200,240,0.9)', marginBottom:'2px'} },
                        capturedPortion ? "✓ Selection captured" : "Select text to rewrite"),
                    React.createElement("div", { style:{fontSize:'10px', color: capturedPortion ? 'rgba(110,231,183,0.7)' : 'rgba(100,130,180,0.55)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'} },
                        capturedPortion ? ('"' + capturedPortion.text.slice(0, 50) + (capturedPortion.text.length > 50 ? '…' : '') + '"') : "Highlight a word, line or paragraph on the page")),
                React.createElement("div", { style:{display:'flex', gap:'8px', flexShrink:0} },
                    React.createElement("button", {
                        style:{
                            padding:'9px 14px', borderRadius:'10px', border:'none', cursor:'pointer', outline:'none',
                            background:'rgba(255,255,255,0.05)', color:'rgba(150,170,210,0.6)',
                            fontSize:'11px', fontWeight:700
                        },
                        onClick: function() { isSelectingPortionRef.current = false; setIsSelectingPortion(false); setIsCustomizerOpen(true); }
                    }, "Cancel"),
                    React.createElement("button", {
                        style:{
                            padding:'9px 16px', borderRadius:'10px', border:'none', cursor:'pointer', outline:'none',
                            background: capturedPortion ? 'linear-gradient(135deg,#4f46e5,#6366f1)' : 'rgba(99,102,241,0.3)',
                            color:'#fff', fontSize:'11px', fontWeight:700,
                            boxShadow: capturedPortion ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
                            transition: 'all 0.2s ease'
                        },
                        onClick: function() {
                            /* Use capturedPortionRef - holds the last selection even after browser clears it */
                            var captured = capturedPortionRef.current;
                            if (!captured || !captured.text) {
                                alert('Please select some text on the page first.');
                                return;
                            }
                            isSelectingPortionRef.current = false; setIsSelectingPortion(false);  /* clear BEFORE removeAllRanges so processSelection ignores it */
                            capturedPortionRef.current = null;
                            setCapturedPortion(null);
                            window.getSelection() && window.getSelection().removeAllRanges();
                            setSelectionRewrite({ text: captured.text, startLine: captured.startLine, endLine: captured.endLine });
                            setIsCustomizerOpen(true);
                        }
                    }, capturedPortion ? "✓ Confirm" : "Select text first")))),
        (isCustomizerOpen || isCustomizerClosing) && (React.createElement("div", { className: "fixed inset-0 z-[60] flex flex-col justify-end" },
            React.createElement("div", { className: "bottom-drawer-backdrop".concat(isCustomizerClosing ? ' closing' : ''), onClick: closeCustomizer }),
            React.createElement("div", { ref: custShellRef, className: "bottom-drawer-shell".concat(isCustomizerClosing ? ' slide-out-down' : ' slide-in-from-bottom-full'), style: { maxWidth: '640px' } },
                React.createElement("div", __assign({ className: "bottom-drawer-handle" }, custDragHandlers),
                    React.createElement("div", { className: "bottom-drawer-handle-bar" })),
                React.createElement("div", { className: "px-6 pb-6 overflow-y-auto custom-scrollbar" },
                    /* Header row */
                    React.createElement("div", { style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px'} },
                        React.createElement("div", null,
                            selectionRewrite && React.createElement("div", { className: "cust-sel-badge" },
                                React.createElement("svg", { width:"9", height:"9", viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2.5" },
                                    React.createElement("path", { d:"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }),
                                    React.createElement("path", { d:"M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" })),
                                "Selection Mode"),
                            React.createElement("h3", { className: "display-serif text-2xl text-white", style:{margin:0} },
                                selectionRewrite ? "Rewrite Selection" : "Text Customizer"),
                            React.createElement("p", { style:{fontSize:'10px',color:'rgba(120,150,200,0.5)',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',marginTop:'3px'} },
                                selectionRewrite ? (selectionRewrite.endLine - selectionRewrite.startLine + 1) + " line(s) selected" : "Whole page")),
                        React.createElement("div", { style:{display:'flex',alignItems:'center',gap:'8px',flexShrink:0} },
                            React.createElement("select", { value: customizerLanguage, onChange: function (e) { return setCustomizerLanguage(e.target.value); }, style:{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(150,170,210,0.7)',borderRadius:'10px',padding:'6px 10px',fontSize:'10px',fontWeight:700,textTransform:'uppercase',outline:'none'} }, ['Bengali', 'English', 'Urdu'].map(function (l) { return React.createElement("option", { key: l, value: l }, l); })),
                            React.createElement("select", { value: customizerModel, onChange: function (e) { return setCustomizerModel(e.target.value); }, style:{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(150,170,210,0.7)',borderRadius:'10px',padding:'6px 10px',fontSize:'10px',fontWeight:700,textTransform:'uppercase',outline:'none'} }, Object.keys(MODEL_LABELS).map(function (k) { return React.createElement("option", { key: k, value: k }, MODEL_LABELS[k]); })),
                            !selectionRewrite && React.createElement("button", {
                                onClick: function() { setAutoPrefetchNext(!autoPrefetchNext); },
                                title: autoPrefetchNext ? "Auto-prefetch next page: ON" : "Auto-prefetch next page: OFF",
                                style: {
                                    width: '32px', height: '32px', borderRadius: '9px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: autoPrefetchNext ? '1px solid rgba(99,130,200,0.3)' : '1px solid rgba(255,255,255,0.08)',
                                    background: autoPrefetchNext ? 'rgba(99,130,200,0.15)' : 'rgba(255,255,255,0.03)',
                                    color: autoPrefetchNext ? 'rgba(160,190,240,0.8)' : 'rgba(120,150,200,0.3)',
                                    cursor: 'pointer', outline: 'none', flexShrink: 0,
                                    transition: 'all 0.2s ease'
                                }
                            }, React.createElement("svg", { width:"16", height:"16", viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2.5" },
                                React.createElement("path", { d:"M13 2L3 14h9l-1 8 10-12h-9l1-8z" }))),
                            selectionRewrite && React.createElement("button", {
                                onClick: function() { setSelectionRewrite(null); closeCustomizer(); },
                                style:{width:'32px',height:'32px',borderRadius:'9px',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid rgba(239,68,68,0.2)',background:'rgba(239,68,68,0.08)',color:'#fca5a5',cursor:'pointer',outline:'none',flexShrink:0}
                            }, React.createElement("svg", { width:"14", height:"14", viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2.5" }, React.createElement("line", { x1:"18", y1:"6", x2:"6", y2:"18" }), React.createElement("line", { x1:"6", y1:"6", x2:"18", y2:"18" }))))),
                    /* Selection preview */
                    selectionRewrite && React.createElement("div", { className: "cust-sel-preview" }, '"', selectionRewrite.text, '"'),
                    /* Select Portion banner - shown when not in selection mode */
                    !selectionRewrite && !rewritingStatus[currentPage] && React.createElement("div", {
                        style:{
                            display:'flex', alignItems:'center', gap:'12px',
                            background:'rgba(99,130,200,0.06)',
                            border:'1px dashed rgba(99,130,200,0.2)',
                            borderRadius:'12px', padding:'12px 14px', marginBottom:'14px',
                            cursor:'pointer'
                        },
                        onClick: function() {
                            /* Slide drawer down (hide) so user can select text, then re-open */
                            setIsCustomizerOpen(false);
                            isSelectingPortionRef.current = true; setIsSelectingPortion(true);
                        }
                    },
                        React.createElement("div", { style:{width:'32px',height:'32px',borderRadius:'9px',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(99,130,200,0.1)',flexShrink:0} },
                            React.createElement("svg", { width:"14", height:"14", viewBox:"0 0 24 24", fill:"none", stroke:"rgba(150,180,240,0.7)", strokeWidth:"2.5" },
                                React.createElement("path", { d:"M9 3H5a2 2 0 0 0-2 2v4" }),
                                React.createElement("path", { d:"M15 3h4a2 2 0 0 1 2 2v4" }),
                                React.createElement("path", { d:"M9 21H5a2 2 0 0 1-2-2v-4" }),
                                React.createElement("path", { d:"M15 21h4a2 2 0 0 0 2-2v-4" }))),
                        React.createElement("div", null,
                            React.createElement("div", { style:{fontSize:'12px',fontWeight:700,color:'rgba(180,200,240,0.8)',marginBottom:'2px'} }, "Select a portion"),
                            React.createElement("div", { style:{fontSize:'10px',color:'rgba(100,130,180,0.55)'} }, "Tap to close drawer, select text, then confirm"))),
                    /* Body */
                    (rewritingStatus[currentPage] && !selectionRewrite) ? (React.createElement("div", { style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 0',gap:'14px'} },
                        React.createElement("div", { style:{width:'32px',height:'32px',border:'2px solid #6366f1',borderTopColor:'transparent',borderRadius:'50%'} , className:"animate-spin"}),
                        React.createElement("p", { style:{fontSize:'10px',fontWeight:700,color:'rgba(120,150,200,0.5)',letterSpacing:'0.15em',textTransform:'uppercase'} , className:"animate-pulse"}, "Rewriting page..."))) : showCustomInput ? (React.createElement("div", { style:{display:'flex',flexDirection:'column',gap:'12px'} },
                        React.createElement("textarea", { value: customPromptInput, onChange: function (e) { return setCustomPromptInput(e.target.value); }, placeholder: "Describe your style (e.g. 'simpler Bengali for children')", style:{width:'100%',height:'96px',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(99,130,200,0.15)',borderRadius:'12px',padding:'14px',color:'#e2e8f0',fontSize:'13px',outline:'none',resize:'none',fontFamily:"'Merriweather',serif",lineHeight:1.6,boxSizing:'border-box'} }),
                        React.createElement("div", { style:{display:'flex',gap:'10px'} },
                            React.createElement("button", { onClick: function () { return setShowCustomInput(false); }, style:{flex:1,padding:'12px',borderRadius:'12px',border:'1px solid rgba(99,130,200,0.15)',background:'transparent',color:'rgba(150,170,210,0.6)',fontWeight:700,fontSize:'12px',cursor:'pointer',outline:'none'} }, "Cancel"),
                            React.createElement("button", {
                                onClick: function () { return selectionRewrite ? performPartialRewrite('custom', customPromptInput) : handleRewriteUI('custom', customPromptInput); },
                                style:{flex:1,padding:'12px',borderRadius:'12px',border:'none',background:'linear-gradient(135deg,#4f46e5,#6366f1)',color:'#fff',fontWeight:700,fontSize:'12px',cursor:'pointer',outline:'none',boxShadow:'0 4px 16px rgba(99,102,241,0.3)'}
                            }, selectionRewrite ? "Rewrite Selection" : "Rewrite Page")))) : (React.createElement("div", { style:{display:'flex',flexDirection:'column',gap:'14px',paddingBottom:'16px'} },
                        React.createElement("div", { style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'} },
                            [{ mode: 'simple', label: 'Simpler', icon:'📖', desc: 'Easier words & shorter sentences.' },
                             { mode: 'intermediate', label: 'Balanced', icon:'⚖️', desc: 'Natural flow, moderate complexity.' },
                             { mode: 'advanced', label: 'Literary', icon:'✍️', desc: 'Sophisticated, rich vocabulary.' },
                             { mode: 'custom', label: 'Custom', icon:'🎨', desc: 'Define your own style.', custom: true }
                            ].map(function (_a) {
                                var mode = _a.mode, label = _a.label, icon = _a.icon, desc = _a.desc, custom = _a.custom;
                                return React.createElement("button", {
                                    key: mode,
                                    onClick: function() {
                                        if (custom) { setShowCustomInput(true); return; }
                                        if (selectionRewrite) performPartialRewrite(mode);
                                        else handleRewriteUI(mode);
                                    },
                                    style:{
                                        padding:'16px', borderRadius:'14px',
                                        border:'1px solid rgba(99,130,200,0.1)',
                                        background:'rgba(255,255,255,0.03)',
                                        textAlign:'left', cursor:'pointer', outline:'none',
                                        transition:'all 0.2s ease'
                                    }
                                },
                                    React.createElement("div", { style:{fontSize:'20px',marginBottom:'6px'} }, icon),
                                    React.createElement("div", { style:{fontSize:'13px',fontWeight:700,color:'#e2e8f0',marginBottom:'4px'} }, label),
                                    React.createElement("div", { style:{fontSize:'10px',color:'rgba(120,150,200,0.55)',lineHeight:1.4} }, desc));
                            })),
                        !selectionRewrite && rewrittenPages[currentPage] && React.createElement("button", {
                            onClick: handleRestoreOriginal,
                            style:{width:'100%',padding:'14px',borderRadius:'12px',border:'1px solid rgba(239,68,68,0.2)',background:'rgba(239,68,68,0.08)',color:'#fca5a5',fontWeight:700,fontSize:'11px',letterSpacing:'0.1em',textTransform:'uppercase',cursor:'pointer',outline:'none'}
                        }, "↩ Restore Original"))))))),
        /* ── X-Ray Panel ── */
        (function renderXRayPanel() {
            var xrayEntitiesRaw = xrayCache[currentPage] || [];
            var xrayEntityTypes = ['all'].concat(Array.from(new Set(xrayEntitiesRaw.map(function(e) { return e.type; }))));
            var xrayFilterBar = (!isXRayLoading && xrayEntitiesRaw.length > 0)
                ? React.createElement("div", { className: "xray-filter-bar" },
                    xrayEntityTypes.map(function(t) {
                        var tLabel = t === 'all' ? 'All' : t === 'person' ? '👤 Person' : t === 'place' ? '📍 Place' : t === 'org' ? '🏛 Org' : t === 'concept' ? '💡 Concept' : t === 'term' ? '📖 Term' : '• Other';
                        return React.createElement("button", { key: t, className: "xray-filter-chip" + (xrayFilter === t ? " active" : ""), onClick: function() { setXrayFilter(t); } }, tLabel);
                    }))
                : null;
            var xrayTypeMap = { person: '👤', place: '📍', org: '🏛', concept: '💡', term: '📖', other: '•' };
            var xrayFiltered = xrayEntitiesRaw.filter(function(e) { return xrayFilter === 'all' || e.type === xrayFilter; });
            var xrayBody = isXRayLoading
                ? React.createElement("div", { className: "xray-loading" },
                    React.createElement("div", { className: "xray-spinner" }),
                    React.createElement("div", { className: "xray-loading-text" }, "Scanning page..."))
                : (xrayFiltered.length === 0
                    ? React.createElement("div", { className: "xray-empty" },
                        React.createElement("div", { className: "xray-empty-icon" }, "🔍"),
                        React.createElement("div", { className: "xray-empty-text" }, "No key entities found on this page."))
                    : React.createElement("div", null, xrayFiltered.map(function(entity, idx) {
                        return React.createElement("div", { key: idx, className: "xray-card", style: { animationDelay: (idx * 0.06) + "s" } },
                            React.createElement("div", { className: "xray-card-header" },
                                React.createElement("div", { className: "xray-entity-icon " + (entity.type || 'other') }, xrayTypeMap[entity.type] || '•'),
                                React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                                    React.createElement("div", { className: "xray-entity-name" }, entity.name),
                                    React.createElement("div", { className: "xray-entity-type-pill " + (entity.type || 'other') }, entity.type || 'other'))),
                            React.createElement("div", { className: "xray-entity-desc" }, entity.description));
                    })));
            return React.createElement("div", { className: "xray-panel" + (isXRayOpen ? " open" : "") },
                React.createElement("div", { className: "xray-sheet" + (isXRayOpen ? " open" : "") },
                    React.createElement("div", { className: "xray-handle-zone", onClick: function() { setIsXRayOpen(false); } },
                        React.createElement("div", { className: "xray-handle-bar" })),
                    React.createElement("div", { className: "xray-header" },
                        React.createElement("div", { className: "xray-title-row" },
                            React.createElement("div", { className: "xray-title" },
                                React.createElement("div", { className: "xray-icon-badge" },
                                    React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "rgba(56,189,248,0.9)", strokeWidth: "2" },
                                        React.createElement("circle", { cx: "11", cy: "11", r: "8" }),
                                        React.createElement("path", { d: "m21 21-4.35-4.35" }),
                                        React.createElement("path", { d: "M8 11h6" }),
                                        React.createElement("path", { d: "M11 8v6" }))),
                                React.createElement("div", null,
                                    React.createElement("div", { className: "xray-badge-label" }, "Kindle-Style"),
                                    React.createElement("div", { className: "xray-heading" }, "X-Ray"))),
                            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px" } },
                                React.createElement("div", { className: "xray-page-note" }, "Folio " + (currentPage + 1)),
                                React.createElement("button", { className: "xray-close-btn", onClick: function() { setIsXRayOpen(false); } },
                                    React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5" },
                                        React.createElement("path", { d: "M18 6 6 18" }),
                                        React.createElement("path", { d: "m6 6 12 12" }))))),
                        xrayFilterBar),
                    React.createElement("div", { className: "xray-scroll" }, xrayBody)));
        })(),
        React.createElement("div", { className: "flex-grow pt-36 pb-20 manuscript-container" },
            React.createElement("div", { ref: containerRef, className: "manuscript-text serif text-xl llama-scout-processed-view ".concat(getThemeTextClass()), style: { lineHeight: lineSpacing } }, renderContent())),
        React.createElement("div", { className: "fixed bottom-6 left-0 right-0 z-40 flex justify-center px-3", style: { willChange: 'transform', transform: 'translateZ(0)', isolation: 'isolate' } },
            React.createElement("div", { className: "dock-glow-wrap" + (activeGlowBtn ? ' dg-active' : ''), style: { flexDirection: 'column', alignItems: 'center' } },
                React.createElement("div", { className: "dock-poda-layer dock-poda-glow" }),
                React.createElement("div", { className: "dock-poda-layer dock-poda-dark" }),
                React.createElement("div", { className: "dock-poda-layer dock-poda-dark" }),
                React.createElement("div", { className: "dock-poda-layer dock-poda-dark" }),
                React.createElement("div", { className: "dock-poda-layer dock-poda-white" }),
                React.createElement("div", { className: "dock-poda-layer dock-poda-border" }),
                React.createElement("div", { style: { position:'relative', display:'flex', flexDirection:'column', alignItems:'center', zIndex:1 } },

                    /* ── Main dock ── */
                    React.createElement("div", { className: "glass-dock px-2 py-1.5 rounded-full flex items-center gap-1 shadow-2xl border border-white/10" },
                    React.createElement("button", { onClick: function () { return currentPage > 0 && setCurrentPage(function (p) { return p - 1; }); }, disabled: currentPage === 0, className: "flex items-center justify-center w-9 h-9 shrink-0 rounded-full transition-all disabled:opacity-20 ".concat(readerTheme === 'light' ? 'text-slate-600 hover:bg-black/5' : 'text-slate-400 hover:text-white hover:bg-white/10') },
                        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                            React.createElement("path", { d: "m15 18-6-6 6-6" }))),
                    React.createElement("div", { className: "w-px h-5 bg-white/10 shrink-0" }),
                    React.createElement("button", { onClick: function () { triggerGlow('customizer'); setIsCustomizerOpen(true); }, disabled: pdfFile && !extractedPages[currentPage], className: "flex items-center justify-center w-10 h-10 shrink-0 rounded-full transition-all ".concat(readerTheme === 'light' ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30') },
                        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5" },
                            React.createElement("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                            React.createElement("polyline", { points: "7 10 12 15 17 10" }),
                            React.createElement("line", { x1: "12", x2: "12", y1: "15", y2: "3" }))),
                    React.createElement("button", { onClick: function () { triggerGlow('pdf'); pdfFile && setIsOriginalPdfOpen(true); }, disabled: !pdfFile, className: "flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-lg disabled:opacity-50 disabled:grayscale" },
                        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5" },
                            React.createElement("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
                            React.createElement("polyline", { points: "14 2 14 8 20 8" }),
                            React.createElement("line", { x1: "16", y1: "13", x2: "8", y2: "13" }),
                            React.createElement("line", { x1: "16", y1: "17", x2: "8", y2: "17" }))),
                    React.createElement("button", { onClick: function () { triggerGlow('max'); setIsMaxDrawerOpen(true); }, className: "flex items-center justify-center w-10 h-10 shrink-0 rounded-full transition-all ".concat(readerTheme === 'light' ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30') },
                        React.createElement("span", { className: "text-[10px] font-black" }, "MAX")),
                    React.createElement("button", {
                        onClick: function() { triggerGlow('intl'); toggleInterlinear(); },
                        className: "intl-btn" + (interlinearMode ? " active" : ""),
                        title: "Interlinear — বাংলা অনুবাদ"
                    },
                        interlinearLoading && interlinearMode
                            ? React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", className: "animate-spin" },
                                React.createElement("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" }))
                            : React.createElement("svg", { width: "17", height: "17", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                                React.createElement("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
                                React.createElement("line", { x1: "3", y1: "10", x2: "15", y2: "10", strokeDasharray: "2 1", opacity: "0.5" }),
                                React.createElement("line", { x1: "3", y1: "14", x2: "21", y2: "14" }),
                                React.createElement("line", { x1: "3", y1: "18", x2: "15", y2: "18", strokeDasharray: "2 1", opacity: "0.5" })),
                        React.createElement("span", { className: "intl-btn-label" }, "বাংলা")),
                    React.createElement("button", {
                        onClick: function() { triggerGlow('lens'); toggleEntityHighlight(); },
                        className: "bino-btn" + (entityHighlightMode ? " active" : ""),
                        title: "Entity Highlight — Characters & Places"
                    },
                        entityScanLoading && entityHighlightMode
                            ? React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", className: "animate-spin" },
                                React.createElement("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" }))
                            : React.createElement("svg", { width: "17", height: "17", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                                React.createElement("circle", { cx: "6", cy: "12", r: "3" }),
                                React.createElement("circle", { cx: "18", cy: "12", r: "3" }),
                                React.createElement("path", { d: "M9 12h6" }),
                                React.createElement("path", { d: "M3 12H2" }),
                                React.createElement("path", { d: "M22 12h-1" })),
                        React.createElement("span", { className: "bino-btn-label" }, "LENS")),
                    React.createElement("div", { className: "w-px h-5 bg-white/10 shrink-0" }),
                    React.createElement("button", { onClick: function () { return currentPage < totalPages - 1 && setCurrentPage(function (p) { return p + 1; }); }, disabled: currentPage === totalPages - 1, className: "flex items-center justify-center w-9 h-9 shrink-0 rounded-full transition-all disabled:opacity-20 ".concat(readerTheme === 'light' ? 'text-slate-600 hover:bg-black/5' : 'text-slate-400 hover:text-white hover:bg-white/10') },
                        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                            React.createElement("path", { d: "m9 18 6-6-6-6" })))))))));
}
