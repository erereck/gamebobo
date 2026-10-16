import test from 'node:test'
import assert from 'node:assert/strict'
import {
  CATALOG, acquiredWeek, almanacCompanies, almanacNews, almanacSales, almanacTimeline, bestSellers, consoleMarket,
  countdownText, decadeOf, groupByYear, happened, indexCatalog, installedBase, maturedShare, monthStamp, playerRecords,
  rankDecade, releasedCount, retiredPlatforms, salesDecades, salesSummary, studioColor, studioOf, upcomingPlatforms,
  weekStamp, worldRecords, yearRecords,
} from './almanac.js'
import { ALL_HISTORIC_GAMES } from '../data/history.js'
import { PLATFORMS, platformById } from '../data/platforms.js'
import { RIVALS } from '../data/content/rivals.js'

// Estado mínimo: só o que o almanaque lê.
const world = (year, week = 0, extra = {}) => ({
  id: 'teste', year, week, startYear: 1980, studio: { name: 'Estúdio Teste', founded: 1980 },
  games: [], goty: [], acquired: [], teams: [], log: [], kits: ['pc'], stats: { chartNumberOnes: 0 }, ...extra,
})
const myGame = (id, year, sold, extra = {}) => ({
  id, title: `Meu Jogo ${id}`, year, week: 8, genre: 'acao', theme: 'espaco', platform: 'pc', score: 7.5, sold, revenue: sold * 2, onMarket: true, ...extra,
})
const entryMonth = entry => monthStamp(entry.year, entry.month ?? 0)
const has = (state, id) => almanacSales(state).some(entry => entry.id === `real-${id}`)
// Jogo no formato novo: studio = nome de exibição, rivalId = dona (ou null).
const novo = (id, studio, rivalId, year, month, copies, extra = {}) => ({ id, title: id, studio, rivalId, year, month, genre: 'acao', theme: 'espaco', score: 8, copies, platform: 'pc', trend: false, ...extra })
const nintendo = RIVALS.find(rival => rival.id === 'nintendo')

test('almanaque nunca mostra jogo que ainda não saiu', () => {
  for (const [year, week] of [[1980, 0], [1985, 31], [1985, 32], [1996, 20], [2013, 40], [2031, 7]]) {
    const now = monthStamp(year, Math.floor(week / 4))
    const sales = almanacSales(world(year, week))
    assert.ok(sales.every(entry => entryMonth(entry) <= now), `${year}/${week} tem jogo do futuro`)
    assert.ok(sales.every(entry => entry.copies >= 0))
  }
  // Super Mario Bros. sai em setembro de 1985 (mês 8 = semana 32).
  assert.equal(has(world(1985, 31), 'super-mario-bros'), false)
  assert.equal(has(world(1985, 32), 'super-mario-bros'), true)
  assert.equal(has(world(2012, 47), 'gta-5'), false)
  assert.equal(has(world(2013, 47), 'gta-5'), true)
})

test('catálogo indexado uma vez, em ordem de data, e cortado por busca binária', () => {
  assert.equal(CATALOG.length, ALL_HISTORIC_GAMES.length)
  for (let index = 1; index < CATALOG.length; index += 1) assert.ok(CATALOG[index - 1].week <= CATALOG[index].week)
  for (const [year, week] of [[1980, 0], [1993, 17], [2007, 47], [2050, 0]]) {
    const cut = releasedCount(CATALOG, weekStamp(year, week))
    assert.equal(cut, CATALOG.filter(item => item.week <= weekStamp(year, week)).length)
  }
  assert.equal(releasedCount([], 99), 0)
})

