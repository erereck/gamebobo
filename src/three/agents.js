import * as THREE from 'three'
import { Boneco, Gato } from './character.js'
import { Bubble } from './bubbles.js'

const TAU = Math.PI * 2
const angleLerp = (a, b, t) => {
  let d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI
  return a + d * t
}
const rand = (a, b) => a + Math.random() * (b - a)
const pickOne = list => list[Math.floor(Math.random() * list.length)]

const WORK_THOUGHTS = { fun: ['gamepad', 'code'], art: ['brush', 'sparkle'], sound: ['note', 'headphones'], idea: ['bulb', 'puzzle'] }
const SMALL_TALK = ['coffee', 'pizza', 'gamepad', 'heart', 'star', 'laugh', 'question', 'money', 'ball', 'music', 'sun', 'tv', 'bug', 'cat', 'idea', 'rocket', 'dice', 'fire', 'cards', 'trophy']

export class StaffAgent {
  constructor(world, info) {
    this.world = world
    this.id = info.id
    this.info = info
    this.boneco = new Boneco(info.look, { founder: info.founder })
    this.root = this.boneco.root
    this.root.userData.agentId = info.id
    this.boneco.hit.userData.agentId = info.id
    this.bubble = new Bubble(this.root, 1.5)
    this.alert = new Bubble(this.root, 1.85)
    this.state = 'idle'
    this.timer = rand(.3, 1.5)
    this.path = []
    this.speed = 0
    this.rot = 0
    this.targetRot = 0
    this.deskIndex = -1
    this.spot = null
    this.partner = null
    this.appear = 1
    this.voice = .8 + Math.random() * .6
    this.thoughtTimer = rand(3, 8)
  }

  get x() { return this.root.position.x }
  get z() { return this.root.position.z }

  place(x, z, rot = 0) {
    this.root.position.set(x, 0, z)
    this.rot = this.targetRot = rot
    this.root.rotation.y = rot
  }

  walkTo(x, z, then) {
    this.releaseSpot()
    this.path = this.world.nav.findPath(this.x, this.z, x, z)
    this.onArrive = then
    this.state = 'walk'
    this.boneco.setPose('walk')
  }

  releaseSpot() {
    if (this.spot) this.spot.usedBy = null
    this.spot = null
    if (this.desk && this.desk.usedBy === this.id) this.desk.usedBy = null
    this.desk = null
  }

  setIdle(time = rand(.6, 2.2)) {
    this.state = 'idle'
    this.timer = time
    this.boneco.setPose(null)
  }

  myDesk() {
    return this.world.desks[this.deskIndex] ?? null
  }

  goToDesk(mode = 'work') {
    const desk = this.myDesk()
    if (!desk) return this.wander()
    this.walkTo(desk.spot.x, desk.spot.z, () => {
      this.desk = desk
      desk.usedBy = this.id
      this.place(desk.spot.x, desk.spot.z, desk.spot.face)
      this.state = mode
      this.timer = mode === 'work' ? rand(7, 16) : mode === 'sleep' ? rand(5, 9) : rand(4, 8)
      this.boneco.setPose(mode === 'work' ? 'type' : mode === 'sleep' ? 'sleep' : 'sit')
      if (mode === 'sleep') this.bubble.show('emote', 'zzz', { color: '#6c63ff', duration: 2.2 })
    })
  }

  wander() {
    const [x, z] = this.world.nav.randomWalkable()
    this.walkTo(x, z, () => this.setIdle(rand(1, 3)))
  }

