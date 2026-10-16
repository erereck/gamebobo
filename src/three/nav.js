// Grade de navegação simples (células de 0,5) com A* em 8 direções.
export const CELL = .5

export class NavGrid {
  constructor(width, depth) {
    this.width = width
    this.depth = depth
    this.cols = Math.round(width / CELL)
    this.rows = Math.round(depth / CELL)
    this.blocked = new Uint8Array(this.cols * this.rows)
    this.reserved = new Map()
  }

  index(c, r) { return r * this.cols + c }
  inside(c, r) { return c >= 0 && r >= 0 && c < this.cols && r < this.rows }
  toCell(x, z) { return [Math.floor((x + this.width / 2) / CELL), Math.floor((z + this.depth / 2) / CELL)] }
  toWorld(c, r) { return [c * CELL + CELL / 2 - this.width / 2, r * CELL + CELL / 2 - this.depth / 2] }

  // Bloqueia um retângulo do chão (centro x/z, tamanho w/d) com uma folga.
  block(x, z, w, d, pad = .12) {
    const [c0, r0] = this.toCell(x - w / 2 - pad, z - d / 2 - pad)
    const [c1, r1] = this.toCell(x + w / 2 + pad - .001, z + d / 2 + pad - .001)
    for (let r = Math.max(0, r0); r <= Math.min(this.rows - 1, r1); r += 1) {
      for (let c = Math.max(0, c0); c <= Math.min(this.cols - 1, c1); c += 1) this.blocked[this.index(c, r)] = 1
    }
  }

  unblockPoint(x, z) {
    const [c, r] = this.toCell(x, z)
    if (this.inside(c, r)) this.blocked[this.index(c, r)] = 0
  }

  walkable(c, r) { return this.inside(c, r) && !this.blocked[this.index(c, r)] }

  nearestWalkable(x, z) {
    const [c, r] = this.toCell(x, z)
    if (this.walkable(c, r)) return [c, r]
    for (let radius = 1; radius < 12; radius += 1) {
      for (let dr = -radius; dr <= radius; dr += 1) {
        for (let dc = -radius; dc <= radius; dc += 1) {
          if (Math.abs(dr) !== radius && Math.abs(dc) !== radius) continue
          if (this.walkable(c + dc, r + dr)) return [c + dc, r + dr]
        }
      }
    }
    return [c, r]
  }

  randomWalkable(random = Math.random) {
    for (let i = 0; i < 60; i += 1) {
      const c = Math.floor(random() * this.cols)
      const r = Math.floor(random() * this.rows)
      if (this.walkable(c, r)) return this.toWorld(c, r)
    }
    return [0, 0]
  }

  findPath(fromX, fromZ, toX, toZ) {
    const [sc, sr] = this.nearestWalkable(fromX, fromZ)
    const [ec, er] = this.nearestWalkable(toX, toZ)
    const start = this.index(sc, sr)
    const goal = this.index(ec, er)
    if (start === goal) return [[toX, toZ]]
    const size = this.cols * this.rows
    const g = new Float32Array(size).fill(Infinity)
    const came = new Int32Array(size).fill(-1)
    const closed = new Uint8Array(size)
    const open = [start]
    g[start] = 0
    const h = i => {
      const c = i % this.cols
      const r = (i / this.cols) | 0
      const dx = Math.abs(c - ec)
      const dz = Math.abs(r - er)
      return Math.max(dx, dz) + .414 * Math.min(dx, dz)
    }
    const f = new Float32Array(size).fill(Infinity)
    f[start] = h(start)
    let guard = 0
    while (open.length && guard < 6000) {
      guard += 1
      let best = 0
      for (let i = 1; i < open.length; i += 1) if (f[open[i]] < f[open[best]]) best = i
      const current = open.splice(best, 1)[0]
      if (current === goal) break
      closed[current] = 1
      const cc = current % this.cols
      const cr = (current / this.cols) | 0
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
          if (!dr && !dc) continue
          const nc = cc + dc
          const nr = cr + dr
          if (!this.walkable(nc, nr)) continue
          if (dr && dc && (!this.walkable(cc + dc, cr) || !this.walkable(cc, cr + dr))) continue
          const ni = this.index(nc, nr)
          if (closed[ni]) continue
          const cost = g[current] + (dr && dc ? 1.414 : 1)
          if (cost < g[ni]) {
            g[ni] = cost
            f[ni] = cost + h(ni)
            came[ni] = current
            if (!open.includes(ni)) open.push(ni)
          }
        }
      }
    }
    if (came[goal] === -1) return [[toX, toZ]]
    const cells = []
    for (let i = goal; i !== start && i !== -1; i = came[i]) cells.push(i)
    cells.reverse()
    const points = cells.map(i => this.toWorld(i % this.cols, (i / this.cols) | 0))
    points[points.length - 1] = [toX, toZ]
    return simplify(points)
  }
}

// Remove pontos colineares para o boneco andar reto em vez de em zigue-zague.
function simplify(points) {
  if (points.length < 3) return points
  const out = [points[0]]
  for (let i = 1; i < points.length - 1; i += 1) {
    const [ax, az] = out[out.length - 1]
    const [bx, bz] = points[i]
    const [cx, cz] = points[i + 1]
    const cross = (bx - ax) * (cz - az) - (bz - az) * (cx - ax)
    if (Math.abs(cross) > 1e-4) out.push(points[i])
  }
  out.push(points[points.length - 1])
  return out
}
