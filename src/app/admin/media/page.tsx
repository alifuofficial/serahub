import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import MediaClient from "./MediaClient";

export const metadata: Metadata = {
  title: "Media Library | SeraHub Admin",
};

export default async function MediaPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/auth/login");
  }

  return <MediaClient user={session} />;
}
