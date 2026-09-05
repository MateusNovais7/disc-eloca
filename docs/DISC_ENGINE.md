# Motor de Cálculo DISC — DISC Eloca

Este documento é a fonte oficial das regras de cálculo. Qualquer alteração
aqui deve ser refletida em `src/lib/disc-engine.ts` e nos testes em
`src/lib/disc-engine.test.ts`.

## 1. Soma bruta

Ao concluir o questionário, somamos a pontuação de cada alternativa
escolhida (snapshot no momento da resposta) por perfil:

```
rawD = Σ scoreD de cada resposta
rawI = Σ scoreI de cada resposta
rawS = Σ scoreS de cada resposta
rawC = Σ scoreC de cada resposta
```

Uma alternativa pode pontuar em mais de um perfil simultaneamente
(ex: D=2, I=1), portanto a soma total não é necessariamente igual ao
número de perguntas.

## 2. Percentual

```
total = rawD + rawI + rawS + rawC
percentageX = total > 0 ? (rawX / total) * 100 : 0
```

Os percentuais são arredondados apenas na exibição (UI), nunca no
armazenamento — o banco guarda o valor de ponto flutuante exato para
permitir recalibração e relatórios precisos.

Caso `total === 0` (ex: todas as alternativas pontuam zero em todos os
perfis — situação anômala, mas possível durante calibração), todos os
percentuais são 0 e o perfil predominante fica marcado como indefinido
pela camada de aplicação (não deve travar o cálculo).

## 3. Perfil predominante e secundário

1. Ordena-se os 4 perfis (D, I, S, C) pelo valor bruto (`rawX`), do maior
   para o menor.
2. O perfil predominante é o primeiro da lista.
3. O perfil secundário é o segundo da lista.
4. A combinação é formatada como `"{predominante}/{secundário}"`.

## 4. Regra de desempate

Quando há empate entre dois ou mais perfis pelo maior valor bruto,
aplicamos a seguinte ordem de prioridade fixa para decidir qual vem
primeiro (predominante) e qual vem em seguida (secundário):

```
Ordem de prioridade em caso de empate: D > I > S > C
```

Justificativa: esta é a ordem canônica do modelo DISC (Dominância,
Influência, Estabilidade, Conformidade), usada como critério estável e
determinístico — o mesmo conjunto de respostas sempre produz o mesmo
resultado, independentemente da ordem de processamento.

Exemplo:
- rawD = 10, rawI = 10, rawS = 5, rawC = 5
- Empate entre D e I → D vence por prioridade (D > I) → predominante = D
- Entre I, S, C, o maior é I → secundário = I
- Combinação: D/I
- `tieBreakApplied = true` é salvo em `results` para rastreabilidade.

Este critério é **provisório e documentado explicitamente para ser
validado durante a calibração** com os resultados do Easy LMS atual
(seção 9 do briefing). Caso a calibração indique outro critério de
desempate mais fiel ao teste antigo, atualizar esta seção e a função
`resolveTieBreak` em `disc-engine.ts` — nunca alterar resultados já
persistidos, apenas o comportamento para novas tentativas.

## 5. Snapshots — por que e como

A tabela `answers` grava `scoreDSnapshot/I/S/C` no momento em que a
resposta é dada, copiando o valor da `Option` naquele instante. O
cálculo do resultado (`results`) sempre usa os snapshots de `answers`,
nunca os valores atuais de `options`. Isso garante que alterar a matriz
de pontuação no painel administrativo (para fins de calibração) não
altera retroativamente resultados já calculados.

## 6. Simulador

O simulador (`/admin/testes/simular`) executa exatamente a mesma função
`calculateDiscResult()` usada no fluxo real, mas com:
- `isSimulation = true` na tentativa (se persistida) OU sem persistência
  alguma (modo "rascunho", padrão);
- nunca cria/atualiza um `Participant`;
- não entra nos relatórios agregados (`WHERE isSimulation = false`).
