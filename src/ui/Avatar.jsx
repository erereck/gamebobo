// Retrato 2D com as mesmas cores do boneco 3D: cabeça redonda, cabelo, camiseta.
export function Avatar({ look, size = 48, mood = null }) {
  if (!look) return null
  const hair = look.hair
  const style = look.hairStyle
  return (
    <svg className="avatar" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="23" fill="#fff3df" stroke="#1d1a24" strokeWidth="2" />
      <clipPath id={`clip-${size}-${look.shirt}-${look.skin}`}><circle cx="24" cy="24" r="22" /></clipPath>
      <g clipPath={`url(#clip-${size}-${look.shirt}-${look.skin})`}>
        <ellipse cx="24" cy="50" rx="17" ry="13" fill={look.shirt} stroke="#1d1a24" strokeWidth="1.6" />
        {style === 'longo' && <rect x="11" y="18" width="26" height="22" rx="8" fill={hair} />}
        {style === 'black' && <circle cx="24" cy="18" r="15" fill={hair} />}
        <circle cx="24" cy="23" r="12.5" fill={look.skin} stroke="#1d1a24" strokeWidth="1.6" />
        {style !== 'careca' && style !== 'black' && style !== 'moicano' && <path d="M11.6 22 C11 12 18 9.5 24 9.5 C30 9.5 37 12 36.4 22 C33 17 28 15.6 24 15.6 C20 15.6 15 17 11.6 22 Z" fill={hair} stroke="#1d1a24" strokeWidth="1.4" />}
        {style === 'moicano' && <rect x="21.5" y="7" width="5" height="9" rx="2" fill={hair} stroke="#1d1a24" strokeWidth="1.2" />}
        {style === 'coque' && <circle cx="24" cy="8.5" r="4.5" fill={hair} stroke="#1d1a24" strokeWidth="1.4" />}
        {style === 'cacheado' && [12, 17, 24, 31, 36].map(x => <circle key={x} cx={x} cy={x === 24 ? 11 : 14} r="4.2" fill={hair} stroke="#1d1a24" strokeWidth="1.2" />)}
        {style === 'franja' && <rect x="15" y="14" width="18" height="5" rx="2" fill={hair} />}
        {style === 'rabo' && <ellipse cx="36" cy="22" rx="3.2" ry="6" fill={hair} stroke="#1d1a24" strokeWidth="1.2" />}
        <ellipse cx="19.5" cy="24.5" rx="1.6" ry={mood === 'sleep' ? .5 : 2.1} fill="#1d1a24" />
        <ellipse cx="28.5" cy="24.5" rx="1.6" ry={mood === 'sleep' ? .5 : 2.1} fill="#1d1a24" />
        <circle cx="16.4" cy="28.4" r="1.8" fill="#ff8f8f" opacity=".5" />
        <circle cx="31.6" cy="28.4" r="1.8" fill="#ff8f8f" opacity=".5" />
        <path d={mood === 'sad' ? 'M21 31.5 Q24 29.5 27 31.5' : 'M21 30 Q24 32.4 27 30'} stroke="#1d1a24" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        {look.extra === 'oculos' && <g stroke="#1d1a24" strokeWidth="1.3" fill="none"><circle cx="19.5" cy="24.5" r="3.3" /><circle cx="28.5" cy="24.5" r="3.3" /><path d="M22.8 24.5h2.4" /></g>}
        {look.extra === 'bone' && <path d="M11.5 19 C12 10 36 10 36.5 19 Z M30 17.5 h11 v2.5 h-11 z" fill={look.shirt} stroke="#1d1a24" strokeWidth="1.3" />}
        {look.extra === 'fone' && <g><path d="M11 23 C11 9 37 9 37 23" stroke="#2b2f3a" strokeWidth="2.4" fill="none" /><rect x="8.5" y="20" width="5" height="8" rx="2" fill="#ff5d3a" stroke="#1d1a24" strokeWidth="1.2" /><rect x="34.5" y="20" width="5" height="8" rx="2" fill="#ff5d3a" stroke="#1d1a24" strokeWidth="1.2" /></g>}
      </g>
    </svg>
  )
}
