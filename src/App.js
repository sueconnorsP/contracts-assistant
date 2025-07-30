import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { EventSourcePolyfill } from "event-source-polyfill";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const prompts = [
    "What contract should I use for a small commercial renovation?",
    "How do I file a lien?",
    "What is the warranty period under CCDC 2?",
    "Do I have to pay holdback if I am the general contractor?",
    "Can you give me an email template to notify an owner of a delayed payment?",
    "Who can I contact to purchase a CCDC contract?",
    "Where can I get legal advice on the Builders Lien Act?",
  ];

  const sendMessage = (text) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage = { sender: "user", text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const assistantReply = { sender: "assistant", text: "" };
    setMessages((prev) => [...prev, assistantReply]);

    const eventSource = new EventSourcePolyfill("/ask-talent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: messageText }),
    });

    eventSource.onmessage = (event) => {
      const chunk = event.data;
      assistantReply.text += chunk;

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...assistantReply };
        return updated;
      });
    };

    eventSource.onerror = () => {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          sender: "assistant",
          text: "❌ Sorry, something went wrong while streaming the response.",
        },
      ]);
      eventSource.close();
      setLoading(false);
    };

    eventSource.onopen = () => setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div className="chat-container">
      <h1>Welcome to the BCCA Contracts Assistant</h1>
      <p className="intro">
        This chat will serve as a guidance and support tool on best practice on
        contracts and construction procurement for members of the Regional
        Construction Associations. It is not intended to give legal advice, but
        to help users navigate contract-related questions and access reference
        materials.
      </p>

      <div className="prompt-buttons">
        {prompts.map((prompt, index) => (
          <button key={index} onClick={() => sendMessage(prompt)}>
            {prompt}
          </button>
        ))}
      </div>

      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <div className="markdown">
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <em>Thinking...</em>
          </div>
        )}
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
        />
        <button onClick={() => sendMessage()}>Send</button>
        <button onClick={clearChat} className="clear-btn">
          Clear
        </button>
      </div>
    </div>
  );
}

export default App;
