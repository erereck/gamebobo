// Cartazes para compartilhar: jogo (da coleção) e carreira (dos ajustes).
// Canvas 1080x1350 no estilo adesivo da interface, baixado como PNG.
import { ICONS } from './icons.js'
import { coverPalette, drawCover } from './cover.js'
import { fmtMoney, fmtNum, fmtScore, scoreColor, scoreTier } from './format.js'
import { genreById, themeById } from '../game/data/genres.js'
import { platformById } from '../game/data/platforms.js'
import { OUTLETS } from '../game/data/content/critics.js'
import { legacyTitle } from '../game/engine/progress.js'

export const POSTER_W = 1080
export const POSTER_H = 1350

const INK = '#1d1a24'
const INK_2 = '#4a4458'
const INK_3 = '#8a82a0'
const PAPER = '#fff8ec'
const PAPER_2 = '#f4ead8'
const TOMATO = '#ff5d3a'
const SUN = '#ffd23f'
const SKY = '#3fb8ff'
const MINT = '#52d977'
const FONT = '"Bricolage Grotesque Variable", "Trebuchet MS", sans-serif'
const MONO = '"Martian Mono", "Courier New", monospace'
const SAMPLE = 'AÁÃÇÉÊÕÚ aáãçéêõú 0123456789 #·–'
const CARD = { x: 40, y: 36, w: 1000, h: 1258 }
const LEFT = 84
const RIGHT = 996
// Faixa do rodapé, dentro do cartão.
const FOOT = 82
const FOOT_Y = CARD.y + CARD.h - FOOT / 2

const rad = deg => deg * Math.PI / 180
const fontOf = (size, weight = 800, family = FONT) => `${weight} ${Math.round(size)}px ${family}`

// As fontes do jogo precisam estar prontas antes do primeiro traço no canvas.
export async function posterFontsReady() {
  if (typeof document === 'undefined' || !document.fonts) return
  try {
    await Promise.all([
      document.fonts.load('800 64px "Bricolage Grotesque Variable"', SAMPLE),
      document.fonts.load('700 24px "Martian Mono"', SAMPLE),
    ])
    await document.fonts.ready
  } catch {
    // segue com a fonte reserva
  }
}

// ---------- traços básicos ----------

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

// Adesivo: sombra dura para baixo, fundo e contorno tinta. draw() pinta por dentro, em coordenadas locais.
function sticker(ctx, { x, y, w, h, r = 28, fill = '#fff', shadow = 12, line = 7, rotate = 0 }, draw = null) {
  ctx.save()
  ctx.translate(x + w / 2, y + h / 2)
  ctx.rotate(rad(rotate))
  ctx.translate(-w / 2, -h / 2)
  if (shadow) {
    ctx.fillStyle = INK
    roundRect(ctx, 0, shadow, w, h, r)
    ctx.fill()
  }
  ctx.fillStyle = fill
  roundRect(ctx, 0, 0, w, h, r)
  ctx.fill()
  if (draw) {
    ctx.save()
    roundRect(ctx, 0, 0, w, h, r)
    ctx.clip()
    draw(ctx, w, h)
    ctx.restore()
  }
  ctx.lineWidth = line
  ctx.strokeStyle = INK
  ctx.lineJoin = 'round'
  roundRect(ctx, 0, 0, w, h, r)
  ctx.stroke()
  ctx.restore()
}

function icon(ctx, name, x, y, size, color = INK, width = 2.4) {
  const paths = ICONS[name] ?? ICONS.sparkle ?? []
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size / 24, size / 24)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const d of paths) ctx.stroke(new Path2D(d))
  ctx.restore()
}

function text(ctx, value, x, y, { size = 32, weight = 800, family = FONT, color = INK, align = 'left', baseline = 'alphabetic', stroke = null, strokeWidth = 0 } = {}) {
  ctx.font = fontOf(size, weight, family)
  ctx.textAlign = align
  ctx.textBaseline = baseline
  if (stroke) {
    ctx.lineJoin = 'round'
    ctx.lineWidth = strokeWidth
    ctx.strokeStyle = stroke
    ctx.strokeText(value, x, y)
  }
  ctx.fillStyle = color
  ctx.fillText(value, x, y)
}

