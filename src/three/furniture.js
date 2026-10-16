import * as THREE from 'three'
import { B, C, S, R, mat, basic, part, geo, boxGeo, planeGeo, torusGeo, coneGeo, live, seeded } from './kit.js'
import { neonTexture, posterTexture, whiteboardTexture, windowScenery, windowNight, rainTexture, VIEW_SPAN } from './textures.js'
import { liveScreen } from './screens.js'
import { buildDesk, chair, roleProps, SEAT } from './setups.js'

export { roleProps, SEAT }

// Móveis procedurais. Cada um devolve o grupo, o retângulo que bloqueia a
// navegação e os pontos de uso. Ponto onde alguém senta leva seatY (altura do
// assento); a cama leva lie (boneco deitado). Geometrias e materiais vêm do kit,
// em cache, e o mundo junta tudo que não se mexe numa malha só.

// Mesa com o computador da época, cadeira e bagunça; ver setups.js.
export function desk({ level = 0, era, index = 0 }) {
  return buildDesk({ level, era, index })
}

export function bed() {
  const group = new THREE.Group()
  const wood = mat('#8c6a4f', { rough: .6 })
  B(group, 1.1, .2, 1.9, wood, 0, .14, 0)
  for (const [x, z] of [[-.5, -.88], [.5, -.88], [-.5, .88], [.5, .88]]) B(group, .08, .06, .08, wood, x, .03, z)
  R(group, 1.02, .14, 1.82, .08, mat('#f8f4ea', { rough: .9 }), 0, .26, 0)
  R(group, 1.04, .03, 1.12, .08, mat('#5e7ce2', { rough: .95 }), 0, .41, .33)
  R(group, .62, .08, .28, .08, mat('#ffffff', { rough: .9 }), 0, .43, -.66)
  B(group, 1.1, .7, .08, wood, 0, .35, -.95)
  B(group, 1.1, .48, .06, wood, 0, .24, .95)
  // Senta na beirada olhando para fora; deitado, o centro do corpo fica no colchão
  // (topo em y = .42) com a cabeça no travesseiro (-z). lie.rot é o giro do boneco:
  // de costas na cama, os pés apontam para (sin rot, cos rot), aqui para o pé da cama.
  return {
    group,
    w: 1.1,
    d: 1.95,
    block: [{ x: 0, z: 0, w: 1.1, d: 1.95 }],
    spots: [{ x: .82, z: .2, face: Math.PI / 2, action: 'bed', seat: [.42, .2], seatY: .42, lie: { x: 0, z: -.12, y: .42, rot: 0 } }],
  }
}

export function bookshelf(seed = 0, colors = ['#e63946', '#457b9d', '#f4a261', '#2a9d8f', '#8d99ae', '#ffb703']) {
  const group = new THREE.Group()
  const r = seeded('estante', seed)
  B(group, .9, 1.4, .32, mat('#9c7a54'), 0, .7, 0)
  for (let shelf = 0; shelf < 3; shelf += 1) {
    let x = -.38
    while (x < .36) {
      const w = .05 + r() * .05
      const h = .22 + r() * .12
      B(group, w, h, .2, mat(colors[Math.floor(r() * colors.length)]), x + w / 2, .14 + shelf * .44 + h / 2, .08, { cast: false })
      x += w + .01
    }
  }
  return { group, w: .9, d: .34, block: [{ x: 0, z: 0, w: .9, d: .34 }], spots: [] }
}

export function plant(big = false) {
  const group = new THREE.Group()
  C(group, .16, .12, .28, mat('#d86f45'), 0, .14, 0, { seg: 14 })
  const leaf = mat('#3fa34d', { rough: .9 })
  const leaf2 = mat('#57c45d', { rough: .9 })
  const n = big ? 7 : 5
  for (let i = 0; i < n; i += 1) {
    const a = i / n * Math.PI * 2
    S(group, big ? .17 : .13, i % 2 ? leaf : leaf2, Math.cos(a) * .1, .42 + (i % 3) * .08 + (big ? .12 : 0), Math.sin(a) * .1, { sy: 1.4 })
  }
  return { group, w: .4, d: .4, block: [{ x: 0, z: 0, w: .36, d: .36 }], spots: [{ x: 0, z: .45, face: Math.PI, action: 'plant' }] }
}

