import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getIrrigationAdvice(
  moisture: number,
  cropName: string,
  condition: string,
  weatherForecast: string
) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are an expert agricultural assistant for a Smart Irrigation System.
        Current Soil Moisture: ${moisture}%
        Crop: ${cropName}
        Condition: ${condition}
        Weather Forecast: ${weatherForecast}

        Provide a brief, helpful advice on whether the user should irrigate now or wait. 
        Consider the weather forecast (e.g., if rain is expected, suggest waiting).
        Keep it under 3 sentences.
      `,
    });
    return response.text || "No advice available.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to my agricultural database. Please check your sensor readings manually.";
  }
}

export async function chatWithAssistant(message: string, context: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are Terra, the AI assistant for the TerraFlow Smart Irrigation System.
        You help farmers and gardeners manage their irrigation.
        Current System State: ${JSON.stringify(context)}
        Be professional, helpful, and concise.
        
        User Message: ${message}
      `,
    });
    return response.text || "I'm not sure how to respond to that.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm sorry, I'm offline right now. How can I help you with your plants?";
  }
}
