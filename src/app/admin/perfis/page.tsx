"use client";

import { useEffect, useState } from "react";

interface ProfileDesc {
  profile: "D" | "I" | "S" | "C";
  title: string; summary: string; strengths: string; attentionPoints: string;
  communicationStyle: string; howToCommunicate: string; underPressure: string;
  decisionMaking: string; preferredEnvironment: string; developmentTips: string;
}
interface CombinedDesc { combination: string; content: string; }

export default function PerfisPage() {
  const [profiles, setProfiles] = useState<ProfileDesc[]>([]);
  const [combinations, setCombinations] = useState<CombinedDesc[]>([]);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/profiles").then((r) => r.json()).then((d) => {
      setProfiles(d.profiles ?? []);
      setCombinations(d.combinations ?? []);
    });
  }
  useEffect(load, []);

  async function saveProfileField(profile: string, field: string, value: string) {
    setSavingKey(profile + field);
    await fetch(`/api/admin/profiles/${profile}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    setSavingKey(null);
  }

  async function saveCombination(combination: string, content: string) {
    setSavingKey(combination);
    await fetch(`/api/admin/combined-profiles/${encodeURIComponent(combination)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setSavingKey(null);
  }

  const fields: { key: keyof ProfileDesc; label: string }[] = [
    { key: "title", label: "Título" },
    { key: "summary", label: "Resumo" },
    { key: "strengths", label: "Pontos fortes" },
    { key: "attentionPoints", label: "Pontos de atenção" },
    { key: "communicationStyle", label: "Forma de comunicação" },
    { key: "howToCommunicate", label: "Como prefere receber informações" },
    { key: "underPressure", label: "Comportamento sob pressão" },
    { key: "decisionMaking", label: "Tomada de decisão" },
    { key: "preferredEnvironment", label: "Ambiente de trabalho preferido" },
    { key: "developmentTips", label: "Como desenvolver esse perfil" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-eloca-navy">Perfis DISC</h1>

      <div className="mt-6 flex flex-col gap-6">
        {profiles.map((p) => (
          <div key={p.profile} className="card">
            <h2 className="font-semibold text-eloca-navy">Perfil {p.profile}</h2>
            <div className="mt-3 grid gap-3">
              {fields.map((f) => (
                <label key={f.key} className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-eloca-navy">{f.label}</span>
                  <textarea
                    defaultValue={p[f.key] as string}
                    disabled={savingKey === p.profile + f.key}
                    onBlur={(e) => saveProfileField(p.profile, f.key, e.target.value)}
                    className="min-h-[48px] rounded-lg border border-eloca-border px-3 py-2"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-bold text-eloca-navy">Combinações</h2>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {combinations.map((c) => (
          <div key={c.combination} className="card">
            <p className="font-semibold text-eloca-navy">{c.combination}</p>
            <textarea
              defaultValue={c.content}
              disabled={savingKey === c.combination}
              onBlur={(e) => saveCombination(c.combination, e.target.value)}
              className="mt-2 min-h-[80px] w-full rounded-lg border border-eloca-border px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
