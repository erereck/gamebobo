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
