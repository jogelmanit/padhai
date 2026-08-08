// Edu AI — server-side proxy
//
// Why this file exists: the browser used to call Z.AI directly with an API
// key typed into the page. That means anyone opening dev tools could steal
// the key. This server holds the key instead (in .env, never sent to the
// browser) and the frontend calls THIS server, which then calls Z.AI.

const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are Edu AI, a warm, patient personal tutor built for students of any age.
Your job: help the student truly understand, not just get an answer.

Rules:
- Explain in small, clear steps. Prefer everyday examples over jargon.
- Match your language and difficulty to how the student is writing to you.
- After an explanation, briefly check understanding with one short question or a 1-question mini quiz, unless they clearly just want a quick fact.
- If the student seems stuck, break the problem down further rather than repeating yourself.
- Keep answers focused — a few short paragraphs or a tight list, not a lecture.
- Never do a student's graded work verbatim; teach the method and let them apply it.`;

app.use(express.json());
app.use(express.static(path.join(__dirname))); // serves index.html + /assets

// POST /api/chat  { messages: [{role, content}, ...] }
app.post("/api/chat", async (req, res) => {
  if (!GROQ_API_KEY) {
    return res.status(500).json({
      error: "Server is missing GROQ_API_KEY. Add it to your .env file and restart the server.",
    });
  }

  const { messages } = req.body;
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "Request body must include a 'messages' array." });
  }

  try {
    const groqRes = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 1024,
      }),
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      const message = data?.error?.message || `Groq request failed (${groqRes.status})`;
      return res.status(groqRes.status).json({ error: message });
    }

    const reply = data?.choices?.[0]?.message?.content || "(No text in response.)";
    return res.json({ reply, model: GROQ_MODEL });
  } catch (err) {
    console.error("Groq proxy error:", err);
    return res.status(502).json({ error: "Couldn't reach Groq from the server. Check your internet connection and try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Edu AI server running at http://localhost:${PORT}`);
  if (!GROQ_API_KEY) {
    console.warn("⚠️  GROQ_API_KEY is not set. Add it to a .env file (see .env.example).");
  }
});
