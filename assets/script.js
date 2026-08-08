(() => {
  "use strict";

  const CHAT_ENDPOINT = "/api/chat";

  const chatLog = document.getElementById("chatLog");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");
  const resetChat = document.getElementById("resetChat");
  const chatMeta = document.getElementById("chatMeta");

  let history = []; // { role: 'user' | 'assistant', content: string }

  // ---------- chat rendering ----------
  function addMessage(role, text) {
    const row = document.createElement("div");
    row.className = `msg msg-${role === "user" ? "user" : "ai"}`;
    row.innerHTML = `
      <span class="msg-avatar">${role === "user" ? "•" : "✦"}</span>
      <div class="msg-bubble"></div>
    `;
    row.querySelector(".msg-bubble").textContent = text;
    chatLog.appendChild(row);
    chatLog.scrollTop = chatLog.scrollHeight;
    return row;
  }

  function addError(text) {
    const row = document.createElement("div");
    row.className = "msg msg-ai msg-error";
    row.innerHTML = `<span class="msg-avatar">!</span><div class="msg-bubble"></div>`;
    row.querySelector(".msg-bubble").textContent = text;
    chatLog.appendChild(row);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function addTyping() {
    const row = document.createElement("div");
    row.className = "msg msg-ai msg-typing";
    row.innerHTML = `
      <span class="msg-avatar">✦</span>
      <div class="msg-bubble">
        <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
      </div>`;
    chatLog.appendChild(row);
    chatLog.scrollTop = chatLog.scrollHeight;
    return row;
  }

  // ---------- call our own server, which calls Groq with the server-held key ----------
  async function askEduAI(userText) {
    history.push({ role: "user", content: userText });
    const typingRow = addTyping();
    sendBtn.disabled = true;
    chatMeta.textContent = "thinking…";

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();
      typingRow.remove();

      if (!res.ok) {
        addError(`Edu AI couldn't reach the model: ${data.error || `Request failed (${res.status})`}`);
        history.pop();
        chatMeta.textContent = "";
        return;
      }

      history.push({ role: "assistant", content: data.reply });
      addMessage("ai", data.reply);
      chatMeta.textContent = data.model || "";
    } catch (err) {
      typingRow.remove();
      history.pop();
      addError("Couldn't reach the Edu AI server. Make sure the server is running (npm start) and check your internet connection.");
      chatMeta.textContent = "";
    } finally {
      sendBtn.disabled = false;
    }
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    addMessage("user", text);
    chatInput.value = "";
    chatInput.style.height = "auto";
    askEduAI(text);
  });

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatForm.requestSubmit();
    }
  });

  chatInput.addEventListener("input", () => {
    chatInput.style.height = "auto";
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + "px";
  });

  resetChat.addEventListener("click", () => {
    history = [];
    chatLog.innerHTML = "";
    addMessage("ai", "Fresh start — what would you like to learn or get unstuck on?");
    chatMeta.textContent = "";
  });

  // ---------- scroll reveal ----------
  const revealTargets = document.querySelectorAll(".section-inner, .hero-panel");
  if ("IntersectionObserver" in window) {
    revealTargets.forEach((el) => (el.style.opacity = "0.001"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.transition = "opacity .6s ease, transform .6s ease";
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    revealTargets.forEach((el) => {
      el.style.transform = "translateY(14px)";
      io.observe(el);
    });
  }
})();
