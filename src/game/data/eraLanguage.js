export const marketClippingLabel = year => year < 1995 ? 'RECORTE DE REVISTA' : year < 2007 ? 'RECORTE DE SITE' : year < 2012 ? 'RECORTE DE PORTAL' : 'RECORTE DA REDE'

export function marketAngleCopy(angle, year) {
  if (angle.id === 'together') {
    if (year < 1985) return 'Dois jogadores diante da mesma máquina fazem a fila crescer.'
    if (year < 1995) return 'Controle extra e sofá cheio vendem o jogo para o grupo inteiro.'
    if (year < 2007) return 'Multiplayer local e cabo de rede viraram programa de fim de semana.'
    return 'Jogar junto faz uma comunidade durar mais que a campanha.'
  }
  if (angle.id === 'pretty' && year < 1995) return 'Uma imagem boa na revista decide a compra antes da análise.'
  if (angle.id === 'deep' && year < 1990) return 'Cadernos cheios de mapa e segredo estão circulando entre jogadores.'
  return angle.copy
}
