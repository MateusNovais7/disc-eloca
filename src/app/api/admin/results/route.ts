import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const q = params.get("q")?.trim();
  const from = params.get("from");
  const to = params.get("to");
  const department = params.get("department")?.trim();
  const jobTitle = params.get("jobTitle")?.trim();
  const primaryProfile = params.get("primaryProfile");
  const combination = params.get("combination")?.trim();

  const attempts = await prisma.assessmentAttempt.findMany({
    where: {
      status: "COMPLETED",
      isSimulation: false,
      ...(from || to
        ? { completedAt: { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined } }
        : {}),
      participant: q
        ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
        : {
            ...(department ? { department: { contains: department, mode: "insensitive" } } : {}),
            ...(jobTitle ? { jobTitle: { contains: jobTitle, mode: "insensitive" } } : {}),
          },
      ...(primaryProfile ? { result: { primaryProfile: primaryProfile as "D" | "I" | "S" | "C" } } : {}),
      ...(combination ? { result: { combination } } : {}),
    },
    orderBy: { completedAt: "desc" },
    take: 200,
    include: { participant: true, result: true, assessment: { select: { name: true, version: true } } },
  });

  return NextResponse.json({ attempts });
}
