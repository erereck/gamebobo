import * as THREE from 'three'
import { ICONS } from '../ui/icons.js'

// Balões estilo Sims, com cara de adesivo: contorno tinta, sombra dura e um pictograma por fala.
const cache = new Map()
const SIZE = 128
const INK = '#1d1a24'

// Desenha o contorno de várias formas como uma só: traço grosso primeiro, recheio por cima.
function sticker(ctx, shapes, fill, { line = 4.5, drop = 5 } = {}) {
  ctx.save()
  ctx.fillStyle = INK
  ctx.globalAlpha = .9
  ctx.translate(0, drop)
  for (const shape of shapes) { ctx.beginPath(); shape(); ctx.fill() }
  ctx.restore()
  ctx.save()
  ctx.strokeStyle = INK
  ctx.lineWidth = line * 2
  ctx.lineJoin = 'round'
  for (const shape of shapes) { ctx.beginPath(); shape(); ctx.stroke() }
  ctx.fillStyle = fill
  for (const shape of shapes) { ctx.beginPath(); shape(); ctx.fill() }
  ctx.restore()
}

const circle = (ctx, x, y, r) => () => ctx.arc(x, y, r, 0, Math.PI * 2)
const rounded = (ctx, x, y, w, h, r) => () => ctx.roundRect(x, y, w, h, r)
const tail = (ctx, points) => () => {
  ctx.moveTo(points[0], points[1])
  for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1])
  ctx.closePath()
}

function bubbleShape(ctx, kind) {
  if (kind === 'thought') {
    const puffs = [[64, 52, 36], [36, 60, 22], [92, 60, 22], [50, 34, 22], [80, 34, 22]].map(([x, y, r]) => circle(ctx, x, y, r))
    sticker(ctx, [...puffs, circle(ctx, 42, 98, 8.5), circle(ctx, 31, 112, 5)], '#ffffff', { line: 4, drop: 4 })
  } else if (kind === 'alert') {
    sticker(ctx, [circle(ctx, 64, 56, 42), tail(ctx, [52, 92, 64, 116, 76, 92])], '#ffd23f')
  } else if (kind === 'money') {
    sticker(ctx, [rounded(ctx, 16, 14, 96, 80, 22), tail(ctx, [50, 90, 64, 114, 78, 90])], '#9bf6a1')
  } else {
    sticker(ctx, [rounded(ctx, 14, 12, 100, 82, 28), tail(ctx, [42, 88, 36, 114, 70, 90])], kind === 'angry' ? '#ffd6d6' : '#ffffff')
  }
}

function drawIcon(ctx, name, color, size = 56, cx = 64, cy = 56, width = 2.4) {
  const paths = ICONS[name] ?? ICONS.question ?? []
  ctx.save()
  ctx.translate(cx - size / 2, cy - size / 2)
  ctx.scale(size / 24, size / 24)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const d of paths) ctx.stroke(new Path2D(d))
  ctx.restore()
}

export function bubbleTexture(kind, icon, color = '#2b2440') {
  const key = `${kind}|${icon}|${color}`
  if (cache.has(key)) return cache.get(key)
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (kind === 'emote') {
    // emoção solta: pictograma com borda tinta e miolo branco, como adesivo recortado
    drawIcon(ctx, icon, INK, 80, 64, 66, 6.6)
    drawIcon(ctx, icon, '#ffffff', 80, 64, 64, 4.6)
    drawIcon(ctx, icon, color, 80, 64, 64, 2.5)
  } else {
    bubbleShape(ctx, kind)
    const alert = kind === 'alert'
    drawIcon(ctx, icon, alert ? INK : color, alert ? 56 : kind === 'thought' ? 48 : 52, 64, alert ? 56 : kind === 'thought' ? 52 : 53, alert ? 3.2 : 2.5)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  cache.set(key, texture)
  return texture
}

export function glowTexture() {
  if (cache.has('glow')) return cache.get('glow')
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(.35, 'rgba(255,255,255,.9)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  const texture = new THREE.CanvasTexture(canvas)
  cache.set('glow', texture)
  return texture
}

// Um "Z" gordinho para o sono dos bonecos (sobe da cabeça em trio).
export function zTexture() {
  if (cache.has('z')) return cache.get('z')
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  const z = () => {
    ctx.beginPath()
    ctx.moveTo(17, 17); ctx.lineTo(47, 17); ctx.lineTo(17, 47); ctx.lineTo(47, 47)
  }
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = INK
  ctx.lineWidth = 17
  ctx.save(); ctx.translate(0, 3); z(); ctx.stroke(); ctx.restore()
  z(); ctx.stroke()
  ctx.strokeStyle = '#b5a8ff'
  ctx.lineWidth = 8.5
  z(); ctx.stroke()
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  cache.set('z', texture)
  return texture
}

// Um balão que aparece com mola, flutua e some sozinho.
export class Bubble {
  constructor(parent, height = 1.45) {
    this.material = new THREE.SpriteMaterial({ transparent: true, depthWrite: false, depthTest: false })
    this.sprite = new THREE.Sprite(this.material)
    this.sprite.renderOrder = 10
    this.sprite.position.set(0, height, 0)
    this.sprite.visible = false
    this.base = height
    this.offset = 0
    this.life = 0
    this.age = 0
    this.sticky = false
    this.kind = null
    parent.add(this.sprite)
  }

  show(kind, icon, { color, duration = 1.6, sticky = false, scale = .55 } = {}) {
    this.material.map = bubbleTexture(kind, icon, color)
    this.material.needsUpdate = true
    this.sprite.visible = true
    this.life = duration
    this.age = 0
    this.sticky = sticky
    this.scale = scale
    this.kind = kind
  }

  hide() {
    this.sprite.visible = false
    this.sticky = false
    this.life = 0
    this.kind = null
  }

  get speaking() {
    return this.sprite.visible && this.kind === 'speech' && this.life > .2
  }

  update(dt) {
    if (!this.sprite.visible) return
    this.age += dt
    if (!this.sticky) {
      this.life -= dt
      if (this.life <= 0) {
        this.sprite.visible = false
        this.kind = null
        return
      }
    }
    // mola: passa do ponto, volta e assenta; inclina um pouquinho ao nascer
    const a = this.age
    const spring = a < .5 ? 1 - Math.exp(-a * 11) * Math.cos(a * 22) : 1
    const idle = this.sticky ? Math.sin(a * 3) * .05 : Math.sin(a * 3) * .015
    const fade = !this.sticky && this.life < .25 ? this.life / .25 : 1
    this.sprite.scale.setScalar(this.scale * (spring + idle) * (.6 + .4 * fade))
    this.material.rotation = a < .5 ? Math.exp(-a * 8) * Math.sin(a * 26) * .18 : 0
    this.material.opacity = fade
    this.sprite.position.y = this.base + this.offset + (this.kind === 'emote' ? a * .25 : Math.sin(a * 2.4) * .02)
  }
}
