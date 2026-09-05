"use client";

import { useEffect, useState } from "react";

interface UserRow {
  id: string; name: string; email: string; role: string;
  isActive: boolean; mustChangePassword: boolean; createdAt: string;
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [creating, setCreating] = useState(false);
  const [newCredential, setNewCredential] = useState<{ email: string; password: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/users").then((r) => r.json()).then((d) => setUsers(d.users ?? []));
  }
  useEffect(load, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError("Nome, sobrenome e e-mail são obrigatórios.");
      return;
    }
    setCreating(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `${form.firstName.trim()} ${form.lastName.trim()}`, email: form.email }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setError(data.error ?? "Erro ao criar usuário.");
      return;
    }
    setNewCredential({ email: data.user.email, password: data.temporaryPassword });
    setForm({ firstName: "", lastName: "", email: "" });
    load();
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-eloca-navy">Usuários</h1>

      <form onSubmit={createUser} className="card mt-6 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Nome
          <input
            required
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="rounded-lg border border-eloca-border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Sobrenome
          <input
            required
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className="rounded-lg border border-eloca-border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          E-mail
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-lg border border-eloca-border px-3 py-2"
          />
        </label>
        <button className="btn-primary" disabled={creating}>
          {creating ? "Criando..." : "Criar usuário"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {newCredential && (
        <div className="card mt-4 border-eloca-green bg-eloca-green/5">
          <p className="font-semibold text-eloca-navy">Usuário criado! Copie a senha temporária agora — ela não será mostrada de novo:</p>
          <p className="mt-2 text-sm">E-mail: <strong>{newCredential.email}</strong></p>
          <p className="text-sm">Senha temporária: <code className="rounded bg-white px-2 py-1">{newCredential.password}</code></p>
          <p className="mt-2 text-xs text-eloca-muted">
            O usuário será obrigado a trocar essa senha no primeiro login.
          </p>
          <button className="btn-secondary mt-3 text-xs" onClick={() => setNewCredential(null)}>Fechar</button>
        </div>
      )}

      <table className="mt-6 w-full overflow-hidden rounded-xl2 bg-white text-sm shadow-sm">
        <thead className="bg-eloca-bg text-left text-eloca-muted">
          <tr>
            <th className="p-4">Nome</th>
            <th className="p-4">E-mail</th>
            <th className="p-4">Papel</th>
            <th className="p-4">Status</th>
            <th className="p-4">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-eloca-border">
              <td className="p-4 font-medium">{u.name}</td>
              <td className="p-4">{u.email}</td>
              <td className="p-4">{u.role}</td>
              <td className="p-4">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${u.isActive ? "bg-eloca-green/10 text-eloca-greenDark" : "bg-red-50 text-red-600"}`}>
                  {u.isActive ? "Ativo" : "Inativo"}
                </span>
                {u.mustChangePassword && (
                  <span className="ml-2 rounded-full bg-eloca-bg px-2 py-1 text-xs text-eloca-muted">
                    Aguardando 1ª troca de senha
                  </span>
                )}
              </td>
              <td className="p-4">
                <button className="btn-secondary px-3 py-1 text-xs" onClick={() => toggleActive(u.id, !u.isActive)}>
                  {u.isActive ? "Desativar" : "Ativar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