test('vendas reais amadurecem: lifetime não aparece inteiro na estreia', () => {
  assert.equal(maturedShare(-1), 0)
  assert.ok(Math.abs(maturedShare(11) - .55) < 1e-9)
  assert.equal(maturedShare(71), 1)
  assert.equal(maturedShare(400), 1)
  for (let month = 0; month < 80; month += 1) assert.ok(maturedShare(month + 1) >= maturedShare(month))
  const launch = almanacSales(world(1985, 32)).find(entry => entry.id === 'real-super-mario-bros')
  const later = almanacSales(world(1995, 0)).find(entry => entry.id === 'real-super-mario-bros')
  assert.ok(launch.copies < launch.lifetime * .1)
  assert.equal(later.copies, later.lifetime)
})

test('ranking mistura jogos reais e do jogador com posição na história', () => {
  const state = world(2005, 0, { games: [myGame('hit', 2002, 30e6), myGame('flop', 2003, 20000)] })
  const sales = almanacSales(state)
  sales.forEach((entry, index) => {
    assert.equal(entry.allTime, index + 1)
    if (index) assert.ok(sales[index - 1].copies >= entry.copies)
  })
  const hit = sales.find(entry => entry.id === 'hit')
  assert.equal(hit.mine, true)
  assert.equal(hit.copies, 30)
  assert.equal(hit.studio, 'Estúdio Teste')
  assert.ok(hit.allTime < sales.find(entry => entry.id === 'flop').allTime)
  assert.equal(salesSummary(sales).playerBest, hit.allTime)
  // Recorte por década recomeça a contagem, mas guarda o lugar na história.
  const decade = rankDecade(sales, 2000)
  assert.ok(decade.every(entry => decadeOf(entry.year) === 2000))
  assert.deepEqual(decade.map(entry => entry.rank), decade.map((_, index) => index + 1))
  const mine = decade.find(entry => entry.id === 'hit')
  assert.equal(mine.allTime, hit.allTime)
  assert.ok(mine.rank <= mine.allTime)
  assert.equal(bestSellers(state, { decade: 1980 })[0].id, 'real-super-mario-bros')
  assert.deepEqual(salesDecades(state), [1980, 1990, 2000])
})

test('Minecraft lidera a história quando o calendário chega lá', () => {
  const sales = almanacSales(world(2030, 0))
  assert.equal(sales[0].id, 'real-minecraft')
  assert.ok(salesSummary(sales).millionClub > 100)
  assert.equal(worldRecords(sales).seller.id, 'real-minecraft')
  assert.equal(worldRecords([]), null)
})

