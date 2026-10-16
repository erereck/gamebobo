import { REAL_GAMES } from './realgames/index.js'

// A indústria de verdade acontecendo em volta do seu estúdio.
// Cada jogo sai no mês real (0-11), entra nas paradas, disputa prêmios e pode puxar a moda.
// score = nota média da crítica (0-10). copies = milhões vendidos na vida toda (aprox.).
// studio = nome de quem fez; rivalId = empresa rival dona do jogo (ou null).
// A lista completa, conferida jogo a jogo, mora em realgames/ (uma década por arquivo).
export const HISTORIC_GAMES = REAL_GAMES

const g = (id, title, studio, rivalId, year, month, genre, theme, score, copies, platform, trend = false) => ({ id, title, studio, rivalId, year, month, genre, theme, score, copies, platform, trend })

// Séries que voltam todo ano, como no calendário de verdade.
// Os anos fora da regra têm o nome de verdade da caixa.
const FIFA_NAMES = { 1999: 'FIFA 2000', 2000: 'FIFA 2001', 2001: 'FIFA Football 2002', 2002: 'FIFA Football 2003', 2003: 'FIFA Football 2004', 2004: 'FIFA Football 2005' }
const PES_NAMES = { 1997: 'Winning Eleven 97', 2000: 'Winning Eleven 2000', 2001: 'Pro Evolution Soccer' }
const fifa = y => FIFA_NAMES[y] ?? (y <= 1993 ? 'FIFA International Soccer' : y <= 2022 ? `FIFA ${String((y + 1) % 100).padStart(2, '0')}` : `EA Sports FC ${(y + 1) % 100}`)
const pes = y => PES_NAMES[y] ?? (y <= 2000 ? `Winning Eleven ${y - 1995}` : y <= 2006 ? `Pro Evolution Soccer ${y - 2000}` : y <= 2020 ? `PES ${y + 1}` : `eFootball ${y + 1}`)
// Console da Sony da vez, sempre dentro da vida do aparelho; depois do PS6, a nuvem.
const sony = y => (y < 2021 ? 'ps4' : y < 2029 ? 'ps5' : y <= 2040 ? 'ps6' : 'nuvem')
const fifaPlatform = y => (y <= 1994 ? 'megadrive' : y < 2000 ? 'playstation' : y < 2007 ? 'ps2' : y < 2014 ? 'ps3' : sony(y))
const pesPlatform = y => (y < 2001 ? 'playstation' : y < 2010 ? 'ps2' : y < 2014 ? 'ps3' : sony(y))
// Call of Duty: [título, mês real (0-11), milhões vendidos (aprox.)].
const COD = {
  2003: ['Call of Duty', 9, 4.5], 2005: ['Call of Duty 2', 9, 6], 2006: ['Call of Duty 3', 10, 7],
  2007: ['CoD 4: Modern Warfare', 10, 17], 2008: ['CoD: World at War', 10, 15], 2009: ['CoD: Modern Warfare 2', 10, 25],
  2010: ['CoD: Black Ops', 10, 26], 2011: ['CoD: Modern Warfare 3', 10, 26], 2012: ['CoD: Black Ops II', 10, 24],
  2013: ['CoD: Ghosts', 10, 19], 2014: ['CoD: Advanced Warfare', 10, 15], 2015: ['CoD: Black Ops III', 10, 26],
  2016: ['CoD: Infinite Warfare', 10, 14], 2017: ['CoD: WWII', 10, 20], 2018: ['CoD: Black Ops 4', 9, 20],
  2019: ['CoD: Modern Warfare', 9, 30], 2020: ['CoD: Black Ops Cold War', 10, 30], 2021: ['CoD: Vanguard', 10, 15],
  2022: ['CoD: Modern Warfare II', 9, 25], 2023: ['CoD: Modern Warfare III', 10, 18], 2024: ['CoD: Black Ops 6', 9, 20],
  2025: ['CoD: Black Ops 7', 10, 12],
}

function annual() {
  const list = []
  for (let y = 1993; y <= 2045; y += 1) {
    list.push(g(`fifa-${y}`, fifa(y), 'EA Sports', 'ea', y, y === 1993 ? 11 : 8, 'esporte', 'futebol', Math.min(8.6, 7.4 + Math.min(1, (y - 1993) / 12)) - Math.max(0, y - 2014) * .03, Math.min(20, 2 + (y - 1993) * .8), fifaPlatform(y)))
  }
  for (let y = 1997; y <= 2045; y += 1) {
    const score = y < 2001 ? 8.6 : y < 2010 ? 9 - (y - 2001) * .08 : y < 2021 ? 8.2 - (y - 2010) * .03 : 6.6
    list.push(g(`pes-${y}`, pes(y), 'Konami', 'konami', y, 9, 'esporte', 'futebol', score, y < 2010 ? 3 + (y - 1997) * .3 : 3, pesPlatform(y)))
  }
  for (const [year, [title, month, copies]] of Object.entries(COD)) {
    const y = Number(year)
    list.push(g(`cod-${y}`, title, 'Activision', 'activision', y, month, 'tiro', 'militar', y < 2013 ? 9 - Math.max(0, y - 2009) * .1 : 8 - (y - 2013) * .04, copies, y < 2006 ? 'pc' : y < 2014 ? 'xbox360' : y < 2021 ? 'ps4' : 'ps5', y === 2007))
  }
  return list
}

