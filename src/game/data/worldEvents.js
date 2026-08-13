export const WORLD_EVENTS = [
  {
    id: 'store-crash', tag: 'MERCADO', title: 'A maior loja digital ficou fora do ar.',
    body: 'Lançamentos de hoje não aparecem na busca. A empresa diz que está “investigando”.',
    choices: [
      { id: 'delay', label: 'Adiar lançamento', detail: 'Só afeta projeto quase pronto.', outcome: 'A nova data foi para a semana seguinte.', effects: { project: { months: 1, hype: -3 } } },
      { id: 'direct', label: 'Vender direto', detail: 'Alcance menor, margem maior.', outcome: 'Você montou uma página de pagamento em uma madrugada.', effects: { project: { reach: -0.08, directMargin: 0.12 } } },
      { id: 'wait', label: 'Esperar', detail: 'O mercado segue.', outcome: 'A loja voltou oito horas depois.', effects: {} },
    ],
  },
  {
    id: 'engine-license', tag: 'TECNOLOGIA', title: 'Uma engine popular mudou a licença.',
    body: 'Projetos acima de certo faturamento terão uma taxa nova. O fórum está em guerra.',
    choices: [
      { id: 'own', label: 'Investir em ferramenta própria', detail: '+ pesquisa, - caixa.', outcome: 'Você abriu uma pasta chamada engine_nova.', effects: { player: { money: -6000 }, studio: { research: 8 } } },
      { id: 'accept', label: 'Aceitar a taxa', detail: 'Menos risco técnico.', outcome: 'A planilha ganhou mais uma coluna.', effects: { flag: { engineFee: true } } },
      { id: 'old', label: 'Ficar na versão antiga', detail: 'Seguro agora, limita tecnologia.', outcome: 'As atualizações automáticas foram desligadas.', effects: { flag: { legacyEngine: true } } },
    ],
  },
  {
    id: 'platform-war', tag: 'GUERRA DE CONSOLES', title: 'Duas plataformas marcaram evento para o mesmo dia.',
    body: 'Uma fala em potência. A outra mostra um controle que parece brinquedo.',
    choices: [
      { id: 'power', label: 'Apostar na potência', detail: 'Visual ganha atenção.', outcome: 'Seu próximo trailer vai precisar parecer caro.', effects: { market: { platformShift: ['leader', 8] } } },
      { id: 'toy', label: 'Apostar no controle estranho', detail: 'Inovação ganha atenção.', outcome: 'Ninguém sabe ainda como portar direito.', effects: { market: { platformShift: ['challenger', 8] } } },
      { id: 'pc', label: 'Continuar no PC', detail: 'Você já conhece o terreno.', outcome: 'O fórum aprovou por motivos incompatíveis entre si.', effects: { market: { platformShift: ['pc', 6] } } },
    ],
  },
  {
    id: 'review-scandal', tag: 'IMPRENSA', title: 'Descobriram notas pagas numa revista grande.',
    body: 'Editoras retiraram anúncios. Leitores estão revendo análises antigas.',
    choices: [
      { id: 'statement', label: 'Publicar sua política', detail: 'Ganha confiança, se alguém ler.', outcome: 'O texto teve 94 visualizações.', effects: { player: { reputation: 2 }, audience: { trust: 3 } } },
      { id: 'silence', label: 'Não entrar nisso', detail: 'Sem risco.', outcome: 'A discussão seguiu sem você.', effects: {} },
      { id: 'joke', label: 'Fazer uma piada ruim', detail: 'Pode pegar mal.', outcome: 'Você apagou onze minutos depois.', effects: { player: { reputation: -1 }, audience: { trust: -1 } } },
    ],
  },
]
