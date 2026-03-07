# MaxOfPdf – Premium Reader

## Overview
A premium, AI-powered PDF reader web application. Single-page static app with features including:
- PDF upload and rendering (via PDF.js)
- Text highlighting and annotation
- KaTeX math rendering
- X-Ray entity analysis panel
- Interlinear translation mode
- Text-to-speech
- Service worker for offline caching

## Architecture
- **Type**: Pure static frontend (no backend)
- **Stack**: Vanilla HTML/CSS/JavaScript with React 17 loaded via CDN
- **Entry point**: `index.html` (6100+ lines, self-contained)
- **Static server**: `server.js` — simple Node.js HTTP server

## Project Structure
```
index.html      # Main app (all UI, logic, React components)
style.css       # Minimal global font size override
sw.js           # Service worker for offline caching
manifest.json   # PWA manifest
server.js       # Node.js static file server (port 5000)
```

## Running
- **Workflow**: "Start application" → `node server.js`
- **Port**: 5000 (0.0.0.0)
- **Deployment**: Static site, publicDir: "."
