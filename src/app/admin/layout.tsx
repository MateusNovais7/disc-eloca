import Link from "next/link";
import LogoutButton from "./LogoutButton";

const MENU = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/testes", label: "Testes" },
  { href: "/admin/perguntas", label: "Perguntas" },
  { href: "/admin/resultados", label: "Resultados" },
  { href: "/admin/participantes", label: "Participantes" },
  { href: "/admin/perfis", label: "Perfis DISC" },
  { href: "/admin/relatorios", label: "Relatórios" },
  { href: "/admin/simulador", label: "Simular resultado" },
  { href: "/admin/configuracoes", label: "Configurações" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-eloca-bg">
      <aside className="w-64 flex-shrink-0 bg-eloca-navy px-4 py-6 text-white">
        <div className="mb-8 px-2 text-lg font-bold">
          ELOCA <span className="text-eloca-green">DISC</span>
        </div>
        <nav className="flex flex-col gap-1">
          {MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 px-2">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
