import test from 'node:test'
import assert from 'node:assert/strict'
import { generateCompetitorLaunch } from './market.js'
import { competitorBidCapacity } from './licensing.js'
import { marketingForYear } from '../data/marketingEras.js'
import { worldEventsForYear } from '../data/worldEvents.js'
import { MARKET_ANGLES } from '../data/catalog.js'
import { marketAngleCopy } from '../data/eraLanguage.js'

function seeded(seed) {
  let value = seed >>> 0
  return () => {
    value += 0x6D2B79F5
    let next = value
    next = Math.imul(next ^ next >>> 15, next | 1)
    next ^= next + Math.imul(next ^ next >>> 7, next | 61)
    return ((next ^ next >>> 14) >>> 0) / 4294967296
  }
}

const sample = (year, runs = 20000) => {
  const random = seeded(year)
  const studio = { cohort: true, founded: year, specialty: 'puzzle', momentum: 18 }
  return Array.from({ length: runs }, () => generateCompetitorLaunch(studio, `JUN ${year}`, undefined, random))
}

test('Monte Carlo keeps a same-year 1980 startup inside the period market', () => {
  const launches = sample(1980)
  const sales = launches.map(item => item.sales).sort((a, b) => a - b)
  assert.ok(sales.at(-1) <= 450_000)
  assert.ok(sales[Math.floor(sales.length * .99)] < 100_000)
  assert.ok(launches.filter(item => item.breakout).length / launches.length < .02)
})

test('Monte Carlo reach grows across industry eras', () => {
  const median = year => {
    const sales = sample(year, 8000).map(item => item.sales).sort((a, b) => a - b)
    return sales[Math.floor(sales.length / 2)]
  }
  assert.ok(median(1980) < median(1990))
  assert.ok(median(1990) < median(2010))
})

test('a same-year garage cannot invent millions for a license auction', () => {
  const garage = { cohort: true, founded: 1991, games: [], momentum: 18 }
  const veteran = { cohort: false, founded: 1979, games: [] }
  assert.ok(competitorBidCapacity(garage, 1991) < 500_000)
  assert.ok(competitorBidCapacity(veteran, 1991) > 5_000_000)
})

test('marketing channels and world events unlock in their historical period', () => {
  assert.equal(marketingForYear(1980).plans.early, undefined)
  assert.match(marketingForYear(1980).plans.standard[0], /revista/i)
  assert.ok(!worldEventsForYear(1980).some(event => event.id === 'store-crash'))
  assert.ok(worldEventsForYear(2007).some(event => event.id === 'store-crash'))
  assert.doesNotMatch(marketAngleCopy(MARKET_ANGLES.find(item => item.id === 'together'), 1980), /rede|online/i)
})
