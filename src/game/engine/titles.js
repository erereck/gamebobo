import {
  TITLE_BLOCKLIST, TITLE_COIN_SKIP, TITLE_EDITIONS, TITLE_ERA_PATTERNS, TITLE_GENRE_PATTERNS, TITLE_NUMS,
  TITLE_SEQUEL_WORDS, TITLE_SPINOFFS, TITLE_WORDS,
} from '../data/content/titles.js'
import { RIVAL_TITLE_PATTERNS } from '../data/content/rivals.js'
import { ALL_HISTORIC_GAMES } from '../data/history.js'
import { genreById, themeById } from '../data/genres.js'
import { pick, weighted } from './rng.js'

// Título sorteado: até 30 letras; derivados (sequência, remake...) podem ir até o limite do campo.
export const TITLE_MAX = 30
const FIELD_MAX = 34

const ERAS = ['arcade', 'cartucho', 'disco', 'indie']
// Peso de cada estilo de época conforme o ano: [arcade, cartucho, disco, indie].
const ERA_MIX = [
  [1990, [.66, .26, .06, .02]],
  [2000, [.16, .58, .18, .08]],
  [2010, [.08, .22, .5, .2]],
  [Infinity, [.05, .12, .25, .58]],
]
const MIXED = [.22, .28, .26, .24]

// Sem ano, gêneros e temas que só existem mais tarde puxam o estilo da época deles.
function eraMix(genre, theme, year) {
  const ref = year ?? Math.max(genreById(genre)?.year ?? 0, themeById(theme)?.year ?? 0)
  if (year == null && ref < 1995) return MIXED
  return ERA_MIX.find(([until]) => ref < until)[1]
}

function pickPattern(genre, mix, random) {
  const roll = random()
  const own = TITLE_GENRE_PATTERNS[genre]
  if (own?.length && roll < .3) return pick(own, random)
  if (roll < .37) return pick(RIVAL_TITLE_PATTERNS, random)
  let left = random()
  for (let i = 0; i < ERAS.length; i += 1) {
    left -= mix[i]
    if (left <= 0) return pick(TITLE_ERA_PATTERNS[ERAS[i]], random)
  }
  return pick(TITLE_ERA_PATTERNS.indie, random)
}

// Tema primeiro, depois gênero, depois o banco geral.
function word(key, genre, theme, random) {
  const own = TITLE_WORDS.themes[theme]?.[key]
  const kind = TITLE_WORDS.genres[genre]?.[key]
  const roll = random()
  if (own?.length && roll < .42) return pick(own, random)
  if (kind?.length && roll < .68) return pick(kind, random)
  return pick(TITLE_WORDS.generic[key] ?? own ?? kind ?? [''], random)
}

// Palavra inventada de indie: "Ember" + "fall". Sem letra dobrada na emenda nem pedaço repetido.
function coin(genre, theme, random) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const stem = word('stem', genre, theme, random)
    const tail = word('tail', genre, theme, random)
    const low = stem.toLowerCase()
    if (low.at(-1) === tail[0] || low.includes(tail) || tail.includes(low)) continue
    if (!TITLE_COIN_SKIP.includes(low + tail)) return stem + tail
  }
  return word('noun', genre, theme, random)
}

// Jogo de esporte leva a temporada seguinte: o de 1997 é o "98"; de 2000 em diante, ano cheio.
function season(year, random) {
  if (!year) return pick(TITLE_NUMS, random)
  const next = Math.floor(year) + 1
  return next < 2000 ? String(next).slice(2) : String(next)
}

const TOKEN = /\{(\w+)\}/g

function fill(template, genre, theme, random, year = null) {
  let text = template
  // {sub} pode trazer tokens dentro, então resolve em até três passadas.
  for (let pass = 0; pass < 3 && text.includes('{'); pass += 1) {
    text = text.replace(TOKEN, (_, key) => {
      if (key === 'num') return pick(TITLE_NUMS, random)
      if (key === 'ed') return pick(TITLE_EDITIONS, random)
      if (key === 'yy') return season(year, random)
      if (key === 'coin') return coin(genre, theme, random)
      return word(key, genre, theme, random)
    })
  }
  return tidy(text)
}

// "A Arcane Orb" vira "An Arcane Orb"; "Iara Jr.: Dark Tides" perde o ponto antes dos dois-pontos.
const tidy = text => text
  .replace(/\s+/g, ' ')
  .replace(/\.:/g, ':')
  .replace(/(^|[\s:])A (?=[AEIOÁÉÍÓ]|U(?!ni|se|su|to))/g, '$1An ')
  .trim()

const STOP = new Set(['of', 'the', 'to', 'in', 'on', 'and', 'an', 'at', 'from', 'for', 'vs'])
const NUMERIC = /^(?:\d+[a-z]*|[ivx]+)$/

