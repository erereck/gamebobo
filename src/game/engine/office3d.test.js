// Escritório 3D (src/three): bonecos, pôsteres, montagem e plantas. Fica aqui porque o
// `npm test` só roda esta pasta. Sem navegador: canvas de mentira e nada de WebGL.
import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'

// contexto 2D que aceita qualquer chamada (texturas de balão, camiseta e capa)
const fake = new Proxy(function () {}, {
  get: (_, key) => (key === Symbol.toPrimitive ? () => 0 : key === 'then' ? undefined : fake),
  set: () => true,
  apply: () => fake,
})
globalThis.document ??= { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => fake }) }
globalThis.Path2D ??= class { addPath() {} }

const { NavGrid } = await import('../../three/nav.js')
const { StaffAgent } = await import('../../three/agents.js')
const { OfficeWorld, officeKey } = await import('../../three/world.js')
const { LAYOUTS } = await import('../../three/layouts.js')
const F = await import('../../three/furniture.js')
const { GENRES, THEMES } = await import('../data/genres.js')

const LOOK = { skin: '#d9a066', hair: '#1f1a17', hairStyle: 'curto', shirt: '#ffbe0b', pants: '#2b3a55', extra: null, height: 1, top: 'camiseta', bottom: 'calca', print: false }

// Mundo mínimo: os métodos de verdade do OfficeWorld, sem renderer nem cena.
function fakeWorld(w = 8, d = 6) {
  const world = Object.create(OfficeWorld.prototype)
  Object.assign(world, {
    nav: new NavGrid(w, d), spots: [], desks: [], agents: [], conversations: [], cat: null, particles: null,
    view: { year: 2000, era: { id: 'cd' }, sound: false }, ideaSet: new Set(), coupleSet: new Set(),
    door: { x: -w / 2 + .5, z: d / 2 - .5, face: 0 }, lastBlip: 0, callbacks: {},
  })
  return world
}

// Boneco de verdade; decisões congeladas para o teste mandar no que acontece.
function staff(world, id, x, z, info = {}) {
  const agent = new StaffAgent(world, { id, look: LOOK, energy: 80, trait: 'zen', status: 'ok', working: false, pace: 'normal', ...info })
  agent.place(x, z)
  agent.decide = () => agent.setIdle(99)
  world.agents.push(agent)
  return agent
}

const step = (agents, seconds, each = () => {}) => {
  for (let t = 0; t < seconds; t += .05) {
    for (const agent of agents) agent.update(.05)
    each()
  }
}
const cellFree = (nav, x, z) => nav.walkable(...nav.toCell(x, z))

test('reserva de lugar a caminho some quando a caminhada é interrompida', () => {
  const interruptions = {
    comemora: agent => agent.react('cheer'),
    festa: agent => agent.react('party'),
    lamenta: agent => agent.react('sad'),
    'sai de férias': agent => {
      agent.info = { ...agent.info, status: 'ferias' }
      agent.leave()
    },
    'outra caminhada': agent => agent.wander(),
  }
  for (const [name, interrupt] of Object.entries(interruptions)) {
    const world = fakeWorld()
    const coffee = { x: 2.5, z: 1.5, face: 0, action: 'coffee', usedBy: null }
    world.spots.push(coffee)
    const agent = staff(world, 'a', -2.5, -1.5)
    assert.ok(agent.useSpot('coffee'))
    assert.equal(coffee.usedBy, 'a', 'reservado a caminho')
    assert.equal(world.hasSpot('coffee'), false)
    step([agent], .2)
    interrupt(agent)
    step([agent], 1.5)
    assert.equal(coffee.usedBy, null, name)
    assert.ok(world.hasSpot('coffee'), name)
  }
})

