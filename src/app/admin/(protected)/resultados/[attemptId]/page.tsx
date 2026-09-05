import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ResultCharts } from "./ResultCharts";

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

  const primaryDesc = await prisma.profileDescription.findUnique({
    where: { profile: attempt.result.primaryProfile },
  });

  return (
    <div>
      <p className="text-eloca-muted">{attempt.participant?.name}</p>
      <h1 className="text-2xl font-bold text-eloca-navy">
        Perfil comportamental: {attempt.result.combination}
      </h1>
      <p className="text-sm text-eloca-muted">
        {attempt.participant?.email}
        {attempt.participant?.department ? ` · ${attempt.participant.department}` : ""}
        {attempt.participant?.jobTitle ? ` · ${attempt.participant.jobTitle}` : ""}
        {" · "}
        {attempt.completedAt && new Date(attempt.completedAt).toLocaleString("pt-BR")}
      </p>

      {/* Exatamente a mesma visualização (barras + radar) que o participante viu no resultado */}
      <div className="mt-6">
        <ResultCharts
          percentageD={attempt.result.percentageD}
          percentageI={attempt.result.percentageI}
          percentageS={attempt.result.percentageS}
          percentageC={attempt.result.percentageC}
        />
      </div>

      {primaryDesc && (
        <section className="card mt-6">
          <h2 className="text-xl font-bold text-eloca-navy">{primaryDesc.title}</h2>
          <p className="mt-2 text-eloca-ink">{primaryDesc.summary}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-eloca-navy">Pontos fortes</h3>
              <p className="text-sm text-eloca-muted">{primaryDesc.strengths}</p>
            </div>
            <div>
              <h3 className="font-semibold text-eloca-navy">Pontos de atenção</h3>
              <p className="text-sm text-eloca-muted">{primaryDesc.attentionPoints}</p>
            </div>
          </div>
        </section>
      )}

      <h2 className="mt-8 font-semibold text-eloca-navy">Detalhe administrativo — respostas e pontuação bruta</h2>
      <p className="text-xs text-eloca-muted">Visível apenas para administradores.</p>
      <div className="mt-3 grid grid-cols-4 gap-4">
        <Stat label="D" value={attempt.result.rawD} pct={attempt.result.percentageD} />
        <Stat label="I" value={attempt.result.rawI} pct={attempt.result.percentageI} />
        <Stat label="S" value={attempt.result.rawS} pct={attempt.result.percentageS} />
        <Stat label="C" value={attempt.result.rawC} pct={attempt.result.percentageC} />
      </div>
      <div className="mt-4 flex flex-col gap-2">
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
    <div className="card">
      <p className="text-eloca-muted">{label}</p>
      <p className="text-xl font-bold text-eloca-navy">{value} <span className="text-sm font-normal text-eloca-muted">({pct.toFixed(1)}%)</span></p>
    </div>
  );
}