export function coffeeMachine() {
  const group = new THREE.Group()
  B(group, .7, .6, .45, mat('#f1ebe0'), 0, .3, 0)
  B(group, .32, .38, .28, mat('#2b2d42', { rough: .35 }), -.08, .79, -.02)
  B(group, .14, .08, .02, mat('#ff4d4d', { emissive: '#ff2d2d', emissiveIntensity: .8 }), -.08, .9, .125, { cast: false })
  C(group, .04, .035, .08, mat('#ffffff'), -.08, .64, .07)
  C(group, .05, .05, .2, mat('#c08552'), .2, .7, 0)
  return { group, w: .7, d: .45, block: [{ x: 0, z: 0, w: .7, d: .45 }], spots: [{ x: 0, z: .55, face: Math.PI, action: 'coffee' }] }
}

export function sofa(color = '#ef8354') {
  const group = new THREE.Group()
  const fabric = mat(color, { rough: .95 })
  R(group, 1.6, .22, .7, .1, fabric, 0, .06, 0)
  R(group, 1.6, .45, .18, .08, fabric, 0, .06, -.28)
  for (const x of [-.74, .74]) R(group, .16, .34, .7, .07, fabric, x, .06, 0)
  for (const x of [-.36, .36]) R(group, .66, .1, .5, .1, mat('#f6bd60', { rough: .95 }), x, .3, .06)
  return {
    group,
    w: 1.6,
    d: .72,
    block: [{ x: 0, z: 0, w: 1.6, d: .72 }],
    spots: [{ x: -.36, z: .55, face: 0, action: 'sofa', seat: [-.36, .08], seatY: .42 }, { x: .36, z: .55, face: 0, action: 'sofa', seat: [.36, .08], seatY: .42 }],
  }
}

export function beanbag(color = '#9b5de5') {
  const group = new THREE.Group()
  S(group, .36, mat(color, { rough: 1 }), 0, .2, 0, { sy: .6, ws: 16, hs: 12 })
  return { group, w: .7, d: .7, block: [{ x: 0, z: 0, w: .6, d: .6 }], spots: [{ x: 0, z: .55, face: 0, action: 'sofa', seat: [0, .05], seatY: .3 }] }
}

export function whiteboard() {
  const group = new THREE.Group()
  B(group, 1.3, .82, .05, mat('#d9dde3', { rough: .4 }), 0, 1.25, 0)
  group.add(part(planeGeo(1.2, .72), mat('#ffffff', { map: whiteboardTexture(), rough: .3 }), 0, 1.25, .03, { cast: false }))
  B(group, 1.0, .04, .08, mat('#9aa1ab'), 0, .82, .04)
  return { group, w: 1.3, d: .1, wall: true, block: [], spots: [{ x: 0, z: .55, face: Math.PI, action: 'whiteboard' }] }
}

// Fliperama com um joguinho de verdade rodando na tela.
export function arcade(index = 0) {
  const group = new THREE.Group()
  const body = mat('#5a189a', { rough: .5 })
  B(group, .66, 1.5, .62, body, 0, .75, 0)
  B(group, .6, .38, .3, mat('#14141f'), 0, 1.1, .2)
  const texture = liveScreen('game', 'arcade', index % 2)
  const screen = live(part(planeGeo(.5, .32), basic('#ffffff', { map: texture }), 0, 1.12, .36, { rx: -.2, cast: false }))
  group.add(screen)
  B(group, .66, .2, .4, mat('#ff006e', { emissive: '#ff006e', emissiveIntensity: .5 }), 0, 1.45, .12)
  B(group, .66, .1, .3, body, 0, .82, .42)
  S(group, .04, mat('#ffbe0b'), -.12, .9, .48)
  S(group, .03, mat('#3a86ff'), .1, .89, .5)
  S(group, .03, mat('#ff006e'), .18, .89, .48)
  return { group, w: .66, d: .62, block: [{ x: 0, z: 0, w: .66, d: .64 }], spots: [{ x: 0, z: .78, face: Math.PI, action: 'arcade' }], screen: texture }
}

export function foosball() {
  const group = new THREE.Group()
  B(group, 1.2, .2, .7, mat('#7a5230'), 0, .62, 0)
  B(group, 1.1, .02, .6, mat('#2d9a4b'), 0, .72, 0, { cast: false })
  for (const [x, z] of [[-.55, -.3], [.55, -.3], [-.55, .3], [.55, .3]]) B(group, .07, .55, .07, mat('#5b3a1e'), x, .28, z)
  for (let i = 0; i < 6; i += 1) {
    C(group, .012, .012, 1.0, mat('#cccccc'), -.45 + i * .18, .76, 0, { rx: Math.PI / 2, seg: 6 })
    B(group, .04, .12, .04, mat(i % 2 ? '#e63946' : '#1d3557'), -.45 + i * .18, .74, 0)
  }
  return { group, w: 1.2, d: .7, block: [{ x: 0, z: 0, w: 1.2, d: .7 }], spots: [{ x: 0, z: .65, face: Math.PI, action: 'foosball' }, { x: 0, z: -.65, face: 0, action: 'foosball' }] }
}

