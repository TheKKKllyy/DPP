import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // skip if Node >=18

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.DSS2;
if (!API_KEY) {
  console.error("API key missing! Set DSS2 environment variable.");
  process.exit(1);
}

async function sendToOpenRouter(message, retries = 3) {
  const payload = {
    model: "deepseek/deepseek-chat-v3.1:free",
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
        body: JSON.stringify(payload)
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

  return "Sorry, the AI is currently unavailable. Please try again later.";
}

app.post("/chat", async (req, res) => {
  const message = req.body.message;
  if (!message) return res.status(400).json({ error: "Missing message" });

  const reply = await sendToOpenRouter(message);
  res.json({ reply });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
