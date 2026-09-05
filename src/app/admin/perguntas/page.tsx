"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface OptionRow {
  id: string; text: string; position: number;
  scoreD: number; scoreI: number; scoreS: number; scoreC: number;
}
interface QuestionRow {
  id: string; text: string; position: number; active: boolean; options: OptionRow[];
}
interface AssessmentDetail {
  id: string; name: string; version: number; questions: QuestionRow[];
}

function PerguntasContent() {
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get("assessmentId");
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!assessmentId) return;
    fetch(`/api/admin/assessments/${assessmentId}`).then((r) => r.json()).then((d) => setAssessment(d.assessment));
  }, [assessmentId]);

  async function updateScore(optionId: string, field: "scoreD" | "scoreI" | "scoreS" | "scoreC", value: number) {
    setSaving(optionId);
    await fetch(`/api/admin/options/${optionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    setAssessment((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map((q) => ({
          ...q,
          options: q.options.map((o) => (o.id === optionId ? { ...o, [field]: value } : o)),
        })),
      };
    });
    setSaving(null);
  }

  if (!assessmentId) {
    return <p className="text-eloca-muted">Selecione um teste em Admin &gt; Testes.</p>;
  }
  if (!assessment) return <p className="text-eloca-muted">Carregando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-eloca-navy">
        Perguntas — {assessment.name} (v{assessment.version})
      </h1>
      <p className="mt-2 text-sm text-eloca-muted">
        Ajuste a pontuação D/I/S/C de cada alternativa para calibrar o teste.
        Alterações aqui <strong>não afetam</strong> resultados já calculados
        (o histórico usa snapshots salvos no momento da resposta).
      </p>

      <div className="mt-6 flex flex-col gap-6">
        {assessment.questions.map((q) => (
          <div key={q.id} className="card">
            <p className="font-semibold text-eloca-navy">
              {q.position}. {q.text}
            </p>
            <table className="mt-3 w-full text-sm">
              <thead className="text-left text-eloca-muted">
                <tr>
                  <th className="py-1">Alternativa</th>
                  <th className="w-16 py-1">D</th>
                  <th className="w-16 py-1">I</th>
                  <th className="w-16 py-1">S</th>
                  <th className="w-16 py-1">C</th>
                </tr>
              </thead>
              <tbody>
                {q.options.map((o) => (
                  <tr key={o.id} className="border-t border-eloca-border">
                    <td className="py-2 pr-3">{o.text}</td>
                    {(["scoreD", "scoreI", "scoreS", "scoreC"] as const).map((field) => (
                      <td key={field} className="py-2">
                        <input
                          type="number"
                          defaultValue={o[field]}
                          disabled={saving === o.id}
                          onBlur={(e) => updateScore(o.id, field, Number(e.target.value))}
                          className="w-14 rounded border border-eloca-border px-2 py-1"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PerguntasPage() {
  return (
    <Suspense fallback={<p className="text-eloca-muted">Carregando...</p>}>
      <PerguntasContent />
    </Suspense>
  );
}
