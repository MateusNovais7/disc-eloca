"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EloceLogo } from "@/components/EloceLogo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao entrar.");
      return;
    }
    router.push("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-eloca-navy px-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl2 bg-white p-8 shadow-lg">
        <div className="flex items-center gap-2">
          <EloceLogo variant="dark" className="h-7 w-auto" />
          <span className="rounded-full bg-eloca-green/10 px-2 py-0.5 text-xs font-bold text-eloca-greenDark">
            DISC — Admin
          </span>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-eloca-border px-4 py-3"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-eloca-border px-4 py-3"
            required
          />
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
