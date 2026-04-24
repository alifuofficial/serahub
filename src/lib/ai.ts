import { prisma } from "./prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getAIConfig() {
  const configs = await prisma.siteConfig.findMany({
    where: {
      key: { in: ["ai_enabled", "ai_provider", "gemini_api_key"] }
    }
  });

  const configMap: Record<string, string> = {};
  configs.forEach(c => configMap[c.key] = c.value);

  return {
    enabled: configMap["ai_enabled"] === "true",
    provider: configMap["ai_provider"] || "gemini",
    geminiKey: configMap["gemini_api_key"] || ""
  };
}

export interface AISuggestions {
  categoryName: string;
  keywords: string[];
  metaDescription: string;
  suggestedTitle: string;
}

export async function getAISuggestions(title: string, description: string): Promise<AISuggestions | null> {
  const config = await getAIConfig();
  if (!config.enabled || !config.geminiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(config.geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert SEO and content categorizer for a job and bid aggregation platform called SeraHub.
      Analyze the following job/bid posting:
      
      TITLE: ${title}
      DESCRIPTION: ${description.substring(0, 2000)}
      
      Provide your response in strictly valid JSON format with the following keys:
      - categoryName: A single professional category name (e.g., "Software Development", "Accounting", "Construction", "Health Care"). Be concise but specific.
      - keywords: An array of 5-8 relevant SEO keywords.
      - metaDescription: A compelling SEO meta description (max 160 chars).
      - suggestedTitle: A clean, optimized title for the posting.
      
      Response:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON from potential markdown blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AISuggestions;
    }
    
    return null;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
}
