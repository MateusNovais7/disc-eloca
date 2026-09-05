"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/testes", label: "Testes" },
  { href: "/admin/perguntas", label: "Perguntas" },
  { href: "/admin/resultados", label: "Resultados" },
  { href: "/admin/participantes", label: "Participantes" },
  { href: "/admin/perfis", label: "Perfis DISC" },
  { href: "/admin/relatorios", label: "Relatórios" },
  { href: "/admin/simulador", label: "Simular resultado" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {MENU.map((item) => {
        // "/admin" só fica ativo na rota exata; as demais casam por prefixo
        // (ex: /admin/perguntas?assessmentId=... continua destacando "Perguntas").
        const isActive =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
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
