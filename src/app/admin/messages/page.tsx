import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import MessagesClient from "./MessagesClient";

export const metadata: Metadata = {
  title: "Messages | Admin | SeraHub",
};

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/auth/login");

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serialized = messages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  return <MessagesClient user={session} messages={serialized} />;
}