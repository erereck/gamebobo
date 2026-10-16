# Gamebobo — sistema de interface (1.0)

## Direção

Um diorama de brinquedo flutuando no céu da era. A interface são objetos de jogo de verdade colados por cima: placa de estúdio, calendário de mesa, deck de videocassete, cartucho com etiqueta, adesivos. Nada de painel de startup.

## Assinaturas

- **Cartucho do projeto**: corpo cinza com ranhuras, etiqueta com a capa gerada, trilho de fases e quatro tubos de ensaio (diversão, visual, som, ideia) com a marca do que o gênero pede.
- **Deck de videocassete**: pausa, normal, rápido, turbo. A tecla acesa fica rosa quando uma janela segura o tempo.
- **Adesivo**: contorno de 2,5 px na cor tinta, sombra dura de 3 a 7 px para baixo, cantos de 12 a 24 px. Clicar afunda o adesivo.
- **Capa procedural**: gradiente do par gênero+tema, padrão de ícones do gênero, medalhão com o ícone do tema, faixa da plataforma e título em caixa alta.

## Tokens

- tinta `#1d1a24`, papel `#fff8ec`, papel 2 `#f4ead8`
- tomate `#ff5d3a` (ação principal), sol `#ffd23f` (destaque), céu `#3fb8ff`, menta `#52d977`, uva `#b57bff`, rosa `#ff6bd6`
- pilares: diversão `#ff7a45`, visual `#3fb8ff`, som `#b57bff`, ideia `#ffc93c`

## Tipografia

- Bricolage Grotesque Variable, peso 800, para títulos e rótulos.
- Martian Mono para números, datas e metadados.

## Regras de texto

- Título de evento com até 7 palavras. Botão com até 3. Resultado com até 8.
- Efeitos aparecem como ícone + seta (▲ pouco, ▲▲ muito). Aposta mostra a chance em %.
- Nenhum parágrafo explicativo em tela de jogo.

## Movimento

- Entradas com mola (`cubic-bezier(.34,1.56,.64,1)`), 250 a 450 ms.
- A revelação das críticas é o único momento longo: 4,6 s, pulável com um toque.
- Movimento reduzido desliga animações.

## 3D

- Câmera ortográfica isométrica, giro limitado entre 11° e 79°, zoom de 0,75× a 2,8×.
- Bonecos chibi em primitivas: cabeça grande, olhos que piscam, sobrancelhas e boca que reagem, bochechas, mãos e joelhos; treze cortes de cabelo, cinco blusas, calça/bermuda/saia, óculos, fone, boné, gorro e faixa.
- Balões são pictogramas desenhados com os mesmos ícones da interface.
- Crunch = noite: sol baixo, monitores e luminárias acesos, caixas de pizza nas mesas.
