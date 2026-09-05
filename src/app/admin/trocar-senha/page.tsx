"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EloceLogo } from "@/components/EloceLogo";

export default function TrocarSenhaPage() {
  const router = useRouter();
  const [mustChange, setMustChange] = useState<boolean | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setMustChange(d.user.mustChangePassword))
      .catch(() => router.push("/admin/login"));
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: mustChange ? undefined : currentPassword,
        newPassword,
      }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Erro ao trocar a senha.");
      return;
    }
    router.push("/admin");
  }

  if (mustChange === null) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-eloca-navy px-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl2 bg-white p-8 shadow-lg">
        <EloceLogo variant="dark" className="h-7 w-auto" />
        <h1 className="mt-4 text-lg font-bold text-eloca-navy">
          {mustChange ? "Defina sua nova senha" : "Trocar senha"}
        </h1>
        {mustChange && (
          <p className="mt-1 text-sm text-eloca-muted">
            Por segurança, é preciso definir uma senha própria antes de continuar.
          </p>
        )}
        <div className="mt-6 flex flex-col gap-4">
          {!mustChange && (
            <input
              type="password"
              placeholder="Senha atual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="rounded-lg border border-eloca-border px-4 py-3"
              required
            />
          )}
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
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
          {loading ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
    </main>
  );
}
