"use client";

import { useState } from "react";
import Link from "next/link";
import { EloceLogo } from "@/components/EloceLogo";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    setMessage(data.message ?? "Se esse e-mail estiver cadastrado, você vai receber um link em instantes.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-eloca-navy px-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl2 bg-white p-8 shadow-lg text-center">
        <div className="flex flex-col items-center">
          <EloceLogo variant="dark" className="h-10 w-auto" />
          <span className="mt-2 rounded-full bg-eloca-green/10 px-3 py-1 text-xs font-bold text-eloca-greenDark">
            DISC — Admin
          </span>
        </div>
        <h2 className="mt-6 text-left text-lg font-bold text-eloca-navy">Esqueceu sua senha?</h2>
        <p className="mt-1 text-left text-sm text-eloca-muted">
          Informe seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
        </p>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-4 w-full rounded-lg border border-eloca-border px-4 py-3"
          required
        />
        {message && <p className="mt-3 text-left text-sm text-eloca-greenDark">{message}</p>}
        <button type="submit" disabled={loading} className="btn-primary mt-4 w-full">
          {loading ? "Enviando..." : "Enviar link de redefinição"}
        </button>
        <Link href="/admin/login" className="mt-4 block text-sm text-eloca-muted hover:text-eloca-navy">
          Voltar ao login
        </Link>
      </form>
    </main>
  );
}
