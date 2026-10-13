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

- `state.queue`: momentos que pausam o tempo (evento, ideia, foco de fase, pronto para lançar, revelação, prêmios, falência).
- `state.toasts`: avisos que somem sozinhos (conquista, parada, freela, romance).
- `state.ideas`: os ! sobre as cabeças. Clicar no boneco transforma a ideia em janela.

## 3D

- `layouts.js`: cinco plantas com mesas, posições de decoração e de pôsteres.
- `furniture.js`: móveis procedurais com pontos de interação (sentar, café, jogar, olhar).
- `nav.js`: grade de 0,5 com A*.
- `character.js`: boneco em primitivas com poses misturadas (andar, sentar, digitar, beber, jogar, comemorar, dormir).
- `agents.js`: cérebro de cada boneco, conversa estilo Sims, gato e Camelô.
- `bubbles.js`: balões desenhados em canvas com os mesmos ícones da interface.
- `particles.js`: orbes de produção, confete e ícones flutuantes.

## Aleatoriedade

O reducer recebe `random`. O jogo usa `Math.random`; testes e o robô de balanceamento usam `mulberry32` com semente fixa.
