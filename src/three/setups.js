import * as THREE from 'three'
import { B, C, S, R, P, mat, basic, part, planeGeo, boxGeo, cylGeo, sphereGeo, wedgeGeo, crtBackGeo, curvedGeo, tubeGeo, torusGeo, coneGeo, icoGeo, rod, live, seeded, eraIndex } from './kit.js'
import { glowTexture, keyboardTexture, paperTexture, pianoTexture, pizzaTexture, tabletTexture } from './textures.js'
import { liveScreen, styleOf } from './screens.js'

// Estações de trabalho por época. Cada mesa monta tampo, cadeira, o computador
// da era, bagunça própria (sempre a mesma para o mesmo índice) e devolve as
// telas vivas para o mundo trocar o programa conforme quem senta.
// Coordenadas locais da mesa: tampo em y = T, frente (lado da cadeira) em +z.

const T = .5
export const SEAT = .3
const TAU = Math.PI * 2
const pick = (r, list) => list[Math.floor(r() * list.length)]

const INK = '#1d1a24'
const ink = () => mat(INK, { rough: .6 })
const metal = () => mat('#c0c4c8', { rough: .3, metal: .6 })
const steel = () => mat('#2e3036', { rough: .4, metal: .4 })
const led = color => mat(color, { emissive: color, emissiveIntensity: 1.4 })

// Peças de vidro/brilho podem entrar no cozimento mesmo sendo transparentes.
const glassy = mesh => {
  mesh.userData.glass = true
  mesh.castShadow = false
  return mesh
}