test('quem levanta da mesa para ir ao café chega com o lugar ainda reservado', () => {
  const world = fakeWorld()
  world.desks = [{ index: 0, spot: { x: -1, z: 0, face: 0 }, usedBy: null }]
  const coffee = { x: 2.5, z: 1.5, face: 0, action: 'coffee', usedBy: null }
  world.spots.push(coffee)
  const agent = staff(world, 'a', -1, -.6)
  agent.deskIndex = 0
  agent.goToDesk('sit')
  step([agent], 1.5)
  assert.ok(agent.seat && agent.desk === world.desks[0], 'sentado à mesa')
  assert.ok(agent.useSpot('coffee'))
  step([agent], .1)
  assert.ok(agent.glide && !agent.seat, 'levantando')
  assert.equal(coffee.usedBy, 'a')
  step([agent], .4)
  assert.equal(coffee.usedBy, 'a', 'levantar da cadeira não solta o café')
  assert.equal(world.desks[0].usedBy, null, 'a cadeira fica livre')
  step([agent], 6)
  assert.equal(agent.spot, coffee)
  assert.equal(coffee.usedBy, 'a')
  assert.equal(agent.claim, null)
})

test('remontar o escritório não deixa ninguém em pé dentro da cadeira', () => {
  const world = fakeWorld()
  const deskSpot = { x: -1, z: 0, face: 0 }
  world.desks = [{ index: 0, spot: deskSpot, usedBy: null }]
  const sofa = { x: 2, z: 1, face: 0, action: 'sofa', seatX: 2, seatZ: .55, seatY: .42, usedBy: null }
  world.spots.push(sofa)
  const worker = staff(world, 'w', -1, -.8, { working: true })
  worker.deskIndex = 0
  const lazy = staff(world, 'l', 1, -1.5)
  worker.goToDesk('work')
  assert.ok(lazy.useSpot('sofa'))
  step([worker, lazy], 4)
  assert.equal(worker.state, 'work')
  assert.ok(lazy.seat && lazy.spot === sofa)

  // a remontagem troca mesas e lugares por objetos novos, no mesmo lugar
  world.desks = [{ index: 0, spot: { ...deskSpot }, usedBy: null }]
  world.spots = [{ ...sofa, usedBy: null }]
  world.resettle()

  // quem trabalhava volta na hora para a cadeira nova, sem levantar
  assert.equal(worker.desk, world.desks[0])
  assert.equal(world.desks[0].usedBy, 'w')
  assert.ok(worker.seat && !worker.glide)
  assert.equal(worker.state, 'work')
  assert.ok(Math.hypot(worker.x - deskSpot.x, worker.z - deskSpot.z) < .01)
  assert.equal(worker.boneco.w.sit, 1)
  // quem estava no sofá fica em pé no ponto de levantar, não no assento
  assert.equal(lazy.seat, null)
  assert.ok(Math.hypot(lazy.x - sofa.x, lazy.z - sofa.z) < .01)
  assert.equal(lazy.boneco.w.sit, 0)
  assert.equal(lazy.state, 'idle')
})

test('toca aqui: quem vem ao encontro nunca para dentro de uma mesa', () => {
  // pod como no layouts.js (costas com costas, cadeiras por fora), em duas posições da grade
  for (const [cx, cz] of [[0, 0], [-1.3, -1.2]]) {
    const world = fakeWorld(10, 8)
    const desks = [[cz + .34, 0], [cz - .34, Math.PI]].map(([z, rot]) => ({ x: cx, z, rot }))
    for (const desk of desks) {
      world.nav.block(desk.x, desk.z, 1.12, .66)
      world.nav.unblockPoint(desk.x, desk.z + Math.cos(desk.rot) * .52)
    }
    const inDesk = (x, z) => desks.some(desk => Math.abs(x - desk.x) < .56 && Math.abs(z - desk.z) < .33)
    // cada um em pé atrás da própria cadeira, um de cada lado do pod
    const mate = staff(world, 'm', cx, cz - 1.16)
    const walker = staff(world, 'w', cx, cz + 1.16)
    for (const agent of [mate, walker]) {
      agent.state = 'celebrate'
      agent.timer = 6
    }
    // em linha reta o ponto cairia dentro da mesa de trás
    assert.ok(inDesk(cx, cz - 1.16 + .62))
    walker.findBuddy()
    assert.equal(walker.buddy, mate)
    const [tx, tz] = walker.path.at(-1)
    assert.ok(!inDesk(tx, tz), 'destino fora da mesa')
    assert.ok(cellFree(world.nav, tx, tz), 'destino em célula livre')
    assert.ok(Math.abs(Math.hypot(tx - mate.x, tz - mate.z) - .62) < .01, 'a um braço de distância')
    let inside = 0
    let clapped = false
    step([mate, walker], 6, () => {
      if (inDesk(walker.x, walker.z)) inside += 1
      if (walker.five?.clapped) clapped = true
    })
    assert.equal(inside, 0, 'nunca atravessa a mesa')
    assert.ok(clapped, 'os dois bateram a mão')
  }
})