// Corta com reticências o que não cabe na largura (fonte já definida no ctx).
function clipText(ctx, value, maxWidth) {
  if (ctx.measureText(value).width <= maxWidth) return value
  let cut = value
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxWidth) cut = cut.slice(0, -1)
  return `${cut.trimEnd()}…`
}

function wrap(ctx, value, maxWidth) {
  const lines = []
  let line = ''
  for (const word of String(value).split(/\s+/).filter(Boolean)) {
    const test = line ? `${line} ${word}` : word
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line)
      line = word
    } else line = test
  }
  if (line) lines.push(line)
  return lines
}

// Maior fonte que cabe em até `lines` linhas; no limite, corta a última.
function fitLines(ctx, value, maxWidth, { size, min = 28, lines = 2, weight = 800, family = FONT }) {
  for (let current = size; ; current -= 4) {
    ctx.font = fontOf(current, weight, family)
    const wrapped = wrap(ctx, value, maxWidth)
    const fits = wrapped.length <= lines && wrapped.every(line => ctx.measureText(line).width <= maxWidth)
    if (fits || current - 4 < min) {
      const kept = wrapped.slice(0, lines)
      if (!fits) kept[kept.length - 1] = clipText(ctx, wrapped.slice(lines - 1).join(' '), maxWidth)
      return { size: current, lines: kept }
    }
  }
}

// Etiqueta redonda com ícone opcional. Devolve a largura usada.
function pill(ctx, label, x, y, { h = 56, size = 26, weight = 800, family = FONT, fill = INK, color = PAPER, align = 'left', rotate = 0, iconName = null, padX = 22, shadow = 6, line = 5, maxWidth = 900 } = {}) {
  ctx.font = fontOf(size, weight, family)
  const iconSize = iconName ? Math.round(size * 1.2) : 0
  const gap = iconName ? 10 : 0
  const room = maxWidth - padX * 2 - iconSize - gap
  const shown = clipText(ctx, label, room)
  const w = Math.ceil(ctx.measureText(shown).width) + padX * 2 + iconSize + gap
  const left = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x
  sticker(ctx, { x: left, y, w, h, r: h / 2, fill, shadow, line, rotate }, c => {
    let cursor = padX
    if (iconName) {
      icon(c, iconName, cursor, (h - iconSize) / 2, iconSize, color, 2.6)
      cursor += iconSize + gap
    }
    text(c, shown, cursor, h / 2 + 1, { size, weight, family, color, baseline: 'middle' })
  })
  return w
}

// Selo estrelado da nota, como etiqueta de preço.
function burstPath(ctx, cx, cy, r, points = 24, inner = .88) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i += 1) {
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
    const radius = i % 2 ? r * inner : r
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
  }
  ctx.closePath()
}

function scoreStamp(ctx, score, cx, cy, r, { label = null, rotate = -8 } = {}) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rad(rotate))
  ctx.fillStyle = INK
  burstPath(ctx, 0, r * .09, r)
  ctx.fill()
  ctx.fillStyle = scoreColor(score)
  burstPath(ctx, 0, 0, r)
  ctx.fill()
  ctx.lineWidth = Math.max(4, r * .055)
  ctx.lineJoin = 'round'
  ctx.strokeStyle = INK
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, r * .72, 0, Math.PI * 2)
  ctx.setLineDash([r * .07, r * .055])
  ctx.lineWidth = Math.max(2, r * .025)
  ctx.strokeStyle = 'rgba(29,26,36,.4)'
  ctx.stroke()
  ctx.setLineDash([])
  if (label) text(ctx, label, 0, -r * .4, { size: r * .14, weight: 700, family: MONO, align: 'center', baseline: 'middle' })
  text(ctx, fmtScore(score), 0, label ? r * .12 : r * .05, { size: r * (label ? .66 : .74), align: 'center', baseline: 'middle', color: '#fff', stroke: INK, strokeWidth: r * .1 })
  ctx.restore()
}

