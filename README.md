# DISC Eloca

Plataforma própria da Eloca para aplicação, cálculo e gestão de avaliações
comportamentais no modelo DISC — substitui a dependência do Easy LMS.

## Stack

- **Frontend/Backend:** Next.js 14 (App Router) + React 18 + TypeScript
- **Banco:** PostgreSQL 16, via Prisma ORM (migrations versionadas)
- **Estilo:** Tailwind CSS, com tokens de cor extraídos da identidade visual
  real da Eloca (`#131220` navy, `#07C97F` verde-esmeralda)
- **Gráficos:** Recharts (radar + barras)
- **Autenticação admin:** sessão via cookie httpOnly assinado (JWT/jose) +
  bcrypt para senha
- **Testes:** Vitest (motor de cálculo DISC)

## Estrutura

```
src/
  app/                    # rotas (App Router)
    page.tsx              # landing pública
    teste/[id]/           # fluxo do questionário
    resultado/[attemptId]/# tela de resultado do participante
    admin/                # painel administrativo (protegido por middleware)
    api/                  # rotas de API (públicas + /api/admin/*)
  lib/
    disc-engine.ts        # motor de cálculo (ver docs/DISC_ENGINE.md)
    disc-engine.test.ts
    prisma.ts             # client singleton
    auth.ts               # sessão admin + hash de senha
prisma/
  schema.prisma
  seed.ts                 # popula DISC Eloca V1 + perfis (matriz inicial a calibrar)
docs/
  DISC_ENGINE.md           # regras de cálculo e desempate documentadas
```

## Rodando localmente

```bash
cp .env.example .env   # preencha DATABASE_URL, ADMIN_SESSION_SECRET, etc.
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Testes do motor de cálculo:

```bash
npm test
```

## Variáveis de ambiente

Ver `.env.example`. Nunca commitar `.env` com valores reais.

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | string de conexão Postgres |
| `ADMIN_SESSION_SECRET` | segredo para assinar a sessão do admin (gerar com `openssl rand -base64 32`) |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` | credenciais do admin criadas pelo seed |
| `NEXT_PUBLIC_APP_URL` | URL pública da aplicação |
| `RUN_SEED_ON_START` | se `true`, roda o seed automaticamente na subida do container (usar apenas no primeiro deploy) |

## Onde calibrar o teste (sem mexer em código)

- **Perguntas e pontuação D/I/S/C:** Admin > Perguntas (selecione o teste em
  Admin > Testes primeiro). Cada alternativa tem 4 campos numéricos
  editáveis (D, I, S, C).
- **Simulador:** Admin > Simular resultado — marque respostas manualmente e
  veja o resultado sem criar um participante, para comparar com o Easy LMS.
- **Descrições de perfil e combinações:** Admin > Perfis DISC.
- Alterar a pontuação de uma alternativa **não** afeta resultados já
  calculados (uso de snapshots — ver `docs/DISC_ENGINE.md`).

## Criar uma nova versão do teste

Em Admin > Testes, crie um novo teste com o mesmo nome — a versão é
incrementada automaticamente. Ative a nova versão quando estiver pronta
(isso desativa automaticamente a versão anterior na landing page); os
resultados históricos da versão antiga permanecem intactos.

## Deploy (EasyPanel / Docker)

```bash
docker compose build
docker compose up -d
```

O `docker-entrypoint.sh` roda `prisma migrate deploy` automaticamente antes
de iniciar o servidor. Para popular o banco pela primeira vez, defina
`RUN_SEED_ON_START=true` no primeiro `up` e depois volte para `false`.

Healthcheck exposto em `/` (200 OK esperado). Logs via `docker compose logs -f app`.

## Segurança

- Rotas `/admin/*` protegidas por middleware (sessão JWT em cookie httpOnly).
- Rate limiting básico no login (10 tentativas / 15 min por IP — trocar por
  um store compartilhado como Redis em ambiente com múltiplas réplicas).
- Validação de entrada com Zod em todas as rotas de API.
- Headers de segurança (`X-Frame-Options`, `X-Content-Type-Options`, etc.)
  configurados em `next.config.js`.
- Secrets apenas via variáveis de ambiente — nunca no código.

## LGPD

O teste público exibe aviso de que nome, e-mail e respostas comportamentais
são usados internamente pela Eloca para análise de **tendência
comportamental** — a interface evita os termos "diagnóstico" ou "avaliação
psicológica" em qualquer lugar do produto.

## Auditoria

Ações administrativas sensíveis (login, criação/ativação de teste, edição
de pontuação, edição de descrições de perfil) são registradas em
`audit_logs` com usuário, ação e timestamp.
