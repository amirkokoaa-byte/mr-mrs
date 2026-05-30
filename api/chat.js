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
      أنت مساعد ذكي احترافي ومندوب مبيعات لمتجر إلكتروني. هدفك هو مساعدة المستخدمين والإجابة على استفساراتهم بناءً على بيانات المتجر المرفقة فقط.
      مهمتك هي التسويق للمنتجات، مساعدة العميل على اتخاذ قرار الشراء، واقتراح المنتجات (مثل أرخص منتج أو أغلى منتج أو المنتجات التي عليها خصم). 
      عند إعجاب العميل بمنتج وتأكيد رغبته في الشراء، اطلب منه تزويدك ببياناته (اسمه ورقم هاتفه وعنوانه واسم المنتج أو الصنف الذي يود شراءه).
      بيانات المتجر والمنتجات المتوفرة: ${JSON.stringify(storeData)}
      تعليمات هامة جداً:
      1. لا تخترع أي منتجات أو أسعار أو سياسات من عندك. التزم فقط بما هو موجود في بيانات المتجر.
      2. إذا لم يكن المنتج موجوداً، اعتذر بلطافة وأخبر العميل بذلك، واقترح عليه تصفح بقية الأقسام.
      3. إجاباتك يجب أن تكون قصيرة، مهذبة، واضحة بلهجة مصرية أو عربية جذابة ومناسبة للمبيعات.
      4. غير مسموح لك مطلقاً بسؤال المستخدم عن أي كلمات مرور (Passwords) لأي حسابات مهما كان السبب. ليس لديك صلاحية للتعامل مع بيانات الحسابات السرية.
      5. لا تكرر إجاباتك واستوعب السياق.
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
