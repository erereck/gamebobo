import test from 'node:test'
import assert from 'node:assert/strict'
import { createInitialState } from './state.js'
import { reduceGame } from './reducer.js'
import { importLicensePack, licenseEligibility, licenseFromState, projectLicenseReadout } from './licensing.js'

const high = () => .99

test('a small unknown studio is refused a major IP for a concrete reason', () => {
  const state = createInitialState({ startYear: 2020 }, high)
  const check = licenseEligibility(state, 'batman')
  assert.equal(check.allowed, false)
  assert.ok(check.reasons.some(reason => reason.includes('Reputação')))
})

test('an established studio can negotiate and sign a license', () => {
  let state = createInitialState({ startYear: 2020 }, high)
  state.player.reputation = 100
  state.studio.reputation = 100
  state.player.money = 100000000
  state.awards.trophies.push({ id: 'goty' })
  state = reduceGame(state, { type: 'REQUEST_LICENSE', licenseId: 'batman' }, high)
  assert.equal(state.licenses.offers.length, 1)
  state = reduceGame(state, { type: 'ACCEPT_LICENSE_OFFER', offerId: state.licenses.offers[0].id }, high)
  assert.equal(state.licenses.active[0].licenseId, 'batman')
  assert.ok(state.player.money < 100000000)
})

test('two signed IPs create crossover reach and stack royalties', () => {
  const state = createInitialState({ startYear: 2020 }, high)
  state.licenses.active = [
    { id: 'a', licenseId: 'batman', royalty: .14, clauses: [] },
    { id: 'b', licenseId: 'lego', royalty: .12, clauses: [] },
  ]
  const readout = projectLicenseReadout(state, { licenseIds: ['batman', 'lego'], genre: 'action', theme: 'crime' })
  assert.equal(readout.crossover, true)
  assert.equal(readout.royalty, .26)
  assert.ok(readout.reachMultiplier > 1)
})

test('a valid external JSON pack joins the same licensing economy', () => {
  const state = createInitialState({ startYear: 2000 }, high)
  const result = importLicensePack(state, { name: 'Teste', licenses: [{ id: 'heroi-local', name: 'Herói Local', owner: 'Autor', kind: 'character', baseCost: 500000, royalty: .1 }] })
  assert.equal(result.imported, 1)
  assert.equal(licenseFromState(state, 'mod-heroi-local').name, 'Herói Local')
  assert.ok(state.licenses.catalog['mod-heroi-local'])
})

test('a licensed release writes back into the IP history and contract', () => {
  let state = createInitialState({ startYear: 2020 }, high)
  state.player.money = 1000000
  state.licenses.active = [{ id: 'contract-lego', licenseId: 'lego', royalty: .14, clauses: [], trust: 50, projects: 0, breaches: 0, status: 'active', expiresYear: 2024, expiresMonth: 0 }]
  state = reduceGame(state, { type: 'START_PROJECT', payload: { title: 'Bloco Zero', genre: 'puzzle', theme: 'fantasy', focus: 'gameplay', platform: 'pc', scale: 'micro', licenseIds: ['lego'] } }, high)
  for (let month = 0; month < 3; month += 1) {
    state.queue = []
    state = reduceGame(state, { type: 'MONTH_ACTION', payload: { action: 'develop' } }, high)
  }
  assert.equal(state.games[0].licenseIds[0], 'lego')
  assert.equal(state.licenses.active[0].projects, 1)
  assert.equal(state.licenses.catalog.lego.history[0].title, 'Bloco Zero')
})
