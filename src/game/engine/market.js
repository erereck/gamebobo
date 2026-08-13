import { GENRES, MARKET_ANGLES, PLATFORMS } from '../data/catalog.js'
import { COMPETITOR_BLUEPRINTS, GAME_NAME_ENDS, GAME_NAME_STARTS } from '../data/competitors.js'
import { platformAtDate } from '../data/platformHistory.js'
import { makeId, randomChoice, randomInt } from './utils.js'
import { STARTUP_STUDIOS } from '../data/startupStudios.js'

export const availablePlatforms = (year, month = 11) => PLATFORMS.filter(platform => platformAtDate(platform, { year, month }))

export function createMarket(year = 2003, random = Math.random, month = 0) {
  const platformValues = availablePlatforms(year, month).map(platform => ({ id: platform.id, raw: randomInt(18, 56, random) }))
  const total = platformValues.reduce((sum, item) => sum + item.raw, 0)
  const platforms = Object.fromEntries(platformValues.map(item => [item.id, Math.round((item.raw / total) * 100)]))
  const firstPlatform = platformValues[0]?.id
  if (firstPlatform) platforms[firstPlatform] += 100 - Object.values(platforms).reduce((sum, value) => sum + value, 0)
  return {
    genre: randomChoice(GENRES, random).id,
    angle: randomChoice(MARKET_ANGLES, random).id,
    heat: randomInt(68, 96, random),
    monthsLeft: randomInt(6, 12, random),
    platforms,
    cycle: 1,
  }
}

export function createCompetitors(random = Math.random, year = 2003) {
  const established = [...COMPETITOR_BLUEPRINTS]
    .filter(item => item.founded <= year)
    .sort(() => random() - 0.5)
    .slice(0, 3)
    .map(item => ({
      ...item,
      id: makeId('studio'),
      games: [],
      reputation: randomInt(24, 68, random),
      relationScore: item.relation === 'rival' ? -32 : item.relation === 'friendly' ? 28 : 0,
      meetings: 0,
    }))
  const cohort = [...STARTUP_STUDIOS].sort(() => random() - .5).slice(0, 4).map(item => ({
    ...item, id: makeId('startup'), founded: year, fictional: true, cohort: true, games: [],
    reputation: randomInt(2, 10, random), relation: 'neutral', relationScore: 0, meetings: 0,
    momentum: randomInt(8, 24, random), status: 'garagem',
  }))
  return [...established, ...cohort]
}

export function generateCompetitorLaunch(competitor, date, knownGenres = GENRES, random = Math.random) {
  const title = `${randomChoice(GAME_NAME_STARTS, random)} ${randomChoice(GAME_NAME_ENDS, random)}`
  const releaseYear = Number(String(date).split(' ').at(-1))
  const studioAge = Math.max(0, releaseYear - (competitor.founded ?? releaseYear))
  const breakoutChance = (.018 + Math.min(.09, (competitor.momentum ?? 0) / 1100)) * (releaseYear < 1985 ? .42 : releaseYear < 1995 ? .72 : 1)
  const breakout = Boolean(competitor.cohort && random() < breakoutChance)
  const score = breakout ? randomInt(88, 98, random) : randomInt(58, competitor.cohort ? 92 : 96, random)
  const eraFactor = releaseYear < 1985 ? .07 : releaseYear < 1990 ? .14 : releaseYear < 1995 ? .26 : releaseYear < 2000 ? .42 : releaseYear < 2005 ? .62 : releaseYear < 2010 ? .82 : releaseYear < 2015 ? 1 : 1.18
  const marketCeiling = releaseYear < 1985 ? 450_000 : releaseYear < 1990 ? 1_500_000 : releaseYear < 1995 ? 4_000_000 : releaseYear < 2000 ? 8_000_000 : releaseYear < 2005 ? 15_000_000 : releaseYear < 2010 ? 25_000_000 : releaseYear < 2015 ? 40_000_000 : 65_000_000
  const studioReach = competitor.cohort ? .24 + Math.min(.76, studioAge / 8) : .72 + Math.min(.28, studioAge / 20)
  const baseSales = Math.round((score ** 2.18) * randomInt(8, 44, random) * eraFactor * studioReach)
  const sales = Math.min(marketCeiling, Math.round(baseSales * (breakout ? randomInt(220, 560, random) / 100 : 1)))
  return {
    id: makeId('rival-game'),
    title,
    genre: random() < 0.62 ? competitor.specialty : randomChoice(knownGenres, random).id,
    score,
    sales,
    released: date,
    initialSales: sales,
    age: 0,
    breakout,
  }
}
