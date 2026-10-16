import * as THREE from 'three'
import { mat } from './character.js'
import { neonTexture, posterTexture, screenTexture, whiteboardTexture } from './textures.js'

const box = (w, h, d, material, x = 0, y = 0, z = 0, cast = true) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
  m.position.set(x, y, z)
  m.castShadow = cast
  m.receiveShadow = true
  return m
}
const cyl = (rt, rb, h, material, x = 0, y = 0, z = 0, seg = 14) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}
const sphere = (r, material, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), material)
  m.position.set(x, y, z)
  m.castShadow = true
  return m
}
const rounded = (w, h, d, r, material, x = 0, y = 0, z = 0) => {
  const shape = new THREE.Shape()
  const hw = w / 2 - r
  const hd = d / 2 - r
  shape.moveTo(-hw, -d / 2)
  shape.lineTo(hw, -d / 2)
  shape.quadraticCurveTo(w / 2, -d / 2, w / 2, -hd)
  shape.lineTo(w / 2, hd)
  shape.quadraticCurveTo(w / 2, d / 2, hw, d / 2)
  shape.lineTo(-hw, d / 2)
  shape.quadraticCurveTo(-w / 2, d / 2, -w / 2, hd)
  shape.lineTo(-w / 2, -hd)
  shape.quadraticCurveTo(-w / 2, -d / 2, -hw, -d / 2)
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 2 })
  geometry.rotateX(-Math.PI / 2)
  const m = new THREE.Mesh(geometry, material)
  m.position.set(x, y, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

const WOOD = ['#c8996b', '#d9b48f', '#e8e2d6', '#f5f5f2', '#2d2f36']
const CHAIR = ['#6b4f3a', '#3d5a80', '#2b2d42', '#e63946', '#1b1b1f']

// Mesa com monitor de época. A tela é um material próprio para acender quando alguém trabalha.
export function desk({ level = 0, monitor = 'crt', index = 0 }) {
  const group = new THREE.Group()
  const top = mat(WOOD[Math.min(level, 4)], { rough: .6 })
  const leg = mat(level >= 3 ? '#2d2f36' : '#8a6a4a', { rough: .5 })
  group.add(rounded(1.08, .05, .62, .06, top, 0, .46, 0))
  for (const [x, z] of [[-.48, -.25], [.48, -.25], [-.48, .25], [.48, .25]]) group.add(box(.05, .46, .05, leg, x, .23, z))

  const screenMat = new THREE.MeshStandardMaterial({ color: '#0e1726', emissive: '#ffffff', emissiveMap: screenTexture('idle'), emissiveIntensity: .35, roughness: .3 })
  const casing = mat(monitor === 'crt' ? '#e7dcc4' : '#26282e', { rough: .45 })
  const screens = []
  const addScreen = (geo, x, y, z, ry = 0) => {
    const s = new THREE.Mesh(geo, screenMat)
    s.position.set(x, y, z)
    s.rotation.y = ry
    group.add(s)
    screens.push(s)
  }
  if (monitor === 'crt') {
    group.add(rounded(.4, .32, .36, .05, casing, 0, .51, -.1))
    addScreen(new THREE.PlaneGeometry(.31, .24), 0, .69, .085)
    group.add(box(.3, .06, .1, casing, 0, .51, .14))
  } else if (monitor === 'flat' || monitor === 'dual') {
    const panels = monitor === 'dual' ? [[-.26, .25], [.26, -.25]] : [[0, 0]]
    for (const [x, ry] of panels) {
      const panel = new THREE.Group()
      panel.position.set(x, 0, -.16)
      panel.rotation.y = ry
      panel.add(box(.5, .3, .025, casing, 0, .78, 0))
      panel.add(box(.04, .22, .04, casing, 0, .6, -.02))
      panel.add(box(.18, .015, .12, casing, 0, .495, -.02))
      const s = new THREE.Mesh(new THREE.PlaneGeometry(.46, .26), screenMat)
      s.position.set(0, .78, .014)
      panel.add(s)
      screens.push(s)
      group.add(panel)
    }
  } else {
    group.add(cyl(.12, .14, .03, mat('#c9d1e8', { rough: .2, metal: .4 }), 0, .5, -.16))
    const holo = new THREE.MeshStandardMaterial({ color: '#7ff0ff', emissive: '#59e3ff', emissiveMap: screenTexture('code'), emissiveIntensity: .9, transparent: true, opacity: .62, side: THREE.DoubleSide })
    const s = new THREE.Mesh(new THREE.PlaneGeometry(.62, .34), holo)
    s.position.set(0, .82, -.14)
    group.add(s)
    screens.push(s)
    screenMat.dispose()
  }
  group.add(box(.42, .02, .14, mat(monitor === 'crt' ? '#e7dcc4' : '#1e2026'), 0, .495, .14))
  group.add(box(.06, .02, .09, mat('#f1f1f1'), .3, .495, .15))
  if (index % 3 === 0) group.add(cyl(.04, .035, .09, mat(['#ff6b6b', '#4dabf7', '#ffd43b'][index % 3]), -.38, .53, .05))
  if (index % 4 === 1) group.add(box(.18, .015, .24, mat('#fffdf5'), -.36, .5, .02))

  // cadeira
  const chair = new THREE.Group()
  chair.position.set(0, 0, .5)
  const chairMat = mat(CHAIR[Math.min(level, 4)], { rough: .7 })
  chair.add(rounded(.4, .06, .38, .07, chairMat, 0, .22, 0))
  if (level >= 1) chair.add(rounded(.38, level >= 3 ? .55 : .4, .07, .03, chairMat, 0, .26, .19))
  chair.add(cyl(.025, .025, .2, mat('#555'), 0, .11, 0))
  chair.add(cyl(.18, .18, .03, mat('#333'), 0, .02, 0, 10))
  group.add(chair)

  // caixas de pizza aparecem no crunch
  const pizza = box(.3, .04, .3, mat('#d8a15d'), .3, .5, -.05)
  pizza.visible = false
  group.add(pizza)

  return {
    group,
    w: 1.12,
    d: .66,
    block: [{ x: 0, z: 0, w: 1.12, d: .66 }],
    spots: [{ x: 0, z: .52, face: Math.PI, action: 'desk' }],
    screens,
    screenMat: screens[0]?.material,
    chair,
    pizza,
  }
}

export function bed() {
  const group = new THREE.Group()
  group.add(box(1.1, .26, 1.9, mat('#8c6a4f'), 0, .13, 0))
  group.add(rounded(1.02, .14, 1.82, .08, mat('#f8f4ea'), 0, .27, 0))
  group.add(rounded(1.04, .12, 1.15, .08, mat('#5e7ce2'), 0, .33, .32))
  group.add(rounded(.6, .1, .3, .08, mat('#ffffff'), 0, .4, -.66))
  group.add(box(1.1, .55, .08, mat('#8c6a4f'), 0, .3, -.95))
  return { group, w: 1.1, d: 1.95, block: [{ x: 0, z: 0, w: 1.1, d: 1.95 }], spots: [{ x: .7, z: .3, face: -Math.PI / 2, action: 'sofa' }] }
}

export function bookshelf(colors = ['#e63946', '#457b9d', '#f4a261', '#2a9d8f', '#8d99ae', '#ffb703']) {
  const group = new THREE.Group()
  const wood = mat('#9c7a54')
  group.add(box(.9, 1.4, .32, wood, 0, .7, 0))
  for (let shelf = 0; shelf < 3; shelf += 1) {
    let x = -.38
    while (x < .36) {
      const w = .05 + Math.random() * .05
      const h = .22 + Math.random() * .12
      group.add(box(w, h, .2, mat(colors[Math.floor(Math.random() * colors.length)]), x + w / 2, .14 + shelf * .44 + h / 2, .08, false))
      x += w + .01
    }
  }
  return { group, w: .9, d: .34, block: [{ x: 0, z: 0, w: .9, d: .34 }], spots: [] }
}

export function plant(big = false) {
  const group = new THREE.Group()
  group.add(cyl(.16, .12, .28, mat('#d86f45'), 0, .14, 0))
  const leaf = mat('#3fa34d', { rough: .9 })
  const leaf2 = mat('#57c45d', { rough: .9 })
  for (let i = 0; i < (big ? 7 : 5); i += 1) {
    const a = i / (big ? 7 : 5) * Math.PI * 2
    const s = sphere(big ? .17 : .13, i % 2 ? leaf : leaf2, Math.cos(a) * .1, .42 + (i % 3) * .08 + (big ? .12 : 0), Math.sin(a) * .1)
    s.scale.y = 1.4
    group.add(s)
  }
  return { group, w: .4, d: .4, block: [{ x: 0, z: 0, w: .36, d: .36 }], spots: [{ x: 0, z: .45, face: Math.PI, action: 'plant' }] }
}

export function coffeeMachine() {
  const group = new THREE.Group()
  group.add(box(.7, .6, .45, mat('#f1ebe0'), 0, .3, 0))
  group.add(box(.32, .38, .28, mat('#2b2d42', { rough: .35 }), -.08, .79, -.02))
  group.add(box(.14, .08, .02, mat('#ff4d4d', { emissive: '#ff2d2d', emissiveIntensity: .8 }), -.08, .9, .125, false))
  group.add(cyl(.04, .035, .08, mat('#ffffff'), -.08, .64, .07))
  group.add(cyl(.05, .05, .2, mat('#c08552'), .2, .7, 0))
  return { group, w: .7, d: .45, block: [{ x: 0, z: 0, w: .7, d: .45 }], spots: [{ x: 0, z: .55, face: Math.PI, action: 'coffee' }] }
}

export function sofa(color = '#ef8354') {
  const group = new THREE.Group()
  const fabric = mat(color, { rough: .95 })
  group.add(rounded(1.6, .22, .7, .1, fabric, 0, .06, 0))
  group.add(rounded(1.6, .45, .18, .08, fabric, 0, .06, -.28))
  for (const x of [-.74, .74]) group.add(rounded(.16, .34, .7, .07, fabric, x, .06, 0))
  for (const x of [-.36, .36]) group.add(rounded(.66, .1, .5, .1, mat('#f6bd60', { rough: .95 }), x, .3, .06))
  return { group, w: 1.6, d: .72, block: [{ x: 0, z: 0, w: 1.6, d: .72 }], spots: [{ x: -.36, z: .55, face: 0, action: 'sofa', seat: [-.36, .08] }, { x: .36, z: .55, face: 0, action: 'sofa', seat: [.36, .08] }] }
}

export function beanbag(color = '#9b5de5') {
  const group = new THREE.Group()
  const s = sphere(.36, mat(color, { rough: 1 }), 0, .2, 0)
  s.scale.set(1, .6, 1)
  group.add(s)
  return { group, w: .7, d: .7, block: [{ x: 0, z: 0, w: .6, d: .6 }], spots: [{ x: 0, z: .55, face: 0, action: 'sofa', seat: [0, .05] }] }
}

export function whiteboard() {
  const group = new THREE.Group()
  group.add(box(1.3, .82, .05, mat('#d9dde3', { rough: .4 }), 0, 1.25, 0))
  const surface = new THREE.Mesh(new THREE.PlaneGeometry(1.2, .72), new THREE.MeshStandardMaterial({ map: whiteboardTexture(), roughness: .3 }))
  surface.position.set(0, 1.25, .03)
  group.add(surface)
  group.add(box(1.0, .04, .08, mat('#9aa1ab'), 0, .82, .04))
  return { group, w: 1.3, d: .1, wall: true, block: [], spots: [{ x: 0, z: .55, face: Math.PI, action: 'whiteboard' }] }
}

export function arcade() {
  const group = new THREE.Group()
  const body = mat('#5a189a', { rough: .5 })
  group.add(box(.66, 1.5, .62, body, 0, .75, 0))
  group.add(box(.6, .38, .3, mat('#14141f'), 0, 1.1, .2))
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(.5, .32), new THREE.MeshStandardMaterial({ color: '#000', emissive: '#ffffff', emissiveMap: screenTexture('art'), emissiveIntensity: .9 }))
  screen.position.set(0, 1.12, .36)
  screen.rotation.x = -.2
  group.add(screen)
  group.add(box(.66, .2, .4, mat('#ff006e', { emissive: '#ff006e', emissiveIntensity: .5 }), 0, 1.45, .12))
  group.add(box(.66, .1, .3, body, 0, .82, .42))
  group.add(sphere(.04, mat('#ffbe0b'), -.12, .9, .48))
  group.add(sphere(.03, mat('#3a86ff'), .1, .89, .5))
  group.add(sphere(.03, mat('#ff006e'), .18, .89, .48))
  return { group, w: .66, d: .62, block: [{ x: 0, z: 0, w: .66, d: .64 }], spots: [{ x: 0, z: .78, face: Math.PI, action: 'arcade' }], screen }
}

