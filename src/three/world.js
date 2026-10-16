import * as THREE from 'three'
import { NavGrid } from './nav.js'
import { LAYOUTS, FLOOR_STYLES } from './layouts.js'
import * as F from './furniture.js'
import { clearPosterCache, windowScenery, windowNight } from './textures.js'
import { liveScreen, touchScreen, tickScreens, pruneScreens, styleOf } from './screens.js'
import { tickSetups } from './setups.js'
import { bake } from './bake.js'
import { live, hashText } from './kit.js'
import { Particles } from './particles.js'
import { CatAgent, Conversation, StaffAgent, VisitorAgent } from './agents.js'
import { mat } from './character.js'

const rotate = (x, z, rot) => [x * Math.cos(rot) + z * Math.sin(rot), -x * Math.sin(rot) + z * Math.cos(rot)]
const snapRot = rot => Math.round(rot / (Math.PI / 2)) * (Math.PI / 2)

// O que obriga a remontar (e recozinhar) o escritório: planta, época, decoração e o nome no neon.
// Os pôsteres ficam de fora: têm camada própria (syncPosters) e trocam a cada lançamento.
export const officeKey = view => `${view.office}|${view.era.id}|${view.decor.join(',')}|${view.decor.includes('neon') ? view.studioName : ''}`

// Quem estava sentado à mesa volta direto para a cadeira se a mesa continua no mesmo lugar.
const DESK_STATES = new Set(['work', 'sit', 'sleep'])
const samePlace = (a, b) => Math.abs(a.x - b.x) < .01 && Math.abs(a.z - b.z) < .01

// Programa na tela de quem trabalha, pelo pilar mais forte; a segunda tela mostra outra coisa.
const ROLE_KIND = { fun: 'code', art: 'art', sound: 'sound', idea: 'idea' }
const SIDE_KIND = { code: 'game', art: 'idea', sound: 'art', idea: 'code', game: 'idle', idle: 'idle' }

// ---------- clima ----------
// Um dia passa devagar em tempo real (manhã, meio-dia, tarde, fim de tarde); a estação
// e a chuva vêm do mês do jogo (hemisfério sul). O crunch continua sendo a noite.
const DEG = Math.PI / 180
const DAY_SECONDS = 300
const DAY = [
  [0, '#8ec5f0', '#ffe0c2', '#ffe9cf', 1.35, 18, 34],
  [.3, '#58aef0', '#cdeeff', '#fff6e6', 1.6, 38, 58],
  [.6, '#5f9fe0', '#ffe7b8', '#ffe7c4', 1.5, 58, 44],
  [.82, '#8a7fd0', '#ffb984', '#ffc890', 1.25, 72, 28],
  [1, '#8ec5f0', '#ffe0c2', '#ffe9cf', 1.35, 18, 34],
].map(([t, top, low, sun, i, az, el]) => ({ t, top: new THREE.Color(top), low: new THREE.Color(low), sun: new THREE.Color(sun), i, az: az * DEG, el: el * DEG }))
const SEASON_OF = month => (month === 11 || month <= 1 ? 'summer' : month <= 4 ? 'autumn' : month <= 7 ? 'winter' : 'spring')
const SEASON_LIGHT = {
  summer: { i: 1.08, sun: new THREE.Color('#fff2da'), hemi: new THREE.Color('#fff4e2'), el: 6 * DEG, pale: 0, rain: .4 },
  autumn: { i: 1, sun: new THREE.Color('#ffe3c0'), hemi: new THREE.Color('#fff1e4'), el: 0, pale: .05, rain: .22 },
  winter: { i: .86, sun: new THREE.Color('#e2eaff'), hemi: new THREE.Color('#eaf1ff'), el: -9 * DEG, pale: .22, rain: .08 },
  spring: { i: 1.02, sun: new THREE.Color('#fff8ec'), hemi: new THREE.Color('#f6fff0'), el: 3 * DEG, pale: 0, rain: .25 },
}
const C = {
  white: new THREE.Color('#ffffff'),
  pale: new THREE.Color('#dfe9f5'),
  rainTop: new THREE.Color('#7f8b9a'),
  rainLow: new THREE.Color('#b8c2cc'),
  rainSun: new THREE.Color('#c9d3e0'),
  rainHemi: new THREE.Color('#dde6f0'),
  nightTop: new THREE.Color('#0a0f2c'),
  nightLow: new THREE.Color('#283063'),
  nightView: new THREE.Color('#252a48'),
  nightHemi: new THREE.Color(.55, .56, .8),
  hemiBase: new THREE.Color('#fff6e8'),
  groundBase: new THREE.Color('#7a6a8c'),
}

function floorTexture(style, w, d) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  const { color, line } = FLOOR_STYLES[style] ?? FLOOR_STYLES.wood
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 512, 512)
  ctx.strokeStyle = line
  ctx.lineWidth = 3
  if (style === 'wood' || style === 'wood2') {
    for (let y = 0; y < 512; y += 42) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke()
      const offset = (y / 42) % 2 ? 0 : 128
      for (let x = offset; x < 512; x += 256) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 42); ctx.stroke() }
    }
  } else if (style === 'tile') {
    for (let i = 0; i <= 512; i += 64) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke()
    }
  } else {
    for (let i = 0; i < 2600; i += 1) {
      ctx.fillStyle = Math.random() < .5 ? line : 'rgba(255,255,255,.06)'
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2)
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(w / 4, d / 4)
  texture.anisotropy = 4
  return texture
}

