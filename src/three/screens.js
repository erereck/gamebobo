import * as THREE from 'three'

// Telas vivas dos computadores. Cada era tem seu sistema (BASIC azul, IDE de
// texto, janelas cinza, Luna azul, Aero, tema escuro, holograma) e cada função
// tem seu programa: código, pintura/3D, música, documento de design, descanso
// de tela e um joguinho. Os canvas são pequenos e só se redesenham enquanto
// alguém está olhando para eles.

const TAU = Math.PI * 2

export const SCREEN_STYLE = { fliper: 'c64', cartucho: 'dos', cd: 'win9x', lanhouse: 'xp', app: 'aero', stream: 'dark', algoritmo: 'ultra', futuro: 'holo' }
const SIZE = { c64: [160, 120], dos: [160, 120], win9x: [160, 120], xp: [160, 120], aero: [192, 108], dark: [192, 108], ultra: [256, 110], holo: [192, 108], arcade: [160, 112] }
const CRT = new Set(['c64', 'dos', 'win9x', 'arcade'])
const FPS = { code: 6, art: 8, sound: 10, idea: 5, idle: 8, game: 12 }

const hash = (a, b = 0, c = 0) => {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul((b | 0) + 7, 668265263) ^ Math.imul((c | 0) + 13, 1274126177)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}
const fill = (ctx, x, y, w, h, color) => {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}
const txt = (ctx, text, x, y, color, size = 6, weight = '') => {
  ctx.fillStyle = color
  ctx.font = `${weight} ${size}px monospace`
  ctx.textBaseline = 'top'
  ctx.fillText(text, x, y)
}
const line = (ctx, x1, y1, x2, y2, color, width = 1) => {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}
const roundRect = (ctx, x, y, w, h, r, color) => {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
}
// Borda em relevo das janelas cinza dos anos 90.
const bevel = (ctx, x, y, w, h, inset = false) => {
  fill(ctx, x, y, w, 1, inset ? '#808080' : '#ffffff')
  fill(ctx, x, y, 1, h, inset ? '#808080' : '#ffffff')
  fill(ctx, x, y + h - 1, w, 1, inset ? '#ffffff' : '#404040')
  fill(ctx, x + w - 1, y, 1, h, inset ? '#ffffff' : '#404040')
}
const gradient = (ctx, x, y, w, h, a, b, vertical = true) => {
  const g = vertical ? ctx.createLinearGradient(x, y, x, y + h) : ctx.createLinearGradient(x, y, x + w, y)
  g.addColorStop(0, a)
  g.addColorStop(1, b)
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
}

// ---------- sprites de pixel ----------
const SPRITES = [
  { rows: ['..hhhhhh..', '.hhhhhhhh.', '.hssssssh.', '.sesssses.', '.ssssssss.', '..sssmss..', '..cccccc..', '.sccccccs.', '..pppppp..', '..pp..pp..'], colors: { h: '#7a3b1e', s: '#ffc58f', e: '#1d1a24', m: '#e2504c', c: '#ff5d3a', p: '#2d4fb8' } },
  { rows: ['..........', '...gggg...', '..gggggg..', '.gggggggg.', '.gwkggwkg.', 'gggggggggg', 'gggggggggg', 'gglgggglgg', '.gggggggg.', '..........'], colors: { g: '#52d977', w: '#ffffff', k: '#1d1a24', l: '#b5ffc8' } },
  { rows: ['....rr....', '....ww....', '...wwww...', '...wbbw...', '..wwbbww..', '.wwwwwwww.', 'wwrwwwwrww', 'w.r....r.w', '..o....o..', '..y....y..'], colors: { r: '#ff3b5c', w: '#e8ecff', b: '#3fb8ff', o: '#ff9f1c', y: '#ffd23f' } },
  { rows: ['..k....k..', '...k..k...', '..kkkkkk..', '.kkwkkwkk.', 'kkkkkkkkkk', 'k.kkkkkk.k', 'k.k....k.k', '...kk.kk..', '..........', '..........'], colors: { k: '#b57bff', w: '#ffffff' } },
]

function sprite(ctx, index, x, y, px, reveal = Infinity, tint = null) {
  const { rows, colors } = SPRITES[index % SPRITES.length]
  let n = 0
  for (let r = 0; r < rows.length; r += 1) {
    for (let c = 0; c < rows[r].length; c += 1) {
      const key = rows[r][c]
      if (key === '.') continue
      if (n++ >= reveal) return
      ctx.fillStyle = tint ?? colors[key]
      ctx.fillRect(Math.round(x + c * px), Math.round(y + r * px), Math.ceil(px), Math.ceil(px))
    }
  }
}
const spriteSize = index => SPRITES[index % SPRITES.length].rows.join('').replace(/\./g, '').length

// ---------- boneco 3D de caixas para os programas de modelagem ----------
const BOXES = [
  { c: [0, 1.15, 0], e: [.55, .5, .5], color: [255, 197, 143] },
  { c: [0, 1.62, -.04], e: [.6, .14, .55], color: [122, 59, 30] },
  { c: [0, .45, 0], e: [.36, .3, .24], color: [255, 93, 58] },
  { c: [-.16, .08, 0], e: [.12, .1, .14], color: [45, 79, 184] },
  { c: [.16, .08, 0], e: [.12, .1, .14], color: [45, 79, 184] },
]
const FACES = [[0, 1, 2, 3, [0, 0, -1]], [5, 4, 7, 6, [0, 0, 1]], [4, 0, 3, 7, [-1, 0, 0]], [1, 5, 6, 2, [1, 0, 0]], [3, 2, 6, 7, [0, 1, 0]], [4, 5, 1, 0, [0, -1, 0]]]
const corners = ({ c, e }) => [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]].map(([x, y, z]) => [c[0] + x * e[0], c[1] + y * e[1], c[2] + z * e[2]])

// view: 'persp' gira; 'front', 'side', 'top' são ortográficas.
function model(ctx, cx, cy, scale, angle, mode, view = 'persp', stroke = '#ffffff') {
  const ca = Math.cos(angle)
  const sa = Math.sin(angle)
  const tilt = view === 'persp' ? .32 : 0
  const ct = Math.cos(tilt)
  const st = Math.sin(tilt)
  const project = ([x, y, z]) => {
    if (view === 'front') return [cx + x * scale, cy - (y - .9) * scale, z]
    if (view === 'side') return [cx + z * scale, cy - (y - .9) * scale, x]
    if (view === 'top') return [cx + x * scale, cy + z * scale, -y]
    const rx = x * ca + z * sa
    const rz = -x * sa + z * ca
    const ry = (y - .9) * ct - rz * st
    const dz = (y - .9) * st + rz * ct
    const p = 3.4 / (3.4 + dz)
    return [cx + rx * scale * p, cy - ry * scale * p, dz]
  }
  const faces = []
  for (const b of BOXES) {
    const pts = corners(b).map(project)
    for (const [a, b2, c, d, n] of FACES) {
      const nx = n[0] * ca + n[2] * sa
      const nz = -n[0] * sa + n[2] * ca
      const ny = n[1] * ct - nz * st
      const light = Math.max(.25, .55 + nx * .3 + ny * .45 - (n[1] * st + nz * ct) * .2)
      faces.push({ pts: [pts[a], pts[b2], pts[c], pts[d]], z: (pts[a][2] + pts[b2][2] + pts[c][2] + pts[d][2]) / 4, color: b.color, light })
    }
  }
  if (mode === 'wire') {
    ctx.strokeStyle = stroke
    ctx.lineWidth = .7
    for (const f of faces) {
      ctx.beginPath()
      f.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
      ctx.closePath()
      ctx.stroke()
    }
    return
  }
  faces.sort((a, b) => b.z - a.z)
  for (const f of faces) {
    const [r, g, b] = f.color
    ctx.fillStyle = `rgb(${Math.min(255, r * f.light) | 0},${Math.min(255, g * f.light) | 0},${Math.min(255, b * f.light) | 0})`
    ctx.beginPath()
    f.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.closePath()
    ctx.fill()
  }
}

