import * as THREE from 'three'
import { ICONS } from '../ui/icons.js'

// Balões estilo Sims: um pictograma por fala, desenhado com os mesmos ícones da interface.
const cache = new Map()
const SIZE = 128

function roundedBubble(ctx, kind) {
  ctx.save()
  ctx.shadowColor = 'rgba(30,20,60,.25)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetY = 3
  if (kind === 'thought') {
    ctx.fillStyle = '#ffffff'
    for (const [x, y, r] of [[64, 54, 40], [34, 62, 24], [94, 62, 24], [50, 34, 24], [80, 34, 24]]) {
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.beginPath(); ctx.arc(44, 104, 9, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(34, 118, 5, 0, Math.PI * 2); ctx.fill()
  } else if (kind === 'alert') {
    ctx.fillStyle = '#ffd23f'
    ctx.beginPath()
    ctx.arc(64, 58, 46, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(52, 98); ctx.lineTo(64, 122); ctx.lineTo(76, 98)
    ctx.fill()
    ctx.shadowColor = 'transparent'
    ctx.lineWidth = 5
    ctx.strokeStyle = '#1d1a24'
    ctx.beginPath()
    ctx.arc(64, 58, 46, 0, Math.PI * 2)
    ctx.stroke()
  } else if (kind === 'money') {
    ctx.fillStyle = '#9bf6a1'
    ctx.beginPath()
    ctx.roundRect(14, 14, 100, 84, 22)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(50, 96); ctx.lineTo(64, 120); ctx.lineTo(78, 96)
    ctx.fill()
  } else {
    ctx.fillStyle = kind === 'angry' ? '#ffd6d6' : '#ffffff'
    ctx.beginPath()
    ctx.roundRect(12, 12, 104, 86, 30)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(44, 94); ctx.lineTo(38, 122); ctx.lineTo(70, 96)
    ctx.fill()
  }
  ctx.restore()
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
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,.25)'
    ctx.shadowBlur = 6
    drawIcon(ctx, icon, '#ffffff', 84, 64, 64, 5.2)
    ctx.restore()
    drawIcon(ctx, icon, color, 84, 64, 64, 2.6)
  } else {
    roundedBubble(ctx, kind)
    drawIcon(ctx, icon, kind === 'alert' ? '#1d1a24' : color, kind === 'alert' ? 58 : 54, 64, kind === 'alert' ? 58 : 55, kind === 'alert' ? 3.2 : 2.4)
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

// Um balão que aparece, quica e some sozinho.
export class Bubble {
  constructor(parent, height = 1.45) {
    this.material = new THREE.SpriteMaterial({ transparent: true, depthWrite: false, depthTest: false })
    this.sprite = new THREE.Sprite(this.material)
    this.sprite.renderOrder = 10
    this.sprite.position.set(0, height, 0)
    this.sprite.visible = false
    this.base = height
    this.life = 0
    this.age = 0
    this.sticky = false
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
  }

  update(dt) {
    if (!this.sprite.visible) return
    this.age += dt
    if (!this.sticky) {
      this.life -= dt
      if (this.life <= 0) {
        this.sprite.visible = false
        return
      }
    }
    const pop = Math.min(1, this.age * 6)
    const overshoot = pop < 1 ? pop * 1.15 : 1 + Math.sin(this.age * 3) * (this.sticky ? .05 : .015)
    const fade = !this.sticky && this.life < .25 ? this.life / .25 : 1
    this.sprite.scale.setScalar(this.scale * overshoot * (.6 + .4 * fade))
    this.material.opacity = fade
    this.sprite.position.y = this.base + (this.kind === 'emote' ? this.age * .25 : Math.sin(this.age * 2.4) * .02)
  }
}