export function fridge() {
  const group = new THREE.Group()
  R(group, .62, 1.35, .55, .06, mat('#e9f5ff', { rough: .3 }), 0, 0, 0)
  group.add(part(planeGeo(.48, 1.05), mat('#9fe8ff', { emissive: '#4cc9f0', emissiveIntensity: .6, opacity: .8 }), 0, .72, .3, { cast: false }))
  for (let row = 0; row < 3; row += 1) for (let i = 0; i < 4; i += 1) C(group, .035, .035, .14, mat(['#06d6a0', '#ef476f', '#ffd166'][row]), -.17 + i * .11, .38 + row * .3, .2, { seg: 8 })
  return { group, w: .62, d: .55, block: [{ x: 0, z: 0, w: .62, d: .56 }], spots: [{ x: 0, z: .65, face: Math.PI, action: 'coffee' }] }
}

export function aquarium() {
  const group = new THREE.Group()
  B(group, 1.1, .55, .45, mat('#3d3d3d'), 0, .28, 0)
  const water = part(boxGeo(1.06, .5, .42), mat('#4cc9f0', { opacity: .45, rough: .1 }), 0, .82, 0, { cast: false })
  group.add(water)
  B(group, 1.06, .05, .42, mat('#f4e3b2'), 0, .58, 0, { cast: false })
  const fish = []
  for (let i = 0; i < 4; i += 1) {
    const f = live(part(coneGeo(.035, .1, 6), mat(['#ff9f1c', '#ff006e', '#ffbe0b', '#3a86ff'][i], { emissive: '#331100', emissiveIntensity: .2 }), -.3 + i * .2, .72 + (i % 2) * .15, -.08 + (i % 3) * .08, { rz: Math.PI / 2 }))
    group.add(f)
    fish.push(f)
  }
  return { group, w: 1.1, d: .46, block: [{ x: 0, z: 0, w: 1.1, d: .46 }], spots: [{ x: 0, z: .6, face: Math.PI, action: 'look' }], fish }
}

export function neonSign(text) {
  const group = new THREE.Group()
  const plane = new THREE.Mesh(planeGeo(2, .5), new THREE.MeshBasicMaterial({ map: neonTexture(text), transparent: true, depthWrite: false }))
  plane.position.set(0, 1.75, .04)
  group.add(plane)
  return { group, w: 2, d: .05, wall: true, block: [], spots: [] }
}

export function trophyShelf(count = 0) {
  const group = new THREE.Group()
  const wood = mat('#6d4c41')
  for (const y of [1.0, 1.5]) B(group, 1.2, .05, .26, wood, 0, y, .1)
  const gold = mat('#ffc93c', { rough: .25, metal: .7, emissive: '#7a5200', emissiveIntensity: .15 })
  const silver = mat('#cfd6df', { rough: .25, metal: .7 })
  const trophies = []
  for (let i = 0; i < 10; i += 1) {
    const t = live(new THREE.Group())
    const material = i % 3 === 2 ? silver : gold
    C(t, .035, .05, .04, mat('#3b2a20'), 0, .02, 0, { seg: 8 })
    C(t, .012, .012, .08, material, 0, .08, 0, { seg: 6 })
    C(t, .06, .03, .08, material, 0, .15, 0, { seg: 10 })
    t.position.set(-.48 + (i % 5) * .24, (i < 5 ? 1.025 : 1.525), .1)
    t.visible = i < count
    group.add(t)
    trophies.push(t)
  }
  return { group, w: 1.2, d: .3, wall: true, block: [], spots: [{ x: 0, z: .6, face: Math.PI, action: 'look' }], trophies }
}

export function catBed() {
  const group = new THREE.Group()
  group.add(part(torusGeo(.2, .07, 8, 18), mat('#e5989b', { rough: 1 }), 0, .07, 0, { rx: Math.PI / 2 }))
  C(group, .2, .2, .04, mat('#ffcdb2', { rough: 1 }), 0, .03, 0, { seg: 16 })
  return { group, w: .5, d: .5, block: [], spots: [{ x: 0, z: 0, face: 0, action: 'catbed' }] }
}