// ---------- conteúdo ----------
// Código sendo digitado linha a linha; quando a tela enche, rola.
function code(ctx, r, t, pal, v) {
  if (pal.bg) fill(ctx, r.x, r.y, r.w, r.h, pal.bg)
  const lh = pal.lh ?? 6
  const rows = Math.max(1, Math.floor((r.h - 3) / lh))
  const typed = t * 1.35 + v * 17
  const total = Math.floor(typed)
  const frac = typed - total
  const start = Math.max(0, total - rows + 1)
  const gutter = pal.basic ? 15 : pal.gutter ? 10 : 2
  let cursorX = r.x + gutter
  let cursorY = r.y + 2
  for (let i = 0; i < rows; i += 1) {
    const n = start + i
    if (n > total) break
    const y = r.y + 2 + i * lh
    if (pal.basic) txt(ctx, String((n + 1) * 10), r.x + 1, y, pal.text[0], lh - 1)
    else if (pal.gutter) fill(ctx, r.x + 2, y + 1, 4 + (n % 10 > 4 ? 2 : 0), lh - 3, pal.dim)
    const k = n % 7
    const indent = k === 0 || k === 6 ? 0 : 1 + (hash(n, v) > .55 ? 1 : 0)
    let x = r.x + gutter + indent * 6
    const tokens = k === 6 ? 1 : 1 + Math.floor(hash(n, v, 1) * 4.5)
    const limit = n === total ? frac : 1
    let width = 0
    const parts = []
    for (let j = 0; j < tokens; j += 1) {
      const w = k === 6 ? 4 : 4 + Math.floor(hash(n, v, j + 2) * 20)
      parts.push(w)
      width += w + 3
    }
    const visible = width * limit
    let drawn = 0
    parts.forEach((w, j) => {
      if (drawn >= visible || x > r.x + r.w - 4) return
      const ww = Math.min(w, visible - drawn, r.x + r.w - 3 - x)
      const color = k === 0 && j === 0 ? pal.text[0] : pal.text[(Math.floor(hash(n, j, v) * 97)) % pal.text.length]
      fill(ctx, x, y + 1, ww, lh - 3, color)
      x += w + 3
      drawn += w + 3
    })
    if (n === total) {
      cursorX = Math.min(x, r.x + r.w - 4)
      cursorY = y
    }
  }
  if ((t * 2.4) % 1 < .55) fill(ctx, cursorX, cursorY + 1, pal.basic ? 4 : 1.5, lh - 2, pal.cursor ?? pal.text[1])
}

function art(ctx, r, t, pal, v) {
  const mode = pal.art
  if (mode === 'sprite' || mode === 'paint') {
    fill(ctx, r.x, r.y, r.w, r.h, pal.bg)
    const index = v % 2 ? 1 : 0
    const total = spriteSize(index)
    const step = Math.floor(t * 10 + v * 13) % (total + 26)
    if (mode === 'paint') {
      // pôr do sol pontilhado e montanhas de pixel, como num programa de pintura dos anos 80
      const bands = ['#2b1055', '#5c1a7a', '#a6297a', '#e0466a', '#ff8f4a', '#ffd23f']
      bands.forEach((color, i) => fill(ctx, r.x, r.y + i * r.h * .1, r.w, r.h * .1 + 1, color))
      ctx.fillStyle = '#1d1a24'
      for (let x = 0; x < r.w; x += 4) {
        const hgt = 18 + Math.abs(Math.sin(x * .07 + v)) * 22 + Math.sin(x * .23) * 5
        ctx.fillRect(r.x + x, r.y + r.h - hgt, 4, hgt)
      }
      fill(ctx, r.x, r.y + r.h - 10, r.w, 10, '#3c6e47')
      sprite(ctx, index, r.x + r.w * .55, r.y + r.h - 46, 3.4, step)
    } else {
      const px = Math.min((r.w - 30) / 10, (r.h - 6) / 10)
      const ox = r.x + 4
      const oy = r.y + 3
      ctx.strokeStyle = pal.dim
      ctx.lineWidth = .5
      for (let i = 0; i <= 10; i += 1) {
        line(ctx, ox + i * px, oy, ox + i * px, oy + 10 * px, pal.dim, .5)
        line(ctx, ox, oy + i * px, ox + 10 * px, oy + i * px, pal.dim, .5)
      }
      sprite(ctx, index, ox, oy, px, step)
      // prévia em tamanho real e paleta
      sprite(ctx, index, r.x + r.w - 22, r.y + 6, 1.6)
      const swatches = ['#000000', '#ffffff', '#ff5d3a', '#ffd23f', '#52d977', '#3fb8ff', '#b57bff', '#ffc58f']
      swatches.forEach((color, i) => fill(ctx, r.x + r.w - 22 + (i % 2) * 9, r.y + 26 + Math.floor(i / 2) * 8, 8, 7, color))
    }
    return
  }
  if (mode === 'wire4') {
    fill(ctx, r.x, r.y, r.w, r.h, '#4a4a4a')
    const hw = (r.w - 3) / 2
    const hh = (r.h - 3) / 2
    const views = ['top', 'front', 'side', 'persp']
    views.forEach((view, i) => {
      const x = r.x + 1 + (i % 2) * (hw + 1)
      const y = r.y + 1 + Math.floor(i / 2) * (hh + 1)
      fill(ctx, x, y, hw, hh, '#6b6b6b')
      for (let g = 6; g < hw; g += 8) line(ctx, x + g, y, x + g, y + hh, '#777', .5)
      for (let g = 6; g < hh; g += 8) line(ctx, x, y + g, x + hw, y + g, '#777', .5)
      ctx.save()
      ctx.beginPath()
      ctx.rect(x, y, hw, hh)
      ctx.clip()
      model(ctx, x + hw / 2, y + hh / 2 + (view === 'top' ? 0 : 2), hh * .42, t * .9, 'wire', view, view === 'persp' ? '#ffffff' : '#d8d8d8')
      ctx.restore()
      if (view === 'persp') {
        ctx.strokeStyle = '#ffd23f'
        ctx.lineWidth = 1
        ctx.strokeRect(x + .5, y + .5, hw - 1, hh - 1)
      }
      txt(ctx, view === 'persp' ? 'Persp' : view === 'top' ? 'Top' : view === 'front' ? 'Front' : 'Left', x + 2, y + 1, '#e8e8e8', 5)
    })
    return
  }
  if (mode === 'shaded' || mode === 'scene') {
    fill(ctx, r.x, r.y, r.w, r.h, pal.bg)
    let vx = r.x
    let vy = r.y
    let vw = r.w
    let vh = r.h
    if (mode === 'scene') {
      const side = Math.round(r.w * .2)
      fill(ctx, r.x, r.y, side, r.h, pal.panel)
      fill(ctx, r.x + r.w - side, r.y, side, r.h, pal.panel)
      for (let i = 0; i < 9; i += 1) fill(ctx, r.x + 3 + (i % 3 === 0 ? 0 : 4), r.y + 4 + i * 6, side * (.4 + hash(i, v) * .4), 3, i === 3 ? pal.accent : pal.line)
      for (let i = 0; i < 7; i += 1) {
        fill(ctx, r.x + r.w - side + 3, r.y + 4 + i * 7, side * .35, 3, pal.line)
        fill(ctx, r.x + r.w - side * .5, r.y + 4 + i * 7, side * .4, 3, i === 2 ? pal.accent : pal.input)
      }
      vx = r.x + side + 1
      vw = r.w - side * 2 - 2
      vh = r.h - 12
      // tira de arquivos
      for (let i = 0; i < 6; i += 1) fill(ctx, vx + 2 + i * 10, r.y + r.h - 10, 8, 8, ['#ff7a45', '#3fb8ff', '#b57bff', '#ffc93c', '#52d977', '#ff6bd6'][(i + v) % 6])
      gradient(ctx, vx, vy, vw, vh, pal.skyA, pal.skyB)
      // botão de play
      fill(ctx, vx + vw / 2 - 5, vy + 1, 10, 5, pal.panel)
      ctx.fillStyle = pal.accent
      ctx.beginPath()
      ctx.moveTo(vx + vw / 2 - 2, vy + 2)
      ctx.lineTo(vx + vw / 2 + 2, vy + 3.5)
      ctx.lineTo(vx + vw / 2 - 2, vy + 5)
      ctx.fill()
    }
    // chão em grade com perspectiva
    const horizon = vy + vh * .55
    ctx.strokeStyle = pal.grid
    ctx.lineWidth = .5
    for (let i = -6; i <= 6; i += 1) line(ctx, vx + vw / 2 + i * 3, horizon, vx + vw / 2 + i * vw * .18, vy + vh, pal.grid, .5)
    for (let i = 1; i < 6; i += 1) {
      const y = horizon + (vy + vh - horizon) * (i / 6) ** 1.6
      line(ctx, vx, y, vx + vw, y, pal.grid, .5)
    }
    ctx.save()
    ctx.beginPath()
    ctx.rect(vx, vy, vw, vh)
    ctx.clip()
    model(ctx, vx + vw / 2, vy + vh * .55, vh * .3, t * .8 + v, 'shade')
    if (mode === 'shaded') model(ctx, vx + vw / 2, vy + vh * .55, vh * .3, t * .8 + v, 'wire', 'persp', 'rgba(255,255,255,.25)')
    ctx.restore()
    return
  }
  // holograma: boneco em arame girando
  model(ctx, r.x + r.w / 2, r.y + r.h * .6, r.h * .32, t * 1.1, 'wire', 'persp', pal.text[0])
  for (let i = 0; i < 3; i += 1) {
    ctx.strokeStyle = pal.text[2]
    ctx.globalAlpha = .5
    ctx.beginPath()
    ctx.ellipse(r.x + r.w / 2, r.y + r.h * .92, 18 + i * 9 + Math.sin(t * 2 + i) * 2, 4 + i * 2, 0, 0, TAU)
    ctx.stroke()
    ctx.globalAlpha = 1
  }
}

