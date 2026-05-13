import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cvAnalysisId } = await req.json();
    if (!cvAnalysisId) {
      return NextResponse.json({ error: "Missing cvAnalysisId" }, { status: 400 });
    }

    const cvAnalysis = await prisma.cVAnalysis.findUnique({
      where: { id: cvAnalysisId, userId: session.id },
      include: { transaction: true }
    });

    if (!cvAnalysis) {
      return NextResponse.json({ error: "CV Analysis not found" }, { status: 404 });
    }

    const siteConfig = await prisma.siteConfig.findMany({
      where: { key: { in: ["cvanalyzer_enabled", "gemini_api_key"] } }
    });
    const config: Record<string, string> = {};
    siteConfig.forEach(row => config[row.key] = row.value);

    if (config.cvanalyzer_enabled !== "true") {
      return NextResponse.json({ error: "CV Analyzer is currently disabled." }, { status: 400 });
    }

    if (!cvAnalysis.transaction || cvAnalysis.transaction.status !== "SUCCESS") {
      return NextResponse.json({ error: "Payment verification pending or failed." }, { status: 402 });
    }

    if (!config.gemini_api_key) {
      return NextResponse.json({ error: "AI is not configured by the administrator." }, { status: 500 });
    }

    // Load PDF File
    let pdfBuffer: Buffer;
    if (cvAnalysis.fileUrl.startsWith("/")) {
      // Local file
      const filePath = path.join(process.cwd(), "public", cvAnalysis.fileUrl);
      pdfBuffer = await readFile(filePath);
    } else {
      // External URL (FTP)
      const res = await fetch(cvAnalysis.fileUrl);
      if (!res.ok) throw new Error("Failed to fetch remote CV file");
      const ab = await res.arrayBuffer();
      pdfBuffer = Buffer.from(ab);
    }

    // Call Gemini
    const genAI = new GoogleGenerativeAI(config.gemini_api_key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert HR Recruiter and CV Analyzer.
      Analyze this PDF CV and return a STRICT JSON object containing:
      1. "skills": A flat array of strings representing the candidate's core technical and soft skills.
      2. "experience": A short, 2-3 sentence summary of their work experience.
      3. "keywords": An array of 3-5 crucial search keywords (like job titles or primary skills) that can be used to search a database for matching jobs.
      
      Output ONLY valid JSON. No markdown, no backticks, no explanations.
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: pdfBuffer.toString("base64"),
          mimeType: "application/pdf"
        }
      },
      prompt
    ]);

    const textResponse = result.response.text();
    // Clean up potential markdown formatting from Gemini
    const jsonStr = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Gemini didn't return valid JSON:", textResponse);
      throw new Error("AI generated an invalid response format.");
    }

    // Match Jobs using keywords
    const keywords = parsedData.keywords || [];
    let matchedJobsResult: any[] = [];
    
    if (keywords.length > 0) {
      // Simple OR search across job titles and descriptions
      const orConditions = keywords.map((kw: string) => ({
        OR: [
          { title: { contains: kw } },
          { description: { contains: kw } },
          { keywords: { contains: kw } }
        ]
      }));

      const jobs = await prisma.job.findMany({
        where: {
          status: "PUBLISHED",
          OR: orConditions
        },
        select: { id: true, title: true, slug: true, company: true },
        take: 5
      });
      matchedJobsResult = jobs;
    }

    // Save results
    const updated = await prisma.cVAnalysis.update({
      where: { id: cvAnalysis.id },
      data: {
        status: "COMPLETED",
        skills: JSON.stringify(parsedData.skills || []),
        experience: parsedData.experience || "",
        matchedJobs: JSON.stringify(matchedJobsResult)
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        skills: parsedData.skills,
        experience: parsedData.experience,
        matchedJobs: matchedJobsResult
      }
    });

  } catch (error: any) {
    console.error("[CV Analysis API Error]", error);
    
    // Attempt to mark as failed
    try {
      const { cvAnalysisId } = await req.json().catch(() => ({}));
      if (cvAnalysisId) {
        await prisma.cVAnalysis.update({
          where: { id: cvAnalysisId },
          data: { status: "FAILED" }
        });
      }
    } catch (e) {}

    return NextResponse.json({ error: error.message || "Failed to analyze CV" }, { status: 500 });
  }
}