  useSpot(action) {
    const spots = this.world.spots.filter(spot => spot.action === action && !spot.usedBy)
    if (!spots.length) return false
    const spot = pickOne(spots)
    spot.usedBy = this.id
    this.walkTo(spot.x, spot.z, () => {
      this.spot = spot
      spot.usedBy = this.id
      this.place(spot.seatX ?? spot.x, spot.seatZ ?? spot.z, spot.face)
      this.state = 'activity'
      this.activity = action
      this.timer = action === 'sofa' ? rand(6, 12) : action === 'arcade' ? rand(6, 11) : rand(3, 6)
      const pose = { coffee: 'drink', sofa: 'sit', arcade: 'play', foosball: 'play', whiteboard: 'wave', look: null, plant: null, meeting: 'sit' }[action]
      this.boneco.setPose(pose ?? null)
      const icon = { coffee: 'coffee', arcade: 'gamepad', foosball: 'ball', whiteboard: 'bulb', look: 'sun', plant: 'plant', sofa: 'zzz' }[action]
      if (icon && Math.random() < .7) this.bubble.show(action === 'sofa' ? 'emote' : 'thought', icon, { duration: 2 })
    })
    return true
  }

  decide() {
    const w = this.world
    const info = this.info
    if (info.status !== 'ok') return this.leave()
    const working = w.view.working
    const trait = info.trait
    const r = Math.random()
    if (working) {
      if (info.energy < 18 && r < .5) return this.goToDesk('sleep')
      let breakChance = .1 + (trait === 'tagarela' ? .12 : 0) + (trait === 'cafe' ? .08 : 0) + (info.energy < 35 ? .1 : 0) - (w.view.pace === 'crunch' ? .06 : 0)
      if (trait === 'preguica' && r < .12) return this.goToDesk('sleep')
      if (r < breakChance) {
        const options = []
        if (w.hasSpot('coffee')) options.push('coffee', 'coffee', ...(trait === 'cafe' ? ['coffee', 'coffee', 'coffee'] : []))
        options.push('chat', ...(trait === 'tagarela' ? ['chat', 'chat'] : []))
        if (w.hasSpot('look')) options.push('look')
        if (info.energy < 40 && w.hasSpot('sofa')) options.push('sofa')
        const choice = pickOne(options)
        if (choice === 'chat' && w.startChat(this)) return
        if (choice !== 'chat' && this.useSpot(choice)) return
      }
      return this.goToDesk('work')
    }
    const weights = [['wander', 2], ['chat', 3.2], ['desk', 1.4], ['coffee', 1.4], ['sofa', 1.6], ['arcade', trait === 'gamer' ? 5 : 1.8], ['foosball', 1.5], ['look', 1], ['whiteboard', trait === 'caotico' ? 3 : .8], ['plant', trait === 'zen' ? 3 : .6], ['cat', 2], ['meeting', .6]]
    if (trait === 'tagarela') weights[1][1] = 7
    if (trait === 'preguica') weights[4][1] = 5
    const usable = weights.filter(([name]) => name === 'wander' || name === 'chat' || name === 'desk' || (name === 'cat' ? w.cat : w.hasSpot(name)))
    const total = usable.reduce((s, [, v]) => s + v, 0)
    let roll = Math.random() * total
    for (const [name, weight] of usable) {
      roll -= weight
      if (roll > 0) continue
      if (name === 'wander') return this.wander()
      if (name === 'desk') return this.goToDesk('sit')
      if (name === 'chat') return w.startChat(this) || this.wander()
      if (name === 'cat') return this.petCat()
      return this.useSpot(name) || this.wander()
    }
    return this.wander()
  }

  petCat() {
    const cat = this.world.cat
    if (!cat) return this.wander()
    this.walkTo(cat.x + .45, cat.z + .1, () => {
      this.face(cat.x, cat.z)
      this.state = 'activity'
      this.activity = 'cat'
      this.timer = 2.5
      this.boneco.setPose('wave', .5)
      this.bubble.show('emote', 'heart', { color: '#ff4d8d', duration: 1.8 })
      cat.purr()
    })
  }

  face(x, z) {
    this.targetRot = Math.atan2(x - this.x, z - this.z)
  }

