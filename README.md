# MaxOfPdf - AI-Powered PDF Reader

A static web application for reading and analyzing PDFs with AI-powered features.

## Deployment

This is a **static site** with no backend server. Deploy directly to Netlify:

1. Connect your GitLab repository to Netlify
2. Set build command: `echo 'Static site - no build required'`
3. Set publish directory: `.` (root)
4. Add environment variables:
   - `GEMINI_API_KEY` - Your Google Gemini API key

## Features

- PDF OCR scanning with Gemini AI
- Text analysis and vocabulary lookup
- Page rewriting with multiple complexity levels
- Interlinear translations
- Entity highlighting and recognition
- X-Ray mode for key entities
- Auto-scroll and TTS support

## Architecture

- **Frontend**: React-based SPA
- **API**: Direct calls to Google Gemini API (no backend proxy)
- **Hosting**: Static site (Netlify, Vercel, GitHub Pages, etc.)

## Local Development

Simply open `index.html` in a browser or use a local HTTP server:

```bash
python -m http.server 8000
# or
npx http-server
```

Then visit `http://localhost:8000`

