import { GENRES, PLATFORMS } from '../data/catalog.js'
import { createInitialState } from '../engine/state.js'
import { MAIN_PRODUCTION_TEAM_ID, normalizeProductionTeams } from '../engine/teamManagement.js'
import { hydrateV6 } from './migrate.js'

const legacyOfficeLevels = { 0: 0, 1: 2, 2: 4, 3: 6, 4: 8 }

const productionDefaults = project => ({
  projectType: project?.isSequel ? 'sequel' : 'original',
  genres: project?.genre ? [project.genre] : ['rpg'],
  themes: project?.theme ? [project.theme] : ['fantasy'],
  platforms: project?.platform ? [project.platform] : ['pc'],
  delegatedPlatformIds: [],
  productionUnitId: 'founder',
  productionUnitName: 'Equipe principal',
  sourceGameIds: [],
  sourceTitles: [],
  accessoryId: null,
  controlScheme: 'standard',
  legacyQuality: 0,
  legacyHype: 0,
  demo: null,
  publisherDeclines: 0,
  ...project,
})

function hydrateProductionTeams(state, oldState, startYear) {
  const explicitTeams = oldState.studio?.productionTeams
  state.studio.productionTeams = Array.isArray(explicitTeams) ? explicitTeams : []
  normalizeProductionTeams(state)

  if (Array.isArray(explicitTeams)) return

  const legacyUnitIds = [...new Set([
    oldState.currentProject?.productionUnitId,
    ...(oldState.parallelProjects ?? []).map(project => project.productionUnitId),
  ].filter(id => /^internal-\d+$/.test(id ?? '')))]

  legacyUnitIds.forEach((id, index) => {
    state.studio.productionTeams.push({ id, name: `Equipe ${index + 2}`, createdYear: startYear })
    state.studio.team.slice(index * 4, index * 4 + 4).forEach(person => { person.productionTeamId = id })
  })

  state.studio.team.forEach(person => { person.productionTeamId ??= MAIN_PRODUCTION_TEAM_ID })
}

export function hydrateV7(oldState) {
  const startYear = oldState.meta?.startYear ?? oldState.studio?.founded ?? 2003
  const fresh = createInitialState({ startYear })
  const state = hydrateV6({ ...oldState, schema: 6 })
  state.schema = 7
  state.meta = { ...fresh.meta, ...state.meta, startYear }

  if ((oldState.schema ?? 0) <= 6) state.studio.officeLevel = legacyOfficeLevels[oldState.studio?.officeLevel ?? state.studio.officeLevel] ?? state.studio.officeLevel
  state.studio.subsidiaries = oldState.studio?.subsidiaries ?? []
  hydrateProductionTeams(state, oldState, startYear)
  state.opportunities = { ...fresh.opportunities, ...state.opportunities, publisherArchive: oldState.opportunities?.publisherArchive ?? [] }
  state.awards = { ...fresh.awards, ...state.awards, yearlyWinners: oldState.awards?.yearlyWinners ?? [] }
  state.world = {
    ...fresh.world,
    ...state.world,
    seenGameEventCards: oldState.world?.seenGameEventCards ?? [],
    seenIndustryShocks: oldState.world?.seenIndustryShocks ?? [],
    activeIndustryEffects: oldState.world?.activeIndustryEffects ?? [],
  }
  state.parallelProjects = (oldState.parallelProjects ?? []).map(project => productionDefaults(project))
  state.currentProject = state.currentProject ? productionDefaults(state.currentProject) : null
  state.games = state.games.map(game => productionDefaults(game))

  state.player.audience.genres = { ...Object.fromEntries(GENRES.map(item => [item.id, 0])), ...(state.player.audience.genres ?? {}) }
  state.player.audience.platforms = { ...Object.fromEntries(PLATFORMS.map(item => [item.id, 0])), ...(state.player.audience.platforms ?? {}) }
  return state
}

export function migrateV6(oldState) {
  const state = hydrateV7(oldState)
  state.meta.migratedFrom = 6
  return state
}
