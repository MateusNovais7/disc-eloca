import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function csvEscape(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const from = params.get("from");
  const to = params.get("to");
  const department = params.get("department");
  const jobTitle = params.get("jobTitle");
  const primaryProfile = params.get("primaryProfile");
  const assessmentId = params.get("assessmentId");

  const attempts = await prisma.assessmentAttempt.findMany({
    where: {
      status: "COMPLETED",
      isSimulation: false,
      ...(assessmentId ? { assessmentId } : {}),
      ...(from || to
        ? { completedAt: { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined } }
        : {}),
      participant: {
        ...(department ? { department: { contains: department, mode: "insensitive" } } : {}),
        ...(jobTitle ? { jobTitle: { contains: jobTitle, mode: "insensitive" } } : {}),
      },
      ...(primaryProfile ? { result: { primaryProfile: primaryProfile as "D" | "I" | "S" | "C" } } : {}),
    },
    include: { participant: true, result: true, assessment: true },
    orderBy: { completedAt: "desc" },
  });

  const header = [
    "nome", "email", "departamento", "cargo", "versao_teste", "data",
    "raw_d", "raw_i", "raw_s", "raw_c",
    "pct_d", "pct_i", "pct_s", "pct_c",
    "perfil_primario", "perfil_secundario", "combinacao",
  ];
  const rows = attempts.map((a) => [
    a.participant?.name ?? "",
    a.participant?.email ?? "",
    a.participant?.department ?? "",
    a.participant?.jobTitle ?? "",
    `v${a.assessment.version}`,
    a.completedAt?.toISOString() ?? "",
    String(a.result?.rawD ?? ""),
    String(a.result?.rawI ?? ""),
    String(a.result?.rawS ?? ""),
    String(a.result?.rawC ?? ""),
    a.result?.percentageD.toFixed(2) ?? "",
    a.result?.percentageI.toFixed(2) ?? "",
    a.result?.percentageS.toFixed(2) ?? "",
    a.result?.percentageC.toFixed(2) ?? "",
    a.result?.primaryProfile ?? "",
    a.result?.secondaryProfile ?? "",
    a.result?.combination ?? "",
  ]);

  const csv = [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="disc_eloca_relatorio_${Date.now()}.csv"`,
    },
  });
}
