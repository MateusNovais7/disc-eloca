"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AttemptRow {
  id: string;
  completedAt: string | null;
  participant: { name: string; email: string; department: string | null; jobTitle: string | null } | null;
  result: { combination: string; primaryProfile: string } | null;
  assessment: { name: string; version: number };
}

const emptyFilters = { q: "", from: "", to: "", department: "", jobTitle: "", primaryProfile: "", combination: "" };

export default function ResultadosPage() {
  const [filters, setFilters] = useState(emptyFilters);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [loading, setLoading] = useState(false);

  function load(f: typeof filters) {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => { if (v) params.set(k, v); });
    fetch(`/api/admin/results?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setAttempts(d.attempts ?? []))
      .finally(() => setLoading(false));
  }
  useEffect(() => load(emptyFilters), []);

  function update(field: keyof typeof filters, value: string) {
    const next = { ...filters, [field]: value };
    setFilters(next);
    load(next);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-eloca-navy">Resultados</h1>

      <div className="card mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          Buscar por nome ou e-mail
          <input
            value={filters.q}
            onChange={(e) => update("q", e.target.value)}
            className="rounded-lg border border-eloca-border px-3 py-2"
            placeholder="Ex: mateus ou @eloca.com.br"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          De
          <input type="date" value={filters.from} onChange={(e) => update("from", e.target.value)} className="rounded-lg border border-eloca-border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Até
          <input type="date" value={filters.to} onChange={(e) => update("to", e.target.value)} className="rounded-lg border border-eloca-border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Departamento
          <input value={filters.department} onChange={(e) => update("department", e.target.value)} className="rounded-lg border border-eloca-border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Cargo
          <input value={filters.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} className="rounded-lg border border-eloca-border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Perfil predominante
          <select value={filters.primaryProfile} onChange={(e) => update("primaryProfile", e.target.value)} className="rounded-lg border border-eloca-border px-3 py-2">
            <option value="">Todos</option>
            <option value="D">D</option><option value="I">I</option>
            <option value="S">S</option><option value="C">C</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Combinação
          <input value={filters.combination} onChange={(e) => update("combination", e.target.value)} placeholder="Ex: D/C" className="rounded-lg border border-eloca-border px-3 py-2" />
        </label>
        <button className="btn-secondary self-end" onClick={() => { setFilters(emptyFilters); load(emptyFilters); }}>
          Limpar filtros
        </button>
      </div>

      <table className="mt-6 w-full overflow-hidden rounded-xl2 bg-white text-sm shadow-sm">
        <thead className="bg-eloca-bg text-left text-eloca-muted">
          <tr>
            <th className="p-4">Participante</th>
            <th className="p-4">Departamento / Cargo</th>
            <th className="p-4">Teste</th>
            <th className="p-4">Data</th>
            <th className="p-4">Combinação</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((a) => (
            <tr key={a.id} className="border-t border-eloca-border">
              <td className="p-4">
                <p className="font-medium">{a.participant?.name}</p>
                <p className="text-xs text-eloca-muted">{a.participant?.email}</p>
              </td>
              <td className="p-4 text-xs text-eloca-muted">
                {a.participant?.department ?? "—"} {a.participant?.jobTitle ? `· ${a.participant.jobTitle}` : ""}
              </td>
              <td className="p-4 text-xs text-eloca-muted">{a.assessment.name} v{a.assessment.version}</td>
              <td className="p-4">{a.completedAt && new Date(a.completedAt).toLocaleDateString("pt-BR")}</td>
              <td className="p-4">
                <Link href={`/admin/resultados/${a.id}`} className="font-semibold text-eloca-green hover:underline">
                  {a.result?.combination}
                </Link>
              </td>
            </tr>
          ))}
          {!loading && attempts.length === 0 && (
            <tr><td colSpan={5} className="p-6 text-center text-eloca-muted">Nenhum resultado encontrado com esses filtros.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
