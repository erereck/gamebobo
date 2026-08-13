import test from 'node:test'
import assert from 'node:assert/strict'
import { reduceGame } from './reducer.js'
import { createInitialState } from './state.js'

const fixed = () => 0.99

test('starting a project and developing advances the calendar', () => {
  let state = createInitialState(fixed)
  state = reduceGame(state, { type: 'START_PROJECT', payload: { title: 'Teste', genre: 'puzzle', theme: 'space', focus: 'gameplay', platform: 'pc', scale: 'micro' } }, fixed)
  assert.equal(state.currentProject.title, 'Teste')
  state = reduceGame(state, { type: 'MONTH_ACTION', payload: { action: 'develop' } }, fixed)
  assert.equal(state.date.month, 1)
  assert.ok(state.currentProject.progress >= 1)
})

test('a micro project releases after three development months', () => {
  let state = createInitialState(fixed)
  state = reduceGame(state, { type: 'START_PROJECT', payload: { title: 'Teste', genre: 'puzzle', theme: 'space', focus: 'gameplay', platform: 'pc', scale: 'micro' } }, fixed)
  for (let index = 0; index < 3; index += 1) {
    state.queue = []
    state = reduceGame(state, { type: 'MONTH_ACTION', payload: { action: 'develop' } }, fixed)
  }
  assert.equal(state.currentProject, null)
  assert.equal(state.games.length, 1)
  assert.equal(state.queue[0].kind, 'release')
})
