import { ICONS } from './icons.js'
import { genreById, themeById } from '../game/data/genres.js'
import { platformById } from '../game/data/platforms.js'
import { hashString } from '../game/engine/rng.js'

const PALETTES = [
  ['#ff5d3a', '#ffb000'], ['#3a86ff', '#8338ec'], ['#06d6a0', '#118ab2'], ['#ef476f', '#ffd166'],
  ['#8338ec', '#ff006e'], ['#2ec4b6', '#cbf3f0'], ['#fb5607', '#ffbe0b'], ['#264653', '#2a9d8f'],
  ['#e63946', '#1d3557'], ['#7209b7', '#4cc9f0'], ['#f72585', '#7209b7'], ['#588157', '#dad7cd'],
  ['#ffafcc', '#a2d2ff'], ['#ff9f1c', '#2ec4b6'], ['#14213d', '#fca311'], ['#9b5de5', '#00f5d4'],
]

export function coverPalette(game) {
  return PALETTES[hashString(`${game.genre}:${game.theme}:${game.title}`) % PALETTES.length]
}

function strokeIcon(ctx, name, x, y, size, color, width = 2) {
  const paths = ICONS[name] ?? ICONS.cartridge ?? []
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

function wrapTitle(ctx, text, maxWidth) {
  const words = text.toUpperCase().split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else line = test
  }
  if (line) lines.push(line)
  return lines
}

// Capa procedural de cartucho: usada no 3D (pôster) e na interface (coleção).
export function drawCover(ctx, game, w, h) {
  const [a, b] = coverPalette(game)
  const genre = genreById(game.genre)
  const theme = themeById(game.theme)
  const platform = platformById(game.platform)
  const seed = hashString(game.id ?? game.title)
  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, a)
  grad.addColorStop(1, b)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // padrão de fundo com o ícone do gênero
  ctx.globalAlpha = .13
  const step = w / 4
  for (let row = 0; row < 6; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const offset = row % 2 ? step / 2 : 0
      strokeIcon(ctx, genre?.icon, col * step - offset, row * step * .95 + 30, step * .55, '#ffffff', 2.4)
    }
  }
  ctx.globalAlpha = 1

  // raios atrás do herói
  ctx.save()
  ctx.translate(w / 2, h * .42)
  ctx.rotate((seed % 360) * Math.PI / 180)
  ctx.fillStyle = 'rgba(255,255,255,.12)'
  for (let i = 0; i < 12; i += 1) {
    ctx.rotate(Math.PI / 6)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(w, -w * .12)
    ctx.lineTo(w, w * .12)
    ctx.fill()
  }
  ctx.restore()

  ctx.fillStyle = 'rgba(0,0,0,.18)'
  ctx.beginPath()
  ctx.arc(w / 2 + 4, h * .42 + 6, w * .27, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fffaf0'
  ctx.beginPath()
  ctx.arc(w / 2, h * .42, w * .27, 0, Math.PI * 2)
  ctx.fill()
  strokeIcon(ctx, theme?.icon, w / 2 - w * .17, h * .42 - w * .17, w * .34, a, 2.6)

  // faixa da plataforma
  ctx.fillStyle = platform?.color ?? '#222'
  ctx.fillRect(0, 0, w, h * .075)
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 ${Math.round(h * .04)}px "Martian Mono", monospace`
  ctx.textBaseline = 'middle'
  ctx.fillText((platform?.label ?? 'PC').toUpperCase(), w * .05, h * .04)

  // título
  const bandY = h * .7
  ctx.fillStyle = '#16121f'
  ctx.fillRect(0, bandY, w, h - bandY)
  ctx.fillStyle = a
  ctx.fillRect(0, bandY, w, h * .018)
  let size = Math.round(h * .09)
  ctx.font = `900 ${size}px "Bricolage Grotesque Variable", sans-serif`
  let lines = wrapTitle(ctx, game.title, w * .88)
  while ((lines.length > 2 || lines.some(line => ctx.measureText(line).width > w * .9)) && size > 12) {
    size -= 2
    ctx.font = `900 ${size}px "Bricolage Grotesque Variable", sans-serif`
    lines = wrapTitle(ctx, game.title, w * .88)
  }
  ctx.fillStyle = '#fffaf0'
  ctx.textAlign = 'left'
  const total = lines.length * size * 1.02
  lines.slice(0, 2).forEach((line, i) => ctx.fillText(line, w * .06, bandY + (h - bandY - total) / 2 + size * .55 + i * size * 1.02))
  ctx.textAlign = 'start'
}

export function coverDataUrl(game, w = 180, h = 240) {
  const canvas = document.createElement('canvas')
  canvas.width = w * 2
  canvas.height = h * 2
  const ctx = canvas.getContext('2d')
  ctx.scale(2, 2)
  drawCover(ctx, game, w, h)
  return canvas.toDataURL('image/png')
}
