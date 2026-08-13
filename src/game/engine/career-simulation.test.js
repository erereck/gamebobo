import test from 'node:test'
import assert from 'node:assert/strict'
import { createInitialState } from './state.js'
import { reduceGame } from './reducer.js'

const seededRandom = seedValue => {
  let seed = seedValue
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}

test('a forty-year autonomous career keeps a valid playable state', () => {
  const random = seededRandom(1987)
  let state = createInitialState(random)
  let months = 0
  let safety = 0

  while (months < 480 && safety < 6000) {
    safety += 1
    if (state.queue.length) {
      const item = state.queue[0]
      state = item.kind === 'decision'
        ? reduceGame(state, { type: 'RESOLVE_DECISION', choiceId: item.choices[0].id }, random)
        : reduceGame(state, { type: 'ACK_QUEUE' }, random)
      continue
    }
    if (!state.currentProject && !state.currentContract && state.player.money > 1200) {
      state = reduceGame(state, { type: 'START_PROJECT', payload: { title: `Jogo ${state.games.length + 1}`, genre: state.world.knownGenres[state.games.length % state.world.knownGenres.length].id, theme: 'space', focus: state.games.length % 3 === 0 ? 'innovation' : 'gameplay', platform: 'pc', scale: 'micro' } }, random)
      continue
    }
    const action = state.currentContract ? 'contract' : state.currentProject && state.player.energy > 22 ? 'develop' : state.player.energy <= 22 ? 'rest' : 'work'
    state = reduceGame(state, { type: 'MONTH_ACTION', payload: { action } }, random)
    months += 1
  }

  assert.equal(months, 480)
  assert.ok(state.games.length > 5)
  assert.ok(state.date.year >= 2042)
  assert.ok(state.player.health >= 0 && state.player.health <= 100)
  assert.equal(Object.values(state.market.platforms).reduce((sum, value) => sum + value, 0), 100)
  assert.ok(state.world.knownGenres.length >= 7)
})
