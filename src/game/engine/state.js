import { VERSION_INFO as versionInfo } from '../../version.js'
import { GENRES, PLATFORMS } from '../data/catalog.js'
import { TRAITS } from '../data/traits.js'
import { createCompetitors, createMarket } from './market.js'
import { clamp, makeId, randomChoice } from './utils.js'
import { getEra } from '../data/eras.js'
import { CULTURES, OFFICES } from '../data/team.js'
import { generateOpportunities } from './business.js'
import { createLicensingState } from './licensing.js'
import { HISTORICAL_MILESTONES } from '../data/industryHistory.js'
import { createCorporateState } from './corporate.js'

const blankSegments = items => Object.fromEntries(items.map(item => [item.id, 0]))

export function createInitialState(optionsOrRandom = Math.random, maybeRandom = Math.random) {
  const options = typeof optionsOrRandom === 'function' ? {} : optionsOrRandom
  const random = typeof optionsOrRandom === 'function' ? optionsOrRandom : maybeRandom
  const startYear = clamp(Number(options.startYear) || 2003, 1980, 2020)
  const trait = TRAITS.find(item => item.id === options.traitId) ?? randomChoice(TRAITS, random)
  const playerName = String(options.playerName || 'Erick').trim().slice(0, 28) || 'Erick'
  const studioName = String(options.studioName || 'EriLab').trim().slice(0, 32) || 'EriLab'
  const playerAge = clamp(Number(options.age) || 21, 16, 60)
  const currency = ['BRL', 'USD', 'EUR'].includes(options.currency) ? options.currency : 'BRL'
  const stats = { programming: 52, art: 24, design: 61, marketing: 18, charisma: 40 }
  if (trait.modifiers.programming) stats.programming += trait.modifiers.programming
  if (trait.modifiers.charisma) stats.charisma += trait.modifiers.charisma
  if (trait.modifiers.marketing) stats.marketing += trait.modifiers.marketing

  const state = {
    schema: versionInfo.saveSchema,
    meta: {
      id: makeId('career'),
      createdAt: new Date().toISOString(),
      lastSavedAt: null,
      version: versionInfo.version,
      startYear,
    },
    date: { month: 0, year: startYear },
    player: {
      name: playerName,
      age: playerAge,
      money: 12800,
      energy: 100,
      stress: 8,
      followers: 12,
      reputation: 0,
      relationship: 55,
      health: 100,
      stats,
      traitId: trait.id,
      equipmentLevel: 0,
      audience: {
        hardcore: 3,
        casual: 9,
        nostalgic: 0,
        trust: 50,
        genres: blankSegments(GENRES),
        platforms: blankSegments(PLATFORMS),
      },
      flags: {},
      career: { projectsStarted: 0, monthsWorked: 0, crisesSurvived: 0, genresCreated: 0 },
      generation: 1,
    },
    currentProject: null,
    currentContract: null,
    games: [],
    activeReleases: [],
    market: createMarket(startYear, random, 0),
    competitors: createCompetitors(random, startYear),
    licenses: createLicensingState(startYear),
    corporate: createCorporateState(startYear),
    world: {
      eraId: getEra(startYear).id,
      eraStarted: startYear,
      knownGenres: GENRES.map(item => ({ id: item.id, label: item.label, createdBy: null, createdYear: null, base: true })),
      industryNews: [],
      seenEvents: [],
      seenHistoricalMilestones: HISTORICAL_MILESTONES.filter(item => item.year < startYear).map(item => item.id),
      technologyLevel: Math.max(1, getEra(startYear).techCap - 1),
      attendedEvents: [],
    },
    studio: {
      name: studioName,
      founded: startYear,
      officeLevel: OFFICES[0].level,
      cultureId: CULTURES[0].id,
      cultureLockMonths: 0,
      team: [],
      candidates: [],
      research: 0,
      unlockedTechs: [],
      monthlyBurn: 0,
      debt: [],
      equity: 0,
      parentCompany: null,
      autonomy: 100,
      morale: 68,
      reputation: 0,
      leaders: [{ name: playerName, generation: 1, from: startYear, to: null, legacy: 'Fundador' }],
    },
    opportunities: { contracts: [], publisherOffers: [] },
    awards: { trophies: [], nominations: [], processedYears: [] },
    history: [
      {
        id: makeId('history'),
        date: `JAN ${startYear}`,
        title: 'Primeiro dia',
        body: `Um equipamento compatível com ${startYear}, algum dinheiro guardado e nenhum jogo publicado.`,
        highlight: true,
        kind: 'career',
      },
    ],
    queue: [],
    seenPersonalEvents: [],
    settings: { sound: true, currency, timelineNotices: true },
  }
  generateOpportunities(state, random)
  return state
}
