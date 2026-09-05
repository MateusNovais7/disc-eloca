import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const allowed = ["shuffleQuestions", "shuffleOptions", "requireDepartment", "requireJobTitle"] as const;
  const data: Record<string, boolean> = {};
  for (const f of allowed) {
    if (typeof body[f] === "boolean") data[f] = body[f];
  }

  const updated = await prisma.assessment.update({ where: { id: params.id }, data });

  await prisma.auditLog.create({
    data: {
      adminUserId: session.sub,
      action: "assessment.settings.update",
      entityType: "Assessment",
      entityId: updated.id,
      metadata: data,
    },
  });

  return NextResponse.json({ assessment: updated });
}
