// // src/App.jsx
// import { useState, useRef } from "react";
// import { Mic, Send } from "lucide-react";
// import "./App.css"; // 👈 apna CSS file import karo

// function App() {
//   const [messages, setMessages] = useState([
//     {
//       role: "assistant",
//       content: "Hello! I am your Pregnancy Guide. How can I help you today?",
//     },
//   ]);
//   const [input, setInput] = useState("");
//   const [listening, setListening] = useState(false);

//   const recognitionRef = useRef(null);

//   // 🎤 Start / Stop Voice Recognition
//   const handleVoice = () => {
//     if (!("webkitSpeechRecognition" in window)) {
//       alert("Voice recognition not supported in this browser");
//       return;
//     }

//     if (!recognitionRef.current) {
//       recognitionRef.current = new window.webkitSpeechRecognition();
//       recognitionRef.current.lang = "en-US"; // ⚡ Urdu ke liye "ur-PK" bhi use kar sakte ho
//       recognitionRef.current.interimResults = false;
//       recognitionRef.current.onresult = (event) => {
//         const transcript = event.results[0][0].transcript;
//         setInput(transcript);
//       };
//     }

//     if (!listening) {
//       recognitionRef.current.start();
//       setListening(true);
//     } else {
//       recognitionRef.current.stop();
//       setListening(false);
//     }
//   };

//   // 📤 Send Message
//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const newMsg = { role: "user", content: input };
//     setMessages([...messages, newMsg]);
//     setInput("");

//     // 🟢 Call your backend API
//     try {
//       const res = await fetch("http://localhost:3000/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: input }),
//       });
//       const data = await res.json();

//       setMessages((prev) => [
//         ...prev,
//         { role: "assistant", content: data.reply },
//       ]);

//       // 🔊 Voice Output (optional)
//       const utterance = new SpeechSynthesisUtterance(data.reply);
//       utterance.lang = "en-US"; // Urdu ke liye "ur-PK"
//       speechSynthesis.speak(utterance);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div className="app-container">
//       {/* Header */}
//       <header className="header">🤰 Pregnant Woman AI Chatbot</header>

//       {/* Chat Area */}
//       <main className="chat-area">
//         {messages.map((msg, idx) => (
//           <div
//             key={idx}
//             className={`message ${msg.role === "user" ? "user" : "assistant"}`}
//           >
//             {msg.content}
//           </div>
//         ))}
//       </main>

//       {/* Input Area */}
//       <footer className="input-area">
//         <input
//           className="chat-input"
//           placeholder="Type your question..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//         />
//         <button
//           onClick={handleVoice}
//           className={`mic-btn ${listening ? "listening" : ""}`}
//         >
//           <Mic size={20} />
//         </button>
//         <button onClick={sendMessage} className="send-btn">
//           <Send size={18} className="send-icon" /> Send
//         </button>
//       </footer>
//     </div>
//   );
// }

// export default App;

import React, { useEffect, useRef, useState } from "react";
import "./styles.css";

