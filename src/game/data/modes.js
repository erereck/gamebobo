// Modos de carreira: a regra escolhida na criação do save vale para sempre.
export const GAME_MODES = [
  { id: 'tradicional', label: 'Tradicional', icon: 'gamepad', tag: 'Padrão', rules: ['Tudo liberado'] },
  { id: 'realista', label: 'Realista', icon: 'chart', tag: 'Difícil', rules: ['Receita −30%', 'Caixa inicial menor', '9+ e troféus raros'] },
  { id: 'portatil', label: 'Portátil', icon: 'phone', tag: 'Especial', rules: ['Só portáteis', 'Começa no Game & Watch'] },
  { id: 'franquia', label: 'Franquia Única', icon: 'crown', tag: 'Especial', rules: ['O 1º jogo vira a única série', 'Sem cansaço de franquia'] },
  { id: 'adquirido', label: 'Estúdio Adquirido', icon: 'briefcase', tag: 'Diferente', rules: ['Começa com 3 pessoas', 'A dona leva 30%', 'Encomendas pagam bônus'] },
  { id: 'solo', label: 'Autor Solo', icon: 'user', tag: 'Difícil', rules: ['Ninguém contrata', 'Projetos mais rápidos', 'Você evolui mais'] },
  { id: 'indie', label: 'Indie Eterno', icon: 'heart', tag: 'Especial', rules: ['Só Micro e Pequeno', 'Produção mais barata', 'Fãs fiéis'] },
  { id: 'arcade', label: 'Império Arcade', icon: 'arcade', tag: 'Especial', rules: ['Só fliperama', 'Sobreviva ao fim das fichas'] },
  { id: 'antologia', label: 'Antologia', icon: 'book', tag: 'Especial', rules: ['Só IPs novas', 'Nunca repete combinação'] },
]

export const modeById = id => GAME_MODES.find(mode => mode.id === id) ?? GAME_MODES[0]

// Tipos de projeto: o que o estúdio pode fazer além de um jogo novo.
export const PROJECT_TYPES = [
  { id: 'original', label: 'Jogo novo', icon: 'sparkle', cost: 1, weeks: 1, score: 0, reach: 1 },
  { id: 'sequel', label: 'Sequência', icon: 'refresh', cost: 1.05, weeks: 1, score: 0, reach: 1.1, source: 'franchise' },
  { id: 'spinoff', label: 'Spin-off', icon: 'compass', cost: .9, weeks: .9, score: 0, reach: 1.1, source: 'franchise' },
  { id: 'remake', label: 'Remake', icon: 'hammer', cost: .85, weeks: .85, score: 3, reach: 1.1, source: 'game' },
  { id: 'remaster', label: 'Remaster', icon: 'sparkle', cost: .45, weeks: .5, score: 2, reach: .5, source: 'game', quick: true },
  { id: 'port', label: 'Porte', icon: 'gamepad', cost: .32, weeks: .38, score: 0, reach: .45, source: 'game', quick: true },
  { id: 'collection', label: 'Coletânea', icon: 'cards', cost: .55, weeks: .6, score: 2, reach: .6, source: 'many', quick: true },
]

export const projectTypeById = id => PROJECT_TYPES.find(type => type.id === id) ?? PROJECT_TYPES[0]

