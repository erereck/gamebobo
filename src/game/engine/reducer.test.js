import test from 'node:test'
import assert from 'node:assert/strict'
import { reduceGame } from './reducer.js'
import { createInitialState } from './state.js'
import { formatMoney, setDisplayCurrency } from './utils.js'

const fixed = () => 0.99

test('career setup applies the founder, studio, era, profile and currency', () => {
  const state = createInitialState({ playerName: 'Lia Torres', studioName: 'Quarto 12', age: 27, startYear: 1994, traitId: 'communicator', currency: 'EUR' }, fixed)
  assert.equal(state.player.name, 'Lia Torres')
  assert.equal(state.studio.name, 'Quarto 12')
  assert.equal(state.player.age, 27)
  assert.equal(state.date.year, 1994)
  assert.equal(state.player.traitId, 'communicator')
  assert.equal(state.settings.currency, 'EUR')
  assert.equal(state.studio.leaders[0].name, 'Lia Torres')
})

test('currency preference changes display without changing the underlying cash', () => {
  const original = createInitialState(fixed)
  const changed = reduceGame(original, { type: 'SET_CURRENCY', currency: 'USD' }, fixed)
  setDisplayCurrency(changed.settings.currency)
  assert.equal(changed.player.money, original.player.money)
  assert.match(formatMoney(changed.player.money), /US\$/)
  setDisplayCurrency('BRL')
})

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