  leave() {
    if (this.state === 'gone' || this.state === 'leaving') return
    const door = this.world.door
    this.walkTo(door.x, door.z, () => {
      this.state = 'gone'
      this.root.visible = false
    })
    this.state = 'leaving'
  }

  enter() {
    const door = this.world.door
    this.place(door.x, door.z, door.face)
    this.root.visible = true
    this.appear = 0
    this.setIdle(.4)
    if (Math.random() < .7) this.bubble.show('speech', 'smile', { duration: 1.4 })
  }

  react(kind) {
    if (this.state === 'gone' || this.state === 'leaving') return
    this.releaseSpot()
    this.path = []
    if (kind === 'cheer' || kind === 'party') {
      this.state = 'celebrate'
      this.timer = kind === 'party' ? 3.4 : 2
      this.boneco.setPose('cheer', kind === 'party' ? 1 : .6)
      this.bubble.show('emote', kind === 'party' ? 'star' : 'laugh', { color: '#ff9f1c', duration: 1.8 })
    } else if (kind === 'sad') {
      this.state = 'sad'
      this.timer = 3
      this.boneco.setPose('sad')
      this.bubble.show('emote', 'storm', { color: '#5c677d', duration: 2.6 })
    }
  }

  think(pillar) {
    if (this.state !== 'work' || this.bubble.sprite.visible) return
    this.bubble.show('thought', pickOne(WORK_THOUGHTS[pillar] ?? WORK_THOUGHTS.fun), { duration: 1.6, scale: .45 })
  }

  update(dt) {
    const w = this.world
    const b = this.boneco
    this.appear = Math.min(1, this.appear + dt * 4)
    this.root.scale.setScalar(.2 + .8 * this.appear)
    const hasIdea = w.ideaSet.has(this.id) && this.state !== 'gone'
    if (hasIdea && !this.alert.sprite.visible) this.alert.show('alert', 'exclaim', { sticky: true, scale: .5 })
    if (!hasIdea && this.alert.sprite.visible) this.alert.hide()
    this.bubble.update(dt)
    this.alert.update(dt)

    if (this.state === 'gone') {
      if (this.info.status === 'ok') this.enter()
      return
    }
    if (this.info.status !== 'ok' && this.state !== 'leaving') this.leave()

    let speed = 0
    if (this.state === 'walk' || this.state === 'leaving') {
      const target = this.path[0]
      if (!target) {
        const done = this.onArrive
        this.onArrive = null
        if (this.state === 'walk') this.setIdle()
        done?.()
      } else {
        const dx = target[0] - this.x
        const dz = target[1] - this.z
        const dist = Math.hypot(dx, dz)
        const v = (w.view.pace === 'crunch' && w.view.working ? 1.75 : 1.25) * dt
        if (dist <= v) {
          this.root.position.x = target[0]
          this.root.position.z = target[1]
          this.path.shift()
        } else {
          this.root.position.x += dx / dist * v
          this.root.position.z += dz / dist * v
          this.targetRot = Math.atan2(dx, dz)
          speed = 1
        }
      }
    } else {
      this.timer -= dt
    }

    if (this.state === 'idle' && this.timer <= 0) this.decide()
    else if (this.state === 'work') {
      this.thoughtTimer -= dt
      if (this.thoughtTimer <= 0) {
        this.thoughtTimer = rand(5, 11)
        if (Math.random() < .35) w.deskChat(this)
      }
      if (this.timer <= 0) {
        if (!w.view.working) this.setIdle(.2)
        else this.decide()
      }
    } else if (this.state === 'sit' || this.state === 'sleep') {
      if (this.state === 'sleep' && Math.random() < dt * .4) this.bubble.show('emote', 'zzz', { color: '#6c63ff', duration: 1.8 })
      if (this.timer <= 0 || (w.view.working && this.state === 'sit')) this.decide()
    } else if (this.state === 'waitChat') {
      if (this.timer <= 0) this.setIdle()
    } else if (this.state === 'activity' || this.state === 'celebrate' || this.state === 'sad') {
      if (this.timer <= 0) this.setIdle(rand(.2, 1))
    }

    this.rot = angleLerp(this.rot, this.targetRot, 1 - Math.exp(-dt * 12))
    this.root.rotation.y = this.rot
    b.update(dt, speed)
  }
}

