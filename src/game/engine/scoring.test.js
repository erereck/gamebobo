import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateQuality, calculateRelease } from './scoring.js'
import { createInitialState } from './state.js'

const fixed = () => 0.5

test('quality stays inside the supported score range', () => {
  const state = createInitialState(fixed)
  const project = { genre: 'rpg', focus: 'story', scale: 'micro', platform: 'pc', quality: 0, innovation: 0, pressure: 8 }
  const score = calculateQuality(state, project, fixed)
  assert.ok(score >= 24 && score <= 99)
})

test('a release produces positive sales and revenue', () => {
  const state = createInitialState(fixed)
  const project = { genre: 'rpg', focus: 'story', scale: 'micro', platform: 'pc', quality: 5, innovation: 2, pressure: 20 }
  const release = calculateRelease(state, project, fixed)
  assert.ok(release.sales > 0)
  assert.ok(release.revenue > 0)
  assert.ok(release.newFollowers > 0)
})

test('press coverage follows history and stays close to the underlying quality', () => {
  const project = { genre: 'rpg', focus: 'story', scale: 'micro', platform: 'pc', quality: 5, innovation: 2, pressure: 20 }
  const early = calculateRelease(createInitialState({ startYear: 1980 }, fixed), project, fixed)
  assert.equal(early.reviews.some(review => review.outlet === 'IGN'), false)
  assert.equal(early.reviews.some(review => review.outlet === 'Canaltech'), false)
  assert.ok(early.reviews.every(review => Math.abs(review.score - early.score) <= 6))

  const modern = calculateRelease(createInitialState({ startYear: 2012 }, fixed), project, fixed)
  assert.equal(modern.reviews.length, 4)
  assert.ok(modern.reviews.every(review => Math.abs(review.score - modern.score) <= 6))
  assert.equal(new Set(modern.reviews.map(review => review.quote)).size, modern.reviews.length)

  const current = calculateRelease(createInitialState({ startYear: 2020 }, fixed), project, fixed)
  assert.equal(current.reviews.some(review => review.outlet === 'Computer and Video Games'), false)
})
