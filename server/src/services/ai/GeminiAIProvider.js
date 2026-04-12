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
}

module.exports = { GeminiAIProvider };
