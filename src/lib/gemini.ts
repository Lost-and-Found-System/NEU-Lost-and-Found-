import { GoogleGenAI } from "@google/genai";

export async function analyzeItemImage(base64Image: string) {
  const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env.GEMINI_API_KEY;
  
  // Silently skip if no API key is configured
  if (!apiKey || apiKey === 'placeholder') return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        {
          text: `For this image of a lost or found item, provide the result in JSON format with keys: "title", "description", "category". The category should be one of: Electronics, Keys, Wallet, Clothing, Books, Other.`,
        },
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return null;
  }
}