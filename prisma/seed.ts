/**
 * Seed inicial do DISC Eloca.
 *
 * IMPORTANTE — MATRIZ DE PONTUAÇÃO INICIAL (PROVISÓRIA):
 * A matriz abaixo é uma PROPOSTA INICIAL baseada no modelo DISC clássico
 * (quadrantes tarefa/pessoas x rápido/lento, e nos padrões usuais de medo,
 * segurança e irritação de cada perfil). Ela NÃO foi validada contra o
 * teste atual do Easy LMS. Use "Simular resultado" no painel administrativo
 * para comparar respostas específicas com o teste antigo e ajuste os
 * valores de score_d/i/s/c de cada alternativa em Admin > Perguntas até os
 * resultados ficarem equivalentes (ver seção 9 do briefing original).
 *
 * Cada alternativa nesta versão inicial pontua 3 pontos em um único
 * perfil (não é uma limitação do sistema — é só o ponto de partida mais
 * simples de calibrar; o schema já suporta pontuação mista, ex: D=2,I=1).
 */
import { PrismaClient, ProfileLetter } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

const prisma = new PrismaClient();

type OptionSeed = { text: string; d?: number; i?: number; s?: number; c?: number };
type QuestionSeed = { text: string; options: OptionSeed[] };

const QUESTIONS: QuestionSeed[] = [
  {
    text: "Como você percebe seu modelo de comunicar?",
    options: [
      { text: "Mais razão e mais direto na comunicação", d: 3 },
      { text: "Mais emoção e mais direto na comunicação", i: 3 },
      { text: "Mais razão e mais reservado na comunicação", c: 3 },
      { text: "Mais emoção e mais reservado na comunicação", s: 3 },
    ],
  },
  {
    text: "Sob pressão você reage como:",
    options: [
      { text: "Fica afastado", s: 3 },
      { text: "Fica neutro", c: 3 },
      { text: "Fica sarcástico", i: 3 },
      { text: "Fica autoritário", d: 3 },
    ],
  },
  {
    text: "Seu estilo é:",
    options: [
      { text: "Lento e pensativo", c: 3 },
      { text: "Calmo e analítico", s: 3 },
      { text: "Rápido e espontâneo", i: 3 },
      { text: "Rápido e decidido", d: 3 },
    ],
  },
  {
    text: "Você se concentra em:",
    options: [
      { text: "Manter seus relacionamentos", s: 3 },
      { text: "Tarefas e resultados", d: 3 },
      { text: "Interação e relacionamentos", i: 3 },
      { text: "Tarefas e processos", c: 3 },
    ],
  },
  {
    text: "Você tem receio de:",
    options: [
      { text: "Perder o controle", d: 3 },
      { text: "Perder o prestígio", i: 3 },
      { text: "Ficar sem informação", c: 3 },
      { text: "Ser confrontado", s: 3 },
    ],
  },
  {
    text: "Você se sente seguro:",
    options: [
      { text: "Nos relacionamentos íntimos", s: 3 },
      { text: "No planejamento", c: 3 },
      { text: "Na flexibilidade", i: 3 },
      { text: "No controle", d: 3 },
    ],
  },
  {
    text: "Você se sente reconhecido em:",
    options: [
      { text: "Ser planejado", c: 3 },
      { text: "Ser divertido", i: 3 },
      { text: "Ser leal", s: 3 },
      { text: "Ser líder", d: 3 },
    ],
  },
  {
    text: "Você prefere que a comunicação com você seja:",
    options: [
      { text: "Breve", d: 3 },
      { text: "Divertida", i: 3 },
      { text: "Exata", c: 3 },
      { text: "Agradável", s: 3 },
    ],
  },
  {
    text: "Você toma decisões de maneira:",
    options: [
      { text: "Humanizada", s: 3 },
      { text: "Espontânea", i: 3 },
      { text: "Rápida", d: 3 },
      { text: "Planejada", c: 3 },
    ],
  },
  {
    text: "Você irrita-se com:",
    options: [
      { text: "Ineficiência", d: 3 },
      { text: "Rotina", i: 3 },
      { text: "Imprevisibilidade", s: 3 },
      { text: "Impaciência", c: 3 },
    ],
  },
];

const PROFILE_DESCRIPTIONS: Record<
  ProfileLetter,
  {
    title: string;
    summary: string;
    strengths: string;
    attentionPoints: string;
    communicationStyle: string;
    howToCommunicate: string;
    underPressure: string;
    decisionMaking: string;
    preferredEnvironment: string;
    developmentTips: string;
  }
