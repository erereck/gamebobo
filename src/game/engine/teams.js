import { RIVALS, rivalTierAt } from '../data/content/rivals.js'
import { ALL_HISTORIC_GAMES } from '../data/history.js'
import { OFFICES } from '../data/economy.js'
import { createCandidate } from './staff.js'
import { absWeek, log, scaled, toast } from './state.js'
import { historicRival, historicWeek } from './market.js'
import { allowsAcquire } from './modes.js'
import { pick } from './rng.js'

export const MAIN_TEAM = 'main'
export const teamOf = person => person.team ?? MAIN_TEAM
export const teamById = (state, id) => state.teams?.find(team => team.id === id) ?? null
export const isRemoteTeam = (state, id) => Boolean(teamById(state, id)?.remote)
export const isRemote = (state, person) => isRemoteTeam(state, teamOf(person))
export const localStaff = state => state.staff.filter(person => !isRemote(state, person))
export const teamMembers = (state, teamId, onlyActive = true) => state.staff.filter(person => teamOf(person) === teamId && (!onlyActive || person.status === 'ok'))
export const projectOfTeam = (state, teamId) => state.projects.find(project => project.teamId === teamId) ?? null
export const projectOfStaff = (state, staffId) => {
  const person = state.staff.find(item => item.id === staffId)
  return person ? projectOfTeam(state, teamOf(person)) : null
}
export const freeTeams = state => state.teams.filter(team => !projectOfTeam(state, team.id) && teamMembers(state, team.id).length > 0)
export const hasDeskFor = state => localStaff(state).length < OFFICES[state.office].cap

export function createTeam(state) {
  const number = state.teams.filter(team => !team.remote).length + 1
  const team = { id: `team-${absWeek(state)}-${number}-${Math.random().toString(36).slice(2, 6)}`, name: `Equipe ${number}` }
  state.teams.push(team)
  return team
}

// Mover alguém entre equipes. Ir para um estúdio comprado libera a mesa no escritório.
export function moveToTeam(state, staffId, teamId) {
  const person = state.staff.find(item => item.id === staffId)
  const target = teamById(state, teamId)
  if (!person || !target || teamOf(person) === teamId) return false
  if (!target.remote && isRemote(state, person) && !hasDeskFor(state)) return false
  person.team = teamId
  state.ideas = state.ideas.filter(idea => idea.staffId !== staffId)
  return true
}

const upcomingHits = (state, rivalId) => ALL_HISTORIC_GAMES.filter(entry => historicRival(entry) === rivalId && historicWeek(entry) > absWeek(state) && !entry.id.match(/^(fifa|pes|cod)-/)).length

export function acquisitionPrice(state, rival) {
  const tier = rivalTierAt(rival, state.year)
  return scaled(state, ({ 1: 70000, 2: 260000 })[tier] * (1 + upcomingHits(state, rival.id) * .6))
}

export function buyableStudios(state) {
  if (!allowsAcquire(state)) return []
  return RIVALS.filter(rival => rival.foundedYear <= state.year && (!rival.closedYear || rival.closedYear > state.year)
    && rivalTierAt(rival, state.year) <= 2 && !state.acquired.includes(rival.id))
}

export function acquireStudio(state, rivalId, random = Math.random) {
  const rival = RIVALS.find(item => item.id === rivalId)
  if (!rival || !buyableStudios(state).includes(rival)) return false
  const price = acquisitionPrice(state, rival)
  if (state.money < price) return false
  state.money -= price
  state.acquired.push(rival.id)
  const team = { id: `sub-${rival.id}`, name: rival.name, remote: true, rivalId: rival.id, color: rival.color }
  state.teams.push(team)
  const count = rivalTierAt(rival, state.year) >= 2 ? 4 : 3
  for (let i = 0; i < count; i += 1) {
    const focus = pick(['fun', 'art', 'sound', 'idea'], random)
    const person = createCandidate(state.year, state.legacy + 200, random, focus)
    person.team = team.id
    person.native = true
    state.staff.push(person)
  }
  toast(state, { kind: 'great', icon: 'building', title: `${rival.name} agora é sua`, sub: `${count} pessoas na equipe` })
  log(state, 'building', `Comprou a ${rival.name}`)
  return true
}
