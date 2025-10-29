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
2. Set the API key(s) in [.env.local](.env.local):
   - Para uma única chave: `GEMINI_API_KEY=sua-chave-aqui`
   - Para múltiplas chaves (separadas por vírgula): `GEMINI_API_KEYS=chave1,chave2,chave3`
   - O sistema aceita ambas as variáveis e irá rotacionar automaticamente entre múltiplas chaves
3. Run the app:
   `npm run dev`

## Deploy and configure environment variables

When deploying you must add the `GEMINI_API_KEY` or `GEMINI_API_KEYS` to your hosting provider so the key stays server-side and never reaches the browser.

**Sistema de Múltiplas Chaves:**
- O sistema suporta rotação automática de chaves
- Chaves em cooldown (após erros 429 ou auth) são automaticamente removidas da rotação temporariamente
- Concorrência limitada a 1 requisição por chave
- Usuários são informados de sua posição na fila quando todas as chaves estão em uso

Vercel:

- In the Vercel dashboard go to your Project > Settings > Environment Variables.
- Add a variable named `GEMINI_API_KEY` (para uma chave) or `GEMINI_API_KEYS` (para múltiplas, separadas por vírgula) with your Gemini API key(s) as the value.
- Deploy. Serverless functions under `/api` will be able to access the key via `process.env.GEMINI_API_KEY` or `process.env.GEMINI_API_KEYS`.

Netlify:

- In the Netlify dashboard go to Site settings > Build & deploy > Environment > Environment variables.
- Add a variable named `GEMINI_API_KEY` (para uma chave) or `GEMINI_API_KEYS` (para múltiplas, separadas por vírgula) with your Gemini API key(s) as the value.
- For Netlify Functions, you can place this file at `/netlify/functions/gemini.js` or use the `api/` folder with their adapter; functions will have access to `process.env.GEMINI_API_KEY` or `process.env.GEMINI_API_KEYS`.

Security note: Do not commit your `.env.local` file or the API key to source control. The project includes an `.env.local` in local development only.