// Fundo colorido com retícula, raios atrás do herói e o cartão de papel por cima.
function backdrop(ctx, color, glow, center) {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, POSTER_W, POSTER_H)
  ctx.fillStyle = 'rgba(255,255,255,.2)'
  ctx.beginPath()
  for (let row = 0, y = 0; y < POSTER_H + 30; row += 1, y += 30) {
    for (let x = row % 2 ? 15 : 0; x < POSTER_W + 30; x += 30) {
      ctx.moveTo(x + 4, y)
      ctx.arc(x, y, 4, 0, Math.PI * 2)
    }
  }
  ctx.fill()
  sticker(ctx, { ...CARD, r: 56, fill: PAPER, shadow: 20, line: 9 }, (c, w, h) => {
    c.save()
    c.translate(center.x - CARD.x, center.y - CARD.y)
    c.fillStyle = glow
    c.globalAlpha = .13
    for (let i = 0; i < 16; i += 1) {
      c.rotate(Math.PI / 8)
      c.beginPath()
      c.moveTo(0, 0)
      c.lineTo(w * 1.4, -w * .13)
      c.lineTo(w * 1.4, w * .13)
      c.fill()
    }
    c.restore()
    c.fillStyle = PAPER_2
    c.fillRect(0, h - FOOT, w, FOOT)
    c.fillStyle = INK
    c.fillRect(0, h - FOOT - 2, w, 4)
  })
}

function coverCanvas(game, w, h) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  drawCover(canvas.getContext('2d'), game, w, h)
  return canvas
}

function coverSticker(ctx, game, x, y, w, h, rotate, line = 8, shadow = 16) {
  const art = coverCanvas(game, w, h)
  sticker(ctx, { x, y, w, h, r: Math.round(w * .04), fill: INK, shadow, line, rotate }, c => c.drawImage(art, 0, 0, w, h))
}

// Placa com ícone, número grande e legenda.
function statSticker(ctx, { x, y, w, h, fill, iconName, value, label, rotate = 0 }) {
  sticker(ctx, { x, y, w, h, r: 26, fill, shadow: 10, line: 6, rotate }, (c, width, height) => {
    const iconSize = Math.min(58, height * .42)
    icon(c, iconName, 24, (height - iconSize) / 2, iconSize, INK, 2.5)
    const left = 24 + iconSize + 18
    const room = width - left - 20
    const { size } = fitLines(c, value, room, { size: Math.min(64, height * .44), min: 26, lines: 1 })
    const baseline = height * .53
    text(c, value, left, baseline, { size })
    c.font = fontOf(17, 700, MONO)
    text(c, clipText(c, label.toUpperCase(), room), left, baseline + Math.min(34, height * .3), { size: 17, weight: 700, family: MONO, color: INK_2 })
  })
}

function wordmark(ctx, x, y) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rad(-4))
  text(ctx, 'gamebobo', 0, 0, { size: 40, align: 'right', baseline: 'middle', color: TOMATO, stroke: INK, strokeWidth: 9 })
  ctx.restore()
}

const slug = value => String(value ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'cartaz'

function newCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = POSTER_W
  canvas.height = POSTER_H
  return canvas
}

// ---------- cartaz do jogo ----------

