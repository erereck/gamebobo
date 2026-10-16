import { RIVALS, rivalTierAt } from '../data/content/rivals.js'
import { ALL_HISTORIC_GAMES, MAJOR_STUDIOS } from '../data/history.js'
import { unlockedGenres, unlockedThemes } from '../data/genres.js'
import { availablePlatforms } from '../data/platforms.js'
import { WEEKS_PER_YEAR, demandAt } from '../data/economy.js'
import { qualityCurve, tailWeeks, weeklyShare } from './sales.js'
import { generateTitle } from './titles.js'
import { clamp, gauss, int, pick } from './rng.js'

export function rollTrend(year, random = Math.random, techs = ['online']) {
  return {
    genre: pick(unlockedGenres(year, techs), random).id,
    theme: pick(unlockedThemes(year), random).id,
  }
}

const TIER = {
  1: { q: 60, spread: 12, reach: .6, fans: 1.1, gap: [20, 32] },
  2: { q: 66, spread: 10, reach: 1.2, fans: 1.3, gap: [15, 26] },
  3: { q: 71, spread: 9, reach: 2.2, fans: 1.6, gap: [11, 20] },
  4: { q: 75, spread: 8, reach: 3.5, fans: 2, gap: [8, 15] },
}

export const rivalById = id => RIVALS.find(item => item.id === id)
export const activeRivals = year => RIVALS.filter(rival => rival.foundedYear <= year && (!rival.closedYear || rival.closedYear > year))

// Empresa rival dona de um jogo real (formato antigo: studio era a id; novo: rivalId separado).
export const historicRival = entry => ('rivalId' in entry ? entry.rivalId : entry.studio) ?? null
export const isAnnual = entry => /^(fifa|pes|cod)-/.test(entry.id)
// Sucesso de verdade: puxou a moda ou passou de 8 milhões na vida toda (o mesmo corte do almanaque).
export const isRealHit = entry => Boolean(entry.trend) || entry.copies >= 8

// Marcos de cada ano, como na linha do tempo do almanaque: quem puxou a moda e os três maiores sucessos.
// Só eles viram linha no diário; o resto dos lançamentos reais fica no aviso.
const MARKS_PER_YEAR = 3
function yearMarks(list) {
  const marks = new Set()
  const counted = new Map()
  const hits = list.filter(entry => isRealHit(entry) && (!isAnnual(entry) || entry.trend)).sort((a, b) => b.copies - a.copies)
  for (const entry of hits) {
    const count = counted.get(entry.year) ?? 0
    if (!entry.trend && count >= MARKS_PER_YEAR) continue
    marks.add(entry.id)
    if (!entry.trend) counted.set(entry.year, count + 1)
  }
  return marks
}
const YEAR_MARKS = yearMarks(ALL_HISTORIC_GAMES)

// Indie do Ano: rival pequena (porte 1) é indie. Fora da lista de rivais, só quem vendeu pouco
// e não é editora grande (LucasArts, MicroProse... também não estão na lista e nunca foram indie).
const historicIndie = (entry, rival, year) => (rival ? rivalTierAt(rival, year) <= 1 : entry.copies < 3 && !MAJOR_STUDIOS.has(entry.studio))

// Quantos jogos reais cada empresa e cada ano têm. Quem tem jogo de verdade no período não inventa jogo.
const REAL_BY_YEAR = {}
const REAL_BY_RIVAL = new Map()
for (const entry of ALL_HISTORIC_GAMES) {
  if (isAnnual(entry)) continue
  REAL_BY_YEAR[entry.year] = (REAL_BY_YEAR[entry.year] ?? 0) + 1
  const rivalId = historicRival(entry)
  if (!rivalId) continue
  if (!REAL_BY_RIVAL.has(rivalId)) REAL_BY_RIVAL.set(rivalId, new Set())
  REAL_BY_RIVAL.get(rivalId).add(entry.year)
}
const busyWithReal = (rivalId, year) => {
  const years = REAL_BY_RIVAL.get(rivalId)
  return !!years && (years.has(year) || years.has(year - 1) || years.has(year + 1))
}

