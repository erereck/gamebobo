import * as THREE from 'three'

// Geometrias compartilhadas: dezenas de bonecos, um punhado de buffers.
const G = {
  head: new THREE.SphereGeometry(.22, 24, 18),
  torso: new THREE.CapsuleGeometry(.15, .12, 6, 14),
  arm: new THREE.CapsuleGeometry(.048, .17, 4, 8),
  hand: new THREE.SphereGeometry(.052, 10, 8),
  leg: new THREE.CapsuleGeometry(.062, .14, 4, 8),
  shoe: new THREE.SphereGeometry(.068, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2),
  eye: new THREE.SphereGeometry(.028, 8, 6),
  cheek: new THREE.CircleGeometry(.035, 12),
  cap: new THREE.SphereGeometry(.235, 22, 14, 0, Math.PI * 2, 0, Math.PI * .52),
  bun: new THREE.SphereGeometry(.1, 12, 10),
  afro: new THREE.SphereGeometry(.29, 18, 14),
  curl: new THREE.SphereGeometry(.085, 10, 8),
  tail: new THREE.CapsuleGeometry(.06, .16, 4, 8),
  longBack: new THREE.BoxGeometry(.4, .34, .14),
  fringe: new THREE.BoxGeometry(.3, .07, .08),
  mohawk: new THREE.BoxGeometry(.06, .12, .36),
  brim: new THREE.CylinderGeometry(.2, .2, .025, 18, 1, false, -Math.PI / 2, Math.PI),
  lens: new THREE.TorusGeometry(.05, .012, 6, 16),
  band: new THREE.TorusGeometry(.24, .022, 6, 20, Math.PI),
  cup: new THREE.CylinderGeometry(.06, .06, .05, 12),
  shadow: new THREE.CircleGeometry(.24, 20),
  hit: new THREE.CylinderGeometry(.3, .3, 1.2, 8),
}

const materialCache = new Map()
export function mat(color, opts = {}) {
  const key = `${color}|${opts.emissive ?? ''}|${opts.rough ?? .75}|${opts.transparent ?? ''}`
  if (!materialCache.has(key)) {
    materialCache.set(key, new THREE.MeshStandardMaterial({
      color,
      roughness: opts.rough ?? .75,
      metalness: opts.metal ?? 0,
      emissive: opts.emissive ?? '#000000',
      emissiveIntensity: opts.emissiveIntensity ?? 1,
      transparent: Boolean(opts.transparent),
      opacity: opts.opacity ?? 1,
    }))
  }
  return materialCache.get(key)
}

const EYE = new THREE.MeshBasicMaterial({ color: '#1d1a24' })
const CHEEK = new THREE.MeshBasicMaterial({ color: '#ff8f8f', transparent: true, opacity: .45 })
const SHADOW = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: .16, depthWrite: false })
const HIT = new THREE.MeshBasicMaterial({ visible: false })

const mesh = (geometry, material, cast = true) => {
  const m = new THREE.Mesh(geometry, material)
  m.castShadow = cast
  return m
}

function buildHair(look, head) {
  const hair = mat(look.hair, { rough: .9 })
  const style = look.hairStyle
  if (style === 'careca') return
  if (style === 'black') {
    const afro = mesh(G.afro, hair)
    afro.position.set(0, .07, -.03)
    head.add(afro)
    return
  }
  const cap = mesh(G.cap, hair)
  cap.position.set(0, .01, -.012)
  cap.rotation.x = -.22
  head.add(cap)
  if (style === 'coque') {
    const bun = mesh(G.bun, hair)
    bun.position.set(0, .2, -.12)
    head.add(bun)
  } else if (style === 'longo') {
    const back = mesh(G.longBack, hair)
    back.position.set(0, -.1, -.13)
    head.add(back)
  } else if (style === 'moicano') {
    cap.visible = false
    const mohawk = mesh(G.mohawk, hair)
    mohawk.position.set(0, .22, -.02)
    head.add(mohawk)
  } else if (style === 'franja') {
    const fringe = mesh(G.fringe, hair)
    fringe.position.set(0, .14, .17)
    fringe.rotation.x = .5
    head.add(fringe)
  } else if (style === 'cacheado') {
    for (let i = 0; i < 9; i += 1) {
      const a = (i / 9) * Math.PI * 2
      const curl = mesh(G.curl, hair)
      curl.position.set(Math.cos(a) * .17, .12 + Math.sin(i * 1.7) * .03, Math.sin(a) * .15 - .03)
      head.add(curl)
    }
  } else if (style === 'rabo') {
    const tail = mesh(G.tail, hair)
    tail.position.set(0, .02, -.24)
    tail.rotation.x = .5
    head.add(tail)
  }
}