export const ALL_HISTORIC_GAMES = [...HISTORIC_GAMES, ...annual()].sort((a, b) => a.year - b.year || a.month - b.month)

// Editoras, fabricantes de fliperama e estúdios de gigantes que não estão na lista de rivais.
// Vendendo pouco ou não, jogo delas nunca disputa o Indie do Ano (studio exatamente como nas linhas).
export const MAJOR_STUDIOS = new Set([
  'LucasArts', 'Lucasfilm Games', 'Origin Systems', 'MicroProse', 'Firaxis Games', 'Interplay', 'Black Isle Studios', 'Infocom', 'SSI',
  'Atlus', 'Atlus / LJN', 'Beam Software / LJN', 'Archetype Interactive / 3DO', 'Acclaim', 'Accolade', 'Infogrames', 'Titus Interactive', 'Microsoft',
  'Bally Midway', 'Midway', 'Williams Electronics', 'Gottlieb', 'Stern Electronics', 'Cinematronics', 'Nichibutsu', 'Universal', 'Amstar Electronics',
  'Irem', 'Data East', 'Technos Japan', 'Tehkan', 'Tecmo', 'Team Ninja', 'Sunsoft', 'Vic Tokai', 'Human Entertainment', 'Arc System Works',
  'Mattel Electronics', 'Coleco', 'Bandai', 'Imagic', 'Spike', 'Dimps', 'Marvelous Interactive', 'Pack-In-Video', 'Victor Interactive Software',
  'Rocksteady Studios', 'Monolith Productions', 'Volition', 'Relic Entertainment', 'Reflections Interactive', 'Iguana Entertainment',
  'ArenaNet', 'NCSoft', 'Webzen', 'Gravity', 'Smilegate',
])

// Manchetes datadas: aparecem no letreiro no ano em que aconteceram.
export const MILESTONES = [
  { year: 1983, text: 'Crash dos videogames: lojas devolvem cartuchos às pilhas' },
  { year: 1983, text: 'Atari enterra cartuchos de E.T. no deserto do Novo México' },
  { year: 1985, text: 'Nintendo exige selo de qualidade em todo cartucho de NES' },
  { year: 1989, text: 'Tetris vem junto do Game Boy e vira febre no ônibus' },
  { year: 1990, text: 'Tectoy lança o Master System no Brasil com jogos traduzidos' },
  { year: 1991, text: '"Genesis does what Nintendon\'t": a Sega provoca na TV' },
  { year: 1993, text: 'Doom circula por shareware e trava redes de faculdade' },
  { year: 1994, text: 'Sony entra no mercado: PlayStation chega ao Japão' },
  { year: 1995, text: 'Saturn chega de surpresa nas lojas e pega todo mundo desprevenido' },
  { year: 1996, text: 'Pokémon nasce no Game Boy e o recreio nunca mais é o mesmo' },
  { year: 1998, text: 'Ocarina of Time ensina a indústria a mirar em 3D' },
  { year: 1999, text: 'Lan houses se espalham pelo Brasil ao som de Counter-Strike' },
  { year: 2000, text: 'PlayStation 2 também toca DVD e vira o aparelho da sala' },
  { year: 2001, text: 'Microsoft entra na briga com o Xbox' },
  { year: 2001, text: 'Sega anuncia que vai parar de fabricar consoles' },
  { year: 2003, text: 'Valve lança a Steam; muita gente reclama da atualização' },
  { year: 2004, text: 'World of Warcraft faz gente faltar no trabalho' },
  { year: 2006, text: 'Wii Sports leva avós para o boliche na sala' },
  { year: 2007, text: 'iPhone chega e o celular vira console de bolso' },
  { year: 2008, text: 'App Store abre e qualquer um pode vender joguinho por 1 dólar' },
  { year: 2009, text: 'Minecraft em alfa vira assunto em todo fórum' },
  { year: 2011, text: 'Twitch nasce e assistir gente jogando vira esporte' },
  { year: 2012, text: 'Kickstarter: fãs financiam jogos que editoras recusaram' },
  { year: 2013, text: 'GTA V passa de 1 bilhão de dólares em três dias' },
  { year: 2014, text: 'Microsoft compra a Mojang e o Minecraft' },
  { year: 2016, text: 'Pokémon GO lota praças e parques do país inteiro' },
  { year: 2017, text: 'Battle royale vira o gênero mais copiado do planeta' },
  { year: 2017, text: 'Xbox Game Pass estreia: jogos por assinatura' },
  { year: 2018, text: 'Free Fire domina os celulares brasileiros' },
  { year: 2020, text: 'Com todo mundo em casa, videogames batem recordes' },
  { year: 2022, text: 'Microsoft anuncia a compra da Activision Blizzard' },
  { year: 2023, text: 'Google desliga o Stadia e devolve o dinheiro de todo mundo' },
  { year: 2025, text: 'Nintendo Switch 2 chega com fila na porta das lojas' },
]
