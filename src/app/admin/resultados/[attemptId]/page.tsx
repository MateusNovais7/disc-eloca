import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function AdminResultadoPage({ params }: { params: { attemptId: string } }) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: params.attemptId },
    include: {
      participant: true,
      result: true,
      answers: { include: { question: true, option: true }, orderBy: { question: { position: "asc" } } },
    },
  });

  if (!attempt || !attempt.result) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-eloca-navy">
        {attempt.participant?.name} — {attempt.result.combination}
      </h1>
      <p className="text-sm text-eloca-muted">
        {attempt.participant?.email} ·{" "}
        {attempt.completedAt && new Date(attempt.completedAt).toLocaleString("pt-BR")}
      </p>

      <div className="card mt-6 grid grid-cols-4 gap-4">
        <Stat label="D" value={attempt.result.rawD} pct={attempt.result.percentageD} />
        <Stat label="I" value={attempt.result.rawI} pct={attempt.result.percentageI} />
        <Stat label="S" value={attempt.result.rawS} pct={attempt.result.percentageS} />
        <Stat label="C" value={attempt.result.rawC} pct={attempt.result.percentageC} />
      </div>

      <h2 className="mt-8 font-semibold text-eloca-navy">Respostas</h2>
      <div className="mt-3 flex flex-col gap-2">
        {attempt.answers.map((a) => (
          <div key={a.id} className="card text-sm">
            <p className="text-eloca-muted">Questão {a.question.position}: {a.question.text}</p>
            <p className="font-medium">"{a.option.text}"</p>
            <p className="text-xs text-eloca-muted">
              D+{a.scoreDSnapshot} I+{a.scoreISnapshot} S+{a.scoreSSnapshot} C+{a.scoreCSnapshot}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, pct }: { label: string; value: number; pct: number }) {
  return (
    <div>
      <p className="text-eloca-muted">{label}</p>
      <p className="text-xl font-bold text-eloca-navy">{value} <span className="text-sm font-normal text-eloca-muted">({pct.toFixed(1)}%)</span></p>
    </div>
  );
}
