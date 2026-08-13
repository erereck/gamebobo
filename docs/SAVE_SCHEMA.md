# Save schema

Schema atual: **6**.

Chave: `gamebobo-save`.

## Blocos principais

- `player`: dinheiro, energia, estresse, atributos, traço, equipamento, geração e público.
- `date`: mês e ano da linha do tempo.
- `currentProject`: projeto em desenvolvimento ou `null`.
- `currentContract`: trabalho terceirizado em andamento ou `null`.
- `games`: lançamentos permanentes.
- `activeReleases`: jogos ainda recebendo acontecimentos de pós-lançamento.
- `market`: tendências, plataformas e duração do ciclo atual.
- `competitors`: estúdios procedurais e últimos lançamentos.
- `history`: fita cronológica.
- `queue`: modais ainda não resolvidos.
- `world`: era, tecnologia, gêneros descobertos, notícias e história da indústria.
- `studio`: nome, equipe, cultura, escritório, pesquisa, despesas fixas e cadeia de lideranças.
- `opportunities`: contratos e propostas de editoras disponíveis.
- `awards`: troféus, indicações e anos já processados.
- `licenses`: estado dinâmico das IPs, contratos, propostas, exclusividades, leilões e histórico de negociações.

## Migração 1 → 2

`src/game/persistence/migrate.js` importa dinheiro, energia, atributos, jogos e histórico do protótipo. Campos inexistentes recebem valores seguros. O save antigo só é removido depois que o novo save é gravado.

Nunca altere o formato de um campo existente sem aumentar `saveSchema` em `version.json` e criar uma migração.

## Migração 2 → 3

Preserva todos os jogos, projetos e eventos. Adiciona mundo, estúdio, oportunidades, prêmios, saúde, hype e metadados de franquia com padrões conservadores.

Campos do schema 3 foram desenhados para crescer por composição. Novas propriedades internas devem receber fallback em `migrateV2`; coleções procedurais precisam de IDs estáveis para não repetir acontecimentos já vistos.

## Migração 3 → 4

Preserva carreira, projetos e catálogo. Adiciona ano inicial, marcos históricos já vistos e a mesa de licenças. Projetos e jogos antigos recebem listas de IP vazias; nenhuma licença é inventada retroativamente.

O bloco `licenses.catalog` guarda apenas estado mutável (`popularity`, `prestige`, `trust`, `history`). Nome, titular, afinidades e cláusulas continuam em `data/licenses.js`, evitando duplicar o catálogo inteiro em cada save.

## Migração 4 → 5

Preserva contratos e concorrentes. Acrescenta o estado mutável das novas IPs e cria quatro estúdios fictícios fundados no mesmo ano do jogador quando a carreira antiga ainda não possui uma coorte. Jogos rivais antigos recebem `age`, `initialSales` e `breakout` com valores conservadores.

As paradas não são gravadas: `charts.js` deriva o ranking do arquivo histórico, `games` e `competitors`. Um save antigo reflete o sistema novo imediatamente.

## Migração 5 → 6

Adiciona `corporate`, com relações por empresa, ofertas, parcerias, encomenda ativa, arquivo e eventual controladora. O estúdio recebe `parentCompany` e `autonomy`; projetos e jogos antigos recebem vínculo corporativo nulo.

A migração também encadeia schemas 2, 3 e 4 até o formato atual numa única leitura. Nenhuma parceria ou venda é inventada retroativamente.