test('empresa aceita id antigo ou nome de exibição com rivalId', () => {
  assert.deepEqual(studioOf({ studio: 'nintendo' }), { id: 'nintendo', name: 'Nintendo', color: nintendo.color })
  assert.deepEqual(studioOf({ studio: 'Nintendo EAD', rivalId: 'nintendo' }), { id: 'nintendo', name: 'Nintendo EAD', color: nintendo.color })
  assert.deepEqual(studioOf({ studio: 'Halfbrick Studios', rivalId: null }), { id: null, name: 'Halfbrick Studios', color: studioColor('Halfbrick Studios') })
  // Cor estável por nome, igual à das Paradas.
  assert.equal(studioColor('Mojang'), studioColor('Mojang'))
  assert.match(studioColor('Qualquer'), /^#[0-9a-f]{6}$/)
})

test('formato novo: nome do estúdio na lista, dona agrupa os sucessos e a compra apaga o futuro', () => {
  const catalog = indexCatalog([
    novo('mario-novo', 'Nintendo EAD', 'nintendo', 1990, 3, 20),
    novo('zelda-novo', 'Nintendo EAD', 'nintendo', 1991, 6, 12),
    novo('indie-novo', 'Garagem Studio', null, 1990, 1, 2),
    novo('freak-cedo', 'Game Freak', 'gamefreak', 1990, 5, 1),
    novo('freak-tarde', 'Game Freak', 'gamefreak', 1993, 0, 30),
    novo('futuro-novo', 'Nintendo EAD', 'nintendo', 1999, 0, 50),
  ])
  const log = [{ icon: 'building', text: 'Comprou a Game Freak', at: '1991·4' }]
  const state = world(1995, 0, { acquired: ['gamefreak'], log, games: [myGame('meu', 1994, 15e6)] })
  const sales = almanacSales(state, catalog)
  const ids = sales.map(entry => entry.id)
  assert.deepEqual(ids, ['real-mario-novo', 'meu', 'real-zelda-novo', 'real-indie-novo', 'real-freak-cedo'])
  assert.equal(sales[0].studio, 'Nintendo EAD')
  assert.equal(sales[0].rivalId, 'nintendo')
  assert.equal(sales[0].color, nintendo.color)
  assert.equal(sales.find(entry => entry.id === 'real-indie-novo').rivalId, null)
  assert.equal(sales.find(entry => entry.id === 'meu').allTime, 2)
  const companies = almanacCompanies(state, sales)
  const owner = companies.active.find(company => company.id === 'nintendo')
  assert.deepEqual(owner.hits.map(entry => entry.id), ['real-mario-novo', 'real-zelda-novo'])
  assert.equal(companies.acquired[0].since, 1991)
  assert.deepEqual(companies.acquired[0].hits.map(entry => entry.id), ['real-freak-cedo'])
  // O mesmo jogo no formato antigo dá o mesmo resultado.
  const antigo = indexCatalog([{ id: 'mario-novo', title: 'mario-novo', studio: 'nintendo', year: 1990, month: 3, genre: 'acao', theme: 'espaco', score: 8, copies: 20, platform: 'pc' }])
  assert.equal(antigo[0].rivalId, 'nintendo')
  assert.equal(antigo[0].studio, 'Nintendo')
  assert.equal(antigo[0].week, catalog.find(item => item.id === 'real-mario-novo').week)
})

test('estúdio comprado não lança mais os clássicos depois da compra', () => {
  // Comprou a Game Freak em 1995: Pokémon Red & Blue (1996) nunca aconteceu.
  const state = world(2000, 0, { acquired: ['gamefreak'], log: [{ icon: 'building', text: 'Comprou a Game Freak', at: '1995·10' }] })
  assert.equal(acquiredWeek(state, 'gamefreak'), weekStamp(1995, 10))
  const pokemon = CATALOG.find(item => item.id === 'real-pokemon-red-blue')
  assert.equal(happened(pokemon, state), false)
  assert.ok(!has(state, 'pokemon-red-blue'))
  // Diário sem a linha da compra: a Game Freak só era comprável até 1995 (porte 3 em 1996).
  const forgotten = world(2000, 0, { acquired: ['gamefreak'], log: [] })
  assert.equal(acquiredWeek(forgotten, 'gamefreak'), null)
  assert.ok(!has(forgotten, 'pokemon-red-blue'))
  const companies = almanacCompanies(state)
  assert.equal(companies.acquired[0].id, 'gamefreak')
  assert.equal(companies.acquired[0].since, 1995)
  assert.equal(almanacCompanies(forgotten).acquired[0].since, null)
  assert.ok(!companies.active.some(company => company.id === 'gamefreak'))
  // Quem não comprou nada vê o Pokémon normalmente.
  assert.ok(has(world(2000, 0), 'pokemon-red-blue'))
})

test('próximos consoles chegam em ordem com contagem regressiva', () => {
  assert.equal(countdownText(0), 'já nas lojas')
  assert.equal(countdownText(1), 'em 1 mês')
  assert.equal(countdownText(5), 'em 5 meses')
  assert.equal(countdownText(12), 'em 1 ano')
  assert.equal(countdownText(15), 'em 1 ano e 3 meses')
  assert.equal(countdownText(26), 'em 2 anos e 2 meses')
  const next = upcomingPlatforms(world(2019, 0), 4)
  assert.equal(next.length, 4)
  assert.equal(next[0].id, 'stadia')
  assert.equal(next[0].countdown, 'em 10 meses')
  assert.deepEqual(next.slice(1, 3).map(item => item.id).sort(), ['ps5', 'xboxsx'])
  assert.equal(next[1].countdown, 'em 1 ano e 10 meses')
  for (let index = 1; index < next.length; index += 1) assert.ok(next[index].months >= next[index - 1].months)
  assert.ok(next.every(item => item.months > 0 && item.loves.every(genre => platformById(item.id).fit[genre] > 0)))
  // Lançou no mês corrente: já está nas lojas, não na lista.
  assert.ok(!upcomingPlatforms(world(2020, 40), 4).some(item => item.id === 'ps5'))
  assert.ok(upcomingPlatforms(world(2020, 39), 4).some(item => item.id === 'ps5'))
  // Longe demais ainda é rumor.
  assert.ok(upcomingPlatforms(world(2024, 0), 4).find(item => item.id === 'ps6').rumor)
})

test('mercado de consoles soma 100% e só tem quem está à venda', () => {
  for (const year of [1980, 1990, 2001, 2015, 2035]) {
    const market = consoleMarket(world(year, 20))
    const total = market.reduce((sum, item) => sum + item.share, 0)
    assert.ok(Math.abs(total - 1) < 1e-9)
    const t = year + 20 / 48
    for (const item of market) {
      const platform = platformById(item.id)
      assert.ok(platform.year + platform.month / 12 <= t && t <= platform.end + .99)
    }
    for (let index = 1; index < market.length; index += 1) assert.ok(market[index - 1].share >= market[index].share)
  }
  // Base instalada só para aparelho de loja: cresce com o tempo e fecha no total vendido de verdade.
  const ps2 = platformById('ps2')
  assert.ok(installedBase(ps2, 2003) < installedBase(ps2, 2008))
  assert.equal(installedBase(ps2, 2030), 160)
  assert.equal(installedBase(platformById('pc'), 2020), null)
  assert.equal(installedBase(platformById('gbc'), 2020), null)
  assert.ok(installedBase(platformById('ps6'), 2045) > 0) // sem número real: só a curva do jogo
  const retired = retiredPlatforms(world(2005, 0), 10)
  assert.equal(retired.find(item => item.id === 'snes').base, 49.1)
  assert.ok(retired.every(item => item.to < 2005))
  assert.ok(retired.some(item => item.id === 'snes'))
  for (let index = 1; index < retired.length; index += 1) assert.ok(retired[index - 1].to >= retired[index].to)
})

test('linha do tempo vem do mais novo ao mais velho e sem futuro', () => {
  const state = world(1999, 20, {
    startYear: 1990,
    games: [myGame('a', 1996, 400000)],
    goty: [{ year: 1997, title: 'Meu Jogo a', studio: 'Estúdio Teste', mine: true, score: 9.1 }],
  })
  const items = almanacTimeline(state)
  const now = monthStamp(1999, 5)
  assert.ok(items.every(item => monthStamp(item.year, Math.max(0, item.month)) <= now))
  for (let index = 1; index < items.length; index += 1) {
    const a = items[index - 1]
    const b = items[index]
    assert.ok(a.year > b.year || (a.year === b.year && a.month >= b.month))
  }
  assert.ok(items.some(item => item.kind === 'mine' && item.text === 'Meu Jogo a'))
  assert.ok(items.some(item => item.kind === 'goty' && item.mine))
  assert.ok(items.some(item => item.kind === 'launch' && item.text.startsWith('Dreamcast')))
  assert.ok(!items.some(item => item.text.startsWith('PlayStation 2')))
  assert.ok(items.some(item => item.kind === 'world'))
  // No máximo três sucessos por ano, e série anual só se puxou a moda.
  const hits = items.filter(item => item.kind === 'hit')
  const perYear = new Map()
  for (const item of hits) perYear.set(item.year, (perYear.get(item.year) ?? 0) + 1)
  assert.ok([...perYear.values()].every(count => count <= 3))
  const groups = groupByYear(items)
  assert.equal(new Set(groups.map(group => group.year)).size, groups.length)
  assert.equal(groups.reduce((sum, group) => sum + group.items.length, 0), items.length)
})

test('recordes do ano e do jogador', () => {
  const state = world(2008, 0, { games: [myGame('mega', 2007, 50e6, { score: 9.9 })], goty: [{ year: 2007, title: 'Meu Jogo mega', mine: true }] })
  const years = yearRecords(state)
  assert.equal(years[0].year, Math.max(...almanacSales(state).map(entry => entry.year)))
  for (let index = 1; index < years.length; index += 1) assert.ok(years[index - 1].year > years[index].year)
  const y2007 = years.find(item => item.year === 2007)
  assert.equal(y2007.seller.id, 'mega')
  assert.equal(y2007.critic.id, 'mega')
  assert.equal(y2007.goty.mine, true)
  const y1985 = years.find(item => item.year === 1985)
  assert.equal(y1985.seller.id, 'real-super-mario-bros')
  const records = playerRecords(state)
  assert.equal(records.released, 1)
  assert.equal(records.sellerCrowns, 1)
  assert.equal(records.criticCrowns, 1)
  assert.equal(records.goty, 1)
  assert.ok(records.bestRank.rank >= 1)
  assert.equal(playerRecords(world(2008, 0)), null)
})

test('doca acende quando um console chega depois da última visita', () => {
  const state = world(1989, 20)
  assert.ok(almanacNews(state, weekStamp(1989, 0)) >= 1) // Game Boy em abril de 1989
  assert.equal(almanacNews(state, weekStamp(1989, 20)), 0)
  const launches = PLATFORMS.filter(platform => weekStamp(platform.year, platform.month * 4) > weekStamp(1989, 0) && weekStamp(platform.year, platform.month * 4) <= weekStamp(1989, 20))
  assert.equal(almanacNews(state, weekStamp(1989, 0)), launches.length)
})

test('empresas: ativas, fechadas e sucessos que já aconteceram', () => {
  const { active, closed } = almanacCompanies(world(2004, 0))
  assert.ok(closed.some(company => company.id === 'westwood'))
  assert.ok(active.some(company => company.id === 'squareenix'))
  assert.ok(!active.some(company => company.id === 'riot')) // nasce em 2006
  const big = active.find(company => company.id === 'nintendo')
  assert.equal(big.tier, 4)
  assert.ok(big.hits.length > 0 && big.hits.length <= 5 && big.hits.every(entry => entry.year <= 2004))
  for (let index = 1; index < big.hits.length; index += 1) assert.ok(big.hits[index - 1].copies >= big.hits[index].copies)
  for (let index = 1; index < active.length; index += 1) assert.ok(active[index - 1].tier >= active[index].tier)
  // Série anual aparece uma vez só nos destaques, mas conta em jogos e cópias.
  const ea = almanacCompanies(world(2015, 0)).active.find(company => company.id === 'ea')
  const series = ea.hits.map(entry => entry.series).filter(Boolean)
  assert.equal(new Set(series).size, series.length)
  assert.ok(ea.games > ea.hits.length)
})

test('continua rápido com milhares de jogos', () => {
  const many = []
  for (let index = 0; index < 4000; index += 1) many.push(novo(`g${index}`, `Estúdio ${index % 50}`, index % 3 ? 'nintendo' : null, 1980 + (index % 50), index % 12, (index % 97) / 3 + .1))
  const catalog = indexCatalog(many)
  const state = world(2026, 30, { games: Array.from({ length: 60 }, (_, index) => myGame(`m${index}`, 1990 + (index % 30), index * 1e5)) })
  const begin = performance.now()
  for (let round = 0; round < 10; round += 1) {
    const sales = almanacSales(state, catalog)
    yearRecords(state, sales)
    almanacCompanies(state, sales)
    almanacTimeline(state, sales)
  }
  const each = (performance.now() - begin) / 10
  assert.ok(each < 60, `almanaque levou ${each.toFixed(1)} ms`)
})
