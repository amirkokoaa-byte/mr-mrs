import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Init Gemini
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // API route for chatbot
  app.post("/api/chat", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ reply: "Gemini API key is not configured on the server." });
      }

      const { prompt, storeData } = req.body;

      // Provide system context about exactly what the store has
      const systemInstruction = `
        You are an AI assistant for this e-commerce app. 
        Your goal is to answer user questions about the products, offers, policies, or the website.
        You must look at the store data provided to give accurate, truthful answers. Do not make up products or fake offers.
        Store data context: ${JSON.stringify(storeData)}
        Be friendly, concise, and helpful. Use Arabic language as the main language.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2, // low temp for accurate facts
        },
      });

      res.json({ reply: response.text });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ reply: "عذراً، حدث خطأ في التواصل مع الخادم." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