export function waterCooler() {
  const group = new THREE.Group()
  B(group, .36, .8, .36, mat('#f1f3f5'), 0, .4, 0)
  C(group, .15, .15, .4, mat('#74c0fc', { opacity: .6, rough: .1 }), 0, 1.0, 0, { seg: 14 })
  return { group, w: .38, d: .38, block: [{ x: 0, z: 0, w: .38, d: .38 }], spots: [{ x: 0, z: .5, face: Math.PI, action: 'coffee' }] }
}

export function rug(w, d, color) {
  const group = new THREE.Group()
  const m = part(planeGeo(w, d), mat(color, { rough: 1 }), 0, .012, 0, { rx: -Math.PI / 2, cast: false })
  group.add(m)
  return { group, w, d, block: [], spots: [] }
}

// Mesa de reunião com cadeiras de verdade nos seis lugares.
export function meetingTable() {
  const group = new THREE.Group()
  R(group, 2.0, .06, .9, .3, mat('#f5f5f2', { rough: .4 }), 0, .46, 0)
  C(group, .08, .08, .46, mat('#444'), -.6, .23, 0)
  C(group, .08, .08, .46, mat('#444'), .6, .23, 0)
  const spots = []
  ;[-.6, 0, .6].forEach((x, i) => {
    for (const side of [1, -1]) {
      const seat = new THREE.Group()
      seat.position.set(x, 0, side * .72)
      seat.rotation.y = side > 0 ? 0 : Math.PI
      group.add(seat)
      chair(seat, 'office', i + (side > 0 ? 0 : 3), 3)
      spots.push({ x, z: side * .72, face: side > 0 ? Math.PI : 0, action: 'meeting', seatY: SEAT })
    }
  })
  return { group, w: 2, d: .9, block: [{ x: 0, z: 0, w: 2, d: .9 }], spots }
}

export function serverRack() {
  const group = new THREE.Group()
  B(group, .6, 1.7, .6, mat('#1f2430', { rough: .4 }), 0, .85, 0)
  const lights = []
  for (let i = 0; i < 12; i += 1) {
    const color = ['#2bff88', '#ffbe0b', '#00b4ff'][i % 3]
    const l = live(part(boxGeo(.04, .03, .01), mat(color, { emissive: color, emissiveIntensity: 1 }), -.2 + (i % 4) * .13, .4 + Math.floor(i / 4) * .4, .305, { cast: false }))
    group.add(l)
    lights.push(l)
  }
  return { group, w: .6, d: .6, block: [{ x: 0, z: 0, w: .6, d: .6 }], spots: [], lights }
}

export function poster(game) {
  const group = new THREE.Group()
  B(group, .66, .86, .03, mat('#1d1b22'), 0, 1.45, 0)
  const art = new THREE.Mesh(planeGeo(.6, .8), new THREE.MeshStandardMaterial({ map: posterTexture(game), roughness: .6 }))
  art.position.set(0, 1.45, .018)
  group.add(art)
  return { group, w: .66, d: .04, wall: true, block: [], spots: [], material: art.material }
}

