import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// ✅ Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Endpoint for Chat + Journal
app.post("/api/ai", async (req, res) => {
  try {
    const { mode, content } = req.body;

    let systemPrompt = "";
    if (mode === "chat") {
      systemPrompt =
        "You are a supportive AI friend who provides empathetic emotional support in conversation.";
    } else if (mode === "journal") {
      systemPrompt =
        "You are a warm, empathetic journaling companion. Reflect back positively on what the user writes and offer gentle encouragement.";
    } else {
      return res.status(400).json({ error: "Invalid mode" });
    }

    // ✅ Pick Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ✅ Ask Gemini
    const result = await model.generateContent(
      systemPrompt + "\n\nUser: " + content
    );

    // ✅ Extract reply safely
    const reply =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!reply) {
      console.error("⚠️ Gemini empty response:", JSON.stringify(result, null, 2));
      return res.status(500).json({ error: "No reply from Gemini" });
    }

    res.json({ reply });
  } catch (err) {
    console.error("💥 Gemini server error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start server
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`🚀 Gemini server running at http://localhost:${PORT}`)
);
