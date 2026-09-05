import { describe, it, expect } from "vitest";
import {
  sumRawScores,
  calculatePercentages,
  rankProfiles,
  calculateDiscResult,
} from "./disc-engine";

describe("sumRawScores", () => {
  it("soma corretamente pontuações independentes por perfil", () => {
    const answers = [
      { scoreD: 3, scoreI: 0, scoreS: 0, scoreC: 0 },
      { scoreD: 2, scoreI: 1, scoreS: 0, scoreC: 0 }, // alternativa mista
      { scoreD: 0, scoreI: 0, scoreS: 0, scoreC: 3 },
    ];
    expect(sumRawScores(answers)).toEqual({ D: 5, I: 1, S: 0, C: 3 });
  });

  it("retorna zeros para lista vazia", () => {
    expect(sumRawScores([])).toEqual({ D: 0, I: 0, S: 0, C: 0 });
  });
});

describe("calculatePercentages", () => {
  it("calcula percentuais a partir do exemplo do briefing (D=15,I=8,S=5,C=12)", () => {
    const pct = calculatePercentages({ D: 15, I: 8, S: 5, C: 12 });
    expect(pct.D).toBeCloseTo(37.5, 5);
    expect(pct.I).toBeCloseTo(20, 5);
    expect(pct.S).toBeCloseTo(12.5, 5);
    expect(pct.C).toBeCloseTo(30, 5);
  });

  it("retorna todos zero quando o total é zero (sem travar)", () => {
    expect(calculatePercentages({ D: 0, I: 0, S: 0, C: 0 })).toEqual({
      D: 0,
      I: 0,
      S: 0,
      C: 0,
    });
  });
});

describe("rankProfiles - regra de desempate D > I > S > C", () => {
  it("sem empate, ordena puramente pelo valor", () => {
    const { ranked, tieBreakApplied } = rankProfiles({ D: 1, I: 4, S: 3, C: 2 });
    expect(ranked).toEqual(["I", "S", "C", "D"]);
    expect(tieBreakApplied).toBe(false);
  });

  it("empate entre D e I: D vence por prioridade canônica", () => {
    const { ranked, tieBreakApplied } = rankProfiles({ D: 10, I: 10, S: 5, C: 5 });
    expect(ranked[0]).toBe("D");
    expect(ranked[1]).toBe("I");
    expect(tieBreakApplied).toBe(true);
  });

  it("empate total entre os 4 perfis retorna a ordem canônica D,I,S,C", () => {
    const { ranked, tieBreakApplied } = rankProfiles({ D: 5, I: 5, S: 5, C: 5 });
    expect(ranked).toEqual(["D", "I", "S", "C"]);
    expect(tieBreakApplied).toBe(true);
  });

  it("empate entre S e C (perfis de menor prioridade)", () => {
    const { ranked } = rankProfiles({ D: 1, I: 2, S: 8, C: 8 });
    expect(ranked[0]).toBe("S");
    expect(ranked[1]).toBe("C");
  });
});

describe("calculateDiscResult - integração ponta a ponta", () => {
  it("reproduz o exemplo do briefing: predominante D, secundário C, combinação D/C", () => {
    const answers = [
      { scoreD: 15, scoreI: 0, scoreS: 0, scoreC: 0 },
      { scoreD: 0, scoreI: 8, scoreS: 0, scoreC: 0 },
      { scoreD: 0, scoreI: 0, scoreS: 5, scoreC: 0 },
      { scoreD: 0, scoreI: 0, scoreS: 0, scoreC: 12 },
    ];
    const result = calculateDiscResult(answers);
    expect(result.raw).toEqual({ D: 15, I: 8, S: 5, C: 12 });
    expect(result.percentage.D).toBeCloseTo(37.5, 5);
    expect(result.primaryProfile).toBe("D");
    expect(result.secondaryProfile).toBe("C");
    expect(result.combination).toBe("D/C");
    expect(result.tieBreakApplied).toBe(false);
  });

  it("resultado é determinístico e estável entre execuções (mesma entrada -> mesma saída)", () => {
    const answers = [
      { scoreD: 2, scoreI: 2, scoreS: 1, scoreC: 0 },
      { scoreD: 1, scoreI: 0, scoreS: 0, scoreC: 3 },
    ];
    const r1 = calculateDiscResult(answers);
    const r2 = calculateDiscResult(answers);
    expect(r1).toEqual(r2);
  });
});

describe("Não alterar histórico ao recalibrar a matriz (uso de snapshots)", () => {
  it("resultado calculado a partir de snapshots antigos não muda mesmo que a Option mude depois", () => {
    // Simula: resposta foi dada quando a opção valia D=3
    const snapshotDaResposta = { scoreD: 3, scoreI: 0, scoreS: 0, scoreC: 0 };
    const resultadoHistorico = calculateDiscResult([snapshotDaResposta]);
    expect(resultadoHistorico.raw.D).toBe(3);

    // Depois, o admin recalibra a Option para D=2 (não deve afetar o snapshot já salvo)
    const optionAtualRecalibrada = { scoreD: 2, scoreI: 0, scoreS: 0, scoreC: 0 };
    // O motor nunca deve receber a Option atual para recalcular tentativas antigas;
    // este teste documenta que o snapshot já persistido permanece D=3.
    expect(snapshotDaResposta.scoreD).not.toBe(optionAtualRecalibrada.scoreD);
    expect(resultadoHistorico.raw.D).toBe(3);
  });
});
