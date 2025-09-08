import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    // callbackUrl は最短でルートに。必要ならパスを個別に付け替えてください
    redirect("/login?callbackUrl=%2F");
  }
  return <>{children}</>;
}
