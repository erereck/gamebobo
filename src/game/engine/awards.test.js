import test from 'node:test'
import assert from 'node:assert/strict'
import { createInitialState } from './state.js'
import { processAwards } from './awards.js'

const fixed = () => .5

const game = year => ({
  id: `game-${year}`,
  title: 'Teste',
  released: `DEZ ${year}`,
  score: 96,
  sales: 500000,
  scale: 'micro',
  focus: 'gameplay',
  innovation: 10,
  trust: 80,
})

test('Melhor Indie only enters the ceremony from 2004 onward', () => {
  const early = createInitialState({ startYear: 1991 }, fixed)
  early.games = [game(1991)]
  const earlyResults = processAwards(early, 1991, fixed)
  assert.equal(earlyResults.some(result => result.categoryId === 'indie'), false)

  const modern = createInitialState({ startYear: 2004 }, fixed)
  modern.games = [game(2004)]
  const modernResults = processAwards(modern, 2004, fixed)
  assert.equal(modernResults.some(result => result.categoryId === 'indie'), true)
})
