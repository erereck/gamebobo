import * as THREE from 'three'
import { drawCover } from '../ui/cover.js'
import { mulberry32, hashText } from './kit.js'

const cache = new Map()

function canvasTexture(key, width, height, draw) {
  if (cache.has(key)) return cache.get(key)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  draw(ctx, width, height)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  cache.set(key, texture)
  return texture
}

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
}

export function whiteboardTexture() {
  return canvasTexture('whiteboard', 256, 160, (ctx, w, h) => {
    ctx.fillStyle = '#fbfbf8'
    ctx.fillRect(0, 0, w, h)
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    const strokes = [['#e63946', 'M20 30 L90 30 L90 70 L20 70 Z'], ['#1d3557', 'M110 40 C140 10 170 70 200 30'], ['#2a9d8f', 'M30 110 L70 90 L110 120 L150 95'], ['#e9c46a', 'M180 100 m-20 0 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0']]
    for (const [color, d] of strokes) {
      ctx.strokeStyle = color
      ctx.stroke(new Path2D(d))
    }
    ctx.fillStyle = '#1d3557'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText('MVP?!', 120, 140)
  })
}

export function neonTexture(text) {
  return canvasTexture(`neon-${text}`, 512, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.font = '900 64px "Bricolage Grotesque Variable", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = '#ff4fd8'
    ctx.shadowBlur = 24
    ctx.fillStyle = '#ffe0fa'
    const fitted = text.length > 14 ? text.slice(0, 14) : text
    ctx.fillText(fitted, w / 2, h / 2)
    ctx.shadowBlur = 8
    ctx.fillText(fitted, w / 2, h / 2)
  })
}

export function posterTexture(game) {
  return canvasTexture(`poster-${game.id}`, 256, 340, ctx => drawCover(ctx, game, 256, 340))
}

export function skyTexture(top, bottom) {
  return canvasTexture(`sky-${top}-${bottom}`, 16, 64, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, top)
    g.addColorStop(1, bottom)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  })
}

export function clearPosterCache() {
  for (const key of [...cache.keys()]) {
    if (key.startsWith('poster-')) {
      cache.get(key).dispose()
      cache.delete(key)
    }
  }
}

