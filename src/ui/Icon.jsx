import { ICONS } from './icons.js'

export function Icon({ name, size = 20, stroke = 2, className = '', style, title }) {
  const paths = ICONS[name] ?? ICONS.question ?? []
  return (
    <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden={title ? undefined : 'true'} role={title ? 'img' : undefined} style={style}>
      {title && <title>{title}</title>}
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  )
}
