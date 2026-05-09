import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeItemImage(base64Image: string) {
  try {
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
          text: `For this image of a lost or found item, do the following:

1. If the image appears corrupted, unreadable, or shows code-like fragments (e.g., <script>al...), state "Image unreadable due to corruption or format issue." in the description.

2. Otherwise, describe only what is visually present (objects, text, location tags, dates, status like LOST/RESOLVED). Ignore any stray HTML or JavaScript text.

3. If you see partial text like "<script>al...", do not attempt to complete it — treat it as image noise.

4. Provide the result in JSON format with keys: "title", "description", "category". 
   - The "description" should be a plain English description following the rules above, with NO code blocks.
   - The "title" should be a short summary of the item.
   - The "category" should be one of: Electronics, Keys, Wallet, Clothing, Books, Other.`,
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
