export const DEBT_CRISIS = {
  id: 'cash-collapse',
  tag: 'REUNIÃO COM O BANCO',
  title: 'O caixa deixou de ser um problema abstrato.',
  body: 'Salários, aluguel e parcelas continuam vencendo. Há saídas, mas nenhuma devolve exatamente o estúdio que entrou nesta sala.',
  choices: [
    { id: 'equity', label: 'Vender 30% do estúdio', detail: 'R$ 300 mil e participação permanente.', outcome: 'O dinheiro entrou. A partir de agora, nem toda receita é sua.', effects: { player: { money: 300000, reputation: -3 }, studio: { equity: 0.3, morale: -5 } } },
    { id: 'downsize', label: 'Encolher imediatamente', detail: 'Escritório e equipe pagam a conta.', outcome: 'As caixas saíram antes que alguém tivesse tempo de escrever o nome nelas.', effects: { restructure: 'downsize', player: { money: 70000 }, studio: { morale: -18, reputation: -4 } } },
    { id: 'insolvency', label: 'Fechar e recomeçar menor', detail: 'Preserva o save, não a empresa.', outcome: 'O CNPJ acabou. A carreira, não.', effects: { restructure: 'restart', player: { reputation: -14 }, audience: { trust: -7 } } },
  ],
}
