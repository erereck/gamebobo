import * as THREE from 'three'
import { glowTexture, bubbleTexture } from './bubbles.js'

export const PILLAR_COLORS = { fun: '#ff7a45', art: '#3fb8ff', sound: '#b57bff', idea: '#ffc93c', bug: '#ff3355', money: '#52d977' }

// Orbes de produção: saem do monitor, sobem em arco e somem.
export class Particles {
  constructor(scene) {
    this.scene = scene
    this.orbs = []
    this.confetti = []
    this.floaters = []
    const glow = glowTexture()
    for (let i = 0; i < 140; i += 1) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#ffffff', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
      sprite.visible = false
      sprite.renderOrder = 5
      scene.add(sprite)
      this.orbs.push({ sprite, life: 0 })
    }
    const confettiGeo = new THREE.PlaneGeometry(.07, .12)
    const colors = ['#ff5d3a', '#ffd23f', '#3fb8ff', '#52d977', '#ff6bd6', '#b57bff']
    for (let i = 0; i < 220; i += 1) {
      const mesh = new THREE.Mesh(confettiGeo, new THREE.MeshBasicMaterial({ color: colors[i % colors.length], side: THREE.DoubleSide, transparent: true }))
      mesh.visible = false
      scene.add(mesh)
      this.confetti.push({ mesh, life: 0, v: new THREE.Vector3(), spin: new THREE.Vector3() })
    }
    for (let i = 0; i < 30; i += 1) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, depthTest: false }))
      sprite.visible = false
      sprite.renderOrder = 11
      scene.add(sprite)
      this.floaters.push({ sprite, life: 0, v: 0 })
    }
  }

  orb(from, pillar, count = 3) {
    for (let n = 0; n < count; n += 1) {
      const orb = this.orbs.find(item => item.life <= 0)
      if (!orb) return
      orb.life = 1.3 + Math.random() * .4
      orb.max = orb.life
      orb.start = from.clone().add(new THREE.Vector3((Math.random() - .5) * .3, 0, (Math.random() - .5) * .3))
      orb.drift = new THREE.Vector3((Math.random() - .5) * .5, 1.1 + Math.random() * .5, (Math.random() - .5) * .5)
      orb.delay = n * .12
      orb.sprite.material.color.set(PILLAR_COLORS[pillar] ?? '#fff')
      orb.sprite.position.copy(orb.start)
      orb.sprite.visible = false
    }
  }

  burst(center, amount = 120, spread = 3) {
    let made = 0
    for (const piece of this.confetti) {
      if (piece.life > 0) continue
      piece.life = 2.4 + Math.random() * 1.4
      piece.mesh.position.set(center.x + (Math.random() - .5) * spread, center.y + 2.4 + Math.random(), center.z + (Math.random() - .5) * spread)
      piece.v.set((Math.random() - .5) * 1.5, Math.random() * 1.2, (Math.random() - .5) * 1.5)
      piece.spin.set(Math.random() * 8, Math.random() * 8, Math.random() * 8)
      piece.mesh.visible = true
      made += 1
      if (made >= amount) break
    }
  }

  // Ícone que sobe e some (cifrão de venda, coração, raio de hype).
  float(position, icon, color = '#2b2440', scale = .45) {
    const item = this.floaters.find(entry => entry.life <= 0)
    if (!item) return
    item.life = 1.6
    item.sprite.material.map = bubbleTexture('emote', icon, color)
    item.sprite.material.needsUpdate = true
    item.sprite.position.copy(position)
    item.sprite.scale.setScalar(scale)
    item.sprite.visible = true
  }

  update(dt) {
    for (const orb of this.orbs) {
      if (orb.life <= 0) continue
      if (orb.delay > 0) {
        orb.delay -= dt
        continue
      }
      orb.life -= dt
      const t = 1 - orb.life / orb.max
      orb.sprite.visible = orb.life > 0
      orb.sprite.position.set(orb.start.x + orb.drift.x * t, orb.start.y + orb.drift.y * Math.sin(t * Math.PI * .6), orb.start.z + orb.drift.z * t)
      const s = .16 * (t < .15 ? t / .15 : 1) * (1 - t * .5)
      orb.sprite.scale.setScalar(s)
      orb.sprite.material.opacity = t > .7 ? (1 - t) / .3 : 1
    }
    for (const piece of this.confetti) {
      if (piece.life <= 0) continue
      piece.life -= dt
      piece.v.y -= 2.6 * dt
      piece.v.multiplyScalar(.985)
      piece.mesh.position.addScaledVector(piece.v, dt)
      if (piece.mesh.position.y < .02) {
        piece.mesh.position.y = .02
        piece.v.set(0, 0, 0)
        piece.spin.set(0, 0, 0)
        piece.mesh.rotation.set(-Math.PI / 2, 0, piece.mesh.rotation.z)
      }
      piece.mesh.rotation.x += piece.spin.x * dt
      piece.mesh.rotation.y += piece.spin.y * dt
      piece.mesh.material.opacity = Math.min(1, piece.life / .6)
      if (piece.life <= 0) piece.mesh.visible = false
    }
    for (const item of this.floaters) {
      if (item.life <= 0) continue
      item.life -= dt
      item.sprite.position.y += dt * .5
      item.sprite.material.opacity = Math.min(1, item.life / .5)
      if (item.life <= 0) item.sprite.visible = false
    }
  }
}