function buildExtra(look, head) {
  if (look.extra === 'oculos') {
    const frame = mat('#22252c', { rough: .4 })
    for (const x of [-.085, .085]) {
      const lens = mesh(G.lens, frame, false)
      lens.position.set(x, .02, .205)
      head.add(lens)
    }
  } else if (look.extra === 'fone') {
    const band = mesh(G.band, mat('#2b2f3a', { rough: .5 }), false)
    band.position.set(0, .03, 0)
    head.add(band)
    for (const x of [-.235, .235]) {
      const cup = mesh(G.cup, mat('#ff5d3a', { rough: .5 }), false)
      cup.rotation.z = Math.PI / 2
      cup.position.set(x, .02, 0)
      head.add(cup)
    }
  } else if (look.extra === 'bone') {
    const color = mat(look.shirt, { rough: .8 })
    const top = mesh(G.cap, color)
    top.scale.setScalar(1.04)
    top.position.set(0, .02, 0)
    head.add(top)
    const brim = mesh(G.brim, color)
    brim.position.set(0, .09, .19)
    brim.rotation.x = .12
    head.add(brim)
  }
}

export class Boneco {
  constructor(look, { founder = false } = {}) {
    this.look = look
    this.root = new THREE.Group()
    this.body = new THREE.Group()
    this.root.add(this.body)
    const scale = look.height ?? 1
    this.body.scale.setScalar(scale)

    const shirt = mat(look.shirt)
    const skin = mat(look.skin, { rough: .65 })
    const pants = mat(look.pants)
    const shoes = mat('#2a2a30', { rough: .5 })

    this.hip = new THREE.Group()
    this.hip.position.y = .3
    this.body.add(this.hip)

    this.torso = mesh(G.torso, shirt)
    this.torso.position.y = .2
    this.hip.add(this.torso)
    if (founder) {
      const badge = mesh(G.cheek, mat('#ffd43b', { emissive: '#ffb703', emissiveIntensity: .25 }), false)
      badge.position.set(.07, .27, .148)
      this.hip.add(badge)
    }

    this.head = new THREE.Group()
    this.head.position.y = .6
    this.hip.add(this.head)
    this.head.add(mesh(G.head, skin))
    this.eyes = []
    for (const x of [-.08, .08]) {
      const eye = new THREE.Mesh(G.eye, EYE)
      eye.position.set(x, .02, .2)
      eye.scale.set(1, 1.25, .6)
      this.head.add(eye)
      this.eyes.push(eye)
      const cheek = new THREE.Mesh(G.cheek, CHEEK)
      cheek.position.set(x * 1.55, -.06, .19)
      cheek.rotation.y = x > 0 ? .5 : -.5
      this.head.add(cheek)
    }
    buildHair(look, this.head)
    buildExtra(look, this.head)

    this.arms = [-1, 1].map(side => {
      const pivot = new THREE.Group()
      pivot.position.set(side * .19, .33, 0)
      const arm = mesh(G.arm, shirt)
      arm.position.y = -.12
      pivot.add(arm)
      const hand = mesh(G.hand, skin)
      hand.position.y = -.25
      pivot.add(hand)
      pivot.rotation.z = side * .12
      this.hip.add(pivot)
      return pivot
    })

    this.legs = [-1, 1].map(side => {
      const pivot = new THREE.Group()
      pivot.position.set(side * .075, .0, 0)
      const leg = mesh(G.leg, pants)
      leg.position.y = -.13
      pivot.add(leg)
      const shoe = mesh(G.shoe, shoes)
      shoe.position.set(0, -.27, .03)
      shoe.scale.set(1, .8, 1.35)
      pivot.add(shoe)
      this.hip.add(pivot)
      return pivot
    })

    const shadow = new THREE.Mesh(G.shadow, SHADOW)
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = .005
    this.root.add(shadow)
    this.shadow = shadow

    this.hit = new THREE.Mesh(G.hit, HIT)
    this.hit.position.y = .6
    this.root.add(this.hit)

    this.t = Math.random() * 10
    this.blink = 2 + Math.random() * 3
    this.pose = { walk: 0, sit: 0, type: 0, talk: 0, cheer: 0, sad: 0, sleep: 0, drink: 0, play: 0, wave: 0 }
    this.target = { ...this.pose }
    this.walkPhase = 0
  }

  setPose(name, value = 1) {
    for (const key of Object.keys(this.target)) this.target[key] = 0
    if (name) this.target[name] = value
  }

