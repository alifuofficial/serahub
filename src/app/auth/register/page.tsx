import { prisma } from "@/lib/prisma";
import RegisterClient from "./RegisterClient";

export const dynamic = "force-dynamic";

export default async function RegisterPageWrapper() {
  const row = await prisma.siteConfig.findUnique({ where: { key: "registration_enabled" } });
  const registrationDisabled = row?.value === "false";

  return <RegisterClient registrationDisabled={registrationDisabled} />;
}