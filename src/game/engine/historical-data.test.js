import test from 'node:test'
import assert from 'node:assert/strict'
import { createInitialState } from './state.js'
import { PLATFORM_HISTORY, regionDate } from '../data/platformHistory.js'
import { tickWorld } from './world.js'

const fixed = () => .5

test('a career can begin in any supported historical decade', () => {
  for (const year of [1980, 1987, 1999, 2010, 2020]) {
    const state = createInitialState({ startYear: year }, fixed)
    assert.equal(state.date.year, year)
    assert.ok('pc' in state.market.platforms)
    assert.equal(Object.values(state.market.platforms).reduce((sum, value) => sum + value, 0), 100)
  }
})

test('historical notices can be hidden without erasing the timeline', () => {
  const visible = createInitialState({ startYear: 1980 }, fixed)
  visible.date = { year: 1980, month: 4 }
  tickWorld(visible, () => 1)
  const pacManNotice = visible.queue.find(item => item.title === 'Pac-Man chega aos arcades')
  assert.equal(pacManNotice?.autoAdvance, true)
  assert.equal(pacManNotice?.timelineNotice, true)

  const quiet = createInitialState({ startYear: 1980 }, fixed)
  quiet.settings.timelineNotices = false
  quiet.date = { year: 1980, month: 4 }
  tickWorld(quiet, () => 1)
  assert.equal(quiet.queue.some(item => item.title === 'Pac-Man chega aos arcades'), false)
  assert.equal(quiet.history.some(item => item.title === 'Pac-Man chega aos arcades'), true)
  assert.equal(quiet.world.industryNews.some(item => item.title === 'Pac-Man chega aos arcades'), true)
})

test('the platform catalog has stable IDs and valid regional dates', () => {
  assert.equal(new Set(PLATFORM_HISTORY.map(item => item.id)).size, PLATFORM_HISTORY.length)
  PLATFORM_HISTORY.forEach(platform => Object.values(platform.launch).forEach(([year, month, day]) => {
    assert.ok(year >= 1977 && year <= 2020)
    assert.ok(month >= 0 && month <= 11)
    if (day) assert.ok(day >= 1 && day <= 31)
  }))
})

test('official PlayStation launch dates retain day precision', () => {
  const ps1 = PLATFORM_HISTORY.find(item => item.id === 'playstation')
  assert.equal(regionDate(ps1.launch.jp), '03/12/1994')
  assert.equal(regionDate(ps1.launch.na), '09/09/1995')
  assert.equal(regionDate(ps1.launch.eu), '29/09/1995')
})