// Palavras da mesma família soam como gagueira: "Star/Starfall", "Cosmic/Cosmos", "Galaxy/Galactic".
function kin(a, b) {
  if (a === b) return true
  const min = Math.min(a.length, b.length)
  if (min < 4) return false
  let same = 0
  while (same < min && a[same] === b[same]) same += 1
  return same === min || (same >= 4 && same >= min - 2)
}

// Nada de "Dragon Dragon", "Golden Gold", "Odin's Nephew's Adventure" nem "Force 64 2".
function awkward(title) {
  if ((title.match(/'s\b/g)?.length ?? 0) > 1) return true
  const words = title.toLowerCase().match(/[a-z0-9à-ÿ]+/g) ?? []
  const seen = []
  let prevNumeric = false
  for (const item of words) {
    const numeric = NUMERIC.test(item)
    if (numeric && prevNumeric) return true
    prevNumeric = numeric
    if (item.length < 2 || STOP.has(item)) continue
    if (seen.some(prev => kin(prev, item))) return true
    seen.push(item)
  }
  return false
}

const normalize = text => text.toLowerCase().replace(/[.:!?,]/g, ' ').replace(/\s+/g, ' ').trim()
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Lista de bloqueio + todos os jogos de verdade do calendário (montada uma vez só).
let blockRule = null
function blocked(title) {
  if (!blockRule) {
    const phrases = new Set(TITLE_BLOCKLIST)
    for (const game of ALL_HISTORIC_GAMES) {
      const base = normalize(game.title.split(':')[0]).replace(/\s+(?:\d+|[ivx]+)$/, '')
      if (base.length >= 4) phrases.add(base)
    }
    const list = [...phrases].sort((a, b) => b.length - a.length).map(escape).join('|')
    blockRule = new RegExp(`(?:^|[^a-z0-9à-ÿ])(?:${list})(?=$|[^a-z0-9à-ÿ])`)
  }
  return blockRule.test(normalize(title))
}

const fits = title => title.length >= 3 && title.length <= TITLE_MAX && !awkward(title) && !blocked(title)

// year é opcional: com ele, o título sai com cara da época (fliperama nos 80, protocolo nos 2000, indie depois).
export function generateTitle(genre, theme, random = Math.random, year = null) {
  const mix = eraMix(genre, theme, year)
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const title = fill(pickPattern(genre, mix, random), genre, theme, random, year)
    if (fits(title)) return title
  }
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const title = `${word('noun', genre, theme, random)} ${pick(TITLE_NUMS, random)}`
    if (fits(title)) return title
  }
  return `${word('noun', genre, theme, random) || 'Game'} 2`
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV']
// "X" sozinho fica de fora: em "Crystal Force X" é selo, não dez.
const ROMAN_STYLE = /\s(?:II|III|IV|V|VI|VII|VIII|IX)(?=:|\s|$)/
const NUMBERED = /\s+(?:Part\s+)?(?:\d+|[IVX]{1,4}|3D)$/
// Selos de edição saem do nome da série; "Turbo", "Max" e "Gold" ficam, porque também fecham nome de herói.
const TAGS = [
  'Remake', 'Remastered', 'Remaster', 'HD', 'DX', 'EX', 'Deluxe', 'Remix', 'Plus', 'Ultra', 'Extreme',
  'Champion Edition', 'Definitive Edition', 'Collection', 'Legacy Collection', 'Trilogy', 'Anthology', 'Classics', 'Greatest Hits',
]
const suffix = words => new RegExp(`\\s+(?:${words.map(escape).join('|')})$`, 'i')
const TAG = suffix(TAGS)
const SEQUEL_WORD = suffix(TITLE_SEQUEL_WORDS)

// Tira selos do fim enquanto sobrar nome: "Neon Viper HD Remastered" → "Neon Viper".
function stripTags(text, rule = TAG) {
  let base = String(text).trim()
  for (let pass = 0; pass < 3; pass += 1) {
    const next = base.replace(rule, '').trim()
    if (next.length < 3 || next === base) break
    base = next
  }
  return base
}

// Nome da série: tira subtítulo, número e selo ("Dragon Crest II: The Lost Sigil" → "Dragon Crest").
export function franchiseName(title = '') {
  const full = String(title).trim()
  let base = full.split(':')[0].trim()
  for (let pass = 0; pass < 3; pass += 1) {
    const next = stripTags(stripTags(base), SEQUEL_WORD).replace(NUMBERED, '').trim()
    if (next.length < 3 || next === base) break
    base = next
  }
  return base || full
}

// Numeral que o nome já carrega ("Battle Drop IV" → 4), para a sequência não voltar para o II.
function seriesNumber(title) {
  const head = stripTags(String(title).split(':')[0])
  const match = head.match(/\s(?:Part\s+)?(\d{1,2}|[IVX]{1,4})$/)
  if (!match || match[1] === 'X') return 0
  const value = /^\d+$/.test(match[1]) ? Number(match[1]) : ROMAN.indexOf(match[1])
  return value >= 2 && value < ROMAN.length ? value : 0
}

const subtitle = (genre, theme, random) => fill(pick(TITLE_WORDS.generic.sub, random), genre, theme, random)

function firstFit(options, fallback, random, max = FIELD_MAX) {
  const pool = [...options]
  while (pool.length) {
    const option = tidy(pool.splice(Math.floor(random() * pool.length), 1)[0])
    if (option.length <= max && !awkward(option)) return option
  }
  return fallback
}

// Sequência: "Pixel Patrol 2", "Dragon Crest III", "Shadow Protocol: Dark Tides", "Kira Volt Part II", "Emberfall Returns".
// Só a segunda parte pode vir sem número; da terceira em diante o número fica, para a próxima saber contar.
export function sequelTitle(baseTitle, number, random = Math.random, context = {}) {
  const base = franchiseName(baseTitle)
  const n = Math.max(2, Math.round(number) || 2, seriesNumber(baseTitle) + 1)
  const roman = ROMAN_STYLE.test(String(baseTitle)) && ROMAN[n]
  const num = roman || String(n)
  const plain = `${base} ${num}`
  const sub = () => subtitle(context.genre, context.theme, random)
  const forms = n === 2
    ? [[.34, () => plain], [.14, () => `${base} II`], [.18, () => `${base}: ${sub()}`], [.16, () => `${base} ${num}: ${sub()}`], [.06, () => `${base} Part II`], [.12, () => `${base} ${pick(TITLE_SEQUEL_WORDS, random)}`]]
    : [[.66, () => plain], [.26, () => `${base} ${num}: ${sub()}`], [.08, () => `${base} Part ${ROMAN[n] ?? n}`]]
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const title = tidy(weighted(forms, form => form[0], random)[1]())
    if (title.length <= TITLE_MAX && !awkward(title)) return title
  }
  return plain
}

// Spin-off: nome da série com o jeito do gênero novo ("Dragon Crest Kart", "Emberfall Café", "Pixel Patrol: Night Shift").
export function spinoffTitle(baseTitle, genre, random = Math.random, context = {}) {
  const base = franchiseName(baseTitle)
  const own = TITLE_SPINOFFS[genre] ?? []
  const forms = [
    [own.length ? .6 : 0, () => `${base} ${pick(own, random)}`],
    [.22, () => `${base} ${pick(TITLE_SPINOFFS.any, random)}`],
    [.18, () => `${base}: ${subtitle(genre, context.theme, random)}`],
  ]
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const title = tidy(weighted(forms, form => form[0], random)[1]())
    if (title.length <= TITLE_MAX && !awkward(title)) return title
  }
  // Nome comprido: ainda cabe no campo com o sufixo do gênero; senão, título novo.
  const long = `${base} ${pick(own.length ? own : TITLE_SPINOFFS.any, random)}`
  return long.length <= FIELD_MAX && !awkward(long) ? long : generateTitle(genre, context.theme, random, context.year)
}