const NOTES = ['C-', 'C#', 'D-', 'D#', 'E-', 'F-', 'F#', 'G-', 'G#', 'A-', 'A#', 'B-']

function sound(ctx, r, t, pal, v) {
  const mode = pal.sound
  if (pal.bg) fill(ctx, r.x, r.y, r.w, r.h, pal.bg)
  if (mode === 'sid' || mode === 'tracker') {
    if (pal.vu) {
      // medidores do painel cinza de cima
      for (let i = 0; i < 4; i += 1) {
        const level = .2 + .8 * Math.abs(Math.sin(t * (6 + i * 1.7) + i)) * hash(Math.floor(t * 9), i)
        const full = r.y - 8
        fill(ctx, 4 + i * 10, 4 + full * (1 - level), 8, full * level, level > .8 ? '#ff5555' : '#55ff55')
      }
    }
    const lh = 7
    const rows = Math.floor(r.h / lh)
    const pos = t * 7 + v * 31
    const current = Math.floor(pos)
    const mid = Math.floor(rows / 2)
    const channels = mode === 'sid' ? 3 : 4
    const colW = (r.w - 12) / channels
    fill(ctx, r.x, r.y + mid * lh, r.w, lh, pal.highlight)
    for (let i = 0; i < rows; i += 1) {
      const n = current - mid + i
      if (n < 0) continue
      const y = r.y + i * lh
      txt(ctx, String(n % 64).padStart(2, '0'), r.x + 1, y + .5, pal.dim, 5)
      for (let c = 0; c < channels; c += 1) {
        const x = r.x + 12 + c * colW
        const h = hash(n, c, v)
        if (h < .42) txt(ctx, `${NOTES[Math.floor(h * 100) % 12]}${3 + (c % 2)}`, x, y + .5, i === mid ? '#ffffff' : pal.text[c % pal.text.length], 5)
        else txt(ctx, '---', x, y + .5, pal.dim, 5)
      }
    }
    return
  }
  if (mode === 'waves') {
    const lanes = 4
    const lh = (r.h - 6) / lanes
    fill(ctx, r.x, r.y, r.w, 5, '#c0c0c0')
    for (let x = 0; x < r.w; x += 10) fill(ctx, r.x + x, r.y + 2, 1, 3, '#404040')
    const colors = ['#4ce06b', '#ffd23f', '#3fb8ff', '#ff6b6b']
    for (let l = 0; l < lanes; l += 1) {
      const y0 = r.y + 6 + l * lh
      fill(ctx, r.x, y0, r.w, lh - 1, l % 2 ? '#141414' : '#1d1d1d')
      ctx.strokeStyle = colors[(l + v) % colors.length]
      ctx.lineWidth = .8
      ctx.beginPath()
      for (let x = 0; x < r.w; x += 1.5) {
        const env = Math.abs(Math.sin(x * .05 + l * 2 + v)) * (hash(Math.floor(x / 12), l, v) > .25 ? 1 : .15)
        const a = Math.sin(x * (1.3 + l * .4)) * env * (lh * .42)
        ctx.moveTo(r.x + x, y0 + lh / 2 - a)
        ctx.lineTo(r.x + x, y0 + lh / 2 + a)
      }
      ctx.stroke()
    }
    const head = r.x + ((t * 16 + v * 40) % r.w)
    fill(ctx, head, r.y, 1, r.h, '#ffffff')
    return
  }
  if (mode === 'steps') {
    const rowsN = 5
    const steps = 16
    const lh = (r.h - 8) / rowsN
    const sw = (r.w - 30) / steps
    const now = Math.floor(t * 8) % steps
    const labels = ['#ff9f1c', '#3fb8ff', '#52d977', '#ff6bd6', '#ffd23f']
    for (let row = 0; row < rowsN; row += 1) {
      const y = r.y + 4 + row * lh
      roundRect(ctx, r.x + 2, y, 24, lh - 2, 1.5, '#3b454c')
      fill(ctx, r.x + 4, y + 2, 3, lh - 6, labels[row])
      for (let s = 0; s < steps; s += 1) {
        const on = hash(row, s, v) < (row === 0 ? .3 : .38) || (row === 0 && s % 4 === 0)
        const group = Math.floor(s / 4) % 2 ? '#556068' : '#46525a'
        const lit = on && s === now
        roundRect(ctx, r.x + 28 + s * sw, y, sw - 1, lh - 2, 1, lit ? '#ffffff' : on ? labels[row] : group)
      }
    }
    fill(ctx, r.x + 28 + now * sw, r.y + 1, sw - 1, 2, '#ff5d3a')
    return
  }
  if (mode === 'daw') {
    const tracks = 5
    const top = r.y + 6
    const th = (r.h - 16) / tracks
    fill(ctx, r.x, r.y, r.w, 5, pal.panel)
    for (let x = 0; x < r.w; x += 12) fill(ctx, r.x + x, r.y + 2, 1, 3, pal.dim)
    const colors = ['#ff7a45', '#3fb8ff', '#b57bff', '#52d977', '#ffc93c', '#ff6bd6']
    for (let k = 0; k < tracks; k += 1) {
      const y = top + k * th
      fill(ctx, r.x, y, 20, th - 1, pal.panel)
      fill(ctx, r.x + 2, y + 2, 3, th - 5, colors[(k + v) % colors.length])
      let x = r.x + 22 + Math.floor(hash(k, v) * 14)
      while (x < r.x + r.w - 8) {
        const w = 14 + Math.floor(hash(k, x, v) * 36)
        const cw = Math.min(w, r.x + r.w - x - 2)
        const color = colors[(k + v) % colors.length]
        roundRect(ctx, x, y + 1, cw, th - 3, 1.5, color)
        ctx.globalAlpha = .45
        for (let i = 2; i < cw - 1; i += 2) {
          const a = (hash(k, x + i) * .8 + .2) * (th - 7) / 2
          fill(ctx, x + i, y + th / 2 - a - .5, 1, a * 2, '#1d1a24')
        }
        ctx.globalAlpha = 1
        x += w + 4 + Math.floor(hash(x, k) * 12)
      }
    }
    const head = r.x + 22 + ((t * 18 + v * 30) % (r.w - 24))
    fill(ctx, head, r.y, 1, r.h - 9, '#ffffff')
    // medidores
    for (let i = 0; i < 8; i += 1) {
      const level = .3 + .7 * Math.abs(Math.sin(t * (5 + i) + i * 1.3)) * hash(Math.floor(t * 8), i)
      fill(ctx, r.x + 22 + i * 6, r.y + r.h - 8, 4, 7, pal.panel)
      fill(ctx, r.x + 22 + i * 6, r.y + r.h - 1 - 7 * level, 4, 7 * level, level > .85 ? '#ff5d3a' : '#52d977')
    }
    return
  }
  // holograma: espectro em círculo
  const cx = r.x + r.w / 2
  const cy = r.y + r.h / 2
  const base = r.h * .22
  for (let i = 0; i < 48; i += 1) {
    const a = i / 48 * TAU + t * .3
    const len = base * (.25 + .9 * Math.abs(Math.sin(t * 4 + i * .7)) * hash(Math.floor(t * 10), i))
    line(ctx, cx + Math.cos(a) * base, cy + Math.sin(a) * base, cx + Math.cos(a) * (base + len), cy + Math.sin(a) * (base + len), i % 3 ? pal.text[0] : pal.text[2], 1.4)
  }
  ctx.strokeStyle = pal.text[1]
  ctx.beginPath()
  ctx.arc(cx, cy, base * .8, 0, TAU)
  ctx.stroke()
}

