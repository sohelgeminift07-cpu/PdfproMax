// ============================================================
// FORMATTED CONTENT
// ============================================================
// ============================================================
// FORMATTED CONTENT (for MaxDrawer)
// ============================================================
function FormattedContent(_a) {
    var content = _a.content;
    var lines = content.split('\n');
    var blocks = [];
    var renderInline = function (text) {
        var parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map(function (p, i) {
            if (p.startsWith('**') && p.endsWith('**')) {
                return React.createElement('mark', {
                    key: i,
                    style: {
                        background: 'rgba(34,197,94,0.22)',
                        color: '#4ade80',
                        borderRadius: '4px',
                        padding: '1px 5px',
                        fontWeight: 700,
                        fontStyle: 'normal',
                        border: '1px solid rgba(34,197,94,0.35)',
                        boxDecorationBreak: 'clone',
                        WebkitBoxDecorationBreak: 'clone',
                        letterSpacing: '0.01em',
                    }
                }, p.slice(2, -2));
            }
            return p;
        });
    };
    lines.forEach(function (line, i) {
        var t = line.trim();
        if (!t) return;
        /* Strip any headers/bullets the model occasionally still emits */
        t = t.replace(/^#{1,3}\s+/, '').replace(/^[-*•]\s+/, '').replace(/^---$/, '');
        if (!t) return;
        blocks.push(React.createElement('p', {
            key: i,
            style: {
                color: 'rgba(210,222,238,0.95)',
                lineHeight: 1.8,
                marginBottom: '8px',
                fontSize: '13.5px',
                fontFamily: 'inherit',
            }
        }, renderInline(t)));
    });
    return React.createElement('div', { style: { paddingTop: '2px' } }, blocks);
}
// ============================================================
// ANALYSIS MODAL
