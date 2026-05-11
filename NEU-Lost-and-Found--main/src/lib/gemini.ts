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