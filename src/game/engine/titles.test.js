import test from 'node:test'
import assert from 'node:assert/strict'
import { collectionTitle, franchiseName, generateTitle, remakeTitle, remasterTitle, sequelTitle, spinoffTitle, TITLE_MAX } from './titles.js'
import { mulberry32 } from './rng.js'
import { TITLE_NUMS, TITLE_PATTERNS, TITLE_WORDS } from '../data/content/titles.js'
import { RIVAL_TITLE_PATTERNS } from '../data/content/rivals.js'
import { GENRES, THEMES } from '../data/genres.js'
import { ALL_HISTORIC_GAMES } from '../data/history.js'

test('bancos de título cobrem todo gênero e tema', () => {
  assert.ok(TITLE_PATTERNS.length >= 30)
  assert.ok(TITLE_NUMS.length > 0 && RIVAL_TITLE_PATTERNS.length > 0)
  for (const key of ['noun', 'adj', 'sub', 'place', 'hero']) assert.ok(TITLE_WORDS.generic[key].length >= 40, `generic.${key}`)
  for (const theme of THEMES) for (const key of ['noun', 'adj', 'hero']) assert.ok(TITLE_WORDS.themes[theme.id]?.[key]?.length >= 10, `${theme.id}.${key}`)
  for (const genre of GENRES) for (const key of ['noun', 'adj']) assert.ok(TITLE_WORDS.genres[genre.id]?.[key]?.length >= 10, `${genre.id}.${key}`)
  // lugar com número no fim viraria outra série ("Sector 7" → "Sector")
  const places = [TITLE_WORDS.generic.place, ...THEMES.map(theme => TITLE_WORDS.themes[theme.id].place ?? [])].flat()
  assert.ok(places.every(place => !/\d$/.test(place)), 'lugar sem número no fim')
})

test('título sorteado é curto, em inglês e sem token sobrando', () => {
  const random = mulberry32(42)
  const seen = new Set()
  for (const genre of GENRES) {
    for (const theme of THEMES) {
      for (const year of [null, 1984, 1996, 2006, 2022]) {
        const title = generateTitle(genre.id, theme.id, random, year)
        assert.ok(title.length >= 3 && title.length <= TITLE_MAX, title)
        assert.ok(!/[{}]/.test(title), title)
        assert.ok(!/\b(?:Doom|Minecraft|Mario|Zelda)\b/i.test(title), title)
        assert.ok(!/\b(\w{3,})\b.*\b\1\b/i.test(title), `palavra repetida: ${title}`)
        seen.add(title)
      }
    }
  }
  assert.ok(seen.size > GENRES.length * THEMES.length * 4, 'quase nenhum título repetido')
  assert.match(generateTitle('esporte', 'futebol', () => 0.05, 1997), /\b98$/)
})

test('série continua contando: sequência, remake, remaster e coletânea', () => {
  const first = () => 0.01
  assert.equal(franchiseName('Dragon Crest II: The Lost Sigil'), 'Dragon Crest')
  assert.equal(franchiseName('Neon Viper HD Remastered'), 'Neon Viper')
  assert.equal(franchiseName('Kid Turbo'), 'Kid Turbo')
  assert.equal(sequelTitle('Pixel Patrol', 2, first), 'Pixel Patrol 2')
  assert.equal(sequelTitle('Battle Drop IV', 2, first), 'Battle Drop V')
  assert.equal(sequelTitle('Dragon Crest II: The Lost Sigil', 2, first), 'Dragon Crest III')
  assert.equal(sequelTitle('Pixel Patrol Returns', 3, first), 'Pixel Patrol 3')
  const random = mulberry32(7)
  let title = 'Emberfall'
  for (let seq = 2; seq <= 6; seq += 1) {
    title = sequelTitle(title, seq, random)
    assert.ok(title.startsWith('Emberfall'), title)
    if (seq >= 3) assert.match(title, /\b(?:\d|[IVX]+)\b/, `da terceira em diante tem número: ${title}`)
  }
  assert.match(spinoffTitle('Dragon Crest III', 'corrida', first), /^Dragon Crest /)
  assert.match(remakeTitle('Neon Viper HD', first), /^Neon Viper .*(?:Remake|Reborn)$|^Neon Viper: Reimagined$/)
  assert.ok(!remasterTitle('Neon Viper HD', first).includes('HD Remastered'))
  const series = [{ title: 'Kid Turbo', franchise: 'a' }, { title: 'Kid Turbo 2', franchise: 'a' }, { title: 'Kid Turbo III', franchise: 'a' }]
  assert.equal(collectionTitle(series, 'Bobo', first), 'Kid Turbo Trilogy')
  assert.match(collectionTitle([series[0], { title: 'Emberfall', franchise: 'b' }], 'Bobo', first), /Bobo/)
})

test('derivado de nome comprido ainda cabe no campo', () => {
  const FIELD = 34
  const long = 'Escape from Rattlesnake Ridge'
  const random = mulberry32(3)
  for (let i = 0; i < 20; i += 1) {
    for (const title of [
      remakeTitle(long, random), remasterTitle('Chronicles of the Capybara Islands', random),
      collectionTitle([{ title: long, franchise: 'a' }, { title: `${long} 2`, franchise: 'a' }], 'Bobo', random),
      collectionTitle([{ title: long, franchise: 'a' }, { title: 'Emberfall', franchise: 'b' }], 'Estudio Mega Super Ultra Bob', random),
      sequelTitle('The Legend of the Blackwater Keep', 2, random),
    ]) {
      assert.ok(title.length <= FIELD, `${title} (${title.length})`)
      assert.ok(!/\s(?:of|the|from)\s(?:Remake|HD|Collection|Classics|\d+)$/.test(title), `corte feio: ${title}`)
    }
  }
  assert.equal(remakeTitle(long, () => 0.01).length <= FIELD, true)
  assert.match(collectionTitle([{ title: long, franchise: 'a' }, { title: `${long} 2`, franchise: 'a' }], 'Bobo', () => 0.01), /^Escape from Rattlesnake/)
})

test('palavra comum que também é jogo de verdade (Turbo, Elite) volta para os títulos', () => {
  const singles = new Set(ALL_HISTORIC_GAMES.map(game => game.title.toLowerCase()).filter(title => /^[a-z]{4,}$/.test(title)))
  const random = mulberry32(11)
  let turbo = 0
  for (let i = 0; i < 2000; i += 1) {
    const title = generateTitle('corrida', 'cidade', random, 1983)
    if (/\bTurbo\b/.test(title)) turbo += 1
    // O nome exato do jogo de verdade continua proibido.
    assert.ok(!singles.has(title.split(':')[0].replace(/\s+(?:\d+|[IVX]+)$/, '').toLowerCase()), title)
  }
  assert.ok(turbo > 0, 'Turbo aparece nos títulos de corrida dos anos 80')
})
