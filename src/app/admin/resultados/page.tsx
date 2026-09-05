import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ResultadosPage() {
  const attempts = await prisma.assessmentAttempt.findMany({
    where: { status: "COMPLETED", isSimulation: false },
    orderBy: { completedAt: "desc" },
    take: 100,
    include: { participant: true, result: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-eloca-navy">Resultados</h1>
      <table className="mt-6 w-full overflow-hidden rounded-xl2 bg-white text-sm shadow-sm">
        <thead className="bg-eloca-bg text-left text-eloca-muted">
          <tr>
            <th className="p-4">Participante</th>
            <th className="p-4">Data</th>
            <th className="p-4">Combinação</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((a) => (
            <tr key={a.id} className="border-t border-eloca-border">
              <td className="p-4 font-medium">{a.participant?.name}</td>
              <td className="p-4">{a.completedAt && new Date(a.completedAt).toLocaleDateString("pt-BR")}</td>
              <td className="p-4">
                <Link href={`/admin/resultados/${a.id}`} className="text-eloca-green hover:underline">
                  {a.result?.combination}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
