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
        return res.status(500).json({ reply: "عفواً، مفتاح Gemini API غير مهيأ في الخادم." });
      }

      const { prompt, history, storeData } = req.body;

      // Provide system context about exactly what the store has
      const systemInstruction = `
        أنت مساعد ذكي احترافي لمتجر إلكتروني. هدفك هو مساعدة المستخدمين والإجابة على استفساراتهم بناءً على بيانات المتجر المرفقة فقط.
        بيانات المتجر والمنتجات المتوفرة: ${JSON.stringify(storeData)}
        تعليمات هامة جداً:
        1. لا تخترع أي منتجات أو أسعار أو سياسات من عندك. التزم فقط بما هو موجود في بيانات المتجر.
        2. إذا لم يكن المنتج موجوداً، اعتذر بلطافة وأخبر العميل بذلك، واقترح عليه تصفح بقية الأقسام.
        3. إجاباتك يجب أن تكون قصيرة، مهذبة، واضحة بلهجة مصرية أو عربية فصحى جذابة وبسيطة ومباشرة لتجنب الحشو.
        4. لا تكرر إجاباتك بشكل عشوائي وافهم السياق من المحادثة السابقة.
      `;

      const contents = [];
      if (history && Array.isArray(history)) {
        history.forEach((msg: any) => {
          if (msg.sender === 'user' || msg.sender === 'bot') {
            contents.push({
              role: msg.sender === 'user' ? 'user' : 'model',
              parts: [{ text: msg.text || "مرحباً" }]
            });
          }
        });
      }
      contents.push({ role: 'user', parts: [{ text: prompt }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.1, // very low temp for factual responses
        },
      });

      res.json({ reply: response.text });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ reply: "عفواً، الخدمة غير متاحة حالياً بسبب ضغط على الخادم، يرجى المحاولة لاحقاً." });
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
