# Balanceamento

Este arquivo é o contrato do ritmo do Gamebobo. Os números podem mudar; a experiência abaixo não deve mudar por acidente.

## Régua de nota

| Faixa | Leitura desejada |
|---|---|
| 90–99 | acontecimento raro; candidato a marcar a carreira |
| 80–89 | muito bom, mesmo quando tem defeitos claros |
| 70–79 | bom ou competente; o centro saudável da distribuição |
| 60–69 | misto, frustrante ou abaixo do potencial |
| 24–59 | desastre de produção, reservado a problemas graves acumulados |

Um projeto inicial sensato deve terminar principalmente nos 70. O jogo não pune o jogador novo com uma nota humilhante por falta de informação, mas também não transforma 80 em medalha de participação. Abaixo de 60 continua possível por bugs extremos, saúde e stress críticos, pressão excessiva e escala incompatível.

## Vendas e raridade

Vendas normais nascem de qualidade, escala, alcance da era, plataforma, público acumulado, marketing e plano de lançamento. Seguidores têm retorno logarítmico: uma comunidade ajuda muito, mas não duplica infinitamente cada lançamento.

Notas de 90 a 99 também recebem um piso de descoberta crítica contínuo, proporcional à excelência, à escala, à plataforma e ao alcance histórico da era. Isso impede que uma obra-prima dependa de ganhar o sorteio do estouro apenas para ser percebida, mas não garante milhões: no cenário fixo de regressão, um microjogo 99/100 para Mega Drive em 1991 vende 192.795 cópias sem breakout.

Um jogo com nota 78 ou mais pode furar a bolha. A chance cresce devagar com nota, inovação e hype e nunca passa de 1,8%. Entre esses estouros, uma fração ainda menor pode virar fenômeno. O multiplicador não tem um resultado fixo, mas as vendas respeitam o tamanho máximo plausível do mercado:

| Ano | Teto por lançamento |
|---|---:|
| até 1984 | 1 milhão |
| 1985–1994 | 8 milhões |
| 1995–2004 | 35 milhões |
| 2005–2014 | 180 milhões |
| 2015 em diante | 500 milhões |

O teto não é uma meta nem uma previsão; é apenas o limite da cauda. Na auditoria de referência, 100 mil blockbusters deliberadamente ideais de 2020 produziram 1,279% de estouros, 0,012% de fenômenos, oito resultados acima de 100 milhões e quatro acima de 300 milhões. Um projeto real chegar a esse ponto já é raro, portanto a frequência observada numa carreira é muito menor.

Leilões de IP usam capacidade financeira própria para cada concorrente. Estúdios da mesma turma começam com caixa de garagem calibrado pela década e crescem com idade e vendas acumuladas; empresas estabelecidas partem de outro patamar. Um lance jamais pode superar 55% dessa capacidade. Assim, um rival recém-criado em 1991 fica abaixo de 500 mil de capacidade, enquanto uma veterana ainda pode disputar licenças grandes.

## Duração e progressão

- Microprojetos fecham em cerca de três meses; projetos pequenos em cinco.
- A cultura de crunch encurta a produção, mas deixa stress alto e perde qualidade média.
- Escalas maiores compram alcance e teto, não nota gratuita; equipe e escritório precisam absorver a complexidade.
- Eventos de projeto têm limite por escala: 1 no micro, 2 no pequeno, 3 no médio e 4 nos maiores.
- Carreiras autônomas de dez anos devem convergir para a faixa baixa dos 80 sem tornar notas 90 rotina.

## Como auditar

```bash
npm run balance:audit -- 100
```

O argumento é o número de execuções por cenário. A cauda rara usa mil vezes esse valor. Antes de aceitar uma mudança em `scoring.js`, compare pelo menos:

1. jogo inicial em 1980, 1990, 2000, 2010 e 2020;
2. perda financeira e duração por escala;
3. promessas, traços, culturas e playtest;
4. planos de lançamento;
5. estouros, fenômenos, 100M+ e 300M+;
6. carreiras autônomas de dez anos.

O script usa seeds fixas. Diferenças entre commits representam mudança de regra, não sorte da execução.
