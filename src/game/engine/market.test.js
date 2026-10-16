import test from 'node:test'
import assert from 'node:assert/strict'
import { createGame } from './state.js'
import { HISTORY_VERSION, stepRivals } from './market.js'
import { tick } from './tick.js'
import { acquisitionPrice, buyableStudios } from './teams.js'
import { mulberry32 } from './rng.js'
import { ALL_HISTORIC_GAMES } from '../data/history.js'
import { platformById, platformStart } from '../data/platforms.js'
import { RIVALS, rivalTierAt } from '../data/content/rivals.js'
import { moneyScale } from '../data/economy.js'

const byId = id => ALL_HISTORIC_GAMES.find(entry => entry.id === id)

// Avança semana a semana sem o jogador decidir nada (a fila é descartada).
function idle(state, random, weeks, each = () => {}) {
  for (let i = 0; i < weeks; i += 1) {
    state.queue = []
    tick(state, random)
    each(state)
  }
  return state
}

// Mercado sozinho, sem o resto do tick: só os rivais lançando o ano inteiro.
function marketYear(year, seed = 3) {
  const random = mulberry32(seed)
  const state = createGame({ startYear: year }, random)
  for (let week = 0; week < 48; week += 1) {
    state.week = week
    stepRivals(state, random)
  }
  return state
}
const released = (state, id) => state.rivalGames.find(game => game.id === `hist-${id}`)

test('jogo de janeiro a março ainda disputa o Jogo do Ano dele', () => {
  // Na virada o ano já mudou quando os rivais andam; o jogo do começo do ano não pode sumir antes da cerimônia.
  const state = createGame({ startYear: 2023 }, mulberry32(1))
  state.week = 0
  state.rivalGames = [{ id: 'cedo', year: 2022, age: 45, copies: 1, tau: 4, score: 9.9 }, { id: 'velho', year: 2021, age: 90, copies: 1, tau: 4, score: 9 }]
  stepRivals(state, () => .99)
  assert.ok(state.rivalGames.some(game => game.id === 'cedo'), 'fica para a cerimônia')
  assert.ok(!state.rivalGames.some(game => game.id === 'velho'))
  state.week = 1
  stepRivals(state, () => .99)
  assert.ok(!state.rivalGames.some(game => game.id === 'cedo'), 'depois da cerimônia sai da prateleira')

  // Carreira de verdade: Elden Ring (fevereiro de 2022) concorre e o Jogo do Ano é a maior nota do ano.
  const random = mulberry32(7)
  const career = createGame({ startYear: 2022 }, random)
  const best = new Map()
  idle(career, random, 49, current => {
    for (const game of current.rivalGames) best.set(game.year, Math.max(best.get(game.year) ?? 0, game.score))
  })
  const goty = career.goty.find(entry => entry.year === 2022)
  assert.ok(goty, 'Jogo do Ano de 2022 registrado')
  assert.equal(goty.score, best.get(2022))
  assert.ok(goty.score >= byId('elden-ring').score)
})

test('Indie do Ano: rival pequena é indie, editora grande fora da lista não', () => {
  const y2020 = marketYear(2020)
  assert.equal(released(y2020, 'hades').indie, true, 'Hades (Supergiant, porte 1)')
  assert.equal(released(y2020, 'streets-of-rage-4').indie, true, 'Dotemu vendeu pouco e não é editora grande')
  const y1991 = marketYear(1991)
  assert.equal(released(y1991, 'sid-meiers-civilization').indie, false, 'MicroProse')
  assert.equal(released(y1991, 'monkey-island-2-lechucks-revenge').indie, false, 'LucasArts')
  const y2024 = marketYear(2024)
  assert.equal(released(y2024, 'suicide-squad-kill-the-justice-league').indie, false, 'Rocksteady')
  assert.equal(released(y2024, 'balatro').indie, true)
})

test('preço de estúdio: só sucesso que ainda vem encarece, no máximo 4× o base', () => {
  const BASE = { 1: 70000, 2: 260000 }
  const range = (rival, year) => [0, 3].map(extra => Math.round(BASE[rivalTierAt(rival, year)] * (1 + extra) * moneyScale(year)))
  for (const year of [1982, 1985, 1988, 1995, 2005, 2015]) {
    const state = createGame({ startYear: year }, mulberry32(year))
    for (const rival of buyableStudios(state)) {
      const price = acquisitionPrice(state, rival)
      const [floor, ceiling] = range(rival, year)
      assert.ok(price >= floor - 2 && price <= ceiling + 2, `${rival.id} ${year}: ${price} fora de ${floor}..${ceiling}`)
    }
  }
  // A EA de 1982 tem um catálogo enorme pela frente, mas paga o teto, não 38× o base.
  const ea = RIVALS.find(rival => rival.id === 'ea')
  assert.ok(acquisitionPrice(createGame({ startYear: 1982 }, mulberry32(1)), ea) <= range(ea, 1982)[1] + 2)
  // Sucesso que ainda vem continua encarecendo: a Game Freak antes de Pokémon custa mais que o base.
  const freak = RIVALS.find(rival => rival.id === 'gamefreak')
  assert.ok(acquisitionPrice(createGame({ startYear: 1990 }, mulberry32(1)), freak) > range(freak, 1990)[0] + 2)
})

