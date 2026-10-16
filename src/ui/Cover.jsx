import { useMemo } from 'react'
import { coverDataUrl } from './cover.js'

export function Cover({ game, width = 120, className = '' }) {
  const height = Math.round(width * 4 / 3)
  const src = useMemo(() => coverDataUrl(game, 180, 240), [game.id, game.title, game.genre, game.theme, game.platform])
  return <img className={`cover ${className}`} src={src} width={width} height={height} alt={`Capa de ${game.title}`} draggable="false" />
}