const STICKY = ['#ffe066', '#ff9ec7', '#9ef0b0', '#9fd6ff', '#ffc38a']

function idea(ctx, r, t, pal, v) {
  const mode = pal.idea
  if (mode === 'board') {
    fill(ctx, r.x, r.y, r.w, r.h, pal.bg)
    ctx.fillStyle = '#d9d3c7'
    for (let x = 4; x < r.w; x += 8) for (let y = 4; y < r.h; y += 8) ctx.fillRect(r.x + x, r.y + y, 1, 1)
    const cols = 3
    const cw = (r.w - 8) / cols
    for (let c = 0; c < cols; c += 1) {
      fill(ctx, r.x + 4 + c * cw + 2, r.y + 3, cw - 8, 3, '#bdb5a6')
      for (let i = 0; i < 3 - (c === 2 ? 1 : 0); i += 1) {
        const color = STICKY[(c * 2 + i + v) % STICKY.length]
        const x = r.x + 6 + c * cw + (hash(c, i, v) - .5) * 4
        const y = r.y + 10 + i * (r.h * .27)
        fill(ctx, x + 1, y + 1, cw - 10, r.h * .22, 'rgba(0,0,0,.15)')
        fill(ctx, x, y, cw - 10, r.h * .22, color)
        for (let l = 0; l < 3; l += 1) fill(ctx, x + 3, y + 4 + l * 4, (cw - 18) * (.5 + hash(c, i, l) * .5), 1.5, 'rgba(29,26,36,.55)')
      }
    }
    // um cartão sendo arrastado de uma coluna para a outra
    const p = (t * .22 + v * .3) % 1
    const ease = p < .7 ? 0 : (p - .7) / .3
    const from = r.x + 6 + cw * (Math.floor(t * .22 + v * .3) % 2)
    const x = from + cw * ease * ease * (3 - 2 * ease)
    const y = r.y + 10 + r.h * .54 - Math.sin(ease * Math.PI) * 8
    fill(ctx, x + 2, y + 2, cw - 10, r.h * .22, 'rgba(0,0,0,.2)')
    fill(ctx, x, y, cw - 10, r.h * .22, STICKY[(v + 3) % STICKY.length])
    ctx.fillStyle = '#1d1a24'
    ctx.beginPath()
    ctx.moveTo(x + cw * .5, y + 6)
    ctx.lineTo(x + cw * .5, y + 13)
    ctx.lineTo(x + cw * .5 + 2, y + 11)
    ctx.lineTo(x + cw * .5 + 4.5, y + 13)
    ctx.fill()
    return
  }
  if (mode === 'holo') {
    const nodes = []
    for (let i = 0; i < 7; i += 1) {
      const a = i / 7 * TAU + t * .15
      nodes.push([r.x + r.w / 2 + Math.cos(a) * r.w * .32 * (i % 2 ? .6 : 1), r.y + r.h / 2 + Math.sin(a) * r.h * .34 * (i % 2 ? .6 : 1)])
    }
    nodes.forEach(([x, y], i) => {
      line(ctx, r.x + r.w / 2, r.y + r.h / 2, x, y, pal.text[1], .6)
      const pulse = 2 + Math.sin(t * 3 + i) * .8
      ctx.fillStyle = i % 2 ? pal.text[2] : pal.text[0]
      ctx.beginPath()
      ctx.arc(x, y, pulse, 0, TAU)
      ctx.fill()
    })
    ctx.fillStyle = pal.text[3]
    ctx.beginPath()
    ctx.arc(r.x + r.w / 2, r.y + r.h / 2, 4 + Math.sin(t * 2), 0, TAU)
    ctx.fill()
    return
  }
  // documento de design: título, tópicos, caixas marcadas e um rabisco de fase
  fill(ctx, r.x, r.y, r.w, r.h, pal.bg)
  let page = r
  if (mode === 'word') {
    fill(ctx, r.x, r.y, r.w, 4, '#f0f0f0')
    for (let x = 6; x < r.w; x += 6) fill(ctx, r.x + x, r.y + 2, .6, 2, '#808080')
    page = { x: r.x + r.w * .1, y: r.y + 6, w: r.w * .8, h: r.h - 6 }
    fill(ctx, page.x, page.y, page.w, page.h, '#ffffff')
  }
  const ink = pal.text[0]
  const lh = pal.lh ?? 6
  const typed = t * 1.2 + v * 5
  const rows = Math.floor((page.h - 4) / lh)
  const total = Math.min(Math.floor(typed) % (rows + 6), rows)
  fill(ctx, page.x + 4, page.y + 3, page.w * .5, lh - 1, pal.title ?? ink)
  for (let i = 1; i < rows && i <= total; i += 1) {
    const y = page.y + 3 + i * lh
    if (i === 4 && mode !== 'text') {
      // rabisco de fase: plataformas e um pulo pontilhado
      const bx = page.x + page.w * .55
      ctx.strokeStyle = ink
      ctx.lineWidth = .8
      ctx.strokeRect(bx, y - lh * 3 + 2, page.w * .4, lh * 3)
      line(ctx, bx + 2, y + 1, bx + page.w * .15, y + 1, ink)
      line(ctx, bx + page.w * .22, y - 4, bx + page.w * .38, y - 4, ink)
      ctx.setLineDash([1, 1.5])
      ctx.beginPath()
      ctx.moveTo(bx + page.w * .1, y)
      ctx.quadraticCurveTo(bx + page.w * .2, y - lh * 2.4, bx + page.w * .28, y - 5)
      ctx.stroke()
      ctx.setLineDash([])
    }
    const check = i % 3 === 1
    if (check) {
      ctx.strokeStyle = ink
      ctx.lineWidth = .6
      ctx.strokeRect(page.x + 5, y + .5, lh - 2.5, lh - 2.5)
      if (i < total - 1) fill(ctx, page.x + 6, y + 1.5, lh - 4.5, lh - 4.5, pal.accent ?? ink)
    } else txt(ctx, mode === 'text' ? '>' : '•', page.x + 4, y - .5, pal.dim, lh)
    const width = (i >= 2 && i <= 6 && mode !== 'text' ? page.w * .45 : page.w * .8) * (.4 + hash(i, v) * .6)
    fill(ctx, page.x + 5 + lh, y + 1, i === total ? width * ((typed % 1)) : width, lh - 3.5, i % 4 === 0 ? (pal.accent ?? ink) : ink)
  }
}

