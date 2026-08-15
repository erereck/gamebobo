# Gamebobo

Um jogo de carreira sobre fazer jogos e conviver com o resultado. A meta não é encontrar uma fórmula perfeita: é terminar o save com histórias que só aconteceram naquela linha do tempo.

Versão atual: **0.11.0 — Promessa da Capa**.

## Começar

Requer Node.js 20+.

```bash
npm install
npm run dev
```

Outros comandos:

```bash
npm run build       # gera a versão de produção em dist/
npm run test        # testa as regras centrais sem abrir o navegador
npm run balance     # simula 25 mil lançamentos por era e imprime percentis
npm run balance:audit -- 100 # audita projetos, planos, culturas, cauda rara e carreiras
npm run version -- patch "descrição curta"
npm run prompt -- "resumo do pedido que originou a mudança"
```

No Windows com execução de scripts PowerShell bloqueada, use `npm.cmd` no lugar de `npm`.

## Publicação

O site usa o caminho-base `/gamebobo/`. Todo envio para a branch `main` executa testes, gera o build e publica no GitHub Pages pelo workflow `.github/workflows/deploy-pages.yml`.

Para validar a mesma build localmente:

```bash
npm run build
npm run preview
```

O save continua no navegador do jogador (`localStorage`), portanto não exige conta nem servidor. No celular, o manifesto permite instalar o Gamebobo na tela inicial como aplicativo.

## Mapa rápido

| Onde | O que mora lá |
|---|---|
| `src/app/` | Estado global, navegação e composição da aplicação |
| `src/components/` | Peças visuais reutilizáveis; não contém regra de jogo |
| `src/features/` | Interfaces ligadas a um sistema específico, como projeto ou lançamento |
| `src/screens/` | As oito telas principais |
| `src/game/data/` | Conteúdo editável: eventos, traços, gêneros, mercados e textos |
| `src/game/engine/` | Regras puras: reducer, pontuação, calendário, pós-lançamento |
| `src/game/persistence/` | Save, migrações e compatibilidade com versões anteriores |
| `src/styles/` | Tokens, base, componentes e responsividade |
| `docs/` | Visão, arquitetura, voz editorial, schema do save e histórico de prompts |
| `.interface-design/system.md` | Contrato visual para futuras sessões |
| `scripts/` | Versionamento e registro de prompts |

Se você não sabe onde colocar uma mudança, consulte [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) antes de criar um arquivo novo.

### Quero mudar…

| Mudança | Arquivo principal |
|---|---|
| gêneros, temas ou escalas | `src/game/data/catalog.js` |
| consoles e datas regionais | `src/game/data/platformHistory.js` |
| IPs, titulares e condições-base | `src/game/data/licenses.js` |
| expansão ampla de IPs | `src/game/data/licenseExpansion.js` |
| cláusulas de licenciamento | `src/game/data/licenseClauses.js` |
| jogos, empresas e marcos reais citados | `src/game/data/industryHistory.js` |
| Top 20 histórico de cada década | `src/game/data/salesHistory.js` |
| estúdios fictícios da turma inicial | `src/game/data/startupStudios.js` |
| empresas parceiras e suas IPs | `src/game/data/corporatePartners.js` |
| ranking, vendas amadurecidas e recordes | `src/game/engine/charts.js` |
| confiança, encomendas, valuation e aquisições | `src/game/engine/corporate.js` |
| negociação, leilão, contrato e reputação de IP | `src/game/engine/licensing.js` |
| traços e upgrades do quarto | `src/game/data/traits.js` |
| evento durante um projeto | `src/game/data/projectEvents.js` |
| promessas, fases, público e peso de escopo | `src/game/data/projectPromises.js` |
| evento depois do lançamento | `src/game/data/postLaunchEvents.js` |
| vida pessoal | `src/game/data/personalEvents.js` |
| equipe, cargos, cultura e escritórios | `src/game/data/team.js` e `src/game/engine/studio.js` |
| contratos, editoras e empréstimos | `src/game/data/business.js` e `src/game/engine/business.js` |
| eras, tecnologia e pesquisa | `src/game/data/eras.js` |
| prêmios anuais e cerimônia | `src/game/data/awards.js`, `src/game/engine/awards.js` e `src/features/awards/AwardsModal.jsx` |
| eventos entre estúdios, equipe ou franquias | `competitorEvents.js`, `studioEvents.js` ou `franchiseEvents.js` |
| gêneros que podem nascer no save | `src/game/data/hybridGenres.js` |
| nota, demanda histórica, vendas e margem | `src/game/engine/scoring.js` e `src/game/engine/sales-model.js` |
| metas, percentis e auditoria de balanceamento | `docs/BALANCE.md` e `scripts/balance-audit.mjs` |
| passagem do mês e mercado | `src/game/engine/world.js` |
| ações disponíveis | `src/game/engine/reducer.js` e `src/features/career/MonthActions.jsx` |
| texto e tom | `docs/CONTENT_GUIDE.md`, depois o arquivo em `data/` |
| cor, espaço ou tipografia | `src/styles/tokens.css` e `.interface-design/system.md` |
| versão mostrada no jogo | rode `npm run version`; não edite os arquivos gerados à mão |
| pacote externo de IPs | `docs/LICENSE_PACKS.md` e o exemplo em `public/content-packs/` |
| entrada, continuar save e ficha de carreira | `src/features/onboarding/` e `src/styles/onboarding.css` |
| moedas e conversão de exibição | `src/game/engine/utils.js` e `state.settings.currency` |
| avisos temporizados e configurações | `src/features/events/InfoModal.jsx`, `src/features/settings/SettingsModal.jsx` e `state.settings.timelineNotices` |
| trilha, loop e Media Session | `src/app/music.js` e `src/features/settings/MusicPlayer.jsx` |
| ícones SVG da interface | `src/components/ui/Icon.jsx` |
| músicas, capas e créditos | `src/assets/music/` e `docs/CREDITS.md` |
| canais de divulgação de cada época | `src/game/data/marketingEras.js` e `src/game/data/eraLanguage.js` |
| veículos, notas e textos da crítica | `src/game/data/reviews.js` e `src/game/engine/scoring.js` |
| campanhas com criadores e chat ao vivo | `src/game/data/creatorCoverage.js` e `src/features/events/DecisionModal.jsx` |
| feiras locais, BGS, E3, gamescom e palcos digitais | `src/game/data/gameEvents.js` e `src/screens/IndustryScreen.jsx` |
| limites de vendas dos concorrentes | `src/game/engine/market.js` e `npm run balance` |
| feedback numérico no cabeçalho | `src/components/layout/StatStrip.jsx` e `src/components/ui/CountUp.jsx` |

