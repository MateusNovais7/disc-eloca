import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { combination: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (typeof body.content !== "string") {
    return NextResponse.json({ error: "content é obrigatório." }, { status: 400 });
  }

  const combination = decodeURIComponent(params.combination);
  const updated = await prisma.combinedProfileDescription.update({
    where: { combination },
    data: { content: body.content },
  });

  await prisma.auditLog.create({
    data: {
      adminUserId: session.sub,
      action: "combined_profile.update",
      entityType: "CombinedProfileDescription",
      entityId: combination,
    },
  });

  return NextResponse.json({ combined: updated });
}
