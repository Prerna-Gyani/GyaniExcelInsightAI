import { GoogleGenAI } from "@google/genai";

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private modelName: string = "gemini-3-flash-preview";

  constructor(apiKey: string) {
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  async chat(prompt: string, history: ChatMessage[], context: string) {
    if (!this.ai) throw new Error("Gemini API key not configured.");

    const systemInstruction = `
      You are a data analyst assistant. You have access to the following data context:
      ${context}
      
      Instructions:
      1. Answer questions based ON ONLY the provided data context if relevant.
      2. If the user asks for a summary, provide a concise one highlighting key trends.
      3. Be precise with numbers and column names.
      4. If the question cannot be answered by the data, politely say so.
      5. Formulate responses in markdown for better readability.
    `.trim();

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: [
          ...history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
          })),
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      return response.text;
    } catch (error: any) {
      console.error("Gemini Error:", error);
      throw new Error(error?.message || "Failed to get response from Gemini.");
    }
  }
}