export function foosball() {
  const group = new THREE.Group()
  group.add(box(1.2, .2, .7, mat('#7a5230'), 0, .62, 0))
  group.add(box(1.1, .02, .6, mat('#2d9a4b'), 0, .72, 0, false))
  for (const [x, z] of [[-.55, -.3], [.55, -.3], [-.55, .3], [.55, .3]]) group.add(box(.07, .55, .07, mat('#5b3a1e'), x, .28, z))
  for (let i = 0; i < 6; i += 1) {
    const rod = cyl(.012, .012, 1.0, mat('#cccccc'), -.45 + i * .18, .76, 0, 6)
    rod.rotation.x = Math.PI / 2
    group.add(rod)
    group.add(box(.04, .12, .04, mat(i % 2 ? '#e63946' : '#1d3557'), -.45 + i * .18, .74, 0))
  }
  return { group, w: 1.2, d: .7, block: [{ x: 0, z: 0, w: 1.2, d: .7 }], spots: [{ x: 0, z: .65, face: Math.PI, action: 'foosball' }, { x: 0, z: -.65, face: 0, action: 'foosball' }] }
}

export function fridge() {
  const group = new THREE.Group()
  group.add(rounded(.62, 1.35, .55, .06, mat('#e9f5ff', { rough: .3 }), 0, 0, 0))
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(.48, 1.05), new THREE.MeshStandardMaterial({ color: '#9fe8ff', emissive: '#4cc9f0', emissiveIntensity: .6, transparent: true, opacity: .8 }))
  glass.position.set(0, .72, .3)
  group.add(glass)
  for (let row = 0; row < 3; row += 1) for (let i = 0; i < 4; i += 1) group.add(cyl(.035, .035, .14, mat(['#06d6a0', '#ef476f', '#ffd166'][row]), -.17 + i * .11, .38 + row * .3, .2, 8))
  return { group, w: .62, d: .55, block: [{ x: 0, z: 0, w: .62, d: .56 }], spots: [{ x: 0, z: .65, face: Math.PI, action: 'coffee' }] }
}