// ---------- jogos ----------
function game(ctx, x, y, w, h, t, v, retro = true, shooter = false) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  if (shooter) {
    fill(ctx, x, y, w, h, '#05030f')
    for (let i = 0; i < 40; i += 1) {
      const sy = (hash(i, 1) * h + t * (12 + hash(i, 2) * 30)) % h
      fill(ctx, x + hash(i, 3) * w, y + sy, 1, i % 5 ? 1 : 2, i % 4 ? '#8899ff' : '#ffffff')
    }
    const px = Math.max(1.4, w / 90)
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 6; col += 1) {
        if (hash(row, col, Math.floor(t / 6)) < .15) continue
        sprite(ctx, 3, x + w * .12 + col * w * .13 + Math.sin(t * 1.5) * w * .06, y + h * .1 + row * h * .13, px * .8, Infinity, ['#ff6bd6', '#52d977', '#ffd23f'][row])
      }
    }
    const ship = x + w / 2 + Math.sin(t * 1.7) * w * .3
    sprite(ctx, 2, ship - 5 * px, y + h - 12 * px, px)
    for (let b = 0; b < 3; b += 1) {
      const by = y + h - 14 * px - ((t * 70 + b * 30) % (h * .8))
      fill(ctx, ship - .5, by, 1.5, 4, '#fff27a')
    }
    txt(ctx, `1UP ${String(Math.floor(t * 37) % 100000).padStart(5, '0')}`, x + 3, y + 2, '#ff5d3a', 6)
    ctx.restore()
    return
  }
  const px = Math.max(1.5, h / 48)
  if (retro) fill(ctx, x, y, w, h, ['#5c94fc', '#ffb46b', '#1a1a3a'][v % 3])
  else gradient(ctx, x, y, w, h, ['#6fd3ff', '#ffb0c8', '#2a2465'][v % 3], ['#c7f1ff', '#ffe3b0', '#7c4dff'][v % 3])
  const scroll = t * 24
  // morros ao fundo
  ctx.fillStyle = retro ? '#3c9b3c' : 'rgba(60,170,110,.75)'
  for (let i = -1; i < 5; i += 1) {
    const hx = x + ((i * 60 - scroll * .4) % (w + 60) + w + 60) % (w + 60) - 30
    ctx.beginPath()
    ctx.ellipse(hx, y + h * .78, 26, h * .3, 0, Math.PI, 0)
    ctx.fill()
  }
  // chão em blocos
  const ground = y + h - px * 8
  const tile = px * 8
  for (let gx = -((scroll) % tile); gx < w; gx += tile) {
    fill(ctx, x + gx, ground, tile - .5, h, retro ? '#c84c0c' : '#7b5b3a')
    fill(ctx, x + gx, ground, tile - .5, px * 1.5, retro ? '#fcbcb0' : '#5fd068')
  }
  // moedas e blocos flutuando
  for (let i = 0; i < 6; i += 1) {
    const cx = x + ((i * 47 + 20 - scroll) % (w + 40) + w + 40) % (w + 40) - 20
    const cy = ground - tile * (1.8 + (i % 3) * .7)
    if (i % 2) fill(ctx, cx, cy, tile * .8, tile * .8, retro ? '#ffcc33' : '#ffd23f')
    else {
      ctx.fillStyle = '#ffe14d'
      ctx.beginPath()
      ctx.ellipse(cx + 3, cy + 3, 2 * Math.abs(Math.cos(t * 4 + i)) + .5, 3, 0, 0, TAU)
      ctx.fill()
    }
  }
  // herói pulando
  const jump = Math.max(0, Math.sin(t * 3.2)) * tile * 2.2
  sprite(ctx, 0, x + w * .3, ground - px * 10 - jump, px)
  const enemyX = x + ((w * 1.2 - scroll * 1.3) % (w + 30) + w + 30) % (w + 30) - 15
  sprite(ctx, 1, enemyX, ground - px * 10, px)
  txt(ctx, `★${String(Math.floor(t * 3) % 100).padStart(2, '0')}`, x + 3, y + 2, retro ? '#ffffff' : '#1d1a24', 6, 'bold')
  ctx.restore()
}

