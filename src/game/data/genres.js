// Pesos dizem o que cada gênero pede da equipe: diversão, visual, som e ideia.
// A soma é 1. O jogador aprende o formato pelo gráfico da ficha, não por texto.
export const GENRES = [
  { id: 'acao', label: 'Ação', icon: 'fist', year: 1980, w: { fun: .44, art: .3, sound: .14, idea: .12 } },
  { id: 'plataforma', label: 'Plataforma', icon: 'mushroom', year: 1981, w: { fun: .46, art: .28, sound: .16, idea: .1 } },
  { id: 'aventura', label: 'Aventura', icon: 'compass', year: 1980, w: { fun: .22, art: .3, sound: .16, idea: .32 } },
  { id: 'rpg', label: 'RPG', icon: 'sword', year: 1980, w: { fun: .28, art: .2, sound: .17, idea: .35 } },
  { id: 'estrategia', label: 'Estratégia', icon: 'chess', year: 1980, w: { fun: .42, art: .12, sound: .08, idea: .38 } },
  { id: 'simulacao', label: 'Simulação', icon: 'gear', year: 1983, w: { fun: .38, art: .18, sound: .08, idea: .36 } },
  { id: 'puzzle', label: 'Puzzle', icon: 'puzzle', year: 1980, w: { fun: .4, art: .14, sound: .14, idea: .32 } },
  { id: 'corrida', label: 'Corrida', icon: 'car', year: 1980, w: { fun: .4, art: .34, sound: .2, idea: .06 } },
  { id: 'esporte', label: 'Esporte', icon: 'ball', year: 1980, w: { fun: .46, art: .3, sound: .16, idea: .08 } },
  { id: 'luta', label: 'Luta', icon: 'fist', year: 1987, w: { fun: .5, art: .3, sound: .14, idea: .06 } },
  { id: 'terror', label: 'Terror', icon: 'ghost', year: 1989, w: { fun: .18, art: .3, sound: .36, idea: .16 } },
  { id: 'tiro', label: 'Tiro', icon: 'crosshair', year: 1992, w: { fun: .48, art: .3, sound: .16, idea: .06 } },
  { id: 'ritmo', label: 'Ritmo', icon: 'headphones', year: 1996, w: { fun: .3, art: .16, sound: .46, idea: .08 } },
  { id: 'mmo', label: 'MMO', icon: 'globe', year: 1997, tech: 'online', w: { fun: .34, art: .22, sound: .1, idea: .34 } },
  { id: 'party', label: 'Party', icon: 'confetti', year: 1998, w: { fun: .5, art: .22, sound: .16, idea: .12 } },
  { id: 'sandbox', label: 'Sandbox', icon: 'cube', year: 2009, w: { fun: .34, art: .12, sound: .1, idea: .44 } },
  { id: 'moba', label: 'MOBA', icon: 'shield', year: 2009, tech: 'online', w: { fun: .5, art: .2, sound: .1, idea: .2 } },
  { id: 'roguelike', label: 'Roguelike', icon: 'dice', year: 2010, w: { fun: .44, art: .14, sound: .12, idea: .3 } },
  { id: 'cozy', label: 'Cozy', icon: 'plant', year: 2016, w: { fun: .28, art: .34, sound: .2, idea: .18 } },
  { id: 'battle', label: 'Battle Royale', icon: 'parachute', year: 2017, tech: 'online', w: { fun: .5, art: .24, sound: .12, idea: .14 } },
]

export const genreById = id => GENRES.find(item => item.id === id)

export const THEMES = [
  { id: 'fantasia', label: 'Fantasia', icon: 'wand', year: 1980 },
  { id: 'espaco', label: 'Espaço', icon: 'planet', year: 1980 },
  { id: 'medieval', label: 'Medieval', icon: 'castle', year: 1980 },
  { id: 'futebol', label: 'Futebol', icon: 'ball', year: 1980 },
  { id: 'animais', label: 'Bichos', icon: 'paw', year: 1980 },
  { id: 'piratas', label: 'Piratas', icon: 'ship', year: 1980 },
  { id: 'ninja', label: 'Ninja', icon: 'shuriken', year: 1980 },
  { id: 'militar', label: 'Militar', icon: 'helmet', year: 1980 },
  { id: 'crime', label: 'Crime', icon: 'fingerprint', year: 1980 },
  { id: 'velhooeste', label: 'Faroeste', icon: 'cowboy', year: 1980 },
  { id: 'escola', label: 'Escola', icon: 'pencil', year: 1980 },
  { id: 'robos', label: 'Robôs', icon: 'robot', year: 1980 },
  { id: 'dinossauros', label: 'Dinos', icon: 'dino', year: 1980 },
  { id: 'culinaria', label: 'Comida', icon: 'chefhat', year: 1980 },
  { id: 'musica', label: 'Música', icon: 'note', year: 1980 },
  { id: 'fazenda', label: 'Fazenda', icon: 'wheat', year: 1980 },
  { id: 'herois', label: 'Heróis', icon: 'cape', year: 1980 },
  { id: 'romance', label: 'Romance', icon: 'heart', year: 1980 },
  { id: 'folclore', label: 'Folclore BR', icon: 'tornado', year: 1980 },
  { id: 'carnaval', label: 'Carnaval', icon: 'mask', year: 1980 },
  { id: 'mitologia', label: 'Mitologia', icon: 'trident', year: 1980 },
  { id: 'novela', label: 'Novela', icon: 'tv', year: 1980 },
  { id: 'zumbi', label: 'Zumbis', icon: 'skull', year: 1985 },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: 'chip', year: 1986 },
  { id: 'internet', label: 'Internet', icon: 'wifi', year: 1996 },
]

