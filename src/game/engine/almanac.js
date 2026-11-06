// Almanaque: a indústria vista do calendário do save.
// Funções puras: recebem o estado e devolvem listas prontas para a interface.
// Regra de ouro: nada do futuro aparece. Jogo, console ou manchete só existe depois da data dele.
import { ALL_HISTORIC_GAMES, MILESTONES } from '../data/history.js'
import { PLATFORMS, platformSize, platformStart } from '../data/platforms.js'
import { CONSOLE_SALES } from '../data/consoleSales.js'
import { RIVALS, rivalTierAt } from '../data/content/rivals.js'
import { WEEKS_PER_MONTH, WEEKS_PER_YEAR } from '../data/economy.js'

// ---------- datas ----------
export const monthOfWeek = week => Math.max(0, Math.min(11, Math.floor((week ?? 0) / WEEKS_PER_MONTH)))
// Mês absoluto (ano × 12 + mês) para comparar datas sem frações.
export const monthStamp = (year, month = 0) => year * 12 + month
export const nowMonth = state => monthStamp(state.year, monthOfWeek(state.week))
// Semana absoluta no mesmo relógio do mercado (market.js#historicWeek): o jogo sai na semana do mês dele.
export const weekStamp = (year, week = 0) => year * WEEKS_PER_YEAR + week
export const nowWeek = state => weekStamp(state.year, state.week ?? 0)
export const nowFloat = state => state.year + (state.week ?? 0) / WEEKS_PER_YEAR
export const decadeOf = year => Math.floor(year / 10) * 10

