import { GENRES, PLATFORMS } from '../data/catalog.js'
import { createInitialState } from '../engine/state.js'
import { makeId } from '../engine/utils.js'

const genreMap = { RPG: 'rpg', Ação: 'action', Estratégia: 'strategy', Puzzle: 'puzzle', Simulação: 'simulation', Esporte: 'sports', Terror: 'horror' }
const platformMap = { PC: 'pc', PlayBox: 'playstation-2', Ninvento: 'gamecube' }
const themeMap = { Fantasia: 'fantasy', Cyberpunk: 'cyberpunk', Futebol: 'football', Escola: 'school', Crime: 'crime', Espaço: 'space', Romance: 'romance' }
const focusMap = { Gameplay: 'gameplay', História: 'story', Visual: 'visual', Inovação: 'innovation', Multiplayer: 'multiplayer' }
const scaleMap = { Micro: 'micro', Pequeno: 'small', Médio: 'medium' }

const migrateProject = (oldProject, franchiseId = makeId('franchise')) => ({
  ...oldProject,
  id: makeId('project'),
  genre: genreMap[oldProject.genre] ?? 'puzzle',
  theme: themeMap[oldProject.theme] ?? 'fantasy',
  focus: focusMap[oldProject.focus] ?? 'gameplay',
  platform: platformMap[oldProject.platform] ?? 'pc',
  scale: scaleMap[oldProject.scale] ?? 'small',
  franchiseId,
  franchiseName: oldProject.title,
  isSequel: false,
  progress: oldProject.monthsDone ?? 0,
  totalMonths: oldProject.totalMonths ?? 5,
  estimatedCost: oldProject.baseCost ?? 9200,
  costSpent: oldProject.costSpent ?? 0,
  quality: oldProject.qualityBonus ?? 0,
  innovation: oldProject.innovationBonus ?? 0,
  reach: 0,
  pressure: oldProject.pressure ?? 8,
  eventIds: oldProject.eventIds ?? [],
  story: oldProject.story ?? null,
})

export function migrateV1(oldState) {
  const state = createInitialState()
  state.date = { month: oldState.month ?? 0, year: oldState.year ?? 2003 }
  state.player.age = oldState.age ?? 21
  state.player.money = oldState.money ?? 12800
  state.player.energy = oldState.energy ?? 100
  state.player.followers = oldState.followers ?? 12
  state.player.reputation = oldState.reputation ?? 0
  state.player.stats = {
    programming: oldState.stats?.programacao ?? 52,
    art: oldState.stats?.arte ?? 24,
    design: oldState.stats?.design ?? 61,
    marketing: oldState.stats?.marketing ?? 18,
    charisma: 40,
  }

  state.games = (oldState.games ?? []).map(oldGame => {
    const genre = genreMap[oldGame.genre] ?? 'puzzle'
    const platform = platformMap[oldGame.platform] ?? 'pc'
    const franchiseId = makeId('franchise')
    return {
      ...oldGame,
      id: makeId('game'),
      genre,
      platform,
      theme: themeMap[oldGame.theme] ?? 'fantasy',
      focus: focusMap[oldGame.focus] ?? 'gameplay',
      scale: scaleMap[oldGame.scale] ?? 'small',
      franchiseId,
      franchiseName: oldGame.title,
      initialSales: oldGame.sales ?? 0,
      initialRevenue: oldGame.revenue ?? 0,
      newFollowers: 0,
      initialFollowers: 0,
      price: 24,
      royalty: 0.88,
      trust: 50,
      supportEvents: [],
    }
  })
  if (oldState.currentProject) state.currentProject = migrateProject(oldState.currentProject)

  state.history = (oldState.history ?? state.history).map(item => ({
    id: makeId('history'),
    date: item.date,
    title: item.title,
    body: item.copy ?? item.body ?? '',
    highlight: Boolean(item.highlight),
    kind: 'legacy',
  }))

  state.player.audience.genres = Object.fromEntries(GENRES.map(item => [item.id, 0]))
  state.player.audience.platforms = Object.fromEntries(PLATFORMS.map(item => [item.id, 0]))
  state.games.forEach(game => {
    state.player.audience.genres[game.genre] += Math.round(state.player.followers / Math.max(1, state.games.length))
    state.player.audience.platforms[game.platform] += Math.round(state.player.followers / Math.max(1, state.games.length))
  })
  state.meta.migratedFrom = 1
  return state
}

