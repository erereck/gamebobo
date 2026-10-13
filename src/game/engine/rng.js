// Gerador determinístico para testes e simulações; o jogo usa Math.random.
export function mulberry32(seed) {
  let a = seed >>> 0
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
export const lerp = (a, b, t) => a + (b - a) * t
export const pick = (list, random = Math.random) => list[Math.floor(random() * list.length)]
export const int = (min, max, random = Math.random) => Math.floor(min + random() * (max - min + 1))
export const chance = (p, random = Math.random) => random() < p

export function gauss(random = Math.random) {
  let u = 0
  let v = 0
  while (u === 0) u = random()
  while (v === 0) v = random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function weighted(list, weightOf, random = Math.random) {
  const total = list.reduce((sum, item) => sum + Math.max(0, weightOf(item)), 0)
  if (total <= 0) return null
  let roll = random() * total
  for (const item of list) {
    roll -= Math.max(0, weightOf(item))
    if (roll <= 0) return item
  }
  return list.at(-1)
}

export function shuffle(list, random = Math.random) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function sample(list, count, random = Math.random) {
  return shuffle(list, random).slice(0, count)
}

let idCounter = 0
export const makeId = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`

export const hashString = text => {
  let h = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
