"use client";

import { useState } from "react";

export default function RelatoriosPage() {
  const [filters, setFilters] = useState({
    from: "", to: "", department: "", jobTitle: "", primaryProfile: "",
  });

  function buildUrl() {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    return `/api/admin/reports/export?${params.toString()}`;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-eloca-navy">Relatórios</h1>
      <div className="card mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm">
          Período (de)
          <input type="date" className="rounded-lg border border-eloca-border px-3 py-2"
            value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Período (até)
          <input type="date" className="rounded-lg border border-eloca-border px-3 py-2"
            value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Departamento
          <input className="rounded-lg border border-eloca-border px-3 py-2"
            value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Cargo
          <input className="rounded-lg border border-eloca-border px-3 py-2"
            value={filters.jobTitle} onChange={(e) => setFilters({ ...filters, jobTitle: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Perfil predominante
          <select className="rounded-lg border border-eloca-border px-3 py-2"
            value={filters.primaryProfile} onChange={(e) => setFilters({ ...filters, primaryProfile: e.target.value })}>
            <option value="">Todos</option>
            <option value="D">D</option><option value="I">I</option>
            <option value="S">S</option><option value="C">C</option>
          </select>
        </label>
      </div>
      <a href={buildUrl()} className="btn-primary mt-6 inline-flex">
        Exportar CSV
      </a>
      <p className="mt-2 text-xs text-eloca-muted">
        O CSV inclui pontuação bruta, percentuais, perfil primário/secundário
        e combinação de cada participante filtrado.
      </p>
    </div>
  );
}