export class OfficeWorld {
  constructor(container, callbacks = {}) {
    this.container = container
    this.callbacks = callbacks
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.6 : 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(this.renderer.domElement)

    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-5, 5, 5, -5, .1, 200)
    this.azimuth = Math.PI / 4
    this.elevation = .58
    this.zoom = 1
    this.targetZoom = 1
    this.targetAzimuth = this.azimuth
    this.focus = new THREE.Vector3(0, .6, 0)

    this.hemi = new THREE.HemisphereLight('#fff6e8', '#7a6a8c', 1.25)
    this.scene.add(this.hemi)
    this.sun = new THREE.DirectionalLight('#fff1d6', 1.55)
    this.sun.castShadow = true
    this.sun.shadow.mapSize.set(1536, 1536)
    this.sun.shadow.bias = -.0005
    this.sun.shadow.normalBias = .02
    this.scene.add(this.sun)
    this.scene.add(this.sun.target)
    this.night = 0
    this.rain = 0
    this.rainTarget = 0
    this.season = 'summer'
    this.vista = 'houses'
    this.sunDist = 10
    this.lit = { sky: new THREE.Color(), low: new THREE.Color(), sun: new THREE.Color(), view: new THREE.Color(), hemi: new THREE.Color() }
    this.seasonSun = SEASON_LIGHT.summer.sun.clone()
    this.seasonHemi = SEASON_LIGHT.summer.hemi.clone()
    this.seasonI = 1
    this.seasonEl = 0
    this.seasonPale = 0
    this.eraHemi = C.hemiBase.clone()
    this.eraGround = C.groundBase.clone()
    this.owned = []

    this.static = new THREE.Group()
    this.scene.add(this.static)
    this.posterLayer = new THREE.Group()
    this.scene.add(this.posterLayer)
    this.posterSlots = []
    this.posterKey = null
    this.posterMats = []
    this.agentLayer = new THREE.Group()
    this.scene.add(this.agentLayer)
    this.particles = new Particles(this.scene)

    this.agents = []
    this.conversations = []
    this.desks = []
    this.spots = []
    this.ideaSet = new Set()
    this.coupleSet = new Set()
    this.cat = null
    this.visitor = null
    this.view = { working: false, pace: 'normal', staff: [] }
    this.staticKey = ''
    this.lastBlip = 0
    this.clock = new THREE.Clock()
    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()