// Conversa à la Sims: falas alternadas com pictogramas e uma reação no fim.
export class Conversation {
  constructor(world, a, b) {
    this.world = world
    this.a = a
    this.b = b
    this.lines = 3 + Math.floor(Math.random() * 4)
    this.turn = 0
    this.timer = .3
    this.couple = world.isCouple(a.id, b.id)
    this.done = false
  }

  update(dt) {
    if (this.done) return
    const { a, b } = this
    if (a.state !== 'chat' || b.state !== 'chat') return this.end(false)
    this.timer -= dt
    if (this.timer > 0) return
    if (this.turn >= this.lines) return this.end(true)
    const speaker = this.turn % 2 ? b : a
    const listener = this.turn % 2 ? a : b
    speaker.boneco.setPose('talk')
    listener.boneco.setPose('talk', .25)
    const icon = this.couple && Math.random() < .5 ? 'heart' : pickOne(this.world.topics())
    speaker.bubble.show('speech', icon, { duration: 1.25, scale: .5 })
    this.world.blip(speaker)
    this.turn += 1
    this.timer = 1.25
  }

  end(natural) {
    this.done = true
    const { a, b } = this
    if (natural) {
      const roll = Math.random()
      const reaction = this.couple ? 'heart' : roll < .62 ? 'laugh' : roll < .9 ? 'smile' : 'angry'
      for (const agent of [a, b]) {
        agent.bubble.show('emote', reaction, { color: reaction === 'heart' ? '#ff4d8d' : reaction === 'angry' ? '#e63946' : '#ff9f1c', duration: 1.6 })
        if (reaction === 'laugh') agent.boneco.setPose('cheer', .25)
      }
    }
    for (const agent of [a, b]) {
      if (agent.state === 'chat') {
        agent.partner = null
        agent.setIdle(rand(.8, 1.6))
      }
    }
  }
}

export class CatAgent {
  constructor(world) {
    this.world = world
    this.gato = new Gato(pickOne(['#f0a24a', '#3b3b3b', '#f5f5f5', '#c9a27a', '#8e8e8e']))
    this.root = this.gato.root
    this.gato.hit.userData.agentId = 'cat'
    this.bubble = new Bubble(this.root, .7)
    this.state = 'idle'
    this.timer = 1
    this.path = []
    this.rot = 0
  }

  get x() { return this.root.position.x }
  get z() { return this.root.position.z }

  purr() {
    this.bubble.show('emote', 'heart', { color: '#ff4d8d', duration: 1.5, scale: .35 })
  }

