import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import DownloadCountdown from "@/components/common/DownloadCountdown";

interface Params {
  params: Promise<{ fileId: string }>;
}

export const dynamic = "force-dynamic";

export default async function DownloadPage({ params }: Params) {
  const { fileId } = await params;
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const file = await prisma.file.findUnique({ where: { id: fileId }, include: { bid: true } });
  if (!file) return notFound();

  return (
    <DownloadCountdown
      fileId={file.id}
      fileName={file.name}
      filePath={file.path}
      bidTitle={file.bid.title}
    />
  );
}