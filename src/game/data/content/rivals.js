// Empresas reais que disputam as paradas com você. tier 4 = gigante.
// tiers: [[ano, porte]] muda o tamanho da empresa com o tempo. closedYear = fechou ou foi absorvida.

export const RIVALS = [
  // Pioneiras
  { id: 'atari', name: 'Atari', tier: 4, tiers: [[1980, 4], [1984, 2]], foundedYear: 1980, closedYear: 1996, color: '#d35400', genres: ['acao', 'corrida', 'esporte'] },
  { id: 'activision', name: 'Activision', tier: 2, tiers: [[1980, 2], [1998, 3], [2005, 4]], foundedYear: 1980, color: '#1f1f1f', genres: ['acao', 'tiro', 'aventura', 'ritmo'] },
  { id: 'namco', name: 'Namco', tier: 3, foundedYear: 1980, closedYear: 2006, color: '#f1c40f', genres: ['acao', 'luta', 'corrida', 'puzzle'] },
  { id: 'taito', name: 'Taito', tier: 2, foundedYear: 1980, closedYear: 2005, color: '#2980b9', genres: ['acao', 'puzzle', 'plataforma'] },
  { id: 'sierra', name: 'Sierra On-Line', tier: 2, foundedYear: 1980, closedYear: 2008, color: '#16a085', genres: ['aventura', 'estrategia', 'simulacao'] },
  { id: 'broderbund', name: 'Brøderbund', tier: 2, foundedYear: 1980, closedYear: 1999, color: '#8e44ad', genres: ['puzzle', 'aventura', 'simulacao'] },
  { id: 'epyx', name: 'Epyx', tier: 2, foundedYear: 1980, closedYear: 1993, color: '#c0392b', genres: ['esporte', 'acao', 'aventura'] },
  { id: 'hudson', name: 'Hudson Soft', tier: 2, foundedYear: 1980, closedYear: 2012, color: '#e74c3c', genres: ['party', 'plataforma', 'puzzle'] },
  { id: 'snk', name: 'SNK', tier: 2, foundedYear: 1980, color: '#2c3e50', genres: ['luta', 'acao', 'esporte'] },
  { id: 'enix', name: 'Enix', tier: 2, foundedYear: 1982, closedYear: 2003, color: '#1e3799', genres: ['rpg', 'aventura'] },
  // As grandes japonesas
  { id: 'nintendo', name: 'Nintendo', tier: 3, tiers: [[1980, 3], [1985, 4]], foundedYear: 1980, color: '#e4002b', genres: ['plataforma', 'aventura', 'party', 'corrida', 'rpg'] },
  { id: 'sega', name: 'Sega', tier: 3, tiers: [[1980, 3], [1989, 4], [2002, 3]], foundedYear: 1980, color: '#1e5bc6', genres: ['acao', 'corrida', 'esporte', 'plataforma'] },
  { id: 'konami', name: 'Konami', tier: 3, foundedYear: 1980, color: '#c8102e', genres: ['acao', 'esporte', 'terror', 'ritmo'] },
  { id: 'capcom', name: 'Capcom', tier: 3, foundedYear: 1980, color: '#0057b8', genres: ['luta', 'acao', 'terror'] },
  { id: 'square', name: 'Squaresoft', tier: 2, tiers: [[1986, 2], [1994, 3]], foundedYear: 1986, closedYear: 2003, color: '#6c3483', genres: ['rpg', 'aventura'] },
  { id: 'squareenix', name: 'Square Enix', tier: 3, foundedYear: 2003, color: '#7d3c98', genres: ['rpg', 'aventura', 'mmo'] },
  { id: 'fromsoftware', name: 'FromSoftware', tier: 2, tiers: [[1986, 2], [2011, 3]], foundedYear: 1986, color: '#4a4a4a', genres: ['rpg', 'acao'] },
  { id: 'bandainamco', name: 'Bandai Namco', tier: 3, foundedYear: 2006, color: '#f39c12', genres: ['luta', 'acao', 'rpg'] },
  { id: 'gamefreak', name: 'Game Freak', tier: 2, tiers: [[1989, 2], [1996, 3]], foundedYear: 1989, color: '#e67e22', genres: ['rpg', 'puzzle'] },
  // Ocidente
  { id: 'ea', name: 'Electronic Arts', tier: 2, tiers: [[1982, 2], [1992, 3], [1997, 4]], foundedYear: 1982, color: '#ff4747', genres: ['esporte', 'tiro', 'simulacao', 'corrida'] },
  { id: 'rare', name: 'Rare', tier: 2, tiers: [[1985, 2], [1994, 3]], foundedYear: 1985, color: '#27ae60', genres: ['plataforma', 'tiro', 'aventura'] },
  { id: 'westwood', name: 'Westwood Studios', tier: 2, foundedYear: 1985, closedYear: 2003, color: '#b7950b', genres: ['estrategia', 'aventura'] },
  { id: 'ubisoft', name: 'Ubisoft', tier: 2, tiers: [[1986, 2], [2000, 3], [2008, 4]], foundedYear: 1986, color: '#2e86de', genres: ['aventura', 'acao', 'sandbox', 'tiro'] },
  { id: 'bethesda', name: 'Bethesda', tier: 2, tiers: [[1986, 2], [2006, 3]], foundedYear: 1986, color: '#7f8c8d', genres: ['rpg', 'tiro'] },
  { id: 'maxis', name: 'Maxis', tier: 2, foundedYear: 1987, color: '#3498db', genres: ['simulacao', 'cozy'] },
  { id: 'naughtydog', name: 'Naughty Dog', tier: 2, tiers: [[1985, 2], [1996, 3]], foundedYear: 1985, color: '#922b21', genres: ['aventura', 'plataforma', 'acao'] },
  { id: 'eidos', name: 'Eidos', tier: 3, foundedYear: 1990, closedYear: 2009, color: '#5d6d7e', genres: ['aventura', 'acao', 'rpg'] },
  { id: 'midway', name: 'Midway', tier: 3, foundedYear: 1988, closedYear: 2010, color: '#b03a2e', genres: ['luta', 'esporte', 'acao'] },
  { id: 'id', name: 'id Software', tier: 2, tiers: [[1991, 2], [1993, 3]], foundedYear: 1991, color: '#7b241c', genres: ['tiro', 'acao'] },
  { id: 'blizzard', name: 'Blizzard', tier: 2, tiers: [[1991, 2], [1998, 3], [2004, 4]], foundedYear: 1991, color: '#00aeff', genres: ['estrategia', 'rpg', 'mmo', 'tiro'] },
  { id: 'epic', name: 'Epic Games', tier: 2, tiers: [[1991, 2], [2006, 3], [2017, 4]], foundedYear: 1991, color: '#2c3e50', genres: ['tiro', 'battle', 'acao'] },
  { id: 'bungie', name: 'Bungie', tier: 2, tiers: [[1991, 2], [2001, 3]], foundedYear: 1991, color: '#566573', genres: ['tiro'] },
  { id: 'sony', name: 'Sony Interactive', tier: 3, tiers: [[1994, 3], [2000, 4]], foundedYear: 1994, color: '#003791', genres: ['acao', 'corrida', 'aventura', 'plataforma'] },
  { id: 'microsoft', name: 'Microsoft Game Studios', tier: 3, foundedYear: 1995, color: '#107c10', genres: ['tiro', 'estrategia', 'corrida', 'simulacao'] },
  { id: 'bioware', name: 'BioWare', tier: 2, tiers: [[1995, 2], [2003, 3]], foundedYear: 1995, color: '#a93226', genres: ['rpg'] },
  { id: 'valve', name: 'Valve', tier: 3, foundedYear: 1996, color: '#f39c12', genres: ['tiro', 'puzzle', 'moba'] },
  { id: 'larian', name: 'Larian Studios', tier: 1, tiers: [[1996, 1], [2017, 2], [2023, 3]], foundedYear: 1996, color: '#a04000', genres: ['rpg', 'estrategia'] },
  { id: 'rockstar', name: 'Rockstar Games', tier: 3, tiers: [[1998, 3], [2001, 4]], foundedYear: 1998, color: '#f1c40f', genres: ['acao', 'sandbox', 'corrida'] },
  { id: 'popcap', name: 'PopCap', tier: 2, foundedYear: 2000, closedYear: 2018, color: '#82e0aa', genres: ['puzzle', 'estrategia'] },
  { id: '2k', name: '2K', tier: 3, foundedYear: 2005, color: '#cb4335', genres: ['esporte', 'tiro', 'estrategia'] },
  { id: 'cdpr', name: 'CD Projekt Red', tier: 2, tiers: [[2002, 2], [2015, 3]], foundedYear: 2002, color: '#c0392b', genres: ['rpg'] },
  { id: 'king', name: 'King', tier: 2, tiers: [[2003, 2], [2012, 3]], foundedYear: 2003, color: '#e67e22', genres: ['puzzle'] },
  { id: 'krafton', name: 'Krafton', tier: 2, tiers: [[2007, 2], [2017, 3]], foundedYear: 2007, color: '#1a1a1a', genres: ['battle', 'mmo'] },
  { id: 'riot', name: 'Riot Games', tier: 3, foundedYear: 2006, color: '#d0021b', genres: ['moba', 'tiro', 'estrategia'] },
  { id: 'mojang', name: 'Mojang', tier: 1, tiers: [[2009, 1], [2011, 3]], foundedYear: 2009, color: '#5b8731', genres: ['sandbox'] },
  { id: 'rovio', name: 'Rovio', tier: 2, foundedYear: 2009, color: '#e74c3c', genres: ['puzzle'] },
  { id: 'garena', name: 'Garena', tier: 3, foundedYear: 2009, color: '#e65100', genres: ['battle', 'moba'] },
  { id: 'supercell', name: 'Supercell', tier: 3, foundedYear: 2010, color: '#2471a3', genres: ['estrategia', 'puzzle'] },
  { id: 'niantic', name: 'Niantic', tier: 2, foundedYear: 2010, color: '#45b39d', genres: ['aventura'] },
  { id: 'hoyoverse', name: 'HoYoverse', tier: 3, foundedYear: 2012, color: '#5dade2', genres: ['rpg', 'acao'] },
  { id: 'gamescience', name: 'Game Science', tier: 2, foundedYear: 2014, color: '#b9770e', genres: ['acao'] },
  // Indies que parecem você
  { id: 'relogic', name: 'Re-Logic', tier: 1, foundedYear: 2011, color: '#58d68d', genres: ['sandbox', 'plataforma'] },
  { id: 'concernedape', name: 'ConcernedApe', tier: 1, foundedYear: 2012, color: '#f5b041', genres: ['cozy'] },
  { id: 'supergiant', name: 'Supergiant Games', tier: 1, foundedYear: 2009, color: '#cb4335', genres: ['roguelike', 'rpg'] },
  { id: 'teamcherry', name: 'Team Cherry', tier: 1, foundedYear: 2014, color: '#5d6d7e', genres: ['plataforma'] },
  { id: 'innersloth', name: 'Innersloth', tier: 1, foundedYear: 2015, color: '#e74c3c', genres: ['party'] },
  { id: 'pocketpair', name: 'Pocketpair', tier: 1, foundedYear: 2015, color: '#48c9b0', genres: ['sandbox'] },
  { id: 'localthunk', name: 'LocalThunk', tier: 1, foundedYear: 2021, color: '#c0392b', genres: ['roguelike'] },
  { id: 'sandfall', name: 'Sandfall Interactive', tier: 1, foundedYear: 2020, color: '#6c3483', genres: ['rpg'] },
  // Brasil
  { id: 'tectoy', name: 'Tectoy', tier: 2, foundedYear: 1987, color: '#27ae60', genres: ['plataforma', 'esporte', 'party'] },
  { id: 'hoplon', name: 'Hoplon', tier: 1, foundedYear: 2000, color: '#1abc9c', genres: ['mmo'] },
  { id: 'aquiris', name: 'Aquiris', tier: 1, foundedYear: 2007, color: '#f4d03f', genres: ['corrida'] },
  { id: 'behold', name: 'Behold Studios', tier: 1, foundedYear: 2009, color: '#f39c12', genres: ['estrategia', 'rpg'] },
  { id: 'longhat', name: 'Long Hat House', tier: 1, foundedYear: 2016, color: '#7fb3d5', genres: ['plataforma'] },
  { id: 'dumativa', name: 'Dumativa', tier: 1, foundedYear: 2016, color: '#922b21', genres: ['terror', 'aventura'] },
]

export const rivalTierAt = (rival, year) => {
  if (!rival?.tiers) return rival?.tier ?? 2
  let tier = rival.tiers[0][1]
  for (const [from, value] of rival.tiers) if (year >= from) tier = value
  return tier
}

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
]
