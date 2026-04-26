import { NextResponse } from "next/server";
import { smartSearch } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: "Query too short" }, { status: 400 });
    }

    const result = await smartSearch(query);

    if (!result) {
      return NextResponse.json({ 
        q: query,
        type: "BOTH",
        explanation: "Performing a standard search for your query."
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[AI Search API Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