// Estúdio fora da lista de rivais ganha uma cor estável a partir do nome.
const STUDIO_COLORS = ['#3d5a80', '#9b2226', '#2a9d8f', '#6a4c93', '#e76f51', '#386641', '#bc6c25', '#0081a7', '#7b2cbf', '#588157']
const studioColor = name => STUDIO_COLORS[[...String(name)].reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) % 9973, 7) % STUDIO_COLORS.length]

function rivalGame(rival, state, tw, random) {
  const tier = TIER[rivalTierAt(rival, state.year)] ?? TIER[2]
  const year = state.year
  const genres = unlockedGenres(year, ['online'])
  const preferred = genres.filter(genre => rival.genres?.includes(genre.id))
  const genre = (preferred.length && random() < .7 ? pick(preferred, random) : pick(genres, random)).id
  const theme = pick(unlockedThemes(year), random).id
  const quality = clamp(tier.q + gauss(random) * tier.spread, 25, 99)
  const trendBoost = (state.market.trend.genre === genre ? 1.25 : 1)
  const copies = Math.round(demandAt(year) * qualityCurve(quality) * tier.reach * tier.fans * trendBoost * Math.exp(gauss(random) * .25))
  const platform = pick(availablePlatforms(state.year + state.week / WEEKS_PER_YEAR), random)
  return {
    id: `rg-${tw}-${rival.id}`,
    title: generateTitle(genre, theme, random, year),
    studio: rival.name,
    rivalId: rival.id,
    color: rival.color,
    genre,
    theme,
    platform: platform?.id ?? 'pc',
    quality,
    score: Math.round(clamp(quality / 10 + gauss(random) * .4, 1, 10) * 10) / 10,
    copies,
    sold: 0,
    weekly: 0,
    age: 0,
    tau: tailWeeks(quality),
    year,
    pillar: pick(['fun', 'art', 'sound', 'idea'], random),
  }
}

// Avança os rivais uma semana: lançamentos novos e vendas dos que estão na prateleira.
export function stepRivals(state, random = Math.random) {
  const tw = (state.year - 1980) * WEEKS_PER_YEAR + state.week
  const releases = []
  // Os jogos de verdade vêm primeiro. Os inventados só completam o volume da prateleira:
  // com mais empresas e mais lançamentos reais no ano, cada uma inventa menos.
  const crowd = Math.max(1, activeRivals(state.year).length / 12) * 1.3 * (1 + (REAL_BY_YEAR[state.year] ?? 0) / 40)
  releases.push(...releaseHistoric(state, tw))
  for (const slot of state.rivals) {
    const rival = rivalById(slot.id)
    if (!rival || rival.foundedYear > state.year || (rival.closedYear && rival.closedYear <= state.year) || state.acquired?.includes(rival.id)) continue
    slot.next -= 1
    if (slot.next <= 0 && busyWithReal(rival.id, state.year)) slot.next = 12
    else if (slot.next <= 0) {
      const tier = TIER[rivalTierAt(rival, state.year)] ?? TIER[2]
      slot.next = Math.round(int(tier.gap[0], tier.gap[1], random) * crowd)
      const game = rivalGame(rival, state, tw, random)
      state.rivalGames.push(game)
      releases.push(game)
    }
  }
  for (const game of state.rivalGames) {
    game.weekly = Math.round(game.copies * weeklyShare(game.age, game.tau))
    game.sold += game.weekly
    game.age += 1
  }
  // Mantém só o que ainda vende ou que pode concorrer aos prêmios do ano.
  // Na virada (semana 0) o ano já mudou, mas a cerimônia do ano que acabou ainda vai rodar:
  // o jogo de janeiro a março fica até a semana 1 para disputar o Jogo do Ano dele.
  const awardYear = state.week === 0 ? state.year - 1 : state.year
  state.rivalGames = state.rivalGames.filter(game => game.age < 40 || game.year >= awardYear)
  return releases
}