export function remakeTitle(title, random = Math.random) {
  const clean = stripTags(title)
  const head = stripTags(clean.split(':')[0])
  const base = franchiseName(clean)
  return firstFit([`${clean} Remake`, `${head} Remake`, `${clean} Reborn`, `${base}: Reimagined`], `${base} Remake`, random)
}

export function remasterTitle(title, random = Math.random) {
  const clean = stripTags(title)
  const base = franchiseName(clean)
  return firstFit([`${clean} Remastered`, `${clean} Remastered`, `${clean} HD`, `${clean} Definitive Edition`, `${clean} Deluxe`], `${base} HD`, random)
}

// Coletânea: da mesma série vira "Collection"/"Trilogy"; misturada leva o nome do estúdio.
export function collectionTitle(sources = [], studioName = '', random = Math.random) {
  const games = sources.filter(Boolean)
  const key = game => game.franchise ?? franchiseName(game.title)
  if (games.length && games.every(game => key(game) === key(games[0]))) {
    const base = franchiseName(games[0].title)
    const kinds = games.length === 3 ? ['Trilogy', 'Trilogy', 'Collection'] : ['Collection', 'Collection', 'Anthology', 'Legacy Collection']
    return firstFit(kinds.map(kind => `${base} ${kind}`), `${base} Collection`, random)
  }
  const studio = String(studioName).trim() || 'Studio'
  return firstFit([`${studio} Classics`, `${studio} Greatest Hits`, `Best of ${studio}`, `${studio} Anthology`], `${studio} Classics`, random)
}