// Editoras reais que podem bancar parte do jogo. Elas também recusam.
export const PUBLISHERS = [
  { id: 'activision', name: 'Activision', from: 1980, to: 9999, pays: .6, cut: .35, hype: 10, bar: 6.5 },
  { id: 'atari', name: 'Atari', from: 1980, to: 1984, pays: .7, cut: .4, hype: 8, bar: 5.5 },
  { id: 'ea', name: 'Electronic Arts', from: 1983, to: 9999, pays: .7, cut: .4, hype: 14, bar: 7 },
  { id: 'tectoy', name: 'Tectoy', from: 1987, to: 2005, pays: .5, cut: .3, hype: 6, bar: 5 },
  { id: 'sega', name: 'Sega', from: 1985, to: 9999, pays: .65, cut: .38, hype: 12, bar: 6.8 },
  { id: 'nintendo', name: 'Nintendo', from: 1985, to: 9999, pays: .7, cut: .42, hype: 16, bar: 7.8 },
  { id: 'sony', name: 'Sony', from: 1995, to: 9999, pays: .7, cut: .4, hype: 15, bar: 7.5 },
  { id: 'eidos', name: 'Eidos', from: 1995, to: 2009, pays: .6, cut: .35, hype: 10, bar: 6.5 },
  { id: 'microsoft', name: 'Microsoft', from: 2001, to: 9999, pays: .75, cut: .42, hype: 14, bar: 7.2 },
  { id: 'take2', name: 'Take-Two', from: 1998, to: 9999, pays: .65, cut: .38, hype: 12, bar: 7 },
  { id: 'ubisoft', name: 'Ubisoft', from: 1990, to: 9999, pays: .6, cut: .36, hype: 12, bar: 6.6 },
  { id: 'squareenix', name: 'Square Enix', from: 2003, to: 9999, pays: .6, cut: .38, hype: 11, bar: 7 },
  { id: 'devolver', name: 'Devolver Digital', from: 2009, to: 9999, pays: .45, cut: .25, hype: 9, bar: 6, indie: true },
  { id: 'annapurna', name: 'Annapurna Interactive', from: 2016, to: 9999, pays: .5, cut: .28, hype: 8, bar: 6.5, indie: true },
]

// Feiras anuais: escolha qual jogo sobe ao palco.
export const EXPOS = [
  { id: 'ces', name: 'CES', month: 0, from: 1980, to: 1994, cost: 2500, hype: 14, sales: 1.08, minFans: 0 },
  { id: 'e3', name: 'E3', month: 5, from: 1995, to: 2019, cost: 9000, hype: 26, sales: 1.15, minFans: 3000 },
  { id: 'tgs', name: 'Tokyo Game Show', month: 8, from: 1996, to: 9999, cost: 6000, hype: 18, sales: 1.1, minFans: 2000 },
  { id: 'gamescom', name: 'Gamescom', month: 7, from: 2009, to: 9999, cost: 8000, hype: 22, sales: 1.12, minFans: 5000 },
  { id: 'bgs', name: 'Brasil Game Show', month: 9, from: 2009, to: 9999, cost: 3500, hype: 16, sales: 1.1, minFans: 0 },
  { id: 'sgf', name: 'Summer Game Fest', month: 5, from: 2020, to: 9999, cost: 10000, hype: 24, sales: 1.14, minFans: 8000 },
]

// Periféricos históricos: aparecem como promessa extra quando a plataforma combina.
export const ACCESSORIES = [
  { id: 'zapper', label: 'Pistola de luz', icon: 'crosshair', from: 1985, to: 1994, platforms: ['nes', 'master'], genres: ['acao', 'tiro'], mods: { costMult: 1.12, weeks: 1, sales: 1.18, score: 2, fun: 1.08 } },
  { id: 'rumble', label: 'Controle que treme', icon: 'bolt', from: 1997, to: 2005, platforms: ['n64', 'playstation', 'ps2'], genres: ['acao', 'corrida', 'tiro'], mods: { costMult: 1.08, sales: 1.1, score: 1 } },
  { id: 'tapete', label: 'Tapete de dança', icon: 'note', from: 1999, to: 2012, platforms: ['playstation', 'ps2', 'xbox', 'gamecube', 'wii'], genres: ['ritmo', 'party'], mods: { costMult: 1.16, weeks: 2, sales: 1.22, score: 2, sound: 1.1 } },
  { id: 'eyetoy', label: 'Câmera EyeToy', icon: 'eye', from: 2003, to: 2008, platforms: ['ps2'], genres: ['party', 'esporte'], mods: { costMult: 1.14, weeks: 2, sales: 1.16, idea: 1.15 } },
  { id: 'guitarra', label: 'Controle-guitarra', icon: 'music', from: 2005, to: 2015, platforms: ['ps2', 'xbox360', 'ps3', 'wii'], genres: ['ritmo'], mods: { costMult: 1.22, weeks: 2, sales: 1.35, score: 3, sound: 1.15 } },
  { id: 'wiimote', label: 'Controle de movimento', icon: 'spark', from: 2006, to: 9999, platforms: ['wii', 'wiiu', 'switch', 'switch2'], genres: ['party', 'esporte', 'ritmo', 'cozy'], mods: { costMult: 1.1, weeks: 1, sales: 1.2, score: 2, idea: 1.1 } },
  { id: 'kinect', label: 'Kinect', icon: 'users', from: 2010, to: 2017, platforms: ['xbox360', 'xboxone'], genres: ['party', 'esporte', 'ritmo'], mods: { costMult: 1.18, weeks: 2, sales: 1.18, score: 1 } },
  { id: 'move', label: 'PlayStation Move', icon: 'wand', from: 2010, to: 2016, platforms: ['ps3', 'ps4'], genres: ['party', 'esporte', 'tiro'], mods: { costMult: 1.14, weeks: 1, sales: 1.12, score: 1 } },
  { id: 'labo', label: 'Kit de papelão', icon: 'cube', from: 2018, to: 2021, platforms: ['switch'], genres: ['puzzle', 'cozy', 'party'], mods: { costMult: 1.12, weeks: 1, sales: 1.1, idea: 1.2 } },
]