export const historicWeek = entry => (entry.year - 1980) * WEEKS_PER_YEAR + entry.month * 4
// Muda quando a lista de jogos reais muda; saves antigos recalculam onde a história está.
export const HISTORY_VERSION = 4

// Primeiro jogo histórico que ainda vai sair a partir de uma semana absoluta.
export function historyCursorFor(tw) {
  const index = ALL_HISTORIC_GAMES.findIndex(entry => historicWeek(entry) > tw)
  return index < 0 ? ALL_HISTORIC_GAMES.length : index
}

function releaseHistoric(state, tw) {
  const out = []
  if (state.historyVersion !== HISTORY_VERSION) {
    state.historyCursor = historyCursorFor(tw - 1)
    state.historyVersion = HISTORY_VERSION
  }
  while (state.historyCursor < ALL_HISTORIC_GAMES.length && historicWeek(ALL_HISTORIC_GAMES[state.historyCursor]) <= tw) {
    const entry = ALL_HISTORIC_GAMES[state.historyCursor]
    state.historyCursor += 1
    // Estúdio que você comprou não lança mais o próprio clássico: a história muda.
    const rivalId = historicRival(entry)
    if (rivalId && state.acquired?.includes(rivalId)) continue
    if (state.rivalGames.some(game => game.id === `hist-${entry.id}`)) continue
    const rival = rivalId ? rivalById(rivalId) : null
    const quality = entry.score * 10
    const studio = 'rivalId' in entry ? entry.studio : (rival?.name ?? entry.studio)
    const game = {
      id: `hist-${entry.id}`,
      title: entry.title,
      studio,
      rivalId,
      color: rival?.color ?? studioColor(studio),
      genre: entry.genre,
      theme: entry.theme,
      platform: entry.platform,
      quality,
      score: entry.score,
      copies: Math.round(entry.copies * 1e6 * .6),
      sold: 0,
      weekly: 0,
      age: 0,
      tau: tailWeeks(quality) + 2,
      year: state.year,
      pillar: entry.genre === 'ritmo' ? 'sound' : ['aventura', 'rpg', 'terror'].includes(entry.genre) ? 'art' : entry.genre === 'puzzle' || entry.genre === 'sandbox' ? 'idea' : 'fun',
      historic: true,
      annual: isAnnual(entry),
      trend: entry.trend,
      landmark: YEAR_MARKS.has(entry.id),
      indie: historicIndie(entry, rival, state.year),
    }
    state.rivalGames.push(game)
    out.push(game)
  }
  return out
}

export function computeChart(state) {
  const entries = [
    ...state.rivalGames.filter(game => game.weekly > 0).map(game => ({ id: game.id, title: game.title, studio: game.studio, weekly: game.weekly, color: game.color, mine: false, score: game.score, platform: game.platform, real: !!game.historic })),
    ...state.games.filter(game => game.onMarket && game.weekly > 0).map(game => ({ id: game.id, title: game.title, studio: state.studio.name, weekly: game.weekly, color: '#ff5d3a', mine: true, score: game.score, platform: game.platforms?.[0] ?? game.platform })),
  ]
  entries.sort((a, b) => b.weekly - a.weekly)
  // Sobe, desce, estreia: a parada lembra da semana anterior como uma revista de verdade.
  const before = new Map((state.chart ?? []).map(entry => [entry.id, entry]))
  return entries.slice(0, 10).map((entry, index) => {
    const prev = before.get(entry.id)
    const rank = index + 1
    return {
      ...entry,
      rank,
      move: prev ? prev.rank - rank : null,
      weeks: (prev?.weeks ?? 0) + 1,
      topWeeks: rank === 1 ? (prev?.rank === 1 ? (prev.topWeeks ?? 1) + 1 : 1) : 0,
    }
  })
}
