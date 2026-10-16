import { TITLE_NUMS, TITLE_PATTERNS, TITLE_WORDS } from '../data/content/titles.js'
import { pick } from './rng.js'

const bank = (genre, theme, key) => [
  ...(TITLE_WORDS.themes?.[theme]?.[key] ?? []),
  ...(TITLE_WORDS.themes?.[theme]?.[key] ?? []),
  ...(TITLE_WORDS.genres?.[genre]?.[key] ?? []),
  ...(TITLE_WORDS.generic?.[key] ?? []),
]

export function generateTitle(genre, theme, random = Math.random) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const pattern = pick(TITLE_PATTERNS, random)
    let missing = false
    const title = pattern.replace(/\{(\w+)\}/g, (_, key) => {
      if (key === 'num') return pick(TITLE_NUMS, random)
      const list = bank(genre, theme, key)
      if (!list.length) {
        missing = true
        return ''
      }
      return pick(list, random)
    }).replace(/\s+/g, ' ').trim()
    if (!missing && title.length >= 3 && title.length <= 30) return title
  }
  return `${pick(bank(genre, theme, 'noun'), random) ?? 'Jogo'} ${pick(TITLE_NUMS, random)}`
}

const SEQUEL_SUFFIX = ['2', '3', '4', '5', '6', '7', '8', '9', '10']
export function sequelTitle(baseTitle, number, random = Math.random) {
  const clean = baseTitle.replace(/\s(\d+|II|III)$/, '')
  if (number === 2 && random() < .3) return `${clean}: ${pick(TITLE_WORDS.generic.sub ?? ['O Retorno'], random)}`
  return `${clean} ${SEQUEL_SUFFIX[number - 2] ?? number}`
}
