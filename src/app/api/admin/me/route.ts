import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const user = await prisma.adminUser.findUnique({
    where: { id: session.sub },
    select: { id: true, name: true, email: true, role: true, mustChangePassword: true },
  });
  if (!user) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  return NextResponse.json({ user });
}