// ---------- descanso de tela ----------
function idle(ctx, style, w, h, t, v) {
  if (style === 'c64') {
    fill(ctx, 0, 0, w, h, '#7b71d6')
    fill(ctx, 12, 10, w - 24, h - 20, '#40318d')
    txt(ctx, '**** BOBO BASIC V2 ****', 16, 14, '#a59ff2', 6)
    txt(ctx, '64K RAM  38911 BYTES FREE', 16, 24, '#a59ff2', 6)
    txt(ctx, 'READY.', 16, 38, '#a59ff2', 6)
    if ((t * 1.6) % 1 < .5) fill(ctx, 16, 46, 5, 6, '#a59ff2')
    return
  }
  if (style === 'dos') {
    // campo de estrelas
    fill(ctx, 0, 0, w, h, '#000000')
    for (let i = 0; i < 70; i += 1) {
      const z = 1 - ((hash(i, v) + t * .18) % 1)
      const sx = w / 2 + (hash(i, 1) - .5) * w * .5 / z
      const sy = h / 2 + (hash(i, 2) - .5) * h * .5 / z
      const s = Math.max(.6, (1 - z) * 2.6)
      fill(ctx, sx, sy, s, s, z < .3 ? '#ffffff' : '#9aa0b5')
    }
    return
  }
  if (style === 'win9x') {
    // canos em 3D crescendo
    fill(ctx, 0, 0, w, h, '#000000')
    const cycle = Math.floor(t / 14)
    const grow = Math.floor((t % 14) * 9)
    const cell = 10
    const colors = ['#d43c3c', '#3c8fd4', '#d4c43c', '#3cd46a']
    for (let p = 0; p < 3; p += 1) {
      let cx = Math.floor(hash(p, cycle, v) * (w / cell))
      let cy = Math.floor(hash(p, cycle, 9) * (h / cell))
      let dir = Math.floor(hash(p, cycle, 4) * 4)
      for (let s = 0; s < Math.min(grow - p * 20, 70); s += 1) {
        if (hash(p, s, cycle) < .25) dir = (dir + (hash(s, p) < .5 ? 1 : 3)) % 4
        const nx = cx + [1, 0, -1, 0][dir]
        const ny = cy + [0, 1, 0, -1][dir]
        if (nx < 0 || ny < 0 || nx >= w / cell || ny >= h / cell) {
          dir = (dir + 2) % 4
          continue
        }
        const color = colors[(p + cycle) % colors.length]
        line(ctx, cx * cell + 5, cy * cell + 5, nx * cell + 5, ny * cell + 5, color, 5)
        line(ctx, cx * cell + 4.5, cy * cell + 4.5, nx * cell + 4.5, ny * cell + 4.5, 'rgba(255,255,255,.45)', 1.2)
        cx = nx
        cy = ny
      }
    }
    return
  }
  if (style === 'xp') {
    bliss(ctx, w, h, t)
    for (let i = 0; i < 4; i += 1) {
      fill(ctx, 4, 4 + i * 16, 9, 9, ['#ffd23f', '#3fb8ff', '#ff7a45', '#52d977'][i])
      fill(ctx, 3, 14 + i * 16, 11, 2, 'rgba(255,255,255,.8)')
    }
    xpTaskbar(ctx, w, h)
    // logo do estúdio quicando pela tela
    const bx = Math.abs(((t * 22 + v * 40) % ((w - 40) * 2)) - (w - 40))
    const by = Math.abs(((t * 15 + v * 25) % ((h - 30) * 2)) - (h - 30))
    roundRect(ctx, bx + 2, by + 4, 36, 14, 4, ['#ff5d3a', '#3fb8ff', '#52d977'][Math.floor(t / 4) % 3])
    txt(ctx, 'BOBO', bx + 8, by + 7, '#ffffff', 8, 'bold')
    return
  }
  if (style === 'aero') {
    aeroWall(ctx, w, h, t)
    roundRect(ctx, w - 36, 8, 28, 28, 5, 'rgba(255,255,255,.18)')
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(w - 22, 22, 10, 0, TAU)
    ctx.stroke()
    line(ctx, w - 22, 22, w - 22 + Math.cos(t * .5) * 7, 22 + Math.sin(t * .5) * 7, '#ffffff', 1)
    line(ctx, w - 22, 22, w - 22 + Math.cos(t * .05) * 5, 22 + Math.sin(t * .05) * 5, '#ffffff', 1.4)
    aeroTaskbar(ctx, w, h)
    return
  }
  if (style === 'dark' || style === 'ultra') {
    const pairs = [['#3a1c71', '#ffaf7b'], ['#0f3443', '#34e89e'], ['#1d2b64', '#f8cdda']]
    const [a, b] = pairs[v % pairs.length]
    gradient(ctx, 0, 0, w, h, a, b)
    for (let i = 0; i < 4; i += 1) {
      ctx.fillStyle = `rgba(255,255,255,${.07 + i * .02})`
      ctx.beginPath()
      ctx.arc(w * (.2 + i * .22) + Math.sin(t * .3 + i) * 10, h * (.5 + Math.cos(t * .25 + i * 2) * .25), 14 + i * 6, 0, TAU)
      ctx.fill()
    }
    ctx.textAlign = 'center'
    txt(ctx, '09:41', w / 2, h * .28, '#ffffff', 18, 'bold')
    ctx.textAlign = 'left'
    fill(ctx, w / 2 - 18, h * .28 + 22, 36, 2, 'rgba(255,255,255,.7)')
    return
  }
  if (style === 'holo') {
    fill(ctx, 0, 0, w, h, '#000000')
    const cx = w / 2
    const cy = h / 2
    const R = h * .36
    ctx.strokeStyle = '#3ff0ff'
    ctx.lineWidth = .8
    for (let i = 0; i < 6; i += 1) {
      const a = i / 6 * Math.PI + t * .4
      ctx.beginPath()
      ctx.ellipse(cx, cy, Math.abs(Math.cos(a)) * R, R, 0, 0, TAU)
      ctx.stroke()
    }
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath()
      ctx.ellipse(cx, cy + i * R * .35, Math.sqrt(1 - (i * .35) ** 2) * R, R * .12, 0, 0, TAU)
      ctx.stroke()
    }
    return
  }
  game(ctx, 0, 0, w, h, t, v, true, true)
}

function bliss(ctx, w, h, t) {
  gradient(ctx, 0, 0, w, h * .7, '#2f6fd6', '#a9d4ff')
  ctx.fillStyle = 'rgba(255,255,255,.85)'
  for (let i = 0; i < 4; i += 1) {
    const x = ((i * 50 + t * 3) % (w + 60)) - 30
    ctx.beginPath()
    ctx.ellipse(x, 14 + i * 7, 16, 5, 0, 0, TAU)
    ctx.ellipse(x + 10, 11 + i * 7, 10, 5, 0, 0, TAU)
    ctx.fill()
  }
  const g = ctx.createLinearGradient(0, h * .45, 0, h)
  g.addColorStop(0, '#7cc843')
  g.addColorStop(1, '#3d8a1e')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(0, h * .7)
  ctx.quadraticCurveTo(w * .45, h * .38, w, h * .62)
  ctx.lineTo(w, h)
  ctx.lineTo(0, h)
  ctx.fill()
}
function xpTaskbar(ctx, w, h) {
  gradient(ctx, 0, h - 9, w, 9, '#3a80f3', '#1c4fc4')
  roundRect(ctx, 0, h - 9, 30, 9, [0, 5, 5, 0], '#3a9a3a')
  txt(ctx, 'iniciar', 3, h - 7.5, '#ffffff', 5.5, 'bold')
  fill(ctx, w - 26, h - 9, 26, 9, '#1290e8')
}
function aeroWall(ctx, w, h, t) {
  gradient(ctx, 0, 0, w, h, '#0b3a8a', '#1aa0e0')
  ctx.strokeStyle = 'rgba(255,255,255,.25)'
  for (let i = 0; i < 5; i += 1) {
    ctx.lineWidth = 2 + i
    ctx.beginPath()
    ctx.moveTo(-10, h * (.3 + i * .12))
    ctx.bezierCurveTo(w * .3, h * (.1 + i * .1) + Math.sin(t * .2 + i) * 4, w * .6, h * (.7 - i * .05), w + 10, h * (.35 + i * .08))
    ctx.stroke()
  }
}
function aeroTaskbar(ctx, w, h) {
  fill(ctx, 0, h - 8, w, 8, 'rgba(15,25,45,.88)')
  fill(ctx, 0, h - 8, w, 1, 'rgba(255,255,255,.3)')
  ctx.fillStyle = '#3d8be0'
  ctx.beginPath()
  ctx.arc(6, h - 4, 3.2, 0, TAU)
  ctx.fill()
  for (let i = 0; i < 4; i += 1) roundRect(ctx, 14 + i * 9, h - 7, 7, 6, 1, ['#f4b400', '#3fb8ff', '#ff7a45', '#52d977'][i])
}

