import * as THREE from 'three'
import { Boneco, DESK_TOP, Gato } from './character.js'
import { Bubble } from './bubbles.js'

const TAU = Math.PI * 2
const wrap = a => ((a + Math.PI) % TAU + TAU) % TAU - Math.PI
const angleLerp = (a, b, t) => a + wrap(b - a) * t
const rand = (a, b) => a + Math.random() * (b - a)
const pickOne = list => list[Math.floor(Math.random() * list.length)]
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const ease = v => {
  const x = clamp(v, 0, 1)
  return x * x * (3 - 2 * x)
}

const WORK_THOUGHTS = { fun: ['gamepad', 'code'], art: ['brush', 'sparkle'], sound: ['note', 'headphones'], idea: ['bulb', 'puzzle'] }
const WALK_SPEED = 1.25

// Altura do assento quando o móvel ainda não informa seatY (contrato: spot.seatY).
// Sofá sem assento marcado ou reunião sem cadeira: o boneco fica em pé, nunca sentado no ar.
function seatHeight(spot, action) {
  if (typeof spot.seatY === 'number') return spot.seatY
  if (action === 'desk') return .3
  if (action === 'sofa' && spot.seatX != null) return .4
  return null
}

// Brinquedo de mão de cada época: Game & Watch, tijolinho, portátil largo, celular.
const HANDHELD_BY_ERA = { fliper: 'watch', cartucho: 'brick', cd: 'brick', lanhouse: 'wide', app: 'phone', stream: 'phone', algoritmo: 'phone', futuro: 'phone' }
const LATE_ERAS = new Set(['cd', 'lanhouse', 'app', 'stream', 'algoritmo', 'futuro'])
function handheldFor(view) {
  const year = view?.year
  if (typeof year === 'number') return year >= 2008 ? 'phone' : year >= 2001 ? 'wide' : year >= 1989 ? 'brick' : 'watch'
  return HANDHELD_BY_ERA[view?.era?.id] ?? 'phone'
}
function drinkFor(view, info) {
  const year = view?.year
  const late = typeof year === 'number' ? year >= 1997 : LATE_ERAS.has(view?.era?.id)
  if (late && (info.energy < 35 || (info.working && info.pace === 'crunch') || Math.random() < .2)) return 'can'
  return 'mug'
}

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
    this.rot = 0
    this.targetRot = 0
    this.deskIndex = -1
    this.desk = null
    this.spot = null
    this.partner = null
    this.appear = 1
    this.voice = .8 + Math.random() * .6
    this.thoughtTimer = rand(3, 8)
    this.gestureTimer = rand(6, 12)
    this.lift = 0
    this.liftGoal = 0
    this.glide = null
    this.seat = null
    this.partyTimer = 0
    this.buddy = null
    this.five = null
    this.lookPoint = new THREE.Vector3()
  }

  get x() { return this.root.position.x }
  get z() { return this.root.position.z }

  // Teletransporte (montagem do escritório): sempre em pé, no chão, sem assento.
  place(x, z, rot = 0) {
    this.root.position.set(x, 0, z)
    this.rot = this.targetRot = rot
    this.root.rotation.y = rot
    this.glide = null
    this.seat = null
    this.lift = this.liftGoal = 0
    this.freeSpots()
    this.boneco.setBase('stand')
    this.boneco.snapBase()
    this.boneco.setProp(null)
    this.boneco.gaze = null
  }

  walkTo(x, z, then) {
    const b = this.boneco
    this.path = []
    this.onArrive = null
    this.state = 'walk'
    this.activity = null
    b.setPose(null)
    b.setProp(null)
    b.gaze = null
    const go = () => {
      this.freeSpots()
      b.setBase('stand')
      this.path = this.world.nav.findPath(this.x, this.z, x, z)
      this.onArrive = then
    }
    if (this.seat) this.standUp(go)
    else if (this.glide) this.glide.done = () => {
      this.freeSpots()
      go()
    }
    else go()
  }

  // Quem ainda está sentado ou deitado segura o lugar até levantar.
  releaseSpot() {
    if (!this.seat) this.freeSpots()
  }

  freeSpots() {
    if (this.spot && this.spot.usedBy === this.id) this.spot.usedBy = null
    this.spot = null
    if (this.desk && this.desk.usedBy === this.id) this.desk.usedBy = null
    this.desk = null
  }

  setIdle(time = rand(.6, 2.2)) {
    this.state = 'idle'
    this.timer = time
    this.activity = null
    const b = this.boneco
    b.setPose(null)
    b.setProp(null)
    b.gaze = null
    if (!this.seat) b.setBase('stand')
  }

  // Desliza até o assento (ou para dentro da cama) enquanto vira e senta.
  startGlide(x, z, dur, done) {
    this.glide = { x0: this.x, z0: this.z, x1: x, z1: z, t: 0, dur, done }
  }

  settle({ x, z, face, kind, seatY = 0, lieY = 0, standX, standZ, swivel = 0, dur = .4 }) {
    const b = this.boneco
    this.seat = { x: standX, z: standZ, face, kind, swivel }
    this.targetRot = face
    b.setBase(kind)
    if (kind === 'sit') {
      this.liftGoal = seatY - b.seatHip
      b.seatHigh = seatY
    } else this.liftGoal = lieY
    this.startGlide(x, z, dur)
  }

  standUp(then) {
    const seat = this.seat
    this.seat = null
    this.boneco.setBase('stand')
    this.liftGoal = 0
    this.startGlide(seat.x, seat.z, seat.kind === 'lie' ? .55 : .32, () => {
      this.freeSpots()
      then?.()
    })
  }

  myDesk() {
    return this.world.desks[this.deskIndex] ?? null
  }

  goToDesk(mode = 'work') {
    const desk = this.myDesk()
    if (!desk) return this.wander()
    if (this.desk === desk && this.seat) return this.atDesk(mode)
    const spot = desk.spot
    const ax = spot.x - Math.sin(spot.face) * .3
    const az = spot.z - Math.cos(spot.face) * .3
    this.walkTo(ax, az, () => {
      this.desk = desk
      desk.usedBy = this.id
      this.settle({ x: spot.x, z: spot.z, face: spot.face, kind: 'sit', seatY: seatHeight(spot, 'desk'), standX: ax, standZ: az, swivel: .45, dur: .38 })
      this.atDesk(mode)
    })
    desk.usedBy = this.id
  }

  atDesk(mode) {
    const b = this.boneco
    this.state = mode
    this.activity = null
    this.timer = mode === 'work' ? rand(7, 16) : mode === 'sleep' ? rand(6, 10) : rand(5, 9)
    b.setProp(null)
    b.gaze = null
    if (mode === 'work') b.setPose('type')
    else if (mode === 'sleep') {
      b.deskLean = this.deskLean()
      b.setPose('sleep')
    } else this.seatedLeisure()
  }

  // Inclinação para a cabeça encostar nos braços sobre a mesa, conforme a altura do assento.
  deskLean() {
    const b = this.boneco
    const s = b.scale
    const seatY = seatHeight(this.desk?.spot ?? {}, 'desk')
    const hip = seatY + .062 * s
    const deskTop = this.desk?.spot?.deskY ?? DESK_TOP
    const c = (deskTop + .075 + .235 * s - hip) / (.52 * s)
    return clamp(Math.acos(clamp(c, -1, 1)), .12, .32)
  }

  // Sentado sem trabalhar: celular/portátil da época, mãos atrás da cabeça ou só balançando os pés.
  seatedLeisure() {
    const b = this.boneco
    const roll = Math.random()
    if (roll < .55) {
      b.setProp(handheldFor(this.world.view))
      b.setPose('phone')
    } else if (roll < .8) b.setPose('relax')
    else b.setPose(null)
  }

  wander() {
    const [x, z] = this.world.nav.randomWalkable()
    this.walkTo(x, z, () => this.setIdle(rand(1, 3)))
  }

  useSpot(action) {
    const spots = this.world.spots.filter(spot => spot.action === action && !spot.usedBy && (action !== 'bed' || spot.lie))
    if (!spots.length) return false
    const spot = pickOne(spots)
    spot.usedBy = this.id
    this.walkTo(spot.x, spot.z, () => {
      this.spot = spot
      spot.usedBy = this.id
      this.targetRot = spot.face
      this.state = 'activity'
      this.activity = action
      this.timer = { sofa: rand(7, 13), bed: rand(12, 22), arcade: rand(6, 11), foosball: rand(5, 9), meeting: rand(6, 12), coffee: rand(4, 7) }[action] ?? rand(3.5, 6)
      this.beginActivity(action, spot)
    })
    return true
  }

  beginActivity(action, spot) {
    const b = this.boneco
    const info = this.info
    const view = this.world.view
    const tired = info.energy < 45 || info.trait === 'preguica'
    if (action === 'coffee') {
      b.setProp(drinkFor(view, info))
      b.setPose('drink')
      if (Math.random() < .5) this.bubble.show('thought', 'coffee', { duration: 1.6, scale: .42 })
    } else if (action === 'sofa') {
      const seatY = seatHeight(spot, 'sofa')
      if (seatY == null) {
        b.setProp(handheldFor(view))
        b.setPose('phone')
        return
      }
      this.settle({ x: spot.seatX ?? spot.x, z: spot.seatZ ?? spot.z, face: spot.face, kind: 'sit', seatY, standX: spot.x, standZ: spot.z, dur: .45 })
      if (tired && !info.working && Math.random() < .6) {
        this.state = 'rest'
        b.setPose('doze')
      } else this.seatedLeisure()
    } else if (action === 'bed') {
      const lie = spot.lie
      this.settle({ x: lie.x, z: lie.z, face: lie.rot, kind: 'lie', lieY: lie.y, standX: spot.x, standZ: spot.z, dur: .7 })
      this.state = 'rest'
      if (tired || Math.random() < .55) b.setPose('doze')
      else {
        b.setProp(handheldFor(view))
        b.setPose('phone')
      }
    } else if (action === 'arcade') {
      b.setPose('play')
      if (Math.random() < .6) this.bubble.show('thought', 'gamepad', { duration: 1.6, scale: .42 })
    } else if (action === 'foosball') b.setPose('foos')
    else if (action === 'whiteboard') {
      b.setProp('marker')
      b.setPose('point')
      if (Math.random() < .6) this.bubble.show('thought', 'bulb', { duration: 1.6, scale: .42 })
    } else if (action === 'plant') {
      b.setProp('water')
      b.setPose('water')
    } else if (action === 'look') {
      if (Math.random() < .3) {
        b.setProp(drinkFor(view, info))
        b.setPose('drink')
      } else b.setPose('look')
    } else if (action === 'meeting') {
      const seatY = seatHeight(spot, 'meeting')
      if (seatY != null) this.settle({ x: spot.seatX ?? spot.x, z: spot.seatZ ?? spot.z, face: spot.face, kind: 'sit', seatY, standX: spot.x, standZ: spot.z, dur: .4 })
      this.lookPoint.set(spot.x + Math.sin(spot.face) * .9, 0, spot.z + Math.cos(spot.face) * .9)
      b.gaze = this.lookPoint
      b.setPose('listen')
      this.meetTimer = rand(.5, 2)
    } else if (action === 'phone') {
      b.setProp(handheldFor(view))
      b.setPose('phone')
    }
  }

  decide() {
    const w = this.world
    const info = this.info
    if (info.status !== 'ok') return this.leave()
    const working = Boolean(info.working)
    const trait = info.trait
    const r = Math.random()
    if (working) {
      if (info.energy < 18 && r < .5) return this.goToDesk('sleep')
      if (trait === 'preguica' && r < .12) return this.goToDesk('sleep')
      const breakChance = .1 + (trait === 'tagarela' ? .12 : 0) + (trait === 'cafe' ? .08 : 0) + (info.energy < 35 ? .1 : 0) - (info.pace === 'crunch' ? .06 : 0)
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
    const bed = 1 + (info.energy < 50 ? 2.5 : 0) + (trait === 'preguica' ? 3 : 0)
    const weights = [
      ['wander', 2], ['chat', trait === 'tagarela' ? 7 : 3.2], ['desk', 1.4], ['coffee', 1.4], ['sofa', trait === 'preguica' ? 5 : 1.6], ['bed', bed],
      ['arcade', trait === 'gamer' ? 5 : 1.8], ['foosball', 1.5], ['look', 1], ['whiteboard', trait === 'caotico' ? 3 : .8], ['plant', trait === 'zen' ? 3 : .6],
      ['cat', 2], ['meeting', .6], ['phone', trait === 'gamer' ? 2.4 : 1.3], ['stretch', .5],
    ]
    const always = new Set(['wander', 'chat', 'desk', 'phone', 'stretch'])
    const usable = weights.filter(([name]) => always.has(name) || (name === 'cat' ? w.cat : name === 'bed' ? w.spots.some(spot => spot.action === 'bed' && spot.lie && !spot.usedBy) : w.hasSpot(name)))
    const total = usable.reduce((sum, [, v]) => sum + v, 0)
    let roll = Math.random() * total
    for (const [name, weight] of usable) {
      roll -= weight
      if (roll > 0) continue
      if (name === 'wander') return this.wander()
      if (name === 'desk') return this.goToDesk('sit')
      if (name === 'chat') return w.startChat(this) || this.wander()
      if (name === 'cat') return this.petCat()
      if (name === 'phone' || name === 'stretch') return this.inPlace(name)
      return this.useSpot(name) || this.wander()
    }
    return this.wander()
  }

  // Coisas que se fazem parado onde está: olhar o portátil/celular ou se espreguiçar.
  inPlace(kind) {
    if (this.seat) return this.wander()
    if (kind === 'stretch') {
      this.setIdle(rand(2.4, 3.2))
      this.boneco.gesture(this.info.energy < 40 ? 'yawn' : 'stretch')
      return
    }
    this.state = 'activity'
    this.activity = 'phone'
    this.timer = rand(4, 8)
    this.beginActivity('phone')
  }

  petCat() {
    const cat = this.world.cat
    if (!cat) return this.wander()
    this.walkTo(cat.x + .42, cat.z + .1, () => {
      const b = this.boneco
      this.face(cat.x, cat.z)
      this.state = 'activity'
      this.activity = 'cat'
      this.timer = 2.8
      b.setBase('crouch')
      b.setPose('pet')
      this.bubble.show('emote', 'heart', { color: '#ff4d8d', duration: 1.8 })
      cat.purr(this)
    })
  }

  // Sentado, só gira o que a cadeira deixa; deitado, não gira. A cabeça faz o resto.
  face(x, z) {
    const a = Math.atan2(x - this.x, z - this.z)
    if (this.seat) {
      if (this.seat.kind === 'lie') return
      this.targetRot = this.seat.face + clamp(wrap(a - this.seat.face), -this.seat.swivel, this.seat.swivel)
      return
    }
    this.targetRot = a
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
    if (Math.random() < .7) {
      this.bubble.show('speech', 'smile', { duration: 1.4 })
      this.boneco.gesture('wave')
    }
  }

  react(kind) {
    if (this.state === 'gone' || this.state === 'leaving') return
    const b = this.boneco
    if (kind === 'sad') {
      if (this.state === 'rest') return
      this.path = []
      this.onArrive = null
      if (this.glide && !this.seat) this.glide.done = () => this.freeSpots()
      this.state = 'sad'
      this.timer = 3.2
      b.setProp(null)
      b.setPose('sad')
      this.bubble.show('emote', 'storm', { color: '#5c677d', duration: 2.8 })
      return
    }
    const party = kind === 'party'
    this.path = []
    this.onArrive = null
    if (this.glide && !this.seat) this.glide.done = () => this.freeSpots()
    this.state = 'celebrate'
    this.timer = party ? 4.4 : 2.2
    b.setProp(null)
    b.gaze = null
    if (party) {
      this.partyTimer = 10
      b.partyHat(true)
    }
    const cheer = () => {
      if (this.state !== 'celebrate') return
      b.setPose('cheer', party ? 1 : .7)
      if (party && !this.buddy) this.findBuddy()
    }
    this.bubble.show('emote', party ? 'star' : 'laugh', { color: '#ff9f1c', duration: 1.8 })
    // sentado comemora no lugar; numa festa todo mundo levanta para os "toca aqui"
    if (this.seat && (party || this.seat.kind === 'lie')) this.standUp(cheer)
    else cheer()
  }

  // Toca aqui: o mais próximo livre vem ao encontro; os dois batem a mão e pulam.
  findBuddy() {
    let best = null
    let bestD = 2.6
    for (const other of this.world.agents) {
      if (other === this || other.buddy || other.state !== 'celebrate' || other.seat || other.glide || !other.root.visible) continue
      const d = Math.hypot(other.x - this.x, other.z - this.z)
      if (d < bestD) {
        best = other
        bestD = d
      }
    }
    if (!best) return
    const mate = best
    this.buddy = mate
    mate.buddy = this
    mate.five = { stage: 'wait', t: 0 }
    this.five = { stage: 'go', t: 0 }
    mate.face(this.x, this.z)
    mate.boneco.gaze = this.root.position
    mate.boneco.setPose('wave', .6)
    const a = Math.atan2(this.x - mate.x, this.z - mate.z)
    const tx = mate.x + Math.sin(a) * .62
    const tz = mate.z + Math.cos(a) * .62
    this.walkTo(tx, tz, () => {
      this.state = 'celebrate'
      this.timer = Math.max(this.timer, 2)
      if (mate.buddy !== this || mate.state !== 'celebrate') return this.dropBuddy()
      this.face(mate.x, mate.z)
      mate.face(this.x, this.z)
      for (const agent of [this, mate]) {
        agent.five = { stage: 'five', t: 0 }
        agent.boneco.setPose('highfive')
        agent.timer = Math.max(agent.timer, 2.2)
      }
    })
  }

  dropBuddy() {
    if (this.buddy && this.buddy.buddy === this) {
      this.buddy.buddy = null
      this.buddy.five = null
    }
    this.buddy = null
    this.five = null
  }

  updateFive(dt) {
    const f = this.five
    const mate = this.buddy
    if (!f || !mate) return
    f.t += dt
    if (f.stage === 'wait') {
      if (f.t > 5) return this.dropBuddy()
      this.timer = Math.max(this.timer, .6)
    }
    if (f.stage === 'go' && this.state === 'celebrate' && !this.path.length && !this.glide && f.t > 4) this.dropBuddy()
    if (f.stage === 'five' && f.t > .42 && !f.clapped) {
      f.clapped = true
      if (mate.five) mate.five.clapped = true
      this.world.particles?.float(new THREE.Vector3((this.x + mate.x) / 2, 1.3, (this.z + mate.z) / 2), 'sparkle', '#ffb703', .4)
      this.world.blip(this)
    }
    if (f.stage === 'five' && f.t > .75) {
      f.stage = 'done'
      this.boneco.setPose('cheer')
    }
  }

  // Termina uma conversa com a reação do fim (risada, aceno, braços cruzados ou corações).
  afterChat(reaction) {
    const b = this.boneco
    this.partner = null
    b.gaze = null
    if (this.state !== 'chat') return
    this.setIdle(rand(1.2, 1.8))
    if (reaction === 'laugh') b.setPose('laugh')
    else if (reaction === 'angry') b.setPose('cross')
    else if (reaction === 'heart') {
      b.mood.love = 1
      b.setPose('listen', .6)
    } else b.gesture('nod')
  }

  think(pillar) {
    if (this.state !== 'work' || this.bubble.sprite.visible) return
    this.bubble.show('thought', pickOne(WORK_THOUGHTS[pillar] ?? WORK_THOUGHTS.fun), { duration: 1.6, scale: .45 })
  }

  // Gesto ocasional para ninguém parecer estátua: espreguiçar, bocejar, coçar a cabeça.
  fidget(dt) {
    this.gestureTimer -= dt
    if (this.gestureTimer > 0) return
    const b = this.boneco
    const tired = this.info.energy < 40
    this.gestureTimer = rand(8, 16)
    if (this.state === 'work') {
      const roll = Math.random()
      if (tired && roll < .5) b.gesture('yawn')
      else if (roll < .35) b.gesture('stretch')
      else if (roll < .65) b.gesture('scratch')
    } else if (this.state === 'idle' && !this.seat && this.timer > 1.2) {
      b.gesture(tired ? 'yawn' : pickOne(['stretch', 'scratch', 'shrug']))
    } else if (this.state === 'activity' && this.activity === 'arcade' && Math.random() < .5) {
      b.gesture('clap')
      this.bubble.show('emote', 'star', { color: '#ffb703', duration: 1.4, scale: .4 })
    }
  }

  update(dt) {
    const w = this.world
    const b = this.boneco
    const info = this.info
    this.appear = Math.min(1, this.appear + dt * 4)
    this.root.scale.setScalar(.2 + .8 * this.appear)
    const hasIdea = w.ideaSet.has(this.id) && this.state !== 'gone'
    if (hasIdea && !this.alert.sprite.visible) this.alert.show('alert', 'exclaim', { sticky: true, scale: .5 })
    if (!hasIdea && this.alert.sprite.visible) this.alert.hide()
    const low = -.55 * b.lying
    this.bubble.offset = low
    this.alert.offset = low
    this.bubble.update(dt)
    this.alert.update(dt)

    if (this.state === 'gone') {
      if (info.status === 'ok') this.enter()
      return
    }
    if (info.status !== 'ok' && this.state !== 'leaving') this.leave()

    let speed = 0
    if (this.glide) {
      const g = this.glide
      g.t += dt
      const k = ease(g.t / g.dur)
      this.root.position.x = g.x0 + (g.x1 - g.x0) * k
      this.root.position.z = g.z0 + (g.z1 - g.z0) * k
      if (g.t >= g.dur) {
        this.glide = null
        g.done?.()
      }
    } else if (this.state === 'walk' || this.state === 'leaving') {
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
        const pace = info.pace === 'crunch' && info.working ? 1.75 : WALK_SPEED
        const v = pace * dt
        if (dist <= v) {
          this.root.position.x = target[0]
          this.root.position.z = target[1]
          this.path.shift()
        } else {
          this.root.position.x += dx / dist * v
          this.root.position.z += dz / dist * v
          this.targetRot = Math.atan2(dx, dz)
        }
        speed = pace / WALK_SPEED
      }
    } else {
      this.timer -= dt
    }
    this.lift += (this.liftGoal - this.lift) * (1 - Math.exp(-dt * 10))
    this.root.position.y = this.lift
    b.lift = this.lift

    // humor no rosto: cansaço, crunch, carinho
    b.mood.tired = clamp((38 - info.energy) / 26, 0, 1)
    b.mood.stress = this.state === 'work' && info.working && info.pace === 'crunch' ? .9 : 0
    b.mood.love = Math.max(0, b.mood.love - dt * .25)
    b.talking += ((this.bubble.speaking ? 1 : 0) - b.talking) * Math.min(1, dt * 12)
    if (this.partyTimer > 0) {
      this.partyTimer -= dt
      if (this.partyTimer <= 0) b.partyHat(false)
    }

    if (this.glide) {
      // nada: termina de sentar/levantar antes de decidir
    } else if (this.state === 'idle') {
      if (this.timer <= 0) this.decide()
      else this.fidget(dt)
    } else if (this.state === 'work') {
      this.fidget(dt)
      this.thoughtTimer -= dt
      if (this.thoughtTimer <= 0) {
        this.thoughtTimer = rand(5, 11)
        if (Math.random() < .35) w.deskChat(this)
      }
      if (this.timer <= 0) {
        if (!info.working) this.setIdle(.2)
        else this.decide()
      }
    } else if (this.state === 'sit' || this.state === 'sleep') {
      if (this.timer <= 0 || (info.working && this.state === 'sit')) this.decide()
    } else if (this.state === 'rest') {
      // cochilo no sofá ou na cama: a equipe voltou a trabalhar, acorda na hora
      if (info.working) {
        this.bubble.show('emote', 'exclaim', { color: '#ff5d3a', duration: 1.1, scale: .4 })
        this.goToDesk('work')
      } else if (this.timer <= 0) {
        b.gesture('stretch')
        this.setIdle(rand(.3, .8))
      }
    } else if (this.state === 'waitChat') {
      b.gaze = this.partner?.root.position ?? null
      if (this.timer <= 0) this.setIdle()
    } else if (this.state === 'activity') {
      if (this.activity === 'meeting') this.updateMeeting(dt)
      else this.fidget(dt)
      if (this.timer <= 0) this.setIdle(rand(.2, 1))
    } else if (this.state === 'celebrate' || this.state === 'sad') {
      this.updateFive(dt)
      if (this.timer <= 0) {
        this.dropBuddy()
        this.setIdle(rand(.2, 1))
      }
    }

    this.rot = angleLerp(this.rot, this.targetRot, 1 - Math.exp(-dt * 12))
    this.root.rotation.y = this.rot
    b.update(dt, speed)
  }

  updateMeeting(dt) {
    this.meetTimer -= dt
    if (this.meetTimer > 0) return
    const b = this.boneco
    this.meetTimer = rand(1.2, 2.8)
    if (b.goal.talk < .5 && Math.random() < .45) {
      b.setPose('talk')
      this.bubble.show('speech', pickOne(this.world.topics()), { duration: 1.2, scale: .42 })
      this.world.blip(this)
    } else {
      b.setPose('listen')
      if (Math.random() < .25) b.gesture('nod')
    }
  }
}

