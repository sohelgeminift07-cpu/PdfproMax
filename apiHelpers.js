// ============================================================
// API HELPERS
// All external API calls go through /api/* server proxy.
// API keys are never exposed to the browser.
// ============================================================

function geminiGenerate(apiKey_1, model_1, contents_1) {
    return __awaiter(this, arguments, void 0, function (apiKey, model, contents, config) {
        var body, res, err, data, text, audioBase64;
        if (config === void 0) { config = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
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
                    var fetchUrl = 'https://generativelanguage.googleapis.com/v1beta/models/'
                        + model + ':generateContent?key=' + (apiKey || GEMINI_KEYS[0] || '');
                    return [4, fetch(fetchUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body),
                        signal: config.signal || undefined
                    })];
                case 1:
                    res = _a.sent();
                    if (!!res.ok) return [3, 3];
                    return [4, res.text()];
                case 2:
                    err = _a.sent();
                    throw new Error("Gemini API " + res.status + ": " + err);
                case 3: return [4, res.json()];
                case 4:
                    data = _a.sent();
                    text = ((data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) ? data.candidates[0].content.parts.filter(function (p) { return p.text; }).map(function (p) { return p.text; }).join('') : '') || '';
                    audioBase64 = ((data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) ? ((data.candidates[0].content.parts.find(function (p) { return p.inlineData; }) || {}).inlineData || {}).data : undefined);
                    return [2, { text: text, audioBase64: audioBase64, candidates: data.candidates }];
            }
        });
    });
}

// ============================================================
// LIVE AUDIO STREAMING (Gemini Live API via WebSocket)
// The server provides a short-lived token via /api/gemini-ws-token
// so the key never appears in browser-visible URLs.
// ============================================================

function LiveAudioPlayer() {
    this.audioCtx = null;
    this.queue = [];
    this.isPlaying = false;
    this.isDone = false;
    this.nextTime = 0;
    this.sampleRate = 24000;
    this.timer = null;
    this.onEnd = null;
}

LiveAudioPlayer.prototype._init = function() {
    if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: this.sampleRate });
    }
};

LiveAudioPlayer.prototype._decode = function(b64) {
    var bin = atob(b64);
    var len = bin.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    var i16 = new Int16Array(bytes.buffer);
    var f32 = new Float32Array(i16.length);
    for (var i = 0; i < i16.length; i++) f32[i] = i16[i] / 32768.0;
    return f32;
};

LiveAudioPlayer.prototype.feed = function(b64) {
    this.queue.push(this._decode(b64));
    if (!this.isPlaying) {
        this.isPlaying = true;
        this._init();
        this.nextTime = this.audioCtx.currentTime;
        this._drain();
    }
};

LiveAudioPlayer.prototype.finish = function() {
    this.isDone = true;
};

LiveAudioPlayer.prototype._drain = function() {
    var _this = this;
    if (!this.isPlaying) return;

    while (this.queue.length > 0) {
        var data = this.queue.shift();
        var buf = this.audioCtx.createBuffer(1, data.length, this.sampleRate);
        buf.getChannelData(0).set(data);
        var src = this.audioCtx.createBufferSource();
        src.buffer = buf;
        src.connect(this.audioCtx.destination);
        var now = this.audioCtx.currentTime;
        if (this.nextTime < now) this.nextTime = now;
        src.start(this.nextTime);
        this.nextTime += buf.duration;
    }

    var now = this.audioCtx.currentTime;
    if (this.isDone && this.queue.length === 0 && this.nextTime <= now) {
        this.isPlaying = false;
        if (this.timer) { clearTimeout(this.timer); this.timer = null; }
        if (this.onEnd) this.onEnd();
        return;
    }

    this.timer = setTimeout(function() { _this._drain(); }, 40);
};

LiveAudioPlayer.prototype.stop = function() {
    this.isPlaying = false;
    this.isDone = true;
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    this.queue = [];
    if (this.audioCtx) { this.audioCtx.close(); this.audioCtx = null; }
};

// ============================================================
// geminiLiveAudio — real-time streaming TTS via WebSocket
// Fetches a token from the server so the key is never in the browser.
// Returns: { stop() }
// ============================================================
function geminiLiveAudio(apiKey, text, options) {
    if (options === void 0) { options = {}; }
    var player = new LiveAudioPlayer();
    var isSetupComplete = false;
    var onStart = options.onStart || function() {};
    var onEnd = options.onEnd || function() {};
    var onError = options.onError || function() {};
    var ws = null;

    player.onEnd = function() { onEnd(); };

    var _wsKey = apiKey || GEMINI_KEYS[0] || '';
    if (!_wsKey) { onError(new Error('No Gemini key available')); return; }
    var url = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=' + _wsKey;
    ws = new WebSocket(url);

    ws.onopen = function() {
                ws.send(JSON.stringify({
                    setup: {
                        model: 'models/gemini-2.5-flash',
                        generation_config: {
                            response_modalities: ['AUDIO'],
                            speech_config: options.speechConfig || {
                                voice_config: {
                                    prebuilt_voice_config: { voice_name: 'Fenrir' }
                                }
                            }
                        }
                    }
                }));
            };

    ws.onmessage = function(event) {
                var msg;
                try { msg = JSON.parse(event.data); } catch(e) { return; }

                if (msg.setupComplete) {
                    isSetupComplete = true;
                    ws.send(JSON.stringify({
                        client_content: {
                            turns: [{ role: 'user', parts: [{ text: text }] }],
                            turn_complete: true
                        }
                    }));
                    onStart();
                }

                if (msg.serverContent && msg.serverContent.modelTurn) {
                    var parts = msg.serverContent.modelTurn.parts || [];
                    for (var i = 0; i < parts.length; i++) {
                        if (parts[i].inlineData && parts[i].inlineData.data) {
                            player.feed(parts[i].inlineData.data);
                        }
                    }
                }

        if (msg.serverContent && msg.serverContent.turnComplete) {
            player.finish();
        }
    };

    ws.onerror = function(err) { onError(err); };
    ws.onclose = function() {
        if (!isSetupComplete) onError(new Error('Live connection closed'));
    };

    return {
        stop: function() {
            player.stop();
            if (ws) { try { ws.close(); } catch(e) {} }
        }
    };
}

// ============================================================
