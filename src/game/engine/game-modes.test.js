import test from 'node:test'
import assert from 'node:assert/strict'
import { projectTypeValid } from '../data/projectTypes.js'
import { hydrateV7 } from '../persistence/migrateV7.js'
import { acquireSubsidiary } from './production.js'
import { calculateRelease } from './scoring.js'
import { createInitialState } from './state.js'
import { hireCandidate, hiringSearchCost } from './studio.js'
import { createProductionTeam, productionPaceForUnit } from './teamManagement.js'
import { adjustScoreForMode, modeAwardPenalty, modeAwardThresholdBonus, modeRevenueMultiplier } from './gameModes.js'

const fixed = () => .5

const payload = overrides => ({
  title: 'Modo Teste', projectType: 'original', genres: ['action'], themes: ['space'], genre: 'action', theme: 'space',
  focus: 'gameplay', scale: 'small', platforms: ['pc'], platform: 'pc', sourceGameIds: [], franchiseId: '',
  ...overrides,
})

const releaseProject = overrides => ({
  ...payload(),
  id: 'project-mode',
  promiseId: 'precise-controls', promiseFit: 2, promiseAudience: 'hardcore', scopeMonths: 0,
  productionUnitId: 'founder', quality: 82, innovation: 18, reach: 0, pressure: 8, bugs: 0, hype: 35,
  expectation: 0, licenseIds: [], licenseRoyalty: 0, launchPlan: 'campaign', directMargin: 0, publisher: null,
  isSequel: false, sequelNumber: 1, accessoryId: null, controlScheme: 'standard',
  ...overrides,
})

test('traditional mode remains the unmodified baseline', () => {
  const state = createInitialState({ startYear: 2006, modeId: 'traditional' }, fixed)
  assert.equal(state.careerMode.id, 'traditional')
  assert.equal(modeRevenueMultiplier(state), 1)
  assert.equal(modeAwardPenalty(state), 0)
  assert.equal(adjustScoreForMode(state, 96), 96)
})

test('realistic mode preserves sales but cuts game revenue and compresses elite scores', () => {
  const traditional = createInitialState({ startYear: 2006, modeId: 'traditional' }, fixed)
  const realistic = createInitialState({ startYear: 2006, modeId: 'realistic' }, fixed)
  const project = releaseProject()

  const normalRelease = calculateRelease(traditional, project, fixed)
  const realisticRelease = calculateRelease(realistic, project, fixed)

  assert.equal(realisticRelease.sales, normalRelease.sales)
  assert.equal(realisticRelease.revenue, Math.round(normalRelease.revenue * .7))
  assert.ok(realisticRelease.score <= normalRelease.score)
  assert.ok(adjustScoreForMode(realistic, 96) <= 92)
  assert.equal(modeAwardPenalty(realistic), 8)
  assert.equal(modeAwardThresholdBonus(realistic), 6)
})

test('portable mode starts at the first playable handheld date and blocks non-portable platforms', () => {
  const state = createInitialState({ startYear: 1980, modeId: 'portable' }, fixed)
  assert.equal(state.date.year, 1989)
  assert.equal(state.date.month, 3)
  assert.equal(projectTypeValid(state, payload({ platforms: ['game-boy'], platform: 'game-boy' })), true)
  assert.equal(projectTypeValid(state, payload({ platforms: ['pc'], platform: 'pc' })), false)
  assert.equal(projectTypeValid(state, payload({ platforms: ['mega-drive'], platform: 'mega-drive' })), false)
})

test('arcade empire accepts arcade and rejects every ordinary home platform', () => {
  const state = createInitialState({ startYear: 1980, modeId: 'arcade-empire' }, fixed)
  assert.equal(projectTypeValid(state, payload({ platforms: ['arcade'], platform: 'arcade' })), true)
  assert.equal(projectTypeValid(state, payload({ platforms: ['pc'], platform: 'pc' })), false)
  assert.equal(projectTypeValid(state, payload({ platforms: ['atari-2600'], platform: 'atari-2600' })), false)
})

test('single franchise locks the whole career as soon as the first project exists', () => {
  const state = createInitialState({ startYear: 2006, modeId: 'single-franchise' }, fixed)
  assert.equal(projectTypeValid(state, payload()), true)

  state.currentProject = { id: 'first', title: 'Saga Única', franchiseId: 'franchise-a', franchiseName: 'Saga Única' }
  assert.equal(projectTypeValid(state, payload()), false)
  assert.equal(projectTypeValid(state, payload({ projectType: 'sequel', franchiseId: 'franchise-a' })), true)
  assert.equal(projectTypeValid(state, payload({ projectType: 'sequel', franchiseId: 'franchise-b' })), false)
})

test('anthology mode only allows fresh original IP projects', () => {
  const state = createInitialState({ startYear: 2006, modeId: 'anthology' }, fixed)
  assert.equal(projectTypeValid(state, payload()), true)
  assert.equal(projectTypeValid(state, payload({ projectType: 'sequel', franchiseId: 'old-franchise' })), false)
  assert.equal(projectTypeValid(state, payload({ franchiseId: 'old-franchise' })), false)
})

test('solo mode hard-blocks hiring, new teams and studio acquisitions while increasing pace', () => {
  const solo = createInitialState({ startYear: 2020, modeId: 'solo' }, fixed)
  const baseline = createInitialState({ startYear: 2020, modeId: 'traditional' }, fixed)
  solo.player.money = 50_000_000
  baseline.player.money = 50_000_000

  assert.equal(hiringSearchCost(solo), Number.POSITIVE_INFINITY)
  assert.equal(hireCandidate(solo, 'missing'), false)
  assert.equal(createProductionTeam(solo), null)
  assert.equal(acquireSubsidiary(solo, 'glass-engine'), null)
  assert.ok(productionPaceForUnit(solo, 'founder') > productionPaceForUnit(baseline, 'founder'))
})

test('eternal indie blocks medium scale and acquisitions but keeps small games valid', () => {
  const state = createInitialState({ startYear: 2020, modeId: 'eternal-indie' }, fixed)
  state.player.money = 50_000_000
  assert.equal(projectTypeValid(state, payload({ scale: 'small' })), true)
  assert.equal(projectTypeValid(state, payload({ scale: 'medium' })), false)
  assert.equal(acquireSubsidiary(state, 'glass-engine'), null)
})

test('acquired mode starts inside a parent company with a small working team', () => {
  const state = createInitialState({ startYear: 2006, modeId: 'acquired' }, fixed)
  assert.equal(state.careerMode.id, 'acquired')
  assert.ok(state.corporate.ownership?.companyId)
  assert.ok(state.studio.parentCompany)
  assert.equal(state.studio.team.length, 3)
  assert.equal(state.studio.officeLevel, 2)
  assert.ok(state.player.reputation >= 42)
  assert.ok(state.studio.reputation >= 38)
})

test('old schema 7 saves hydrate as traditional without changing their career data', () => {
  const legacy = createInitialState({ startYear: 2003, modeId: 'traditional' }, fixed)
  legacy.player.money = 123456
  delete legacy.careerMode
  const hydrated = hydrateV7(legacy)
  assert.equal(hydrated.careerMode.id, 'traditional')
  assert.equal(hydrated.player.money, 123456)
})
