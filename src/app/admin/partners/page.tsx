import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import PartnersClient from "./PartnersClient";

export default async function PartnersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/auth/login");
  }

  // @ts-ignore
  const partners = prisma.partner 
    ? await prisma.partner.findMany({
        orderBy: { order: "asc" },
      })
    : [];

  return <PartnersClient user={session} partners={partners} />;
}
