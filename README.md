# Edu AI — prototype with a server-side Groq proxy

A personalised-tutor landing page with a working chat demo. The chat talks to
**Groq** (`openai/gpt-oss-120b` by default) through a tiny Express server, so
your API key lives only on the server — it's never sent to, or visible in,
the browser.

## Project structure

```
eduai-server/
├── server.js          # Express server + /api/chat proxy to Groq
├── package.json
├── .env                # your real GROQ_API_KEY lives here (git-ignored)
├── .env.example         # template to copy from
├── index.html          # the site
└── assets/
    ├── style.css
    └── script.js       # calls /api/chat instead of an external API directly
```

## Run it locally

```bash
npm install
npm start
```

Then open http://localhost:3000 — the chat demo works immediately, no
settings panel, no key prompt.

`.env` already has a `GROQ_API_KEY` filled in. If you ever need to change it
or the model, edit `.env`:

```
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
PORT=3000
```

Groq's older Llama chat models (`llama-3.3-70b-versatile`,
`llama-3.1-8b-instant`) have been deprecated — `openai/gpt-oss-120b` is the
current general-purpose recommendation. Check the Groq console/docs if you
want to swap models.

## Deploying

Because there's now a Node backend, this needs a host that can run a
persistent server — plain static hosting (GitHub Pages, Netlify static,
etc.) won't work anymore. Good options:

- **Replit** — import this project, set `GROQ_API_KEY` in the Secrets tab
  (not committed to the repo), and run.
- **Render / Railway / Fly.io** — connect the repo, set `GROQ_API_KEY` as an
  environment variable in their dashboard, deploy.

Wherever you deploy: set `GROQ_API_KEY` as a platform secret/environment
variable rather than committing `.env`. The `.gitignore` already excludes
`.env` from version control — don't remove that.

## Why this matters

The original version of this prototype asked visitors to paste their own
API key into the page, stored in `localStorage`. That's fine for a purely
local, single-user demo, but it means the key is visible in browser dev
tools to anyone using the page. This version fixes that: the key stays
server-side, and the browser only ever talks to your own `/api/chat`
endpoint.
