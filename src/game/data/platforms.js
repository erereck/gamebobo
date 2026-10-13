// Plataformas reais com a data do primeiro lançamento regional (mês 0-11).
// pop = tamanho relativo no auge. fee = kit de desenvolvimento em unidades de 1980.
// fit: +1 o público da plataforma ama o gênero, -1 torce o nariz.
export const PLATFORMS = [
  { id: 'pc', label: 'PC', maker: 'IBM PC e compatíveis', type: 'pc', year: 1980, month: 0, end: 9999, fee: 0, color: '#8a8f98',
    curve: [[1980, .45], [1990, .8], [2000, 1.25], [2010, 1.5], [2020, 1.8], [2040, 2]],
    fit: { estrategia: 1, simulacao: 1, mmo: 1, tiro: 1, sandbox: 1, moba: 1, roguelike: 1, luta: -1, party: -1, ritmo: -1 } },
  { id: 'atari2600', label: 'Atari 2600', maker: 'Atari', type: 'console', year: 1980, month: 0, end: 1990, pop: 1.6, fee: 1200, color: '#b8643c',
    fit: { acao: 1, corrida: 1, esporte: 1, rpg: -1, aventura: -1, estrategia: -1 } },
  { id: 'intellivision', label: 'Intellivision', maker: 'Mattel', type: 'console', year: 1980, month: 0, end: 1990, pop: .6, fee: 1100, color: '#8d6e4a',
    fit: { esporte: 1, estrategia: 1, plataforma: -1 } },
  { id: 'colecovision', label: 'ColecoVision', maker: 'Coleco', type: 'console', year: 1982, month: 7, end: 1985, pop: .6, fee: 1400, color: '#2f3640',
    fit: { acao: 1, plataforma: 1, rpg: -1 } },
  { id: 'c64', label: 'Commodore 64', maker: 'Commodore', type: 'pc', year: 1982, month: 7, end: 1994, pop: 1, fee: 600, color: '#7d6fb3',
    fit: { aventura: 1, rpg: 1, estrategia: 1, esporte: -1 } },
  { id: 'msx', label: 'MSX', maker: 'Microsoft / ASCII', type: 'pc', year: 1983, month: 9, end: 1995, pop: .7, fee: 700, color: '#5d6d7e',
    fit: { acao: 1, rpg: 1, puzzle: 1, corrida: -1 } },
  { id: 'nes', label: 'NES', maker: 'Nintendo', type: 'console', year: 1983, month: 6, end: 1995, pop: 2.4, fee: 4000, color: '#c33b32',
    fit: { plataforma: 1, rpg: 1, acao: 1, esporte: 1, estrategia: -1, simulacao: -1 } },
  { id: 'master', label: 'Master System', maker: 'Sega', type: 'console', year: 1985, month: 9, end: 1998, pop: 1.2, fee: 3000, color: '#2d5fb8',
    fit: { acao: 1, plataforma: 1, esporte: 1, rpg: -1 } },
  { id: 'atari7800', label: 'Atari 7800', maker: 'Atari', type: 'console', year: 1986, month: 4, end: 1992, pop: .5, fee: 2000, color: '#a0522d',
    fit: { acao: 1, esporte: 1, rpg: -1 } },
  { id: 'pcengine', label: 'PC Engine', maker: 'NEC / Hudson', type: 'console', year: 1987, month: 9, end: 1994, pop: .9, fee: 3500, color: '#ecf0f1',
    fit: { acao: 1, tiro: 1, plataforma: 1, esporte: -1 } },
  { id: 'megadrive', label: 'Mega Drive', maker: 'Sega', type: 'console', year: 1988, month: 9, end: 1998, pop: 2.1, fee: 6000, color: '#1f2a44',
    fit: { acao: 1, esporte: 1, corrida: 1, luta: 1, plataforma: 1, puzzle: -1, simulacao: -1 } },
  { id: 'gameboy', label: 'Game Boy', maker: 'Nintendo', type: 'portatil', year: 1989, month: 3, end: 2003, pop: 3, fee: 3500, color: '#9aa564',
    fit: { puzzle: 1, rpg: 1, plataforma: 1, tiro: -1, corrida: -1 } },
  { id: 'neogeo', label: 'Neo Geo', maker: 'SNK', type: 'console', year: 1990, month: 3, end: 2004, pop: .3, fee: 9000, color: '#1c1c1c',
    fit: { luta: 1, acao: 1, esporte: 1, rpg: -1, puzzle: -1 } },
  { id: 'gamegear', label: 'Game Gear', maker: 'Sega', type: 'portatil', year: 1990, month: 9, end: 1997, pop: .9, fee: 3000, color: '#2b2b2b',
    fit: { acao: 1, plataforma: 1, puzzle: 1, estrategia: -1 } },
  { id: 'snes', label: 'Super Nintendo', maker: 'Nintendo', type: 'console', year: 1990, month: 10, end: 1999, pop: 2.6, fee: 8000, color: '#6d5fa8',
    fit: { rpg: 1, plataforma: 1, luta: 1, corrida: 1, tiro: -1 } },
  { id: '3do', label: '3DO', maker: 'The 3DO Company', type: 'console', year: 1993, month: 9, end: 1996, pop: .35, fee: 12000, color: '#34495e',
    fit: { corrida: 1, aventura: 1, plataforma: -1 } },
  { id: 'jaguar', label: 'Atari Jaguar', maker: 'Atari', type: 'console', year: 1993, month: 10, end: 1996, pop: .2, fee: 10000, color: '#c0392b',
    fit: { tiro: 1, acao: 1, rpg: -1 } },
  { id: 'saturn', label: 'Sega Saturn', maker: 'Sega', type: 'console', year: 1994, month: 10, end: 2000, pop: .9, fee: 13000, color: '#4b4b4b',
    fit: { luta: 1, corrida: 1, rpg: 1, plataforma: -1 } },
  { id: 'playstation', label: 'PlayStation', maker: 'Sony', type: 'console', year: 1994, month: 11, end: 2006, pop: 3.4, fee: 14000, color: '#9ea4ad',
    fit: { rpg: 1, corrida: 1, terror: 1, luta: 1, ritmo: 1, estrategia: -1 } },
  { id: 'n64', label: 'Nintendo 64', maker: 'Nintendo', type: 'console', year: 1996, month: 5, end: 2002, pop: 1.9, fee: 16000, color: '#3a7d44',
    fit: { plataforma: 1, party: 1, tiro: 1, corrida: 1, rpg: -1, terror: -1 } },
  { id: 'gbc', label: 'Game Boy Color', maker: 'Nintendo', type: 'portatil', year: 1998, month: 9, end: 2003, pop: 1.5, fee: 5000, color: '#8e44ad',
    fit: { rpg: 1, puzzle: 1, plataforma: 1, tiro: -1 } },
  { id: 'dreamcast', label: 'Dreamcast', maker: 'Sega', type: 'console', year: 1998, month: 10, end: 2001, pop: .9, fee: 15000, color: '#e98a2f',
    fit: { luta: 1, esporte: 1, corrida: 1, ritmo: 1 } },
  { id: 'ps2', label: 'PlayStation 2', maker: 'Sony', type: 'console', year: 2000, month: 2, end: 2013, pop: 4.2, fee: 24000, color: '#20263a',
    fit: { acao: 1, rpg: 1, esporte: 1, corrida: 1, terror: 1, ritmo: 1, moba: -1 } },
  { id: 'gba', label: 'Game Boy Advance', maker: 'Nintendo', type: 'portatil', year: 2001, month: 2, end: 2008, pop: 2.6, fee: 9000, color: '#5b4dbb',
    fit: { rpg: 1, plataforma: 1, puzzle: 1, tiro: -1 } },
  { id: 'gamecube', label: 'GameCube', maker: 'Nintendo', type: 'console', year: 2001, month: 8, end: 2007, pop: 1.3, fee: 20000, color: '#6a4fa0',
    fit: { party: 1, plataforma: 1, luta: 1, terror: -1 } },
  { id: 'xbox', label: 'Xbox', maker: 'Microsoft', type: 'console', year: 2001, month: 10, end: 2006, pop: 1.5, fee: 22000, color: '#3e8b2f',
    fit: { tiro: 1, corrida: 1, acao: 1, puzzle: -1, party: -1 } },
  { id: 'nds', label: 'Nintendo DS', maker: 'Nintendo', type: 'portatil', year: 2004, month: 10, end: 2013, pop: 3.6, fee: 12000, color: '#c8ccd2',
    fit: { puzzle: 1, simulacao: 1, party: 1, rpg: 1, tiro: -1 } },
  { id: 'psp', label: 'PSP', maker: 'Sony', type: 'portatil', year: 2004, month: 11, end: 2014, pop: 2.2, fee: 14000, color: '#30343c',
    fit: { rpg: 1, corrida: 1, luta: 1, simulacao: -1 } },
  { id: 'xbox360', label: 'Xbox 360', maker: 'Microsoft', type: 'console', year: 2005, month: 10, end: 2016, pop: 2.9, fee: 32000, color: '#7fbf3f',
    fit: { tiro: 1, acao: 1, corrida: 1, esporte: 1, cozy: -1 } },
  { id: 'ps3', label: 'PlayStation 3', maker: 'Sony', type: 'console', year: 2006, month: 10, end: 2017, pop: 2.8, fee: 38000, color: '#14161b',
    fit: { acao: 1, tiro: 1, rpg: 1, esporte: 1, party: -1 } },
  { id: 'wii', label: 'Wii', maker: 'Nintendo', type: 'console', year: 2006, month: 10, end: 2013, pop: 3.3, fee: 18000, color: '#e9edf1',
    fit: { party: 1, esporte: 1, ritmo: 1, cozy: 1, tiro: -1, terror: -1, estrategia: -1 } },
  { id: 'mobile', label: 'iPhone / Android', maker: 'Apple / Google', type: 'mobile', year: 2008, month: 6, end: 9999, fee: 800, color: '#3b82c4',
    curve: [[2008, .5], [2011, 2.2], [2015, 3.6], [2020, 4.2], [2040, 4.8]],
    fit: { puzzle: 1, cozy: 1, estrategia: 1, simulacao: 1, party: 1, tiro: -1, luta: -1, mmo: -1, terror: -1 } },
  { id: '3ds', label: 'Nintendo 3DS', maker: 'Nintendo', type: 'portatil', year: 2011, month: 1, end: 2020, pop: 2.2, fee: 16000, color: '#c0392b',
    fit: { rpg: 1, plataforma: 1, simulacao: 1, cozy: 1, tiro: -1 } },
  { id: 'vita', label: 'PlayStation Vita', maker: 'Sony', type: 'portatil', year: 2011, month: 11, end: 2019, pop: .9, fee: 18000, color: '#1b2631',
    fit: { rpg: 1, roguelike: 1, luta: 1, simulacao: -1 } },
  { id: 'wiiu', label: 'Wii U', maker: 'Nintendo', type: 'console', year: 2012, month: 10, end: 2017, pop: .9, fee: 26000, color: '#1abc9c',
    fit: { plataforma: 1, party: 1, corrida: 1, tiro: -1 } },
  { id: 'ps4', label: 'PlayStation 4', maker: 'Sony', type: 'console', year: 2013, month: 10, end: 2025, pop: 3.6, fee: 42000, color: '#1c2a52',
    fit: { acao: 1, rpg: 1, tiro: 1, esporte: 1, terror: 1, puzzle: -1 } },
  { id: 'xboxone', label: 'Xbox One', maker: 'Microsoft', type: 'console', year: 2013, month: 10, end: 2021, pop: 2, fee: 40000, color: '#2e7d32',
    fit: { tiro: 1, corrida: 1, battle: 1, cozy: -1 } },
  { id: 'vr', label: 'Oculus / Meta Quest', maker: 'Meta', type: 'vr', year: 2016, month: 2, end: 9999, fee: 20000, color: '#ff6b9a',
    curve: [[2016, .25], [2020, .5], [2030, 1.1], [2040, 1.6]],
    fit: { ritmo: 1, simulacao: 1, terror: 1, tiro: 1, estrategia: -1, rpg: -1, moba: -1 } },
  { id: 'switch', label: 'Nintendo Switch', maker: 'Nintendo', type: 'portatil', year: 2017, month: 2, end: 2032, pop: 4, fee: 30000, color: '#e4002b',
    fit: { party: 1, cozy: 1, plataforma: 1, roguelike: 1, tiro: -1 } },
  { id: 'stadia', label: 'Google Stadia', maker: 'Google', type: 'nuvem', year: 2019, month: 10, end: 2022, pop: .2, fee: 25000, color: '#fc4c02',
    fit: { tiro: 1, corrida: 1, rpg: -1 } },
  { id: 'ps5', label: 'PlayStation 5', maker: 'Sony', type: 'console', year: 2020, month: 10, end: 2033, pop: 3.2, fee: 60000, color: '#f2f3f5',
    fit: { acao: 1, rpg: 1, tiro: 1, terror: 1, cozy: -1 } },
  { id: 'xboxsx', label: 'Xbox Series X|S', maker: 'Microsoft', type: 'console', year: 2020, month: 10, end: 2031, pop: 1.6, fee: 56000, color: '#111111',
    fit: { tiro: 1, corrida: 1, battle: 1, estrategia: 1 } },
  { id: 'steamdeck', label: 'Steam Deck', maker: 'Valve', type: 'pc', year: 2022, month: 1, end: 9999, fee: 0, color: '#1a9fff',
    curve: [[2022, .3], [2026, .7], [2035, 1]],
    fit: { roguelike: 1, rpg: 1, cozy: 1, sandbox: 1, moba: -1 } },
  { id: 'switch2', label: 'Nintendo Switch 2', maker: 'Nintendo', type: 'portatil', year: 2025, month: 5, end: 2038, pop: 3.6, fee: 52000, color: '#d4002b',
    fit: { party: 1, cozy: 1, plataforma: 1, rpg: 1, tiro: -1 } },
  { id: 'nuvem', label: 'Streaming na nuvem', maker: 'Vários', type: 'nuvem', year: 2027, month: 3, end: 9999, fee: 35000, color: '#8ec5ff',
    curve: [[2027, .6], [2032, 2.2], [2040, 3.4]],
    fit: { mmo: 1, battle: 1, moba: 1, party: 1, ritmo: -1 } },
  { id: 'ps6', label: 'PlayStation 6', maker: 'Sony', type: 'console', year: 2028, month: 10, end: 2040, pop: 3.2, fee: 80000, color: '#c9ccd3',
    fit: { acao: 1, rpg: 1, tiro: 1, battle: 1 } },
  { id: 'neural', label: 'Interface neural', maker: 'Vários', type: 'vr', year: 2036, month: 0, end: 9999, fee: 120000, color: '#b14cff',
    curve: [[2036, .4], [2040, 1.6], [2050, 3]],
    fit: { simulacao: 1, terror: 1, cozy: 1, rpg: 1, esporte: -1 } },
]

