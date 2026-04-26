import { prisma } from "./prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getPlainText } from "@/components/editor/Renderer";

export type AIProvider = "gemini" | "deepseek" | "qwen";

export interface AIConfig {
  enabled: boolean;
  provider: AIProvider;
  geminiKey: string;
  deepseekKey: string;
  qwenKey: string;
}

export interface AISuggestions {
  categoryName: string;
  keywords: string[];
  metaDescription: string;
  suggestedTitle: string;
  grammarNotes?: string;
  warnings?: string[];
}

export interface AIReviewResult extends AISuggestions {
  fixedTitle: string;
  fixedDescriptionText: string;
  company?: string;
  locationType?: string;
  careerLevel?: string;
  employmentType?: string;
  vacancyCount?: string;
  deadline?: string;
}

export async function getAIConfig(): Promise<AIConfig> {
  const configs = await prisma.siteConfig.findMany({
    where: {
      key: { in: ["ai_enabled", "ai_provider", "gemini_api_key", "deepseek_api_key", "qwen_api_key"] }
    }
  });

  const configMap: Record<string, string> = {};
  configs.forEach(c => configMap[c.key] = c.value);

  return {
    enabled: configMap["ai_enabled"] === "true",
    provider: (configMap["ai_provider"] as AIProvider) || "gemini",
    geminiKey: configMap["gemini_api_key"] || "",
    deepseekKey: configMap["deepseek_api_key"] || "",
    qwenKey: configMap["qwen_api_key"] || ""
  };
}

function getProviderKey(config: AIConfig): string | null {
  switch (config.provider) {
    case "gemini": return config.geminiKey || null;
    case "deepseek": return config.deepseekKey || null;
    case "qwen": return config.qwenKey || null;
    default: return null;
  }
}

const SEO_PROMPT = (title: string, description: string) => `
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

const REVIEW_PROMPT = (title: string, description: string) => `
You are an expert content editor for "SeraHub", an Ethiopian job and bid aggregation platform. Your job is to review a job/bid posting, fix grammar and professionalism issues, and provide SEO suggestions.

Review the following posting and return a JSON response only (no markdown, no code blocks):

TITLE: ${title}
DESCRIPTION: ${description.substring(0, 3000)}

Return ONLY a valid JSON object with these exact keys:
{
  "fixedTitle": "The title with grammar/spelling/capitalization fixed and made more professional. Keep it close to the original.",
  "fixedDescriptionText": "The description text with grammar, spelling, punctuation, and professionalism fixes applied. Keep the same meaning and structure.",
  "company": "The hiring company name if found, otherwise empty string",
  "locationType": "One of: Office, Remote, Hybrid. Based on description.",
  "careerLevel": "A concise level (e.g. Junior, Senior, Manager, Internship, Entry level)",
  "employmentType": "One of: Full time, Part time, Contract, Freelance, Internship",
  "vacancyCount": "The number of positions available as a string (e.g. '1', '5+', 'Many'), or empty string if not mentioned",
  "deadline": "The application deadline in YYYY-MM-DD format if found, otherwise empty string",
  "categoryName": "A professional category name (e.g. Software Development, Accounting, Construction, Healthcare, Education, Finance, Marketing, Engineering, Legal, NGO & Development, Government, Procurement, IT & Technology). Pick the most relevant one or create a concise new one.",
  "keywords": ["5 to 8 relevant SEO keywords as strings"],
  "metaDescription": "A compelling meta description under 160 characters",
  "grammarNotes": "Specific notes about what grammar/professionalism fixes were made, or empty string if none needed",
  "warnings": ["Any important warnings like missing contact info, past deadline, inconsistent information, etc. Array of strings, can be empty."]
}
`;

const NEWSLETTER_PROMPT = (jobs: { title: string, link: string, metaDescription?: string }[], siteName: string) => `
You are a career expert at "${siteName}", an Ethiopian job and bid aggregation platform.
Create a weekly newsletter for our subscribers featuring the following new opportunities.

JOBS:
${jobs.map((j, i) => `${i + 1}. TITLE: ${j.title}\n   LINK: ${j.link}\n   SUMMARY: ${j.metaDescription || "Click to see details."}`).join("\n\n")}

