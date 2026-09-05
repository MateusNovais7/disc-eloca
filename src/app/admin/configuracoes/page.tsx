"use client";

import { useEffect, useState } from "react";

interface AssessmentRow {
  id: string; name: string; version: number; status: string;
  shuffleQuestions: boolean; shuffleOptions: boolean;
  requireDepartment: boolean; requireJobTitle: boolean;
}

export default function ConfiguracoesPage() {
  const [items, setItems] = useState<AssessmentRow[]>([]);

  function load() {
    fetch("/api/admin/assessments").then((r) => r.json()).then((d) => setItems(d.assessments ?? []));
  }
  useEffect(load, []);

  async function toggle(id: string, field: keyof AssessmentRow, value: boolean) {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
    await fetch(`/api/admin/assessments/${id}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-eloca-navy">Configurações</h1>
      <p className="mt-2 text-sm text-eloca-muted">
        Por padrão, embaralhamento fica desligado para facilitar a comparação
        com o teste atual (Easy LMS) durante a calibração.
      </p>
      <div className="mt-6 flex flex-col gap-4">
        {items.map((a) => (
          <div key={a.id} className="card">
            <p className="font-semibold text-eloca-navy">{a.name} (v{a.version})</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Toggle label="Embaralhar perguntas" checked={a.shuffleQuestions} onChange={(v) => toggle(a.id, "shuffleQuestions", v)} />
              <Toggle label="Embaralhar alternativas" checked={a.shuffleOptions} onChange={(v) => toggle(a.id, "shuffleOptions", v)} />
              <Toggle label="Departamento obrigatório" checked={a.requireDepartment} onChange={(v) => toggle(a.id, "requireDepartment", v)} />
              <Toggle label="Cargo obrigatório" checked={a.requireJobTitle} onChange={(v) => toggle(a.id, "requireJobTitle", v)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
