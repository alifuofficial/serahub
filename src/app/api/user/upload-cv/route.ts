import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import * as ftp from "basic-ftp";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { fileTypeFromBuffer } from "file-type";

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verify it's a PDF
    const detectedType = await fileTypeFromBuffer(buffer);
    const mimeType = detectedType?.mime || file.type;

    if (mimeType !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed for CV analysis." }, { status: 400 });
    }

    if (file.size > MAX_PDF_SIZE) {
      return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
    }

    const uniqueName = `cv-${session.id}-${Date.now()}.pdf`;
    let fileUrl = "";

    // Check FTP Settings
    const configRows = await prisma.siteConfig.findMany({
      where: { key: { in: ["ftp_enabled", "ftp_host", "ftp_port", "ftp_user", "ftp_pass", "ftp_root", "ftp_public_url"] } }
    });
    const config: Record<string, string> = {};
    configRows.forEach(row => config[row.key] = row.value);

    if (config.ftp_enabled === "true") {
      const client = new ftp.Client();
      client.ftp.verbose = false;
      try {
        await client.access({
          host: config.ftp_host,
          port: parseInt(config.ftp_port || "21"),
          user: config.ftp_user,
          password: config.ftp_pass,
          secure: false 
        });

        const remoteRoot = config.ftp_root || "/";
        await client.ensureDir(remoteRoot);
        
        const remotePath = (remoteRoot.endsWith("/") ? remoteRoot : remoteRoot + "/") + uniqueName;
        
        const stream = new (require("stream").Readable)();
        stream.push(buffer);
        stream.push(null);

        await client.uploadFrom(stream, remotePath);
        await client.close();

        const publicUrl = config.ftp_public_url?.trim().replace(/\/$/, "") || "";
        if (!publicUrl) {
          throw new Error("FTP Public URL is not configured.");
        }
        
        fileUrl = `${publicUrl}/${uniqueName}`;
      } catch (err: any) {
        console.error("FTP Upload Error:", err);
        client.close();
        return NextResponse.json({ error: `FTP Upload failed: ${err.message}` }, { status: 500 });
      }
    } else {
      // Local storage fallback
      const uploadDir = path.join(process.cwd(), "public", "uploads", "cvs");
      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, uniqueName);
      await writeFile(filePath, buffer);

      fileUrl = `/uploads/cvs/${uniqueName}`;
    }

    // Check if user already has a pending or completed CV analysis
    // For now, we will just create a new one, but we could also update the existing if it's PENDING
    const cvAnalysis = await prisma.cVAnalysis.create({
      data: {
        userId: session.id,
        fileUrl,
        fileName: file.name,
        status: "PENDING",
      }
    });

    return NextResponse.json({
      success: true,
      cvAnalysisId: cvAnalysis.id,
      fileUrl: cvAnalysis.fileUrl,
    });
  } catch (error: any) {
    console.error("[CV Upload Error]", error);
    return NextResponse.json({ error: "Failed to upload CV" }, { status: 500 });
  }
}