  update(dt) {
    this.bubble.update(dt)
    const w = this.world
    let speed = 0
    if (this.state === 'walk') {
      const target = this.path[0]
      if (!target) {
        this.state = 'idle'
        this.timer = rand(2, 6)
        if (this.sleepAfter) {
          this.state = 'sleep'
          this.timer = rand(10, 20)
          this.sleepAfter = false
        }
      } else {
        const dx = target[0] - this.x
        const dz = target[1] - this.z
        const dist = Math.hypot(dx, dz)
        const v = .8 * dt
        if (dist <= v) {
          this.root.position.x = target[0]
          this.root.position.z = target[1]
          this.path.shift()
        } else {
          this.root.position.x += dx / dist * v
          this.root.position.z += dz / dist * v
          this.rot = angleLerp(this.rot, Math.atan2(dx, dz) - Math.PI / 2, 1 - Math.exp(-dt * 8))
          speed = 1
        }
      }
    } else {
      this.timer -= dt
      if (this.timer <= 0) {
        const bed = w.spots.find(spot => spot.action === 'catbed')
        const r = Math.random()
        if (bed && r < .3) {
          this.path = w.nav.findPath(this.x, this.z, bed.x, bed.z)
          this.sleepAfter = true
        } else if (r < .55 && w.agents.length) {
          const friend = pickOne(w.agents.filter(agent => agent.root.visible))
          if (friend) this.path = w.nav.findPath(this.x, this.z, friend.x + .4, friend.z + .3)
        } else {
          const [x, z] = w.nav.randomWalkable()
          this.path = w.nav.findPath(this.x, this.z, x, z)
        }
        this.state = 'walk'
        if (Math.random() < .25) this.bubble.show('emote', pickOne(['heart', 'zzz', 'question']), { color: '#ff9f1c', duration: 1.4, scale: .32 })
      }
    }
    this.gato.sleeping += ((this.state === 'sleep' ? 1 : 0) - this.gato.sleeping) * Math.min(1, dt * 3)
    this.root.rotation.y = this.rot
    this.gato.update(dt, speed)
  }
}

export class VisitorAgent {
  constructor(world) {
    this.world = world
    this.boneco = new Boneco({ skin: '#d9a066', hair: '#1f1a17', hairStyle: 'curto', shirt: '#ffbe0b', pants: '#2b3a55', extra: 'bone', height: 1.05 })
    this.root = this.boneco.root
    this.boneco.hit.userData.agentId = 'visitor'
    const bag = new THREE.Mesh(new THREE.BoxGeometry(.42, .5, .26), new THREE.MeshStandardMaterial({ color: '#3a86ff', roughness: .8 }))
    bag.position.set(0, .55, -.22)
    bag.castShadow = true
    this.root.add(bag)
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(.43, .08, .27), new THREE.MeshStandardMaterial({ color: '#ff006e' }))
    stripe.position.set(0, .62, -.22)
    this.root.add(stripe)
    this.bubble = new Bubble(this.root, 1.6)
    this.state = 'enter'
    this.path = []
    this.rot = 0
    const door = world.door
    this.root.position.set(door.x, 0, door.z)
    const [x, z] = world.visitorSpot
    this.path = world.nav.findPath(door.x, door.z, x, z)
    this.boneco.setPose('walk')
  }

  get x() { return this.root.position.x }
  get z() { return this.root.position.z }

  leave() {
    if (this.state === 'leave') return
    this.state = 'leave'
    this.bubble.hide()
    this.path = this.world.nav.findPath(this.x, this.z, this.world.door.x, this.world.door.z)
    this.boneco.setPose('walk')
  }

  update(dt) {
    this.bubble.update(dt)
    let speed = 0
    const target = this.path[0]
    if (target) {
      const dx = target[0] - this.x
      const dz = target[1] - this.z
      const dist = Math.hypot(dx, dz)
      const v = 1.2 * dt
      if (dist <= v) {
        this.root.position.x = target[0]
        this.root.position.z = target[1]
        this.path.shift()
      } else {
        this.root.position.x += dx / dist * v
        this.root.position.z += dz / dist * v
        this.rot = angleLerp(this.rot, Math.atan2(dx, dz), 1 - Math.exp(-dt * 10))
        speed = 1
      }
    } else if (this.state === 'enter') {
      this.state = 'wait'
      this.boneco.setPose('wave', .6)
      this.bubble.show('money', 'cash', { sticky: true, scale: .55, color: '#1b5e20' })
    } else if (this.state === 'wait') {
      this.rot = angleLerp(this.rot, Math.PI / 4, dt * 3)
      if (Math.random() < dt * .25) this.boneco.setPose(Math.random() < .5 ? 'wave' : null, .6)
    } else if (this.state === 'leave') {
      this.root.visible = false
      this.gone = true
    }
    this.root.rotation.y = this.rot
    this.boneco.update(dt, speed)
  }
}
