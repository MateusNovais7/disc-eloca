"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalAttempts: number;
  attemptsToday: number;
  attemptsThisMonth: number;
  distribution: { D: number; I: number; S: number; C: number };
  topCombinations: { combination: string; count: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) return <p className="text-eloca-muted">Carregando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-eloca-navy">Dashboard</h1>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <StatCard label="Total de testes realizados" value={stats.totalAttempts} />
        <StatCard label="Testes hoje" value={stats.attemptsToday} />
        <StatCard label="Testes no mês" value={stats.attemptsThisMonth} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-eloca-navy">Distribuição por perfil predominante</h2>
          <div className="mt-4 flex flex-col gap-2">
            {(["D", "I", "S", "C"] as const).map((p) => (
              <div key={p} className="flex items-center justify-between text-sm">
                <span>{p}</span>
                <span className="font-semibold">{stats.distribution[p]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="font-semibold text-eloca-navy">Combinações mais frequentes</h2>
          <div className="mt-4 flex flex-col gap-2">
            {stats.topCombinations.map((c) => (
              <div key={c.combination} className="flex items-center justify-between text-sm">
                <span>{c.combination}</span>
                <span className="font-semibold">{c.count}</span>
              </div>
            ))}
            {stats.topCombinations.length === 0 && (
              <p className="text-sm text-eloca-muted">Nenhum dado ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <p className="text-sm text-eloca-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-eloca-navy">{value}</p>
    </div>
  );
}
