# Save

Schema atual: **100**. Dez espaços no `localStorage`: `gamebobo-3d-slot-1` a `gamebobo-3d-slot-10`. O save único das primeiras builds 3D (`gamebobo-3d-save`) vira o espaço 1 automaticamente.

A série 0.x (chave `gamebobo-save`, schema até 6) não é migrada. A tela inicial avisa quando encontra um save antigo e não o apaga.

## Blocos principais

- `studio`, `year`, `week` (48 semanas por ano), `startYear`
- `money`, `fans`, `rp`, `legacy`
- `office` (0 a 5), `decor`, `techs`, `kits`
- `staff`: fundador e equipe, com habilidades, nível, XP, traço, energia, humor, status e visual
- `candidates`, `freelas`, `visitor` (Camelô)
- `mode`: modo de carreira, franquia travada, empresa dona e encomenda atual
- `teams`: equipes (locais e remotas); cada pessoa guarda `team`
- `projects`: jogos e freelas em andamento, um por equipe
- `acquired`: estúdios reais comprados
- `goty`: Jogo do Ano da indústria por ano
- `slot`: espaço de save da carreira
- `games`: lançamentos com críticas, vendas, receita e pico nas paradas
- `combos`: combinações já testadas e a nota de cada uma
- `market`: moda atual, próxima moda e quando ela vira
- `rivals`, `rivalGames`, `chart`
- `ideas`, `couples`, `trophies`, `achievements`, `stats`
- `queue`, `toasts`, `log`, `settings`

`fx` e `toasts` são transitórios e são limpos ao carregar.

O jogo salva logo depois de qualquer ação do jogador, a cada mês do calendário e ao sair da aba.