export function migrateV2(oldState) {
  const state = hydrateV3(oldState)
  state.meta.migratedFrom = 2
  return state
}

export function migrateV3(oldState) {
  const state = hydrateV4(oldState)
  const legacyIds = { playbox: 'playstation-2', ninvento: 'gamecube', pocket: 'nintendo-ds', cloudbox: 'pc', neural: 'pc' }
  if (state.currentProject?.platform in legacyIds) state.currentProject.platform = legacyIds[state.currentProject.platform]
  state.games.forEach(game => { if (game.platform in legacyIds) game.platform = legacyIds[game.platform] })
  Object.entries(legacyIds).forEach(([oldId, newId]) => {
    if (oldId in state.market.platforms) {
      state.market.platforms[newId] = (state.market.platforms[newId] ?? 0) + state.market.platforms[oldId]
      delete state.market.platforms[oldId]
    }
    if (oldId in state.player.audience.platforms) {
      state.player.audience.platforms[newId] = (state.player.audience.platforms[newId] ?? 0) + state.player.audience.platforms[oldId]
      delete state.player.audience.platforms[oldId]
    }
  })
  state.meta.migratedFrom = 3
  return state
}

export function hydrateV4(oldState) {
  const startYear = oldState.meta?.startYear ?? oldState.studio?.founded ?? 2003
  const fresh = createInitialState({ startYear })
  const state = hydrateV3({ ...oldState, schema: 3 })
  state.schema = 4
  state.meta = { ...fresh.meta, ...state.meta, startYear }
  state.licenses = {
    ...fresh.licenses,
    ...(oldState.licenses ?? {}),
    catalog: Object.fromEntries(Object.entries(fresh.licenses.catalog).map(([id, value]) => [id, { ...value, ...(oldState.licenses?.catalog?.[id] ?? {}), history: oldState.licenses?.catalog?.[id]?.history ?? value.history }])),
    active: oldState.licenses?.active ?? [],
    offers: oldState.licenses?.offers ?? [],
    exclusives: oldState.licenses?.exclusives ?? [],
    auctions: oldState.licenses?.auctions ?? [],
    negotiations: oldState.licenses?.negotiations ?? [],
  }
  state.world = {
    ...fresh.world,
    ...state.world,
    seenHistoricalMilestones: oldState.world?.seenHistoricalMilestones ?? fresh.world.seenHistoricalMilestones,
  }
  const knownGenreIds = new Set(state.world.knownGenres.map(item => item.id))
  fresh.world.knownGenres.forEach(genre => { if (!knownGenreIds.has(genre.id)) state.world.knownGenres.push(genre) })
  if (state.currentProject) state.currentProject = { licenseIds: [], licenseNames: [], licenseRoyalty: 0, licenseEventIds: [], ...state.currentProject }
  state.games = state.games.map(game => ({ licenseIds: [], licenseNames: [], licenseRoyalty: 0, ...game }))
  return state
}

export function hydrateV5(oldState) {
  const startYear = oldState.meta?.startYear ?? oldState.studio?.founded ?? 2003
  const fresh = createInitialState({ startYear })
  const state = hydrateV4({ ...oldState, schema: 4 })
  state.schema = 5
  state.meta = { ...state.meta, startYear }
  Object.entries(fresh.licenses.catalog).forEach(([id, dynamic]) => {
    state.licenses.catalog[id] ??= dynamic
  })
  if (!state.competitors.some(studio => studio.cohort)) {
    state.competitors.push(...fresh.competitors.filter(studio => studio.cohort))
  }
  state.competitors.forEach(studio => {
    studio.games = (studio.games ?? []).map(game => ({ age: 0, initialSales: game.sales, breakout: false, ...game }))
  })
  return state
}