export function drawGamePoster(ctx, state, game) {
  const [main, accent] = coverPalette(game)
  const cover = { x: 92, y: 160, w: 440, h: 587 }
  backdrop(ctx, main, accent, { x: cover.x + cover.w / 2, y: cover.y + cover.h / 2 })

  // cabeçalho: estúdio e ano
  const yearWidth = pill(ctx, String(game.year), RIGHT, 70, { align: 'right', fill: SUN, color: INK, family: MONO, weight: 700, size: 24, iconName: 'calendar', rotate: 3 })
  pill(ctx, state.studio?.name ?? 'Estúdio', LEFT, 70, { iconName: 'building', size: 28, rotate: -2, maxWidth: RIGHT - LEFT - yearWidth - 30 })

  coverSticker(ctx, game, cover.x, cover.y, cover.w, cover.h, -3)

  // nota média e as quatro críticas
  scoreStamp(ctx, game.score, 790, 290, 130, { label: 'NOTA' })
  pill(ctx, scoreTier(game.score), 790, 432, { align: 'center', fill: INK, color: SUN, family: MONO, weight: 700, size: 22, h: 50, rotate: 4 })
  const critics = (game.scores ?? []).slice(0, 4)
  critics.forEach((score, i) => {
    const outlet = OUTLETS.find(item => item.id === game.outlets?.[i])
    sticker(ctx, { x: 596, y: 512 + i * 78, w: 400, h: 66, r: 20, fill: '#fff', shadow: 7, line: 5, rotate: i % 2 ? .8 : -.8 }, (c, w, h) => {
      icon(c, outlet?.icon ?? 'newspaper', 16, (h - 30) / 2, 30, INK_2, 2.4)
      c.font = fontOf(18, 700, MONO)
      text(c, clipText(c, outlet?.name ?? 'Crítico', w - 150), 58, h / 2 + 1, { size: 18, weight: 700, family: MONO, baseline: 'middle' })
      text(c, String(score), w - 22, h / 2 + 3, { size: 46, align: 'right', baseline: 'middle', color: scoreColor(score), stroke: INK, strokeWidth: 7 })
    })
  })

  // título e ficha, centrados entre as críticas e os números
  const { size, lines } = fitLines(ctx, game.title, RIGHT - LEFT, { size: 96, min: 44, lines: 2 })
  const titleTop = 832 + (244 - (lines.length * size * .98 + 40)) / 2
  lines.forEach((line, i) => text(ctx, line, LEFT, titleTop + size * .82 + i * size * .98, { size, stroke: PAPER, strokeWidth: 12 }))
  const genre = [genreById(game.genre)?.label, genreById(game.genre2)?.label].filter(Boolean).join(' + ')
  const platforms = game.platforms?.length > 1 ? ` +${game.platforms.length - 1}` : ''
  const meta = [genre, themeById(game.theme)?.label, `${platformById(game.platform)?.label ?? 'PC'}${platforms}`].filter(Boolean).join(' · ').toUpperCase()
  const metaY = titleTop + size * .82 + (lines.length - 1) * size * .98 + 42
  ctx.font = fontOf(22, 700, MONO)
  text(ctx, clipText(ctx, meta, RIGHT - LEFT), LEFT, metaY, { size: 22, weight: 700, family: MONO, color: INK_2 })

  // números
  const trophies = (state.trophies ?? []).filter(trophy => trophy.title === game.title && trophy.year >= game.year)
  const statY = 1090
  const statW = 290
  const gap = (RIGHT - LEFT - statW * 3) / 2
  statSticker(ctx, { x: LEFT, y: statY, w: statW, h: 96, fill: SUN, iconName: 'disc', value: fmtNum(game.sold ?? 0), label: 'cópias', rotate: -1.5 })
  statSticker(ctx, { x: LEFT + statW + gap, y: statY, w: statW, h: 96, fill: SKY, iconName: 'chart', value: game.peak ? `#${game.peak}` : '—', label: 'nas paradas', rotate: 1 })
  statSticker(ctx, { x: LEFT + (statW + gap) * 2, y: statY, w: statW, h: 96, fill: trophies.length ? TOMATO : MINT, iconName: 'trophy', value: String(trophies.length), label: trophies.length === 1 ? 'troféu' : 'troféus', rotate: -1 })

  // rodapé: troféus pelo nome (ou a receita) e a marca
  let cursor = LEFT
  const footerY = FOOT_Y - 22
  const chips = trophies.length
    ? trophies.slice(0, 3).map(trophy => ({ label: trophy.label, iconName: 'trophy', fill: SUN }))
    : [{ label: `${fmtMoney(game.revenue ?? 0)} de receita`, iconName: 'cash', fill: '#fff' }]
  for (const chip of chips) {
    const room = RIGHT - 250 - cursor
    if (room < 140) break
    cursor += pill(ctx, chip.label, cursor, footerY, { h: 44, size: 17, weight: 700, family: MONO, fill: chip.fill, color: INK, iconName: chip.iconName, padX: 16, shadow: 5, line: 4, maxWidth: room }) + 12
  }
  wordmark(ctx, RIGHT, FOOT_Y)
}