// ---------- janelas ----------
// Quatro camadas: céu em degradê (cores mudam com a hora), paisagem da estação,
// luzes da noite somadas por cima e chuva. Materiais e céu são de todas as janelas;
// o mundo só troca cores, texturas e opacidades.
let windowSet = null
export function windowMaterials() {
  if (windowSet) return windowSet
  const skyGeo = new THREE.PlaneGeometry(1, 1)
  skyGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(12).fill(1), 3))
  const rain = rainTexture()
  rain.repeat.set(VIEW_SPAN, 1)
  windowSet = {
    skyGeo,
    sky: new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
    view: new THREE.MeshBasicMaterial({ map: windowScenery(), transparent: true, toneMapped: false }),
    night: new THREE.MeshBasicMaterial({ map: windowNight(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
    rain: new THREE.MeshBasicMaterial({ map: rain, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }),
  }
  return windowSet
}

// Plano com u contado em metros ao longo da parede: janelas vizinhas emendam a mesma vista.
const viewGeo = (width, offset) => geo(`janela|${width}|${offset.toFixed(2)}`, () => {
  const geometry = new THREE.PlaneGeometry(width, .9)
  const uv = geometry.attributes.uv
  const pos = geometry.attributes.position
  for (let i = 0; i < uv.count; i += 1) uv.setX(i, (offset + pos.getX(i)) / VIEW_SPAN)
  return geometry
})

export function windowFrame(width = 1.3, offset = 0) {
  const group = new THREE.Group()
  const frame = mat('#ffffff', { rough: .5 })
  const w = windowMaterials()
  const layers = live(new THREE.Group())
  layers.position.set(0, 1.45, 0)
  group.add(layers)
  const sky = new THREE.Mesh(w.skyGeo, w.sky)
  sky.scale.set(width, .9, 1)
  sky.position.z = .012
  const geometry = viewGeo(width, offset)
  const view = new THREE.Mesh(geometry, w.view)
  view.position.z = .016
  view.renderOrder = 1
  const night = new THREE.Mesh(geometry, w.night)
  night.position.z = .02
  night.renderOrder = 2
  const rain = new THREE.Mesh(geometry, w.rain)
  rain.position.z = .024
  rain.renderOrder = 3
  layers.add(sky, view, night, rain)
  B(group, width + .1, .07, .08, frame, 0, 1.92, .03)
  B(group, width + .14, .05, .16, frame, 0, .985, .06)
  B(group, .06, .9, .06, frame, -width / 2, 1.45, .03)
  B(group, .06, .9, .06, frame, width / 2, 1.45, .03)
  B(group, .04, .9, .04, frame, 0, 1.45, .035)
  B(group, width, .03, .03, frame, 0, 1.6, .035)
  return { group, w: width, d: .1, wall: true, block: [], spots: [{ x: 0, z: .55, face: Math.PI, action: 'look' }], window: true }
}

export function door() {
  const group = new THREE.Group()
  B(group, .86, 1.75, .06, mat('#a26b4d', { rough: .6 }), 0, .875, .02)
  B(group, .96, .07, .08, mat('#ffffff'), 0, 1.78, .03)
  S(group, .035, mat('#ffd166', { metal: .6, rough: .3 }), .32, .85, .08)
  return { group, w: .9, d: .1, wall: true, block: [], spots: [{ x: 0, z: .45, face: 0, action: 'door' }] }
}

export function garageDoor(width = 2.8) {
  const group = new THREE.Group()
  for (let i = 0; i < 7; i += 1) B(group, width, .24, .05, mat(i % 2 ? '#c9ced6' : '#b8bec8', { rough: .5 }), 0, .14 + i * .25, .02)
  B(group, width + .14, .08, .09, mat('#7d8590'), 0, 1.86, .03)
  return { group, w: width, d: .1, wall: true, block: [], spots: [] }
}

export function toolShelf() {
  const group = new THREE.Group()
  const metal = mat('#7d8590', { rough: .4, metal: .3 })
  for (const y of [.3, .75, 1.2]) B(group, 1.1, .04, .38, metal, 0, y, 0)
  for (const x of [-.53, .53]) B(group, .04, 1.3, .38, metal, x, .65, 0)
  const boxes = ['#c08552', '#d4a373', '#e9c46a', '#264653']
  for (let i = 0; i < 6; i += 1) B(group, .26, .2, .28, mat(boxes[i % 4]), -.35 + (i % 3) * .35, .42 + Math.floor(i / 3) * .45, 0)
  return { group, w: 1.1, d: .4, block: [{ x: 0, z: 0, w: 1.1, d: .4 }], spots: [] }
}

export function tires() {
  const group = new THREE.Group()
  for (let i = 0; i < 3; i += 1) group.add(part(torusGeo(.22, .09, 8, 16), mat('#222', { rough: .9 }), 0, .09 + i * .18, 0, { rx: Math.PI / 2 }))
  return { group, w: .6, d: .6, block: [{ x: 0, z: 0, w: .6, d: .6 }], spots: [] }
}

export function lamp() {
  const group = new THREE.Group()
  C(group, .14, .16, .04, mat('#333'), 0, .02, 0)
  C(group, .015, .015, 1.4, mat('#333'), 0, .72, 0, { seg: 6 })
  const shade = part(geo('abajur', () => new THREE.CylinderGeometry(.12, .2, .22, 14)), mat('#fff3d6', { emissive: '#ffd27a', emissiveIntensity: .4 }), 0, 1.45, 0)
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
  arcade: () => arcade(0),
  foosball,
  aquarium,
  neon: null,
}

export const WALL_DECOR = new Set(['whiteboard', 'trophyshelf', 'neon'])
export const TALL_DECOR = new Set(['arcade', 'fridge', 'coffee', 'aquarium'])
