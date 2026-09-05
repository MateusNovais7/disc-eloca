import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function LandingPage() {
  const activeAssessment = await prisma.assessment.findFirst({
    where: { status: "ACTIVE" },
    orderBy: { version: "desc" },
  });

  return (
    <main className="min-h-screen bg-eloca-bg">
      <header className="border-b border-eloca-border bg-eloca-navy">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-white">
            ELOCA <span className="text-eloca-green">DISC</span>
          </span>
        </div>
      </header>

      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center">
        <span className="mb-4 inline-block rounded-full bg-eloca-green/10 px-4 py-1 text-sm font-semibold text-eloca-greenDark">
          Perfil comportamental
        </span>
        <h1 className="text-4xl font-extrabold text-eloca-navy sm:text-5xl">
          DISC Eloca
        </h1>
        <p className="mt-6 text-lg text-eloca-muted">
          Conheça melhor sua tendência comportamental e sua forma de se
          comunicar, decidir e trabalhar.
        </p>

        {activeAssessment ? (
          <Link href={`/teste/${activeAssessment.id}`} className="btn-primary mt-10 px-10 py-4 text-lg">
            Iniciar teste
          </Link>
        ) : (
          <p className="mt-10 text-eloca-muted">
            No momento não há nenhum teste ativo. Fale com a administração.
          </p>
        )}

        <p className="mt-8 max-w-xl text-xs text-eloca-muted">
          As informações fornecidas serão utilizadas internamente pela Eloca
          para fins de desenvolvimento e análise de{" "}
          <strong>tendência comportamental</strong>. Este teste não constitui
          diagnóstico psicológico.
        </p>
      </section>
    </main>
  );
}
