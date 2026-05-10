/**
 * Analyzes an item image using Google's Gemini AI to extract title, description, and category
 * @param {string} base64Image - Base64 encoded image string (with or without data URL prefix)
 * @returns {Promise<{ title: string; description: string; category: string } | null>} 
 * Returns parsed JSON object with item details, or null if API key is missing or analysis fails
 * @example
 * const result = await analyzeItemImage("data:image/jpeg;base64,/9j/4AAQ...")
 * if (result) {
 *   console.log(result.title, result.description, result.category)
 * }
 */
export async function analyzeItemImage(base64Image: string) {
  const apiKey = (import.meta as any).env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'placeholder') return null;

  try {
    const { GoogleGenAI } = await import("@google/genai");
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
