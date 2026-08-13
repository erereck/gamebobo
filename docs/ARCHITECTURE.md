# Arquitetura

## Fluxo de uma ação

1. Uma tela dispara uma ação, por exemplo `MONTH_ACTION`.
2. `src/game/engine/reducer.js` aplica a regra.
3. O engine avança o calendário e pode enfileirar acontecimentos.
4. `App.jsx` salva o novo estado automaticamente.
5. A interface renderiza o primeiro item de `state.queue` como modal.

## Diretórios

### `game/data`

Conteúdo que deve ser fácil de aumentar sem mexer nas regras. Eventos são objetos serializáveis. Efeitos usam um vocabulário pequeno (`money`, `energy`, `quality`, `followers`, etc.).

### `game/engine`

Funções puras sempre que possível. Este diretório é o lugar correto para balanceamento, cálculo de nota, vendas, passagem do tempo e interpretação dos efeitos dos eventos.

### `features`

Componentes que conhecem o domínio. Exemplo: `NewProjectModal` conhece gêneros e escalas; `Button` não.

### `screens`

Organizam features para formar uma tela. Não devem repetir cálculo existente no engine.

### `components`

`ui/` guarda controles genéricos. `layout/` guarda cabeçalho, navegação e estrutura persistente.

## Como adicionar um evento

1. Escolha o arquivo pelo dono do acontecimento: projeto, pós-lançamento, vida pessoal, mundo, estúdio, concorrente ou franquia.
2. Use um `id` único e estável.
3. Escreva de duas a três escolhas com custo legível.
4. Use apenas efeitos suportados por `effects.js`.
5. Para textos com `{name}`, `{studio}` ou `{franchise}`, confira a hidratação em `world.js`.
6. Teste um caminho bom e um ruim.

## Como adicionar uma tela

Só crie outra tela se o jogador visitar esse lugar com uma intenção diferente. Primeiro tente encaixar a informação em Carreira, Projetos, Estúdio, Mercado, Indústria ou História.

## Sistemas de longo prazo

- `world.js` orquestra calendário, mercado, eras, plataformas, concorrentes e filas de acontecimentos.
- `studio.js` concentra pessoas, contribuição, salários, escritório, moral e pesquisa.
- `business.js` concentra contratos, editoras e crédito.
- `awards.js` processa uma cerimônia por ano e mantém indicações e troféus.
- `innovation.js` decide quando um gênero híbrido passa a existir na linha do tempo.
- `licensing.js` concentra elegibilidade, preço dinâmico, propostas, contratos, leilões, cláusulas, crossovers e memória comercial das IPs.
- `selectors.js` deriva filosofia, franquias e recordes sem duplicar dados no save.
- `charts.js` mistura o arquivo de vendas com jogos do jogador e concorrentes; toda tela de ranking consulta esse motor.
- `corporate.js` concentra relacionamento empresarial, propostas, briefs, valuation, parceria e mudança de controle.

Escalas e plataformas são desbloqueadas por estado do mundo. A interface filtra opções indisponíveis, mas o reducer sempre valida novamente: nunca confie apenas na tela.

## Catálogos históricos

- `platformHistory.js`: hardware, fabricante, tipo, datas regionais e fim da janela comercial.
- `industryHistory.js`: marcos editoriais e empresas usadas na linha do tempo alternativa.
- `licenses.js`: dados comerciais e afinidades das propriedades.
- `licenseClauses.js`: vocabulário de restrições reaproveitado por diferentes IPs.
- `licenseExpansion.js`: catálogo amplo separado do núcleo para facilitar revisão.
- `salesHistory.js`: 20 posições de base por década, números reportados/estimados e links de referência.
- `startupStudios.js`: identidades da coorte fictícia criada no começo de cada carreira.
- `corporatePartners.js`: empresas, estratégia, IPs que podem encomendar e perfil de autonomia em uma aquisição.

O catálogo histórico é curado, não uma promessa de cobrir todo aparelho já lançado. Novas entradas devem manter IDs estáveis, registrar datas como `[ano, mêsZeroBased]` e funcionar sem imagens protegidas.