    this.bindInput()
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(container)
    this.resize()
    this.running = true
    this.loop = this.loop.bind(this)
    requestAnimationFrame(this.loop)
  }

  bindInput() {
    const el = this.renderer.domElement
    el.style.touchAction = 'none'
    let down = null
    const pointers = new Map()
    let pinch = null
    el.addEventListener('pointerdown', event => {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
      if (pointers.size === 1) down = { x: event.clientX, y: event.clientY, az: this.targetAzimuth, moved: false }
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: this.targetZoom }
      }
      el.setPointerCapture(event.pointerId)
    })
    el.addEventListener('pointermove', event => {
      if (pointers.has(event.pointerId)) pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
      if (pinch && pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        this.targetZoom = THREE.MathUtils.clamp(pinch.zoom * dist / pinch.dist, .75, 2.8)
        if (down) down.moved = true
        return
      }
      if (down) {
        const dx = event.clientX - down.x
        if (Math.abs(dx) > 5 || Math.abs(event.clientY - down.y) > 5) down.moved = true
        this.targetAzimuth = THREE.MathUtils.clamp(down.az - dx * .006, .2, 1.37)
      } else this.hover(event)
    })
    const up = event => {
      pointers.delete(event.pointerId)
      if (pointers.size < 2) pinch = null
      if (down && !down.moved && pointers.size === 0) this.pick(event)
      if (pointers.size === 0) down = null
    }
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('wheel', event => {
      event.preventDefault()
      this.targetZoom = THREE.MathUtils.clamp(this.targetZoom * (event.deltaY > 0 ? .9 : 1.1), .75, 2.8)
    }, { passive: false })
  }

  raycastAgent(event) {
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const targets = []
    for (const agent of this.agents) if (agent.root.visible) targets.push(agent.boneco.hit)
    if (this.cat) targets.push(this.cat.gato.hit)
    if (this.visitor && !this.visitor.gone) targets.push(this.visitor.boneco.hit)
    const hit = this.raycaster.intersectObjects(targets, false)[0]
    return hit?.object.userData.agentId ?? null
  }

  hover(event) {
    const id = this.raycastAgent(event)
    this.renderer.domElement.style.cursor = id ? 'pointer' : 'grab'
  }

  pick(event) {
    const id = this.raycastAgent(event)
    if (!id) return this.callbacks.onPick?.(null)
    const agent = this.agents.find(item => item.id === id)
    const screen = agent ? this.toScreen(agent.root.position, 1.3) : null
    if (id === 'cat') this.cat?.purr()
    this.callbacks.onPick?.(id, screen)
  }

  toScreen(position, lift = 0) {
    const v = position.clone()
    v.y += lift
    v.project(this.camera)
    const rect = this.renderer.domElement.getBoundingClientRect()
    return { x: (v.x + 1) / 2 * rect.width, y: (1 - v.y) / 2 * rect.height }
  }

  resize() {
    const { clientWidth: w, clientHeight: h } = this.container
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.renderer.domElement.style.width = `${w}px`
    this.renderer.domElement.style.height = `${h}px`
    this.aspect = w / h
    this.updateCamera()
  }

  updateCamera() {
    const layout = this.layout ?? LAYOUTS[0]
    const span = Math.max(layout.w, layout.d) * .62 + 1.2
    const half = span / this.zoom
    const aspect = this.aspect ?? 1.6
    const portrait = aspect < 1
    const halfH = portrait ? half / aspect * .74 : half * .66
    this.camera.left = -halfH * aspect
    this.camera.right = halfH * aspect
    this.camera.top = halfH
    this.camera.bottom = -halfH
    const dist = 60
    const cx = Math.sin(this.azimuth) * Math.cos(this.elevation) * dist
    const cz = Math.cos(this.azimuth) * Math.cos(this.elevation) * dist
    const offsetY = portrait ? -.2 : .25
    this.camera.position.set(this.focus.x + cx, this.focus.y + Math.sin(this.elevation) * dist + offsetY, this.focus.z + cz)
    this.camera.lookAt(this.focus.x, this.focus.y + offsetY, this.focus.z)
    this.camera.updateProjectionMatrix()
  }

  // ---------- montagem do escritório ----------
  build(view) {
    this.static.clear()
    // libera o que só este escritório usava (geometrias e materiais do kit ficam em cache)
    for (const item of this.owned) item.dispose()
    this.owned = []
    const layout = LAYOUTS[view.office] ?? LAYOUTS[0]
    this.layout = layout
    const { w, d, wallH } = layout
    const nav = new NavGrid(w, d)
    this.nav = nav
    this.desks = []
    this.spots = []
    this.extras = { fish: [], lights: [], shades: [], trophies: null, arcade: [] }

    const era = view.era
    pruneScreens(styleOf(era))
    this.eraHemi.copy(C.hemiBase).lerp(new THREE.Color(era.sky[1]), .14)
    this.eraGround.copy(C.groundBase).lerp(new THREE.Color(era.sky[0]), .22)
    this.vista = layout.view ?? 'houses'
    const windows = F.windowMaterials()
    windows.view.map = windowScenery(this.vista, this.season)
    windows.night.map = windowNight(this.vista)
    const floorTop = new THREE.MeshStandardMaterial({ map: floorTexture(layout.floor, w, d), roughness: .85 })
    const floor = new THREE.Mesh(new THREE.BoxGeometry(w, .3, d), [
      mat('#5a4a6b'), mat('#5a4a6b'), floorTop,
      mat('#5a4a6b'), mat('#4b3d5c'), mat('#4b3d5c'),
    ])
    this.owned.push(floor.geometry, floorTop, floorTop.map)
    floor.position.y = -.15
    floor.receiveShadow = true
    this.static.add(floor)
    const base = new THREE.Mesh(new THREE.BoxGeometry(w + .5, .5, d + .5), mat('#3c3150', { rough: .9 }))
    base.position.y = -.5
    base.receiveShadow = true
    this.static.add(base)

    const wallMat = mat(era.wall, { rough: .9 })
    const trim = mat('#ffffff', { rough: .6 })
    const back = new THREE.Mesh(new THREE.BoxGeometry(w + .3, wallH, .16), wallMat)
    back.position.set(-.15, wallH / 2, -d / 2 - .08)
    back.receiveShadow = true
    this.static.add(back)
    const left = new THREE.Mesh(new THREE.BoxGeometry(.16, wallH, d), wallMat)
    left.position.set(-w / 2 - .08, wallH / 2, 0)
    left.receiveShadow = true
    this.static.add(left)
    const capBack = new THREE.Mesh(new THREE.BoxGeometry(w + .32, .08, .2), mat('#4b3d5c'))
    capBack.position.set(-.15, wallH + .04, -d / 2 - .08)
    this.static.add(capBack)
    const capLeft = new THREE.Mesh(new THREE.BoxGeometry(.2, .08, d), mat('#4b3d5c'))
    capLeft.position.set(-w / 2 - .08, wallH + .04, 0)
    this.static.add(capLeft)
    const baseBack = new THREE.Mesh(new THREE.BoxGeometry(w, .12, .04), trim)
    baseBack.position.set(0, .06, -d / 2 + .02)
    this.static.add(baseBack)
    const baseLeft = new THREE.Mesh(new THREE.BoxGeometry(.04, .12, d), trim)
    baseLeft.position.set(-w / 2 + .02, .06, 0)
    this.static.add(baseLeft)
    nav.block(0, -d / 2 + .1, w, .25, 0)
    nav.block(-w / 2 + .1, 0, .25, d, 0)

    if (layout.rug) this.add(F.rug(layout.rug.w, layout.rug.d, layout.rug.color), layout.rug.x, layout.rug.z, 0)

    const doorDef = layout.fixed.find(item => item.kind === 'door')
    for (const item of layout.fixed) {
      const built = this.buildFixed(item, view)
      if (!built) continue
      const spots = this.add(built, item.x, item.z, item.rot ?? 0)
      if (item.kind === 'door') {
        const s = spots[0]
        this.door = { x: s.x, z: s.z, face: s.face }
        const [vx, vz] = rotate(.2, 1.3, item.rot)
        this.visitorSpot = [item.x + vx, item.z + vz]
      }
      if (built.lights) this.extras.lights.push(...built.lights)
      if (built.shade) this.extras.shades.push(built.shade)
    }
    if (!doorDef) this.door = { x: 0, z: d / 2 - .5, face: Math.PI }

    layout.desks.forEach((def, index) => {
      const built = F.desk({ level: view.office, era, index })
      const spots = this.add(built, def.x, def.z, def.rot, false)
      const spot = spots[0]
      nav.unblockPoint(spot.x, spot.z)
      for (const screen of built.screens) this.owned.push(screen.material)
      this.owned.push(...bake(built.pizza))
      this.desks.push({
        index, spot, usedBy: null, group: built.group, pizza: built.pizza,
        screens: built.screens, style: built.style, variant: built.variant, kind: '', user: null,
        roleSlot: built.roleSlot, role: null, roleGroup: null, roleGroups: {},
      })
    })

    // decoração comprada: paredes primeiro, depois chão
    const wallPositions = [...layout.wallSlots, ...layout.posters]
    let wallCursor = 0
    const freeSlots = layout.floorSlots.map(slot => ({ ...slot, nearWall: slot.x < -w / 2 + 1.6 || slot.z < -d / 2 + 1.6 }))
    const takeSlot = tall => {
      let index = tall ? freeSlots.findIndex(slot => slot.nearWall) : freeSlots.findIndex(slot => !slot.nearWall)
      if (index < 0) index = 0
      return freeSlots.splice(index, 1)[0]
    }
    this.hasCat = false
    for (const id of view.decor) {
      if (id === 'cat') this.hasCat = true
      const builder = id === 'neon' ? () => F.neonSign(view.studioName) : F.DECOR_BUILDERS[id]
      if (!builder) continue
      const built = builder()
      if (F.WALL_DECOR.has(id)) {
        const slot = wallPositions[wallCursor++]
        if (!slot) continue
        this.add(built, slot.x, slot.z, slot.rot)
      } else {
        const tall = F.TALL_DECOR.has(id)
        const slot = takeSlot(tall)
        if (!slot) continue
        const rot = slot.rot ?? (slot.nearWall ? (slot.x < -w / 2 + 1.6 ? Math.PI / 2 : 0) : snapRot(Math.atan2(-slot.x, -slot.z)))
        this.add(built, slot.x, slot.z, rot)
      }
      if (built.trophies) this.extras.trophies = built.trophies
      if (built.fish) this.extras.fish.push(...built.fish)
      if (built.screen) this.extras.arcade.push(built.screen)
    }
    // pôsteres: só guarda as vagas que sobraram; syncPosters pendura os quadros na camada própria
    this.posterSlots = wallPositions.slice(wallCursor).filter(slot => layout.posters.includes(slot))
    this.posterKey = null

    for (const spot of this.spots) nav.unblockPoint(spot.x, spot.z)
    nav.unblockPoint(this.door.x, this.door.z)

    // tudo que não se mexe vira poucas malhas
    this.owned.push(...bake(this.static))

    // luz do sol enquadrada no tamanho do cômodo (a direção muda com a hora do dia)
    const span = Math.max(w, d)
    this.sunDist = span * 1.4
    this.sun.target.position.set(0, 0, 0)
    const cam = this.sun.shadow.camera
    cam.left = -span * .85
    cam.right = span * .85
    cam.top = span * .85
    cam.bottom = -span * .85
    cam.near = .5
    cam.far = span * 4
    cam.updateProjectionMatrix()
    this.updateTrophies(view.trophies)
    this.updateCamera()
  }

  buildFixed(item, view) {
    switch (item.kind) {
      case 'bed': return F.bed()
      case 'bookshelf': return F.bookshelf(Math.round(item.x * 10 + item.z * 100))
      case 'window': return F.windowFrame(item.width ?? 1.3, item.rot ? -item.z : item.x)
      case 'door': return F.door()
      case 'lamp': return F.lamp()
      case 'garage': return F.garageDoor()
      case 'toolshelf': return F.toolShelf()
      case 'tires': return F.tires()
      case 'cooler': return F.waterCooler()
      case 'meeting': return F.meetingTable()
      case 'server': return F.serverRack()
      default: return null
    }
  }

  add(built, x, z, rot = 0, collectSpots = true) {
    built.group.position.set(x, 0, z)
    built.group.rotation.y = rot
    built.group.traverse(child => {
      if (child.isMesh) child.receiveShadow = true
    })
    this.static.add(built.group)
    for (const rect of built.block ?? []) {
      const [ox, oz] = rotate(rect.x, rect.z, rot)
      const quarter = Math.round(rot / (Math.PI / 2)) % 2 !== 0
      this.nav.block(x + ox, z + oz, quarter ? rect.d : rect.w, quarter ? rect.w : rect.d)
    }
    const spots = (built.spots ?? []).map(spot => {
      const [sx, sz] = rotate(spot.x, spot.z, rot)
      const result = { x: x + sx, z: z + sz, face: rot + spot.face, action: spot.action, usedBy: null }
      if (spot.seatY !== undefined) result.seatY = spot.seatY
      if (spot.seat) {
        const [tx, tz] = rotate(spot.seat[0], spot.seat[1], rot)
        result.seatX = x + tx
        result.seatZ = z + tz
      }
      if (spot.lie) {
        const [lx, lz] = rotate(spot.lie.x, spot.lie.z, rot)
        result.lie = { x: x + lx, z: z + lz, y: spot.lie.y, rot: rot + spot.lie.rot }
      }
      return result
    })
    if (collectSpots) this.spots.push(...spots.filter(spot => spot.action !== 'door'))
    return spots
  }

  updateTrophies(count = 0) {
    const list = this.extras?.trophies
    if (!list) return
    list.forEach((trophy, i) => { trophy.visible = i < count })
  }

  // Capas dos melhores jogos numa camada fora do cozimento: um lançamento que entra no top 6
  // troca só os quadros (alguns ms), sem remontar as mesas nem tirar ninguém do lugar.
  syncPosters(games = []) {
    const shown = games.slice(0, this.posterSlots.length)
    const key = shown.map(game => game.id).join(',')
    if (key === this.posterKey) return
    this.posterKey = key
    this.clearPosters()
    shown.forEach((game, i) => {
      const slot = this.posterSlots[i]
      const built = F.poster(game)
      built.group.position.set(slot.x, 0, slot.z)
      built.group.rotation.y = slot.rot ?? 0
      built.group.traverse(child => {
        if (child.isMesh) child.receiveShadow = true
      })
      this.posterLayer.add(built.group)
      this.posterMats.push(built.material)
    })
  }

  clearPosters() {
    for (const material of this.posterMats) material.dispose()
    this.posterMats = []
    this.posterLayer.clear()
    clearPosterCache()
  }

  // O próprio ponto se estiver livre; senão, o livre mais perto (quem ficou dentro de um móvel novo).
  standable(x, z) {
    const [c, r] = this.nav.toCell(x, z)
    return this.nav.walkable(c, r) ? [x, z] : this.nav.toWorld(...this.nav.nearestWalkable(x, z))
  }

  hasSpot(action) {
    return this.spots.some(spot => spot.action === action && !spot.usedBy)
  }

  isCouple(a, b) {
    return this.coupleSet.has(`${a}|${b}`) || this.coupleSet.has(`${b}|${a}`)
  }

  topics() {
    return this.view.topics?.length ? [...this.view.topics, ...this.view.topics, 'coffee', 'pizza', 'gamepad', 'laugh', 'question', 'heart', 'star', 'bug', 'money', 'sun', 'tv', 'ball', 'music', 'dice', 'cat'] : ['coffee', 'pizza', 'gamepad', 'laugh', 'question', 'heart', 'star', 'money', 'sun', 'tv', 'ball', 'music', 'dice']
  }

  // Inicia conversa com alguém livre por perto.
  startChat(agent) {
    // quem está deitado (acabou de acordar na cama) não entra na conversa
    const free = this.agents.filter(other => other !== agent && other.root.visible && ['idle', 'activity', 'sit'].includes(other.state) && other.info.status === 'ok' && other.seat?.kind !== 'lie')
    if (!free.length) return false
    free.sort((a, b) => Math.hypot(a.x - agent.x, a.z - agent.z) - Math.hypot(b.x - agent.x, b.z - agent.z))
    const partner = free[0]
    partner.releaseSpot()
    partner.state = 'waitChat'
    partner.activity = null
    partner.path = []
    partner.boneco.setPose(null)
    // sentado (mesa, sofá) conversa sentado; agachado com o gato ou em outra base levanta
    if (!partner.seat) partner.boneco.setBase('stand')
    partner.timer = 8
    partner.partner = agent
    const angle = Math.atan2(agent.x - partner.x, agent.z - partner.z)
    let tx = partner.x + Math.sin(angle) * .75
    let tz = partner.z + Math.cos(angle) * .75
    const [c, r] = this.nav.nearestWalkable(tx, tz)
    ;[tx, tz] = this.nav.toWorld(c, r)
    agent.partner = partner
    agent.walkTo(tx, tz, () => {
      if (partner.state !== 'waitChat') return agent.setIdle()
      agent.face(partner.x, partner.z)
      partner.face(agent.x, agent.z)
      agent.state = 'chat'
      partner.state = 'chat'
      this.conversations.push(new Conversation(this, agent, partner))
    })
    return true
  }

  deskChat(agent) {
    const neighbor = this.agents.find(other => other !== agent && other.state === 'work' && Math.hypot(other.x - agent.x, other.z - agent.z) < 1.7)
    if (!neighbor) {
      agent.think(agent.info.top ?? 'fun')
      return
    }
    const icons = this.topics()
    agent.bubble.show('speech', icons[Math.floor(Math.random() * icons.length)], { duration: 1.3, scale: .42 })
    this.blip(agent)
    setTimeout(() => {
      if (neighbor.state === 'work') {
        neighbor.bubble.show('speech', Math.random() < .5 ? 'laugh' : icons[Math.floor(Math.random() * icons.length)], { duration: 1.3, scale: .42 })
        this.blip(neighbor)
      }
    }, 1200)
  }

  blip(agent) {
    const now = performance.now()
    if (now - this.lastBlip < 180 || !this.view.sound) return
    this.lastBlip = now
    this.callbacks.onBlip?.(agent.voice)
  }

  // ---------- sincronização com o estado do jogo ----------
  sync(view) {
    const key = officeKey(view)
    const rebuilt = key !== this.staticKey
    if (rebuilt) {
      this.staticKey = key
      this.build(view)
    }
    this.syncPosters(view.posters)
    this.view = view
    this.syncWeather(view)
    this.ideaSet = new Set(view.ideas)
    this.coupleSet = new Set((view.couples ?? []).map(([a, b]) => `${a}|${b}`))
    this.updateTrophies(view.trophies)

    // equipe
    const ids = new Set(view.staff.map(person => person.id))
    for (const agent of [...this.agents]) {
      if (!ids.has(agent.id)) {
        agent.info = { ...agent.info, status: 'fired' }
        agent.leave()
        agent.removeWhenGone = true
      }
    }
    view.staff.forEach((person, index) => {
      let agent = this.agents.find(item => item.id === person.id)
      if (agent && JSON.stringify(agent.info.look) !== JSON.stringify(person.look)) {
        // o boneco antigo sai de cena: solta assento, mesa e reserva; o novo aparece em pé fora do móvel
        const [x, z] = this.standable(...agent.footing())
        const rot = agent.rot
        agent.vacate()
        agent.root.removeFromParent()
        this.agents = this.agents.filter(item => item !== agent)
        agent = new StaffAgent(this, person)
        agent.place(x, z, rot)
        agent.appear = .3
        this.agents.push(agent)
        this.agentLayer.add(agent.root)
      }
      if (!agent) {
        agent = new StaffAgent(this, person)
        this.agents.push(agent)
        this.agentLayer.add(agent.root)
        if (this.initialized) agent.enter()
        else {
          const desk = this.desks[index]
          if (desk) agent.place(desk.spot.x + (Math.random() - .5) * .6, desk.spot.z + .5, desk.spot.face + Math.PI)
          else agent.place(...this.nav.randomWalkable())
        }
      }
      agent.info = person
      agent.deskIndex = index
    })
    if (rebuilt && this.initialized) this.resettle()
    this.initialized = true

    // gato
    if (this.hasCat && !this.cat) {
      this.cat = new CatAgent(this)
      const [x, z] = this.nav.randomWalkable()
      this.cat.root.position.set(x, 0, z)
      this.agentLayer.add(this.cat.root)
    } else if (!this.hasCat && this.cat) {
      this.cat.root.removeFromParent()
      this.cat = null
    }
    // camelô
    if (view.visitor && !this.visitor) {
      this.visitor = new VisitorAgent(this)
      this.agentLayer.add(this.visitor.root)
    } else if (!view.visitor && this.visitor && this.visitor.state !== 'leave') this.visitor.leave()

    for (const desk of this.desks) {
      const person = view.staff[desk.index]
      if (desk.pizza) desk.pizza.visible = Boolean(person?.working && person.pace === 'crunch')
      this.syncRole(desk, person?.top ?? null, view.era)
    }
  }

  // Escritório remontado: mesas e lugares são objetos novos. Quem ainda cabe onde estava continua
  // lá; só quem ficou dentro de um móvel novo é empurrado. Sentado ou deitado, vale o ponto de
  // levantar (ninguém fica em pé dentro da cadeira), e quem trabalhava à mesa senta de novo na hora.
  resettle() {
    for (const agent of this.agents) {
      const oldDesk = agent.seat ? agent.desk : null
      const mode = agent.state
      const [x, z] = this.standable(...agent.footing())
      agent.place(x, z, agent.rot)
      agent.path = []
      if (agent.state === 'gone') continue
      const desk = this.desks[agent.deskIndex]
      if (oldDesk && desk && DESK_STATES.has(mode) && samePlace(oldDesk.spot, desk.spot)) agent.sitAtDesk(desk, mode, true)
      else agent.setIdle(.3 + Math.random())
    }
    this.conversations = []
    if (this.cat) {
      const [cx, cz] = this.nav.randomWalkable()
      this.cat.root.position.set(cx, 0, cz)
    }
  }

  // Estação pelo mês e chuva sorteada por mês (sempre a mesma para o mesmo mês).
  syncWeather(view) {
    const month = view.month ?? 0
    const year = view.year ?? view.era.from
    const season = SEASON_OF(month)
    if (season !== this.season) {
      this.season = season
      F.windowMaterials().view.map = windowScenery(this.vista, season)
    }
    // sem mês (tela inicial) nunca chove
    this.rainTarget = view.month !== undefined && hashText(`chuva|${year}|${month}`) / 4294967296 < SEASON_LIGHT[season].rain ? 1 : 0
  }

  // Patinho, mesa digitalizadora, teclado MIDI ou caderno: o que a pessoa usa aparece na mesa.
  syncRole(desk, role, era) {
    if (role === desk.role) return
    if (desk.roleGroup) desk.roleGroup.visible = false
    desk.role = role
    desk.roleGroup = null
    if (!role) return
    let group = desk.roleGroups[role]
    if (!group) {
      group = live(F.roleProps(role, era))
      group.position.set(desk.roleSlot[0], 0, desk.roleSlot[1])
      this.owned.push(...bake(group))
      desk.group.add(group)
      desk.roleGroups[role] = group
    }
    group.visible = true
    desk.roleGroup = group
  }

  handleFx(list) {
    for (const item of list) {
      const agent = item.staffId ? this.agents.find(entry => entry.id === item.staffId) : null
      switch (item.type) {
        case 'work': {
          if (!agent || !agent.root.visible) break
          const desk = agent.state === 'work' ? this.desks[agent.deskIndex] : null
          const from = desk ? new THREE.Vector3(desk.spot.x, 0, desk.spot.z).add(new THREE.Vector3(-Math.sin(desk.spot.face) * .5, .85, -Math.cos(desk.spot.face) * .5)) : agent.root.position.clone().add(new THREE.Vector3(0, 1.1, 0))
          this.particles.orb(from, item.pillar, Math.min(4, 1 + Math.floor(Math.log2(1 + item.amount / 6))))
          if (Math.random() < .12) agent.think(item.pillar)
          break
        }
        case 'bug':
          if (agent && agent.root.visible && Math.random() < .5) agent.bubble.show('thought', 'bug', { color: '#e63946', duration: 1.4, scale: .42 })
          break
        case 'release':
          for (const a of this.agents) a.react(item.score >= 8 ? 'party' : item.score >= 6 ? 'cheer' : 'sad')
          if (item.score >= 8) this.particles.burst(new THREE.Vector3(0, 0, 0), item.score >= 9 ? 220 : 130, Math.max(this.layout.w, this.layout.d) * .6)
          break
        case 'cheer':
          for (const a of this.agents) if (Math.random() < (item.big ? 1 : .5)) a.react(item.big ? 'party' : 'cheer')
          if (item.big) this.particles.burst(new THREE.Vector3(0, 0, 0), 120, Math.max(this.layout.w, this.layout.d) * .5)
          break
        case 'sigh':
          for (const a of this.agents) if (Math.random() < .5) a.react('sad')
          break
        case 'sale':
          if (this.agents[0] && Math.random() < .35) {
            const lucky = this.agents[Math.floor(Math.random() * this.agents.length)]
            if (lucky.root.visible) this.particles.float(lucky.root.position.clone().add(new THREE.Vector3(0, 1.4, 0)), 'coin', '#e09f00', .32)
          }
          break
        case 'hype':
          for (const a of this.agents) if (a.root.visible && Math.random() < .6) this.particles.float(a.root.position.clone().add(new THREE.Vector3(0, 1.4, 0)), 'megaphone', '#ff5d3a', .34)
          break
        case 'idea':
          if (agent) this.blip(agent)
          break
        case 'hire':
          break
        default:
          break
      }
    }
  }

  loop() {
    if (!this.running) return
    requestAnimationFrame(this.loop)
    const dt = Math.min(.05, this.clock.getDelta())
    this.zoom += (this.targetZoom - this.zoom) * Math.min(1, dt * 8)
    this.azimuth += (this.targetAzimuth - this.azimuth) * Math.min(1, dt * 8)
    this.updateCamera()

    const time = performance.now() / 1000
    this.updateWeather(dt, time)
    this.updateScreens(dt, time)
    this.extras?.fish?.forEach((fish, i) => {
      fish.position.x = Math.sin(time * .6 + i * 1.7) * .38
      fish.rotation.y = Math.cos(time * .6 + i * 1.7) > 0 ? 0 : Math.PI
    })
    this.extras?.lights?.forEach((light, i) => { light.visible = Math.sin(time * (2 + i * .7) + i) > -.3 })

    for (const agent of this.agents) agent.update(dt)
    this.agents = this.agents.filter(agent => {
      if (agent.removeWhenGone && agent.state === 'gone') {
        agent.root.removeFromParent()
        return false
      }
      return true
    })
    for (const conversation of this.conversations) conversation.update(dt)
    this.conversations = this.conversations.filter(conversation => !conversation.done)
    this.cat?.update(dt)
    if (this.visitor) {
      this.visitor.update(dt)
      if (this.visitor.gone) {
        this.visitor.root.removeFromParent()
        this.visitor = null
      }
    }
    this.particles.update(dt)
    this.renderer.render(this.scene, this.camera)
  }

  // Céu, sol, luz ambiente e janelas: hora do dia, estação, chuva, era e crunch.
  updateWeather(dt, time) {
    const k = Math.min(1, dt * 1.5)
    this.night += ((this.view.crunch ? 1 : 0) - this.night) * k
    this.rain += (this.rainTarget - this.rain) * Math.min(1, dt * .7)
    const n = this.night
    const wet = this.rain
    const season = SEASON_LIGHT[this.season]
    this.seasonSun.lerp(season.sun, k * .5)
    this.seasonHemi.lerp(season.hemi, k * .5)
    this.seasonI += (season.i - this.seasonI) * k * .5
    this.seasonEl += (season.el - this.seasonEl) * k * .5
    this.seasonPale += (season.pale - this.seasonPale) * k * .5

    const phase = (time / DAY_SECONDS + .12) % 1
    let i = 0
    while (i < DAY.length - 2 && phase > DAY[i + 1].t) i += 1
    const a = DAY[i]
    const b = DAY[i + 1]
    const raw = (phase - a.t) / (b.t - a.t)
    const f = raw * raw * (3 - 2 * raw)
    const L = this.lit

    L.sky.lerpColors(a.top, b.top, f).lerp(C.pale, this.seasonPale).lerp(C.rainTop, wet * .75).lerp(C.nightTop, n)
    L.low.lerpColors(a.low, b.low, f).lerp(C.pale, this.seasonPale).lerp(C.rainLow, wet * .75).lerp(C.nightLow, n)
    const w = F.windowMaterials()
    const colors = w.skyGeo.attributes.color
    colors.setXYZ(0, L.sky.r, L.sky.g, L.sky.b)
    colors.setXYZ(1, L.sky.r, L.sky.g, L.sky.b)
    colors.setXYZ(2, L.low.r, L.low.g, L.low.b)
    colors.setXYZ(3, L.low.r, L.low.g, L.low.b)
    colors.needsUpdate = true
    L.view.copy(C.white).lerp(L.low, .2).multiplyScalar(1 - .25 * wet).lerp(C.nightView, n)
    w.view.color.copy(L.view)
    w.night.opacity = n
    w.rain.opacity = wet * .85
    w.rain.map.offset.set((time * .35) % 1, (time * 1.4) % 1)

    L.sun.lerpColors(a.sun, b.sun, f).multiply(this.seasonSun).lerp(C.rainSun, wet * .6)
    this.sun.color.copy(L.sun)
    this.sun.intensity = (a.i + (b.i - a.i) * f) * this.seasonI * (1 - .55 * wet) * (1 - .87 * n)
    const az = a.az + (b.az - a.az) * f
    const el = Math.max(14 * DEG, a.el + (b.el - a.el) * f + this.seasonEl)
    this.sun.position.set(Math.sin(az) * Math.cos(el) * this.sunDist, Math.sin(el) * this.sunDist, Math.cos(az) * Math.cos(el) * this.sunDist)

    L.hemi.copy(this.seasonHemi).multiply(this.eraHemi).lerp(C.rainHemi, wet * .4).lerp(C.nightHemi, n)
    this.hemi.color.copy(L.hemi)
    this.hemi.groundColor.copy(this.eraGround)
    this.hemi.intensity = 1.25 - .1 * wet - .8 * n
    const glow = Math.max(n, wet * .35)
    for (const shade of this.extras?.shades ?? []) shade.material.emissiveIntensity = .4 + 1.4 * glow
    tickSetups(time, glow)
  }

  // Cada tela mostra o programa de quem está sentado; telas iguais dividem a mesma textura.
  updateScreens(dt, time) {
    for (const desk of this.desks) desk.user = null
    for (const agent of this.agents) if (agent.desk && agent.desk.usedBy === agent.id) agent.desk.user = agent
    const k = Math.min(1, dt * 4)
    for (const desk of this.desks) {
      const user = desk.user
      const kind = !user ? 'idle' : user.state === 'work' ? (ROLE_KIND[user.info.top] ?? 'code') : user.state === 'sit' ? 'game' : 'idle'
      if (kind !== desk.kind) {
        desk.kind = kind
        for (const screen of desk.screens) screen.material.map = liveScreen(screen.slot === 'side' ? SIDE_KIND[kind] : kind, desk.style, desk.variant)
      }
      const target = kind === 'idle' ? (user ? .55 : .4) : 1
      for (const screen of desk.screens) {
        touchScreen(screen.material.map)
        const color = screen.material.color
        color.setScalar(color.r + (target - color.r) * k)
      }
    }
    for (const texture of this.extras?.arcade ?? []) touchScreen(texture)
    tickScreens(time)
  }

  // Libera o que é só deste escritório e devolve o contexto WebGL na hora. Os caches de materiais
  // e geometrias do kit seguram o renderer vivo; sem forceContextLoss, cada troca de save
  // deixaria um contexto (e a memória de GPU dele) para trás.
  dispose() {
    this.running = false
    this.resizeObserver.disconnect()
    this.clearPosters()
    for (const item of this.owned) item.dispose()
    this.owned = []
    this.renderer.dispose()
    this.renderer.forceContextLoss()
    this.renderer.domElement.remove()
  }
}