export function aquarium() {
  const group = new THREE.Group()
  group.add(box(1.1, .55, .45, mat('#3d3d3d'), 0, .28, 0))
  const water = new THREE.Mesh(new THREE.BoxGeometry(1.06, .5, .42), new THREE.MeshStandardMaterial({ color: '#4cc9f0', transparent: true, opacity: .45, roughness: .1 }))
  water.position.y = .82
  group.add(water)
  group.add(box(1.06, .05, .42, mat('#f4e3b2'), 0, .58, 0, false))
  const fish = []
  for (let i = 0; i < 4; i += 1) {
    const f = new THREE.Mesh(new THREE.ConeGeometry(.035, .1, 6), mat(['#ff9f1c', '#ff006e', '#ffbe0b', '#3a86ff'][i], { emissive: '#331100', emissiveIntensity: .2 }))
    f.rotation.z = Math.PI / 2
    f.position.set(-.3 + i * .2, .72 + (i % 2) * .15, -.08 + (i % 3) * .08)
    group.add(f)
    fish.push(f)
  }
  return { group, w: 1.1, d: .46, block: [{ x: 0, z: 0, w: 1.1, d: .46 }], spots: [{ x: 0, z: .6, face: Math.PI, action: 'look' }], fish }
}

export function neonSign(text) {
  const group = new THREE.Group()
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, .5), new THREE.MeshBasicMaterial({ map: neonTexture(text), transparent: true, depthWrite: false }))
  plane.position.set(0, 1.75, .04)
  group.add(plane)
  return { group, w: 2, d: .05, wall: true, block: [], spots: [] }
}