  // Mistura suave entre poses; tudo procedural para manter o estilo minimalista.
  update(dt, speed = 0) {
    this.t += dt
    const k = 1 - Math.exp(-dt * 10)
    for (const key of Object.keys(this.pose)) this.pose[key] += (this.target[key] - this.pose[key]) * k
    const p = this.pose
    this.walkPhase += dt * (speed > 0.01 ? 11 : 0)
    const swing = Math.sin(this.walkPhase) * p.walk

    // pernas
    const sitLeg = -Math.PI / 2 * Math.max(p.sit, p.sleep)
    this.legs[0].rotation.x = swing * .7 + sitLeg
    this.legs[1].rotation.x = -swing * .7 + sitLeg

    // corpo
    const bob = Math.abs(Math.sin(this.walkPhase)) * .035 * p.walk
    const jump = Math.max(0, Math.sin(this.t * 9)) * .2 * p.cheer
    this.hip.position.y = .3 + bob + jump - .02 * p.sit
    this.hip.rotation.x = .38 * p.sleep + .06 * p.type - .05 * p.cheer + .12 * p.sad
    this.hip.rotation.z = Math.sin(this.walkPhase) * .03 * p.walk

    // braços
    const typeWiggle = Math.sin(this.t * 22) * .12 * p.type
    const [left, right] = this.arms
    left.rotation.x = -swing * .8 - 1.15 * p.type - .9 * p.play + typeWiggle - 2.6 * p.cheer - .6 * p.sleep
    right.rotation.x = swing * .8 - 1.15 * p.type - .9 * p.play - typeWiggle - 2.6 * p.cheer - 1.3 * p.drink - .6 * p.sleep - 2.4 * p.wave
    left.rotation.z = -.12 - .35 * p.cheer + Math.sin(this.t * 3) * .15 * p.talk
    right.rotation.z = .12 + .35 * p.cheer - Math.sin(this.t * 3.4) * .25 * p.talk + Math.sin(this.t * 12) * .3 * p.wave
    if (p.play > .05) {
      const mash = Math.sin(this.t * 18) * .08 * p.play
      left.rotation.x += mash
      right.rotation.x -= mash
    }

    // cabeça
    this.head.rotation.x = .25 * p.type + .5 * p.sad - .2 * p.cheer + .35 * p.sleep + Math.sin(this.t * 6) * .06 * p.talk - .2 * p.drink
    this.head.rotation.y = Math.sin(this.t * .7) * .25 * (1 - p.type - p.sleep) * (1 - p.walk)
    this.head.position.y = .6 + Math.sin(this.t * 2) * .006

    // piscar
    this.blink -= dt
    let eyeY = 1.25
    if (this.blink < 0) {
      eyeY = .15
      if (this.blink < -.12) this.blink = 2 + Math.random() * 4
    }
    if (p.sleep > .5) eyeY = .12
    if (p.cheer > .5 || p.sad > .5) eyeY = .5
    for (const eye of this.eyes) eye.scale.y = eyeY
    this.shadow.scale.setScalar(1 - jump * 1.2)
  }

  dispose() {
    this.root.removeFromParent()
  }
}

// Gato do escritório: caixa, cabeça, orelhas e um rabo que não para quieto.
export class Gato {
  constructor(color = '#f0a24a') {
    this.root = new THREE.Group()
    const fur = mat(color, { rough: .9 })
    const body = mesh(new THREE.CapsuleGeometry(.1, .2, 4, 10), fur)
    body.rotation.z = Math.PI / 2
    body.position.y = .16
    this.root.add(body)
    this.body = body
    this.head = new THREE.Group()
    this.head.position.set(.2, .25, 0)
    this.root.add(this.head)
    this.head.add(mesh(new THREE.SphereGeometry(.1, 14, 10), fur))
    for (const z of [-.05, .05]) {
      const ear = mesh(new THREE.ConeGeometry(.035, .07, 4), fur)
      ear.position.set(0, .09, z)
      this.head.add(ear)
      const eye = new THREE.Mesh(G.eye, EYE)
      eye.scale.setScalar(.6)
      eye.position.set(.09, .015, z * .8)
      this.head.add(eye)
    }
    this.tail = new THREE.Group()
    this.tail.position.set(-.2, .2, 0)
    const tailMesh = mesh(new THREE.CapsuleGeometry(.025, .2, 4, 6), fur)
    tailMesh.position.y = .1
    this.tail.add(tailMesh)
    this.tail.rotation.z = .5
    this.root.add(this.tail)
    this.legs = []
    for (const [x, z] of [[.12, .06], [.12, -.06], [-.12, .06], [-.12, -.06]]) {
      const leg = mesh(new THREE.CylinderGeometry(.022, .022, .1, 6), fur)
      leg.position.set(x, .05, z)
      this.root.add(leg)
      this.legs.push(leg)
    }
    const shadow = new THREE.Mesh(G.shadow, SHADOW)
    shadow.rotation.x = -Math.PI / 2
    shadow.scale.set(1.3, .7, 1)
    shadow.position.y = .005
    this.root.add(shadow)
    this.hit = new THREE.Mesh(new THREE.BoxGeometry(.5, .4, .3), HIT)
    this.hit.position.y = .2
    this.root.add(this.hit)
    this.t = Math.random() * 5
    this.sleeping = 0
  }

  update(dt, speed) {
    this.t += dt
    this.tail.rotation.x = Math.sin(this.t * 2.2) * .5
    this.tail.rotation.z = .6 + Math.sin(this.t * 1.3) * .2
    const step = speed > .01 ? Math.sin(this.t * 16) * .35 : 0
    this.legs.forEach((leg, i) => { leg.rotation.z = (i % 2 ? step : -step) })
    const s = this.sleeping
    this.body.scale.y = 1 + Math.sin(this.t * 2) * .03 * s
    this.head.position.y = .25 - .1 * s
    this.legs.forEach(leg => { leg.visible = s < .5 })
    this.body.position.y = .16 - .06 * s
  }
}
