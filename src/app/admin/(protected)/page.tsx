"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

interface Stats {
  totalAttempts: number;
  attemptsToday: number;
  attemptsThisMonth: number;
  distribution: { D: number; I: number; S: number; C: number };
  averagePercentage: { D: number; I: number; S: number; C: number };
  topCombinations: { combination: string; count: number }[];
  recentAttempts: { id: string; name: string; completedAt: string | null; combination: string }[];
}

const PROFILE_COLORS: Record<string, string> = { D: "#E4572E", I: "#F2B705", S: "#07C97F", C: "#2E6BE4" };

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) return <p className="text-eloca-muted">Carregando...</p>;

  const chartData = (["D", "I", "S", "C"] as const).map((p) => ({
    profile: p,
    testes: stats.distribution[p],
    media: Math.round(stats.averagePercentage[p]),
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-eloca-navy">Dashboard</h1>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <StatCard label="Total de testes realizados" value={stats.totalAttempts} />
        <StatCard label="Testes hoje" value={stats.attemptsToday} />
        <StatCard label="Testes no mês" value={stats.attemptsThisMonth} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-6">
        <div className="card col-span-2">
          <h2 className="font-semibold text-eloca-navy">Distribuição por perfil predominante</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="profile" />
                <YAxis allowDecimals={false} />
                <Bar dataKey="testes" radius={[6, 6, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.profile} fill={PROFILE_COLORS[d.profile]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-eloca-muted">
            Percentual médio geral — D {Math.round(stats.averagePercentage.D)}% · I {Math.round(stats.averagePercentage.I)}% ·
            {" "}S {Math.round(stats.averagePercentage.S)}% · C {Math.round(stats.averagePercentage.C)}%
          </p>
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

      <div className="card mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-eloca-navy">Atividade recente</h2>
          <Link href="/admin/resultados" className="text-sm text-eloca-green hover:underline">Ver todos</Link>
        </div>
        <div className="mt-4 flex flex-col divide-y divide-eloca-border">
          {stats.recentAttempts.map((a) => (
            <Link
              key={a.id}
              href={`/admin/resultados/${a.id}`}
              className="flex items-center justify-between py-3 text-sm hover:text-eloca-green"
            >
              <span className="font-medium">{a.name}</span>
              <span className="text-eloca-muted">
                {a.completedAt && new Date(a.completedAt).toLocaleDateString("pt-BR")}
              </span>
              <span className="font-semibold">{a.combination}</span>
            </Link>
          ))}
          {stats.recentAttempts.length === 0 && (
            <p className="py-3 text-sm text-eloca-muted">Nenhum teste concluído ainda.</p>
          )}
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
