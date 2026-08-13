import test from 'node:test'
import assert from 'node:assert/strict'
import { createInitialState } from './state.js'
import { tickWorld } from './world.js'

const high = () => 0.99
const middle = () => 0.5

test('an active release keeps selling during its support tail', () => {
  const state = createInitialState(high)
  state.games.push({ id: 'game-1', initialSales: 1000, sales: 1000, initialRevenue: 10000, revenue: 10000, initialFollowers: 100, price: 20, royalty: 0.8, genre: 'puzzle', platform: 'pc' })
  state.activeReleases.push({ gameId: 'game-1', monthsLeft: 4, age: 1, eventIds: [] })
  const moneyBefore = state.player.money
  tickWorld(state, high)
  assert.ok(state.games[0].sales > 1000)
  assert.ok(state.player.money > moneyBefore)
})

test('platform shares still total 100 after a market shift', () => {
  const state = createInitialState(middle)
  state.market.monthsLeft = 0
  tickWorld(state, middle)
  const total = Object.values(state.market.platforms).reduce((sum, value) => sum + value, 0)
  assert.equal(total, 100)
})