export function trophyShelf(count = 0) {
  const group = new THREE.Group()
  const wood = mat('#6d4c41')
  for (const y of [1.0, 1.5]) group.add(box(1.2, .05, .26, wood, 0, y, .1))
  const gold = mat('#ffc93c', { rough: .25, metal: .7, emissive: '#7a5200', emissiveIntensity: .15 })
  const silver = mat('#cfd6df', { rough: .25, metal: .7 })
  const trophies = []
  for (let i = 0; i < 10; i += 1) {
    const t = new THREE.Group()
    const material = i % 3 === 2 ? silver : gold
    t.add(cyl(.035, .05, .04, mat('#3b2a20'), 0, .02, 0, 8))
    t.add(cyl(.012, .012, .08, material, 0, .08, 0, 6))
    t.add(cyl(.06, .03, .08, material, 0, .15, 0, 10))
    t.position.set(-.48 + (i % 5) * .24, (i < 5 ? 1.025 : 1.525), .1)
    t.visible = i < count
    group.add(t)
    trophies.push(t)
  }
  return { group, w: 1.2, d: .3, wall: true, block: [], spots: [{ x: 0, z: .6, face: Math.PI, action: 'look' }], trophies }
}

export function catBed() {
  const group = new THREE.Group()
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.2, .07, 8, 18), mat('#e5989b', { rough: 1 }))
  ring.rotation.x = Math.PI / 2
  ring.position.y = .07
  group.add(ring)
  group.add(cyl(.2, .2, .04, mat('#ffcdb2', { rough: 1 }), 0, .03, 0))
  return { group, w: .5, d: .5, block: [], spots: [{ x: 0, z: 0, face: 0, action: 'catbed' }] }
}

