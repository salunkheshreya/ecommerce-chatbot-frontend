import React, { useState, useEffect } from "react";

function App() {
  const BACKEND_URL = "https://ecommerce-chatbot-backend-2768.onrender.com";

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatMessages");
    return saved
      ? JSON.parse(saved).map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
      : [{ sender: "bot", text: "Hi! How can I help you find products today?", timestamp: new Date() }];
  });

  const [input, setInput] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const now = new Date();
    const userMessage = { sender: "user", text: input.trim(), timestamp: now };
    const userText = input.trim();
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    fetch(`${BACKEND_URL}/chatbot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText })
    })
      .then(res => res.json())
      .then(data => {
        const botMessage = {
          sender: "bot",
          text: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);

        const keywords = ["phone", "laptop", "t-shirt", "shirt", "book", "headphones", "earbuds", "jeans", "camera"];
        const shouldSearch = keywords.some(k => userText.toLowerCase().includes(k));
        if (shouldSearch) {
          const queryParams = new URLSearchParams();
          queryParams.append("q", userText);
          if (category) queryParams.append("category", category);
          if (minPrice) queryParams.append("min_price", minPrice);
          if (maxPrice) queryParams.append("max_price", maxPrice);

          fetch(`${BACKEND_URL}/search?${queryParams.toString()}`)
            .then(res => res.json())
            .then(data => {
              const nowBot = new Date();
              if (data.products && data.products.length > 0) {
                const productMessages = data.products.map(p => ({
                  sender: "bot",
                  isProduct: true,
                  product: p,
                  timestamp: nowBot
                }));
                setMessages(prev => [...prev, ...productMessages]);
              } else {
                setMessages(prev => [...prev, {
                  sender: "bot",
                  text: "Sorry, no products found.",
                  timestamp: nowBot
                }]);
              }
            })
            .catch(() => {
              setMessages(prev => [...prev, {
                sender: "bot",
                text: "Error fetching products.",
                timestamp: new Date()
              }]);
            });
        }
      })
      .catch(() => {
        setMessages(prev => [...prev, {
          sender: "bot",
          text: "Error connecting to chatbot.",
          timestamp: new Date()
        }]);
      });
  };

  const formatTime = date => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const resetChat = () => {
    const resetMessage = {
      sender: "bot",
      text: "Chat reset. How can I help you now?",
      timestamp: new Date()
    };
    setMessages([resetMessage]);
    localStorage.removeItem("chatMessages");
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: "1rem", border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Sales Chatbot</h2>

      {/* Filters */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Category:{" "}
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All</option>
            <option value="Electronics">Electronics</option>
            <option value="Books">Books</option>
            <option value="Textiles">Textiles</option>
          </select>
        </label>

        <label style={{ marginLeft: 20 }}>
          Min Price:{" "}
          <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" min="0" style={{ width: 80 }} />
        </label>

        <label style={{ marginLeft: 20 }}>
          Max Price:{" "}
          <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="1000" min="0" style={{ width: 80 }} />
        </label>
      </div>

      {/* Reset Chat Button */}
      <button
        onClick={resetChat}
        style={{
          marginBottom: "1rem",
          background: "#dc3545",
          color: "white",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: 5
        }}
      >
        Reset Chat
      </button>

      {/* Chat Window */}
      <div style={{ height: 300, overflowY: "auto", border: "1px solid #ddd", padding: "1rem", marginBottom: "1rem" }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              whiteSpace: "pre-wrap",
              textAlign: msg.sender === "user" ? "right" : "left",
              marginBottom: "0.5rem"
            }}
          >
            {msg.isProduct ? (
              <div style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "10px",
                backgroundColor: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <img src={msg.product.image_url} alt={msg.product.name} style={{ width: 80, borderRadius: 8 }} />
                <div>
                  <strong>{msg.product.name}</strong><br />
                  ₹{msg.product.price} | ⭐ {msg.product.rating}<br />
                  <small>{msg.product.description}</small>
                </div>
              </div>
            ) : (
              <>
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.5rem 1rem",
                    borderRadius: 20,
                    backgroundColor: msg.sender === "user" ? "#007bff" : "#e5e5ea",
                    color: msg.sender === "user" ? "white" : "black"
                  }}
                >
                  {msg.text}
                </span>
                <div style={{ fontSize: "0.7rem", color: "#666", marginTop: 2 }}>
                  {formatTime(msg.timestamp)}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Input Field */}
      <div style={{ display: "flex" }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ flex: 1, padding: "0.5rem", fontSize: "1rem" }}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
        />
        <button onClick={handleSend} style={{ padding: "0.5rem 1rem" }}>Send</button>
      </div>
    </div>
  );
}
