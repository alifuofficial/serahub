import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import * as ftp from "basic-ftp";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon", "image/webp"];
const DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-rar-compressed",
  "text/plain",
  "text/csv",
];

const ALL_ALLOWED = [...IMAGE_TYPES, ...DOC_TYPES];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const MAX_DOC_SIZE = 50 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALL_ALLOWED.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|txt|csv|png|jpg|jpeg|gif|svg|ico|webp)$/i)) {
    return NextResponse.json({ error: "Invalid file type." }, { status: 400 });
  }

  const isImage = IMAGE_TYPES.includes(file.type) || /\.(png|jpg|jpeg|gif|svg|ico|webp)$/i.test(file.name);
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOC_SIZE;

  if (file.size > maxSize) {
    return NextResponse.json({ error: `File too large. Max ${isImage ? "2MB" : "50MB"}.` }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "bin";
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

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
      const remotePath = path.posix.join(remoteRoot, uniqueName);
      
      const stream = new (require("stream").Readable)();
      stream.push(buffer);
      stream.push(null);

      await client.uploadFrom(stream, remotePath);
      await client.close();

      const publicUrl = config.ftp_public_url?.trim().replace(/\/$/, "") || "";
      if (!publicUrl) {
        throw new Error("FTP Public URL is not configured. Images will not be visible.");
      }
      
      const url = `${publicUrl}/${uniqueName}`;

      // Save to Media model
      const media = await prisma.media.create({
        data: {
          name: file.name,
          url,
          type: file.type,
          size: file.size,
          key: uniqueName,
          storage: "ftp",
        }
      });

      return NextResponse.json({
        id: media.id,
        url: media.url,
        name: media.name,
        size: media.size,
        type: media.type,
      });
    } catch (err: any) {
      console.error("FTP Upload Error:", err);
      client.close();
      return NextResponse.json({ error: `FTP Upload failed: ${err.message}` }, { status: 500 });
    }
  }

  // Local storage fallback
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, uniqueName);
  await writeFile(filePath, buffer);

  const url = `/uploads/${uniqueName}`;

  // Save to Media model
  const media = await prisma.media.create({
    data: {
      name: file.name,
      url,
      type: file.type,
      size: file.size,
      key: uniqueName,
      storage: "local",
    }
  });

  return NextResponse.json({
    id: media.id,
    url: media.url,
    name: media.name,
    size: media.size,
    type: media.type,
  });
}