import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const baseWhere = { status: "COMPLETED" as const, isSimulation: false };

  const [total, today, month, results, recent] = await Promise.all([
    prisma.assessmentAttempt.count({ where: baseWhere }),
    prisma.assessmentAttempt.count({ where: { ...baseWhere, completedAt: { gte: startOfDay } } }),
    prisma.assessmentAttempt.count({ where: { ...baseWhere, completedAt: { gte: startOfMonth } } }),
    prisma.result.findMany({
      where: { attempt: { isSimulation: false } },
      select: {
        primaryProfile: true, combination: true,
        percentageD: true, percentageI: true, percentageS: true, percentageC: true,
      },
    }),
    prisma.assessmentAttempt.findMany({
      where: baseWhere,
      orderBy: { completedAt: "desc" },
      take: 6,
      include: { participant: true, result: true },
    }),
  ]);

  const distribution = { D: 0, I: 0, S: 0, C: 0 };
  const combinationCounts = new Map<string, number>();
  const sumPct = { D: 0, I: 0, S: 0, C: 0 };
  for (const r of results) {
    distribution[r.primaryProfile] += 1;
    combinationCounts.set(r.combination, (combinationCounts.get(r.combination) ?? 0) + 1);
    sumPct.D += r.percentageD; sumPct.I += r.percentageI; sumPct.S += r.percentageS; sumPct.C += r.percentageC;
  }
  const count = results.length || 1;
  const averagePercentage = {
    D: sumPct.D / count, I: sumPct.I / count, S: sumPct.S / count, C: sumPct.C / count,
  };
  const topCombinations = [...combinationCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([combination, count]) => ({ combination, count }));

  return NextResponse.json({
    totalAttempts: total,
    attemptsToday: today,
    attemptsThisMonth: month,
    distribution,
    averagePercentage,
    topCombinations,
    recentAttempts: recent.map((a) => ({
      id: a.id,
      name: a.participant?.name ?? "—",
      completedAt: a.completedAt,
      combination: a.result?.combination ?? "—",
    })),
  });
}
