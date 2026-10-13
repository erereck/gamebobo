// Estúdios rivais (paródias). tier 4 = gigante.

export const RIVALS = [
  { id: 'ninten', name: 'Ninten', tier: 4, foundedYear: 1980, color: '#e4002b', genres: ['plataforma', 'party', 'aventura', 'corrida'], cities: 'Quioto' },
  { id: 'segah', name: 'Segah', tier: 3, foundedYear: 1980, color: '#1e5bc6', genres: ['acao', 'corrida', 'esporte', 'plataforma'], cities: 'Tóquio' },
  { id: 'konamy', name: 'Konamy', tier: 3, foundedYear: 1980, color: '#c8102e', genres: ['acao', 'tiro', 'terror', 'esporte'], cities: 'Osaka' },
  { id: 'capcon', name: 'Capcon', tier: 3, foundedYear: 1980, color: '#0057b8', genres: ['luta', 'acao', 'terror'], cities: 'Osaka' },
  { id: 'atarizinho', name: 'Atarizinho', tier: 2, foundedYear: 1980, closedYear: 1985, color: '#d35400', genres: ['acao', 'tiro', 'esporte'], cities: 'Vale do Silício' },
  { id: 'eletronica-artes', name: 'Eletrônica Artes', tier: 4, foundedYear: 1982, color: '#ff4747', genres: ['esporte', 'tiro', 'simulacao', 'corrida'], cities: 'Califórnia' },
  { id: 'quadrado-enix', name: 'Quadrado Enix', tier: 3, foundedYear: 1986, color: '#6c3483', genres: ['rpg', 'aventura', 'mmo'], cities: 'Tóquio' },
  { id: 'ubisonso', name: 'Ubisonso', tier: 3, foundedYear: 1986, color: '#2e86de', genres: ['aventura', 'acao', 'sandbox', 'tiro'], cities: 'Paris' },
  { id: 'tecbrinq', name: 'TecBrinq', tier: 2, foundedYear: 1987, closedYear: 2012, color: '#27ae60', genres: ['plataforma', 'esporte', 'party'], cities: 'São Paulo' },
  { id: 'blizardo', name: 'Blizardo', tier: 3, foundedYear: 1991, color: '#00aeff', genres: ['estrategia', 'rpg', 'mmo', 'tiro'], cities: 'Irvine' },
  { id: 'valvula', name: 'Valvula', tier: 3, foundedYear: 1996, color: '#f39c12', genres: ['tiro', 'puzzle', 'moba'], cities: 'Seattle' },
  { id: 'rockstrela', name: 'Rockstrela', tier: 4, foundedYear: 1998, color: '#f1c40f', genres: ['acao', 'sandbox', 'corrida'], cities: 'Edimburgo' },
  { id: 'rebulico-games', name: 'Rebuliço Games', tier: 3, foundedYear: 2008, color: '#d4ac0d', genres: ['moba', 'tiro', 'estrategia'], cities: 'Los Angeles' },
  { id: 'epoca-games', name: 'Época Games', tier: 4, foundedYear: 2008, color: '#2c3e50', genres: ['battle', 'tiro', 'sandbox'], cities: 'Carolina do Norte' },
  { id: 'coletivo-pixelzinho', name: 'Coletivo Pixelzinho', tier: 1, foundedYear: 2015, color: '#ff7eb6', genres: ['roguelike', 'cozy', 'puzzle', 'plataforma'], cities: 'Recife' },
  { id: 'gera-jogo-ia', name: 'GeraJogo IA', tier: 2, foundedYear: 2025, color: '#8e44ad', genres: ['party', 'simulacao', 'cozy'], cities: 'Nuvem' },
];

// Padrões extras para títulos de jogos rivais (mesmos tokens de titles.js).
export const RIVAL_TITLE_PATTERNS = [
  '{noun} {num}',
  'Super {noun} {num}',
  '{hero} Party {num}',
  '{noun}: {sub}',
  '{noun} {adj}: Edição Anual',
  '{hero} {num}',
  'Mega {noun} Online',
  '{noun} Saga {num}',
];