// Choques de mercado reais: mudam as vendas por tipo de plataforma ou gênero por um tempo.
export const SHOCKS = [
  { id: 'fliper-febre', start: [1980, 0], weeks: 144, title: 'Febre do fliperama', icon: 'arcade', mods: { arcade: 1.28, acao: 1.08 } },
  { id: 'crash-1983', start: [1982, 8], weeks: 112, title: 'Crise dos videogames', icon: 'storm', mods: { console: .58, pc: 1.08, arcade: 1.12 } },
  { id: 'nes-volta', start: [1985, 9], weeks: 120, title: 'O console volta a respirar', icon: 'gamepad', mods: { console: 1.2, plataforma: 1.14 } },
  { id: 'guerra-16', start: [1991, 5], weeks: 120, title: 'Guerra dos 16 bits', icon: 'fire', mods: { console: 1.15, plataforma: 1.12, luta: 1.15 } },
  { id: 'cd-rom', start: [1993, 8], weeks: 96, title: 'Febre do CD-ROM', icon: 'disc', mods: { pc: 1.15, aventura: 1.15, puzzle: 1.1 } },
  { id: 'lan-house', start: [1999, 0], weeks: 280, title: 'Era das lan houses', icon: 'users', mods: { pc: 1.15, tiro: 1.15, mmo: 1.2 } },
  { id: 'guitarra-boom', start: [2005, 10], weeks: 184, title: 'Controles de plástico', icon: 'music', mods: { ritmo: 1.3, party: 1.1 } },
  { id: 'movimento', start: [2006, 10], weeks: 208, title: 'A sala virou controle', icon: 'spark', mods: { party: 1.2, esporte: 1.14 } },
  { id: 'corrida-mobile', start: [2008, 6], weeks: 200, title: 'Corrida do ouro mobile', icon: 'phone', mods: { mobile: 1.34, puzzle: 1.12 } },
  { id: 'onda-indie', start: [2010, 0], weeks: 216, title: 'Onda indie digital', icon: 'heart', mods: { pc: 1.1, roguelike: 1.15, cozy: 1.15 } },
  { id: 'battle-boom', start: [2017, 2], weeks: 152, title: 'Cem entram, um sai', icon: 'parachute', mods: { battle: 1.25, tiro: 1.1 } },
  { id: 'todos-em-casa', start: [2020, 2], weeks: 88, title: 'Todo mundo em casa', icon: 'home', mods: { global: 1.16, cozy: 1.15, party: 1.1 } },
  { id: 'ia-enxurrada', start: [2025, 0], weeks: 160, title: 'Enxurrada de jogos com IA', icon: 'robot', mods: { global: .92 } },
]