Guidelines:
1. Subject line should be catchy, professional, and personalized (e.g. "Your Weekly Career Update from ${siteName}").
2. The body should be in clean, professional HTML.
3. Use a friendly but professional tone.
4. Highlight why these opportunities are exciting.
5. Include a clear call to action for each job.
6. The HTML should be self-contained and suitable for email (inline styles).
7. Return a JSON response only (no markdown, no code blocks).

Return ONLY a valid JSON object with these exact keys:
{
  "subject": "The email subject line",
  "html": "The full HTML body of the email"
}
`;

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text().trim();
}

async function callDeepSeek(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DeepSeek API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function callAI(prompt: string, config: AIConfig): Promise<string> {
  switch (config.provider) {
    case "gemini": {
      if (!config.geminiKey) throw new Error("Gemini API key not configured");
      return callGemini(prompt, config.geminiKey);
    }
    case "deepseek": {
      if (!config.deepseekKey) throw new Error("DeepSeek API key not configured");
      return callDeepSeek(prompt, config.deepseekKey);
    }
    default:
      throw new Error(`AI provider "${config.provider}" is not implemented`);
  }
}

function parseAIResponse(text: string): unknown {
  let jsonText = text;

  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonText = fenceMatch[1].trim();
  } else {
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) jsonText = objMatch[0];
  }

  return JSON.parse(jsonText);
}

export async function getAISuggestions(title: string, rawDescription: string): Promise<AISuggestions | null> {
  const config = await getAIConfig();
  if (!config.enabled) {
    console.log("[AI] Skipped — AI not enabled.");
    return null;
  }

  const apiKey = getProviderKey(config);
  if (!apiKey) {
    console.log(`[AI] Skipped — no API key for provider "${config.provider}".`);
    return null;
  }

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
    const text = await callAI(SEO_PROMPT(title, description), config);
    const parsed = parseAIResponse(text) as unknown as AISuggestions;
    console.log("[AI] Suggestions generated:", JSON.stringify(parsed, null, 2));
    return parsed;
  } catch (error) {
    console.error(`[AI] ${config.provider} Error:`, error);
    return null;
  }
}

export async function reviewContent(title: string, rawDescription: string): Promise<AIReviewResult | null> {
  const config = await getAIConfig();
  if (!config.enabled) {
    console.log("[AI Review] Skipped — AI not enabled.");
    return null;
  }

  const apiKey = getProviderKey(config);
  if (!apiKey) {
    console.log(`[AI Review] Skipped — no API key for provider "${config.provider}".`);
    return null;
  }

  let description = rawDescription;
  try {
    description = getPlainText(rawDescription);
  } catch {
    // If it's already plain text, use as-is
  }

  if (!description || description.trim().length < 10) {
    console.log("[AI Review] Skipped — description too short for AI processing.");
    return null;
  }

  try {
    const text = await callAI(REVIEW_PROMPT(title, description), config);
    const parsed = parseAIResponse(text) as unknown as AIReviewResult;
    console.log("[AI Review] Content reviewed:", JSON.stringify(parsed, null, 2));
    return parsed;
  } catch (error) {
    console.error(`[AI Review] ${config.provider} Error:`, error);
    return null;
  }
}
export async function generateNewsletter(jobs: { title: string, link: string, metaDescription?: string }[]): Promise<{ subject: string, html: string } | null> {
  const config = await getAIConfig();
  if (!config.enabled) {
    console.log("[AI Newsletter] Skipped — AI not enabled.");
    return null;
  }

  const apiKey = getProviderKey(config);
  if (!apiKey) {
    console.log(`[AI Newsletter] Skipped — no API key for provider "${config.provider}".`);
    return null;
  }

  const siteName = (await prisma.siteConfig.findUnique({ where: { key: "site_name" } }))?.value || "SeraHub";

  try {
    const text = await callAI(NEWSLETTER_PROMPT(jobs, siteName), config);
    const parsed = parseAIResponse(text) as any;
    console.log("[AI Newsletter] Newsletter generated successfully.");
    return parsed;
  } catch (error) {
    console.error(`[AI Newsletter] ${config.provider} Error:`, error);
    return null;
  }
}
