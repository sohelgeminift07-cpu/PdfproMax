// ============================================================
// HISTORY MODAL
// ============================================================
function HistoryModal(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, history = _a.history, onSelect = _a.onSelect;
    if (!isOpen)
        return null;
    var fmt = function (ts) { return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(ts)); };
    return (React.createElement("div", { className: "fixed inset-0 z-[100] flex items-center justify-center px-4" },
        React.createElement("div", { className: "absolute inset-0 bg-black/80 backdrop-blur-sm", onClick: onClose }),
        React.createElement("div", { className: "relative w-full max-w-lg bg-[#0f0f11] rounded-[32px] border border-white/10 shadow-2xl p-8 animate-in zoom-in-95 max-h-[80vh] flex flex-col" },
            React.createElement("div", { className: "flex justify-between items-center mb-6 shrink-0" },
                React.createElement("div", null,
                    React.createElement("h3", { className: "display-serif text-2xl text-white" }, "History"),
                    React.createElement("p", { className: "text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1" }, "Previous Sessions")),
                React.createElement("button", { onClick: onClose, className: "p-2 bg-white/5 rounded-full hover:bg-white/10 text-slate-400" },
                    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                        React.createElement("path", { d: "M18 6 6 18" }),
                        React.createElement("path", { d: "m6 6 12 12" })))),
            React.createElement("div", { className: "flex-grow overflow-y-auto custom-scrollbar space-y-3 pr-2" }, history.length === 0 ? (React.createElement("div", { className: "text-center py-10 text-slate-600" },
                React.createElement("p", { className: "text-sm font-serif italic" }, "No history yet."))) : history.map(function (item) { return (React.createElement("button", { key: item.id, onClick: function () { return onSelect(item); }, className: "w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 transition-all group" },
                React.createElement("div", { className: "flex justify-between items-start mb-2" },
                    React.createElement("span", { className: "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ".concat(item.type === 'pdf' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20') }, item.type === 'pdf' ? 'PDF' : 'TEXT'),
                    React.createElement("span", { className: "text-[10px] text-slate-500 font-mono" }, fmt(item.timestamp))),
                React.createElement("h4", { className: "text-sm font-bold text-slate-200 group-hover:text-white truncate mb-1" }, item.title),
                item.type === 'pdf' && item.data.pdfRange && React.createElement("div", { className: "text-[10px] text-slate-500" },
                    "Range: ",
                    item.data.pdfRange.start,
                    "-",
                    item.data.pdfRange.end,
                    " \u2022 Last: Page ",
                    item.data.lastPageIndex + 1))); })))));
}
