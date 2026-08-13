import test from 'node:test'
import assert from 'node:assert/strict'
import { createInitialState } from './state.js'
import { getAllTimeChart, getDecadeChart } from './charts.js'
import { LICENSE_CATALOG } from '../data/licenses.js'
import { SALES_HISTORY } from '../data/salesHistory.js'

test('the historical archive contains twenty games for every supported decade', () => {
  for (const decade of [1980, 1990, 2000, 2010, 2020]) {
    assert.equal(SALES_HISTORY.filter(game => Math.floor(game.year / 10) * 10 === decade).length, 20)
  }
})

test('future games stay out of a historical career chart', () => {
  const state = createInitialState({ startYear: 1984 }, () => .5)
  const chart = getAllTimeChart(state)
  assert.ok(chart.every(game => game.year <= 1984))
  assert.ok(!chart.some(game => game.title === 'Super Mario Bros.'))
})

test('an alternate breakout can take the number one spot', () => {
  const state = createInitialState({ startYear: 2003 }, () => .5)
  const startup = state.competitors.find(studio => studio.cohort)
  startup.games.push({ id: 'breakout', title: 'O Impossível', released: 'JAN 2003', sales: 200000000, initialSales: 200000000, breakout: true })
  const chart = getDecadeChart(state, 2000)
  assert.equal(chart[0].title, 'O Impossível')
  assert.equal(chart[0].source, 'cohort')
})

test('the update ships a broad IP catalog and four same-year startups', () => {
  const state = createInitialState({ startYear: 1996 }, () => .5)
  assert.ok(LICENSE_CATALOG.length >= 55)
  assert.equal(state.competitors.filter(studio => studio.cohort && studio.founded === 1996).length, 4)
})
