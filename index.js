import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// Allow requests from ANY origin (quick solution)
app.use(cors());  

// OR, restrict to your frontend domain:
// app.use(cors({ origin: "https://thekkkllyy.github.io" }));

app.use(express.json());

const API_KEY = process.env.OPENROUTER_KEY;
const MODEL = "deepseek/deepseek-chat";

app.post("/chat", async (req, res) => {
  try {
    const userMsg = req.body.message;
    if (!userMsg) return res.status(400).json({ error: "Missing message" });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: userMsg }],
      }),
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "No response from model.";

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