// ---------- molduras por era ----------
function frame(ctx, style, kind, w, h, v) {
  const full = { x: 0, y: 0, w, h }
  if (style === 'c64') {
    fill(ctx, 0, 0, w, h, '#7b71d6')
    fill(ctx, 12, 10, w - 24, h - 20, '#40318d')
    return { x: 13, y: 11, w: w - 26, h: h - 22, pal: { bg: '#40318d', text: ['#a59ff2', '#ffffff', '#a59ff2', '#9ae29b'], dim: '#6a5fc8', highlight: '#5546b8', lh: 7, basic: true, art: 'sprite', sound: 'sid', idea: 'text', title: '#ffffff' } }
  }
  if (style === 'dos') {
    if (kind === 'code') {
      fill(ctx, 0, 0, w, h, '#0000aa')
      fill(ctx, 0, 0, w, 7, '#aaaaaa')
      ;['File', 'Edit', 'Run', 'Debug'].forEach((label, i) => txt(ctx, label, 4 + i * 24, 1, '#000000', 5))
      fill(ctx, 0, h - 7, w, 7, '#aaaaaa')
      fill(ctx, 3, h - 6, 14, 5, '#aa0000')
      ctx.strokeStyle = '#55ffff'
      ctx.lineWidth = 1
      ctx.strokeRect(2.5, 9.5, w - 5, h - 19)
      ctx.strokeRect(4.5, 11.5, w - 9, h - 23)
      fill(ctx, w / 2 - 14, 8, 28, 5, '#0000aa')
      txt(ctx, 'JOGO.PAS', w / 2 - 12, 8, '#ffffff', 5)
      return { x: 6, y: 13, w: w - 12, h: h - 26, pal: { bg: null, text: ['#ffff55', '#ffffff', '#55ffff', '#ffffff', '#aaaaaa'], dim: '#5555ff', lh: 6 } }
    }
    if (kind === 'art') {
      fill(ctx, 0, 0, w, h, '#000000')
      fill(ctx, 0, 0, w, 6, '#e6e6e6')
      fill(ctx, w - 20, 6, 20, h - 6, '#a0a0a0')
      for (let i = 0; i < 16; i += 1) {
        fill(ctx, w - 18 + (i % 2) * 9, 8 + Math.floor(i / 2) * 9, 8, 8, i === 5 ? '#ffffff' : '#c8c8c8')
        fill(ctx, w - 16 + (i % 2) * 9, 10 + Math.floor(i / 2) * 9, 4, 4, '#555555')
      }
      const palette = ['#000', '#fff', '#a00', '#f55', '#0a0', '#5f5', '#00a', '#55f', '#aa0', '#ff5', '#0aa', '#5ff', '#a0a', '#f5f', '#a50', '#aaa']
      palette.forEach((color, i) => fill(ctx, i * ((w - 20) / 16), h - 10, (w - 20) / 16, 10, color))
      return { x: 0, y: 6, w: w - 20, h: h - 16, pal: { bg: '#000000', art: 'paint', dim: '#333' } }
    }
    if (kind === 'sound') {
      fill(ctx, 0, 0, w, h, '#000000')
      fill(ctx, 0, 0, w, h * .36, '#8f8fa3')
      bevel(ctx, 0, 0, w, h * .36)
      for (let i = 0; i < 4; i += 1) {
        fill(ctx, 4 + i * 10, 4, 8, h * .36 - 8, '#1d1d28')
      }
      for (let i = 0; i < 3; i += 1) {
        fill(ctx, 48, 4 + i * 11, w - 52, 9, '#1d1d28')
        fill(ctx, 50, 6 + i * 11, (w - 56) * (.3 + i * .2), 5, '#55ff55')
      }
      return { x: 0, y: h * .36, w, h: h * .64, pal: { bg: '#000000', text: ['#55ff55', '#ffffff', '#55ffff', '#ffff55'], dim: '#226622', highlight: '#333355', sound: 'tracker', vu: true } }
    }
    if (kind === 'idea') {
      fill(ctx, 0, 0, w, h, '#a8a8a8')
      ctx.fillStyle = '#8c8c8c'
      for (let y = 8; y < h; y += 2) for (let x = (y / 2) % 2; x < w; x += 2) ctx.fillRect(x, y, 1, 1)
      fill(ctx, 0, 0, w, 7, '#ffffff')
      fill(ctx, 0, 7, w, 1, '#000000')
      ;['Arquivo', 'Editar', 'Fonte'].forEach((label, i) => txt(ctx, label, 10 + i * 30, 1, '#000000', 5))
      fill(ctx, 7, 11, w - 14, h - 16, '#000000')
      fill(ctx, 8, 12, w - 16, h - 18, '#ffffff')
      for (let y = 13; y < 19; y += 2) fill(ctx, 9, y, w - 18, 1, '#000000')
      fill(ctx, w / 2 - 18, 12, 36, 7, '#ffffff')
      txt(ctx, 'IDEIAS', w / 2 - 15, 12.5, '#000000', 5)
      fill(ctx, 8, 19, w - 16, 1, '#000000')
      return { x: 9, y: 21, w: w - 18, h: h - 28, pal: { bg: '#ffffff', text: ['#000000'], dim: '#555555', idea: 'gui', lh: 6, accent: '#000000' } }
    }
  }
  if (style === 'win9x') {
    fill(ctx, 0, 0, w, h, '#008080')
    fill(ctx, 0, h - 9, w, 9, '#c0c0c0')
    fill(ctx, 0, h - 9, w, 1, '#ffffff')
    fill(ctx, 2, h - 8, 24, 7, '#c0c0c0')
    bevel(ctx, 2, h - 8, 24, 7)
    txt(ctx, 'Iniciar', 4, h - 7.5, '#000000', 5, 'bold')
    fill(ctx, w - 24, h - 8, 22, 7, '#c0c0c0')
    bevel(ctx, w - 24, h - 8, 22, 7, true)
    fill(ctx, 2, 2, w - 4, h - 12, '#c0c0c0')
    bevel(ctx, 2, 2, w - 4, h - 12)
    gradient(ctx, 4, 4, w - 8, 8, '#000080', '#1084d0', false)
    fill(ctx, 6, 6, 30, 4, '#ffffff')
    for (let i = 0; i < 3; i += 1) {
      fill(ctx, w - 26 + i * 7, 5, 6, 6, '#c0c0c0')
      bevel(ctx, w - 26 + i * 7, 5, 6, 6)
    }
    ;[0, 1, 2, 3].forEach(i => fill(ctx, 6 + i * 16, 14, 12, 3, '#404040'))
    const inner = { x: 5, y: 20, w: w - 10, h: h - 33 }
    fill(ctx, inner.x - 1, inner.y - 1, inner.w + 2, inner.h + 2, '#808080')
    const pal = {
      code: { bg: '#ffffff', text: ['#0000ff', '#000000', '#008000', '#800080', '#000000'], dim: '#808080', lh: 6, cursor: '#000000' },
      art: { art: 'wire4' },
      sound: { sound: 'waves', bg: '#000000' },
      idea: { bg: '#808080', text: ['#000000'], dim: '#000080', idea: 'word', lh: 5, accent: '#000080', title: '#000080' },
    }[kind]
    return { ...inner, pal }
  }
  if (style === 'xp') {
    bliss(ctx, w, h, 0)
    xpTaskbar(ctx, w, h)
    roundRect(ctx, 1, 1, w - 2, h - 11, [4, 4, 0, 0], '#0a3fd6')
    gradient(ctx, 2, 2, w - 4, 9, '#3d82f6', '#1052d8')
    fill(ctx, 6, 4, 34, 4, '#ffffff')
    roundRect(ctx, w - 11, 3, 8, 7, 1.5, '#e04a2c')
    roundRect(ctx, w - 20, 3, 8, 7, 1.5, '#3d82f6')
    fill(ctx, 3, 11, w - 6, h - 23, '#ece9d8')
    ;[0, 1, 2, 3].forEach(i => fill(ctx, 6 + i * 16, 13, 12, 3, '#5a5a5a'))
    const inner = { x: 4, y: 18, w: w - 8, h: h - 31 }
    const pal = {
      code: { bg: '#ffffff', text: ['#0000ff', '#000000', '#a31515', '#008000', '#2b91af'], dim: '#9a9a9a', lh: 6, gutter: true, cursor: '#000000' },
      art: { art: 'shaded', bg: '#3c3c3c', grid: '#5a5a5a' },
      sound: { sound: 'steps', bg: '#2c3338' },
      idea: { bg: '#ece9d8', text: ['#000000'], dim: '#0a3fd6', idea: 'word', lh: 5, accent: '#0a3fd6', title: '#0a3fd6' },
    }[kind]
    return { ...inner, pal }
  }
  if (style === 'aero') {
    aeroWall(ctx, w, h, 0)
    aeroTaskbar(ctx, w, h)
    roundRect(ctx, 2, 1, w - 4, h - 10, 3, 'rgba(185,212,240,.92)')
    fill(ctx, 6, 3, 30, 3, '#1d3557')
    roundRect(ctx, w - 18, 2, 13, 5, 1, '#c94f4f')
    const inner = { x: 5, y: 8, w: w - 10, h: h - 19 }
    const pal = {
      code: { bg: '#ffffff', text: ['#0000ff', '#2b91af', '#a31515', '#008000', '#000000'], dim: '#2b91af', lh: 6, gutter: true, cursor: '#000000' },
      art: { art: 'scene', bg: '#c2c2c2', panel: '#d6d6d6', line: '#8a8a8a', input: '#f2f2f2', accent: '#3d8be0', skyA: '#87b8e8', skyB: '#e8eef5', grid: '#9aa5b1' },
      sound: { sound: 'daw', bg: '#3a3f47', panel: '#2b2f36', dim: '#666' },
      idea: { bg: '#e9eef5', text: ['#1d3557'], dim: '#3d8be0', idea: 'word', lh: 5, accent: '#3d8be0', title: '#1d3557' },
    }[kind]
    return { ...inner, pal }
  }
  if (style === 'dark' || style === 'ultra') {
    const status = ['#007acc', '#68217a', '#16825d'][v % 3]
    fill(ctx, 0, 0, w, h, '#1e1e1e')
    fill(ctx, 0, 0, w, 5, '#323233')
    ;['#ff5f57', '#febc2e', '#28c840'].forEach((color, i) => {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(4 + i * 4, 2.5, 1.2, 0, TAU)
      ctx.fill()
    })
    fill(ctx, 0, h - 5, w, 5, status)
    fill(ctx, 0, 5, 8, h - 10, '#2c2c2c')
    for (let i = 0; i < 4; i += 1) fill(ctx, 2, 8 + i * 8, 4, 4, i === 0 ? '#d4d4d4' : '#6e6e6e')
    if (kind === 'code') {
      const side = style === 'ultra' ? 40 : 32
      fill(ctx, 8, 5, side, h - 10, '#252526')
      for (let i = 0; i < 12; i += 1) fill(ctx, 11 + (i % 4 ? 4 : 0), 9 + i * 6, 10 + hash(i, v) * 14, 2.5, i === 3 ? '#ffffff' : '#8b8b8b')
      fill(ctx, 8 + side, 5, w - 8 - side, 6, '#2d2d2d')
      fill(ctx, 8 + side, 5, 30, 6, '#1e1e1e')
      fill(ctx, 8 + side, 5, 30, 1, status)
      const pal = { bg: '#1e1e1e', text: ['#569cd6', '#9cdcfe', '#ce9178', '#dcdcaa', '#c586c0', '#6a9955', '#d4d4d4'], dim: '#4b4b4b', lh: 6, gutter: true, cursor: '#aeafad' }
      if (style === 'ultra') {
        const split = Math.round(w * .66)
        fill(ctx, split, 5, 1, h - 10, '#3c3c3c')
        return { x: 8 + side, y: 11, w: split - 8 - side, h: h - 16, pal, preview: { x: split + 1, y: 5, w: w - split - 1, h: h - 10 } }
      }
      return { x: 8 + side, y: 11, w: w - 8 - side, h: h - 16, pal }
    }
    const inner = { x: 8, y: 5, w: w - 8, h: h - 10 }
    const pal = {
      art: { art: 'scene', bg: '#2b2b2b', panel: '#383838', line: '#6a6a6a', input: '#222222', accent: '#3fb8ff', skyA: '#3b4a6b', skyB: '#7d8fb3', grid: '#56607a' },
      sound: { sound: 'daw', bg: '#1f1f24', panel: '#2c2c33', dim: '#555' },
      idea: { idea: 'board', bg: '#f4f1ea' },
    }[kind]
    return { ...inner, pal }
  }
  if (style === 'holo') {
    fill(ctx, 0, 0, w, h, '#000000')
    ctx.strokeStyle = '#3ff0ff'
    ctx.lineWidth = 1
    for (const [x, y, dx, dy] of [[2, 2, 1, 1], [w - 2, 2, -1, 1], [2, h - 2, 1, -1], [w - 2, h - 2, -1, -1]]) {
      ctx.beginPath()
      ctx.moveTo(x + dx * 10, y)
      ctx.lineTo(x, y)
      ctx.lineTo(x, y + dy * 8)
      ctx.stroke()
    }
    return { x: 6, y: 6, w: w - 12, h: h - 12, pal: { bg: null, text: ['#3ff0ff', '#7fb8ff', '#ff6bf0', '#ffffff'], dim: '#1b5560', highlight: '#0c2a33', lh: 6, art: 'holo', sound: 'holo', idea: 'holo', cursor: '#ffffff' } }
  }
  return { ...full, pal: { bg: '#14213d', text: ['#7ee787', '#79c0ff', '#ffa657'], dim: '#30363d', lh: 6 } }
}