test('conversa não puxa quem está deitado e levanta quem estava agachado', () => {
  const world = fakeWorld()
  const caller = staff(world, 'c', 0, 0)
  const sleeper = staff(world, 's', .6, 0)
  sleeper.settle({ x: .6, z: 0, face: 0, kind: 'lie', lieY: .42, standX: 1, standZ: 0 })
  sleeper.snapGlide()
  sleeper.setIdle(1)
  const petter = staff(world, 'p', 1.6, 0)
  petter.state = 'activity'
  petter.activity = 'cat'
  petter.boneco.setBase('crouch')
  petter.boneco.snapBase()
  assert.ok(world.startChat(caller))
  assert.equal(caller.partner, petter)
  assert.equal(sleeper.state, 'idle')
  assert.equal(sleeper.seat.kind, 'lie')
  assert.equal(petter.state, 'waitChat')
  assert.equal(petter.activity, null)
  assert.equal(petter.boneco.goal.crouch, 0)
})

test('pôster novo troca só a camada de quadros, sem remontar o escritório', () => {
  const view = { office: 2, era: { id: 'cd' }, decor: ['plant'], studioName: 'QA', posters: [{ id: 'g1' }] }
  assert.equal(officeKey(view), officeKey({ ...view, posters: [{ id: 'g2' }, { id: 'g1' }] }))
  assert.notEqual(officeKey(view), officeKey({ ...view, decor: ['plant', 'sofa'] }))
  assert.notEqual(officeKey(view), officeKey({ ...view, era: { id: 'app' } }))

  const game = id => ({ id, title: `Jogo ${id}`, genre: GENRES[0].id, theme: THEMES[0].id, platform: 'pc' })
  const world = Object.create(OfficeWorld.prototype)
  Object.assign(world, { posterLayer: new THREE.Group(), posterSlots: [{ x: 0, z: -4, rot: 0 }, { x: -5, z: 1, rot: Math.PI / 2 }], posterKey: null, posterMats: [] })
  world.syncPosters([game('a'), game('b'), game('c')])
  assert.equal(world.posterLayer.children.length, 2, 'só as vagas que existem')
  const first = world.posterLayer.children[0]
  world.syncPosters([game('a'), game('b'), game('d')])
  assert.equal(world.posterLayer.children[0], first, 'mesmo top visível: nada muda')
  let disposed = 0
  for (const material of world.posterMats) material.addEventListener('dispose', () => { disposed += 1 })
  world.syncPosters([game('c'), game('a')])
  assert.equal(disposed, 2, 'materiais antigos liberados')
  const [left, right] = world.posterLayer.children
  assert.deepEqual([left.position.x, left.position.z, right.position.x, right.position.z, right.rotation.y], [0, -4, -5, 1, Math.PI / 2])
})

test('desmontar o escritório libera o que é dele e devolve o contexto WebGL', () => {
  const calls = []
  const world = Object.create(OfficeWorld.prototype)
  Object.assign(world, {
    running: true,
    resizeObserver: { disconnect: () => calls.push('observer') },
    renderer: { dispose: () => calls.push('renderer'), forceContextLoss: () => calls.push('contexto'), domElement: { remove: () => calls.push('canvas') } },
    owned: [{ dispose: () => calls.push('chão') }],
    posterLayer: new THREE.Group(),
    posterMats: [{ dispose: () => calls.push('pôster') }],
  })
  world.dispose()
  assert.equal(world.running, false)
  assert.deepEqual(calls, ['observer', 'pôster', 'chão', 'renderer', 'contexto', 'canvas'])
})

