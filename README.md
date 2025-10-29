<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Tcr2iIkbfBpmGmdETBBnMl-6oHLtjpDr

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy and configure environment variables

When deploying you must add the `GEMINI_API_KEY` to your hosting provider so the key stays server-side and never reaches the browser.

Vercel:

- In the Vercel dashboard go to your Project > Settings > Environment Variables.
- Add a variable named `GEMINI_API_KEY` with your Gemini API key as the value.
- Deploy. Serverless functions under `/api` will be able to access the key via `process.env.GEMINI_API_KEY`.

Netlify:

- In the Netlify dashboard go to Site settings > Build & deploy > Environment > Environment variables.
- Add a variable named `GEMINI_API_KEY` with your Gemini API key as the value.
- For Netlify Functions, you can place this file at `/netlify/functions/gemini.js` or use the `api/` folder with their adapter; functions will have access to `process.env.GEMINI_API_KEY`.

Security note: Do not commit your `.env.local` file or the API key to source control. The project includes an `.env.local` in local development only.