// Conversa à la Sims: falas alternadas com pictogramas, olhares e uma reação no fim.
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
    for (const [self, other] of [[a, b], [b, a]]) {
      self.boneco.setProp(null)
      self.boneco.gaze = other.root.position
    }
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
    listener.boneco.setPose('listen')
    if (Math.random() < .25) listener.boneco.gesture('nod')
    const icon = this.couple && Math.random() < .5 ? 'heart' : pickOne(this.world.topics())
    speaker.bubble.show('speech', icon, { duration: 1.25, scale: .5 })
    if (this.couple) speaker.boneco.mood.love = Math.max(speaker.boneco.mood.love, .6)
    this.world.blip(speaker)
    this.turn += 1
    this.timer = 1.25
  }

  end(natural) {
    this.done = true
    const { a, b } = this
    let reaction = null
    if (natural) {
      const roll = Math.random()
      reaction = this.couple ? 'heart' : roll < .62 ? 'laugh' : roll < .9 ? 'smile' : 'angry'
      for (const agent of [a, b]) {
        if (agent.state !== 'chat') continue
        agent.bubble.show('emote', reaction, { color: reaction === 'heart' ? '#ff4d8d' : reaction === 'angry' ? '#e63946' : '#ff9f1c', duration: 1.6 })
      }
    }
    for (const agent of [a, b]) {
      if (agent.state === 'chat') agent.afterChat(reaction)
      else {
        agent.partner = null
        agent.boneco.gaze = null
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
    this.bubble = new Bubble(this.root, .72)
    this.state = 'idle'
    this.timer = 1
    this.path = []
    this.rot = 0
    this.lift = 0
  }

  get x() { return this.root.position.x }
  get z() { return this.root.position.z }

  purr(by = null) {
    this.bubble.show('emote', 'heart', { color: '#ff4d8d', duration: 1.5, scale: .35 })
    this.gato.purr = 2.2
    if (by && this.state !== 'walk') this.rot = Math.atan2(by.x - this.x, by.z - this.z)
  }

  update(dt) {
    this.bubble.update(dt)
    const w = this.world
    const g = this.gato
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
          this.rot = angleLerp(this.rot, Math.atan2(dx, dz), 1 - Math.exp(-dt * 8))
          speed = 1
        }
      }
    } else {
      this.timer -= dt
      if (this.timer <= 0 && g.purr <= 0) {
        const bed = w.spots.find(spot => spot.action === 'catbed')
        const r = Math.random()
        if (bed && r < .3) {
          this.path = w.nav.findPath(this.x, this.z, bed.x, bed.z)
          this.sleepAfter = true
          this.bedY = typeof bed.seatY === 'number' ? bed.seatY : .035
        } else if (r < .55 && w.agents.length) {
          const friend = pickOne(w.agents.filter(agent => agent.root.visible))
          if (friend) this.path = w.nav.findPath(this.x, this.z, friend.x + .4, friend.z + .3)
        } else {
          const [x, z] = w.nav.randomWalkable()
          this.path = w.nav.findPath(this.x, this.z, x, z)
        }
        this.state = 'walk'
        if (Math.random() < .25) this.bubble.show('emote', pickOne(['heart', 'question', 'paw']), { color: '#ff9f1c', duration: 1.4, scale: .32 })
      }
    }
    const sleeping = this.state === 'sleep' ? 1 : 0
    g.sleeping += (sleeping - g.sleeping) * Math.min(1, dt * 3)
    g.sitting += ((this.state === 'idle' ? 1 : 0) - g.sitting) * Math.min(1, dt * 4)
    const liftGoal = sleeping ? this.bedY ?? 0 : 0
    this.lift += (liftGoal - this.lift) * Math.min(1, dt * 6)
    this.root.position.y = this.lift
    g.lift = this.lift
    this.root.rotation.y = this.rot
    g.update(dt, speed)
  }
}

