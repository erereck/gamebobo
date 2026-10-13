import { EVENTS as BASE_EVENTS } from '../data/content/events.js'
import { REAL_EVENTS } from '../data/content/realEvents.js'
import { IDEAS } from '../data/content/ideas.js'
import { platformById } from '../data/platforms.js'
import { activeRivals } from './market.js'
import { absWeek } from './state.js'
import { genreById, themeById } from '../data/genres.js'
import { pick, weighted } from './rng.js'

const REPEAT_AFTER = 48 * 7
export const EVENTS = [...BASE_EVENTS, ...REAL_EVENTS]

export function eventContext(state, random = Math.random) {
  const employees = state.staff.filter(person => !person.founder && person.status === 'ok')
  const founder = state.staff.find(person => person.founder)
  const rivals = activeRivals(state.year)
  return {
    staffId: employees.length ? pick(employees, random).id : null,
    founder: founder?.name ?? 'Você',
    studio: state.studio.name,
    game: state.project?.kind === 'game' ? state.project.title : null,
    lastgame: state.games.at(-1)?.title ?? null,
    rival: rivals.length ? pick(rivals, random).name : 'a concorrência',
    platform: state.project?.platform ? platformById(state.project.platform)?.label : null,
  }
}

export function fillText(text, state, ctx = {}) {
  if (!text) return text
  const staffName = ctx.staffId ? state.staff.find(person => person.id === ctx.staffId)?.name : null
  return text
    .replaceAll('{staff}', staffName ?? 'alguém da equipe')
    .replaceAll('{name}', staffName ?? ctx.name ?? 'alguém')
    .replaceAll('{founder}', ctx.founder ?? 'Você')
    .replaceAll('{studio}', ctx.studio ?? state.studio.name)
    .replaceAll('{game}', ctx.game ?? 'o jogo')
    .replaceAll('{lastgame}', ctx.lastgame ?? 'o último jogo')
    .replaceAll('{rival}', ctx.rival ?? 'a concorrência')
    .replaceAll('{platform}', ctx.platform ?? 'a plataforma')
    .replaceAll('{genre}', ctx.genre ?? '')
    .replaceAll('{theme}', ctx.theme ?? '')
}

function matches(event, state) {
  const when = event.when ?? {}
  const phase = state.project?.kind === 'game' ? 'dev' : 'idle'
  if (when.phase && when.phase !== 'any' && when.phase !== phase) return false
  if (when.minYear && state.year < when.minYear) return false
  if (when.maxYear && state.year > when.maxYear) return false
  const count = state.staff.filter(person => person.status === 'ok').length
  if (when.minStaff && count < when.minStaff) return false
  if (when.maxStaff && count > when.maxStaff) return false
  if (when.minFans && state.fans < when.minFans) return false
  if (when.minGames && state.games.length < when.minGames) return false
  if (when.needsDecor && !state.decor.includes(when.needsDecor)) return false
  if (when.minOffice && state.office < when.minOffice) return false
  const seen = state.seenEvents[event.id]
  if (seen !== undefined) {
    if (event.funny) return false
    if (absWeek(state) - seen < REPEAT_AFTER) return false
  }
  return true
}

export function pickEvent(state, random = Math.random) {
  const pool = EVENTS.filter(event => matches(event, state))
  return weighted(pool, event => (event.weight ?? 1) * (event.funny ? 2.6 : 1), random)
}

export function pickIdea(state, random = Math.random) {
  const project = state.project
  if (!project || project.kind !== 'game') return null
  const pool = IDEAS.filter(idea => (idea.minYear ?? 0) <= state.year && (idea.maxYear ?? 9999) >= state.year && state.seenEvents[`idea:${idea.id}`] === undefined)
  return weighted(pool, idea => (idea.genres?.includes(project.genre) ? 3 : 1), random)
}

export const eventById = id => EVENTS.find(event => event.id === id)
export const ideaById = id => IDEAS.find(idea => idea.id === id)

export function projectLabels(project) {
  return { genre: genreById(project?.genre)?.label ?? '', theme: themeById(project?.theme)?.label ?? '' }
}
