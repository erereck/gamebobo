import { FIRST_NAMES, NICKNAMES } from '../data/content/names.js'
import { LOOKS, ROLES, TRAITS, traitById } from '../data/staff.js'
import { DECOR, TECHS, decorById, eraSkillFactor, techById } from '../data/economy.js'
import { clamp, int, makeId, pick, weighted } from './rng.js'

export const PILLAR_IDS = ['fun', 'art', 'sound', 'idea']

export function randomLook(random = Math.random) {
  return {
    skin: pick(LOOKS.skin, random),
    hair: pick(LOOKS.hair, random),
    hairStyle: pick(LOOKS.hairStyle, random),
    shirt: pick(LOOKS.shirt, random),
    pants: pick(LOOKS.pants, random),
    extra: pick(LOOKS.extra, random),
    height: .92 + random() * .16,
  }
}

export const skillTotal = person => PILLAR_IDS.reduce((sum, key) => sum + person.skills[key], 0)
export const topPillar = person => PILLAR_IDS.reduce((best, key) => (person.skills[key] > person.skills[best] ? key : best), 'fun')
export const roleOf = person => ROLES[topPillar(person)]

export function salaryFor(skills, traitId, year = 1980) {
  const total = PILLAR_IDS.reduce((sum, key) => sum + skills[key], 0) / eraSkillFactor(year)
  const trait = traitById(traitId)
  return Math.round((260 + total * 8.5) * (trait?.salary ?? 1) / 10) * 10
}

export function createFounder({ name, profile, look }) {
  return {
    id: 'founder',
    name,
    founder: true,
    skills: { ...profile.skills },
    level: 1,
    xp: 0,
    trait: profile.trait,
    salary: 0,
    energy: 100,
    mood: 70,
    status: 'ok',
    away: 0,
    look,
    hiredAt: 0,
  }
}

// Candidatos ficam melhores com o passar dos anos e com a fama do estúdio.
export function createCandidate(year, fame, random = Math.random, focus = null) {
  const primary = focus ?? pick(PILLAR_IDS, random)
  const budget = (62 + Math.min(30, fame * .015) + int(-12, 26, random)) * eraSkillFactor(year)
  const skills = { fun: 0, art: 0, sound: 0, idea: 0 }
  const share = { fun: 1, art: 1, sound: 1, idea: 1, [primary]: 3.2 }
  const secondary = pick(PILLAR_IDS.filter(key => key !== primary), random)
  share[secondary] = 1.8
  const sum = Object.values(share).reduce((a, b) => a + b, 0)
  for (const key of PILLAR_IDS) skills[key] = Math.max(3, Math.round(budget * share[key] / sum + int(-3, 3, random)))
  const trait = pick(TRAITS, random).id
  const first = pick(FIRST_NAMES, random)
  const name = random() < .16 ? `${first} "${pick(NICKNAMES, random)}"` : first
  return {
    id: makeId('staff'),
    name,
    founder: false,
    skills,
    level: 1,
    xp: 0,
    trait,
    salary: salaryFor(skills, trait, year),
    energy: 100,
    mood: 64,
    status: 'ok',
    away: 0,
    look: randomLook(random),
  }
}

export function createCandidates(year, fame, random = Math.random) {
  return [createCandidate(year, fame, random), createCandidate(year, fame, random), createCandidate(year, fame, random)]
}

export function engineMultiplier(techs) {
  return techs.reduce((mult, id) => mult * (techById(id)?.engine ?? 1), 1)
}

export function genMultiplier(state, pillar) {
  let mult = 1
  for (const id of state.techs) mult *= techById(id)?.gen?.[pillar] ?? 1
  for (const item of state.decor) mult *= decorById(item)?.gen?.[pillar] ?? 1
  return mult
}

export function decorTotals(decor) {
  return decor.reduce((acc, id) => {
    const item = decorById(id)
    if (!item) return acc
    acc.mood += item.mood ?? 0
    acc.energy += item.energy ?? 0
    acc.bugs *= item.bugs ?? 1
    acc.fans *= item.fans ?? 1
    return acc
  }, { mood: 0, energy: 0, bugs: 1, fans: 1 })
}

export const techBugMultiplier = techs => techs.reduce((mult, id) => mult * (techById(id)?.bugs ?? 1), 1)
export const techSalesMultiplier = techs => techs.reduce((mult, id) => mult * (techById(id)?.sales ?? 1), 1)
export const techHypeMultiplier = techs => techs.reduce((mult, id) => mult * (techById(id)?.hype ?? 1), 1)

// Produção bruta semanal de uma pessoa: soma das habilidades / 10.
export function personOutput(state, person, pace) {
  const trait = traitById(person.trait)
  const moodMult = .8 + clamp(person.mood, 0, 100) / 250
  const energyMult = person.energy < 20 ? .7 : person.energy < 40 ? .9 : 1
  let traitMult = trait?.out ?? 1
  if (pace.id === 'crunch' && trait?.crunchOut) traitMult *= trait.crunchOut
  return (skillTotal(person) / 10) * engineMultiplier(state.techs) * pace.output * moodMult * energyMult * traitMult
}

export const xpForLevel = level => Math.round(60 * level ** 1.45)

// Subir de nível: +6 pontos distribuídos puxando para o que a pessoa mais produziu.
export function levelUp(person, contributions, random = Math.random) {
  const gains = { fun: 0, art: 0, sound: 0, idea: 0 }
  const points = 5 + (random() < .35 ? 2 : 0)
  for (let i = 0; i < points; i += 1) {
    const key = weighted(PILLAR_IDS, k => (contributions?.[k] ?? 0) + person.skills[k] * .4 + 2, random)
    gains[key] += 1
  }
  for (const key of PILLAR_IDS) person.skills[key] = Math.min(200, person.skills[key] + gains[key])
  person.level += 1
  if (!person.founder) person.salary = Math.round(person.salary * 1.06 / 10) * 10
  return gains
}

export const activeStaff = state => state.staff.filter(person => person.status === 'ok')
// Lei de Brooks de bolso: cada pessoa a mais conversa mais e programa um pouco menos.
export const teamEfficiency = count => 1 / (1 + .02 * Math.max(0, count - 1))
export const officeCapacity = office => office.cap

export { DECOR, TECHS }
