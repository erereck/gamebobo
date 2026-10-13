// Plataformas paródia com as datas de lançamento das originais (mês 0-11).
// pop = tamanho relativo no auge. fee = kit de desenvolvimento em unidades de 1980.
// fit: +1 o público da plataforma ama o gênero, -1 torce o nariz.
export const PLATFORMS = [
  { id: 'pc', label: 'PC', maker: 'Peças avulsas', type: 'pc', year: 1980, month: 0, end: 9999, fee: 0, color: '#8a8f98',
    curve: [[1980, .45], [1990, .8], [2000, 1.25], [2010, 1.5], [2020, 1.8], [2040, 2]],
    fit: { estrategia: 1, simulacao: 1, mmo: 1, tiro: 1, sandbox: 1, moba: 1, roguelike: 1, luta: -1, party: -1, ritmo: -1 } },
  { id: 'ataro', label: 'Ataro 2600', maker: 'Ataro', type: 'console', year: 1980, month: 0, end: 1990, pop: 1.1, fee: 1200, color: '#b8643c',
    fit: { acao: 1, corrida: 1, esporte: 1, rpg: -1, aventura: -1, estrategia: -1 } },
  { id: 'bit64', label: 'Comodoro 64', maker: 'Comodoro', type: 'pc', year: 1982, month: 7, end: 1994, pop: .9, fee: 600, color: '#7d6fb3',
    fit: { aventura: 1, rpg: 1, estrategia: 1, esporte: -1 } },
  { id: 'nintendinho', label: 'Nintendinho', maker: 'Ninten', type: 'console', year: 1985, month: 9, end: 1995, pop: 2.4, fee: 4000, color: '#c33b32',
    fit: { plataforma: 1, rpg: 1, acao: 1, esporte: 1, estrategia: -1, simulacao: -1 } },
  { id: 'master', label: 'Master Sistema', maker: 'Segah', type: 'console', year: 1986, month: 8, end: 1997, pop: 1.2, fee: 3000, color: '#2d5fb8',
    fit: { acao: 1, plataforma: 1, esporte: 1, rpg: -1 } },
  { id: 'megadraive', label: 'Mega Draive', maker: 'Segah', type: 'console', year: 1989, month: 7, end: 1998, pop: 2.1, fee: 6000, color: '#1f2a44',
    fit: { acao: 1, esporte: 1, corrida: 1, luta: 1, plataforma: 1, puzzle: -1, simulacao: -1 } },
  { id: 'gameboi', label: 'Game Boi', maker: 'Ninten', type: 'portatil', year: 1989, month: 6, end: 2003, pop: 2.2, fee: 3500, color: '#9aa564',
    fit: { puzzle: 1, rpg: 1, plataforma: 1, tiro: -1, corrida: -1 } },
  { id: 'snes', label: 'Super Nintendinho', maker: 'Ninten', type: 'console', year: 1991, month: 7, end: 1999, pop: 2.6, fee: 8000, color: '#6d5fa8',
    fit: { rpg: 1, plataforma: 1, luta: 1, corrida: 1, tiro: -1 } },
  { id: 'playstacao', label: 'PlayStação', maker: 'Sonhy', type: 'console', year: 1995, month: 8, end: 2006, pop: 3.4, fee: 14000, color: '#9ea4ad',
    fit: { rpg: 1, corrida: 1, terror: 1, luta: 1, ritmo: 1, estrategia: -1 } },
  { id: 'ninten64', label: 'Ninten 64', maker: 'Ninten', type: 'console', year: 1996, month: 8, end: 2002, pop: 1.9, fee: 16000, color: '#3a7d44',
    fit: { plataforma: 1, party: 1, tiro: 1, corrida: 1, rpg: -1, terror: -1 } },
  { id: 'sonhocast', label: 'Sonhocast', maker: 'Segah', type: 'console', year: 1999, month: 8, end: 2002, pop: .9, fee: 15000, color: '#e98a2f',
    fit: { luta: 1, esporte: 1, corrida: 1, ritmo: 1 } },
  { id: 'playstacao2', label: 'PlayStação 2', maker: 'Sonhy', type: 'console', year: 2000, month: 9, end: 2013, pop: 4.2, fee: 24000, color: '#20263a',
    fit: { acao: 1, rpg: 1, esporte: 1, corrida: 1, terror: 1, ritmo: 1, moba: -1 } },
  { id: 'gba', label: 'Game Boi Avançado', maker: 'Ninten', type: 'portatil', year: 2001, month: 5, end: 2008, pop: 2.1, fee: 9000, color: '#5b4dbb',
    fit: { rpg: 1, plataforma: 1, puzzle: 1, tiro: -1 } },
  { id: 'xcaixa', label: 'XCaixa', maker: 'Macrosoft', type: 'console', year: 2001, month: 10, end: 2006, pop: 1.5, fee: 22000, color: '#3e8b2f',
    fit: { tiro: 1, corrida: 1, acao: 1, puzzle: -1, party: -1 } },
  { id: 'gamecubo', label: 'GameCubo', maker: 'Ninten', type: 'console', year: 2001, month: 8, end: 2007, pop: 1.3, fee: 20000, color: '#6a4fa0',
    fit: { party: 1, plataforma: 1, luta: 1, terror: -1 } },
  { id: 'nds', label: 'Ninten DS', maker: 'Ninten', type: 'portatil', year: 2004, month: 10, end: 2013, pop: 3.6, fee: 12000, color: '#c8ccd2',
    fit: { puzzle: 1, simulacao: 1, party: 1, rpg: 1, tiro: -1 } },
  { id: 'xcaixa360', label: 'XCaixa 360', maker: 'Macrosoft', type: 'console', year: 2005, month: 10, end: 2016, pop: 2.9, fee: 32000, color: '#7fbf3f',
    fit: { tiro: 1, acao: 1, corrida: 1, esporte: 1, cozy: -1 } },
  { id: 'psp', label: 'PlayStação Portátil', maker: 'Sonhy', type: 'portatil', year: 2005, month: 2, end: 2014, pop: 1.8, fee: 14000, color: '#30343c',
    fit: { rpg: 1, corrida: 1, luta: 1, simulacao: -1 } },
  { id: 'playstacao3', label: 'PlayStação 3', maker: 'Sonhy', type: 'console', year: 2006, month: 10, end: 2017, pop: 2.8, fee: 38000, color: '#14161b',
    fit: { acao: 1, tiro: 1, rpg: 1, esporte: 1, party: -1 } },
  { id: 'uii', label: 'Uii', maker: 'Ninten', type: 'console', year: 2006, month: 10, end: 2013, pop: 3.3, fee: 18000, color: '#e9edf1',
    fit: { party: 1, esporte: 1, ritmo: 1, cozy: 1, tiro: -1, terror: -1, estrategia: -1 } },
  { id: 'celular', label: 'Celular', maker: 'Lojinha de apps', type: 'mobile', year: 2008, month: 6, end: 9999, fee: 800, color: '#3b82c4',
    curve: [[2008, .5], [2011, 2.2], [2015, 3.6], [2020, 4.2], [2040, 4.8]],
    fit: { puzzle: 1, cozy: 1, estrategia: 1, simulacao: 1, party: 1, tiro: -1, luta: -1, mmo: -1, terror: -1 } },
  { id: 'playstacao4', label: 'PlayStação 4', maker: 'Sonhy', type: 'console', year: 2013, month: 10, end: 2024, pop: 3.6, fee: 42000, color: '#1c2a52',
    fit: { acao: 1, rpg: 1, tiro: 1, esporte: 1, terror: 1, puzzle: -1 } },
  { id: 'xcaixaum', label: 'XCaixa Um', maker: 'Macrosoft', type: 'console', year: 2013, month: 10, end: 2021, pop: 1.8, fee: 40000, color: '#2e7d32',
    fit: { tiro: 1, corrida: 1, battle: 1, cozy: -1 } },
  { id: 'vr', label: 'Capacete VR', maker: 'Meta-que-nada', type: 'vr', year: 2016, month: 2, end: 9999, fee: 20000, color: '#ff6b9a',
    curve: [[2016, .25], [2022, .5], [2030, 1.1], [2040, 1.6]],
    fit: { ritmo: 1, simulacao: 1, terror: 1, tiro: 1, estrategia: -1, rpg: -1, moba: -1 } },
  { id: 'suitch', label: 'Ninten Suítch', maker: 'Ninten', type: 'portatil', year: 2017, month: 2, end: 2032, pop: 3.8, fee: 30000, color: '#e4002b',
    fit: { party: 1, cozy: 1, plataforma: 1, roguelike: 1, tiro: -1 } },
  { id: 'playstacao5', label: 'PlayStação 5', maker: 'Sonhy', type: 'console', year: 2020, month: 10, end: 2031, pop: 3.4, fee: 60000, color: '#f2f3f5',
    fit: { acao: 1, rpg: 1, tiro: 1, terror: 1, cozy: -1 } },
  { id: 'xcaixasx', label: 'XCaixa Série Xis', maker: 'Macrosoft', type: 'console', year: 2020, month: 10, end: 2030, pop: 1.6, fee: 56000, color: '#111',
    fit: { tiro: 1, corrida: 1, battle: 1, estrategia: 1 } },
  { id: 'nuvem', label: 'Nuvem Play', maker: 'Gugou', type: 'nuvem', year: 2026, month: 3, end: 9999, fee: 35000, color: '#8ec5ff',
    curve: [[2026, .6], [2032, 2.2], [2040, 3.4]],
    fit: { mmo: 1, battle: 1, moba: 1, party: 1, ritmo: -1 } },
  { id: 'suitch2', label: 'Ninten Suítch 2', maker: 'Ninten', type: 'portatil', year: 2025, month: 5, end: 2038, pop: 3.6, fee: 52000, color: '#d4002b',
    fit: { party: 1, cozy: 1, plataforma: 1, rpg: 1, tiro: -1 } },
  { id: 'playstacao6', label: 'PlayStação 6', maker: 'Sonhy', type: 'console', year: 2028, month: 10, end: 2040, pop: 3.2, fee: 80000, color: '#c9ccd3',
    fit: { acao: 1, rpg: 1, tiro: 1, battle: 1 } },
  { id: 'neural', label: 'Neurolink Play', maker: 'Nem Pergunte', type: 'vr', year: 2036, month: 0, end: 9999, fee: 120000, color: '#b14cff',
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

// Tamanho do público da plataforma num instante (ano fracionário).
export function platformSize(platform, t) {
  const start = platform.year + platform.month / 12
  if (t < start) return 0
  if (platform.curve) return lerpCurve(platform.curve, t)
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
  return PLATFORMS.filter(platform => {
    const start = platform.year + platform.month / 12
    return start <= t && t <= platform.end + .99
  })
}

export const platformFit = (platform, genreId) => platform?.fit?.[genreId] ?? 0
