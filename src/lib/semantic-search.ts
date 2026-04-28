import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "./prisma";

/**
 * Uses AI to expand a simple search query into related professional terms and synonyms.
 * This enables "Semantic Search" where a query for "IT" returns "Software Engineer", "Network", etc.
 */
export async function expandSearchQuery(query: string) {
  if (!query || query.length < 2) return [query];

  try {
    const config = await prisma.siteConfig.findMany({
      where: { key: { in: ["gemini_api_key", "ai_model"] } }
    });
    const configMap: Record<string, string> = {};
    config.forEach(c => configMap[c.key] = c.value);

    const apiKey = configMap["gemini_api_key"];
    if (!apiKey) return [query];

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: configMap["ai_model"] || "gemini-1.5-flash" });

    const prompt = `Act as a professional career consultant. Given the search query "${query}", provide a comma-separated list of exactly 5 highly related job titles, industries, or synonyms that a person searching for this might also be interested in. 
    Only return the keywords, nothing else. 
    Example for "Doctor": Physician, Surgeon, Medical, Healthcare, Clinic.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Track AI usage
    await prisma.aIUsage.create({
      data: {
        model: configMap["ai_model"] || "gemini-1.5-flash",
        prompt,
        response: text,
        type: "SEMANTIC_SEARCH"
      }
    });

    const expanded = text.split(",").map(t => t.trim().toLowerCase()).filter(t => t);
    return [query.toLowerCase(), ...expanded];
  } catch (error) {
    console.error("[Semantic Search Error]", error);
    return [query];
  }
}
