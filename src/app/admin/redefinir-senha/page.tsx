"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { EloceLogo } from "@/components/EloceLogo";

function RedefinirSenhaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Erro ao redefinir a senha.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/admin/login"), 2000);
  }

  if (!token) {
    return <p className="text-white">Link inválido — falta o token de redefinição.</p>;
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm rounded-xl2 bg-white p-8 shadow-lg text-center">
      <div className="flex flex-col items-center">
        <EloceLogo variant="dark" className="h-10 w-auto" />
        <span className="mt-2 rounded-full bg-eloca-green/10 px-3 py-1 text-xs font-bold text-eloca-greenDark">
          DISC — Admin
        </span>
      </div>
      <h2 className="mt-6 text-left text-lg font-bold text-eloca-navy">Nova senha</h2>
      {done ? (
        <p className="mt-4 text-left text-sm text-eloca-greenDark">Senha redefinida! Redirecionando para o login...</p>
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-3">
            <input
              type="password"
              placeholder="Nova senha (mín. 8 caracteres)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-lg border border-eloca-border px-4 py-3"
              required
              minLength={8}
            />
            <input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-lg border border-eloca-border px-4 py-3"
              required
              minLength={8}
            />
          </div>
          {error && <p className="mt-3 text-left text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary mt-4 w-full">
            {loading ? "Salvando..." : "Redefinir senha"}
          </button>
        </>
      )}
    </form>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-eloca-navy px-6">
      <Suspense fallback={<p className="text-white">Carregando...</p>}>
        <RedefinirSenhaContent />
      </Suspense>
    </main>
  );
}
