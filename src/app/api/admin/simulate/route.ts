import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateDiscResult } from "@/lib/disc-engine";

const SimulateSchema = z.object({
  optionIds: z.array(z.string().min(1)).min(1),
});

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = SimulateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const options = await prisma.option.findMany({ where: { id: { in: parsed.data.optionIds } } });
  if (options.length === 0) {
    return NextResponse.json({ error: "Nenhuma alternativa válida informada." }, { status: 400 });
  }

  const result = calculateDiscResult(
    options.map((o) => ({ scoreD: o.scoreD, scoreI: o.scoreI, scoreS: o.scoreS, scoreC: o.scoreC }))
  );

  // Não persiste participante nem tentativa real — apenas retorna o cálculo.
  return NextResponse.json({ result });
}
