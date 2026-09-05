"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ASSESSMENT_STATUS_LABELS, ASSESSMENT_STATUS_COLORS } from "@/lib/labels";

interface AssessmentRow {
  id: string;
  name: string;
  version: number;
  status: string;
  createdAt: string;
  _count: { attempts: number; questions: number };
}

export default function TestesPage() {
  const [items, setItems] = useState<AssessmentRow[]>([]);

  function load() {
    fetch("/api/admin/assessments").then((r) => r.json()).then((d) => setItems(d.assessments ?? []));
  }
  useEffect(load, []);

  async function setStatus(id: string, status: string) {
    await fetch(`/api/admin/assessments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-eloca-navy">Testes</h1>
      <table className="mt-6 w-full overflow-hidden rounded-xl2 bg-white text-sm shadow-sm">
        <thead className="bg-eloca-bg text-left text-eloca-muted">
          <tr>
            <th className="p-4">Nome</th>
            <th className="p-4">Versão</th>
            <th className="p-4">Perguntas</th>
            <th className="p-4">Tentativas</th>
            <th className="p-4">Status</th>
            <th className="p-4">Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id} className="border-t border-eloca-border">
              <td className="p-4 font-medium">
                <Link href={`/admin/perguntas?assessmentId=${a.id}`} className="hover:text-eloca-green">
                  {a.name}
                </Link>
              </td>
              <td className="p-4">v{a.version}</td>
              <td className="p-4">{a._count.questions}</td>
              <td className="p-4">{a._count.attempts}</td>
              <td className="p-4">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ASSESSMENT_STATUS_COLORS[a.status]}`}>
                  {ASSESSMENT_STATUS_LABELS[a.status] ?? a.status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex gap-2">
                  {a.status !== "ACTIVE" && (
                    <button className="btn-secondary px-3 py-1 text-xs" onClick={() => setStatus(a.id, "ACTIVE")}>
                      Ativar
                    </button>
                  )}
                  {a.status === "ACTIVE" && (
                    <button className="btn-secondary px-3 py-1 text-xs" onClick={() => setStatus(a.id, "INACTIVE")}>
                      Desativar
                    </button>
                  )}
                  <button className="btn-secondary px-3 py-1 text-xs" onClick={() => setStatus(a.id, "ARCHIVED")}>
                    Arquivar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
