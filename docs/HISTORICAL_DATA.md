# Dados históricos

## Convenção de datas

Datas em `platformHistory.js` usam `[ano, mês, dia]`, com janeiro igual a `0`. O dia é omitido apenas quando a consolidação inicial não chegou a uma fonte regional suficientemente segura. A interface converte para `DD/MM/AAAA` ou `MM/AAAA`.

Regiões:

- `jp`: Japão;
- `na`: América do Norte;
- `eu`: Europa;
- `global`: lançamento simultâneo ou data mundial de referência.

A plataforma entra na simulação no primeiro lançamento regional registrado e sai da seleção de novos projetos depois de `endYear`. Jogos publicados continuam no histórico.

## Escopo

O arquivo cobre 37 plataformas de relevância global entre o começo da carreira em 1980 e a geração de 2020, além do PC e do mobile. “Todos os consoles” não é um conjunto estável: há revisões, clones regionais, microconsoles e aparelhos com documentação conflitante. Por isso o catálogo declara explicitamente que é curado e permanece extensível.

## Fontes de revisão inicial

- [Linha do tempo oficial PlayStation — PS1](https://www.playstation.com/pt-br/playstation-history/1994-ps-one/).
- [Linha do tempo oficial PlayStation — PS2 e PSP](https://www.playstation.com/pt-br/playstation-history/2000-ps2-psp/).
- [Linha do tempo oficial PlayStation — PS3 e Vita](https://www.playstation.com/pt-br/playstation-history/2007-ps3-ps-vita/).
- [Linha do tempo oficial PlayStation — PS4](https://www.playstation.com/pt-br/playstation-history/2013-ps4-ps-vr/).
- [Página oficial do PlayStation 5](https://www.playstation.com/en-us/ps5/).
- [Linha do tempo de aniversário oficial Xbox](https://www.xbox.com/en-CA/xbox-25th-anniversary).
- [História oficial Nintendo](https://careers.nintendo.com/our-history/).
- [História corporativa oficial Sega](https://www.sega.jp/history/companyTimeline/en/).

Entradas sem uma cronologia regional completa do fabricante foram consolidadas a partir de referências históricas amplamente aceitas. Antes de uma edição de museu ou pesquisa, faça uma segunda revisão por plataforma e registre a fonte na própria entrada.

## Paradas de vendas

`salesHistory.js` mantém um retrato de 20 jogos para cada década. Os anos 1980–2010 usam listas históricas consolidadas; a década de 2020 combina números públicos de fabricantes e um retrato editorial atual. Valores sem divulgação comparável recebem `figureType: estimate` e aparecem com asterisco no jogo.

- [Década de 1980](https://en.wikipedia.org/wiki/1980s_in_video_games)
- [Década de 1990](https://en.wikipedia.org/wiki/1990s_in_video_games)
- [Década de 2000](https://en.wikipedia.org/wiki/2000s_in_video_games)
- [Década de 2010](https://en.wikipedia.org/wiki/2010s_in_video_games)
- [Nintendo — vendas de software](https://www.nintendo.co.jp/ir/en/finance/software/index.html)
- [Capcom — Platinum Titles](https://www.capcom.co.jp/ir/english/business/million.html)

O lifetime não entra inteiro no lançamento. O motor libera 55% no primeiro ano e distribui o restante por cinco anos, deixando a parada se mover e abrindo espaço para jogos alternativos.

## Colaborações como referência de sistema

A “Mesa dos grandes” usa empresas e IPs reais como referência editorial, mas probabilidades, valores, confiança e propostas pertencem à simulação. O precedente Nintendo/Capcom foi revisado na entrevista oficial [Iwata Asks — história dos Zelda portáteis](https://iwataasks.nintendo.com/interviews/ds/zelda/1/2/): a Nintendo acompanhou de perto os Oracles e declarou ter delegado mais depois que a primeira colaboração funcionou. Essa progressão inspirou a regra `entrega → confiança → autonomia`, sem tentar reproduzir contratos reais.