## Regra de dependência

O fluxo deve apontar nesta direção:

`data → engine → features/screens → app`

- `engine` não importa React nem CSS.
- `data` não conhece componentes.
- componentes genéricos não alteram o save diretamente.
- telas enviam ações ao reducer; não editam o estado na mão.

## Saves

O save é automático e local. A versão 0.6 preserva saves das versões 0.2 a 0.5 e também migra o protótipo `gamebobo-save-v1`. Regras de migração estão em [docs/SAVE_SCHEMA.md](docs/SAVE_SCHEMA.md).

## O loop em camadas

- **Mês:** trabalhar, estudar, pesquisar, descansar, divulgar ou avançar uma build.
- **Projeto:** promessa de capa, protótipo, produção, polimento, playtest, pendências, orçamento, hype, editora e plano de lançamento.
- **Pós-lançamento:** vendas de cauda, patches, comunidade, prêmios, franquias e rivalidades.
- **Estúdio:** contratações, salários, cultura, escritório, pesquisa, dívida e reputação.
- **Décadas:** novas plataformas, eras tecnológicas, gêneros que nascem no save e sucessores que mantêm o mundo vivo depois do fundador.
- **Direitos:** pedidos recusados, propostas, royalties, cláusulas, leilões exclusivos, crossovers e memória de cada IP.
- **Paradas:** Top 20 por década e geral, arquivo histórico progressivo, jogos do jogador, rivais alternativos e sucessos da turma de garagem.
- **Empresas:** portfólio, confiança, parcerias, encomendas de IP, valuation, contraproposta e aquisição sem encerrar o save.

## Conteúdo histórico e distribuição

O banco incluído usa nomes reais como referência para uma simulação local e uma linha do tempo alternativa. Ele não inclui logos, artes, modelos ou material audiovisual de terceiros. Ser pequeno, gratuito ou indie não cria por si só autorização para publicar um jogo usando propriedades e marcas alheias. Antes de distribuir uma build com esse catálogo, revise [docs/CONTENT_NOTICE.md](docs/CONTENT_NOTICE.md) e decida entre licenciamento, catálogo original ou pacote externo mantido pelo usuário.

Pacotes externos já podem ser importados pela própria tela de Licenças. O formato está em [docs/LICENSE_PACKS.md](docs/LICENSE_PACKS.md).

## Antes de entregar uma mudança

1. `npm run test`
2. `npm run build`
3. Jogar pelo menos um mês e abrir todas as telas.
4. Verificar 390 px e desktop.
5. Atualizar `CHANGELOG.md` e `docs/PROMPTS.md` quando a mudança veio de um novo pedido.
