# Gamebobo — sistema de interface

## Direção

Uma escrivaninha de dev brasileiro no começo dos anos 2000: gabinete bege, CRT azul, papel de formulário, etiqueta vermelha e fósforo verde. Deve parecer um jogo de carreira, não um dashboard de startup nem uma paródia de Windows 95.

## Assinatura

A **fita da carreira** registra mês, decisão e consequência em blocos físicos. Ela aparece na tela principal, no histórico, em eventos e no resumo de lançamento.

## Profundidade

Sombras curtas e discretas, como papel e caixas apoiados numa mesa. Inputs são insetos. CRT é a única superfície escura e serve para trabalho em andamento ou tendência dominante.

## Tokens

- mesa `#d7c9aa`
- papel `#f3ecd9`
- papel fundo `#e4d8ba`
- tinta `#17253b`
- CRT `#14243b`
- fósforo `#b7df68`
- etiqueta `#d85240`
- unidade de espaço: 4 px
- raio: 3 / 7 / 11 px

## Tipografia

- Display: Arial Black, condensada por tracking negativo.
- Interface: Trebuchet MS / Arial Narrow.
- Datas, números e metadados: Courier New.
- Texto editorial: Georgia itálico, usado com parcimônia.

## Hierarquia

O projeto ou acontecimento atual é sempre o foco. Estatísticas formam uma faixa secundária. Mercado aparece como recorte, nunca como painel equivalente ao projeto.

## Componentes

- Botão primário: 44 px, etiqueta vermelha, 3 px de raio, texto 12/900.
- Botão secundário: 44 px, papel fundo, borda baixa.
- Card de bancada: papel, raio 7 px, sombra curta.
- Card CRT: azul, fósforo apenas para valor focal.
- Modal: raio 11 px, entrada 200–220 ms, backdrop azul escuro.
- Linha de era: papel contínuo; a era atual vira etiqueta vermelha, não um card flutuante.
- Pessoa: retrato tipográfico em CRT, nome, função e uma linha humana; botão de gestão fica subordinado.
- Tecnologia futura: papel fundo e opacidade baixa. Tecnologia dominada usa fósforo com baixa saturação.
- Relação entre estúdios: régua horizontal com extremos vermelho e verde, sem criar uma nova paleta.
- Mercado de licenças: fichário estreito à esquerda e um único dossiê dominante à direita. Nunca virar grade de loja.
- Dossiê de IP: cabeçalho CRT, carimbo inclinado, fita de métricas, termos em quatro colunas e anexo físico de cláusulas.
- Contrato ativo: fita horizontal de vigência; verde-fósforo significa assinado, vermelho significa recusa, disputa ou violação.
- Leilão: quadro CRT com lances comparáveis na mesma linha. O dinheiro mínimo e o prazo ficam visíveis antes da ação.
- Crossover: duas etiquetas de IP lado a lado. Não criar cor própria; o risco aparece em texto, royalties e pressão.
- Mesa corporativa: valuation em carta dominante, fichário estreito de empresas e um dossiê de relação; proposta de aquisição usa CRT porque altera a estrutura do save.
- Relação empresarial: quatro marcos na mesma régua — contato, parceria, IP confiada e aquisição. Não usar XP, medalhas ou cores por companhia.
- Brief encomendado: fita CRT com IP, nota, prazo e bônus; no formulário, a licença obrigatória recebe “BRIEF” e não pode ser desmarcada.
- Entrada da carreira: capa “Edição Zero” em CRT ao lado de uma ficha de inscrição em papel. Save existente vira “edição encontrada”; nunca usar tela de login ou onboarding em carrossel.
- Ficha de inscrição: campos insetos, ano em fita CRT, perfis como recortes de papel e moeda em três carimbos. Botão de início só ativa com fundador e estúdio preenchidos.
- Scrollbar: trilho em papel fundo e polegar de etiqueta vermelha, fino no documento e em superfícies roláveis; barras horizontais de navegação podem continuar ocultas quando o gesto já é evidente.

## Regras

- Não usar gradiente decorativo.
- Não introduzir outra cor de destaque sem função semântica.
- Não transformar todas as informações em cards iguais.
- Atalhos devem funcionar quando aparecem visualmente.
- Testar em 390 px e desktop.
