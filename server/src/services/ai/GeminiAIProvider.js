const { GoogleGenAI } = require("@google/genai");
const { env } = require("../../config/env");

class GeminiAIProvider {
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    this.model = "gemini-2.5-flash";
  }

  async *streamChat(messages, systemPrompt) {
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await this.ai.models.generateContentStream({
      model: this.model,
      contents,
      config: {
        temperature: 0.7,
        systemInstruction: systemPrompt,
      },
    });

    for await (const chunk of response) {
      const text = chunk.text;
      if (text) yield { text, done: false };
    }

    yield { text: "", done: true };
  }

  async complete(messages, systemPrompt) {
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents,
      config: {
        temperature: 0.3,
        systemInstruction: systemPrompt,
      },
    });

    return response.text;
  }

  /**
   * Detects the primary language of the given text.
   * Returns language code: 'hi', 'en', 'mr', 'bn', 'te'
   * Falls back to user's profile language if detection is uncertain.
   */
  async detectLanguage(text, fallbackLang = "hi") {
    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Analyze this text and return ONLY the language code (hi/en/mr/bn/te):
"${text}"

Rules:
- hi = Hindi/Devanagari script
- en = English
- mr = Marathi
- bn = Bengali
- te = Telugu
- If mixed, return the dominant language
- If uncertain, return "en"
- Return ONLY the 2-letter code, nothing else`,
              },
            ],
          },
        ],
        config: {
          temperature: 0.1, // Low temperature for deterministic detection
        },
      });

      const detected = response.text.trim().toLowerCase();
      const validLangs = ["hi", "en", "mr", "bn", "te"];

      return validLangs.includes(detected) ? detected : fallbackLang;
    } catch (err) {
      // If detection fails, return fallback
      return fallbackLang;
    }
  }
}

module.exports = { GeminiAIProvider };
