import test from 'node:test'
import assert from 'node:assert/strict'
import { PLATFORMS } from '../data/catalog.js'
import { eventExistsInYear, GAME_EVENTS } from '../data/gameEvents.js'
import { platformAtDate } from '../data/platformHistory.js'
import { migrateV6 } from '../persistence/migrateV7.js'
import { processAwards } from './awards.js'
import { calculateProjectPlan } from './production.js'
import { reduceGame } from './reducer.js'
import { createInitialState } from './state.js'
import { hiringSearchCost } from './studio.js'

const fixed = () => .5

const basicProject = overrides => ({
  title: 'Projeto Teste',
  projectType: 'original',
  genres: ['action'],
  themes: ['space'],
  genre: 'action',
  theme: 'space',
  focus: 'gameplay',
  scale: 'small',
  platforms: ['pc'],
  platform: 'pc',
  delegatedPlatformIds: [],
  productionUnitId: 'founder',
  promiseId: 'precise-controls',
  franchiseId: '',
  sourceGameIds: [],
  licenseIds: [],
  accessoryId: '',
  controlScheme: 'standard',
  ...overrides,
})

const staff = (id, skill = 68) => ({
  id: `person-${id}`,
  name: `Pessoa ${id}`,
  roleId: id % 2 ? 'programmer' : 'designer',
  personalityId: 'calm',
  skill,
  potential: 82,
  salary: 4000,
  morale: 75,
  energy: 100,
  loyalty: 70,
  months: 0,
  projects: 0,
  awards: 0,
})

test('arcade is a playable platform from the beginning of the timeline', () => {
  const arcade = PLATFORMS.find(item => item.id === 'arcade')
  assert.ok(arcade)
  assert.equal(platformAtDate(arcade, { year: 1980, month: 0 }), true)
})

test('E3 timeline keeps 2020 cancelled and 2021 available', () => {
  const e3 = GAME_EVENTS.find(item => item.id === 'e3')
  assert.equal(eventExistsInYear(e3, 2020), false)
  assert.equal(eventExistsInYear(e3, 2021), true)
  assert.equal(eventExistsInYear(e3, 2022), false)
})

test('recruiting gets meaningfully more expensive with time and company size', () => {
  const early = createInitialState({ startYear: 1980 }, fixed)
  const modern = createInitialState({ startYear: 2020 }, fixed)
  modern.studio.officeLevel = 6
  modern.studio.team = Array.from({ length: 12 }, (_, index) => staff(index + 1))
  modern.studio.reputation = 70
  assert.ok(hiringSearchCost(modern) > hiringSearchCost(early) * 4)
  assert.ok(hiringSearchCost(modern, true) > hiringSearchCost(modern) * 4)
})

test('multiplatform development costs and takes longer than a single platform build', () => {
  const state = createInitialState({ startYear: 2006 }, fixed)
  state.studio.team = Array.from({ length: 4 }, (_, index) => staff(index + 1))
  const single = calculateProjectPlan(state, basicProject({ platforms: ['pc'] }))
  const multi = calculateProjectPlan(state, basicProject({ platforms: ['pc', 'playstation-2', 'xbox-360'] }))
  assert.ok(multi.estimatedCost > single.estimatedCost)
  assert.ok(multi.totalMonths > single.totalMonths)
})

test('delegating secondary ports claws back part of multiplatform delay', () => {
  const state = createInitialState({ startYear: 2006 }, fixed)
  state.studio.team = Array.from({ length: 4 }, (_, index) => staff(index + 1))
  const local = calculateProjectPlan(state, basicProject({ platforms: ['pc', 'playstation-2', 'xbox-360'] }))
  const delegated = calculateProjectPlan(state, basicProject({ platforms: ['pc', 'playstation-2', 'xbox-360'], delegatedPlatformIds: ['playstation-2', 'xbox-360'] }))
  assert.ok(delegated.totalMonths < local.totalMonths)
  assert.ok(delegated.estimatedCost > 0)
})

test('a second game can run in parallel when an internal production unit exists', () => {
  let state = createInitialState({ startYear: 2006 }, fixed)
  state.player.money = 5_000_000
  state.studio.officeLevel = 4
  state.studio.team = Array.from({ length: 4 }, (_, index) => staff(index + 1))
  state = reduceGame(state, { type: 'START_PROJECT', payload: basicProject({ title: 'Jogo A' }) }, fixed)
  assert.equal(state.currentProject?.title, 'Jogo A')
  state = reduceGame(state, { type: 'START_PROJECT', payload: basicProject({ title: 'Jogo B', productionUnitId: 'internal-1' }) }, fixed)
  assert.equal(state.parallelProjects.length, 1)
  assert.equal(state.parallelProjects[0].title, 'Jogo B')
  assert.equal(state.parallelProjects[0].productionUnitId, 'internal-1')
})

test('public demo becomes available after a quarter of development and changes hype', () => {
  let state = createInitialState({ startYear: 2006 }, fixed)
  state.player.money = 5_000_000
  state.studio.officeLevel = 4
  state = reduceGame(state, { type: 'START_PROJECT', payload: basicProject({ title: 'Demo Game' }) }, fixed)
  state.currentProject.progress = state.currentProject.totalMonths * .25
  const oldHype = state.currentProject.hype
  state = reduceGame(state, { type: 'RELEASE_DEMO', projectId: state.currentProject.id }, fixed)
  assert.ok(state.currentProject.demo)
  assert.notEqual(state.currentProject.hype, oldHype)
  assert.equal(state.queue[0]?.kind, 'info')
})

test('every processed year gets a GOTY winner even when the player released nothing', () => {
  const state = createInitialState({ startYear: 2015 }, fixed)
  state.games = []
  const results = processAwards(state, 2015, fixed)
  const goty = results.find(result => result.categoryId === 'goty')
  assert.ok(goty?.winnerTitle)
  assert.ok(goty?.winnerStudio)
  assert.equal(state.awards.yearlyWinners.length, 1)
})

test('schema 6 saves preserve old office meaning when migrating to schema 7', () => {
  const legacy = createInitialState({ startYear: 2003 }, fixed)
  legacy.schema = 6
  legacy.studio.officeLevel = 4
  delete legacy.parallelProjects
  delete legacy.studio.subsidiaries
  delete legacy.awards.yearlyWinners
  const migrated = migrateV6(legacy)
  assert.equal(migrated.schema, 7)
  assert.equal(migrated.studio.officeLevel, 8)
  assert.deepEqual(migrated.parallelProjects, [])
  assert.deepEqual(migrated.studio.subsidiaries, [])
  assert.deepEqual(migrated.awards.yearlyWinners, [])
})
