# Conteúdo histórico, marcas e nomes reais

O Gamebobo usa nomes reais de consoles, fabricantes, estúdios, jogos e veículos de imprensa como referência histórica. A ideia é que sua carreira aconteça dentro da indústria de verdade: o Super Mario Bros. sai em setembro de 1985, o Doom em dezembro de 1993 e o Minecraft em novembro de 2011, e o seu estúdio disputa as paradas com eles.

## O que existe nesta build

- Plataformas reais com mês e ano do primeiro lançamento (`src/game/data/platforms.js`).
- 65 empresas reais como rivais, com fundação, fechamento e porte por época (`src/game/data/content/rivals.js`).
- 129 jogos históricos e séries anuais (FIFA, Winning Eleven/PES, Call of Duty) em `src/game/data/history.js`. Notas e vendas são aproximações editoriais, não dados oficiais.
- Manchetes e eventos ligados a momentos reais (`MILESTONES` e `realEvents.js`).
- Jogos inventados dos rivais são ficção de linha do tempo alternativa e não representam lançamentos reais dessas empresas.

Não há logos, ilustrações, músicas, personagens desenhados ou qualquer material extraído dos jogos citados. Capas, ícones, móveis e bonecos são gerados pelo próprio jogo.

## Postura do projeto

O Gamebobo é um projeto pequeno, gratuito e não comercial, feito por fã. Os nomes aparecem apenas como texto de referência. Se algum titular pedir a retirada de um nome, basta trocar a entrada nos arquivos de dados; o motor não depende de nenhum nome específico.

## Regra editorial

- Piadas com empresas reais devem ser carinhosas e verificáveis (o enterro dos cartuchos de E.T. aconteceu, a torre da Ubisoft é meme de fã).
- Nada de acusação, difamação ou piada sobre pessoas reais.
- Datas e números ficam nos arquivos de dados, nunca no motor.
