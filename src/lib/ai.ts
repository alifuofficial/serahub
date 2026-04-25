import { prisma } from "./prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getPlainText } from "@/components/editor/Renderer";

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
  grammarNotes?: string;
  warnings?: string[];
}

export async function getAISuggestions(title: string, rawDescription: string): Promise<AISuggestions | null> {
  const config = await getAIConfig();
  if (!config.enabled || !config.geminiKey) {
    console.log("[AI] Skipped — AI not enabled or API key missing.");
    return null;
  }

  // Extract readable text from Editor.js JSON blob
  let description = rawDescription;
  try {
    description = getPlainText(rawDescription);
  } catch {
    // If it's already plain text, use as-is
  }

  if (!description || description.trim().length < 10) {
    console.log("[AI] Skipped — description too short for AI processing.");
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(config.geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert SEO content optimizer and categorizer for "SeraHub", an Ethiopian job and bid aggregation platform.

Analyze the following job/bid posting and return a JSON response only (no markdown, no code blocks):

TITLE: ${title}
DESCRIPTION: ${description.substring(0, 3000)}

Return ONLY a valid JSON object with these exact keys:
{
  "categoryName": "A professional category name (e.g. Software Development, Accounting, Construction, Healthcare, Education, Finance, Marketing, Engineering, Legal, NGO & Development, Government, Procurement, IT & Technology). Pick the most relevant one or create a concise new one.",
  "keywords": ["5 to 8 relevant SEO keywords as strings"],
  "metaDescription": "A compelling meta description under 160 characters",
  "suggestedTitle": "A clean, professional, SEO-optimized version of the title (keep it close to the original)",
  "grammarNotes": "One brief note about grammar/professionalism improvements, or empty string if none needed",
  "warnings": ["Any important warnings like missing contact info, past deadline, etc. Array of strings, can be empty."]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Robustly extract JSON — strip markdown code blocks if present
    let jsonText = text;
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonText = fenceMatch[1].trim();
    } else {
      const objMatch = text.match(/\{[\s\S]*\}/);
      if (objMatch) jsonText = objMatch[0];
    }

    const parsed = JSON.parse(jsonText) as AISuggestions;
    console.log("[AI] Suggestions generated:", JSON.stringify(parsed, null, 2));
    return parsed;
  } catch (error) {
    console.error("[AI] Gemini Error:", error);
    return null;
  }
}
