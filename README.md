# Gamebobo

Um jogo rápido sobre montar um estúdio de games. Você decide o que fazer; os bonequinhos fazem acontecer num escritório 3D que dá para girar, dar zoom e espiar.

Tudo acontece dentro da indústria de verdade: consoles reais chegam na data certa, mais de 1.300 jogos reais (de Pac-Man a GTA VI) saem no mês em que saíram, e você briga com Nintendo, Sega, id Software, Rockstar e mais 60 empresas nas paradas e nos prêmios.

Versão atual: **1.1.0 — Almanaque**.

## Começar

Requer Node.js 20+.

```bash
npm install
npm run dev
```

No Windows com scripts do PowerShell bloqueados, use `npm.cmd` no lugar de `npm`.

```bash
npm run build      # versão de produção em dist/
npm run test       # regras do motor, conteúdo e uma carreira de regressão
npm run balance    # robô jogador: npm run balance -- 18 25 sensato|preguicoso|ousado
```

O site usa o caminho-base `/gamebobo/`. Todo envio para `main` roda testes, gera o build e publica no GitHub Pages pelo workflow `.github/workflows/deploy-pages.yml`.

## Como se joga

1. **Novo jogo** abre uma ficha em etapas: gênero, tema, plataforma, tamanho e a promessa da capa. Cada escolha vira uma etiqueta e a próxima linha aparece.
2. O tempo corre em semanas. O deck de videocassete pausa ou acelera.
3. A equipe senta e trabalha. Orbes coloridos saem dos monitores: diversão, visual, som e ideia. Os tubos do cartucho mostram o que o gênero pede e o que o jogo tem.
4. No começo da produção e do polimento você escolhe um foco com um clique.
5. Um **!** amarelo sobre a cabeça de alguém é uma ideia. Clique no boneco para decidir.
6. Lançamento: quatro críticos viram as cartas, a nota é carimbada e os fãs comentam. Às vezes a imprensa chama para uma coletiva de três perguntas. Depois, as vendas sobem nas paradas semana a semana.

Entre um jogo e outro: contratar, treinar, mudar de escritório, decorar, pesquisar, pegar freelas, comprar do Camelô, torcer nos Bobo Awards e folhear o **Almanaque** (mais vendidos da história, próximos consoles, empresas, marcos e recordes). Todo jogo e toda carreira viram um cartaz em PNG.

Mais fundo:

- **Modos de carreira**: nove regras permanentes escolhidas na criação do save, de Realista a Império Arcade.
- **Equipes**: várias equipes tocam projetos ao mesmo tempo; estúdios reais podem ser comprados e viram equipes remotas.
- **Tipos de projeto**: sequência, spin-off, remake, remaster, porte, coletânea, multiplataforma e gêneros híbridos.
- **Dez saves**: cada carreira vive no próprio espaço.

## Mapa rápido

| Onde | O que mora lá |
|---|---|
| `src/game/data/` | Gêneros, temas, combinações, plataformas reais, economia, equipe, calendário histórico (`history.js`), vendas de consoles (`consoleSales.js`) |
| `src/game/data/realgames/` | Os jogos reais, uma década por arquivo |
| `src/game/data/content/` | Eventos (inventados e históricos), ideias, imprensa, coletivas, comentários, nomes, empresas rivais, títulos, freelas, Camelô, conquistas, manchetes e promessas |
| `src/game/engine/` | Regras puras: reducer, semana, projeto, nota, vendas, mercado, coletiva, almanaque, títulos, progresso |
| `src/three/` | Escritório 3D: plantas, móveis, computadores de época, telas vivas, bonecos, cérebro dos bonecos, balões e partículas |
| `src/features/` | Interface por assunto: HUD, criação, modais, painéis, início |
| `src/ui/` | Ícones próprios, capa procedural, avatar 2D, fichas de efeito, cartazes em PNG |
| `src/styles/` | Tokens, base, HUD, folhas, modais, painéis e layout móvel |
| `scripts/balance.mjs` | Robô que joga carreiras inteiras e imprime notas, retorno e ritmo |
| `docs/` | Visão, arquitetura, balanceamento, save, conteúdo e histórico de pedidos |

### Quero mudar…

| Mudança | Arquivo |
|---|---|
| preços, tamanhos, escritórios, decoração, pesquisa, divulgação, eras | `src/game/data/economy.js` |
| o que cada gênero pede e quais combinações funcionam | `src/game/data/genres.js` |
| consoles e datas | `src/game/data/platforms.js` |
| jogos reais (data, estúdio, nota, vendas) | `src/game/data/realgames/<década>.js` |
| séries anuais e manchetes datadas | `src/game/data/history.js` |
| perguntas e respostas da coletiva | `src/game/data/content/press.js` |
| palavras e padrões dos títulos inventados | `src/game/data/content/titles.js` |
| vendas reais de consoles aposentados | `src/game/data/consoleSales.js` |
| empresas rivais e seu porte por época | `src/game/data/content/rivals.js` |
| traços, perfis do fundador, prêmios e títulos de legado | `src/game/data/staff.js` |
| modos, tipos de projeto, editoras, feiras, periféricos e choques de mercado | `src/game/data/modes.js` e `src/game/engine/modes.js` |
| equipes e compra de estúdios | `src/game/engine/teams.js` |
| fórmula da nota | `src/game/engine/quality.js` |
| fórmula de vendas | `src/game/engine/sales.js` |
| o que acontece a cada semana | `src/game/engine/tick.js` |
| comportamento dos bonecos | `src/three/agents.js` |
| móveis e plantas dos escritórios | `src/three/furniture.js` e `src/three/layouts.js` |
| computadores, teclados, mouses e cadeiras de cada época | `src/three/setups.js` |
| o que aparece nas telas | `src/three/screens.js` |

## Regra de dependência

`data → engine → features → app`, com `three/` lendo apenas um resumo do estado (`features/office/viewModel.js`).

- `engine` não importa React, CSS nem three.js.
- O 3D nunca altera o save; ele recebe o estado e os efeitos de cada semana.
- Telas enviam ações ao reducer; não editam o estado na mão.

## Save

Automático e local (`localStorage`, dez espaços `gamebobo-3d-slot-1` a `gamebobo-3d-slot-10`). Saves da série 0.x não são migrados: o conceito mudou demais. Veja [docs/SAVE_SCHEMA.md](docs/SAVE_SCHEMA.md).

## Antes de entregar uma mudança

1. `npm run test`
2. `npm run build`
3. Jogar um lançamento completo e abrir todos os painéis.
4. Conferir 375 px e desktop.
5. Se mexeu em nota ou economia, rodar `npm run balance` e comparar com [docs/BALANCE.md](docs/BALANCE.md).
