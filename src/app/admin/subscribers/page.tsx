import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import SubscribersClient from "./SubscribersClient";

export const metadata: Metadata = {
  title: "Subscribers | Admin | SeraHub",
};

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/auth/login");

  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serialized = subscribers.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));

  return <SubscribersClient user={session} subscribers={serialized} />;
}