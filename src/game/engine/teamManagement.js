import { subsidiaryForId } from '../data/subsidiaryStudios.js'
import { clamp, makeId } from './utils.js'
import { modeAllowsHiring, modeProductionPaceMultiplier } from './gameModes.js'

export const MAIN_PRODUCTION_TEAM_ID = 'founder'

const assignedTeamId = person => person.productionTeamId ?? MAIN_PRODUCTION_TEAM_ID

function subsidiaryAssignments(state) {
  const units = []
  ;(state.studio.subsidiaries ?? []).forEach(owned => {
    const studio = subsidiaryForId(owned.studioId)
    if (!studio) return
    for (let index = 0; index < studio.capacity; index += 1) {
      units.push({
        id: `${studio.id}-${index + 1}`,
        name: studio.capacity > 1 ? `${studio.name} · time ${index + 1}` : studio.name,
        kind: 'subsidiary',
        subsidiaryId: studio.id,
        specialty: studio.specialty,
        baseSkill: studio.skill,
        nativeMembers: 3,
      })
    }
  })
  return units
}

export function teamAssignmentUnits(state) {
  const internal = (state.studio.productionTeams ?? []).map(team => ({
    id: team.id,
    name: team.name,
    kind: 'internal',
    internal: true,
    createdYear: team.createdYear,
  }))
  return [
    { id: MAIN_PRODUCTION_TEAM_ID, name: 'Equipe principal', kind: 'main', main: true },
    ...internal,
    ...subsidiaryAssignments(state),
  ]
}

export function staffForProductionUnit(state, unitId = MAIN_PRODUCTION_TEAM_ID) {
  return (state.studio.team ?? []).filter(person => assignedTeamId(person) === unitId)
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

function founderSkill(state) {
  return average([state.player.stats.programming, state.player.stats.design, state.player.stats.art])
}

function paceFor(memberCount, skill, subsidiary = false) {
  if (memberCount <= 0) return 0
  const headcount = Math.log2(memberCount + 1) * .22
  const skillBonus = clamp((skill - 60) / 180, -.12, .24)
  return clamp(.86 + headcount + skillBonus + (subsidiary ? .04 : 0), .72, 2.5)
}

export function productionUnits(state) {
  const modePace = modeProductionPaceMultiplier(state)
  return teamAssignmentUnits(state).map(team => {
    const members = staffForProductionUnit(state, team.id)
    let memberCount = members.length
    let skill = average(members.map(person => person.skill))

    if (team.main) {
      memberCount += 1
      skill = average([founderSkill(state), ...members.map(person => person.skill)])
    } else if (team.subsidiaryId) {
      const nativeMembers = team.nativeMembers ?? 3
      memberCount += nativeMembers
      skill = average([
        ...Array.from({ length: nativeMembers }, () => team.baseSkill ?? 65),
        ...members.map(person => person.skill),
      ])
    }

    const roundedSkill = Math.round(skill || 0)
    const pace = paceFor(memberCount, roundedSkill, Boolean(team.subsidiaryId)) * modePace
    return {
      ...team,
      members,
      assignedMembers: members.length,
      memberCount,
      skill: roundedSkill,
      pace,
      canWork: memberCount > 0,
    }
  })
}

export function productionUnitForId(state, unitId) {
  return productionUnits(state).find(unit => unit.id === unitId) ?? null
}

export function productionPaceForUnit(state, unitId) {
  return productionUnitForId(state, unitId)?.pace ?? 0
}

export function createProductionTeam(state) {
  if (!modeAllowsHiring(state)) return null
  state.studio.productionTeams ??= []
  const number = state.studio.productionTeams.length + 2
  const team = {
    id: makeId('team'),
    name: `Equipe ${number}`,
    createdYear: state.date.year,
  }
  state.studio.productionTeams.push(team)
  return team
}

export function assignTeamMember(state, personId, productionTeamId) {
  const person = (state.studio.team ?? []).find(item => item.id === personId)
  if (!person) return null
  const target = teamAssignmentUnits(state).find(unit => unit.id === productionTeamId)
  if (!target) return null
  const previous = assignedTeamId(person)
  person.productionTeamId = target.id
  return { person, previous, target }
}

export function normalizeProductionTeams(state) {
  state.studio.productionTeams ??= []
  state.studio.team = (state.studio.team ?? []).map(person => ({
    ...person,
    productionTeamId: person.productionTeamId ?? MAIN_PRODUCTION_TEAM_ID,
  }))
  return state
}
