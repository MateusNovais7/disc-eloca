"use client";

import { useEffect, useState } from "react";

interface OptionRow { id: string; text: string; }
interface QuestionRow { id: string; text: string; position: number; options: OptionRow[]; }
interface AssessmentRow { id: string; name: string; version: number; }

export default function SimuladorPage() {
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [assessmentId, setAssessmentId] = useState<string>("");
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [result, setResult] = useState<null | {
    raw: Record<string, number>; percentage: Record<string, number>;
    primaryProfile: string; secondaryProfile: string; combination: string; tieBreakApplied: boolean;
  }>(null);

  useEffect(() => {
    fetch("/api/admin/assessments").then((r) => r.json()).then((d) => setAssessments(d.assessments ?? []));
  }, []);

  useEffect(() => {
    if (!assessmentId) return;
    fetch(`/api/admin/assessments/${assessmentId}`).then((r) => r.json()).then((d) => setQuestions(d.assessment.questions));
    setSelected({});
    setResult(null);
  }, [assessmentId]);

  async function calcular() {
    const optionIds = Object.values(selected);
    const res = await fetch("/api/admin/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionIds }),
    });
    const data = await res.json();
    if (res.ok) setResult(data.result);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-eloca-navy">Simular resultado</h1>
      <p className="mt-2 text-sm text-eloca-muted">
        Marque manualmente uma alternativa por questão para calibrar o teste
        comparando com o resultado do Easy LMS. Nada aqui é salvo como
        participante real.
      </p>

      <select
        className="mt-4 rounded-lg border border-eloca-border px-4 py-2"
        value={assessmentId}
        onChange={(e) => setAssessmentId(e.target.value)}
      >
        <option value="">Selecione um teste</option>
        {assessments.map((a) => (
          <option key={a.id} value={a.id}>{a.name} (v{a.version})</option>
        ))}
      </select>

      <div className="mt-6 flex flex-col gap-4">
        {questions.map((q) => (
          <div key={q.id} className="card">
            <p className="font-medium">{q.position}. {q.text}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {q.options.map((o) => (
                <label key={o.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={q.id}
                    checked={selected[q.id] === o.id}
                    onChange={() => setSelected((prev) => ({ ...prev, [q.id]: o.id }))}
                  />
                  {o.text}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {questions.length > 0 && (
        <button className="btn-primary mt-6" onClick={calcular} disabled={Object.keys(selected).length !== questions.length}>
          Calcular
        </button>
      )}

      {result && (
        <div className="card mt-6">
          <h2 className="font-semibold text-eloca-navy">Resultado simulado</h2>
          <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
            {(["D", "I", "S", "C"] as const).map((p) => (
              <div key={p}>
                <p className="text-eloca-muted">{p}</p>
                <p className="font-bold">{result.raw[p]} ({result.percentage[p].toFixed(1)}%)</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm">
            Primário: <strong>{result.primaryProfile}</strong> · Secundário:{" "}
            <strong>{result.secondaryProfile}</strong> · Combinação:{" "}
            <strong>{result.combination}</strong>
            {result.tieBreakApplied && <span className="ml-2 text-eloca-muted">(desempate aplicado)</span>}
          </p>
        </div>
      )}
    </div>
  );
}
