export const SUCCESSION_EVENT = {
  id: 'succession',
  tag: 'UMA CONVERSA SOBRE DEPOIS',
  title: 'O estúdio já viveu mais que muito console.',
  body: 'Você ainda consegue trabalhar. A pergunta não é se precisa sair agora — é se tudo isto deve depender para sempre da mesma pessoa.',
}

export function successionChoices(state) {
  const veteran = [...state.studio.team].sort((a, b) => b.months - a.months || b.loyalty - a.loyalty)[0]
  return [
    { id: 'continue', label: 'Continuar no comando', detail: 'A conversa volta em dez anos.', outcome: 'A cadeira continua ocupada. O assunto, guardado numa gaveta.', effects: { succession: 'continue', player: { reputation: 2 } } },
    {
      id: 'team',
      label: veteran ? `Passar o comando para ${veteran.name}` : 'Contratar uma nova liderança',
      detail: veteran ? 'A cultura segue com quem ajudou a construí-la.' : 'A história continua com alguém de fora.',
      outcome: veteran ? 'A chave mudou de bolso sem sair do escritório.' : 'Uma nova pessoa entrou sabendo que herdava também os erros.',
      effects: { succession: 'team', successorId: veteran?.id ?? null },
    },
    { id: 'family', label: 'Trazer a próxima geração', detail: 'Novo perfil, mesmo sobrenome na história.', outcome: 'A primeira reunião começou com histórias que não cabiam na ata.', effects: { succession: 'family' } },
  ]
}
