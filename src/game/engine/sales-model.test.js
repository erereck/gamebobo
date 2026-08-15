import test from 'node:test'
import assert from 'node:assert/strict'
import { addressableDemand, audienceCeiling, qualityDemand } from './sales-model.js'

test('commercial demand grows smoothly across eras without erasing discoverability pressure', () => {
  const years = [1980, 1985, 1991, 2000, 2010, 2020, 2030]
  const values = years.map(addressableDemand)
  assert.ok(values.every((value, index) => index === 0 || value > values[index - 1]))
  assert.ok(addressableDemand(1990) < addressableDemand(1991))
  assert.ok(addressableDemand(1992) > addressableDemand(1991))
  assert.ok(addressableDemand(2020) < addressableDemand(1991) * 2)
})

test('quality creates a steep but continuous demand curve in every era', () => {
  for (const year of [1980, 1991, 2000, 2010, 2020]) {
    const scores = [55, 60, 70, 80, 90, 94, 99]
    const demand = scores.map(score => qualityDemand(score, year))
    assert.ok(demand.every((value, index) => index === 0 || value > demand[index - 1]))
    assert.ok(qualityDemand(94, year) > qualityDemand(80, year) * 2)
    assert.ok(qualityDemand(99, year) <= audienceCeiling(year))
  }
})
