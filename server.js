import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Needed for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Simple function to ensure blank line before Markdown lists for proper rendering
function normalizeMarkdown(md) {
  // Inserts a blank line before any line starting with list markers (-, *, +, or numbers)
  return md.replace(/([^\n])(\n)([-*+] |\d+\.)/g, "$1\n\n$3");
}

// API route
app.post("/ask", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });

    const runResult = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: process.env.ASSISTANT_ID,
    });

    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessage = messages.data.find((msg) => msg.role === "assistant");

    const rawResponse = assistantMessage?.content[0]?.text?.value || "Hmm, I couldn't find a good answer for that.";
    const normalizedResponse = normalizeMarkdown(rawResponse); // Normalize Markdown here

    res.json({
      response: normalizedResponse,
    });
  } catch (err) {
    console.error("Error during OpenAI call:", err);
    res.status(500).json({ error: "Server error." });
  }
});

// Serve React frontend from build/
app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Start server
app.listen(port, () => {
  console.log(`✅ BCCA Contracts Assistant server running on port ${port}`);
});
