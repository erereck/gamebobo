# Arquitetura

## Camadas

```
src/game/data      conteúdo e números editáveis
src/game/engine    regras puras (sem React, sem three.js)
src/three          escritório 3D, só leitura do estado
src/features       interface por assunto
src/ui             peças visuais reutilizáveis
src/app            store, relógio, áudio, música
```

## Fluxo de uma semana

1. `app/App.jsx` roda um intervalo conforme a velocidade do deck e despacha `TICK`, a menos que haja janela aberta.
2. `engine/tick.js` envelhece a equipe, faz a semana de trabalho, vende jogos, move os rivais, monta as paradas, cobra o mês, sorteia eventos, ideias, modas, Camelô e romance, e fecha o ano com os prêmios.
3. Tudo que merece espetáculo vira um item em `state.fx` (trabalho, bug, venda, lançamento, comemoração).
4. `app/store.js` entrega `fx` ao mundo 3D (`three/world.js#handleFx`) e aos sons.
5. `features/office/viewModel.js` resume o estado para o 3D. O mundo só se reconstrói quando escritório, era, decoração ou pôsteres mudam.

## Janelas e avisos

- `state.queue`: momentos que pausam o tempo (evento, ideia, foco de fase, pronto para lançar, revelação, coletiva, prêmios, feira, falência). Itens de projeto levam `projectId`. A coletiva (`engine/press.js`) entra logo depois da revelação e responde a `PRESS_ANSWER`; `CLOSE` no meio vira "sem comentários".
- `state.projects`: um projeto por equipe. `engine/teams.js` liga pessoas, equipes e projetos; `engine/modes.js` concentra as regras de cada modo.
- `state.toasts`: avisos que somem sozinhos (conquista, parada, freela, romance).
- `state.ideas`: os ! sobre as cabeças. Clicar no boneco transforma a ideia em janela.

## 3D

- `layouts.js`: seis plantas com mesas, posições de decoração, pôsteres e a paisagem da janela.
- `furniture.js`: móveis procedurais com pontos de interação. Todo ponto de sentar leva `seatY` (altura do assento); a cama leva `lie` (onde e como deitar). `world.add` gira esses dados junto com o móvel.
- `setups.js`: computador, teclado, mouse, cadeira e bagunça de cada mesa conforme a era e o escritório.
- `screens.js`: telas vivas em canvas compartilhado por era e programa, redesenhadas poucas vezes por segundo e só quando visíveis.
- `kit.js` e `bake.js`: cache de geometrias e materiais e fusão das peças paradas em poucas malhas.
- `nav.js`: grade de 0,5 com A*.
- `character.js`: boneco em primitivas com poses misturadas (andar, sentar, deitar, digitar, beber, jogar, comemorar, dormir), rosto expressivo, roupas e acessórios derivados do `look`. Exporta `SEAT_HIP`: o boneco sentado fica em `seatY - SEAT_HIP × altura`.
- `agents.js`: cérebro de cada boneco, conversa estilo Sims, gato e Camelô.
- `bubbles.js`: balões desenhados em canvas com os mesmos ícones da interface.
- `particles.js`: orbes de produção, confete e ícones flutuantes.

## Indústria

- `data/realgames/`: jogos reais com estúdio, `rivalId` (ou `null`), data, nota e vendas. `market.js` solta cada um na semana certa pelo `historyCursor`; quando a lista muda, `HISTORY_VERSION` sobe e saves antigos recalculam o cursor.
- Empresa com jogo real a um ano de distância não lança jogo inventado. Os inventados usam `engine/titles.js` (inglês, estilo da época).
- `engine/almanac.js` monta o catálogo uma vez e corta pela data do save com busca binária; o painel só lê.

## Aleatoriedade

O reducer recebe `random`. O jogo usa `Math.random`; testes e o robô de balanceamento usam `mulberry32` com semente fixa.