test('notícia de lançamento real: diário só com os marcos do ano e semana lotada sem engolir os avisos', () => {
  // 2004 tem semana com onze lançamentos reais (novembro).
  const random = mulberry32(5)
  const state = createGame({ startYear: 2004 }, random)
  state.log.unshift({ icon: 'building', text: 'Comprou a Teste', at: '2004·0' })
  let loudest = 0
  idle(state, random, 48, current => {
    loudest = Math.max(loudest, current.toasts.filter(item => item.sub?.endsWith(' lançou')).length)
    current.toasts = []
  })
  const trends = ALL_HISTORIC_GAMES.filter(entry => entry.year === 2004 && entry.trend).length
  const news = state.log.filter(item => / lançou /.test(item.text) && !/lançou o /.test(item.text))
  assert.ok(news.length <= 3 + trends, `${news.length} linhas de lançamento em um ano`)
  for (const item of news) {
    const entry = ALL_HISTORIC_GAMES.find(game => item.text.endsWith(` lançou ${game.title}`))
    assert.ok(entry && (entry.trend || entry.copies >= 8), `só sucesso vai pro diário: ${item.text}`)
  }
  assert.ok(state.log.some(item => item.text === 'Comprou a Teste'), 'a linha do jogador sobrevive a um ano de notícias')
  assert.equal(loudest, 3, 'semana lotada vira no máximo três avisos')
})

test('catálogo real: um jogo por linha, no console certo e com o nome de verdade', () => {
  const ids = ALL_HISTORIC_GAMES.map(entry => entry.id)
  assert.equal(new Set(ids).size, ids.length, 'id repetido')
  assert.equal(ALL_HISTORIC_GAMES.filter(entry => entry.title === 'Slay the Spire').length, 1)
  assert.equal(HISTORY_VERSION, 4, 'lista mudou: saves antigos recalculam o cursor')
  // Todo jogo sai com o aparelho à venda (mesma conta de availablePlatforms).
  for (const entry of ALL_HISTORIC_GAMES) {
    const platform = platformById(entry.platform)
    assert.ok(platform, `${entry.id}: plataforma ${entry.platform}`)
    const t = entry.year + entry.month / 12
    assert.ok(platformStart(platform) <= t && t <= platform.end + .99, `${entry.id} fora da vida do ${entry.platform}`)
  }
  assert.equal(byId('fifa-1993').platform, 'megadrive')
  assert.equal(byId('fifa-1999').title, 'FIFA 2000')
  assert.equal(byId('pes-1997').title, 'Winning Eleven 97')
  assert.equal(byId('pes-2000').title, 'Winning Eleven 2000')
  assert.equal(byId('pes-2001').title, 'Pro Evolution Soccer')
  assert.equal(byId('pes-1998').title, 'Winning Eleven 3')
  // Call of Duty: outubro quando foi outubro, e Infinite Warfare não é o pico da série.
  for (const year of [2003, 2005, 2018, 2019, 2022, 2024]) assert.equal(byId(`cod-${year}`).month, 9, `cod-${year}`)
  const cod = ALL_HISTORIC_GAMES.filter(entry => entry.id.startsWith('cod-'))
  assert.ok(byId('cod-2016').copies < Math.max(...cod.map(entry => entry.copies)))
  assert.ok(byId('cod-2009').copies > byId('cod-2016').copies)
})

test('catálogo real: créditos e temas conferidos', () => {
  assert.equal(byId('space-invaders').rivalId, 'atari')
  assert.equal(byId('mario-party').studio, 'Hudson Soft')
  assert.equal(byId('dragon-ball-z-super-butoden').rivalId, null)
  assert.equal(byId('dragon-ball-z-budokai').rivalId, null)
  // Rival só é dona de jogo enquanto existe.
  for (const entry of ALL_HISTORIC_GAMES) {
    const rival = entry.rivalId && RIVALS.find(item => item.id === entry.rivalId)
    if (rival) assert.ok(rival.foundedYear <= entry.year, `${entry.id} antes da ${rival.id} existir`)
  }
  // Folclore BR é só de jogo brasileiro; esporte sem bola de futebol não puxa moda de futebol.
  const folclore = ALL_HISTORIC_GAMES.filter(entry => entry.theme === 'folclore').map(entry => entry.id).sort()
  assert.deepEqual(folclore, ['dandara', 'enigma-do-medo', 'hell-clock'])
  assert.equal(byId('witcher-3').theme, 'fantasia')
  assert.notEqual(byId('wii-sports').theme, 'futebol')
})

test('save antigo recalcula quem é indie entre os jogos reais já na prateleira', async () => {
  const { afterLoad } = await import('./reducer.js')
  const state = createGame({ startYear: 2020 }, mulberry32(5))
  state.rivalGames.push({ id: 'hist-hades', title: 'Hades', historic: true, rivalId: 'supergiant', year: 2020, indie: false, weekly: 0, age: 3 })
  afterLoad(state)
  assert.equal(state.rivalGames.find(game => game.id === 'hist-hades').indie, true)
})

test('lista nova não pula jogo que mudou de mês quando o save carrega no meio do caminho', () => {
  const random = mulberry32(9)
  const state = createGame({ startYear: 2019 }, random)
  state.week = 37
  state.historyVersion = HISTORY_VERSION - 1
  state.rivalGames = state.rivalGames.filter(game => game.id !== 'hist-cod-2019')
  stepRivals(state, random)
  assert.equal(state.rivalGames.filter(game => game.id === 'hist-cod-2019').length, 1)
  stepRivals(state, random)
  assert.equal(state.rivalGames.filter(game => game.id === 'hist-cod-2019').length, 1, 'não lança duas vezes')
})