export const themeById = id => THEMES.find(item => item.id === id)

// Combinação: 3 perfeito, 2 bom, 1 neutro (padrão), 0 estranho.
// Escrito por tema para ficar fácil de revisar; o resto do quadro é neutro.
const COMBO_TABLE = {
  fantasia: { 3: ['rpg', 'aventura', 'mmo'], 2: ['estrategia', 'acao', 'roguelike', 'moba', 'plataforma'], 0: ['esporte', 'corrida', 'ritmo'] },
  espaco: { 3: ['tiro', 'estrategia', 'simulacao'], 2: ['acao', 'rpg', 'sandbox', 'roguelike', 'mmo'], 0: ['esporte', 'cozy', 'luta'] },
  medieval: { 3: ['estrategia', 'rpg'], 2: ['acao', 'simulacao', 'mmo', 'luta'], 0: ['corrida', 'ritmo', 'tiro'] },
  futebol: { 3: ['esporte'], 2: ['simulacao', 'party', 'estrategia'], 0: ['terror', 'rpg', 'aventura', 'roguelike'] },
  animais: { 3: ['cozy', 'plataforma', 'party'], 2: ['simulacao', 'aventura', 'corrida', 'puzzle'], 0: ['tiro', 'terror', 'luta'] },
  piratas: { 3: ['aventura', 'acao'], 2: ['estrategia', 'rpg', 'sandbox', 'mmo'], 0: ['ritmo', 'esporte', 'cozy'] },
  ninja: { 3: ['acao', 'luta', 'plataforma'], 2: ['aventura', 'rpg', 'roguelike'], 0: ['simulacao', 'cozy', 'esporte'] },
  militar: { 3: ['tiro', 'estrategia'], 2: ['simulacao', 'acao', 'battle'], 0: ['party', 'cozy', 'ritmo'] },
  crime: { 3: ['acao', 'aventura'], 2: ['estrategia', 'tiro', 'corrida', 'puzzle'], 0: ['party', 'cozy', 'esporte'] },
  velhooeste: { 3: ['acao', 'tiro'], 2: ['aventura', 'rpg', 'estrategia'], 0: ['ritmo', 'party', 'puzzle'] },
  escola: { 3: ['simulacao', 'aventura', 'party'], 2: ['puzzle', 'rpg', 'cozy', 'ritmo'], 0: ['tiro', 'battle', 'estrategia'] },
  robos: { 3: ['luta', 'estrategia', 'acao'], 2: ['tiro', 'sandbox', 'puzzle', 'simulacao'], 0: ['cozy'] },
  dinossauros: { 3: ['aventura', 'simulacao'], 2: ['acao', 'tiro', 'sandbox', 'party'], 0: ['ritmo', 'puzzle', 'luta'] },
  culinaria: { 3: ['simulacao', 'party', 'cozy'], 2: ['puzzle', 'ritmo'], 0: ['tiro', 'terror', 'estrategia', 'battle'] },
  musica: { 3: ['ritmo'], 2: ['party', 'simulacao', 'aventura'], 0: ['estrategia', 'tiro', 'terror', 'corrida'] },
  fazenda: { 3: ['simulacao', 'cozy'], 2: ['estrategia', 'sandbox', 'puzzle'], 0: ['luta', 'tiro', 'terror', 'corrida'] },
  herois: { 3: ['acao', 'luta'], 2: ['aventura', 'rpg', 'moba', 'plataforma'], 0: ['simulacao', 'puzzle', 'cozy'] },
  romance: { 3: ['aventura', 'simulacao'], 2: ['rpg', 'cozy', 'puzzle', 'ritmo'], 0: ['tiro', 'battle', 'estrategia', 'luta'] },
  folclore: { 3: ['aventura', 'terror', 'plataforma'], 2: ['rpg', 'acao', 'roguelike'], 0: ['esporte', 'corrida', 'simulacao'] },
  carnaval: { 3: ['ritmo', 'party'], 2: ['simulacao', 'corrida'], 0: ['terror', 'estrategia', 'tiro'] },
  mitologia: { 3: ['acao', 'rpg', 'estrategia'], 2: ['aventura', 'moba', 'luta', 'roguelike'], 0: ['esporte', 'cozy', 'corrida'] },
  novela: { 3: ['aventura', 'simulacao'], 2: ['party', 'puzzle', 'cozy'], 0: ['tiro', 'estrategia', 'battle', 'corrida'] },
  zumbi: { 3: ['terror', 'tiro', 'acao'], 2: ['estrategia', 'sandbox', 'battle', 'roguelike'], 0: ['esporte', 'cozy', 'ritmo'] },
  cyberpunk: { 3: ['rpg', 'acao', 'tiro'], 2: ['aventura', 'corrida', 'estrategia', 'roguelike'], 0: ['cozy', 'esporte', 'party'] },
  internet: { 3: ['simulacao', 'party', 'puzzle'], 2: ['sandbox', 'moba', 'battle', 'mmo'], 0: ['estrategia', 'esporte'] },
}

export function comboRating(genreId, themeId) {
  const row = COMBO_TABLE[themeId]
  if (!row) return 1
  for (const level of [3, 2, 0]) if (row[level]?.includes(genreId)) return level
  return 1
}

export const COMBO_LABEL = { 3: 'Combo perfeito', 2: 'Combina', 1: 'Neutro', 0: 'Estranho' }

export const unlockedGenres = (year, techs = []) => GENRES.filter(genre => genre.year <= year && (!genre.tech || techs.includes(genre.tech)))
export const unlockedThemes = year => THEMES.filter(theme => theme.year <= year)
