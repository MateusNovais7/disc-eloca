"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

const PROFILE_LABELS: Record<string, string> = {
  D: "Dominância",
  I: "Influência",
  S: "Estabilidade",
  C: "Conformidade",
};

interface ResultDTO {
  rawD: number; rawI: number; rawS: number; rawC: number;
  percentageD: number; percentageI: number; percentageS: number; percentageC: number;
  primaryProfile: "D" | "I" | "S" | "C";
  secondaryProfile: "D" | "I" | "S" | "C";
  combination: string;
}
interface ProfileDescDTO {
  title: string; summary: string; strengths: string; attentionPoints: string;
  communicationStyle: string;
}

export default function ResultadoPage() {
  const params = useParams<{ attemptId: string }>();
  const [data, setData] = useState<{
    participantName: string;
    result: ResultDTO;
    primaryDesc: ProfileDescDTO | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/results/${params.attemptId}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setData(json);
      })
      .catch((e) => setError(e.message ?? "Erro ao carregar resultado."));
  }, [params.attemptId]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }
  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-eloca-muted">Carregando resultado...</p>
      </main>
    );
  }

  const { result, participantName, primaryDesc } = data;
  const chartData = [
    { profile: "D", value: result.percentageD },
    { profile: "I", value: result.percentageI },
    { profile: "S", value: result.percentageS },
    { profile: "C", value: result.percentageC },
  ];
  const bars: { key: "D" | "I" | "S" | "C"; pct: number }[] = (
    [
      { key: "D", pct: result.percentageD },
      { key: "I", pct: result.percentageI },
      { key: "S", pct: result.percentageS },
      { key: "C", pct: result.percentageC },
    ] as { key: "D" | "I" | "S" | "C"; pct: number }[]
  ).sort((a, b) => b.pct - a.pct);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-eloca-muted">Parabéns, {participantName.split(" ")[0]}.</p>
      <h1 className="mt-1 text-3xl font-extrabold text-eloca-navy">
        Seu perfil comportamental: {result.combination}
      </h1>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div className="card flex flex-col gap-3">
          {bars.map((b) => (
            <div key={b.key}>
              <div className="flex justify-between text-sm font-medium">
                <span>{PROFILE_LABELS[b.key]}</span>
                <span>{b.pct.toFixed(0)}%</span>
              </div>
              <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-eloca-border">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${b.pct}%`,
                    backgroundColor:
                      b.key === "D" ? "#E4572E" : b.key === "I" ? "#F2B705" : b.key === "S" ? "#07C97F" : "#2E6BE4",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="card h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="profile" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar dataKey="value" stroke="#07C97F" fill="#07C97F" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {primaryDesc && (
        <section className="card mt-8">
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
            <div className="sm:col-span-2">
              <h3 className="font-semibold text-eloca-navy">Como se comunicar com você</h3>
              <p className="text-sm text-eloca-muted">{primaryDesc.communicationStyle}</p>
            </div>
          </div>
        </section>
      )}

      <p className="mt-8 text-xs text-eloca-muted">
        Este resultado representa uma tendência comportamental, não um
        diagnóstico psicológico.
      </p>
    </main>
  );
}
