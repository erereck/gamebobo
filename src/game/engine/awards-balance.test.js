import test from 'node:test'
import assert from 'node:assert/strict'
import { processAwards } from './awards.js'
import { createInitialState } from './state.js'

const fixed = () => .5

function playerGame(score, sales) {
  return {
    id: `player-${score}-${sales}`,
    title: `Jogo ${score}`,
    released: 'DEZ 2015',
    score,
    sales,
    scale: 'blockbuster',
    focus: 'gameplay',
    innovation: 12,
    trust: 90,
  }
}

function isolated2015() {
  const state = createInitialState({ startYear: 2015 }, fixed)
  state.competitors.forEach(studio => { studio.games = [] })
  return state
}

test('a 77/100 blockbuster cannot buy GOTY with enormous sales', () => {
  const state = isolated2015()
  state.games = [playerGame(77, 500_000_000)]

  const goty = processAwards(state, 2015, fixed).find(result => result.categoryId === 'goty')

  assert.notEqual(goty.winnerSource, 'player')
  assert.equal(goty.won, false)
  assert.equal(goty.nominated, false)
  assert.ok(goty.winnerScore >= 82)
})

test('an 81/100 phenomenon may be nominated but still cannot win GOTY', () => {
  const state = isolated2015()
  state.games = [playerGame(81, 500_000_000)]

  const goty = processAwards(state, 2015, fixed).find(result => result.categoryId === 'goty')

  assert.notEqual(goty.winnerSource, 'player')
  assert.equal(goty.won, false)
  assert.equal(goty.nominated, true)
})

test('an exceptional 99/100 player release can still beat the real benchmark', () => {
  const state = isolated2015()
  state.games = [playerGame(99, 30_000_000)]

  const goty = processAwards(state, 2015, fixed).find(result => result.categoryId === 'goty')

  assert.equal(goty.winnerSource, 'player')
  assert.equal(goty.won, true)
  assert.equal(goty.nominated, true)
  assert.equal(goty.winnerScore, 99)
})
