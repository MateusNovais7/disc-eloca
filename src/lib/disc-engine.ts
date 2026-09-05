/**
 * Motor de cálculo DISC — DISC Eloca
 * Regras documentadas em docs/DISC_ENGINE.md. Não altere o critério de
 * desempate aqui sem atualizar aquele documento.
 */

export type ProfileLetter = "D" | "I" | "S" | "C";

export interface RawScores {
  D: number;
  I: number;
  S: number;
  C: number;
}

export interface DiscResult {
  raw: RawScores;
  percentage: RawScores;
  primaryProfile: ProfileLetter;
  secondaryProfile: ProfileLetter;
  combination: string;
  tieBreakApplied: boolean;
}

/** Ordem canônica do modelo DISC, usada como critério de desempate. */
const TIE_BREAK_PRIORITY: ProfileLetter[] = ["D", "I", "S", "C"];

export interface AnswerScoreInput {
  scoreD: number;
  scoreI: number;
  scoreS: number;
  scoreC: number;
}

/** Soma as pontuações (snapshots) de todas as respostas de uma tentativa. */
export function sumRawScores(answers: AnswerScoreInput[]): RawScores {
  return answers.reduce<RawScores>(
    (acc, a) => ({
      D: acc.D + a.scoreD,
      I: acc.I + a.scoreI,
      S: acc.S + a.scoreS,
      C: acc.C + a.scoreC,
    }),
    { D: 0, I: 0, S: 0, C: 0 }
  );
}

export function calculatePercentages(raw: RawScores): RawScores {
  const total = raw.D + raw.I + raw.S + raw.C;
  if (total <= 0) {
    return { D: 0, I: 0, S: 0, C: 0 };
  }
  return {
    D: (raw.D / total) * 100,
    I: (raw.I / total) * 100,
    S: (raw.S / total) * 100,
    C: (raw.C / total) * 100,
  };
}

/**
 * Ordena os perfis do maior para o menor score bruto. Em caso de empate,
 * usa a prioridade canônica D > I > S > C (ordem estável e determinística).
 * Retorna também se algum desempate foi de fato necessário.
 */
export function rankProfiles(raw: RawScores): {
  ranked: ProfileLetter[];
  tieBreakApplied: boolean;
} {
  const entries = TIE_BREAK_PRIORITY.map((p) => ({ profile: p, value: raw[p] }));

  let tieBreakApplied = false;
  const ranked = [...entries]
    .sort((a, b) => {
      if (b.value !== a.value) return b.value - a.value;
      // valores iguais: mantém a ordem de prioridade canônica (estável)
      tieBreakApplied = true;
      return (
        TIE_BREAK_PRIORITY.indexOf(a.profile) - TIE_BREAK_PRIORITY.indexOf(b.profile)
      );
    })
    .map((e) => e.profile);

  return { ranked, tieBreakApplied };
}

export function calculateDiscResult(answers: AnswerScoreInput[]): DiscResult {
  const raw = sumRawScores(answers);
  const percentage = calculatePercentages(raw);
  const { ranked, tieBreakApplied } = rankProfiles(raw);

  const primaryProfile = ranked[0];
  const secondaryProfile = ranked[1];

  return {
    raw,
    percentage,
    primaryProfile,
    secondaryProfile,
    combination: `${primaryProfile}/${secondaryProfile}`,
    tieBreakApplied,
  };
}

export const PROFILE_LABELS: Record<ProfileLetter, string> = {
  D: "Dominância",
  I: "Influência",
  S: "Estabilidade",
  C: "Conformidade",
};

export const PROFILE_COLORS: Record<ProfileLetter, string> = {
  D: "#E4572E",
  I: "#F2B705",
  S: "#07C97F",
  C: "#2E6BE4",
};