test('pôsteres e quadros de parede não invadem janela, porta ou estante', () => {
  const H = Math.PI / 2
  // caixas no espaço da peça (x ao longo da parede, y para cima); móvel fixo peça por peça
  const boxOf = object => {
    const box = new THREE.Box3().setFromObject(object)
    return { x0: box.min.x, x1: box.max.x, y0: box.min.y, y1: box.max.y }
  }
  const parts = built => {
    const list = []
    built.group.updateMatrixWorld(true)
    built.group.traverse(child => { if (child.isMesh) list.push(boxOf(child)) })
    return list
  }
  const FIXED = {
    window: item => F.windowFrame(item.width ?? 1.3),
    door: () => F.door(),
    garage: () => F.garageDoor(),
    bookshelf: () => F.bookshelf(),
    toolshelf: () => F.toolShelf(),
  }
  const items = { poster: boxOf(F.poster({ id: 'x', title: 'X', genre: GENRES[0].id, theme: THEMES[0].id }).group), whiteboard: boxOf(F.whiteboard().group), trophyshelf: boxOf(F.trophyShelf().group) }
  for (const layout of LAYOUTS) {
    const wallOf = item => (Math.abs((item.rot ?? 0) - H) < 1e-6 ? 'left' : 'back')
    // na parede esquerda (rot H) o x local da peça aponta para -z
    const span = (item, box) => (wallOf(item) === 'left' ? [item.z - box.x1, item.z - box.x0] : [item.x + box.x0, item.x + box.x1])
    const onWall = item => (wallOf(item) === 'left' ? Math.abs(item.x + layout.w / 2) < .5 : Math.abs(item.z + layout.d / 2) < .5)
    const fixed = layout.fixed.filter(item => FIXED[item.kind] && onWall(item)).map(item => ({ item, parts: parts(FIXED[item.kind](item)) }))
    const check = (slot, name, kinds) => {
      for (const kind of kinds) {
        const box = items[kind]
        const [a0, a1] = span(slot, box)
        for (const { item, parts: pieces } of fixed) {
          if (wallOf(item) !== wallOf(slot)) continue
          for (const piece of pieces) {
            const [b0, b1] = span(item, piece)
            const across = Math.min(a1, b1) - Math.max(a0, b0)
            const high = Math.min(box.y1, piece.y1) - Math.max(box.y0, piece.y0)
            assert.ok(across <= 1e-6 || high <= 1e-6, `${layout.id}: ${name} (${kind}) invade ${item.kind} (${item.x}, ${item.z}) por ${across.toFixed(2)} m`)
          }
        }
      }
    }
    layout.posters.forEach((slot, i) => check(slot, `pôster ${i}`, ['poster']))
    layout.wallSlots.forEach((slot, i) => check(slot, `parede ${i}`, ['poster', 'whiteboard', 'trophyshelf']))
  }
  // o neon (2 m) pode passar na frente de uma janela: desenha depois das camadas dela
  const neon = F.neonSign('QA').group.children[0]
  let windowTop = 0
  F.windowFrame(2).group.traverse(child => { windowTop = Math.max(windowTop, child.renderOrder) })
  assert.ok(neon.renderOrder > windowTop)
})

test('toca aqui: quem já está colado no colega recua até um braço de distância', () => {
  const world = fakeWorld(10, 8)
  const mate = staff(world, 'm', 0, 0)
  const walker = staff(world, 'w', .3, 0)
  const [tx, tz] = walker.fivePoint(mate)
  assert.ok(Math.abs(Math.hypot(tx - mate.x, tz - mate.z) - .62) < .01, 'recua até .62')
  assert.ok(tx > .3, 'recua para o lado em que já estava')
  // com uma mesa no caminho do recuo, fica onde está em vez de entrar nela
  world.desks.push({ spot: { x: .62, z: 0, face: 0 } })
  const [sx, sz] = walker.fivePoint(mate)
  assert.deepEqual([sx, sz], [walker.x, walker.z])
})
