import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { profile: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const profile = params.profile.toUpperCase();
  if (!["D", "I", "S", "C"].includes(profile)) {
    return NextResponse.json({ error: "Perfil inválido." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const allowedFields = [
    "title", "summary", "strengths", "attentionPoints", "communicationStyle",
    "howToCommunicate", "underPressure", "decisionMaking", "preferredEnvironment", "developmentTips",
  ] as const;
  const data: Record<string, string> = {};
  for (const f of allowedFields) {
    if (typeof body[f] === "string") data[f] = body[f];
  }

  const updated = await prisma.profileDescription.update({
    where: { profile: profile as "D" | "I" | "S" | "C" },
    data,
  });

  await prisma.auditLog.create({
    data: {
      adminUserId: session.sub,
      action: "profile_description.update",
      entityType: "ProfileDescription",
      entityId: profile,
    },
  });

  return NextResponse.json({ profile: updated });
}
