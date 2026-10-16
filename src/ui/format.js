const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })
const full = new Intl.NumberFormat('pt-BR')

export const fmtNum = value => (Math.abs(value) < 10000 ? full.format(Math.round(value)) : compact.format(value))
export const fmtMoney = value => `${value < 0 ? '−' : ''}$${fmtNum(Math.abs(value))}`
export const fmtSigned = value => `${value > 0 ? '+' : value < 0 ? '−' : ''}${fmtNum(Math.abs(value))}`
export const fmtScore = value => (Math.round(value * 10) / 10).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export const scoreTier = score => (score >= 9.5 ? 'OBRA-PRIMA' : score >= 8.5 ? 'INCRÍVEL' : score >= 7.5 ? 'ÓTIMO' : score >= 6.5 ? 'BOM' : score >= 5 ? 'OK' : score >= 3.5 ? 'FRACO' : 'DESASTRE')
export const scoreColor = score => (score >= 9 ? '#ff5d3a' : score >= 7.5 ? '#52d977' : score >= 6 ? '#3fb8ff' : score >= 4.5 ? '#ffd23f' : '#9a8fb0')
