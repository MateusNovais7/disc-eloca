"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MENU = [
  { href: "/admin", label: "Dashboard", adminOnly: false },
  { href: "/admin/testes", label: "Testes", adminOnly: true },
  { href: "/admin/perguntas", label: "Perguntas", adminOnly: true },
  { href: "/admin/resultados", label: "Resultados", adminOnly: false },
  { href: "/admin/participantes", label: "Participantes", adminOnly: false },
  { href: "/admin/perfis", label: "Perfis DISC", adminOnly: true },
  { href: "/admin/relatorios", label: "Relatórios", adminOnly: false },
  { href: "/admin/simulador", label: "Simular resultado", adminOnly: true },
  { href: "/admin/usuarios", label: "Usuários", adminOnly: true },
  { href: "/admin/configuracoes", label: "Configurações", adminOnly: true },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/me").then((r) => (r.ok ? r.json() : null)).then((d) => setRole(d?.user?.role ?? null));
  }, []);

  const visibleMenu = MENU.filter((item) => !item.adminOnly || role === "admin");

  return (
    <nav className="flex flex-col gap-1">
      {visibleMenu.map((item) => {
        const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-3 py-2 text-sm transition ${
              isActive
                ? "bg-eloca-green/15 font-semibold text-eloca-green"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