// ---------- cartaz da carreira ----------

// Retrato do fundador, igual ao Avatar.jsx (viewBox 48), pintado no canvas.
function drawAvatar(ctx, look, cx, cy, radius) {
  const s = radius / 23
  const fillStroke = (fill, width, stroke = INK) => {
    if (fill) { ctx.fillStyle = fill; ctx.fill() }
    if (width) { ctx.lineWidth = width; ctx.strokeStyle = stroke; ctx.stroke() }
  }
  const circle = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2) }
  const ellipse = (x, y, rx, ry) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2) }
  const style = look.hairStyle
  const hair = look.hair
  ctx.save()
  ctx.translate(cx - 24 * s, cy - 24 * s)
  ctx.scale(s, s)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  circle(24, 24, 23)
  fillStroke('#fff3df', 0)
  ctx.save()
  circle(24, 24, 22.6)
  ctx.clip()
  ellipse(24, 50, 17, 13)
  fillStroke(look.shirt, 1.6)
  if (style === 'longo') { roundRect(ctx, 11, 18, 26, 22, 8); fillStroke(hair, 0) }
  if (style === 'black') { circle(24, 18, 15); fillStroke(hair, 0) }
  circle(24, 23, 12.5)
  fillStroke(look.skin, 1.6)
  if (style !== 'careca' && style !== 'black' && style !== 'moicano') {
    ctx.fillStyle = hair
    const top = new Path2D('M11.6 22 C11 12 18 9.5 24 9.5 C30 9.5 37 12 36.4 22 C33 17 28 15.6 24 15.6 C20 15.6 15 17 11.6 22 Z')
    ctx.fill(top)
    ctx.lineWidth = 1.4
    ctx.strokeStyle = INK
    ctx.stroke(top)
  }
  if (style === 'moicano') { roundRect(ctx, 21.5, 7, 5, 9, 2); fillStroke(hair, 1.2) }
  if (style === 'coque') { circle(24, 8.5, 4.5); fillStroke(hair, 1.4) }
  if (style === 'cacheado') for (const x of [12, 17, 24, 31, 36]) { circle(x, x === 24 ? 11 : 14, 4.2); fillStroke(hair, 1.2) }
  if (style === 'franja') { roundRect(ctx, 15, 14, 18, 5, 2); fillStroke(hair, 0) }
  if (style === 'rabo') { ellipse(36, 22, 3.2, 6); fillStroke(hair, 1.2) }
  ellipse(19.5, 24.5, 1.6, 2.1)
  fillStroke(INK, 0)
  ellipse(28.5, 24.5, 1.6, 2.1)
  fillStroke(INK, 0)
  ctx.globalAlpha = .5
  circle(16.4, 28.4, 1.8)
  fillStroke('#ff8f8f', 0)
  circle(31.6, 28.4, 1.8)
  fillStroke('#ff8f8f', 0)
  ctx.globalAlpha = 1
  ctx.beginPath()
  ctx.moveTo(21, 30)
  ctx.quadraticCurveTo(24, 32.4, 27, 30)
  fillStroke(null, 1.4)
  if (look.extra === 'oculos') {
    circle(19.5, 24.5, 3.3)
    fillStroke(null, 1.3)
    circle(28.5, 24.5, 3.3)
    fillStroke(null, 1.3)
    ctx.beginPath()
    ctx.moveTo(22.8, 24.5)
    ctx.lineTo(25.2, 24.5)
    fillStroke(null, 1.3)
  }
  if (look.extra === 'bone') {
    const cap = new Path2D('M11.5 19 C12 10 36 10 36.5 19 Z M30 17.5 h11 v2.5 h-11 z')
    ctx.fillStyle = look.shirt
    ctx.fill(cap)
    ctx.lineWidth = 1.3
    ctx.strokeStyle = INK
    ctx.stroke(cap)
  }
  if (look.extra === 'fone') {
    ctx.beginPath()
    ctx.moveTo(11, 23)
    ctx.bezierCurveTo(11, 9, 37, 9, 37, 23)
    fillStroke(null, 2.4, '#2b2f3a')
    roundRect(ctx, 8.5, 20, 5, 8, 2)
    fillStroke(TOMATO, 1.2)
    roundRect(ctx, 34.5, 20, 5, 8, 2)
    fillStroke(TOMATO, 1.2)
  }
  ctx.restore()
  circle(24, 24, 23)
  fillStroke(null, 1.6)
  ctx.restore()
}