// Mochila do Camelô: geometria única, criada na primeira visita.
let BAG = null
const bagParts = () => {
  if (!BAG) {
    BAG = {
      bag: new THREE.BoxGeometry(.36, .42, .2),
      stripe: new THREE.BoxGeometry(.37, .07, .21),
      bagMat: new THREE.MeshStandardMaterial({ color: '#3a86ff', roughness: .8 }),
      stripeMat: new THREE.MeshStandardMaterial({ color: '#ff006e', roughness: .7 }),
    }
  }
  return BAG
}

export class VisitorAgent {
  constructor(world) {
    this.world = world
    this.boneco = new Boneco({ skin: '#d9a066', hair: '#1f1a17', hairStyle: 'curto', shirt: '#ffbe0b', pants: '#2b3a55', extra: 'bone', height: 1.05, top: 'camiseta', bottom: 'bermuda', print: false, capBack: true })
    this.root = this.boneco.root
    this.boneco.hit.userData.agentId = 'visitor'
    const parts = bagParts()
    const bag = new THREE.Mesh(parts.bag, parts.bagMat)
    bag.position.set(0, .16, -.21)
    bag.castShadow = true
    this.boneco.spine.add(bag)
    const stripe = new THREE.Mesh(parts.stripe, parts.stripeMat)
    stripe.position.set(0, .22, -.21)
    this.boneco.spine.add(stripe)
    this.bubble = new Bubble(this.root, 1.6)
    this.state = 'enter'
    this.path = []
    this.rot = 0
    const door = world.door
    this.root.position.set(door.x, 0, door.z)
    const [x, z] = world.visitorSpot
    this.path = world.nav.findPath(door.x, door.z, x, z)
  }

  get x() { return this.root.position.x }
  get z() { return this.root.position.z }

  leave() {
    if (this.state === 'leave') return
    this.state = 'leave'
    this.bubble.hide()
    this.boneco.setPose(null)
    this.boneco.gesture('wave')
    this.path = this.world.nav.findPath(this.x, this.z, this.world.door.x, this.world.door.z)
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
      if (Math.random() < dt * .08) this.boneco.gesture('shrug')
    } else if (this.state === 'leave') {
      this.root.visible = false
      this.gone = true
    }
    this.root.rotation.y = this.rot
    this.boneco.update(dt, speed)
  }
}