> = {
  D: {
    title: "D - Dominância",
    summary:
      "Você tende a ser objetivo, direto, competitivo e orientado a resultados.",
    strengths: "Determinação, foco em resultados, iniciativa, agilidade para decidir.",
    attentionPoints: "Pode parecer impaciente ou pouco atento a detalhes e sentimentos alheios.",
    communicationStyle: "Direta, breve e focada em ação.",
    howToCommunicate: "Prefere informações objetivas, sem rodeios, com foco no que precisa ser feito.",
    underPressure: "Torna-se mais autoritário e assume o controle da situação.",
    decisionMaking: "Rápida, baseada em resultados esperados.",
    preferredEnvironment: "Ambientes desafiadores, com autonomia e metas claras.",
    developmentTips: "Desenvolver escuta ativa e paciência com o ritmo dos outros.",
  },
  I: {
    title: "I - Influência",
    summary: "Você tende a ser comunicativo, otimista, entusiasmado e sociável.",
    strengths: "Facilidade de comunicação, entusiasmo, capacidade de engajar pessoas.",
    attentionPoints: "Pode perder o foco em detalhes e prazos por priorizar interações.",
    communicationStyle: "Expressiva, animada e cheia de energia.",
    howToCommunicate: "Prefere um tom leve, com espaço para trocas e reconhecimento.",
    underPressure: "Pode ficar dispersa ou reagir de forma mais emocional/sarcástica.",
    decisionMaking: "Espontânea, guiada por intuição e impacto nas pessoas.",
    preferredEnvironment: "Ambientes colaborativos, dinâmicos e com reconhecimento social.",
    developmentTips: "Desenvolver disciplina com prazos e atenção a detalhes.",
  },
  S: {
    title: "S - Estabilidade",
    summary: "Você tende a ser paciente, leal, cooperativo e um bom ouvinte.",
    strengths: "Consistência, lealdade, capacidade de criar ambientes estáveis e colaborativos.",
    attentionPoints: "Pode resistir a mudanças bruscas e evitar conflitos necessários.",
    communicationStyle: "Calma, acolhedora e ponderada.",
    howToCommunicate: "Prefere um ritmo tranquilo, com clareza sobre o que muda no dia a dia.",
    underPressure: "Tende a se afastar ou evitar confronto direto.",
    decisionMaking: "Humanizada, considerando o impacto nas pessoas envolvidas.",
    preferredEnvironment: "Ambientes estáveis, previsíveis e cooperativos.",
    developmentTips: "Desenvolver conforto com mudanças e posicionamento em conflitos.",
  },
  C: {
    title: "C - Conformidade",
    summary: "Você tende a ser analítico, preciso, cauteloso e orientado a processos.",
    strengths: "Rigor, organização, qualidade técnica e atenção a detalhes.",
    attentionPoints: "Pode ser excessivamente crítico ou demorar para decidir por buscar perfeição.",
    communicationStyle: "Formal, precisa e baseada em dados.",
    howToCommunicate: "Prefere informações exatas, com contexto e embasamento.",
    underPressure: "Torna-se mais reservado e busca mais dados antes de agir.",
    decisionMaking: "Planejada, baseada em análise cuidadosa.",
    preferredEnvironment: "Ambientes estruturados, com processos claros e qualidade valorizada.",
    developmentTips: "Desenvolver flexibilidade e agilidade para decidir com informação incompleta.",
  },
};

const COMBINATIONS = [
  "D/I", "D/S", "D/C",
  "I/D", "I/S", "I/C",
  "S/D", "S/I", "S/C",
  "C/D", "C/I", "C/S",
];

async function main() {
  console.log("Seed: iniciando...");

  // 1. Admin inicial
  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "admin@eloca.com.br";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  if (!adminPassword) {
    throw new Error(
      "Defina ADMIN_SEED_PASSWORD no ambiente antes de rodar o seed (não usar senha padrão em produção)."
    );
  }
  const passwordHash = await hashPassword(adminPassword);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Administrador DISC Eloca",
      email: adminEmail,
      passwordHash,
      role: "admin",
    },
  });
  console.log(`Seed: admin garantido (${adminEmail})`);

  // 2. Assessment + perguntas + alternativas
  const existing = await prisma.assessment.findFirst({
    where: { name: "DISC Eloca", version: 1 },
  });

  if (!existing) {
    await prisma.assessment.create({
      data: {
        name: "DISC Eloca",
        description: "DISC Eloca - Versão 1 (matriz inicial a calibrar)",
        version: 1,
        status: "ACTIVE",
        shuffleQuestions: false,
        shuffleOptions: false,
        questions: {
          create: QUESTIONS.map((q, qIdx) => ({
            text: q.text,
            position: qIdx + 1,
            options: {
              create: q.options.map((o, oIdx) => ({
                text: o.text,
                position: oIdx + 1,
                scoreD: o.d ?? 0,
                scoreI: o.i ?? 0,
                scoreS: o.s ?? 0,
                scoreC: o.c ?? 0,
              })),
            },
          })),
        },
      },
    });
    console.log("Seed: DISC Eloca - Versão 1 criada com 10 perguntas.");
  } else {
    console.log("Seed: DISC Eloca - Versão 1 já existe, pulando criação.");
  }

  // 3. Descrições de perfil
  for (const [profile, desc] of Object.entries(PROFILE_DESCRIPTIONS)) {
    await prisma.profileDescription.upsert({
      where: { profile: profile as ProfileLetter },
      update: {},
      create: { profile: profile as ProfileLetter, ...desc },
    });
  }
  console.log("Seed: descrições dos 4 perfis garantidas.");

  // 4. Estrutura de combinações (conteúdo mínimo, pronto para edição)
  for (const combo of COMBINATIONS) {
    await prisma.combinedProfileDescription.upsert({
      where: { combination: combo },
      update: {},
      create: {
        combination: combo,
        content: `Combinação ${combo}: descrição a ser detalhada pelo time Eloca no painel administrativo.`,
      },
    });
  }
  console.log("Seed: estrutura de 12 combinações garantida.");

  console.log("Seed: concluído com sucesso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
