"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import * as ftp from "basic-ftp";
import { unlink } from "fs/promises";
import path from "path";

export async function getMediaAction(params: {
  page?: number;
  limit?: number;
  q?: string;
  type?: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const { page = 1, limit = 20, q, type } = params;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (q) {
    where.name = { contains: q };
  }
  if (type && type !== "all") {
    where.type = { startsWith: type };
  }

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.media.count({ where }),
  ]);

  return {
    items,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export async function deleteMediaAction(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) throw new Error("Media not found");

  // Delete from storage
  if (media.storage === "ftp") {
    const configRows = await prisma.siteConfig.findMany({
      where: { key: { in: ["ftp_host", "ftp_port", "ftp_user", "ftp_pass", "ftp_root"] } }
    });
    const config: Record<string, string> = {};
    configRows.forEach(row => config[row.key] = row.value);

    const client = new ftp.Client();
    try {
      await client.access({
        host: config.ftp_host,
        port: parseInt(config.ftp_port || "21"),
        user: config.ftp_user,
        password: config.ftp_pass,
      });

      const remoteRoot = config.ftp_root || "/";
      const remotePath = path.posix.join(remoteRoot, media.key);
      await client.remove(remotePath);
      await client.close();
    } catch (err) {
      console.error("FTP Deletion Error:", err);
      client.close();
      // Even if FTP fails (e.g. file already gone), we might want to proceed with DB deletion
    }
  } else {
    const filePath = path.join(process.cwd(), "public", "uploads", media.key);
    try {
      await unlink(filePath);
    } catch (err) {
      console.error("Local Deletion Error:", err);
    }
  }

  await prisma.media.delete({ where: { id } });
  revalidatePath("/admin/media");
  return { success: true };
}

export async function updateMediaAction(id: string, data: { name: string }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.media.update({
    where: { id },
    data: { name: data.name },
  });

  revalidatePath("/admin/media");
  return { success: true };
}

export async function getMediaStatsAction() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const stats = await prisma.media.groupBy({
    by: ["storage"],
    _sum: { size: true },
    _count: { id: true },
  });

  const result = {
    local: { size: 0, count: 0 },
    ftp: { size: 0, count: 0 },
    total: { size: 0, count: 0 }
  };

  stats.forEach(s => {
    if (s.storage === "local") {
      result.local.size = s._sum.size || 0;
      result.local.count = s._count.id || 0;
    } else if (s.storage === "ftp") {
      result.ftp.size = s._sum.size || 0;
      result.ftp.count = s._count.id || 0;
    }
    result.total.size += s._sum.size || 0;
    result.total.count += s._count.id || 0;
  });

  return result;
}