// Linhas de varredura e cantos escuros dos monitores de tubo (o degradê fica guardado na tela).
function crtOverlay(screen, w, h) {
  const { ctx } = screen
  ctx.fillStyle = 'rgba(0,0,0,.16)'
  for (let y = 0; y < h; y += 2) ctx.fillRect(0, y, w, 1)
  if (!screen.vignette) {
    screen.vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .35, w / 2, h / 2, Math.max(w, h) * .72)
    screen.vignette.addColorStop(0, 'rgba(0,0,0,0)')
    screen.vignette.addColorStop(1, 'rgba(0,0,0,.55)')
  }
  ctx.fillStyle = screen.vignette
  ctx.fillRect(0, 0, w, h)
}

function paint(screen, t) {
  const { ctx, style, kind, variant: v } = screen
  const [w, h] = SIZE[style]
  ctx.save()
  ctx.globalAlpha = 1
  ctx.setLineDash([])
  if (kind === 'idle') idle(ctx, style, w, h, t, v)
  else if (kind === 'game' || style === 'arcade') {
    if (style === 'holo') fill(ctx, 0, 0, w, h, '#000')
    game(ctx, 0, 0, w, h, t, v, ['c64', 'dos', 'win9x', 'arcade'].includes(style), style === 'arcade' || style === 'holo')
  } else {
    const r = frame(ctx, style, kind, w, h, v)
    const painter = { code, art, sound, idea }[kind] ?? code
    painter(ctx, r, t, r.pal, v)
    if (r.preview) game(ctx, r.preview.x, r.preview.y, r.preview.w, r.preview.h, t, v, false)
  }
  if (CRT.has(style)) crtOverlay(screen, w, h)
  ctx.restore()
}

const screens = new Map()
const painting = []

export function styleOf(era) {
  const id = typeof era === 'string' ? era : era?.id
  return SCREEN_STYLE[id] ?? (SIZE[id] ? id : 'dark')
}

// Textura animada de uma tela. kind: code, art, sound, idea, idle, game.
export function liveScreen(kind = 'code', style = 'dark', variant = 0) {
  const key = `${style}|${kind}|${variant}`
  let screen = screens.get(key)
  if (!screen) {
    const [w, h] = SIZE[style] ?? SIZE.dark
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.generateMipmaps = false
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    screen = { canvas, ctx: canvas.getContext('2d'), texture, style: SIZE[style] ? style : 'dark', kind, variant, used: true, next: 0, vignette: null }
    texture.userData.screen = screen
    screens.set(key, screen)
    painting.push(screen)
    paint(screen, variant * 3.7)
    texture.needsUpdate = true
  }
  screen.used = true
  return screen.texture
}

// Avisa que a textura está à vista neste quadro (sem criar nada: só marca).
export function touchScreen(texture) {
  const screen = texture?.userData.screen
  if (screen) screen.used = true
}

// Solta as telas de outras eras quando o escritório é remontado.
export function pruneScreens(style) {
  for (const [key, screen] of screens) {
    if (screen.style === style || screen.style === 'arcade') continue
    screen.texture.dispose()
    screens.delete(key)
    painting.splice(painting.indexOf(screen), 1)
  }
}

// Redesenha só as telas pedidas desde o último quadro, cada uma no seu ritmo.
export function tickScreens(time) {
  for (let i = 0; i < painting.length; i += 1) {
    const screen = painting[i]
    if (!screen.used) continue
    screen.used = false
    if (time < screen.next) continue
    screen.next = time + 1 / (FPS[screen.kind] ?? 6) + Math.random() * .02
    paint(screen, time + screen.variant * 3.7)
    screen.texture.needsUpdate = true
  }
}
