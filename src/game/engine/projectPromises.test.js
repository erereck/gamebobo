import test from 'node:test'
import assert from 'node:assert/strict'
import { projectPhase, promiseOptionsFor } from '../data/projectPromises.js'

test('cover promises respect the period and keep the short list short', () => {
  const oldOptions = promiseOptionsFor({ genre: 'sports', focus: 'multiplayer', year: 1980, scaleId: 'small' })
  assert.ok(oldOptions.length <= 5)
  assert.equal(oldOptions.some(item => item.id === 'online-community'), false)
  const modernOptions = promiseOptionsFor({ genre: 'sports', focus: 'multiplayer', year: 2000, scaleId: 'small' })
  assert.equal(modernOptions[0].id, 'couch-game')
  assert.ok(modernOptions.some(item => item.id === 'online-community'))
})

test('project phases are readable from progress alone', () => {
  assert.equal(projectPhase({ progress: 0, totalMonths: 5 }), 'prototype')
  assert.equal(projectPhase({ progress: 1, totalMonths: 5 }), 'production')
  assert.equal(projectPhase({ progress: 4, totalMonths: 5 }), 'polish')
})
