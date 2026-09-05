"use client";

import { useEffect, useState } from "react";

interface UserRow {
  id: string; name: string; email: string; role: string;
  isActive: boolean; mustChangePassword: boolean; createdAt: string;
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [creating, setCreating] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ email: string; emailSent: boolean; setPasswordUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", role: "usuario" });

  function load() {
    fetch("/api/admin/users").then((r) => r.json()).then((d) => setUsers(d.users ?? []));
    fetch("/api/admin/me").then((r) => (r.ok ? r.json() : null)).then((d) => setCurrentUserId(d?.user?.id ?? null));
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
    setInviteResult({ email: data.user.email, emailSent: data.emailSent, setPasswordUrl: data.setPasswordUrl });
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

  function startEdit(u: UserRow) {
    const [firstName, ...rest] = u.name.split(" ");
    setEditingId(u.id);
    setEditForm({ firstName, lastName: rest.join(" "), role: u.role });
  }

  async function saveEdit(id: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `${editForm.firstName.trim()} ${editForm.lastName.trim()}`, role: editForm.role }),
    });
    setEditingId(null);
    load();
  }

  async function deleteUser(id: string) {
    if (!confirm("Excluir este usuário permanentemente? Esta ação não pode ser desfeita.")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-eloca-navy">Usuários</h1>

      <form onSubmit={createUser} className="card mt-6 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Nome
          <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="rounded-lg border border-eloca-border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Sobrenome
          <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="rounded-lg border border-eloca-border px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          E-mail
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg border border-eloca-border px-3 py-2" />
        </label>
        <button className="btn-primary" disabled={creating}>{creating ? "Enviando convite..." : "Criar usuário"}</button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {inviteResult && (
        <div className="card mt-4 border-eloca-green bg-eloca-green/5">
          {inviteResult.emailSent ? (
            <p className="text-sm text-eloca-navy">
              Convite enviado por e-mail para <strong>{inviteResult.email}</strong>. O usuário vai definir a própria senha pelo link recebido.
            </p>
          ) : (
            <>
              <p className="text-sm font-semibold text-eloca-navy">
                Usuário criado, mas o e-mail não foi enviado (Resend não configurado ainda).
              </p>
              <p className="mt-1 text-sm text-eloca-muted">Envie manualmente este link de acesso para {inviteResult.email}:</p>
              <code className="mt-1 block break-all rounded bg-white px-2 py-1 text-xs">{inviteResult.setPasswordUrl}</code>
            </>
          )}
          <button className="btn-secondary mt-3 text-xs" onClick={() => setInviteResult(null)}>Fechar</button>
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
            <tr key={u.id} className="border-t border-eloca-border align-top">
              {editingId === u.id ? (
                <>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <input value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} className="w-20 rounded border border-eloca-border px-2 py-1" />
                      <input value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} className="w-24 rounded border border-eloca-border px-2 py-1" />
                    </div>
                  </td>
                  <td className="p-4 text-eloca-muted">{u.email}</td>
                  <td className="p-4">
                    <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="rounded border border-eloca-border px-2 py-1">
                      <option value="admin">admin</option>
                      <option value="usuario">usuário</option>
                    </select>
                  </td>
                  <td className="p-4 text-eloca-muted">—</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="btn-primary px-3 py-1 text-xs" onClick={() => saveEdit(u.id)}>Salvar</button>
                      <button className="btn-secondary px-3 py-1 text-xs" onClick={() => setEditingId(null)}>Cancelar</button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">{u.role}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${u.isActive ? "bg-eloca-green/10 text-eloca-greenDark" : "bg-red-50 text-red-600"}`}>
                      {u.isActive ? "Ativo" : "Inativo"}
                    </span>
                    {u.mustChangePassword && (
                      <span className="ml-2 rounded-full bg-eloca-bg px-2 py-1 text-xs text-eloca-muted">Aguardando 1º acesso</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-secondary px-3 py-1 text-xs" onClick={() => startEdit(u)}>Editar</button>
                      <button className="btn-secondary px-3 py-1 text-xs" onClick={() => toggleActive(u.id, !u.isActive)}>
                        {u.isActive ? "Desativar" : "Ativar"}
                      </button>
                      {u.id !== currentUserId && (
                        <button className="rounded-full border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50" onClick={() => deleteUser(u.id)}>
                          Excluir
                        </button>
                      )}
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
