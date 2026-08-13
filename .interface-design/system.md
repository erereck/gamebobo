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
- Aviso da linha do tempo: papel modal com fita regressiva de 8 segundos no rodapé; etiqueta vermelha perde comprimento da esquerda para a direita, pausa durante interação e nunca é usada em decisões obrigatórias.
- Configurações: folha única aberta pelo ícone de engrenagem no cabeçalho; switches ampliados para efeitos e avisos, carimbos existentes para moeda e ação destrutiva subordinada no rodapé.
- Player da bancada: deck CRT dentro das configurações, com capa 80 px (64 px mobile), faixa e artista como foco, play circular em fósforo e volume numa segunda linha. Música e efeitos são controles separados; nunca usar a superfície preta ou verde do Spotify literalmente.
- Iconografia: SVGs próprios em `24×24`, traço `1.8`, pontas arredondadas e `currentColor`; não misturar emojis ou outra biblioteca. Botão apenas com ícone exige `aria-label`, `title` e área mínima `44×44 px`.
- Navegação ilustrada: abas usam ícone + nome e dispensam numeração serial. O nome permanece porque as oito áreas ainda precisam ensinar sua função ao jogador novo.
- Ferramentas do cabeçalho: moeda conserva texto por ser dado; música e configurações usam ícones. O conjunto deve caber em 390 px sem esconder a marca.
- Revelação de lançamento: 700 ms de nota lacrada, contagem de 3,2 s com desaceleração forte, veredito editorial e só depois consequências. A espera longa é exclusiva desse momento raro; demais entradas ficam em 160–260 ms.
- Carimbo de estouro: aparece dentro das consequências, sem abrir outro modal. Usa CRT e fósforo para um sucesso inesperado; um fenômeno troca a borda pela etiqueta vermelha e aumenta apenas a palavra focal. Não antecipar a raridade antes das vendas contarem.
- Movimento de bancada: filhos diretos de cada tela assentam como folhas em cascata, aba ativa recebe um carimbo curto e o item mais novo da fita entra lateralmente. Somente `transform` e `opacity`; sempre respeitar movimento reduzido.
- Pulso numérico: caixa, energia e estresse contam por 682 ms, desaceleram no fim e recebem etiqueta temporária de delta sem alterar o layout; verde-fósforo é melhora e vermelho é piora, considerando que menos estresse é positivo.
- Retorno ao topo: ações que mudam o momento da carreira voltam ao primeiro conteúdo útil em 240 ms com desaceleração quartic; movimento reduzido troca a viagem por reposicionamento imediato.
- Faixa essencial mobile: uma única linha de 56 px com fundador/idade, caixa, energia e estresse. Métricas secundárias somem dessa faixa abaixo de 620 px e permanecem nas telas apropriadas.
- Impacto antes do clique: ações mensais e decisões mostram custo, faixa ou até três consequências mecânicas; `ESCOLHER` sozinho não é informação suficiente.
- Linguagem de época: divulgação e mercado usam revista/lojista nos anos 1980, demo/locadora nos 1990, site/portal nos 2000 e loja/criador somente depois de seus marcos.
- Boletim da imprensa: nota central representa o jogo; recortes menores mostram 2–4 redações historicamente disponíveis, com divergência curta e texto próprio. Discordância dá textura, não loteria.
- Chat ao vivo: superfície CRT compacta, nomes coloridos apenas para identidade e dez mensagens distintas. O percentual de aprovação reage à nota; chat só aparece depois da consolidação do vídeo/streaming.
- Circuito de eventos: credencial do mês domina a folha, próximas datas ficam numa agenda CRT lateral. Feira local abre a escada; palcos reais exigem ano, mês, reputação e caixa.
- Pasta de produção: um único CRT concentra título, trilho de protótipo/produção/polimento, promessa, progresso, pendências e playtest. Nenhuma fase ganha tela própria.
- Promessa da capa: folha clara presa ao CRT, com uma frase humana, público e peso de escopo. É a identidade do jogo; não usar árvore de recursos.
- Playtest: anexo de papel com faixa de nota, “funciona” e “trava”. Nunca revela a nota final nem exige passar o mês.
- Ficha de projeto mobile: escolhas extensas usam `select` nativo; promessas formam uma faixa horizontal com a recomendada inteira e a próxima parcialmente visível. O formulário não pode virar catálogo vertical de chips.
- Ação contextual: o primeiro botão mensal nomeia o trabalho real da fase — fechar protótipo, produzir ou polir — e descreve impacto em uma linha.
- Cerimônia de prêmios: folha rolável com um envelope dominante por vez; categorias já abertas viram recibos horizontais, vitórias ganham confete curto e `Jogo do Ano` é sempre o último e maior envelope. O botão deve permanecer alcançável em 390×500 px, `Melhor Indie` só aparece a partir de 2004 e nenhuma categoria adota dourado fora da paleta.

## Regras

- Não usar gradiente decorativo.
- Não introduzir outra cor de destaque sem função semântica.
- Não transformar todas as informações em cards iguais.
- Atalhos devem funcionar quando aparecem visualmente.
- Testar em 390 px e desktop.
