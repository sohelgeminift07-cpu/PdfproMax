// ============================================================
// VOCAB TAB
// ============================================================
function VocabTab() {
    var _a = useState([]), vocab = _a[0], setVocab = _a[1];
    var _b = useState('all'), filter = _b[0], setFilter = _b[1];
    var _c = useState(''), search = _c[0], setSearch = _c[1];
    var _d = useState(false), showClearConfirm = _d[0], setShowClearConfirm = _d[1];
    var _e = useState(null), deleteTarget = _e[0], setDeleteTarget = _e[1];

    var loadVocab = function() {
        try {
            var raw = localStorage.getItem('maxofpdf_vocab') || '{}';
            var store = JSON.parse(raw);
            var items = Object.values(store).sort(function(a, b) { return (b.ts || b.timestamp || 0) - (a.ts || a.timestamp || 0); });
            setVocab(items);
        } catch(e) { setVocab([]); }
    };

    useEffect(function() { loadVocab(); }, []);

    /* Reload whenever localStorage changes (new word added from reader) */
    useEffect(function() {
        var onStorage = function() { loadVocab(); };
        window.addEventListener('maxofpdf_vocab_updated', onStorage);
        return function() { window.removeEventListener('maxofpdf_vocab_updated', onStorage); };
    }, []);

    var entityColor = function(type) {
        if (type === 'person') return { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', text: '#a5b4fc', dot: '#6366f1' };
        if (type === 'place') return { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', text: '#6ee7b7', dot: '#10b981' };
        if (type === 'org') return { bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.22)', text: '#fca5a5', dot: '#ef4444' };
        if (type === 'concept') return { bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.22)', text: '#fcd34d', dot: '#f59e0b' };
        if (type === 'term') return { bg: 'rgba(56,189,248,0.10)', border: 'rgba(56,189,248,0.22)', text: '#7dd3fc', dot: '#0ea5e9' };
        return { bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.18)', text: '#94a3b8', dot: '#64748b' };
    };

    var handleDeleteWord = function(wordKey) {
        try {
            var raw = localStorage.getItem('maxofpdf_vocab') || '{}';
            var store = JSON.parse(raw);
            delete store[wordKey];
            localStorage.setItem('maxofpdf_vocab', JSON.stringify(store));
        } catch(e) {}
        setDeleteTarget(null);
        loadVocab();
    };

    var handleClearAll = function() {
        try { localStorage.removeItem('maxofpdf_vocab'); } catch(e) {}
        setVocab([]);
        setShowClearConfirm(false);
    };

    var filtered = vocab.filter(function(v) {
        var matchFilter = filter === 'all' || v.entityType === filter || (filter === 'other' && (!v.entityType || v.entityType === 'other' || v.entityType === 'concept'));
        var matchSearch = !search || (v.word && v.word.toLowerCase().includes(search.toLowerCase())) || (v.meaning && v.meaning.toLowerCase().includes(search.toLowerCase()));
        return matchFilter && matchSearch;
    });

    var counts = { person: 0, place: 0, org: 0, concept: 0, term: 0, other: 0 };
    vocab.forEach(function(v) { var t = v.entityType || 'other'; if (counts[t] !== undefined) counts[t]++; else counts.other++; });

    var statTabs = [
        { label: 'All', val: vocab.length, color: '#e2e8f0', bg: 'rgba(255,255,255,0.04)', tab: 'all' },
        { label: 'People', val: counts.person, color: '#a5b4fc', bg: 'rgba(99,102,241,0.08)', tab: 'person' },
        { label: 'Places', val: counts.place, color: '#6ee7b7', bg: 'rgba(16,185,129,0.08)', tab: 'place' },
        { label: 'Concepts', val: counts.concept + counts.other, color: '#fcd34d', bg: 'rgba(245,158,11,0.08)', tab: 'other' },
    ];

    return React.createElement("div", { className: "animate-in fade-in", style: { maxWidth: '680px' } },
        /* Confirm clear all overlay */
        showClearConfirm && React.createElement("div", { style: { position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)' } },
            React.createElement("div", { style: { background: '#0f1218', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '20px', padding: '28px', maxWidth: '320px', width: '90%', textAlign: 'center' } },
                React.createElement("div", { style: { fontSize: '28px', marginBottom: '12px' } }, '🗑️'),
                React.createElement("div", { style: { fontSize: '15px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' } }, 'Delete all vocab?'),
                React.createElement("div", { style: { fontSize: '12px', color: 'rgba(148,163,184,0.6)', marginBottom: '20px' } }, 'This will permanently remove all ' + vocab.length + ' saved words.'),
                React.createElement("div", { style: { display: 'flex', gap: '10px' } },
                    React.createElement("button", { onClick: function() { setShowClearConfirm(false); }, style: { flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(148,163,184,0.7)', fontWeight: 700, fontSize: '13px', cursor: 'pointer' } }, 'Cancel'),
                    React.createElement("button", { onClick: handleClearAll, style: { flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'rgba(239,68,68,0.85)', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' } }, 'Delete All')
                )
            )
        ),
        /* Confirm delete single word overlay */
        deleteTarget && React.createElement("div", { style: { position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)' } },
            React.createElement("div", { style: { background: '#0f1218', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', padding: '24px', maxWidth: '300px', width: '90%', textAlign: 'center' } },
                React.createElement("div", { style: { fontSize: '14px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' } }, 'Remove word?'),
                React.createElement("div", { style: { fontSize: '16px', fontWeight: 800, color: '#fcd34d', fontFamily: 'Noto Serif Bengali, serif', marginBottom: '18px', padding: '8px 14px', background: 'rgba(245,158,11,0.08)', borderRadius: '10px' } }, deleteTarget.word),
                React.createElement("div", { style: { display: 'flex', gap: '10px' } },
                    React.createElement("button", { onClick: function() { setDeleteTarget(null); }, style: { flex: 1, padding: '11px', borderRadius: '11px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(148,163,184,0.7)', fontWeight: 700, fontSize: '12px', cursor: 'pointer' } }, 'Cancel'),
                    React.createElement("button", { onClick: function() { handleDeleteWord(deleteTarget.key); }, style: { flex: 1, padding: '11px', borderRadius: '11px', border: 'none', background: 'rgba(239,68,68,0.8)', color: '#fff', fontWeight: 700, fontSize: '12px', cursor: 'pointer' } }, 'Remove')
                )
            )
        ),
        /* Stat tabs */
        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '16px' } },
            statTabs.map(function(s) {
                return React.createElement("button", { key: s.label, onClick: function() { setFilter(s.tab); }, style: { background: filter === s.tab ? s.bg : 'rgba(255,255,255,0.02)', border: '1px solid ' + (filter === s.tab ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'), borderRadius: '14px', padding: '12px 8px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' } },
                    React.createElement("div", { style: { fontSize: '24px', fontWeight: 800, color: s.color, fontFamily: 'Playfair Display, serif', lineHeight: 1 } }, s.val),
                    React.createElement("div", { style: { fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(100,120,160,0.5)', marginTop: '4px' } }, s.label)
                );
            })
        ),
        /* Search */
        vocab.length > 0 && React.createElement("div", { style: { marginBottom: '12px' } },
            React.createElement("input", { type: 'text', placeholder: 'Search words or meanings...', value: search, onChange: function(e) { setSearch(e.target.value); }, style: { width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 14px', color: '#e2e8f0', fontSize: '13px', outline: 'none', fontFamily: 'inherit' } })
        ),
        /* Empty state */
        vocab.length === 0
            ? React.createElement("div", { style: { textAlign: 'center', padding: '60px 20px' } },
                React.createElement("div", { style: { fontSize: '3rem', opacity: 0.1, marginBottom: '12px' } }, '✦'),
                React.createElement("p", { style: { fontFamily: 'Merriweather, serif', fontStyle: 'italic', color: 'rgba(100,116,139,0.5)', fontSize: '14px' } }, 'No words yet.'),
                React.createElement("p", { style: { fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(100,116,139,0.3)', marginTop: '6px' } }, 'Select & analyze text while reading')
              )
            : React.createElement("div", null,
                React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' } },
                    React.createElement("span", { style: { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(100,120,160,0.4)' } }, filtered.length + ' of ' + vocab.length + ' words'),
                    React.createElement("button", { onClick: function() { setShowClearConfirm(true); }, style: { fontSize: '10px', color: 'rgba(239,68,68,0.55)', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, padding: '5px 10px' } }, '🗑 Clear All')
                ),
                filtered.length === 0
                    ? React.createElement("p", { style: { textAlign: 'center', padding: '30px', color: 'rgba(100,116,139,0.4)', fontSize: '13px' } }, 'No matches')
                    : React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '7px' } },
                        filtered.map(function(v, i) {
                            var wordKey = (v.word || '').trim().toLowerCase();
                            var c = entityColor(v.entityType);
                            return (function(wk, vWord) {
                                return React.createElement("div", { key: wk + i, style: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '13px 15px', borderRadius: '14px', background: c.bg, border: '1px solid ' + c.border, position: 'relative' } },
                                    React.createElement("div", { style: { width: '6px', height: '6px', borderRadius: '50%', background: c.dot, flexShrink: 0, marginTop: '8px', boxShadow: '0 0 6px ' + c.dot } }),
                                    React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                                        React.createElement("div", { style: { display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' } },
                                            React.createElement("span", { style: { fontSize: '14px', fontWeight: 700, color: '#e2e8f0', fontFamily: 'Noto Serif Bengali, Merriweather, serif' } }, vWord),
                                            React.createElement("span", { style: { fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.text, opacity: 0.75 } }, v.entityType || 'concept')
                                        ),
                                        (v.m || v.meaning) && React.createElement("div", { style: { fontSize: '12px', color: 'rgba(148,163,184,0.8)', lineHeight: 1.5, fontFamily: 'Noto Serif Bengali, serif' } }, v.m || v.meaning)
                                    ),
                                    React.createElement("button", { onClick: function() { setDeleteTarget({ word: vWord, key: wk }); }, style: { width: '28px', height: '28px', borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.1)', color: 'rgba(239,68,68,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px' } }, '✕')
                                );
                            })(wordKey, v.word);
                        })
                      )
              )
    );
}