// "em 1 ano e 3 meses"
export function countdownText(months) {
  if (months <= 0) return 'já nas lojas'
  const years = Math.floor(months / 12)
  const rest = months % 12
  const parts = []
  if (years) parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`)
  if (rest) parts.push(`${rest} ${rest === 1 ? 'mês' : 'meses'}`)
  return `em ${parts.join(' e ')}`
}

// ---------- quem fez ----------
const RIVAL_INDEX = new Map(RIVALS.map(rival => [rival.id, rival]))
// Mesma paleta e mesmo hash do mercado: o estúdio fora da lista de rivais tem a mesma cor nas Paradas.
const STUDIO_COLORS = ['#3d5a80', '#9b2226', '#2a9d8f', '#6a4c93', '#e76f51', '#386641', '#bc6c25', '#0081a7', '#7b2cbf', '#588157']
export const studioColor = name => STUDIO_COLORS[[...String(name)].reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) % 9973, 7) % STUDIO_COLORS.length]

// Os dois formatos de jogo histórico:
// antigo: studio = id da rival; novo: studio = nome de exibição e rivalId = dona do jogo (ou null).
export function studioOf(entry) {
  if (entry && 'rivalId' in entry) {
    const rival = RIVAL_INDEX.get(entry.rivalId)
    const name = entry.studio || rival?.name || '—'
    return { id: entry.rivalId ?? null, name, color: rival?.color ?? studioColor(name) }
  }
  const rival = RIVAL_INDEX.get(entry?.studio)
  const name = rival?.name ?? entry?.studio ?? '—'
  return { id: rival ? rival.id : entry?.studio ?? null, name, color: rival?.color ?? studioColor(name) }
}

// ---------- compra de estúdios ----------
// Semana exata da compra. A compra grava a data em acquiredAt (teams.js#acquireStudio);
// save antigo só tem a linha do diário ("Comprou a X" · ano·semana). null se nem ela existe mais.
export function acquiredWeek(state, rivalId) {
  if (!rivalId || !state.acquired?.includes(rivalId)) return null
  const stored = state.acquiredAt?.[rivalId]
  if (Number.isFinite(stored)) return stored
  const name = RIVAL_INDEX.get(rivalId)?.name
  const note = name && state.log?.find(item => item.text === `Comprou a ${name}`)
  if (!note?.at) return null
  const [year, week] = String(note.at).split('·').map(Number)
  return Number.isFinite(year) && year > 0 ? weekStamp(year, Number.isFinite(week) ? week : 0) : null
}

// Sem a data exata (save antigo que já perdeu a linha do diário), a compra aconteceu no máximo no último
// ano em que a empresa era pequena e aberta (só dá para comprar porte 2 ou menor).
// Clássico lançado depois disso com certeza não aconteceu.
function latestPurchase(state, rivalId) {
  const exact = acquiredWeek(state, rivalId)
  if (exact != null) return exact
  const rival = RIVAL_INDEX.get(rivalId)
  if (!rival) return nowWeek(state)
  for (let year = Math.min(state.year, (rival.closedYear ?? Infinity) - 1); year >= rival.foundedYear; year -= 1) {
    if (rivalTierAt(rival, year) <= 2) return year === state.year ? nowWeek(state) : weekStamp(year, WEEKS_PER_YEAR - 1)
  }
  return nowWeek(state)
}

function acquiredMap(state) {
  const map = new Map()
  for (const id of state.acquired ?? []) map.set(id, latestPurchase(state, id))
  return map
}

// ---------- catálogo real (montado uma vez) ----------
const ANNUAL = /^(fifa|pes|cod)-/

// Normaliza e ordena por data de lançamento. Roda no carregamento; os filtros por data viram busca binária.
export function indexCatalog(list) {
  return list.map(entry => {
    const studio = studioOf(entry)
    const month = entry.month ?? 0
    const annual = entry.annual ?? ANNUAL.test(entry.id)
    return {
      id: `real-${entry.id}`, title: entry.title, studio: studio.name, rivalId: studio.id, color: studio.color,
      year: entry.year, month, stamp: monthStamp(entry.year, month), week: weekStamp(entry.year, month * WEEKS_PER_MONTH),
      platform: entry.platform, genre: entry.genre, theme: entry.theme, score: entry.score ?? 0,
      lifetime: entry.copies ?? 0, trend: Boolean(entry.trend), annual,
      series: annual ? String(entry.id).split('-')[0] : null,
    }
  }).sort((a, b) => a.week - b.week || b.lifetime - a.lifetime)
}

export const CATALOG = indexCatalog(ALL_HISTORIC_GAMES)

// Quantos itens do catálogo já saíram até a semana (catálogo ordenado por semana).
export function releasedCount(catalog, week) {
  let lo = 0
  let hi = catalog.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (catalog[mid].week <= week) lo = mid + 1
    else hi = mid
  }
  return lo
}

// Aconteceu nesta linha do tempo? Já saiu e o estúdio ainda não era seu.
export function happened(item, state, acquired = acquiredMap(state)) {
  if (item.week > nowWeek(state)) return false
  const since = item.rivalId ? acquired.get(item.rivalId) : undefined
  return since === undefined || item.week <= since
}

// Lifetime real não aparece inteiro no mês de estreia: 55% no primeiro ano, o resto em cinco anos de cauda.
export function maturedShare(monthsOut) {
  if (monthsOut < 0) return 0
  const firstYear = Math.min(1, (monthsOut + 1) / 12) * .55
  const tail = Math.min(.45, Math.max(0, monthsOut - 11) / 60 * .45)
  return Math.min(1, firstYear + tail)
}

const PLAYER_COLOR = '#ff5d3a'
const playerEntry = (game, state) => ({
  id: game.id, title: game.title, studio: state.studio?.name ?? 'Você', rivalId: null, color: PLAYER_COLOR,
  year: game.year, month: monthOfWeek(game.week), platform: game.platforms?.[0] ?? game.platform, genre: game.genre, theme: game.theme,
  score: game.score ?? 0, copies: (Number.isFinite(game.sold) ? game.sold : 0) / 1e6, mine: true, game,
})

const byCopies = (a, b) => b.copies - a.copies || b.score - a.score || a.title.localeCompare(b.title)

// Todos os jogos que já existem nesta data, do maior para o menor, com a posição na história (allTime).
// O seu jogo entra com o que já vendeu de verdade; o real, com o lifetime amadurecido até hoje.
export function almanacSales(state, catalog = CATALOG) {
  const now = nowMonth(state)
  const acquired = acquiredMap(state)
  const cut = releasedCount(catalog, nowWeek(state))
  const list = []
  for (let index = 0; index < cut; index += 1) {
    const item = catalog[index]
    if (!happened(item, state, acquired)) continue
    list.push({ ...item, copies: item.lifetime * maturedShare(now - item.stamp), mine: false })
  }
  for (const game of state.games ?? []) list.push(playerEntry(game, state))
  list.sort(byCopies)
  for (let index = 0; index < list.length; index += 1) list[index].allTime = index + 1
  return list
}

// Recorte por década (null = todos os tempos). rank recomeça no recorte; allTime guarda o lugar na história.
export function rankDecade(sales, decade = null) {
  const list = decade == null ? sales : sales.filter(entry => decadeOf(entry.year) === decade)
  return list.map((entry, index) => ({ ...entry, rank: index + 1 }))
}

export const bestSellers = (state, { decade = null, catalog } = {}) => rankDecade(almanacSales(state, catalog), decade)

export function salesDecades(state) {
  const list = []
  for (let decade = 1980; decade <= decadeOf(state.year); decade += 10) list.push(decade)
  return list
}

export function salesSummary(sales) {
  let millionClub = 0
  for (const entry of sales) if (entry.copies >= 1) millionClub += 1
  const mine = sales.find(entry => entry.mine)
  return { millionClub, leader: sales[0] ?? null, playerBest: mine ? mine.allTime : null }
}

// ---------- consoles ----------
const BASE_UNITS = 3.3 // sem número real: milhões de aparelhos por ponto de público por ano
const HAS_BASE = new Set(['console', 'portatil'])

// Público acumulado mês a mês desde o lançamento (na unidade da curva do jogo). A loja vende até dois anos após o fim.
function audienceSum(platform, t) {
  const stop = Math.min(t, platform.end + 2)
  let sum = 0
  for (let x = platformStart(platform); x < stop; x += 1 / 12) sum += platformSize(platform, x) / 12
  return sum
}
const lifetimeAudience = new Map()
const audienceLife = platform => {
  if (!lifetimeAudience.has(platform.id)) lifetimeAudience.set(platform.id, audienceSum(platform, platform.end + 2))
  return lifetimeAudience.get(platform.id)
}

// Base instalada em milhões, só para aparelho que se compra na loja.
// A curva de público dá o ritmo; o total vendido de verdade (consoleSales.js), quando existe, dá a escala.
export function installedBase(platform, t) {
  if (!HAS_BASE.has(platform.type)) return null
  const real = CONSOLE_SALES[platform.id]
  if (real === null) return null
  const sum = audienceSum(platform, t)
  if (real === undefined) return sum * BASE_UNITS
  const life = audienceLife(platform)
  return life > 0 ? real * sum / life : real
}

const platformCard = platform => ({ id: platform.id, label: platform.label, maker: platform.maker, type: platform.type, color: platform.color })

// Fatia de cada plataforma à venda agora, normalizada para somar 1. trend compara com seis meses atrás.
export function consoleMarket(state) {
  const t = nowFloat(state)
  const live = []
  let total = 0
  for (const platform of PLATFORMS) {
    if (platformStart(platform) > t || t > platform.end + .99) continue
    const size = platformSize(platform, t)
    if (size <= 0) continue
    total += size
    live.push({ platform, size, before: platformSize(platform, t - .5) })
  }
  return live.map(({ platform, size, before }) => {
    const change = before > 0 ? size / before - 1 : 1
    return {
      ...platformCard(platform),
      share: size / total, trend: change > .03 ? 1 : change < -.03 ? -1 : 0,
      age: t - platformStart(platform),
    }
  }).sort((a, b) => b.share - a.share)
}

// Os próximos lançamentos, com contagem regressiva em meses. Mais de três anos ainda é rumor.
export function upcomingPlatforms(state, count = 4) {
  const now = nowMonth(state)
  return PLATFORMS
    .map(platform => ({ platform, months: monthStamp(platform.year, platform.month) - now }))
    .filter(item => item.months > 0)
    .sort((a, b) => a.months - b.months || a.platform.label.localeCompare(b.platform.label))
    .slice(0, count)
    .map(({ platform, months }) => ({
      ...platformCard(platform),
      year: platform.year, month: platform.month, months, countdown: countdownText(months), rumor: months > 36,
      // Gêneros que o público do aparelho vai amar: dá para planejar o próximo jogo.
      loves: Object.entries(platform.fit ?? {}).filter(([, value]) => value > 0).map(([genre]) => genre).slice(0, 4),
    }))
}

// Quem saiu de linha, do mais recente para o mais antigo.
export function retiredPlatforms(state, count = 4) {
  const t = nowFloat(state)
  return PLATFORMS
    .filter(platform => platform.end < 9000 && platform.end + .99 < t)
    .sort((a, b) => b.end - a.end || platformStart(b) - platformStart(a))
    .slice(0, count)
    .map(platform => ({ ...platformCard(platform), from: platform.year, to: platform.end, base: installedBase(platform, t) }))
}

// ---------- empresas ----------
const TOP_HITS = 5

// Jogos de cada empresa que já aconteceram (sales já vem do maior para o menor).
// Nos destaques, série anual aparece uma vez só, com o melhor ano dela.
function studioBooks(sales) {
  const map = new Map()
  for (const entry of sales) {
    if (entry.mine || !RIVAL_INDEX.has(entry.rivalId)) continue
    let book = map.get(entry.rivalId)
    if (!book) map.set(entry.rivalId, book = { games: 0, copies: 0, hits: [], series: new Set() })
    book.games += 1
    book.copies += entry.copies
    if (book.hits.length >= TOP_HITS || (entry.series && book.series.has(entry.series))) continue
    if (entry.series) book.series.add(entry.series)
    book.hits.push(entry)
  }
  return map
}
const NO_BOOK = { games: 0, copies: 0, hits: [] }

export function almanacCompanies(state, sales = almanacSales(state)) {
  const books = studioBooks(sales)
  const owned = new Set(state.acquired ?? [])
  const card = rival => {
    const { games, copies, hits } = books.get(rival.id) ?? NO_BOOK
    const since = acquiredWeek(state, rival.id)
    return {
      id: rival.id, name: rival.name, color: rival.color, founded: rival.foundedYear, closed: rival.closedYear ?? null,
      tier: rivalTierAt(rival, Math.min(state.year, rival.closedYear ?? state.year)), hits, games, copies,
      fresh: rival.foundedYear > 1980 && state.year - rival.foundedYear <= 1,
      since: since == null ? null : Math.floor(since / WEEKS_PER_YEAR),
    }
  }
  const known = RIVALS.filter(rival => rival.foundedYear <= state.year)
  const isClosed = rival => rival.closedYear && rival.closedYear <= state.year
  const acquired = known.filter(rival => owned.has(rival.id)).map(card)
  const closed = known.filter(rival => !owned.has(rival.id) && isClosed(rival)).map(card)
    .sort((a, b) => b.closed - a.closed || b.copies - a.copies)
  const active = known.filter(rival => !owned.has(rival.id) && !isClosed(rival)).map(card)
    .sort((a, b) => b.tier - a.tier || b.copies - a.copies || a.name.localeCompare(b.name))
  return { active, closed, acquired }
}

// ---------- linha do tempo ----------
const HITS_PER_YEAR = 3
const HIT_COPIES = 8 // milhões na vida toda para virar marco do ano (ou puxar a moda)

// Marcos do mundo, consoles, empresas, sucessos e os seus lançamentos, do mais novo ao mais velho.
export function almanacTimeline(state, sales = almanacSales(state)) {
  const now = nowMonth(state)
  const items = []
  const add = (year, month, kind, icon, text, extra = {}) => {
    if (monthStamp(year, Math.max(0, month)) > now) return
    items.push({ key: `${kind}-${items.length}`, year, month, kind, icon, text, ...extra })
  }
  const start = state.startYear ?? state.studio?.founded ?? state.year
  add(start, 0, 'studio', 'home', `${state.studio?.name ?? 'Seu estúdio'} abre as portas`, { mine: true })
  // Manchete sem mês (-1) fecha o ano, embaixo de tudo.
  for (const milestone of MILESTONES) add(milestone.year, -1, 'world', 'newspaper', milestone.text)
  for (const platform of PLATFORMS) {
    if (platformStart(platform) > 1980) add(platform.year, platform.month, 'launch', 'gamepad', `${platform.label} chega às lojas`, { sub: platform.maker, color: platform.color })
    if (platform.end < 9000 && state.year > platform.end) add(platform.end, 11, 'retire', 'zzz', `${platform.label} sai de linha`, { sub: platform.maker, color: platform.color })
  }
  for (const rival of RIVALS) {
    if (rival.foundedYear > 1980) add(rival.foundedYear, 0, 'founded', 'building', `${rival.name} abre as portas`, { color: rival.color })
    if (isGone(rival, state)) add(rival.closedYear, 0, 'closed', 'door', `${rival.name} fecha as portas`, { color: rival.color })
  }
  for (const id of state.acquired ?? []) {
    const since = acquiredWeek(state, id)
    const rival = RIVAL_INDEX.get(id)
    if (since != null && rival) add(Math.floor(since / WEEKS_PER_YEAR), monthOfWeek(since % WEEKS_PER_YEAR), 'acquired', 'handshake', `Você compra a ${rival.name}`, { mine: true, color: rival.color })
  }
  // Os maiores sucessos de cada ano (série anual só entra se puxou a moda).
  const hitsInYear = new Map()
  for (const entry of sales) {
    if (entry.mine) {
      add(entry.year, entry.month, 'mine', 'cartridge', entry.title, { mine: true, score: entry.score, game: entry.game })
      continue
    }
    if (!(entry.trend || entry.lifetime >= HIT_COPIES) || (entry.annual && !entry.trend)) continue
    const count = hitsInYear.get(entry.year) ?? 0
    if (count >= HITS_PER_YEAR) continue
    hitsInYear.set(entry.year, count + 1)
    add(entry.year, entry.month, 'hit', 'star', entry.title, { sub: entry.studio, color: entry.color, score: entry.score })
  }
  for (const goty of state.goty ?? []) add(goty.year, 11, 'goty', 'trophy', goty.title, { sub: goty.studio ? `Jogo do Ano · ${goty.studio}` : 'Jogo do Ano', mine: Boolean(goty.mine), score: goty.score })
  // Mesmo mês: o que é seu vem primeiro.
  const weight = { mine: 0, acquired: 0, studio: 0, goty: 1, launch: 2, retire: 3, hit: 4, founded: 5, closed: 6, world: 7 }
  return items.sort((a, b) => b.year - a.year || b.month - a.month || weight[a.kind] - weight[b.kind])
}

const isGone = (rival, state) => rival.closedYear && rival.closedYear <= state.year && !state.acquired?.includes(rival.id)

export const TIMELINE_FILTERS = {
  all: () => true,
  mine: item => item.mine,
  consoles: item => item.kind === 'launch' || item.kind === 'retire',
  world: item => !item.mine && item.kind !== 'launch' && item.kind !== 'retire',
}

// Agrupa por ano mantendo a ordem.
export function groupByYear(items) {
  const groups = []
  for (const item of items) {
    const last = groups.at(-1)
    if (last?.year === item.year) last.items.push(item)
    else groups.push({ year: item.year, items: [item] })
  }
  return groups
}

// ---------- recordes ----------
// Campeão de vendas e de crítica de cada ano que já passou (e do ano corrente até agora).
export function yearRecords(state, sales = almanacSales(state)) {
  const years = new Map()
  for (const entry of sales) {
    let slot = years.get(entry.year)
    if (!slot) years.set(entry.year, slot = { year: entry.year, seller: null, critic: null })
    // sales vem do maior para o menor: o primeiro de cada ano é o campeão de vendas.
    slot.seller ??= entry
    if (!slot.critic || entry.score > slot.critic.score) slot.critic = entry
  }
  const goty = new Map((state.goty ?? []).map(item => [item.year, item]))
  return [...years.values()].map(slot => ({ ...slot, goty: goty.get(slot.year) ?? null })).sort((a, b) => b.year - a.year)
}

export function worldRecords(sales) {
  if (!sales.length) return null
  let critic = sales[0]
  for (const entry of sales) if (entry.score > critic.score) critic = entry
  return { seller: sales[0], critic }
}

export function playerRecords(state, sales = almanacSales(state), years = yearRecords(state, sales)) {
  const games = state.games ?? []
  if (!games.length) return null
  const top = key => games.reduce((best, game) => ((game[key] ?? 0) > (best[key] ?? 0) ? game : best), games[0])
  const best = sales.find(entry => entry.mine)
  return {
    released: games.length,
    bestScore: top('score'),
    bestSeller: top('sold'),
    bestRevenue: top('revenue'),
    totalCopies: games.reduce((sum, game) => sum + (game.sold ?? 0), 0),
    bestRank: best ? { rank: best.allTime, title: best.title } : null,
    goty: (state.goty ?? []).filter(item => item.mine).length,
    sellerCrowns: years.filter(year => year.seller?.mine).length,
    criticCrowns: years.filter(year => year.critic?.mine).length,
    numberOnes: state.stats?.chartNumberOnes ?? 0,
  }
}

// ---------- novidades para a doca ----------
// Consoles que chegaram depois da última visita ao almanaque.
export function almanacNews(state, seenWeek) {
  const now = nowWeek(state)
  let count = 0
  for (const platform of PLATFORMS) {
    const week = weekStamp(platform.year, platform.month * WEEKS_PER_MONTH)
    if (week > seenWeek && week <= now) count += 1
  }
  return count
}
