import { FOUNDER_PROFILES } from '../data/staff.js'
import { START_MONEY, TECHS, WEEKS_PER_YEAR, eraSkillFactor, moneyScale } from '../data/economy.js'
import { RIVALS } from '../data/content/rivals.js'
import { createFounder, randomLook } from './staff.js'
import { createCandidate, createCandidates } from './staff.js'
import { PUBLISHERS, modeById } from '../data/modes.js'
import { genreById, unlockedGenres, unlockedThemes } from '../data/genres.js'
import { modeStartMoney } from './modes.js'
import { HISTORY_VERSION, historyCursorFor, rollTrend } from './market.js'
import { generateFreelas } from './freelas.js'
import { clamp, int, pick } from './rng.js'

export const SAVE_SCHEMA = 100

export const absWeek = state => (state.year - 1980) * WEEKS_PER_YEAR + state.week
export const yearFloat = state => state.year + state.week / WEEKS_PER_YEAR
export const scaled = (state, value) => Math.round(value * moneyScale(yearFloat(state)))

export function createGame(options = {}, random = Math.random) {
  const year = clamp(Number(options.startYear) || 1980, 1980, 2030)
  const mode = modeById(options.modeId)
  const profile = FOUNDER_PROFILES.find(item => item.id === options.profileId) ?? FOUNDER_PROFILES[0]
  const founderName = String(options.founderName || 'Você').trim().slice(0, 22) || 'Você'
  const studioName = String(options.studioName || 'Estúdio Bobo').trim().slice(0, 28) || 'Estúdio Bobo'
  const look = { ...randomLook(random), ...(options.look ?? {}) }
  const founder = createFounder({ name: founderName, profile, look })
  const factor = eraSkillFactor(year)
  for (const key of Object.keys(founder.skills)) founder.skills[key] = Math.round(founder.skills[key] * factor)
  // Quem começa tarde herda as ferramentas que a indústria já tinha.
  const techs = TECHS.filter(tech => tech.year <= year - 1).map(tech => tech.id)

  const state = {
    schema: SAVE_SCHEMA,
    id: `career-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    studio: { name: studioName, founded: year, profile: profile.id },
    year,
    week: 0,
    startYear: year,
    money: Math.round(START_MONEY * moneyScale(year) * modeStartMoney(mode.id)),
    mode: { id: mode.id, franchise: null, parent: null, brief: null },
    slot: options.slot ?? 1,
    fans: 0,
    rp: 0,
    legacy: 0,
    office: 0,
    decor: [],
    techs,
    kits: ['pc'],
    staff: [founder],
    candidates: createCandidates(year, 0, random),
    projects: [],
    teams: [{ id: 'main', name: 'Equipe principal' }],
    acquired: [],
    acquiredAt: {},
    goty: [],
    games: [],
    franchises: {},
    combos: {},
    market: { trend: rollTrend(year, random), nextTrend: null, trendUntil: 0 },
    rivals: RIVALS.map(rival => ({ id: rival.id, next: int(2, 30, random) })),
    rivalGames: [],
    chart: [],
    freelas: [],
    ideas: [],
    couples: [],
    visitor: null,
    buffs: { score: 0, sales: 1 },
    queue: [],
    toasts: [],
    fx: [],
    log: [],
    trophies: [],
    achievements: [],
    seenEvents: {},
    stats: {
      gamesReleased: 0, totalCopies: 0, totalRevenue: 0, bestScore: 0, bestCopies: 0, awardsWon: 0, hallOfFame: 0,
      perfectGames: 0, chartNumberOnes: 0, sequelsReleased: 0, freelasDone: 0, bankruptcies: 0, crunchWeeks: 0,
      researchDone: 0, flops: 0, ideasAccepted: 0, eventsSeen: 0, cameloDeals: 0, interviews: 0, spicyWins: 0, spicyLosses: 0,
    },
    debtMonths: 0,
    loan: null,
    lastEventWeek: -10,
    lastCamelo: 0,
    settings: { sound: true, music: true, musicVolume: .22, speed: 1 },
  }
  state.market.trendUntil = absWeek(state) + int(20, 34, random)
  state.lastEventWeek = absWeek(state) + 3
  state.historyCursor = historyCursorFor(absWeek(state) - 1)
  state.historyVersion = HISTORY_VERSION
  state.lastCamelo = absWeek(state) + 10
  state.freelas = generateFreelas(state, random)
  // Portátil em janeiro de 1980: espera o Game & Watch chegar às lojas.
  if (mode.id === 'portatil' && year === 1980) state.week = 12
  if (mode.id === 'adquirido') startAcquired(state, random)
  return state
}

export const MAX_LOG = 40
export function log(state, icon, text) {
  state.log.unshift({ icon, text, at: `${state.year}·${state.week}` })
  if (state.log.length > MAX_LOG) state.log.length = MAX_LOG
}

export function toast(state, toastItem) {
  state.toasts.push({ id: `t${absWeek(state)}-${state.toasts.length}-${Math.random().toString(36).slice(2, 6)}`, ...toastItem })
  if (state.toasts.length > 6) state.toasts.splice(0, state.toasts.length - 6)
}

export const fx = (state, item) => state.fx.push(item)

// Estúdio Adquirido: começa numa garagem com três pessoas e uma dona exigente.
function startAcquired(state, random) {
  const owners = PUBLISHERS.filter(publisher => publisher.from <= state.year && publisher.to >= state.year && !publisher.indie)
  const parent = pick(owners, random)
  state.mode.parent = { id: parent.id, name: parent.name }
  state.office = 2
  for (const focus of ['fun', 'art', 'idea']) {
    const person = createCandidate(state.year, 120, random, focus)
    state.staff.push(person)
  }
  newBrief(state, random)
}

// Encomenda da dona: um gênero e um tema que pagam bônus se você entregar.
export function newBrief(state, random = Math.random) {
  if (!state.mode?.parent) return
  const genre = pick(unlockedGenres(state.year, state.techs), random)
  const theme = pick(unlockedThemes(state.year), random)
  state.mode.brief = { genre: genre.id, theme: theme.id, bonus: 6000 + state.office * 6000 }
}
