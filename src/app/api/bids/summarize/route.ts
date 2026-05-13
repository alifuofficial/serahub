import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { bidId } = await req.json();
    if (!bidId) {
      return NextResponse.json({ error: "Missing bidId" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { subscriptionPlan: true }
    });

    if (user?.subscriptionPlan !== "PRO_BID" && user?.subscriptionPlan !== "TRIAL") {
      return NextResponse.json({ error: "AI Summarizer is a Business Pro feature." }, { status: 403 });
    }

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      select: { title: true, description: true }
    });

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    // Prepare content for Gemini
    // EditorJS content is JSON, we need to extract text
    const blocks = JSON.parse(bid.description).blocks || [];
    const textContent = blocks.map((b: any) => b.data?.text || "").join("\n");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Summarize the following tender/bid document in a concise way. Highlight key requirements, eligibility criteria, and submission instructions. 
    
    Bid Title: ${bid.title}
    Content: ${textContent}`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    console.error("[Bid Summarizer Error]", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