// ---------- teclados ----------
// O topo da textura é o fundo do teclado (fileira das F) e a base fica do lado de quem digita.
const KB_ROWS = [
  [1, -.5, 1, 1, 1, 1, -.25, 1, 1, 1, 1, -.25, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
  [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
  [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75],
  [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25],
]
const KB = {
  c64: { base: '#4b3e33', key: '#5c4b3d', top: '#6f5d4c', mod: '#5c4b3d', legend: '#e2d6bf', side: '#cdbf9f', rows: [1, 2, 3, 4, 5] },
  beige8: { base: '#cbbd9c', key: '#62574a', top: '#76695a', mod: '#9b8f78', legend: '#f2ead8', rows: [1, 2, 3, 4, 5] },
  beige: { base: '#d3c7aa', key: '#eae2cd', top: '#f4eedf', mod: '#b9ae95', legend: '#5d5444', numpad: true },
  black: { base: '#17181c', key: '#2a2b31', top: '#34363d', mod: '#24252a', legend: '#9aa0aa', numpad: true },
  alu: { base: '#c9cdd2', key: '#f7f7f7', top: '#ffffff', mod: '#eeeeee', legend: '#9a9a9a', gap: 1.4 },
  rgb: { base: '#0b0b0d', key: '#17171b', top: '#202026', mod: '#17171b', legend: '#5c5c66', numpad: true },
  pastel: { base: '#e8e6ee', key: '#f8f6f0', top: '#fffdf8', mod: '#c9c1ec', accent: '#ff9fbf', legend: '#8d86a8' },
  glass: { base: null, line: '#8ff4ff', legend: '#d9fbff', numpad: true },
}

function eachKey(w, h, s, draw) {
  const pad = 3
  const units = 15 + (s.numpad ? 4.75 : 0) + (s.side ? 1.5 : 0)
  const u = (w - pad * 2) / units
  const rh = (h - pad * 2) / 6
  const rows = s.rows ?? [0, 1, 2, 3, 4, 5]
  const top = s.rows ? (h - rows.length * rh) / 2 : pad
  rows.forEach((row, ri) => {
    let x = pad
    const y = top + ri * rh
    KB_ROWS[row].forEach((size, i) => {
      if (size < 0) {
        x += -size * u
        return
      }
      draw(x, y, size * u, rh, size > 1.3 || i === 0, row === 0 && i === 0)
      x += size * u
    })
    if (s.numpad && row > 0) for (let c = 0; c < 4; c += 1) draw(pad + (15.75 + c) * u, y, u, rh, c === 3, false)
    if (s.side && row > 0 && row < 5) draw(pad + 15.5 * u, y, 1.5 * u, rh, true, true)
  })
}

export function keyboardTexture(style = 'beige', glow = false) {
  return canvasTexture(`kb-${style}-${glow ? 'g' : 'm'}`, 192, 64, (ctx, w, h) => {
    const s = KB[style] ?? KB.beige
    const gap = s.gap ?? .9
    if (glow) {
      // mapa de brilho: frestas acesas entre as teclas e as letras
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, w, h)
      eachKey(w, h, s, (x, y, kw, kh) => {
        ctx.fillStyle = '#9a9a9a'
        ctx.fillRect(x, y, kw, kh)
        ctx.fillStyle = '#000000'
        ctx.fillRect(x + gap + .6, y + gap + .6, kw - gap * 2 - 1.2, kh - gap * 2 - 1.2)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(x + kw * .3, y + kh * .3, Math.min(3, kw * .4), 2)
      })
      return
    }
    if (s.base) {
      ctx.fillStyle = s.base
      ctx.fillRect(0, 0, w, h)
    } else ctx.clearRect(0, 0, w, h)
    eachKey(w, h, s, (x, y, kw, kh, wide, accent) => {
      if (!s.base) {
        ctx.strokeStyle = s.line
        ctx.lineWidth = 1
        ctx.strokeRect(x + gap, y + gap, kw - gap * 2, kh - gap * 2)
        ctx.fillStyle = s.legend
        ctx.fillRect(x + kw * .35, y + kh * .35, 2, 2)
        return
      }
      ctx.fillStyle = accent && s.accent ? s.accent : wide ? s.mod : s.key
      roundRect(ctx, x + gap * .5, y + gap * .5, kw - gap, kh - gap, 1.6)
      ctx.fillStyle = accent && s.accent ? s.accent : s.top
      roundRect(ctx, x + gap + .8, y + gap * .6, kw - gap * 2 - 1.6, kh - gap * 2 - .6, 1.2)
      ctx.fillStyle = s.legend
      ctx.fillRect(x + gap + 2, y + gap + 1.6, 2, 1.4)
    })
  })
}

// Teclado de piano para o controlador MIDI de quem faz som.
export function pianoTexture() {
  return canvasTexture('piano', 128, 32, (ctx, w, h) => {
    ctx.fillStyle = '#1d1d22'
    ctx.fillRect(0, 0, w, h)
    const keys = 15
    const kw = (w - 4) / keys
    for (let i = 0; i < keys; i += 1) {
      ctx.fillStyle = '#f7f5ef'
      ctx.fillRect(2 + i * kw + .5, 2, kw - 1, h - 4)
    }
    for (let i = 0; i < keys - 1; i += 1) {
      if (i % 7 === 2 || i % 7 === 6) continue
      ctx.fillStyle = '#1d1d22'
      ctx.fillRect(2 + (i + 1) * kw - kw * .3, 2, kw * .6, (h - 4) * .58)
    }
  })
}

// Mancha de luz suave (brilho de monitor sobre a mesa, lâmpadas).
export function glowTexture() {
  return canvasTexture('soft-glow', 64, 64, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 1, w / 2, h / 2, w / 2)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(.45, 'rgba(255,255,255,.45)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  })
}

// Caixa de pizza aberta vista de cima, faltando uma fatia.
export function pizzaTexture() {
  return canvasTexture('pizza', 64, 64, (ctx, w, h) => {
    ctx.fillStyle = '#e8c48f'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#d5aa6c'
    ctx.fillRect(2, 2, w - 4, h - 4)
    ctx.fillStyle = '#e9a23b'
    ctx.beginPath()
    ctx.moveTo(32, 32)
    ctx.arc(32, 32, 27, -.2, Math.PI * 1.55)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#ffd36b'
    ctx.beginPath()
    ctx.moveTo(32, 32)
    ctx.arc(32, 32, 23, -.2, Math.PI * 1.55)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#c8402e'
    for (const [x, y] of [[22, 22], [40, 40], [24, 42], [42, 26], [32, 33], [18, 33], [34, 48], [47, 36]]) {
      ctx.beginPath()
      ctx.arc(x, y, 3.2, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

// Tela parada de tablet: app de desenho com rabiscos coloridos.
export function tabletTexture() {
  return canvasTexture('tablet', 96, 128, (ctx, w, h) => {
    ctx.fillStyle = '#fdfaf3'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#2b2d36'
    ctx.fillRect(0, 0, w, 10)
    ctx.fillRect(0, 10, 10, h - 10)
    ;['#ff5d3a', '#ffd23f', '#3fb8ff', '#52d977', '#b57bff'].forEach((color, i) => {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(5, 18 + i * 10, 3, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.lineCap = 'round'
    ctx.lineWidth = 3
    ctx.strokeStyle = '#1d1a24'
    ctx.beginPath()
    ctx.arc(52, 52, 22, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = '#ffc58f'
    ctx.beginPath()
    ctx.arc(52, 52, 20, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#1d1a24'
    ctx.fillRect(44, 48, 4, 6)
    ctx.fillRect(58, 48, 4, 6)
    ctx.strokeStyle = '#ff5d3a'
    ctx.beginPath()
    ctx.moveTo(30, 96)
    ctx.quadraticCurveTo(52, 80, 76, 98)
    ctx.stroke()
    ctx.strokeStyle = '#3fb8ff'
    ctx.beginPath()
    ctx.moveTo(26, 112)
    ctx.quadraticCurveTo(56, 100, 84, 114)
    ctx.stroke()
  })
}

// Folha de anotação: pauta azul, margem e rabiscos.
export function paperTexture(grid = false) {
  return canvasTexture(`paper-${grid ? 'g' : 'l'}`, 64, 84, (ctx, w, h) => {
    ctx.fillStyle = '#fffdf6'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = grid ? 'rgba(80,140,220,.35)' : 'rgba(80,140,220,.5)'
    ctx.lineWidth = 1
    for (let y = 8; y < h; y += 6) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }
    if (grid) {
      for (let x = 4; x < w; x += 6) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      ctx.fillStyle = '#1d1a24'
      for (const [x, y] of [[22, 26], [28, 26], [34, 26], [22, 32], [34, 32], [28, 38], [22, 44], [34, 44]]) ctx.fillRect(x, y, 6, 6)
      return
    }
    ctx.strokeStyle = '#ff8f8f'
    ctx.beginPath()
    ctx.moveTo(10, 0)
    ctx.lineTo(10, h)
    ctx.stroke()
    ctx.strokeStyle = '#2b2d42'
    ctx.lineWidth = 1.4
    for (let i = 0; i < 7; i += 1) {
      ctx.beginPath()
      ctx.moveTo(13, 13 + i * 6)
      ctx.lineTo(13 + 20 + ((i * 37) % 28), 12 + i * 6)
      ctx.stroke()
    }
  })
}

// ---------- vista das janelas ----------
// A paisagem é desenhada sem céu (o céu é um degradê que muda com a hora) e
// repete na horizontal, então janelas lado a lado mostram a mesma rua contínua.
export const VIEW_SPAN = 4

const SEASONS = {
  summer: { trees: ['#2f9e44', '#37b24d', '#2b8a3e'], grass: '#5fb85a', hill: '#7cc070' },
  autumn: { trees: ['#d9822b', '#e8a33d', '#8a9a3b', '#b5651d'], grass: '#a2b45c', hill: '#adb070' },
  winter: { trees: ['#5f7f63', '#6b8a6e', '#7b8f6a'], grass: '#98a888', hill: '#a3ae97', bloom: ['#ffd23f'], bare: true },
  spring: { trees: ['#40c057', '#51cf66', '#69db7c'], grass: '#78c568', hill: '#8ccb7c', bloom: ['#f783ac', '#b197fc'] },
}
const WALLS = ['#f4e1c1', '#cfe3f0', '#f6c6b1', '#e6e0f5', '#fff1a8', '#d8efd3']
const ROOFS = ['#c0504d', '#7a4b3a', '#5b6f8f', '#a0522d']
const TOWERS = ['#9fb3c8', '#c9b79c', '#b0a8b9', '#8aa1a8', '#d3c4b0', '#a7b8a2']

const scenes = new Map()

// Posições fixas por cenário: o dia e a noite precisam bater janela por janela.
function sceneLayout(scene, w, h) {
  if (scenes.has(scene)) return scenes.get(scene)
  const r = mulberry32(hashText(`vista-${scene}`))
  const items = []
  const clouds = []
  for (let i = 0; i < 5; i += 1) clouds.push({ x: r() * w, y: h * (.08 + r() * .22), s: 10 + r() * 14 })
  const ground = { houses: .74, street: .7, trees: .7, city: .9, skyline: .92, high: .96 }[scene] ?? .75
  const gy = h * ground
  const house = (x, base, scale) => {
    const hw = (40 + r() * 22) * scale
    const hh = (24 + r() * 12) * scale
    const windows = []
    for (let i = 0; i < 2; i += 1) windows.push([x + hw * (.18 + i * .46), base - hh * .72, hw * .2, hh * .26])
    items.push({ type: 'house', x, y: base - hh, w: hw, h: hh, roof: 10 + r() * 8 * scale, wall: WALLS[Math.floor(r() * WALLS.length)], roofColor: ROOFS[Math.floor(r() * ROOFS.length)], windows, door: [x + hw * .42, base - hh * .45, hw * .16, hh * .45] })
    return hw
  }
  const tree = (x, base, size) => items.push({ type: 'tree', x, y: base, s: size, tone: Math.floor(r() * 4), bloom: r() < .45, bare: r() < .4 })
  const tower = (x, base, tw, th, color, far = false) => {
    const windows = []
    const cols = Math.max(1, Math.floor(tw / 7))
    const rows = Math.max(1, Math.floor(th / 9))
    for (let row = 0; row < rows - 1; row += 1) for (let col = 0; col < cols; col += 1) windows.push([x + 3 + col * ((tw - 4) / cols), base - th + 5 + row * 9, Math.max(2, (tw - 4) / cols - 3), 4])
    items.push({ type: 'tower', x, y: base - th, w: tw, h: th, color, far, windows, antenna: r() < .3 })
  }
  if (scene === 'houses' || scene === 'street') {
    let x = r() * 20
    while (x < w - 30) {
      const hw = house(x, gy, scene === 'street' ? .8 : 1)
      x += hw + 6
      if (r() < .7) {
        tree(x + 8, gy, .8 + r() * .5)
        x += 22
      }
      if (scene === 'street' && r() < .5) {
        items.push({ type: 'lamp', x: x + 4, y: gy + 10 })
        x += 10
      }
    }
  } else if (scene === 'trees') {
    let x = 0
    while (x < w) {
      tower(x, gy - 8, 30 + r() * 30, 22 + r() * 20, '#c3cbd6', true)
      x += 50 + r() * 50
    }
    for (let i = 0; i < 16; i += 1) tree(r() * w, gy + r() * 14, .7 + r() * .8)
  } else {
    const far = scene !== 'city'
    if (far) {
      let x = 0
      while (x < w) {
        const tw = 14 + r() * 18
        tower(x, gy - (scene === 'high' ? 4 : 10), tw, (scene === 'high' ? 18 : 50) + r() * (scene === 'high' ? 22 : 45), '#c5d1df', true)
        x += tw + 2 + r() * 6
      }
    }
    let x = 0
    while (x < w) {
      const tw = (scene === 'high' ? 16 : 30) + r() * (scene === 'high' ? 14 : 28)
      const th = scene === 'high' ? 8 + r() * 16 : scene === 'city' ? 44 + r() * 46 : 36 + r() * 40
      tower(x, gy, tw, th, TOWERS[Math.floor(r() * TOWERS.length)])
      x += tw + 3 + r() * 8
    }
    if (scene === 'city') for (let i = 0; i < 10; i += 1) tree(r() * w, gy + 6, .6 + r() * .3)
  }
  const stars = []
  for (let i = 0; i < 40; i += 1) stars.push([r() * w, r() * h * .5, r() < .2 ? 2 : 1])
  const layout = { items, clouds, gy, stars, moon: r() * w, lit: items.map(() => r()) }
  scenes.set(scene, layout)
  return layout
}

// Desenha também nas bordas, para a imagem emendar ao repetir.
function wrapped(w, x, width, draw) {
  draw(x)
  if (x + width > w) draw(x - w)
  if (x < 0) draw(x + w)
}

function paintDay(ctx, w, h, scene, season) {
  const L = sceneLayout(scene, w, h)
  const S = SEASONS[season] ?? SEASONS.summer
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = 'rgba(255,255,255,.85)'
  for (const c of L.clouds) {
    wrapped(w, c.x - c.s * 2, c.s * 4, x => {
      ctx.beginPath()
      ctx.ellipse(x + c.s * 2, c.y, c.s * 1.6, c.s * .45, 0, 0, Math.PI * 2)
      ctx.ellipse(x + c.s * 1.6, c.y - c.s * .3, c.s * .7, c.s * .45, 0, 0, Math.PI * 2)
      ctx.ellipse(x + c.s * 2.5, c.y - c.s * .2, c.s * .6, c.s * .35, 0, 0, Math.PI * 2)
      ctx.fill()
    })
  }
  if (scene === 'houses' || scene === 'street' || scene === 'trees') {
    ctx.fillStyle = S.hill
    for (let i = 0; i < 4; i += 1) {
      wrapped(w, i * w / 4 - 30, 200, x => {
        ctx.beginPath()
        ctx.ellipse(x + 90, L.gy + 6, 110, 26, 0, Math.PI, 0)
        ctx.fill()
      })
    }
  }
  ctx.fillStyle = scene === 'city' || scene === 'skyline' || scene === 'high' ? '#9aa3ad' : S.grass
  ctx.fillRect(0, L.gy, w, h - L.gy)
  if (scene === 'street') {
    ctx.fillStyle = '#8d929a'
    ctx.fillRect(0, h * .86, w, h * .14)
    ctx.fillStyle = '#f2f2f2'
    for (let x = 6; x < w; x += 28) ctx.fillRect(x, h * .93, 14, 2)
  }
  for (const item of L.items) {
    if (item.type === 'house') {
      wrapped(w, item.x, item.w, x => {
        ctx.fillStyle = item.wall
        ctx.fillRect(x, item.y, item.w, item.h)
        ctx.fillStyle = item.roofColor
        ctx.beginPath()
        ctx.moveTo(x - 4, item.y)
        ctx.lineTo(x + item.w / 2, item.y - item.roof)
        ctx.lineTo(x + item.w + 4, item.y)
        ctx.fill()
        ctx.fillStyle = '#8fb8d8'
        for (const [wx, wy, ww, wh] of item.windows) ctx.fillRect(wx - item.x + x, wy, ww, wh)
        ctx.fillStyle = '#7a5236'
        const [dx, dy, dw, dh] = item.door
        ctx.fillRect(dx - item.x + x, dy, dw, dh)
      })
    } else if (item.type === 'tree') {
      const size = 12 * item.s
      wrapped(w, item.x - size, size * 2, x => {
        ctx.fillStyle = '#6d4c3a'
        ctx.fillRect(x + size - 1.5, item.y - size * 1.1, 3, size * 1.1)
        if (S.bare && item.bare && !(S.bloom && item.bloom)) {
          ctx.strokeStyle = '#6d4c3a'
          ctx.lineWidth = 1.2
          for (let b = 0; b < 4; b += 1) {
            ctx.beginPath()
            ctx.moveTo(x + size, item.y - size * (.6 + b * .12))
            ctx.lineTo(x + size + (b % 2 ? 1 : -1) * size * .6, item.y - size * (1.2 + b * .15))
            ctx.stroke()
          }
          return
        }
        ctx.fillStyle = S.bloom && item.bloom ? S.bloom[item.tone % S.bloom.length] : S.trees[item.tone % S.trees.length]
        ctx.beginPath()
        ctx.arc(x + size, item.y - size * 1.4, size * .75, 0, Math.PI * 2)
        ctx.arc(x + size - size * .45, item.y - size * 1.05, size * .5, 0, Math.PI * 2)
        ctx.arc(x + size + size * .45, item.y - size * 1.05, size * .5, 0, Math.PI * 2)
        ctx.fill()
      })
    } else if (item.type === 'tower') {
      wrapped(w, item.x, item.w, x => {
        ctx.fillStyle = item.color
        ctx.globalAlpha = item.far ? .75 : 1
        ctx.fillRect(x, item.y, item.w, item.h)
        if (item.antenna) ctx.fillRect(x + item.w / 2 - .5, item.y - 8, 1, 8)
        ctx.globalAlpha = item.far ? .4 : .85
        ctx.fillStyle = '#e8f3ff'
        for (const [wx, wy, ww, wh] of item.windows) ctx.fillRect(wx - item.x + x, wy, ww, wh)
        ctx.globalAlpha = 1
      })
    } else if (item.type === 'lamp') {
      wrapped(w, item.x, 6, x => {
        ctx.fillStyle = '#4a4f57'
        ctx.fillRect(x, item.y - 30, 1.5, 30)
        ctx.fillRect(x - 3, item.y - 31, 7, 2.5)
      })
    }
  }
  if (scene === 'houses') {
    ctx.fillStyle = '#fbf6ec'
    for (let x = 0; x < w; x += 7) ctx.fillRect(x, h - 14, 4, 14)
    ctx.fillRect(0, h - 10, w, 2)
  }
}

// Noite: só o que acende (janelas, postes, estrelas e a lua), somado por cima.
function paintNight(ctx, w, h, scene) {
  const L = sceneLayout(scene, w, h)
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#ffffff'
  for (const [x, y, s] of L.stars) ctx.fillRect(x, y, s, s)
  ctx.fillStyle = '#fff4c9'
  ctx.beginPath()
  ctx.arc(L.moon, h * .16, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#000000'
  ctx.beginPath()
  ctx.arc(L.moon + 4, h * .14, 6.5, 0, Math.PI * 2)
  ctx.fill()
  L.items.forEach((item, i) => {
    if (item.windows) {
      wrapped(w, item.x, item.w, x => {
        item.windows.forEach(([wx, wy, ww, wh], j) => {
          if ((L.lit[i] * 7 + j * .37) % 1 > (item.type === 'tower' ? .45 : .35)) return
          ctx.fillStyle = (i + j) % 3 ? '#ffd27a' : '#cfe2ff'
          ctx.fillRect(wx - item.x + x, wy, ww, wh)
        })
      })
    }
    if (item.type === 'lamp') {
      wrapped(w, item.x - 10, 20, x => {
        const g = ctx.createRadialGradient(x + 10, item.y - 29, 0, x + 10, item.y - 29, 12)
        g.addColorStop(0, 'rgba(255,214,140,.95)')
        g.addColorStop(1, 'rgba(255,214,140,0)')
        ctx.fillStyle = g
        ctx.fillRect(x - 2, item.y - 41, 24, 24)
      })
    }
  })
}

export function windowScenery(scene = 'houses', season = 'summer') {
  const texture = canvasTexture(`view-${scene}-${season}`, 512, 128, (ctx, w, h) => paintDay(ctx, w, h, scene, season))
  texture.wrapS = THREE.RepeatWrapping
  return texture
}

export function windowNight(scene = 'houses') {
  const texture = canvasTexture(`view-${scene}-night`, 512, 128, (ctx, w, h) => paintNight(ctx, w, h, scene))
  texture.wrapS = THREE.RepeatWrapping
  return texture
}

// Riscos de chuva que emendam nas quatro bordas; a janela rola o deslocamento.
export function rainTexture() {
  const texture = canvasTexture('rain', 128, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const r = mulberry32(77)
    ctx.strokeStyle = 'rgba(225,238,255,.75)'
    ctx.lineWidth = 1
    for (let i = 0; i < 70; i += 1) {
      const x = r() * w
      const y = r() * h
      const len = 8 + r() * 10
      for (const [ox, oy] of [[0, 0], [-w, 0], [w, 0], [0, -h], [0, h]]) {
        ctx.beginPath()
        ctx.moveTo(x + ox, y + oy)
        ctx.lineTo(x + ox - len * .25, y + oy + len)
        ctx.stroke()
      }
    }
  })
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
}
