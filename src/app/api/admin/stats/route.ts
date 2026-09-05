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

  const [total, today, month, results] = await Promise.all([
    prisma.assessmentAttempt.count({ where: baseWhere }),
    prisma.assessmentAttempt.count({ where: { ...baseWhere, completedAt: { gte: startOfDay } } }),
    prisma.assessmentAttempt.count({ where: { ...baseWhere, completedAt: { gte: startOfMonth } } }),
    prisma.result.findMany({
      where: { attempt: { isSimulation: false } },
      select: { primaryProfile: true, combination: true },
    }),
  ]);

  const distribution = { D: 0, I: 0, S: 0, C: 0 };
  const combinationCounts = new Map<string, number>();
  for (const r of results) {
    distribution[r.primaryProfile] += 1;
    combinationCounts.set(r.combination, (combinationCounts.get(r.combination) ?? 0) + 1);
  }
  const topCombinations = [...combinationCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([combination, count]) => ({ combination, count }));

  return NextResponse.json({
    totalAttempts: total,
    attemptsToday: today,
    attemptsThisMonth: month,
    distribution,
    topCombinations,
  });
}