export const platformById = id => PLATFORMS.find(item => item.id === id)

const lerpCurve = (curve, year) => {
  if (year <= curve[0][0]) return curve[0][1]
  for (let i = 1; i < curve.length; i += 1) {
    const [y1, v1] = curve[i]
    const [y0, v0] = curve[i - 1]
    if (year <= y1) return v0 + (v1 - v0) * (year - y0) / (y1 - y0)
  }
  return curve.at(-1)[1]
}

export const platformStart = platform => platform.year + platform.month / 12

// Tamanho do público da plataforma num instante (ano fracionário).
export function platformSize(platform, t) {
  const start = platformStart(platform)
  if (t < start) return 0
  if (platform.curve) return t > platform.end + .99 ? 0 : lerpCurve(platform.curve, t)
  const end = platform.end + .99
  if (t > end + 1) return 0
  const life = Math.max(3, end - start)
  const age = t - start
  const ramp = Math.min(2, life * .25)
  const fall = life * .35
  let f = 1
  if (age < ramp) f = .35 + .65 * (age / ramp)
  else if (age > life - fall) f = Math.max(.08, 1 - (age - (life - fall)) / (fall + 1) * .92)
  if (t > end) f *= .4
  return platform.pop * f
}

export function availablePlatforms(t) {
  return PLATFORMS.filter(platform => platformStart(platform) <= t && t <= platform.end + .99)
}

export const platformFit = (platform, genreId) => platform?.fit?.[genreId] ?? 0