// ---------- materiais animados compartilhados (RGB, luz das telas, luminárias) ----------
let fx = null
function FX() {
  if (fx) return fx
  const glow = glowTexture()
  fx = {
    rgb: [0, 1, 2].map(() => new THREE.MeshStandardMaterial({ color: '#111111', emissive: '#ff00ff', emissiveIntensity: 1.6, roughness: .4 })),
    keys: new THREE.MeshStandardMaterial({ map: keyboardTexture('rgb'), emissive: '#ff00ff', emissiveMap: keyboardTexture('rgb', true), emissiveIntensity: 1.6, roughness: .5 }),
    pastel: new THREE.MeshStandardMaterial({ map: keyboardTexture('pastel'), emissive: '#ff9fdf', emissiveMap: keyboardTexture('pastel', true), emissiveIntensity: .7, roughness: .5 }),
    under: new THREE.MeshBasicMaterial({ map: glow, color: '#ff00ff', transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
    pool: new THREE.MeshBasicMaterial({ map: glow, color: '#9fd8ff', transparent: true, opacity: .05, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
    lamp: new THREE.MeshStandardMaterial({ color: '#fff6e0', emissive: '#ffd79a', emissiveIntensity: .5, roughness: .4 }),
    holo: new THREE.MeshBasicMaterial({ color: '#59e3ff', toneMapped: false }),
    holoGlass: new THREE.MeshBasicMaterial({ color: '#2fb8d8', transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }),
    glass: new THREE.MeshStandardMaterial({ color: '#bff6ff', map: keyboardTexture('glass'), emissive: '#59e3ff', emissiveMap: keyboardTexture('glass'), emissiveIntensity: 1.3, transparent: true, opacity: .6, roughness: .1, depthWrite: false }),
  }
  return fx
}

// Cor das poças de luz que os monitores fazem na mesa, por era.
const POOL = ['#c6c2ff', '#bfe0ff', '#cfe6ff', '#cfe0ff', '#d8ecff', '#d7c8ff', '#c8f2ff', '#7ff0ff']

// Gira o RGB, acende luminárias e as poças de luz das telas à noite.
export function tickSetups(time, night) {
  if (!fx) return
  const hue = time * .07
  fx.rgb.forEach((material, i) => material.emissive.setHSL((hue + i / 3) % 1, 1, .55))
  fx.keys.emissive.setHSL(hue % 1, 1, .6)
  fx.under.color.setHSL((hue + .5) % 1, 1, .5)
  fx.pastel.emissive.setHSL((time * .05 + .8) % 1, .8, .7)
  fx.pool.opacity = .05 + .45 * night
  fx.lamp.emissiveIntensity = .5 + 1.6 * night
}

// ---------- peças ----------
// Caixa arredondada pousada em y0 (padrão: tampo da mesa).
const rb = (g, w, h, d, r, material, x, z, y0 = T, bevel = .005) => R(g, w, h, d, r, material, x, y0 + bevel, z, { bevel })

// Tela viva: material próprio por mesa, textura compartilhada por (era, programa).
function screen(c, parent, w, h, x, y, z, o = {}) {
  const material = new THREE.MeshBasicMaterial({ map: liveScreen('idle', c.style, c.variant), color: '#6b6b6b', toneMapped: false, side: o.side ?? THREE.FrontSide })
  if (o.holo) {
    material.transparent = true
    material.blending = THREE.AdditiveBlending
    material.depthWrite = false
  }
  const mesh = new THREE.Mesh(o.geometry ?? planeGeo(w, h), material)
  mesh.position.set(x, y, z)
  if (o.ry) mesh.rotation.y = o.ry
  live(mesh)
  parent.add(mesh)
  c.screens.push({ mesh, material, slot: o.slot ?? 'main' })
  return mesh
}

// Monitor de tubo: moldura arredondada, traseira em tronco de pirâmide, tela 4:3.
// y = base do monitor; z = face da frente.
function crt(c, { x, y, z, w, h, depth, color, sw, sh, sy = .01 }) {
  const g = c.g
  const shell = mat(color, { rough: .5 })
  R(g, w, h, .05, .03, shell, x, y + .02, z - .045)
  g.add(part(crtBackGeo(h * .9, h * .5, depth), shell, x, y + .02 + h / 2, z - .07, { sx: w / h }))
  const cy = y + .02 + h / 2 + sy
  B(g, sw + .03, sh + .03, .01, mat('#18191d', { rough: .3 }), x, cy, z + .002)
  screen(c, g, sw, sh, x, cy, z + .0085)
  c.notes.push({ parent: g, x: x - w / 2 + .035, y: y + h - .005, z: z + .004 }, { parent: g, x: x + w / 2 - .035, y: y + h - .005, z: z + .004 }, { parent: g, x: x + w / 2 - .04, y: y + .07, z: z + .004 })
}

// Monitor de tela plana num grupo próprio (para girar). y = altura da base do painel.
function lcd(c, { x, z, y, w, h, bezel, chin = 0, color, ry = 0, stand = 'neck', slot = 'main', thick = .024 }) {
  const p = new THREE.Group()
  p.position.set(x, T, z)
  p.rotation.y = ry
  c.g.add(p)
  const shell = mat(color, { rough: .35 })
  B(p, w, h, thick, shell, 0, y + h / 2, 0)
  screen(c, p, w - bezel * 2, h - bezel * 2 - chin, 0, y + h / 2 + chin / 2, thick / 2 + .001, { slot })
  if (stand === 'neck') {
    B(p, .05, y + h * .35, .022, shell, 0, (y + h * .35) / 2, -thick / 2 - .012)
    rb(p, .22, .01, .15, .04, shell, 0, -.03, 0)
  } else if (stand === 'oval') {
    B(p, .045, y + h * .3, .03, shell, 0, (y + h * .3) / 2, -thick / 2 - .016)
    p.add(part(boxGeo(.3, .2, .05), mat('#2a2b30', { rough: .5 }), 0, y + h * .5, -thick / 2 - .025, { sx: .9, sy: .9 }))
    C(p, .11, .12, .014, shell, 0, .007, -.03, { sz: .7, seg: 18 })
  }
  c.notes.push({ parent: p, x: -w / 2 + .025, y: y + h - .015, z: thick / 2 + .003 }, { parent: p, x: w / 2 - .025, y: y + h - .02, z: thick / 2 + .003 })
  return p
}

// Teclado em cunha (fundo mais alto), com as teclas desenhadas numa textura.
function keyboard(c, style, x, z, { w = .42, d = .14, back = .03, front = .016, body = '#d3c7aa', keys } = {}) {
  const g = c.g
  g.add(part(wedgeGeo(w, d, back, front), mat(body, { rough: .55 }), x, T, z))
  const slope = Math.atan2(back - front, d)
  const material = keys ?? mat('#ffffff', { map: keyboardTexture(style), rough: .55 })
  g.add(part(planeGeo(w * .95, d * .86 / Math.cos(slope)), material, x, T + (back + front) / 2 + .0015, z, { rx: -Math.PI / 2 + slope, cast: false }))
}

function mouse(c, kind, x, z, color) {
  const g = c.g
  if (kind === 'box') {
    rb(g, .042, .016, .066, .012, mat(color, { rough: .5 }), x, z)
    B(g, .002, .004, .026, ink(), x, T + .026, z - .018, { cast: false })
  } else if (kind === 'glass') {
    g.add(glassy(part(boxGeo(.1, .004, .08), FX().glass, x, T + .003, z)))
  } else {
    const gaming = kind === 'gaming'
    S(g, .03, mat(color, { rough: .45 }), x, T, z, { sx: gaming ? .8 : .72, sy: gaming ? .5 : .42, sz: gaming ? 1.3 : 1.15, ws: 12, hs: 8 })
    B(g, .002, .004, .024, ink(), x, T + (gaming ? .015 : .013), z - .016, { cast: false })
    if (gaming) B(g, .005, .003, .026, FX().rgb[c.index % 3], x, T + .016, z + .01, { cast: false })
    if (kind === 'optical') B(g, .014, .003, .01, led('#ff2d2d'), x, T + .002, z + .034, { cast: false })
  }
}

// Fio com forma fixa (cacheado pela chave): a mesma curva serve para todas as mesas da era.
const cable = (g, key, points, material = ink(), radius = .004) => g.add(part(tubeGeo(key, points, radius, 20), material, 0, 0, 0, { cast: false }))

// Gabinete no chão, embaixo do lado direito da mesa. Frente em +z.
function floorTower(c, { color, front, w = .16, h = .4, d = .4, x = .33, z = -.05 }) {
  const g = c.g
  B(g, w, h, d, mat(color, { rough: .5 }), x, h / 2, z)
  const fz = z + d / 2
  if (front) B(g, w - .012, h - .02, .006, mat(front, { rough: .4, metal: .15 }), x, h / 2, fz + .003)
  return fz + .007
}

// ---------- tampos e pés por escritório ----------
const DESKS = [
  { top: '#c8996b', edge: '#b5835a', leg: '#a77a52' },
  { top: '#d9b48f', edge: '#c49a6c', leg: '#9b6b43' },
  { top: '#e3ddd0', edge: '#bdb5a5', leg: '#9a9488' },
  { top: '#f4f3ef', edge: '#d8d6d0', leg: '#8d939c' },
  { top: '#c9a27a', edge: '#a8835e', leg: '#26282e' },
  { top: '#f7f7f5', edge: '#2d2f36', leg: '#26282e' },
]
const FELT = ['#5b8c85', '#d36b5e', '#6c7bd1', '#e0a43a', '#8a6cc4']

function deskFrame(g, level, future, r) {
  const s = DESKS[Math.min(level, DESKS.length - 1)]
  const legH = T - .045
  if (future) {
    R(g, 1.08, .025, .62, .06, mat('#f4f6fb', { rough: .2 }), 0, T - .035, 0, { bevel: .01 })
    B(g, 1.02, .008, .01, FX().holo, 0, T - .028, .312, { cast: false })
    C(g, .06, .09, legH, mat('#dfe4ee', { rough: .25, metal: .3 }), 0, legH / 2, -.1, { seg: 16 })
    C(g, .22, .25, .02, mat('#dfe4ee', { rough: .25, metal: .3 }), 0, .01, -.1, { seg: 20 })
    return
  }
  const top = mat(s.top, { rough: .55 })
  const edge = mat(s.edge, { rough: .6 })
  const leg = mat(s.leg, { rough: .5, metal: level >= 3 ? .35 : 0 })
  R(g, 1.08, .025, .62, .03, top, 0, T - .035, 0, { bevel: .01 })
  if (level === 0) {
    for (const [x, z] of [[-.49, -.26], [.49, -.26], [-.49, .26], [.49, .26]]) B(g, .045, legH, .045, leg, x, legH / 2, z)
    B(g, .3, .07, .52, edge, -.3, T - .08, 0)
    S(g, .012, mat('#e9c46a', { metal: .6, rough: .3 }), -.3, T - .08, .265, { ws: 8, hs: 6 })
  } else if (level === 1) {
    // porta velha em cima de dois cavaletes
    B(g, 1.08, .012, .62, edge, 0, T - .05, 0, { cast: false })
    for (const x of [-.47, .47]) {
      B(g, .05, .05, .5, leg, x, T - .07, 0)
      for (const z of [-.18, .18]) for (const dx of [-.04, .04]) rod(g, [x, T - .09, z], [x + dx, 0, z * 1.45], .015, leg)
    }
  } else if (level === 2) {
    B(g, .32, legH, .56, edge, -.36, legH / 2, 0)
    for (let i = 0; i < 3; i += 1) {
      B(g, .29, .12, .01, top, -.36, .08 + i * .135, .283)
      B(g, .08, .012, .012, metal(), -.36, .11 + i * .135, .292)
    }
    B(g, .03, legH, .56, edge, .505, legH / 2, 0)
    B(g, .78, .2, .015, edge, .07, T - .16, -.27)
  } else {
    for (const x of [-.5, .5]) {
      for (const z of [-.25, .25]) B(g, .035, legH, .035, leg, x, legH / 2, z)
      B(g, .04, .02, .56, leg, x, .01, 0)
      B(g, .035, .035, .56, leg, x, T - .06, 0)
    }
    B(g, .94, .16, .012, level === 3 ? mat('#aab0b8', { rough: .5, metal: .3 }) : leg, 0, T - .14, -.26)
    if (level >= 4) B(g, .8, .03, .1, steel(), 0, T - .1, -.2)
    B(g, 1.08, .26, .025, mat(FELT[(level + Math.floor(r() * 2)) % FELT.length], { rough: 1 }), 0, T + .13, -.322)
  }
}

// ---------- cadeiras ----------
export function chairKind(level, era, index = 0) {
  if (era >= 7) return 'future'
  if (era >= 5) return level >= 3 && era === 6 && index % 3 === 0 ? 'office' : 'gamer'
  if (level >= 4) return 'exec'
  if (level <= 1) return era <= 2 ? 'stool' : 'office'
  return 'office'
}

const GAMER = ['#e63946', '#3a86ff', '#ff6bd6', '#52d977', '#ffd23f', '#9b5de5']
const OFFICE = ['#3d5a80', '#2b2d42', '#6b4f3a', '#4f6d5a', '#7b3f61']

function starBase(g, legMat) {
  for (let k = 0; k < 5; k += 1) {
    const a = k * TAU / 5 + .3
    g.add(part(boxGeo(.035, .022, .19), legMat, Math.sin(a) * .095, .045, Math.cos(a) * .095, { ry: a }))
    S(g, .02, ink(), Math.sin(a) * .19, .02, Math.cos(a) * .19, { ws: 8, hs: 6 })
  }
  C(g, .035, .035, .03, legMat, 0, .05, 0, { seg: 10 })
  C(g, .02, .02, .17, metal(), 0, .14, 0, { seg: 8 })
}

// Assento com o topo em SEAT; o encosto fica em +z (atrás de quem senta).
export function chair(g, kind, index = 0, level = 2) {
  if (kind === 'stool') {
    const wood = mat('#a77a52', { rough: .6 })
    C(g, .16, .16, .05, mat('#d9534f', { rough: .9 }), 0, SEAT - .025, 0, { seg: 16 })
    C(g, .165, .165, .02, wood, 0, SEAT - .06, 0, { seg: 16 })
    for (let k = 0; k < 3; k += 1) {
      const a = k * TAU / 3 + .5
      rod(g, [Math.sin(a) * .11, SEAT - .07, Math.cos(a) * .11], [Math.sin(a) * .17, 0, Math.cos(a) * .17], .014, wood)
    }
    g.add(part(torusGeo(.135, .008, 4, 18), wood, 0, .1, 0, { rx: Math.PI / 2 }))
    return
  }
  if (kind === 'future') {
    const shell = mat('#f2f4fa', { rough: .25 })
    C(g, .18, .2, .02, shell, 0, .01, 0, { seg: 20 })
    C(g, .03, .03, .2, metal(), 0, .12, 0, { seg: 10 })
    rb(g, .4, .045, .4, .12, shell, 0, 0, SEAT - .065, .01)
    const back = part(boxGeo(.4, .48, .05), shell, 0, SEAT + .27, .26, { rx: .22 })
    g.add(back)
    for (const x of [-.12, .12]) g.add(part(boxGeo(.02, .4, .004), FX().holo, x, SEAT + .27, .232, { rx: .22, cast: false }))
    return
  }
  const gamer = kind === 'gamer'
  const exec = kind === 'exec'
  const color = gamer ? '#1b1b1f' : exec ? '#2b2423' : OFFICE[index % OFFICE.length]
  const cushion = mat(color, { rough: exec ? .45 : .9 })
  const accent = mat(GAMER[index % GAMER.length], { rough: .8 })
  starBase(g, gamer || exec ? steel() : mat('#3a3c44', { rough: .5 }))
  rb(g, .38, .045, .37, .07, cushion, 0, 0, SEAT - .075, .015)
  if (gamer) {
    for (const x of [-.18, .18]) B(g, .05, .05, .34, accent, x, SEAT + .005, 0)
    // encosto inclinado para trás: alto sem encostar no cabelo
    const back = new THREE.Group()
    back.position.set(0, SEAT + .02, .23)
    back.rotation.x = .26
    g.add(back)
    rb(back, .36, .52, .07, .05, cushion, 0, .02, 0, .01)
    for (const x of [-.19, .19]) back.add(part(boxGeo(.06, .44, .09), accent, x, .25, .01, { ry: x > 0 ? -.35 : .35 }))
    rb(back, .16, .07, .05, .02, accent, 0, -.03, .5, .01)
    for (const x of [-.07, .07]) B(back, .045, .4, .004, accent, x, .26, -.027, { cast: false })
  } else {
    B(g, .035, .2, .025, mat('#3a3c44'), 0, SEAT + .05, .23)
    const back = new THREE.Group()
    back.position.set(0, SEAT + .06, .23)
    back.rotation.x = exec ? .18 : .08
    g.add(back)
    rb(back, .36, exec ? .44 : .26, exec ? .08 : .05, .05, cushion, 0, 0, 0, .012)
  }
  if (gamer || exec || level >= 3) {
    for (const x of [-.26, .26]) {
      B(g, .025, .1, .025, steel(), x, SEAT + .05, .05)
      B(g, .045, .02, .2, mat(gamer ? '#1b1b1f' : '#2e3036'), x, SEAT + .11, .02)
    }
  }
}

// ---------- computadores por época ----------
// 1980-84: micro de 8 bits com teclado embutido, TV pequena, drive ou gravador e joystick.
function home8(c) {
  const { g, r } = c
  const brown = r() < .5
  const wood = mat('#6e4a2e', { rough: .6 })
  R(g, .4, .28, .28, .04, wood, -.06, T + .02, -.14)
  B(g, .38, .26, .01, mat('#c9c3b6', { rough: .4, metal: .2 }), -.06, T + .16, .025)
  B(g, .27, .21, .006, mat('#15161a', { rough: .3 }), -.1, T + .165, .031)
  screen(c, g, .24, .18, -.1, T + .165, .035)
  for (const y of [.23, .16]) C(g, .018, .018, .02, ink(), .1, T + y, .04, { rx: Math.PI / 2, seg: 10 })
  for (let i = 0; i < 3; i += 1) B(g, .05, .005, .004, ink(), .1, T + .06 + i * .016, .031, { cast: false })
  C(g, .03, .035, .02, ink(), -.06, T + .35, -.16, { seg: 10 })
  rod(g, [-.06, T + .35, -.16], [-.2, T + .54, -.21], .004, metal())
  rod(g, [-.06, T + .35, -.16], [.07, T + .56, -.12], .004, metal())
  c.notes.push({ parent: g, x: .11, y: T + .275, z: .031 }, { parent: g, x: -.22, y: T + .275, z: .036 })

  const shell = mat(brown ? '#9c8b70' : '#d8cbaa', { rough: .55 })
  g.add(part(wedgeGeo(.44, .17, .065, .032), shell, -.04, T, .18))
  const slope = Math.atan2(.033, .17)
  g.add(part(planeGeo(.36, .115 / Math.cos(slope)), mat('#ffffff', { map: keyboardTexture(brown ? 'c64' : 'beige8'), rough: .55 }), -.06, T + .046, .2, { rx: -Math.PI / 2 + slope, cast: false }))
  B(g, .012, .004, .006, led('#ff3b30'), .14, T + .059, .135, { cast: false })
  B(g, .07, .002, .012, mat('#3a3a3a'), .07, T + .059, .125, { cast: false })

  if (r() < .55) {
    // drive de disquete 5,25"
    B(g, .15, .07, .22, shell, .36, T + .035, -.14)
    B(g, .1, .006, .004, ink(), .36, T + .045, -.028, { cast: false })
    B(g, .012, .006, .004, led('#ff3b30'), .42, T + .018, -.028, { cast: false })
    B(g, .025, .02, .006, mat(brown ? '#7a6a50' : '#b8aa88'), .31, T + .045, -.028)
  } else {
    // gravador de fita
    B(g, .16, .045, .11, mat('#2b2b30', { rough: .5 }), .36, T + .0225, -.12)
    B(g, .1, .012, .05, mat('#4a4b55', { rough: .2 }), .36, T + .047, -.135)
    for (let i = 0; i < 5; i += 1) B(g, .022, .012, .022, mat('#d6d6d6'), .3 + i * .03, T + .051, -.085)
  }
  B(g, .08, .03, .08, ink(), .38, T + .015, .16)
  rod(g, [.38, T + .03, .17], [.388, T + .1, .152], .007, ink())
  S(g, .017, mat('#d62828', { rough: .4 }), .388, T + .105, .151, { ws: 8, hs: 6 })
  C(g, .012, .012, .01, mat('#d62828'), .355, T + .033, .135, { seg: 8 })
  cable(g, 'joy80', [[.36, T + .012, .125], [.3, T + .004, .1], [.24, T + .004, .14], [.19, T + .02, .17]])
  cable(g, 'tv80', [[-.2, T + .02, .1], [-.28, T + .004, .08], [-.36, T + .004, -.04], [-.3, T + .03, -.27]])
  c.slots.push([-.43, -.17], [-.43, .02], [.25, .045])
}

// 1985-93: gabinete deitado sob o monitor, teclado bege, mouse de dois botões e disquetes.
function desktop85(c) {
  const { g, r } = c
  const beige = mat('#e2d6bb', { rough: .5 })
  const beige2 = mat('#cfc2a3', { rough: .5 })
  B(g, .46, .1, .34, beige, -.03, T + .05, -.12)
  B(g, .17, .04, .006, beige2, .08, T + .055, .053)
  B(g, .13, .006, .004, ink(), .08, T + .057, .057, { cast: false })
  B(g, .1, .025, .006, beige2, -.12, T + .045, .053)
  B(g, .07, .004, .004, ink(), -.12, T + .045, .057, { cast: false })
  B(g, .012, .008, .004, led('#34d058'), -.22, T + .025, .055, { cast: false })
  B(g, .04, .012, .004, mat('#8a8070'), -.2, T + .075, .055, { cast: false })
  C(g, .1, .12, .015, beige2, -.03, T + .1075, -.09, { seg: 16 })
  crt(c, { x: -.03, y: T + .115, z: .02, w: .36, h: .28, depth: .2, color: '#e6dcc4', sw: .27, sh: .2 })
  keyboard(c, 'beige', -.04, .2, { w: .44, d: .13, back: .032, front: .018, body: '#d3c7aa' })
  cable(g, 'kb85', [[-.2, T + .02, .135], [-.24, T + .006, .11], [-.2, T + .008, .08], [-.18, T + .03, .055]], mat('#bdb197'))
  const pad = pick(r, ['#3d5a80', '#9d2b2b', '#5a5a64', '#2a6f4e'])
  P(g, .15, .13, mat(pad, { rough: 1 }), .36, T + .0015, .17)
  mouse(c, 'box', .36, .175, '#e2d6bb')
  cable(g, 'mouse85', [[.36, T + .012, .14], [.35, T + .005, .08], [.26, T + .005, .07], [.2, T + .03, .03]], mat('#bdb197'))
  if (r() < .5) {
    B(g, .1, .07, .12, mat('#3b3d45', { rough: .3 }), -.43, T + .035, -.15)
    for (let i = 0; i < 4; i += 1) B(g, .09, .06, .004, mat(pick(r, ['#1d1a24', '#3fb8ff', '#ff5d3a', '#ffd23f'])), -.43, T + .08, -.19 + i * .025)
  } else {
    for (let i = 0; i < 3; i += 1) {
      g.add(part(boxGeo(.05, .004, .05), mat(pick(r, ['#1d1a24', '#3fb8ff', '#ff5d3a', '#ffd23f', '#52d977'])), -.43 + i * .012, T + .002 + i * .004, -.16 + i * .02, { ry: (r() - .5) * .8 }))
    }
  }
  c.slots.push([.42, -.13], [.43, .03], [-.43, .03])
}

// 1994-2002: torre bege no chão, monitor de tubo grandão, caixinhas de som, mouse de bolinha e CDs.
function tower95(c) {
  const { g, r } = c
  const beige = mat('#e4d9c0', { rough: .5 })
  const beige2 = mat('#d2c6aa', { rough: .5 })
  const fz = floorTower(c, { color: '#e4d9c0' })
  B(g, .13, .035, .006, beige2, .33, .35, fz - .004)
  B(g, .1, .004, .004, mat('#b8ab8e'), .33, .345, fz, { cast: false })
  B(g, .12, .022, .006, beige2, .33, .29, fz - .004)
  B(g, .09, .005, .004, ink(), .33, .29, fz, { cast: false })
  C(g, .014, .014, .01, beige2, .33, .12, fz, { rx: Math.PI / 2, seg: 10 })
  B(g, .01, .006, .004, led('#34d058'), .38, .16, fz, { cast: false })
  B(g, .01, .006, .004, led('#ff9f1c'), .38, .18, fz, { cast: false })
  C(g, .12, .14, .02, beige2, -.06, T + .01, -.12, { seg: 16 })
  crt(c, { x: -.06, y: T + .02, z: .04, w: .44, h: .34, depth: .26, color: '#e8dfc9', sw: .34, sh: .255 })
  for (const [x, z] of [[-.4, -.1], [.25, -.12]]) {
    B(g, .075, .13, .08, beige, x, T + .065, z)
    C(g, .026, .026, .004, mat('#3d3a35'), x, T + .07, z + .041, { rx: Math.PI / 2, seg: 12 })
    C(g, .01, .01, .004, mat('#3d3a35'), x, T + .108, z + .041, { rx: Math.PI / 2, seg: 8 })
  }
  keyboard(c, 'beige', -.06, .2, { w: .44, d: .14, back: .03, front: .017, body: '#d6caae' })
  const pad = pick(r, ['#2b4c7e', '#7a2e8e', '#1f6f5c', '#3a3a44'])
  P(g, .16, .14, mat(pad, { rough: 1 }), .34, T + .0015, .18)
  P(g, .07, .05, mat(pick(r, ['#ffd23f', '#ff6bd6', '#3fb8ff']), { rough: 1 }), .37, T + .002, .14)
  mouse(c, 'ball', .33, .19, '#e9dfc6')
  cable(g, 'mouse95', [[.33, T + .01, .155], [.31, T + .005, .1], [.22, T + .005, .08], [.19, T + .02, .0]], mat('#c9bea2'))
  for (let i = 0; i < 3; i += 1) {
    g.add(part(boxGeo(.075, .009, .07), mat('#2a2c34', { rough: .2 }), -.43, T + .0045 + i * .009, .035, { ry: (r() - .5) * .5 }))
  }
  P(g, .06, .06, mat(pick(r, ['#ff5d3a', '#3fb8ff', '#52d977', '#b57bff'])), -.43, T + .0285, .035, { rz: (r() - .5) * .3 })
  if (r() < .45) {
    rb(g, .09, .025, .13, .02, mat('#3f63b5', { rough: .4 }), .43, -.16)
    c.slots.push([.44, .02], [-.43, -.23])
  } else c.slots.push([.43, -.17], [.44, .02], [-.43, -.23])
}

// 2003-07: torre preta e prata, LCD 4:3, teclado preto, mouse óptico e headset.
function xp2003(c) {
  const { g, r } = c
  const fz = floorTower(c, { color: '#1f2026', front: '#b9bec6', h: .42, d: .42, z: -.06 })
  for (const y of [.36, .32]) B(g, .13, .03, .004, mat('#9aa0a8', { rough: .3, metal: .3 }), .33, y, fz, { cast: false })
  C(g, .013, .013, .006, led('#3f8bff'), .33, .12, fz, { rx: Math.PI / 2, seg: 10 })
  const silver = r() < .5
  lcd(c, { x: -.04, z: -.12, y: .1, w: .42, h: .33, bezel: .022, chin: .012, color: silver ? '#c3c7cd' : '#1e1f24', stand: 'oval' })
  keyboard(c, 'black', -.05, .2, { w: .45, d: .15, back: .026, front: .016, body: '#1d1e22' })
  P(g, .17, .14, mat('#1d1e24', { rough: 1 }), .35, T + .0015, .18)
  mouse(c, 'optical', .35, .18, silver ? '#b9bec6' : '#2a2b31')
  cable(g, 'mouse03', [[.35, T + .01, .145], [.33, T + .005, .08], [.22, T + .005, .05], [.12, T + .005, -.1], [.2, T + .02, -.3]])
  // headset em pé sobre a mesa
  const hx = -.41
  const hz = -.17
  for (const s of [-1, 1]) C(g, .035, .035, .024, mat('#2a2b31', { rough: .7 }), hx + s * .062, T + .036, hz, { rz: Math.PI / 2, seg: 12 })
  g.add(part(torusGeo(.062, .008, 5, 14, Math.PI), mat('#3a3c44', { rough: .5 }), hx, T + .036, hz))
  rod(g, [hx - .07, T + .03, hz], [hx - .06, T + .02, hz + .1], .004, mat('#3a3c44'))
  c.slots.push([.43, -.17], [.22, -.03], [-.43, .03])
}

// 2008-13: LCD widescreen com webcam, teclado fino de alumínio; algumas mesas só com notebook.
function app2010(c) {
  const { g, r } = c
  const alu = mat('#cfd3d8', { rough: .3, metal: .5 })
  if (c.index % 3 === 1) {
    rb(g, .38, .016, .26, .012, alu, -.02, .03, T, .004)
    g.add(part(planeGeo(.33, .1), mat('#ffffff', { map: keyboardTexture('alu'), rough: .5 }), -.02, T + .0245, -.005, { rx: -Math.PI / 2, cast: false }))
    P(g, .11, .07, mat('#c2c6cc', { rough: .4 }), -.02, T + .0245, .1)
    const lid = new THREE.Group()
    lid.position.set(-.02, T + .022, -.098)
    lid.rotation.x = -.26
    g.add(lid)
    B(lid, .38, .25, .008, alu, 0, .125, 0)
    B(lid, .35, .215, .002, mat('#121316', { rough: .2 }), 0, .13, .005)
    screen(c, lid, .33, .2, 0, .13, .0065)
    c.notes.push({ parent: lid, x: .16, y: .235, z: .007 })
    c.slots.push([.43, -.16], [-.42, -.14], [.25, -.12])
  } else {
    lcd(c, { x: -.03, z: -.15, y: .13, w: .6, h: .36, bezel: .02, chin: .016, color: '#141519', stand: 'neck' })
    rb(g, .07, .024, .035, .012, ink(), -.03, -.15, T + .13 + .36)
    C(g, .009, .009, .004, mat('#2a4d8f', { rough: .1 }), -.03, T + .13 + .372, -.131, { rx: Math.PI / 2, seg: 10 })
    keyboard(c, 'alu', -.04, .2, { w: .4, d: .12, back: .012, front: .008, body: '#cfd3d8' })
    const fz = floorTower(c, { color: '#1b1c20', h: .36, d: .36, w: .15 })
    B(g, .004, .3, .004, mat('#9aa0a8', { metal: .5, rough: .3 }), .3, .18, fz, { cast: false })
    C(g, .01, .01, .006, led('#3f8bff'), .36, .3, fz, { rx: Math.PI / 2, seg: 8 })
    c.slots.push([.43, -.16], [.22, -.03], [-.43, -.12])
  }
  if (r() < .6) P(g, .17, .14, mat(pick(r, ['#2d3047', '#3a3a44', '#5a2a3a']), { rough: 1 }), .34, T + .0015, .19)
  mouse(c, 'optical', .34, .19, '#f2f2f2')
}

// Braço de microfone preso na borda esquerda, com o microfone apontando para a boca.
function micArm(g) {
  const arm = steel()
  B(g, .03, .04, .05, arm, -.525, T + .02, -.02)
  rod(g, [-.52, T + .04, -.02], [-.5, T + .34, .0], .007, arm)
  rod(g, [-.5, T + .34, .0], [-.36, T + .33, .13], .007, arm)
  rod(g, [-.36, T + .33, .13], [-.34, T + .26, .16], .025, ink(), 12)
  S(g, .026, mat('#5c5f68', { rough: .3, metal: .5 }), -.335, T + .25, .165, { ws: 10, hs: 8 })
}

// Ventoinhas RGB na frente do gabinete de vidro.
function rgbTower(c, color) {
  const g = c.g
  const fz = floorTower(c, { color, front: color === '#121317' ? '#1d1e24' : '#f4f5f8', w: .18, h: .42, d: .4 })
  for (const [y, k] of [[.3, 0], [.16, 1]]) {
    g.add(part(torusGeo(.05, .007, 4, 18), FX().rgb[(c.index + k) % 3], .33, y, fz, { cast: false }))
    C(g, .015, .015, .006, mat('#2a2b30'), .33, y, fz, { rx: Math.PI / 2, seg: 10 })
  }
}

// Tapete de mesa grandão com borda colorida.
function deskMat(c, color, border, w = .96) {
  P(c.g, w, .27, mat(border, { rough: 1 }), 0, T + .0012, .17)
  P(c.g, w - .02, .25, mat(color, { rough: 1 }), 0, T + .0024, .17)
}

function rgbKeyboard(c, x, z, w, pastel) {
  const g = c.g
  B(g, w, .028, .13, mat(pastel ? '#e8e6ee' : '#111216', { rough: .5 }), x, T + .017, z)
  g.add(part(planeGeo(w - .015, .118), pastel ? FX().pastel : FX().keys, x, T + .0315, z, { rx: -Math.PI / 2, cast: false }))
  g.add(glassy(part(planeGeo(w + .12, .24), FX().under, x, T + .004, z, { rx: -Math.PI / 2 })))
}

// 2014-20: dois monitores num braço, teclado mecânico RGB, mouse gamer, microfone e suporte de fone.
function dual(c) {
  const { g, r } = c
  const arm = steel()
  B(g, .04, .02, .06, arm, 0, T + .01, -.27)
  C(g, .012, .012, .34, arm, 0, T + .17, -.27, { seg: 8 })
  B(g, .52, .02, .02, arm, 0, T + .33, -.26)
  for (const [x, ry, slot] of [[-.255, .24, 'main'], [.255, -.24, 'side']]) {
    lcd(c, { x, z: -.15, y: .18, w: .48, h: .28, bezel: .01, chin: .008, color: '#141518', ry, stand: 'none', slot })
    B(g, .03, .02, .1, arm, x * .8, T + .33, -.205)
  }
  rb(g, .06, .022, .03, .01, ink(), -.255, -.15, T + .46)
  deskMat(c, '#1b1c22', pick(r, ['#ff5d3a', '#3fb8ff', '#b57bff', '#52d977']))
  rgbKeyboard(c, -.05, .19, .42, false)
  mouse(c, 'gaming', .33, .19, '#15161a')
  micArm(g)
  // suporte com fone grande
  C(g, .045, .05, .012, ink(), .45, T + .006, -.02, { seg: 14 })
  C(g, .006, .006, .2, steel(), .45, T + .11, -.02, { seg: 6 })
  B(g, .1, .012, .025, ink(), .45, T + .21, -.02)
  g.add(part(torusGeo(.068, .012, 5, 14, Math.PI), mat(pick(r, ['#1d1a24', '#e9e9ee', '#e63946'])), .45, T + .148, -.02))
  for (const s of [-1, 1]) C(g, .042, .042, .03, mat('#24252b', { rough: .8 }), .45 + s * .068, T + .135, -.02, { rz: Math.PI / 2, seg: 12 })
  rgbTower(c, '#121317')
  c.slots.push([-.24, -.12], [.2, -.1], [-.43, .02])
}

// 2021-29: ultrawide curvo, câmera e luz de stream, tablet e microfone de mesa.
function ultra(c) {
  const { g, r } = c
  const W = .86
  const H = .34
  const p = new THREE.Group()
  p.position.set(-.02, T, -.16)
  g.add(p)
  const shell = mat('#1a1b20', { rough: .4, side: THREE.DoubleSide })
  p.add(part(curvedGeo(W + .02, H + .02, 1.112), shell, 0, .19 + H / 2, -.012))
  screen(c, p, 0, 0, 0, .19 + H / 2, 0, { geometry: curvedGeo(W - .025, H - .025, 1.1), side: THREE.BackSide })
  B(p, .3, .2, .05, mat('#1a1b20'), 0, .19 + H / 2, -.05)
  B(p, .06, .24, .03, steel(), 0, .12, -.08)
  rb(p, .34, .012, .13, .05, steel(), 0, -.06, 0)
  rb(p, .08, .03, .04, .012, ink(), 0, .0, .19 + H + .012)
  C(p, .01, .01, .004, mat('#2a4d8f', { rough: .1 }), 0, .19 + H + .032, .026, { rx: Math.PI / 2, seg: 10 })
  c.notes.push({ parent: p, x: -.4, y: .19 + H - .02, z: .085 }, { parent: p, x: .4, y: .19 + H - .03, z: .085 })
  // luz de stream num poste
  C(g, .008, .008, .62, steel(), -.5, T + .31, -.27, { seg: 6 })
  const light = new THREE.Group()
  light.position.set(-.5, T + .63, -.27)
  light.rotation.set(-.35, .7, 0)
  g.add(light)
  B(light, .2, .13, .025, mat('#2a2b30', { rough: .5 }))
  B(light, .18, .11, .004, FX().lamp, 0, 0, .013, { cast: false })
  const pastel = r() < .5
  deskMat(c, pastel ? '#e7e1f2' : '#25222e', pastel ? '#ff9fbf' : pick(r, ['#3fb8ff', '#ffd23f', '#52d977']))
  rgbKeyboard(c, -.06, .19, .34, pastel)
  mouse(c, 'gaming', .3, .19, pastel ? '#f4f2f8' : '#15161a')
  // microfone de mesa
  C(g, .05, .055, .012, ink(), -.42, T + .006, -.02, { seg: 14 })
  rod(g, [-.42, T + .012, -.02], [-.41, T + .08, .0], .008, steel())
  C(g, .028, .028, .1, mat('#2b2d33', { rough: .4 }), -.41, T + .13, .005, { seg: 12 })
  S(g, .029, mat('#6b6f78', { rough: .3, metal: .5 }), -.41, T + .18, .005, { ws: 10, hs: 8 })
  // tablet apoiado
  const tab = new THREE.Group()
  tab.position.set(.43, T, -.1)
  tab.rotation.y = -.5
  g.add(tab)
  tab.add(part(boxGeo(.13, .17, .008), ink(), 0, .08, 0, { rx: -.35 }))
  tab.add(part(planeGeo(.115, .15), basic('#ffffff', { map: tabletTexture() }), 0, .08 + .0015, .0045, { rx: -.35, cast: false }))
  B(tab, .1, .012, .05, steel(), 0, .006, .03)
  rgbTower(c, '#e9eaee')
  c.slots.push([.2, -.04], [-.22, -.03])
}

// 2030+: telas de holograma sobre um projetor e teclado de vidro.
function holo(c) {
  const { g } = c
  const f = FX()
  C(g, .08, .09, .014, mat('#d9dee8', { metal: .5, rough: .25 }), 0, T + .007, -.17, { seg: 20 })
  g.add(part(torusGeo(.075, .004, 4, 24), f.holo, 0, T + .015, -.17, { rx: Math.PI / 2, cast: false }))
  screen(c, g, .64, .36, 0, T + .39, -.17, { holo: true, side: THREE.DoubleSide })
  g.add(glassy(part(planeGeo(.66, .38), f.holoGlass, 0, T + .39, -.172)))
  B(g, .62, .004, .004, f.holo, 0, T + .2, -.17, { cast: false })
  for (const s of [-1, 1]) {
    screen(c, g, .26, .18, s * .44, T + .31, -.06, { holo: true, side: THREE.DoubleSide, ry: -s * .6, slot: 'side' })
    g.add(glassy(part(planeGeo(.27, .19), f.holoGlass, s * .44 - Math.sin(-s * .6) * .002, T + .31, -.06 - Math.cos(-s * .6) * .002, { ry: -s * .6 })))
    g.add(part(boxGeo(.24, .004, .004), f.holo, s * .44, T + .21, -.06, { ry: -s * .6, cast: false }))
  }
  g.add(glassy(part(boxGeo(.42, .006, .14), f.glass, -.03, T + .004, .19)))
  mouse(c, 'glass', .32, .19)
  S(g, .028, mat('#bff6ff', { emissive: '#59e3ff', emissiveIntensity: 1.4 }), .42, T + .26, -.24, { ws: 12, hs: 9 })
  c.slots.push([-.42, -.1], [.43, .02], [-.22, .02])
}

const SETS = [home8, desktop85, tower95, xp2003, app2010, dual, ultra, holo]

// ---------- bagunça ----------
const STICKY = ['#ffe066', '#ff9ec7', '#9ef0b0', '#9fd6ff', '#ffc38a']
const COVERS = ['#ff5d3a', '#3fb8ff', '#52d977', '#b57bff', '#ffd23f', '#ff6bd6', '#1d3557']

const CLUTTER = {
  mug(g, x, z, r) {
    const m = mat(pick(r, ['#ff6b6b', '#4dabf7', '#ffd43b', '#f8f9fa', '#63e6be', '#b197fc']), { rough: .4 })
    C(g, .028, .025, .065, m, x, T + .0325, z, { seg: 12 })
    g.add(part(torusGeo(.017, .005, 4, 8, Math.PI), m, x + .03, T + .035, z, { rz: -Math.PI / 2 }))
    C(g, .024, .024, .002, mat('#4a2c1a'), x, T + .062, z, { seg: 12, cast: false })
  },
  soda(g, x, z, r) {
    C(g, .018, .018, .062, mat(pick(r, ['#d62828', '#f77f00', '#2a9d8f', '#3a86ff']), { rough: .35, metal: .3 }), x, T + .031, z, { seg: 10 })
    C(g, .016, .016, .004, metal(), x, T + .064, z, { seg: 10 })
  },
  energy(g, x, z, r) {
    C(g, .016, .016, .075, mat(pick(r, ['#1b1b1f', '#1e3a8a', '#0b6e4f', '#e9e9ee']), { rough: .3, metal: .4 }), x, T + .0375, z, { seg: 10 })
    C(g, .0165, .0165, .022, mat(pick(r, ['#52d977', '#ff5d3a', '#ffd23f', '#3fb8ff'])), x, T + .045, z, { seg: 10 })
    C(g, .014, .014, .004, metal(), x, T + .077, z, { seg: 10 })
  },
  plant(g, x, z, r) {
    C(g, .03, .024, .045, mat(pick(r, ['#d86f45', '#f4f1ea', '#5b8c85'])), x, T + .0225, z, { seg: 10 })
    C(g, .027, .027, .004, mat('#5a3b25'), x, T + .045, z, { seg: 10, cast: false })
    const green = mat(pick(r, ['#3fa34d', '#57c45d', '#6aa84f']), { rough: .9 })
    if (r() < .5) {
      C(g, .013, .015, .075, green, x, T + .085, z, { seg: 8 })
      rod(g, [x + .01, T + .08, z], [x + .03, T + .1, z], .007, green)
      S(g, .009, mat('#ff6bd6'), x, T + .125, z, { ws: 6, hs: 4 })
    } else {
      for (let i = 0; i < 5; i += 1) {
        const a = i / 5 * TAU
        g.add(part(coneGeo(.013, .045, 5), green, x + Math.cos(a) * .012, T + .068, z + Math.sin(a) * .012, { rx: Math.sin(a) * .5, rz: -Math.cos(a) * .5 }))
      }
    }
  },
  papers(g, x, z, r) {
    P(g, .1, .13, mat('#f4f1e8', { rough: 1 }), x + .01, T + .0012, z - .01, { rz: (r() - .5) * .6 })
    P(g, .1, .13, mat('#ffffff', { map: paperTexture(r() < .3), rough: 1 }), x, T + .0025, z, { rz: (r() - .5) * .6 })
    g.add(part(boxGeo(.006, .006, .09), mat('#ffd23f'), x + .02, T + .006, z, { ry: r() * TAU }))
  },
  books(g, x, z, r) {
    const n = 2 + Math.floor(r() * 2)
    for (let i = 0; i < n; i += 1) g.add(part(boxGeo(.1 + r() * .03, .022, .13), mat(pick(r, COVERS)), x, T + .011 + i * .022, z, { ry: (r() - .5) * .4 }))
  },
  rubik(g, x, z, r) {
    g.add(part(boxGeo(.034, .034, .034), ink(), x, T + .017, z, { ry: r() * TAU }))
    B(g, .03, .002, .03, mat('#ffd23f'), x, T + .0345, z, { cast: false })
  },
  gamebox(g, x, z, r, era) {
    const cover = mat(pick(r, COVERS))
    const ry = (r() - .5) * .8
    if (era <= 1) {
      g.add(part(boxGeo(.06, .012, .075), mat('#6b6f78'), x, T + .006, z, { ry }))
      g.add(part(planeGeo(.045, .04), cover, x, T + .0125, z - .01, { rx: -Math.PI / 2, rz: ry, cast: false }))
    } else if (era === 2) {
      g.add(part(boxGeo(.075, .009, .07), mat('#2a2c34', { rough: .2 }), x, T + .0045, z, { ry }))
      g.add(part(planeGeo(.06, .06), cover, x, T + .0095, z, { rx: -Math.PI / 2, rz: ry, cast: false }))
    } else if (era <= 4) {
      g.add(part(boxGeo(.07, .012, .1), mat(era === 3 ? '#1f6f3a' : '#1f3f8f', { rough: .3 }), x, T + .006, z, { ry }))
      g.add(part(planeGeo(.06, .085), cover, x, T + .0125, z, { rx: -Math.PI / 2, rz: ry, cast: false }))
    } else {
      g.add(part(boxGeo(.08, .1, .05), cover, x, T + .05, z, { ry }))
      g.add(part(boxGeo(.06, .04, .052), mat('#fff8ec'), x, T + .07, z, { ry, cast: false }))
    }
  },
  pad(g, x, z, r, era) {
    const ry = (r() - .5) * 1.2
    const p = new THREE.Group()
    p.position.set(x, T, z)
    p.rotation.y = ry
    g.add(p)
    if (era === 0) {
      B(p, .07, .028, .07, ink(), 0, .014, 0)
      rod(p, [0, .028, 0], [.01, .08, -.01], .006, ink())
      S(p, .015, mat('#d62828'), .01, .085, -.01, { ws: 8, hs: 6 })
    } else if (era === 1) {
      B(p, .09, .012, .04, mat('#c9c9cf'), 0, .006, 0)
      B(p, .08, .002, .028, ink(), 0, .0125, 0, { cast: false })
      for (const bx of [.022, .034]) C(p, .006, .006, .004, mat('#d62828'), bx, .014, .004, { seg: 8 })
      B(p, .022, .004, .007, mat('#2b2b30'), -.026, .015, 0)
      B(p, .007, .004, .022, mat('#2b2b30'), -.026, .015, 0)
    } else {
      const body = mat(era === 2 ? '#bfc2c8' : era >= 5 ? pick(r, ['#f4f4f6', '#1b1b1f']) : '#1b1b1f', { rough: .45 })
      B(p, .07, .016, .032, body, 0, .012, -.004)
      for (const s of [-1, 1]) S(p, .02, body, s * .035, .012, .012, { sx: .9, sy: .55, sz: 1.3, ws: 10, hs: 6 })
      if (era >= 3) for (const s of [-1, 1]) C(p, .007, .007, .008, ink(), s * .016, .024, .006, { seg: 8 })
      for (const [bx, color] of [[.03, '#52d977'], [.04, '#ff5d3a'], [.035, '#3fb8ff']]) C(p, .004, .004, .004, mat(color), bx, .022, -.008 + (color === '#3fb8ff' ? -.006 : 0), { seg: 6, cast: false })
    }
  },
  figure(g, x, z, r, era) {
    const base = mat(pick(r, ['#ff5d3a', '#3fb8ff', '#52d977', '#b57bff', '#ffd23f']))
    C(g, .024, .024, .006, ink(), x, T + .003, z, { seg: 12 })
    if (era <= 1) {
      B(g, .028, .035, .02, mat('#9aa3ad', { metal: .4, rough: .4 }), x, T + .024, z)
      B(g, .022, .02, .02, mat('#9aa3ad', { metal: .4, rough: .4 }), x, T + .052, z)
      B(g, .014, .004, .004, led('#ff3b30'), x, T + .055, z + .011, { cast: false })
    } else {
      C(g, .011, .015, .035, base, x, T + .024, z, { seg: 8 })
      S(g, .02, mat(pick(r, ['#ffc58f', '#c68642', '#8d5524', '#f1c27d'])), x, T + .058, z, { ws: 10, hs: 8 })
      S(g, .021, base, x, T + .064, z - .004, { sy: .6, ws: 10, hs: 6 })
    }
  },
  handheld(g, x, z, r) {
    const ry = (r() - .5) * .8
    g.add(part(boxGeo(.045, .012, .075), mat('#cfcfc8', { rough: .5 }), x, T + .006, z, { ry }))
    g.add(part(planeGeo(.03, .026), mat('#8bac0f', { emissive: '#3c5a0f', emissiveIntensity: .4 }), x, T + .0125, z - .015, { rx: -Math.PI / 2, rz: ry, cast: false }))
  },
  tamagotchi(g, x, z, r) {
    S(g, .022, mat(pick(r, ['#ff6bd6', '#3fb8ff', '#ffd23f'])), x, T + .009, z, { sy: .45, sz: 1.2, ws: 10, hs: 6 })
    P(g, .014, .012, mat('#b8c4a0'), x, T + .0195, z - .004)
  },
  phone(g, x, z, r, era) {
    const ry = (r() - .5) * 1
    if (era === 3) g.add(part(boxGeo(.03, .014, .07), mat('#b9bec6', { metal: .5, rough: .3 }), x, T + .007, z, { ry }))
    else {
      g.add(part(boxGeo(.035, .006, .07), ink(), x, T + .003, z, { ry }))
      g.add(part(planeGeo(.03, .062), basic(pick(r, ['#3b5bdb', '#ff6b6b', '#20c997'])), x, T + .0065, z, { rx: -Math.PI / 2, rz: ry, cast: false }))
    }
  },
  spinner(g, x, z, r) {
    const m = mat(pick(r, ['#3fb8ff', '#ff5d3a', '#52d977']), { metal: .4, rough: .3 })
    C(g, .01, .01, .008, m, x, T + .004, z, { seg: 8 })
    for (let i = 0; i < 3; i += 1) C(g, .013, .013, .008, m, x + Math.cos(i * TAU / 3) * .022, T + .004, z + Math.sin(i * TAU / 3) * .022, { seg: 10 })
  },
  vr(g, x, z, r) {
    const ry = (r() - .5) * .8
    const p = new THREE.Group()
    p.position.set(x, T, z)
    p.rotation.y = ry
    g.add(p)
    rb(p, .1, .045, .06, .02, mat(pick(r, ['#f4f4f6', '#1b1b1f'])), 0, 0, 0, .006)
    B(p, .085, .03, .004, ink(), 0, .028, .033, { cast: false })
    p.add(part(torusGeo(.05, .006, 4, 12, Math.PI), mat('#3a3c44'), 0, .03, -.03, { rx: Math.PI / 2, cast: false }))
  },
  drone(g, x, z) {
    S(g, .02, mat('#e6fbff', { emissive: '#59e3ff', emissiveIntensity: .8 }), x, T + .15, z, { ws: 10, hs: 8 })
    g.add(part(torusGeo(.035, .004, 4, 18), FX().holo, x, T + .15, z, { rx: Math.PI / 2, cast: false }))
  },
  lamp(g, x, z, r) {
    const arm = mat(pick(r, ['#2b2d42', '#e63946', '#f4f1ea']), { rough: .4 })
    C(g, .04, .045, .012, arm, x, T + .006, z, { seg: 12 })
    rod(g, [x, T + .012, z], [x + .02, T + .2, z + .03], .006, arm)
    rod(g, [x + .02, T + .2, z + .03], [x + .02, T + .23, z + .14], .006, arm)
    const shade = part(coneGeo(.045, .06, 12), arm, x + .02, T + .2, z + .16, { rx: .5 })
    g.add(shade)
    g.add(part(sphereGeo(.018, 8, 6), FX().lamp, x + .02, T + .18, z + .165, { cast: false }))
  },
}

const POOLS = [
  ['mug', 'soda', 'papers', 'rubik', 'books', 'gamebox', 'plant', 'figure', 'lamp'],
  ['mug', 'soda', 'papers', 'handheld', 'gamebox', 'pad', 'figure', 'plant', 'lamp', 'books'],
  ['mug', 'energy', 'gamebox', 'pad', 'tamagotchi', 'papers', 'plant', 'figure', 'books', 'lamp'],
  ['mug', 'energy', 'gamebox', 'pad', 'phone', 'papers', 'plant', 'figure'],
  ['mug', 'energy', 'phone', 'pad', 'papers', 'plant', 'figure', 'gamebox'],
  ['mug', 'energy', 'phone', 'pad', 'spinner', 'figure', 'plant', 'papers'],
  ['mug', 'energy', 'phone', 'pad', 'vr', 'figure', 'plant'],
  ['mug', 'energy', 'drone', 'plant', 'figure', 'pad'],
]

function shuffle(list, r) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(r() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function clutter(c, era) {
  const { g, r } = c
  const slots = shuffle(c.slots, r)
  const pool = shuffle(POOLS[era], r)
  const count = Math.min(slots.length, 1 + Math.floor(r() * 2.6))
  for (let i = 0; i < count; i += 1) {
    const [x, z] = slots[i]
    let item = pool[i]
    if (item === 'lamp' && z > -.05) item = 'mug'
    CLUTTER[item](g, x, z, r, era)
  }
  // adesivos coloridos nas bordas dos monitores
  const notes = Math.min(c.notes.length, Math.floor(r() * 3.3))
  for (let i = 0; i < notes; i += 1) {
    const a = c.notes[i]
    a.parent.add(part(planeGeo(.042, .042), mat(STICKY[Math.floor(r() * STICKY.length)], { rough: 1 }), a.x, a.y - .018, a.z, { rz: (r() - .5) * .5, cast: false }))
  }
  // fio pendurado pela borda de trás
  if (era <= 6 && r() < .7) {
    const x = [-.2, .1, .32][Math.floor(r() * 3)]
    cable(g, `dangle${x}`, [[x, T + .006, -.22], [x + .02, T + .004, -.3], [x + .03, T - .05, -.325], [x + .06, .2, -.335], [x + .02, .01, -.29]])
  }
}

// ---------- montagem ----------
export function buildDesk({ level = 0, era, index = 0 }) {
  const eraIdx = eraIndex(era)
  const group = new THREE.Group()
  const r = seeded('mesa', index, eraIdx, level)
  const c = { g: group, r, index, style: styleOf(era), variant: index % 2, screens: [], notes: [], slots: [] }
  deskFrame(group, level, eraIdx >= 7, r)
  SETS[eraIdx](c)
  clutter(c, eraIdx)

  const seat = new THREE.Group()
  seat.position.set(0, 0, .5)
  seat.rotation.y = (r() - .5) * .22
  group.add(seat)
  chair(seat, chairKind(level, eraIdx, index), index, level)

  // poça de luz que a tela joga na mesa (acende de noite)
  const f = FX()
  f.pool.color.set(POOL[eraIdx])
  group.add(glassy(part(planeGeo(.7, .4), f.pool, 0, T + .0035, .04, { rx: -Math.PI / 2 })))

  return {
    group,
    w: 1.12,
    d: .66,
    block: [{ x: 0, z: 0, w: 1.12, d: .66 }],
    spots: [{ x: 0, z: .52, face: Math.PI, action: 'desk', seatY: SEAT }],
    screens: c.screens,
    style: c.style,
    variant: c.variant,
    pizza: crunchProps(group),
    roleSlot: [-.42, .2],
  }
}

// Pilha de pizza e latinhas no chão ao lado da cadeira: só aparece no crunch.
function crunchProps(parent) {
  const g = live(new THREE.Group())
  g.position.set(.5, 0, .44)
  g.rotation.y = .3
  const box = mat('#d8a15d', { rough: .9 })
  g.add(part(boxGeo(.22, .035, .22), box, 0, .0175, 0, { ry: .1 }))
  g.add(part(boxGeo(.22, .035, .22), box, .01, .0525, -.01, { ry: -.08 }))
  B(g, .22, .015, .22, box, 0, .0775, 0)
  P(g, .2, .2, mat('#ffffff', { map: pizzaTexture(), rough: .9 }), 0, .0855, 0)
  g.add(part(boxGeo(.22, .22, .008), box, 0, .19, -.12, { rx: -.3 }))
  for (const [x, z, a] of [[.18, .08, .4], [.2, -.1, 2.1]]) g.add(part(cylGeo(.016, .016, .055, 10), mat(a > 1 ? '#52d977' : '#3fb8ff', { metal: .3, rough: .3 }), x, .016, z, { rz: Math.PI / 2, ry: a }))
  g.visible = false
  parent.add(g)
  return g
}

// ---------- objetos da função de quem senta ----------
// fun: patinho de borracha e manual; art: mesa digitalizadora; sound: teclado MIDI; idea: caderno e dados.
export function roleProps(role, era) {
  const eraIdx = eraIndex(era)
  const g = new THREE.Group()
  const r = seeded('funcao', role, eraIdx)
  if (role === 'fun') {
    const yellow = mat('#ffd23f', { rough: .4 })
    S(g, .024, yellow, .035, T + .016, .03, { sy: .75, sz: 1.2, ws: 10, hs: 8 })
    S(g, .016, yellow, .035, T + .045, .015, { ws: 10, hs: 8 })
    g.add(part(coneGeo(.006, .016, 6), mat('#ff8a1c'), .035, T + .043, .034, { rx: Math.PI / 2, cast: false }))
    if (eraIdx <= 2) g.add(part(boxGeo(.11, .025, .14), mat(pick(r, COVERS)), -.04, T + .0125, -.02, { ry: .25 }))
    else CLUTTER.energy(g, -.05, -.03, r)
  } else if (role === 'art') {
    if (eraIdx <= 1) {
      P(g, .13, .16, mat('#ffffff', { map: paperTexture(true), rough: 1 }), 0, T + .0025, 0, { rz: .15 })
      g.add(part(boxGeo(.006, .006, .1), mat('#ffd23f'), .05, T + .006, .02, { ry: .6 }))
    } else if (eraIdx >= 6) {
      g.add(part(boxGeo(.19, .01, .13), ink(), 0, T + .02, 0, { rx: .2 }))
      g.add(part(planeGeo(.17, .11), basic('#ffffff', { map: tabletTexture() }), 0, T + .026, .001, { rx: -Math.PI / 2 + .2, cast: false }))
      rod(g, [.08, T + .006, -.02], [.11, T + .008, .07], .004, mat('#e9e9ee'))
    } else {
      B(g, .18, .008, .13, mat('#1f2024', { rough: .5 }), 0, T + .004, 0)
      P(g, .12, .08, mat('#34363d', { rough: .4 }), .01, T + .0085, .005)
      rod(g, [.07, T + .012, -.03], [.1, T + .012, .05], .004, mat('#4a4c55'))
    }
  } else if (role === 'sound') {
    const body = eraIdx === 0 ? '#d8cbaa' : '#2a2b30'
    g.add(part(boxGeo(.21, .024, .085), mat(body, { rough: .5 }), 0, T + .012, 0, { ry: .12 }))
    g.add(part(planeGeo(.19, .045), mat('#ffffff', { map: pianoTexture(), rough: .5 }), .003, T + .0245, .016, { rx: -Math.PI / 2, rz: .12, cast: false }))
    for (let i = 0; i < 4; i += 1) C(g, .006, .006, .008, mat(['#ff5d3a', '#ffd23f', '#3fb8ff', '#52d977'][i]), -.07 + i * .028, T + .028, -.025 + i * .003, { seg: 8, cast: false })
    if (eraIdx <= 3) {
      g.add(part(torusGeo(.055, .007, 4, 12, Math.PI), mat('#2b2d33'), .02, T + .012, -.09, { rx: -Math.PI / 2, cast: false }))
      for (const s of [-1, 1]) C(g, .03, .03, .022, mat('#3a3c44', { rough: .8 }), .02 + s * .055, T + .011, -.09, { seg: 12 })
    }
  } else {
    // caderno aberto, caneta e dados de mesa
    for (const s of [-1, 1]) g.add(part(planeGeo(.075, .1), mat('#ffffff', { map: paperTexture(), rough: 1 }), s * .038, T + .0035, 0, { rx: -Math.PI / 2, cast: false }))
    B(g, .16, .004, .11, mat(pick(r, COVERS)), 0, T + .002, 0, { cast: false })
    g.add(part(boxGeo(.005, .005, .085), mat('#1d3557'), .05, T + .008, .03, { ry: .7 }))
    B(g, .018, .018, .018, mat('#fff8ec'), -.07, T + .009, -.08)
    g.add(part(icoGeo(.014), mat('#ff5d3a', { rough: .35 }), -.04, T + .012, -.09))
  }
  return g
}
