import test from 'node:test'
import assert from 'node:assert/strict'
import { createInitialState } from './state.js'
import { reduceGame } from './reducer.js'
import { applyEffects } from './effects.js'
import { createPublisherOfferForProject } from './business.js'
import { discoverHybridGenre } from './innovation.js'
import { tickWorld } from './world.js'
import { hydrateV3, migrateV3 } from '../persistence/migrate.js'

const high = () => 0.99
const low = () => 0
const project = { title: 'Teste', genre: 'rpg', theme: 'space', focus: 'innovation', platform: 'pc', scale: 'micro' }

test('large projects remain locked without office and team', () => {
  const state = createInitialState(high)
  state.player.money = 1000000
  const next = reduceGame(state, { type: 'START_PROJECT', payload: { ...project, scale: 'large' } }, high)
  assert.equal(next.currentProject, null)
})

test('project delay effects extend the actual schedule', () => {
  const state = createInitialState(high)
  state.currentProject = { progress: 1, totalMonths: 5, pressure: 10, quality: 0 }
  applyEffects(state, { project: { months: 2 } })
  assert.equal(state.currentProject.totalMonths, 7)
})

test('publisher advances follow the current project budget', () => {
  let state = createInitialState(low)
  state = reduceGame(state, { type: 'START_PROJECT', payload: project }, low)
  const offer = createPublisherOfferForProject(state, low)
  assert.ok(offer.advance > 0)
  assert.ok(offer.advance < state.currentProject.estimatedCost * 2)
})

test('a hybrid genre needs an innovative game and a mixed portfolio', () => {
  const state = createInitialState(low)
  state.games = [{ id: 'old', genre: 'action' }]
  const game = { id: 'new', genre: 'rpg', score: 88, innovation: 12 }
  state.games.unshift(game)
  const genre = discoverHybridGenre(state, game, low)
  assert.equal(genre.id, 'action-rpg')
  assert.ok(state.world.knownGenres.some(item => item.id === 'action-rpg'))
})

test('real platforms enter the market on their historical launch date', () => {
  const state = createInitialState({ startYear: 2016 }, high)
  state.date = { year: 2017, month: 2 }
  tickWorld(state, high)
  assert.ok('switch' in state.market.platforms)
  assert.equal(Object.values(state.market.platforms).reduce((sum, value) => sum + value, 0), 100)
})

test('one mediocre release cannot create legendary reputation', () => {
  let state = createInitialState(high)
  state.player.reputation = 95
  state = reduceGame(state, { type: 'START_PROJECT', payload: { ...project, focus: 'gameplay' } }, high)
  for (let month = 0; month < 3; month += 1) {
    state.queue = []
    state = reduceGame(state, { type: 'MONTH_ACTION', payload: { action: 'develop' } }, high)
  }
  assert.ok(state.player.reputation < 95)
})

test('succession changes the protagonist without erasing the world', () => {
  let state = createInitialState(high)
  state.player.age = 64
  state.date = { month: 11, year: 2046 }
  state.games.push({ id: 'legacy-game', title: 'O Antigo', genre: 'rpg', score: 80, sales: 1000, released: 'JAN 2040' })
  state = reduceGame(state, { type: 'MONTH_ACTION', payload: { action: 'work' } }, high)
  const succession = state.queue.find(item => item.eventId === 'succession')
  assert.ok(succession)
  state.queue = [succession]
  state = reduceGame(state, { type: 'RESOLVE_DECISION', choiceId: 'family' }, high)
  assert.equal(state.player.generation, 2)
  assert.equal(state.studio.leaders.length, 2)
  assert.equal(state.games[0].title, 'O Antigo')
  assert.ok(state.player.age < 40)
})

test('schema 3 saves made earlier in development receive new safe defaults', () => {
  const old = createInitialState(high)
  delete old.studio.leaders
  delete old.studio.cultureLockMonths
  delete old.player.generation
  const hydrated = hydrateV3(old)
  assert.equal(hydrated.player.generation, 1)
  assert.equal(hydrated.studio.leaders[0].name, old.player.name)
  assert.equal(hydrated.studio.cultureLockMonths, 0)
})

test('schema 3 platform IDs and genre catalog migrate into the historical world', () => {
  const old = createInitialState(high)
  old.schema = 3
  old.games = [{ id: 'old-game', platform: 'playbox' }]
  old.world.knownGenres = old.world.knownGenres.filter(item => item.id !== 'racing')
  const migrated = migrateV3(old)
  assert.equal(migrated.games[0].platform, 'playstation-2')
  assert.ok(migrated.world.knownGenres.some(item => item.id === 'racing'))
  assert.ok(migrated.licenses.catalog.batman)
})
