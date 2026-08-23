import test from 'node:test'
import assert from 'node:assert/strict'
import { createInitialState } from '../engine/state.js'
import { deleteSaveSlot, getActiveSaveSlot, listSaveSlots, loadGame, MAX_SAVE_SLOTS, saveGame, setActiveSaveSlot } from './storage.js'

class MemoryStorage {
  constructor() { this.values = new Map() }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null }
  setItem(key, value) { this.values.set(String(key), String(value)) }
  removeItem(key) { this.values.delete(String(key)) }
  clear() { this.values.clear() }
}

const fixed = () => .5
const resetStorage = () => { globalThis.localStorage = new MemoryStorage() }

test('supports exactly ten independent local save slots', () => {
  resetStorage()
  assert.equal(MAX_SAVE_SLOTS, 10)
  const first = createInitialState({ startYear: 1980, playerName: 'Um', studioName: 'Studio Um' }, fixed)
  const second = createInitialState({ startYear: 2000, playerName: 'Dois', studioName: 'Studio Dois' }, fixed)
  first.player.money = 111_111
  second.player.money = 222_222

  saveGame(first, 1)
  saveGame(second, 2)

  assert.equal(loadGame(1).player.money, 111_111)
  assert.equal(loadGame(2).player.money, 222_222)
  assert.equal(loadGame(1).studio.name, 'Studio Um')
  assert.equal(loadGame(2).studio.name, 'Studio Dois')
  assert.equal(listSaveSlots().length, 10)
  assert.equal(listSaveSlots().filter(slot => !slot.empty).length, 2)
})

test('saving one slot never mutates another slot', () => {
  resetStorage()
  const first = createInitialState({ startYear: 1990, studioName: 'A' }, fixed)
  const second = createInitialState({ startYear: 2010, studioName: 'B' }, fixed)
  saveGame(first, 1)
  saveGame(second, 2)

  const changedSecond = loadGame(2)
  changedSecond.player.money = 9_999_999
  changedSecond.studio.name = 'B Alterado'
  saveGame(changedSecond, 2)

  assert.equal(loadGame(1).studio.name, 'A')
  assert.notEqual(loadGame(1).player.money, 9_999_999)
  assert.equal(loadGame(2).studio.name, 'B Alterado')
})

test('old single-save key migrates automatically into slot one', () => {
  resetStorage()
  const legacySingle = createInitialState({ startYear: 1995, playerName: 'Legado', studioName: 'Memoria' }, fixed)
  localStorage.setItem('gamebobo-save', JSON.stringify(legacySingle))

  const slots = listSaveSlots()
  assert.equal(slots[0].empty, false)
  assert.equal(slots[0].studioName, 'Memoria')
  assert.equal(loadGame(1).player.name, 'Legado')
  assert.equal(localStorage.getItem('gamebobo-save'), null)
  assert.equal(getActiveSaveSlot(), 1)
})

test('deleting the active slot keeps other careers intact and selects another occupied slot', () => {
  resetStorage()
  saveGame(createInitialState({ startYear: 1980, studioName: 'Primeiro' }, fixed), 1)
  saveGame(createInitialState({ startYear: 2005, studioName: 'Segundo' }, fixed), 2)
  setActiveSaveSlot(1)

  deleteSaveSlot(1)

  assert.equal(loadGame(1), null)
  assert.equal(loadGame(2).studio.name, 'Segundo')
  assert.equal(getActiveSaveSlot(), 2)
})
