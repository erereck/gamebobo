import { HYBRID_GENRES } from '../data/hybridGenres.js'

export function discoverHybridGenre(state, game, random = Math.random) {
  if (game.score < 82 || game.innovation < 9 || random() > 0.38) return null
  const candidates = HYBRID_GENRES.filter(hybrid => (
    hybrid.requires.includes(game.genre)
    && hybrid.requires.every(required => required === game.genre || state.games.some(previous => previous.id !== game.id && previous.genre === required))
    && !state.world.knownGenres.some(item => item.id === hybrid.id)
  ))
  if (!candidates.length) return null
  const hybrid = candidates[Math.floor(random() * candidates.length)]
  const genre = { id: hybrid.id, label: hybrid.name, createdBy: game.id, createdYear: state.date.year, base: false, description: hybrid.description }
  state.world.knownGenres.push(genre)
  state.player.career.genresCreated += 1
  return genre
}