export function waterCooler() {
  const group = new THREE.Group()
  group.add(box(.36, .8, .36, mat('#f1f3f5'), 0, .4, 0))
  const jug = cyl(.15, .15, .4, new THREE.MeshStandardMaterial({ color: '#74c0fc', transparent: true, opacity: .6, roughness: .1 }), 0, 1.0, 0)
  group.add(jug)
  return { group, w: .38, d: .38, block: [{ x: 0, z: 0, w: .38, d: .38 }], spots: [{ x: 0, z: .5, face: Math.PI, action: 'coffee' }] }
}

export function rug(w, d, color) {
  const group = new THREE.Group()
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat(color, { rough: 1 }))
  m.rotation.x = -Math.PI / 2
  m.position.y = .012
  m.receiveShadow = true
  group.add(m)
  return { group, w, d, block: [], spots: [] }
}

export function meetingTable() {
  const group = new THREE.Group()
  group.add(rounded(2.0, .06, .9, .3, mat('#f5f5f2', { rough: .4 }), 0, .46, 0))
  group.add(cyl(.08, .08, .46, mat('#444'), -.6, .23, 0))
  group.add(cyl(.08, .08, .46, mat('#444'), .6, .23, 0))
  const spots = []
  for (const x of [-.6, 0, .6]) {
    spots.push({ x, z: .72, face: Math.PI, action: 'meeting' })
    spots.push({ x, z: -.72, face: 0, action: 'meeting' })
  }
  return { group, w: 2, d: .9, block: [{ x: 0, z: 0, w: 2, d: .9 }], spots }
}

export function serverRack() {
  const group = new THREE.Group()
  group.add(box(.6, 1.7, .6, mat('#1f2430', { rough: .4 }), 0, .85, 0))
  const lights = []
  for (let i = 0; i < 12; i += 1) {
    const l = box(.04, .03, .01, mat(['#2bff88', '#ffbe0b', '#00b4ff'][i % 3], { emissive: ['#2bff88', '#ffbe0b', '#00b4ff'][i % 3], emissiveIntensity: 1 }), -.2 + (i % 4) * .13, .4 + Math.floor(i / 4) * .4, .305, false)
    group.add(l)
    lights.push(l)
  }
  return { group, w: .6, d: .6, block: [{ x: 0, z: 0, w: .6, d: .6 }], spots: [], lights }
}

export function poster(game) {
  const group = new THREE.Group()
  group.add(box(.66, .86, .03, mat('#1d1b22'), 0, 1.45, 0))
  const art = new THREE.Mesh(new THREE.PlaneGeometry(.6, .8), new THREE.MeshStandardMaterial({ map: posterTexture(game), roughness: .6 }))
  art.position.set(0, 1.45, .018)
  group.add(art)
  return { group, w: .66, d: .04, wall: true, block: [], spots: [] }
}