const DEFAULT_LOOK = { skin: '#f2c29b', hair: '#3b2a20', hairStyle: 'curto', shirt: TOMATO, extra: null }

// Os quatro melhores: nota primeiro, vendas no desempate.
const bestGames = games => [...games].sort((a, b) => b.score - a.score || (b.sold ?? 0) - (a.sold ?? 0)).slice(0, 4)

export function drawCareerPoster(ctx, state) {
  const founder = state.staff?.find(person => person.founder) ?? state.staff?.[0] ?? null
  const founded = state.studio?.founded ?? state.startYear ?? state.year
  const games = state.games ?? []
  const best = bestGames(games)
  const avatar = { x: 214, y: 296, r: 118 }
  backdrop(ctx, founder?.look?.shirt ?? TOMATO, SUN, avatar)

  // cabeçalho
  pill(ctx, founded === state.year ? String(founded) : `${founded}–${state.year}`, RIGHT, 70, { align: 'right', fill: SUN, color: INK, family: MONO, weight: 700, size: 24, iconName: 'calendar', rotate: 3 })
  pill(ctx, 'CARREIRA', LEFT, 70, { fill: TOMATO, color: '#fff', iconName: 'crown', size: 26, rotate: -2 })

  // fundador, estúdio e título de legado
  ctx.fillStyle = INK
  ctx.beginPath()
  ctx.arc(avatar.x, avatar.y + 14, avatar.r, 0, Math.PI * 2)
  ctx.fill()
  drawAvatar(ctx, founder?.look ?? DEFAULT_LOOK, avatar.x, avatar.y, avatar.r)
  ctx.beginPath()
  ctx.arc(avatar.x, avatar.y, avatar.r, 0, Math.PI * 2)
  ctx.lineWidth = 8
  ctx.strokeStyle = INK
  ctx.stroke()

  const nameLeft = 372
  const room = RIGHT - nameLeft
  const studio = fitLines(ctx, state.studio?.name ?? 'Estúdio', room, { size: 88, min: 40, lines: 2 })
  const block = studio.lines.length * studio.size * .98 + 34 + 26 + 64
  let y = avatar.y - block / 2
  studio.lines.forEach((line, i) => text(ctx, line, nameLeft, y + studio.size * .82 + i * studio.size * .98, { size: studio.size, stroke: PAPER, strokeWidth: 10 }))
  y += studio.lines.length * studio.size * .98 + 30
  ctx.font = fontOf(21, 700, MONO)
  text(ctx, clipText(ctx, `${founder?.name ?? 'Você'} · desde ${founded}`.toUpperCase(), room), nameLeft, y, { size: 21, weight: 700, family: MONO, color: INK_2 })
  pill(ctx, legacyTitle(state.legacy ?? 0).label, nameLeft, y + 26, { h: 64, size: 32, fill: SUN, color: INK, iconName: 'crown', rotate: -3, maxWidth: room })

  // estante com os melhores cartuchos
  text(ctx, 'MELHORES JOGOS', LEFT, 526, { size: 18, weight: 700, family: MONO, color: INK_2 })
  const coverW = 200
  const coverH = 267
  const coverGap = (RIGHT - LEFT - coverW * 4) / 3
  const tilt = [-4, 3, -2.5, 4]
  for (let i = 0; i < 4; i += 1) {
    const game = best[i]
    const x = LEFT + i * (coverW + coverGap)
    const top = 572
    if (!game) {
      ctx.save()
      ctx.setLineDash([14, 10])
      ctx.lineWidth = 5
      ctx.strokeStyle = INK_3
      roundRect(ctx, x, top, coverW, coverH, 12)
      ctx.stroke()
      ctx.restore()
      icon(ctx, 'question', x + coverW / 2 - 30, top + coverH / 2 - 30, 60, INK_3, 2.2)
      continue
    }
    coverSticker(ctx, game, x, top, coverW, coverH, tilt[i], 6, 10)
    scoreStamp(ctx, game.score, x + coverW - 12, top + 18, 44, { rotate: tilt[i] * 2 })
    text(ctx, String(game.year), x + coverW / 2, top + coverH + 50, { size: 20, weight: 700, family: MONO, align: 'center', color: INK_2 })
  }

  // números da carreira
  const totalCopies = state.stats?.totalCopies ?? games.reduce((sum, game) => sum + (game.sold ?? 0), 0)
  const trophies = state.trophies?.length ?? 0
  const goty = (state.goty ?? []).filter(entry => entry.mine).length
  const numberOnes = state.stats?.chartNumberOnes ?? 0
  const statW = (RIGHT - LEFT - 24) / 2
  const statH = 116
  const top = 914
  statSticker(ctx, { x: LEFT, y: top, w: statW, h: statH, fill: SUN, iconName: 'disc', value: fmtNum(totalCopies), label: 'cópias vendidas', rotate: -1 })
  statSticker(ctx, { x: LEFT + statW + 24, y: top, w: statW, h: statH, fill: SKY, iconName: 'trophy', value: String(trophies), label: trophies === 1 ? 'troféu' : 'troféus', rotate: 1 })
  statSticker(ctx, { x: LEFT, y: top + statH + 22, w: statW, h: statH, fill: TOMATO, iconName: 'crown', value: String(goty), label: goty === 1 ? 'jogo do ano' : 'jogos do ano', rotate: .8 })
  statSticker(ctx, { x: LEFT + statW + 24, y: top + statH + 22, w: statW, h: statH, fill: MINT, iconName: 'chart', value: String(numberOnes), label: 'nº 1 nas paradas', rotate: -1.2 })

  // rodapé
  const footerY = FOOT_Y
  const bestScore = games.reduce((max, game) => Math.max(max, game.score), 0)
  const summary = [`${games.length} ${games.length === 1 ? 'jogo' : 'jogos'}`, bestScore ? `melhor nota ${fmtScore(bestScore)}` : null, `${fmtNum(state.fans ?? 0)} fãs`].filter(Boolean).join(' · ').toUpperCase()
  ctx.font = fontOf(19, 700, MONO)
  text(ctx, clipText(ctx, summary, RIGHT - LEFT - 260), LEFT, footerY, { size: 19, weight: 700, family: MONO, color: INK_2, baseline: 'middle' })
  wordmark(ctx, RIGHT, footerY)
}

// ---------- gerar e baixar ----------

export async function renderGamePoster(state, game) {
  await posterFontsReady()
  const canvas = newCanvas()
  drawGamePoster(canvas.getContext('2d'), state, game)
  return canvas
}

export async function renderCareerPoster(state) {
  await posterFontsReady()
  const canvas = newCanvas()
  drawCareerPoster(canvas.getContext('2d'), state)
  return canvas
}

function downloadCanvas(canvas, name) {
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      if (!blob) return resolve(false)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = name
      link.rel = 'noopener'
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 4000)
      resolve(true)
    }, 'image/png')
  })
}

export async function downloadGamePoster(state, game) {
  if (!game) return false
  return downloadCanvas(await renderGamePoster(state, game), `gamebobo-${slug(game.title)}.png`)
}

export async function downloadCareerPoster(state) {
  return downloadCanvas(await renderCareerPoster(state), `gamebobo-carreira-${slug(state.studio?.name)}.png`)
}
