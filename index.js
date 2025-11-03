const express = require("express");
const fetch = require("node-fetch"); // or built-in fetch if Node 18+
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Read your API key from environment variable (Render or Replit)
const API_KEY = process.env.DSS2; // <-- your key name
if (!API_KEY) {
  console.error("API key missing! Set DSS2 environment variable.");
  process.exit(1);
}

// Helper function with retry logic
async function sendToOpenRouter(message, retries = 3) {
  const payload = {
    model: "deepseek/deepseek-chat",
    messages: [{ role: "user", content: message }]
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        timeout: 30000 // 30 seconds
      });

      const data = await res.json();

      if (data.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content;
      } else {
        console.warn("OpenRouter returned no content, attempt", attempt);
      }
    } catch (err) {
      console.warn("Attempt", attempt, "failed:", err.message);
    }
  }

  // If all retries fail
  return "Sorry, the AI is currently unavailable. Please try again later.";
}

// Chat endpoint
app.post("/chat", async (req, res) => {
  const message = req.body.message;
  if (!message) return res.status(400).json({ error: "Missing message" });

  const reply = await sendToOpenRouter(message);
  res.json({ reply });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
