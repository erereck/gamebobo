import test from 'node:test'
import assert from 'node:assert/strict'
import { createInitialState } from './state.js'
import { calculateStudioValuation, createAcquisitionOffer, createCommissionOffer, resolveCorporateRelease, respondCorporateOffer } from './corporate.js'
import { reduceGame } from './reducer.js'
import { migrateV5 } from '../persistence/migrate.js'

const low = () => 0
const high = () => .99

const establishedState = () => {
  const state = createInitialState({ startYear: 2003 }, high)
  state.player.money = 200000000
  state.player.reputation = 82
  state.studio.reputation = 78
  state.studio.team = Array.from({ length: 4 }, (_, index) => ({ id: `person-${index}`, name: `Pessoa ${index}`, skill: 82, potential: 91, projects: 6, awards: 1, salary: 5000, energy: 100, morale: 80, loyalty: 80, roleId: 'programmer', personalityId: 'steady' }))
  state.games = Array.from({ length: 6 }, (_, index) => ({ id: `game-${index}`, title: `Jogo ${index}`, franchiseId: `ip-${index}`, score: 88, sales: 12000000, revenue: 85000000, licenseIds: [], released: `JAN ${1997 + index}` }))
  return state
}

test('valuation reacts to catalog, team and original IPs', () => {
  const small = createInitialState(low)
  const established = establishedState()
  const value = calculateStudioValuation(established)
  assert.ok(value.total > calculateStudioValuation(small).total)
  assert.equal(value.ownedOriginals, 6)
  assert.ok(value.team > 0 && value.catalog > 0 && value.originalIps > 0)
})

test('a major IP commission requires exceptional trust', () => {
  const state = establishedState()
  state.corporate.relationships.nintendo.trust = 57
  assert.equal(createCommissionOffer(state, 'nintendo', low), null)
  state.corporate.relationships.nintendo.trust = 80
  const offer = createCommissionOffer(state, 'nintendo', low)
  assert.ok(offer)
  assert.ok(['mario', 'zelda-ip', 'metroid', 'kirby', 'animal-crossing', 'pokemon'].includes(offer.licenseId))
  assert.ok(offer.scoreFloor >= 76)
  assert.equal(offer.offbeat, true)
  assert.ok(offer.concept.includes('Spin-off'))
})

test('accepting a commission grants its license and locks the matching brief', () => {
  let state = establishedState()
  state.corporate.relationships.nintendo.trust = 80
  const offer = createCommissionOffer(state, 'nintendo', low)
  respondCorporateOffer(state, offer.id, 'accept', low)
  assert.ok(state.licenses.active.some(item => item.licenseId === offer.licenseId && item.corporateCommission))
  const wrong = reduceGame(state, { type: 'START_PROJECT', payload: { title: 'Errado', genre: 'horror', theme: 'space', focus: 'gameplay', platform: 'pc', scale: 'small', licenseIds: [offer.licenseId] } }, low)
  assert.equal(wrong.currentProject, null)
  state = reduceGame(state, { type: 'START_PROJECT', payload: { title: 'Spin-off', genre: offer.genre, theme: 'fantasy', focus: 'gameplay', platform: 'pc', scale: 'small', licenseIds: [offer.licenseId] } }, low)
  assert.ok(state.currentProject)
  assert.equal(state.currentProject.corporateCommissionId, offer.id)
})

test('a strong commissioned release improves trust and pays the bonus', () => {
  const state = establishedState()
  state.corporate.relationships.nintendo.trust = 80
  const offer = createCommissionOffer(state, 'nintendo', low)
  respondCorporateOffer(state, offer.id, 'accept', low)
  state.corporate.activeCommission.projectId = 'project-1'
  const beforeMoney = state.player.money
  const result = resolveCorporateRelease(state, { id: 'game-release', corporateCommissionId: offer.id, title: 'Zelda Pequeno', score: 94 })
  assert.equal(result.success, true)
  assert.ok(state.player.money > beforeMoney)
  assert.equal(state.corporate.relationships.nintendo.completed, 1)
  assert.equal(state.corporate.activeCommission, null)
})

test('an acquisition offer can change control without ending the career', () => {
  const state = establishedState()
  state.corporate.relationships.nintendo.trust = 90
  const offer = createAcquisitionOffer(state, 'nintendo', low)
  assert.ok(offer)
  const gameCount = state.games.length
  respondCorporateOffer(state, offer.id, 'accept', low)
  assert.equal(state.studio.parentCompany, 'Nintendo')
  assert.equal(state.games.length, gameCount)
  assert.ok(state.corporate.ownership)
  assert.ok(state.studio.autonomy > 0)
})

test('schema 5 careers receive the corporate desk safely', () => {
  const old = createInitialState(low)
  old.schema = 5
  delete old.corporate
  delete old.studio.parentCompany
  const migrated = migrateV5(old)
  assert.equal(migrated.schema, 6)
  assert.ok(migrated.corporate.relationships.nintendo)
  assert.equal(migrated.studio.parentCompany, null)
})
