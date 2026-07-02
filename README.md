# MaxOfPdf

A premium PDF and text reader with AI-powered features (OCR/scanning, restructuring, TTS/Live Audio) built on the Gemini API.

The app is a single self-contained static page (`index.html`) plus two small Vercel serverless functions in `/api` that proxy calls to the Gemini API, so your API key is **never sent to the browser**.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel: **Add New → Project**, import the repo, and click **Deploy**. No build configuration is needed — it's detected automatically.
3. In **Project → Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` — your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey). You can set multiple keys as a comma-separated list (`key1,key2`) for automatic rotation on rate limits.
4. Redeploy after adding the env var (Vercel doesn't pick up new env vars on already-built deployments).

Or use the one-click button (replace the URL below with your own repo once it's on GitHub):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_GITHUB_REPO_URL&env=GEMINI_API_KEY&envDescription=Gemini%20API%20key%20from%20Google%20AI%20Studio&envLink=https://aistudio.google.com/apikey&project-name=maxofpdf&repository-name=maxofpdf)

## Project structure

```
index.html              The entire app (UI, styles, and client logic — self-contained)
manifest.json, sw.js     PWA manifest + service worker
icon-*.png               PWA icons
api/gemini.js            Serverless proxy: POST /api/gemini/:model/generateContent
api/gemini-ws-token.js   Serverless proxy: GET /api/gemini-ws-token (Live Audio feature)
server.js                Optional local dev server (not used on Vercel)
vercel.json              Routing + function config for Vercel
```

## Running locally

```bash
npm install
GEMINI_API_KEY=your_key npm start
# open http://localhost:5000
```

## Notes

- The Live Audio (streaming TTS) feature opens a WebSocket directly from the browser to Google's API, which means your Gemini key is visible on that connection. If you use this feature, consider creating a separate, lower-privilege key for it.
- Vercel's Serverless Functions have a request body limit of ~4.5 MB; very large single requests (e.g. huge embedded images) may need to be sent in smaller batches. The reader already paginates PDF pages to stay well under this.
