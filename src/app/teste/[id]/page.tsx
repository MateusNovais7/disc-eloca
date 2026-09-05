"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

interface OptionDTO {
  id: string;
  text: string;
  position: number;
}
interface QuestionDTO {
  id: string;
  text: string;
  position: number;
  options: OptionDTO[];
}
interface AssessmentDTO {
  id: string;
  name: string;
  requireDepartment: boolean;
  requireJobTitle: boolean;
  questions: QuestionDTO[];
}

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "quiz" }
  | { kind: "review" }
  | { kind: "identify" }
  | { kind: "submitting" };

function resumeKey(assessmentId: string) {
  return `disc_eloca_resume_${assessmentId}`;
}

export default function TestePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const assessmentId = params.id;

  const [assessment, setAssessment] = useState<AssessmentDTO | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> optionId
  const [view, setView] = useState<ViewState>({ kind: "loading" });
  const [form, setForm] = useState({ name: "", email: "", department: "", jobTitle: "" });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const res = await fetch(`/api/assessments/${assessmentId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (!cancelled) setView({ kind: "error", message: data.error ?? "Teste indisponível." });
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setAssessment(data.assessment);

        const storedToken = typeof window !== "undefined" ? localStorage.getItem(resumeKey(assessmentId)) : null;

        const startRes = await fetch("/api/attempts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assessmentId, resumeToken: storedToken ?? undefined }),
        });
        const startData = await startRes.json();
        if (!startRes.ok) {
          if (!cancelled) setView({ kind: "error", message: startData.error ?? "Não foi possível iniciar o teste." });
          return;
        }
        if (cancelled) return;
        setAttemptId(startData.attempt.id);
        if (typeof window !== "undefined") {
          localStorage.setItem(resumeKey(assessmentId), startData.attempt.resumeToken);
        }
        const prevAnswers: Record<string, string> = {};
        for (const a of startData.attempt.answers ?? []) {
          prevAnswers[a.questionId] = a.optionId;
        }
        setAnswers(prevAnswers);
        setCurrent(Object.keys(prevAnswers).length);
        setView({ kind: "quiz" });
      } catch {
        if (!cancelled) setView({ kind: "error", message: "Erro de conexão. Tente novamente." });
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [assessmentId]);

  const saveAnswer = useCallback(
    async (questionId: string, optionId: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
      if (!attemptId) return;
      await fetch(`/api/attempts/${attemptId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, optionId }),
      });
    },
    [attemptId]
  );

  if (view.kind === "loading") {
    return <CenteredMessage>Carregando teste...</CenteredMessage>;
  }
  if (view.kind === "error") {
    return <CenteredMessage error>{view.message}</CenteredMessage>;
  }
  if (!assessment || !attemptId) {
    return <CenteredMessage error>Não foi possível carregar o teste.</CenteredMessage>;
  }

  const questions = assessment.questions;
  const total = questions.length;

  if (view.kind === "quiz") {
    const question = questions[current];
    const selected = answers[question.id];

    const goNext = () => {
      if (current + 1 < total) {
        setCurrent(current + 1);
      } else {
        setView({ kind: "review" });
      }
    };
    const goBack = () => {
      if (current > 0) setCurrent(current - 1);
    };

    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-12">
        <ProgressBar current={current + 1} total={total} />
        <p className="mt-6 text-sm font-medium text-eloca-muted">
          Questão {current + 1} de {total}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-eloca-navy">{question.text}</h2>

        <div className="mt-8 flex flex-col gap-3">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => saveAnswer(question.id, opt.id)}
              className={`rounded-xl2 border px-5 py-4 text-left transition ${
                selected === opt.id
                  ? "border-eloca-green bg-eloca-green/10 font-semibold text-eloca-navy"
                  : "border-eloca-border bg-white hover:border-eloca-green/50"
              }`}
            >
              {opt.text}
            </button>
          ))}
        </div>

        <div className="mt-10 flex justify-between">
          <button onClick={goBack} disabled={current === 0} className="btn-secondary disabled:opacity-40">
            Voltar
          </button>
          <button onClick={goNext} disabled={!selected} className="btn-primary">
            {current + 1 < total ? "Próxima" : "Revisar respostas"}
          </button>
        </div>
      </main>
    );
  }

  if (view.kind === "review") {
    const unanswered = questions.filter((q) => !answers[q.id]);
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <h2 className="text-2xl font-bold text-eloca-navy">Revise suas respostas</h2>
        <p className="mt-2 text-sm text-eloca-muted">
          Você pode voltar e alterar qualquer resposta antes de finalizar.
        </p>
        <ul className="mt-6 flex flex-col gap-3">
          {questions.map((q, idx) => (
            <li key={q.id} className="card flex items-center justify-between">
              <div>
                <p className="text-sm text-eloca-muted">Questão {idx + 1}</p>
                <p className="font-medium">{q.text}</p>
                <p className="text-sm text-eloca-green">
                  {q.options.find((o) => o.id === answers[q.id])?.text ?? "Sem resposta"}
                </p>
              </div>
              <button className="btn-secondary" onClick={() => { setCurrent(idx); setView({ kind: "quiz" }); }}>
                Editar
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex justify-end">
          <button
            className="btn-primary"
            disabled={unanswered.length > 0}
            onClick={() => setView({ kind: "identify" })}
          >
            Continuar
          </button>
        </div>
      </main>
    );
  }

  if (view.kind === "identify" || view.kind === "submitting") {
    const submit = async () => {
      setFormError(null);
      if (!form.name.trim() || !form.email.trim()) {
        setFormError("Nome e e-mail são obrigatórios.");
        return;
      }
      setView({ kind: "submitting" });
      const res = await fetch(`/api/attempts/${attemptId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Não foi possível calcular seu resultado.");
        setView({ kind: "identify" });
        return;
      }
      if (typeof window !== "undefined") localStorage.removeItem(resumeKey(assessmentId));
      router.push(`/resultado/${data.attemptId}`);
    };

    return (
      <main className="mx-auto max-w-md px-6 py-16">
        <h2 className="text-2xl font-bold text-eloca-navy">Quase lá!</h2>
        <p className="mt-2 text-sm text-eloca-muted">
          Preencha seus dados para visualizar seu perfil comportamental.
        </p>
        <div className="mt-6 flex flex-col gap-4">
          <Field label="Nome *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="E-mail *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label="Departamento" value={form.department} onChange={(v) => setForm({ ...form, department: v })} />
          <Field label="Cargo" value={form.jobTitle} onChange={(v) => setForm({ ...form, jobTitle: v })} />
        </div>
        {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}
        <p className="mt-6 text-xs text-eloca-muted">
          Suas informações serão utilizadas internamente pela Eloca para fins
          de desenvolvimento e análise de tendência comportamental.
        </p>
        <button onClick={submit} disabled={view.kind === "submitting"} className="btn-primary mt-6 w-full">
          {view.kind === "submitting" ? "Calculando..." : "Mostrar meu resultado"}
        </button>
      </main>
    );
  }

  return null;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-eloca-navy">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-eloca-border px-4 py-3 text-base outline-none focus:border-eloca-green"
      />
    </label>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-eloca-border">
      <div className="h-full bg-eloca-green transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

function CenteredMessage({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <p className={error ? "text-red-600" : "text-eloca-muted"}>{children}</p>
    </main>
  );
}