/**
 * Pregnant Woman AI Chatbot - Frontend (React)
 * - Chat UI with left sidebar (like ChatGPT)
 * - Voice input via Web Speech API (speech-to-text)
 * - TTS via SpeechSynthesis
 * - Responsive: sidebar collapses on small screens
 *
 * Connect backend: POST /chat { message } -> { reply }
 */

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      role: "assistant",
      content:
        "Assalamualaikum! Main aapka Pregnancy Guide hoon. Aap apna sawal type ya bol ke poch saktay hain.",
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [typing, setTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lang, setLang] = useState("ur-PK"); // default Urdu for TTS/ASR if available
  const messagesRef = useRef(null);
  const recognitionRef = useRef(null);

  // Scroll to bottom on messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, typing]);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = lang === "ur-PK" ? "ur-PK" : "en-US";
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };
    recognitionRef.current.onend = () => {
      setListening(false);
    };
    recognitionRef.current.onerror = (e) => {
      console.error("SpeechRecognition error", e);
      setListening(false);
      alert("Voice recognition error. Try again or use text input.");
    };
  }, [lang]);

  // Toggle voice recording
  const handleVoice = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    if (!listening) {
      setListening(true);
      recognitionRef.current.start();
    } else {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  // Send message to backend
  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    const userMsg = {
      id: Date.now() + Math.random(),
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    try {
      // Call your backend (adjust URL/port if needed)
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      // Expect backend to return: { reply: "..." } or { message: "..." }
      const replyText =
        data.reply ?? data.message ?? "Kuch galat hua, dobara koshish karein.";

      const botMsg = {
        id: Date.now() + Math.random(),
        role: "assistant",
        content: replyText,
        time: new Date().toLocaleTimeString(),
      };

      setMessages((m) => [...m, botMsg]);
      speak(replyText); // TTS
    } catch (err) {
      console.error("API error:", err);
      const errMsg = {
        id: Date.now() + Math.random(),
        role: "assistant",
        content:
          "Server se jawab nahi mila. Internet check karen ya dobara try karein.",
        time: new Date().toLocaleTimeString(),
      };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setTyping(false);
    }
  };

  // Press Enter to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Text-to-speech
  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    // prefer Urdu voice if selected else english
    utter.lang = lang === "ur-PK" ? "ur-PK" : "en-US";
    // Optionally pick a voice that matches language
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find((vx) => vx.lang.startsWith(utter.lang.split("-")[0]));
    if (v) utter.voice = v;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content:
          "Assalamualaikum! Main aapka Pregnancy Guide hoon. Aap apna sawal type ya bol ke poch saktay hain.",
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  return (
    <>
      <div className="layout">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div className="brand">
            <div className="logo">🤰</div>
            <div>
              <div className="brand-title">Pregnant Woman</div>
              <div className="brand-sub">AI Chatbot</div>
            </div>
          </div>

          <nav className="menu">
            <button className="menu-item" onClick={() => clearChat()}>
              🧾 New Chat
            </button>
            <button
              className="menu-item"
              onClick={() =>
                alert(
                  "This chatbot provides general guidance. For emergencies or personalized medical advice, please consult your clinician."
                )
              }
            >
              ⚠️ Disclaimer
            </button>
            <button
              className="menu-item"
              onClick={() =>
                alert(
                  "Pilot / About: This project aims to provide evidence-based pregnancy guidance using WHO/NHS resources."
                )
              }
            >
              ℹ️ About
            </button>
          </nav>

          <div className="sidebar-bottom">
            <label className="lang-label">Voice / Text Language</label>
            <select
              value={lang}
              onChange={(e) => {
                setLang(e.target.value);
                // re-init recognition language if available
                if (recognitionRef.current)
                  recognitionRef.current.lang = e.target.value;
              }}
            >
              <option value="ur-PK">Urdu (Pakistan)</option>
              <option value="en-US">English</option>
              <option value="sd-PK">Sindhi (if supported)</option>
            </select>

            <div className="small-note">
              Voice: Web Speech API (browser support varies)
            </div>
            <button
              className="theme-toggle"
              onClick={() => {
                document.body.classList.toggle("dark");
              }}
            >
              🌙 / ☀️ Toggle Theme
            </button>
          </div>
        </aside>

        {/* Main area */}
        <div className="main">
          <header className="topbar">
            <button
              className="hamburger"
              onClick={() => setSidebarOpen((s) => !s)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <div className="top-title">Pregnant Woman AI Chatbot</div>
          </header>

          <section className="chat-panel">
            <div className="messages" ref={messagesRef}>
              {messages.map((m) => (
                <div key={m.id} className={`msg ${m.role}`}>
                  <div className="msg-content">{m.content}</div>
                  <div className="msg-time">{m.time}</div>
                </div>
              ))}

              {typing && (
                <div className="msg assistant">
                  <div className="msg-content typing">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                </div>
              )}
            </div>

            <div className="composer">
              <textarea
                className="input"
                placeholder="Type your question... (Press Enter to send)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <div className="controls">
                <button
                  className={`mic ${listening ? "listening" : ""}`}
                  onClick={handleVoice}
                  title="Voice input"
                >
                  {listening ? "🔴 Recording" : "🎤"}
                </button>
                <button className="send" onClick={sendMessage} title="Send">
                  ➤ Send
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
