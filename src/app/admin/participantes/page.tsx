"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AttemptRow {
  id: string;
  completedAt: string | null;
  result: { combination: string } | null;
}
interface ParticipantRow {
  id: string; name: string; email: string; department: string | null; jobTitle: string | null;
  attempts: AttemptRow[];
}

export default function ParticipantesPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<ParticipantRow[]>([]);

  function load(query: string) {
    fetch(`/api/admin/participants?q=${encodeURIComponent(query)}`).then((r) => r.json()).then((d) => setItems(d.participants ?? []));
  }
  useEffect(() => load(""), []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-eloca-navy">Participantes</h1>
      <input
        placeholder="Buscar por nome ou e-mail..."
        value={q}
        onChange={(e) => { setQ(e.target.value); load(e.target.value); }}
        className="mt-4 w-80 rounded-lg border border-eloca-border px-4 py-2"
      />
      <table className="mt-6 w-full overflow-hidden rounded-xl2 bg-white text-sm shadow-sm">
        <thead className="bg-eloca-bg text-left text-eloca-muted">
          <tr>
            <th className="p-4">Nome</th>
            <th className="p-4">E-mail</th>
            <th className="p-4">Departamento</th>
            <th className="p-4">Cargo</th>
            <th className="p-4">Histórico</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id} className="border-t border-eloca-border align-top">
              <td className="p-4 font-medium">{p.name}</td>
              <td className="p-4">{p.email}</td>
              <td className="p-4">{p.department ?? "—"}</td>
              <td className="p-4">{p.jobTitle ?? "—"}</td>
              <td className="p-4">
                <div className="flex flex-col gap-1">
                  {p.attempts.map((a) => (
                    <Link key={a.id} href={`/admin/resultados/${a.id}`} className="text-eloca-green hover:underline">
                      {a.completedAt ? new Date(a.completedAt).toLocaleDateString("pt-BR") : "—"} — {a.result?.combination}
                    </Link>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
