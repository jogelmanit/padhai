# Edu AI — prototype with a server-side Groq proxy

A personalised-tutor landing page with a working chat demo. The chat talks to
**Groq** (`openai/gpt-oss-120b` by default) through a tiny Express server, so
your API key lives only on the server — it's never sent to, or visible in,
the browser.

