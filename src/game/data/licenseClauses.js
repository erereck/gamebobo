export const LICENSE_CLAUSES = {
  heroIntegrity: { id: 'heroIntegrity', label: 'Integridade do herói', copy: 'O protagonista não pode virar vilão de forma definitiva.', conflicts: ['villain-lead'] },
  noPermanentDeath: { id: 'noPermanentDeath', label: 'Sem morte definitiva', copy: 'Personagens centrais precisam sair vivos da história.', conflicts: ['permadeath'] },
  teenRating: { id: 'teenRating', label: 'Classificação até 16', copy: 'Violência e linguagem precisam caber na faixa acordada.', conflicts: ['adult-only'] },
  familyRating: { id: 'familyRating', label: 'Classificação livre', copy: 'O projeto deve continuar apropriado para público infantil.', conflicts: ['horror', 'crime'] },
  canonApproval: { id: 'canonApproval', label: 'Aprovação de roteiro', copy: 'Mudanças grandes passam pela mesa do licenciante.', risk: 6 },
  visualApproval: { id: 'visualApproval', label: 'Aprovação visual', copy: 'Personagens e marcas precisam respeitar o guia de estilo.', risk: 4 },
  noCrossover: { id: 'noCrossover', label: 'Sem crossover', copy: 'Esta licença não pode dividir o título com outra propriedade.', conflicts: ['crossover'] },
  mandatoryLead: { id: 'mandatoryLead', label: 'Protagonista obrigatório', copy: 'O personagem principal precisa estar no centro do jogo.' },
  releaseWindow: { id: 'releaseWindow', label: 'Janela de lançamento', copy: 'O primeiro projeto precisa sair antes do fim do contrato.', risk: 5 },
  brandSafety: { id: 'brandSafety', label: 'Proteção de marca', copy: 'Drogas, tortura e exploração comercial agressiva são vetadas.', conflicts: ['adult-only'] },
  likenessApproval: { id: 'likenessApproval', label: 'Aprovação de imagem', copy: 'Rostos, vozes e gestos passam por uma rodada própria de aprovação.', risk: 5 },
  gameplayApproval: { id: 'gameplayApproval', label: 'Aprovação jogável', copy: 'O licenciante recebe uma build antes de liberar a versão final.', risk: 7 },
  mandatoryMultiplayer: { id: 'mandatoryMultiplayer', label: 'Multiplayer obrigatório', copy: 'O contrato exige um modo competitivo ou cooperativo funcional.', risk: 6 },
  noGenreShift: { id: 'noGenreShift', label: 'Gênero protegido', copy: 'A proposta não pode se afastar demais da identidade aprovada.', risk: 4 },
  annualRelease: { id: 'annualRelease', label: 'Cadência anual', copy: 'A marca espera presença frequente e cobra uma janela curta.', risk: 8 },
  musicApproval: { id: 'musicApproval', label: 'Música sob consulta', copy: 'Temas, artistas e uso de faixas famosas precisam de aval separado.', risk: 4 },
  mandatoryLocalization: { id: 'mandatoryLocalization', label: 'Localização global', copy: 'O lançamento precisa cobrir os principais territórios do contrato.', risk: 5 },
}

export const clauseById = id => LICENSE_CLAUSES[id]
