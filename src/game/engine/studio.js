import { CULTURES, OFFICES, PERSONALITIES, ROLES, TEAM_NAMES, TEAM_SURNAMES } from '../data/team.js'
import { TECHS, getEra } from '../data/eras.js'
import { clamp, makeId, randomChoice, randomInt } from './utils.js'

export function generateCandidate(state, random = Math.random) {
  const role = randomChoice(ROLES, random)
  const personality = randomChoice(PERSONALITIES, random)
  const skill = randomInt(38, 76, random) + Math.min(12, Math.floor((state.date.year - 2003) / 3))
  const salary = Math.round(role.salary * (0.72 + skill / 100) / 100 * 100)
  return {
    id: makeId('person'),
    name: `${randomChoice(TEAM_NAMES, random)} ${randomChoice(TEAM_SURNAMES, random)}`,
    roleId: role.id,
    personalityId: personality.id,
    skill: clamp(skill, 30, 94),
    potential: clamp(skill + randomInt(5, 22, random), 45, 99),
    salary,
    morale: randomInt(58, 82, random),
    energy: 100,
    loyalty: randomInt(42, 78, random),
    months: 0,
    projects: 0,
    awards: 0,
  }
}

export function refreshCandidates(state, random = Math.random) {
  const count = Math.max(2, Math.min(5, OFFICES[state.studio.officeLevel].capacity + 1))
  state.studio.candidates = Array.from({ length: count }, () => generateCandidate(state, random))
}

export function hireCandidate(state, candidateId) {
  const office = OFFICES[state.studio.officeLevel]
  if (state.studio.team.length >= office.capacity - 1) return false
  const candidate = state.studio.candidates.find(item => item.id === candidateId)
  if (!candidate || state.player.money < candidate.salary * 2) return false
  state.player.money -= candidate.salary * 2
  state.studio.team.push(candidate)
  state.studio.candidates = state.studio.candidates.filter(item => item.id !== candidateId)
  return candidate
}

export function fireTeamMember(state, personId) {
  const person = state.studio.team.find(item => item.id === personId)
  if (!person) return null
  state.player.money -= person.salary
  state.studio.team = state.studio.team.filter(item => item.id !== personId)
  state.studio.morale = clamp(state.studio.morale - 8, 0, 100)
  return person
}

export function teamContribution(state) {
  const roleMap = { programmer: 'programming', artist: 'art', designer: 'design', producer: 'charisma', marketer: 'marketing', writer: 'design' }
  return state.studio.team.reduce((result, person) => {
    const stat = roleMap[person.roleId]
    const personality = PERSONALITIES.find(item => item.id === person.personalityId)
    const contribution = 0.22 + (personality?.contribution ?? 0) / 100
    result[stat] = (result[stat] ?? 0) + person.skill * (person.energy / 100) * (person.morale / 100) * contribution
    return result
  }, {})
}

export function calculateMonthlyBurn(state) {
  const office = OFFICES[state.studio.officeLevel]
  const salaries = state.studio.team.reduce((sum, person) => sum + person.salary, 0)
  const debt = state.studio.debt.reduce((sum, item) => sum + item.payment, 0)
  return Math.round(office.monthly + salaries + debt)
}

export function tickStudio(state, workedOnProject, random = Math.random) {
  const culture = CULTURES.find(item => item.id === state.studio.cultureId)
  state.studio.monthlyBurn = calculateMonthlyBurn(state)
  state.studio.cultureLockMonths = Math.max(0, (state.studio.cultureLockMonths ?? 0) - 1)
  state.player.money -= state.studio.monthlyBurn
  state.studio.team.forEach(person => {
    const personality = PERSONALITIES.find(item => item.id === person.personalityId)
    const socialBoost = state.studio.team.some(other => other.id !== person.id && other.personalityId === 'social') ? 2 : 0
    person.months += 1
    person.energy = clamp(person.energy + (workedOnProject ? -randomInt(7, 13, random) : 16), 10, 100)
    person.morale = clamp(person.morale + (workedOnProject ? culture.modifiers.morale ?? 0 : 2) + socialBoost, 0, 100)
    person.loyalty = clamp(person.loyalty + (state.player.money < 0 ? -2 : 0) + (personality?.retention ? 1 : 0), 0, 100)
    if (workedOnProject) person.projects += 0.15
    if (person.skill < person.potential && random() < 0.16) person.skill += 1
  })
  const departure = state.studio.team.find(person => person.loyalty < 12 && random() < 0.35)
  if (departure) {
    state.studio.team = state.studio.team.filter(person => person.id !== departure.id)
    state.queue.push({
      id: makeId('departure'), kind: 'info', tag: 'PEDIDO DE DEMISSÃO', title: `${departure.name} saiu do estúdio.`,
      body: 'Não foi uma decisão tomada nesta manhã. Foi o fim de uma soma que já vinha acontecendo há meses.',
      details: ['SEM MULTA', 'VAGA ABERTA', 'A EQUIPE SENTIU'],
    })
    state.studio.team.forEach(person => { person.morale = clamp(person.morale - 7, 0, 100) })
  }
  state.studio.morale = state.studio.team.length
    ? Math.round(state.studio.team.reduce((sum, item) => sum + item.morale, 0) / state.studio.team.length)
    : 68
  state.studio.debt = state.studio.debt.map(item => ({ ...item, monthsLeft: item.monthsLeft - 1 })).filter(item => item.monthsLeft > 0)
}

export function changeOffice(state) {
  const next = OFFICES[state.studio.officeLevel + 1]
  if (!next || state.player.money < next.cost) return null
  state.player.money -= next.cost
  state.studio.officeLevel = next.level
  return next
}

export function researchTech(state, techId) {
  const tech = TECHS.find(item => item.id === techId)
  const era = getEra(state.date.year)
  if (!tech || tech.level > era.techCap || state.studio.unlockedTechs.includes(techId) || state.studio.research < tech.cost) return null
  state.studio.research -= tech.cost
  state.studio.unlockedTechs.push(techId)
  state.world.technologyLevel = Math.max(state.world.technologyLevel, tech.level)
  return tech
}
