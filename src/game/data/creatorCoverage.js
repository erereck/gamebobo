import { clamp, randomChoice, randomInt } from '../engine/utils.js'

const CREATORS = ['Lia no Controle', 'Quarto Player', 'Checkpoint da Nati', 'Dois Controles', 'Tela de Pause']
const NAMES = ['pixelRoxo', 'bia.exe', 'tioDoSave', 'cafefrio', 'luan_16bit', 'mari_sem_mapa', 'comboquebrado', 'jogaedevagar', 'respawnado', 'carolCRT', 'zeroContinue', 'bossdequinta']
const POSITIVE = ['isso aqui é MUITO bom', 'já quero ver o final', 'W demais', 'essa música entrou na cabeça', 'o chefe tem nome? kkkkk', 'não pula o diálogo', 'esse jogo tem molho', 'clipa isso', 'eu comprava só por essa fase', 'ok agora entendi a nota']
const MIXED = ['bonito mas essa câmera tá brigando', 'vai com calma que tem cara de bug', 'não sei se amei ou fiquei confuso', 'a ideia é boa, falta polir', 'essa fase durou demais', 'o chat carrega esse jogo', 'quase ficou perfeito', 'eu esperava outra coisa', 'salva antes dessa porta', 'o preço decide']
const NEGATIVE = ['isso passou no teste?', 'a câmera é o verdadeiro chefe', 'F no chat', 'não dá pra defender esse loading', 'o conceito era melhor no papel', 'mais um bug e eu durmo', 'o som estourou aqui também?', 'essa luta não acaba', 'pede reembolso antes dos créditos', 'o menu venceu o jogador']

const color = index => `chat-name-${index % 6}`

export function createCreatorCoverage(game, random = Math.random) {
  const sentiment = clamp(game.score + randomInt(-8, 8, random), 18, 98)
  const mainPool = sentiment >= 78 ? POSITIVE : sentiment >= 56 ? MIXED : NEGATIVE
  const pool = [...mainPool, ...(sentiment >= 70 ? MIXED.slice(0, 3) : sentiment < 56 ? MIXED.slice(3, 6) : [])]
  const used = new Set()
  const chat = Array.from({ length: 10 }, (_, index) => {
    const remaining = pool.filter(text => !used.has(text))
    const text = randomChoice(remaining.length ? remaining : pool, random)
    used.add(text)
    return { name: NAMES[(index + randomInt(0, NAMES.length - 1, random)) % NAMES.length], text: text.replace('esse jogo', game.title), color: color(index + randomInt(0, 5, random)) }
  })
  const creator = randomChoice(CREATORS, random)
  return {
    id: `creator-${game.id}`,
    kind: 'decision',
    source: 'postLaunch',
    eventId: 'creator-campaign-live',
    tag: 'AO VIVO · ESTREIA PATROCINADA',
    title: `${creator} abriu ${game.title}.`,
    body: `A transmissão foi combinada como parte da campanha. ${Math.max(184, Math.round(game.newFollowers * .7)).toLocaleString('pt-BR')} pessoas estão vendo — e a opinião delas não veio no contrato.`,
    chat,
    chatSentiment: sentiment,
    choices: [
      { id: 'join', label: 'Entrar no chat', detail: 'Assumir que você é da equipe.', outcome: 'O chat parou por três segundos. Depois vieram perguntas demais.', effects: { game: { salesRate: .24, followerRate: .2 }, player: { reputation: 2, stress: 3 }, audience: { hardcore: 55 } } },
      { id: 'keys', label: 'Liberar dez chaves', detail: 'Outros canais podem continuar a onda.', outcome: 'Três canais menores começaram a jogar antes do fim da live.', effects: { player: { money: -450 }, game: { salesRate: .32, followerRate: .14 } } },
      { id: 'watch', label: 'Só acompanhar', detail: 'A campanha segue sem interferência.', outcome: 'Você anotou dois bugs e um apelido melhor que o nome oficial do chefe.', effects: { game: { salesRate: .14, followerRate: .08 } } },
    ],
    context: { gameId: game.id },
  }
}
