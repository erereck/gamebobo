import * as THREE from 'three'
import { drawCover } from '../ui/cover.js'

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

// Tela de código rolando: linhas coloridas de tamanhos diferentes.
export function screenTexture(kind = 'code') {
  const texture = canvasTexture(`screen-${kind}`, 128, 256, (ctx, w, h) => {
    const bg = { code: '#14213d', art: '#1b1f3b', sound: '#1a1330', idea: '#1f2a1d', idle: '#0e1726' }[kind] ?? '#14213d'
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    const palettes = {
      code: ['#7ee787', '#79c0ff', '#ffa657', '#d2a8ff', '#e6edf3'],
      art: ['#ff7b72', '#ffa657', '#79c0ff', '#7ee787', '#f2cc60'],
      sound: ['#d2a8ff', '#a371f7', '#79c0ff', '#ff7b72'],
      idea: ['#f2cc60', '#7ee787', '#ffa657'],
      idle: ['#30363d', '#3b4250'],
    }
    const colors = palettes[kind] ?? palettes.code
    if (kind === 'sound') {
      for (let y = 8; y < h; y += 18) {
        ctx.strokeStyle = colors[(y / 18 | 0) % colors.length]
        ctx.lineWidth = 3
        ctx.beginPath()
        for (let x = 0; x < w; x += 4) ctx.lineTo(x, y + Math.sin(x * .2 + y) * 6 * Math.random())
        ctx.stroke()
      }
    } else if (kind === 'art') {
      for (let i = 0; i < 30; i += 1) {
        ctx.fillStyle = colors[i % colors.length]
        ctx.globalAlpha = .8
        const s = 8 + Math.random() * 26
        ctx.fillRect(Math.random() * w, Math.random() * h, s, s)
      }
    } else {
      for (let y = 6; y < h; y += 11) {
        let x = 6 + ((y * 7) % 4) * 8
        while (x < w - 10) {
          const len = 8 + Math.random() * 30
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
          ctx.fillRect(x, y, Math.min(len, w - x - 6), 5)
          x += len + 6
          if (Math.random() < .3) break
        }
      }
    }
  })
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
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
