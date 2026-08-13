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

test('disabling timeline notices clears only passive timeline cards', () => {
  const original = createInitialState(fixed)
  original.queue = [
    { id: 'historical', kind: 'info', timelineNotice: true },
    { id: 'decision', kind: 'decision' },
  ]
  const changed = reduceGame(original, { type: 'SET_TIMELINE_NOTICES', enabled: false }, fixed)
  assert.equal(changed.settings.timelineNotices, false)
  assert.deepEqual(changed.queue.map(item => item.id), ['decision'])
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

test('an active project can be renamed without losing its franchise identity', () => {
  let state = createInitialState(fixed)
  state = reduceGame(state, { type: 'START_PROJECT', payload: { title: 'Rascunho', genre: 'puzzle', theme: 'space', focus: 'gameplay', platform: 'pc', scale: 'micro' } }, fixed)
  const franchiseId = state.currentProject.franchiseId
  state = reduceGame(state, { type: 'RENAME_PROJECT', title: 'Nome Final' }, fixed)
  assert.equal(state.currentProject.title, 'Nome Final')
  assert.equal(state.currentProject.franchiseName, 'Nome Final')
  assert.equal(state.currentProject.franchiseId, franchiseId)
})

test('event circuit respects the calendar and cannot be farmed twice', () => {
  let state = createInitialState({ startYear: 1980 }, fixed)
  state.date.month = 1
  const money = state.player.money
  state = reduceGame(state, { type: 'ATTEND_GAME_EVENT', eventId: 'city-fair' }, fixed)
  assert.equal(state.player.money, money - 350)
  assert.equal(state.player.followers, 30)
  const repeated = reduceGame(state, { type: 'ATTEND_GAME_EVENT', eventId: 'city-fair' }, fixed)
  assert.equal(repeated.player.money, state.player.money)

  const impossible = reduceGame(state, { type: 'ATTEND_GAME_EVENT', eventId: 'e3' }, fixed)
  assert.equal(impossible.player.money, state.player.money)
})

test('creator launch plans only exist in their era and queue a live chat', () => {
  let oldState = createInitialState({ startYear: 1999 }, fixed)
  oldState = reduceGame(oldState, { type: 'START_PROJECT', payload: { title: 'Antigo', genre: 'puzzle', theme: 'space', focus: 'gameplay', platform: 'pc', scale: 'micro' } }, fixed)
  oldState = reduceGame(oldState, { type: 'SET_LAUNCH_PLAN', plan: 'creator' }, fixed)
  assert.equal(oldState.currentProject.launchPlan, 'shadow')

  let state = createInitialState({ startYear: 2012 }, fixed)
  state = reduceGame(state, { type: 'START_PROJECT', payload: { title: 'Ao Vivo', genre: 'puzzle', theme: 'space', focus: 'gameplay', platform: 'pc', scale: 'micro' } }, fixed)
  state = reduceGame(state, { type: 'SET_LAUNCH_PLAN', plan: 'creator' }, fixed)
  assert.equal(state.currentProject.launchPlan, 'creator')
  for (let index = 0; index < 3; index += 1) {
    state.queue = []
    state = reduceGame(state, { type: 'MONTH_ACTION', payload: { action: 'develop' } }, fixed)
  }
  assert.equal(state.queue[0].kind, 'release')
  const live = state.queue.find(item => item.eventId === 'creator-campaign-live')
  assert.equal(live.chat.length, 10)
  assert.equal(new Set(live.chat.map(message => message.text)).size, 10)
})
