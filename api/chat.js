import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Method not allowed' });
  }

  // Init Gemini
  let ai = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'vercel-build',
        }
      }
    });
  }

  try {
    if (!ai) {
      return res.status(500).json({ reply: "عفواً، مفتاح Gemini API غير مهيأ في الخادم." });
    }

    const { prompt, history, storeData } = req.body;

    const systemInstruction = `
      أنت مساعد ذكي ومندوب مبيعات لمتجر إلكتروني. يجب عليك قراءة بيانات المنتجات بدقة من البيانات المرفقة.
      مهمتك الأساسية والوحيدة: التركيز على عرض وتسويق "المنتجات التي عليها خصم (عروض)" فقط.
      عند سؤال العميل، أخبره تفاصيل المنتجات المتاحة بخصم فقط، ولا تتحدث عن باقي تفاصيل الموقع.
      بيانات المتجر والمنتجات المتوفرة: ${JSON.stringify(storeData)}
      تعليمات هامة:
      1. اقترح المنتجات المخفضة فقط بناءً على البيانات. لا تخترع منتجات.
      3. إجاباتك يجب أن تكون قصيرة وبناء على البيانات فقط.
      4. عند طلب الشراء، اطلب (الاسم، الهاتف، العنوان، المنتج).
      5. لا تسأل المستخدم عن كلمات مرور أبداً.
    `;

    const contents = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg) => {
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
        temperature: 0.1,
      },
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ reply: "عفواً، الخدمة غير متاحة حالياً بسبب ضغط على الخادم، يرجى المحاولة لاحقاً." });
  }
}