export function migrateV4(oldState) {
  const state = hydrateV5(oldState)
  state.meta.migratedFrom = 4
  return state
}

export function hydrateV6(oldState) {
  const startYear = oldState.meta?.startYear ?? oldState.studio?.founded ?? 2003
  const fresh = createInitialState({ startYear })
  const state = hydrateV5({ ...oldState, schema: 5 })
  state.schema = 6
  state.corporate = {
    ...fresh.corporate,
    ...(oldState.corporate ?? {}),
    relationships: Object.fromEntries(Object.entries(fresh.corporate.relationships).map(([id, relation]) => [id, { ...relation, ...(oldState.corporate?.relationships?.[id] ?? {}) }])),
    offers: oldState.corporate?.offers ?? [],
    partnerships: oldState.corporate?.partnerships ?? [],
    archive: oldState.corporate?.archive ?? [],
    activeCommission: oldState.corporate?.activeCommission ?? null,
    ownership: oldState.corporate?.ownership ?? null,
  }
  state.studio.parentCompany ??= null
  state.studio.autonomy ??= 100
  state.settings = { ...fresh.settings, ...(oldState.settings ?? {}) }
  if (state.currentProject) state.currentProject = { corporateCommissionId: null, ...state.currentProject }
  state.games = state.games.map(game => ({ corporateCommissionId: null, ...game }))
  return state
}

export function migrateV5(oldState) {
  const state = hydrateV6(oldState)
  state.meta.migratedFrom = 5
  return state
}

export function hydrateV3(oldState) {
  const fresh = createInitialState()
  const state = {
    ...fresh,
    ...oldState,
    schema: 3,
    meta: { ...fresh.meta, ...oldState.meta },
    player: {
      ...fresh.player,
      ...oldState.player,
      career: { ...fresh.player.career, ...(oldState.player?.career ?? {}) },
      audience: {
        ...fresh.player.audience,
        ...(oldState.player?.audience ?? {}),
        genres: { ...fresh.player.audience.genres, ...(oldState.player?.audience?.genres ?? {}) },
        platforms: { ...fresh.player.audience.platforms, ...(oldState.player?.audience?.platforms ?? {}) },
      },
    },
    studio: { ...fresh.studio, ...(oldState.studio ?? {}) },
    world: { ...fresh.world, ...(oldState.world ?? {}) },
    opportunities: { ...fresh.opportunities, ...(oldState.opportunities ?? {}) },
    awards: { ...fresh.awards, ...(oldState.awards ?? {}) },
  }
  state.player.generation ??= 1
  state.studio.leaders ??= [{ name: state.player.name, generation: 1, from: state.studio.founded ?? 2003, to: null, legacy: 'Fundador' }]
  if (state.currentProject) {
    state.currentProject = {
      hype: 0, announced: false, announcementDate: null, launchPlan: 'shadow', launchSpend: 0, launchPlansUsed: [], publisher: null,
      directSales: 0, directMargin: 0, expectation: franchiseExpectationFromGames(state.games, state.currentProject.franchiseId),
      ...state.currentProject,
    }
  }
  state.games = state.games.map(game => ({ rivals: [], createdGenre: null, publisher: null, hype: 0, expectation: 0, ...game }))
  state.competitors = state.competitors.map(studio => ({
    relationScore: studio.relation === 'rival' ? -32 : studio.relation === 'friendly' ? 28 : 0,
    meetings: 0,
    ...studio,
  }))
  return state
}

const franchiseExpectationFromGames = (games, franchiseId) => {
  const related = games.filter(game => game.franchiseId === franchiseId).slice(0, 3)
  if (!related.length) return 0
  return Math.round(related.reduce((sum, game) => sum + game.score, 0) / related.length)
}
