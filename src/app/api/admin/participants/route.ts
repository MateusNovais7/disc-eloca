import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const search = req.nextUrl.searchParams.get("q")?.trim();

  const participants = await prisma.participant.findMany({
    where: search
      ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      attempts: {
        where: { status: "COMPLETED", isSimulation: false },
        orderBy: { completedAt: "desc" },
        include: { result: true },
      },
    },
    take: 200,
  });

  return NextResponse.json({ participants });
}
