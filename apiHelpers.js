// ============================================================
// API HELPERS
// geminiGenerate() — Gemini REST API wrapper
// ============================================================

function geminiGenerate(apiKey_1, model_1, contents_1) {
    return __awaiter(this, arguments, void 0, function (apiKey, model, contents, config) {
        var url, body, proxyBody, res, err, data, text, audioBase64;
        if (config === void 0) { config = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "/api/proxy/gemini";
                    body = {
                        contents: Array.isArray(contents) ? contents.map(function (c) { return typeof c === 'string' ? { parts: [{ text: c }], role: 'user' } : c; }) : [{ parts: [{ text: contents }], role: 'user' }],
                        generationConfig: { maxOutputTokens: config.maxOutputTokens || 8192 }
                    };
                    if (config.systemInstruction)
                        body.systemInstruction = { parts: [{ text: config.systemInstruction }] };
                    if (config.temperature !== undefined)
                        body.generationConfig.temperature = config.temperature;
                    if (config.responseMimeType)
                        body.generationConfig.responseMimeType = config.responseMimeType;
                    if (config.responseModalities)
                        body.generationConfig.responseModalities = config.responseModalities;
                    if (config.speechConfig)
                        body.generationConfig.speechConfig = config.speechConfig;
                    proxyBody = { model: model, contents: body.contents, config: body.generationConfig };
                    if (body.systemInstruction) proxyBody.systemInstruction = body.systemInstruction;
                    return [4 /*yield*/, fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(proxyBody) })];
                case 1:
                    res = _a.sent();
                    if (!!res.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, res.text()];
                case 2:
                    err = _a.sent();
                    throw new Error("Gemini API ".concat(res.status, ": ").concat(err));
                case 3: return [4 /*yield*/, res.json()];
                case 4:
                    data = _a.sent();
                    text = ((data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) ? data.candidates[0].content.parts.filter(function (p) { return p.text; }).map(function (p) { return p.text; }).join('') : '') || '';
                    audioBase64 = ((data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) ? ((data.candidates[0].content.parts.find(function (p) { return p.inlineData; }) || {}).inlineData || {}).data : undefined);
                    return [2 /*return*/, { text: text, audioBase64: audioBase64, candidates: data.candidates }];
            }
        });
    });
}
// ============================================================
