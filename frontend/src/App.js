import { useState, useRef, useEffect } from "react";

const BOT_NAME = "AI Assistant";

function TypingIndicator() {
  return (
    <div className="message-row bot">
      <div className="avatar bot-avatar">AI</div>
      <div className="bubble bot-bubble typing-bubble">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`message-row ${isUser ? "user" : "bot"}`}>
      {!isUser && <div className="avatar bot-avatar">AI</div>}
      <div className={`bubble ${isUser ? "user-bubble" : "bot-bubble"}`}>
        <pre className="message-text">{msg.content}</pre>
      </div>
      {isUser && <div className="avatar user-avatar">You</div>}
    </div>
  );
}

function App() {
  const [messages, setMessages] = useState([
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/agent/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: trimmed }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: data.result },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "⚠️ Something went wrong. Please check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e) => {
    setInput(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:        #0b0d18;
          --surface:   #12152a;
          --surface2:  #1a1e35;
          --border:    rgba(255,255,255,0.07);
          --accent1:   #a78bfa;
          --accent2:   #60a5fa;
          --accent3:   #93c5fd;
          --text:      #e2e8f0;
          --muted:     #64748b;
          --user-bg:   #1e2340;
          --bot-bg:    #161929;
          --send-bg:   linear-gradient(135deg, #7c3aed, #3b82f6);
          --radius:    14px;
          --font:      'DM Sans', sans-serif;
          --font-hero: 'Syne', sans-serif;
        }

        html, body, #root {
          height: 100%;
          background: var(--bg);
          color: var(--text);
          font-family: var(--font);
          font-size: 15px;
          line-height: 1.6;
        }

        /* ── LAYOUT ── */
        .app {
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-width: 800px;
          margin: 0 auto;
        }

        /* ── HEADER ── */
        .header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 24px;
          border-bottom: 1px solid var(--border);
          background: rgba(11,13,24,0.85);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-logo {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: var(--send-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .header-title {
          font-family: var(--font-hero);
          font-size: 18px;
          font-weight: 800;
          background: linear-gradient(90deg, var(--accent1), var(--accent2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-status {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--muted);
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 6px #34d399aa;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* ── MESSAGES ── */
        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          scrollbar-width: thin;
          scrollbar-color: var(--surface2) transparent;
        }

        .messages::-webkit-scrollbar { width: 5px; }
        .messages::-webkit-scrollbar-track { background: transparent; }
        .messages::-webkit-scrollbar-thumb { background: var(--surface2); border-radius: 4px; }

        .message-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          animation: fadeUp 0.25s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .message-row.user { flex-direction: row-reverse; }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          letter-spacing: 0.03em;
        }

        .bot-avatar {
          background: linear-gradient(135deg, #7c3aed, #3b82f6);
          color: white;
        }

        .user-avatar {
          background: var(--surface2);
          color: var(--accent3);
          border: 1px solid var(--border);
        }

        .bubble {
          max-width: 68%;
          padding: 12px 16px;
          border-radius: var(--radius);
          font-size: 14.5px;
          line-height: 1.65;
        }

        .bot-bubble {
          background: var(--bot-bg);
          border: 1px solid var(--border);
          border-bottom-left-radius: 4px;
        }

        .user-bubble {
          background: var(--user-bg);
          border: 1px solid rgba(167,139,250,0.15);
          border-bottom-right-radius: 4px;
          color: var(--text);
        }

        .message-text {
          white-space: pre-wrap;
          word-break: break-word;
          font-family: var(--font);
          font-size: inherit;
          margin: 0;
        }

        /* ── TYPING DOTS ── */
        .typing-bubble {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 14px 18px;
        }

        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--accent1);
          animation: bounce 1.2s infinite ease-in-out;
        }

        .dot:nth-child(1) { animation-delay: 0s; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }

        /* ── INPUT AREA ── */
        .input-area {
          padding: 16px 20px 20px;
          border-top: 1px solid var(--border);
          background: var(--bg);
        }

        .input-box {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 10px 12px 10px 16px;
          transition: border-color 0.2s;
        }

        .input-box:focus-within {
          border-color: rgba(167,139,250,0.4);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.08);
        }

        .input-box textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          font-family: var(--font);
          font-size: 14.5px;
          line-height: 1.6;
          resize: none;
          min-height: 24px;
          max-height: 160px;
          overflow-y: auto;
          scrollbar-width: thin;
        }

        .input-box textarea::placeholder {
          color: var(--muted);
        }

        .send-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          background: var(--send-bg);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: opacity 0.2s, transform 0.15s;
          opacity: 0.95;
        }

        .send-btn:hover:not(:disabled) { opacity: 1; transform: scale(1.06); }
        .send-btn:active:not(:disabled) { transform: scale(0.95); }
        .send-btn:disabled { opacity: 0.35; cursor: default; }

        .send-btn svg { display: block; }

        .input-hint {
          text-align: center;
          font-size: 11.5px;
          color: var(--muted);
          margin-top: 8px;
        }

        /* ── EMPTY STATE ── */
        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px 20px;
        }

        .empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          background: var(--send-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          box-shadow: 0 8px 32px rgba(124,58,237,0.3);
        }

        .empty-title {
          font-family: var(--font-hero);
          font-size: 22px;
          font-weight: 800;
          background: linear-gradient(90deg, var(--accent1), var(--accent2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .empty-sub {
          color: var(--muted);
          font-size: 14px;
          text-align: center;
          max-width: 340px;
        }

        .suggestion-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-top: 4px;
        }

        .chip {
          padding: 8px 14px;
          border-radius: 20px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text);
          font-size: 13px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }

        .chip:hover {
          border-color: rgba(167,139,250,0.4);
          background: var(--surface2);
        }
      `}</style>

      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header-logo">✦</div>
          <span className="header-title">AI Assistant</span>
          <div className="header-status">
            <div className="status-dot" />
            Online
          </div>
        </header>

        {/* Messages */}
        <div className="messages">
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="input-area">
          <div className="input-box">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Message AI Assistant..."
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              aria-label="Send"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 2L15 22L11 13L2 9L22 2Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <p className="input-hint">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </>
  );
}

export default App;

// import { useState } from "react";

// function App() {
//   const [input, setInput] = useState("");
//   const [response, setResponse] = useState("");

//   const sendRequest = async () => {
//     const res = await fetch("http://127.0.0.1:8000/agent/planner", {
//       method: "POST",
//       headers: {
//         "Content-Type" : "application/json"
//       },
//       body: JSON.stringify({user_input: input})
//     });

//     const data = await res.json();
//     setResponse(data.result);
//   };

//   return (
//     <div style = {{ padding: 40 }}>
//       <h2>Agentic AI</h2>
//       <textarea 
//       rows={4}
//       value={input}
//       onChange={(e) => setInput(e.target.value)}/>
//       <br />
//       <button onClick={sendRequest}>Send</button>
//       <pre>{response}</pre>
//     </div>
//   );
// }

// export default App;