export function windowFrame(width = 1.3) {
  const group = new THREE.Group()
  const frame = mat('#ffffff', { rough: .5 })
  const glassMat = new THREE.MeshStandardMaterial({ color: '#bde0fe', emissive: '#bde0fe', emissiveIntensity: .55, roughness: .1 })
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(width, .9), glassMat)
  glass.position.set(0, 1.45, .02)
  group.add(glass)
  group.add(box(width + .1, .07, .08, frame, 0, 1.92, .03))
  group.add(box(width + .1, .07, .12, frame, 0, .98, .05))
  group.add(box(.06, .9, .06, frame, -width / 2, 1.45, .03))
  group.add(box(.06, .9, .06, frame, width / 2, 1.45, .03))
  group.add(box(.04, .9, .04, frame, 0, 1.45, .03))
  return { group, w: width, d: .1, wall: true, block: [], spots: [{ x: 0, z: .55, face: Math.PI, action: 'look' }], glass: glassMat }
}

export function door() {
  const group = new THREE.Group()
  group.add(box(.86, 1.75, .06, mat('#a26b4d', { rough: .6 }), 0, .875, .02))
  group.add(box(.96, .07, .08, mat('#ffffff'), 0, 1.78, .03))
  group.add(sphere(.035, mat('#ffd166', { metal: .6, rough: .3 }), .32, .85, .08))
  return { group, w: .9, d: .1, wall: true, block: [], spots: [{ x: 0, z: .45, face: 0, action: 'door' }] }
}

export function garageDoor(width = 2.8) {
  const group = new THREE.Group()
  for (let i = 0; i < 7; i += 1) group.add(box(width, .24, .05, mat(i % 2 ? '#c9ced6' : '#b8bec8', { rough: .5 }), 0, .14 + i * .25, .02))
  group.add(box(width + .14, .08, .09, mat('#7d8590'), 0, 1.86, .03))
  return { group, w: width, d: .1, wall: true, block: [], spots: [] }
}

export function toolShelf() {
  const group = new THREE.Group()
  const metal = mat('#7d8590', { rough: .4, metal: .3 })
  for (const y of [.3, .75, 1.2]) group.add(box(1.1, .04, .38, metal, 0, y, 0))
  for (const x of [-.53, .53]) group.add(box(.04, 1.3, .38, metal, x, .65, 0))
  const boxes = ['#c08552', '#d4a373', '#e9c46a', '#264653']
  for (let i = 0; i < 6; i += 1) group.add(box(.26, .2, .28, mat(boxes[i % 4]), -.35 + (i % 3) * .35, .42 + Math.floor(i / 3) * .45, 0))
  return { group, w: 1.1, d: .4, block: [{ x: 0, z: 0, w: 1.1, d: .4 }], spots: [] }
}

export function tires() {
  const group = new THREE.Group()
  for (let i = 0; i < 3; i += 1) {
    const t = new THREE.Mesh(new THREE.TorusGeometry(.22, .09, 8, 16), mat('#222', { rough: .9 }))
    t.rotation.x = Math.PI / 2
    t.position.y = .09 + i * .18
    t.castShadow = true
    group.add(t)
  }
  return { group, w: .6, d: .6, block: [{ x: 0, z: 0, w: .6, d: .6 }], spots: [] }
}

export function lamp() {
  const group = new THREE.Group()
  group.add(cyl(.14, .16, .04, mat('#333'), 0, .02, 0))
  group.add(cyl(.015, .015, 1.4, mat('#333'), 0, .72, 0, 6))
  const shade = cyl(.12, .2, .22, mat('#fff3d6', { emissive: '#ffd27a', emissiveIntensity: .4 }), 0, 1.45, 0)
  group.add(shade)
  return { group, w: .35, d: .35, block: [{ x: 0, z: 0, w: .3, d: .3 }], spots: [], shade }
}

export const DECOR_BUILDERS = {
  plant: () => plant(true),
  coffee: coffeeMachine,
  beanbag: () => beanbag(),
  whiteboard,
  cat: catBed,
  sofa: () => sofa(),
  fridge,
  trophyshelf: () => trophyShelf(0),
  arcade,
  foosball,
  aquarium,
  neon: null,
}

export const WALL_DECOR = new Set(['whiteboard', 'trophyshelf', 'neon'])
export const TALL_DECOR = new Set(['arcade', 'fridge', 'coffee', 'aquarium'])
