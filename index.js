// index.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors()); // allows requests from any origin
app.use(express.json());

// Environment variable check
const API_KEY = process.env.DSS2;
if (!API_KEY) {
  console.error("Error: DSS2 environment variable is not set!");
  process.exit(1);
}

// POST /chat endpoint
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage || userMessage.trim() === "") {
    return res.status(400).json({ error: "Message cannot be empty." });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [{ role: "user", content: userMessage }]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0].message) {
      return res.json({ reply: "No response from AI." });
    }

    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error("OpenRouter API error:", err);
    res.status(500).json({ error: "Failed to fetch response from AI." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
