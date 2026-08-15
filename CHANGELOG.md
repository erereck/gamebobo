# Changelog

O projeto usa versões `MAJOR.MINOR.PATCH`:

- `MAJOR`: save ou conceito incompatível;
- `MINOR`: novo sistema jogável;
- `PATCH`: correção, balanceamento ou texto.

## 0.11.0 — Promessa da Capa — 2026-08-13

- Curva comercial histórica e premiações no ritmo do jogador.
- A cerimônia deixa de avançar sozinha: cada envelope espera o jogador e usa sempre o mesmo `CONTINUAR`, sem contador, aviso de último envelope ou texto de encerramento que antecipe a surpresa.
- A abertura dura 680 ms, o confete 1,1 s e o botão bloqueia toques repetidos durante 900 ms; depois disso, não existe cronômetro obrigando a leitura.
- Vendas agora partem de uma demanda contínua por nota, interpolada historicamente de 1980 a 2040, e só depois aplicam escala, era, plataforma, público, divulgação, editora, IP e variação comercial.
- Jogador e rivais compartilham `sales-model.js`; a progressão histórica e os tetos de público deixaram de existir em fórmulas paralelas.
- Um Mega Drive 94/100 em 1991 ganhou quatro regressões lifetime: 300–600 mil com alcance fraco, 700 mil–1 milhão com distribuição normal, 1–1,4 milhão com campanha e 1,5–2,3 milhões com grande editora.
- Breakouts comuns foram separados de fenômenos culturais. Em 100 mil blockbusters 97/100 ideais, nove passaram de 100 milhões, dois de 300 milhões e o máximo chegou a 412,9 milhões.
- Receita passou a descontar operação, fabricação, varejo, devoluções e suporte além de plataforma, editora e licenças, mantendo números de cópias reconhecíveis sem destruir a economia rápida da carreira.
- A auditoria completa cobriu cinco eras, cinco escalas, onze promessas, culturas, planos, rivais, carreiras de dez anos e a cauda rara; os 63 testes e a build passaram.

## 0.10.4 — Promessa da Capa — 2026-08-13

- Cabeçalho enxuto e faixa de carreira rolável no mobile.
- Moeda e música deixam de competir com a data no HUD; os controles completos continuam disponíveis na folha de configurações.
- Em telas de até 620 px, a fita mostra primeiro identidade, caixa, energia e estresse e deixa Saúde parcialmente à vista como convite ao gesto horizontal.
- Saúde, seguidores e reputação permanecem na mesma fita e podem ser alcançados integralmente, com snap suave e scrollbar própria do Gamebobo.
- Verificado em 390 px: 676 px de conteúdo percorrem uma janela de 380 px e o último indicador termina completamente visível; build e 60 testes passaram.

## 0.10.3 — Promessa da Capa — 2026-08-13

- Cerimônia de prêmios em envelopes, rolagem mobile corrigida e economia de vendas e leilões coerente.
- Cada categoria agora abre sozinha, em sequência, com suspense curto, recibos dos resultados anteriores, confete para vitórias e `Jogo do Ano` reservado ao encerramento.
- A folha de premiação ganhou rolagem vertical real, altura segura para o navegador mobile e ação final sempre alcançável; a composição foi verificada também em uma viewport de apenas 390×500 px.
- `Melhor Indie` passa a existir somente em 2004, acompanhando a consolidação histórica do termo em vez de aparecer anacronicamente nos anos 1980 e 1990.
- Retornos automáticos ao topo agora levam 240 ms, enquanto caixa, energia, estresse e demais contadores ganharam 10% mais duração, desaceleração mais expressiva e um pulso visual sem deslocar a interface.
- Jogos excepcionais com nota 90–99 recebem descoberta crítica contínua: um 99/100 no Mega Drive não fica preso a 15 mil cópias por perder um sorteio, sem transformar toda nota alta em fenômeno mundial.
- Leilões de licença passaram a respeitar idade, histórico de vendas e porte do estúdio concorrente; uma empresa nascida naquele ano não consegue mais inventar milhões para disputar uma IP.
- A auditoria preservou a cauda dos sonhos: em 100 mil blockbusters fortes, houve oito resultados acima de 100 milhões e quatro acima de 300 milhões; os 60 testes de regressão passaram.

## 0.10.2 — Promessa da Capa — 2026-08-13

- Trilha em loop com player, volume persistente, capa e uma família própria de ícones SVG.
- `stock music`, de leafotario, começa após a primeira interação da carreira, toca em loop a 18% e respeita as restrições de autoplay dos navegadores.
- O painel de configurações ganhou um deck CRT com a capa fornecida, autoria, duração, estado, play/pause, mute, volume de 0–100% e alvos de toque de 44 px.
- Título, artista e capa também são publicados na Media Session, permitindo identificação nos controles de mídia compatíveis do celular.
- Música e efeitos do gabinete são independentes; todas as preferências ficam no save e carreiras antigas recebem valores seguros sem mudança de schema.
- Uma família de dezesseis ícones SVG próprios substitui abreviações no cabeçalho, numeração das abas, `EDITAR NOME` e o caractere de fechar, preservando rótulos onde ajudam jogadores novos.
- Navegação agora combina ícone e nome; controles exclusivamente visuais possuem `aria-label`, tooltip e área mínima de 44×44 px.
- Testes reais confirmaram MP3 servido em `206`, metadata correta, ausência de overflow em 390/1365 px e zero erros de console; a suíte chegou a 56 casos.

## 0.10.1 — Promessa da Capa — 2026-08-13

- Recalibração completa de notas, escalas, vendas, culturas, promessas e raridade de fenômenos.
- A régua editorial agora trata 70 como um jogo bom com arestas, 80 como muito bom sem canonização automática, 90 como feito raro e menos de 60 como produção genuinamente quebrada.
- Jogos iniciais controlados ficam perto de 73–75; uma partida ruim ainda existe por acúmulo de bugs, exaustão, escopo inviável e decisões perigosas, não por uma moeda invisível.
- Escalas grandes ganharam custo real de complexidade, enquanto traços, culturas, playtest, crunch e promessas foram aproximados para nenhuma escolha correta resolver o jogo sozinha.
- Seguidores agora têm retorno decrescente, a cultura comercial finalmente converte marketing em alcance e eventos de produção deixaram de empilhar qualidade sem limite.
- Estouros comerciais formam uma cauda rara; fenômenos mundiais podem atravessar 100 ou 300 milhões, mas obedecem ao teto de público da década e recebem uma revelação especial no lançamento.
- Uma nova auditoria reproduzível cobre jogo inicial por era, escalas, promessas, traços, culturas, playtest, planos de lançamento, 100 mil blockbusters e carreiras autônomas de dez anos.
- Cinco regressões novas protegem a faixa inicial, desastres merecidos, cultura comercial e o teto histórico de fenômenos; a suíte agora tem 54 testes.

## 0.10.0 — Promessa da Capa — 2026-08-13

- Projetos agora nascem com uma promessa de capa e passam por protótipo, produção e polimento em uma pasta única e legível.
- Onze promessas dão identidade mecânica ao projeto: afinidade de gênero e foco, público, alcance, inovação, risco técnico e peso de escopo; opções futuras só aparecem depois de existirem.
- Promessas ambiciosas podem acrescentar meses e custo quando a escala escolhida é pequena demais; a ficha mostra o impacto antes de abrir o projeto.
- Cada fase muda a ação mensal: o protótipo prova a ideia, a produção constrói qualidade e pendências, e o polimento remove problemas antes da nota.
- Pendências reduzem qualidade e confiança se chegarem ao lançamento, tornando o acabamento uma consequência real em vez de uma etiqueta.
- Um playtest opcional por projeto entrega uma faixa incerta de nota, um ponto forte e um problema concreto sem avançar o calendário.
- O público ganho pelo lançamento agora conversa com a promessa: jogos de nicho e de apelo amplo formam audiências diferentes.
- A tela principal ganhou trilho de três fases, folha da promessa, contador de pendências e relatório físico de playtest sem criar uma nova seção.
- No celular, gênero, tema, foco, escala e plataforma viraram seletores compactos; as promessas usam uma única faixa horizontal e a ação do mês sobe para o primeiro enquadramento útil.
- Saves antigos recebem valores seguros sem mudança de schema; a suíte chegou a 50 testes e a auditoria visual passou em 390 px e 1365 px sem erros no console.

## 0.9.0 — Voz da Arquibancada — 2026-08-13

- Cada lançamento recebe de duas a quatro análises de redações disponíveis naquele ano; as notas orbitam a qualidade real do jogo e os textos comentam resultado e foco sem parecer sorteio desconexo.
- Revista Controle cobre o início da simulação; CVG, Famitsu, EGM, PC Gamer, IGN, GameSpot, Eurogamer e Canaltech entram somente depois de existirem.
- A tela de resultado revela a média primeiro e abre depois um boletim com nota, fala e formato de cada veículo.
- A partir de 2012, o plano `Estreia com criador` compra alcance, hype e uma transmissão patrocinada cuja opinião não pode ser comprada.
- Transmissões mostram dez mensagens distintas, nomes coloridos e aprovação coerente com a nota; descobertas orgânicas de streamers usam o mesmo sistema depois de 2011.
- Novo circuito jogável de eventos vai de feiras municipais a BGS, E3, gamescom, The Game Awards e Summer Game Fest, com calendário, reputação, custo, alcance e hype próprios.
- A etiqueta do painel de configurações e o título deixaram de ser recortados em 320 px; o circuito e o boletim receberam composição mobile dedicada.
- Três novos testes cobrem cronologia da imprensa, trava histórica de criadores e participação única em eventos; a suíte agora tem 45 casos.

## 0.8.0 — Pulso da Carreira — 2026-08-13

- Caixa, energia e estresse agora contam até o novo valor e mostram deltas temporários; vendas, receita e seguidores também sobem quando as consequências do lançamento aparecem.
- Passar o mês, resolver decisões, fechar resultados, trocar de tela, iniciar ou continuar uma carreira devolve o jogador ao topo.
- O painel mobile caiu para uma única faixa de 56 px com nome, idade e os três números essenciais; saúde, seguidores e reputação continuam disponíveis nas telas dedicadas.
- O título do projeto pode ser editado durante a produção sem quebrar franquia, save ou histórico.
- Toda escolha de evento expõe até três efeitos mecânicos antes do clique, e ações mensais mostram faixas reais de custo e desgaste.
- Divulgação muda com a época: revistas, demos, locadoras, sites, lojas e acesso antecipado entram somente quando fazem sentido.
- Eventos digitais receberam datas mínimas; textos de mercado, projetos e contratos foram auditados para não antecipar fóruns, streaming ou lojas digitais.
- Vendas de estúdios da mesma geração agora consideram tamanho do mercado, idade do estúdio e raridade histórica de fenômenos.
- Auditoria Monte Carlo reproduzível cobre 300 mil lançamentos por execução completa; em 1980, 50 mil amostras deram mediana de 5.075, P99 de 23.229 e máximo de 83.063 cópias.
- A suíte passou de 38 para 42 testes, incluindo regressões históricas, distribuição de vendas e renomeação.

## 0.7.2 — Edição Zero — 2026-08-13

- A nota de cada lançamento começa lacrada, sobe por 3,2 segundos e desacelera perto do resultado definitivo.
- Crítica, estrelas, vendas, receita, seguidores e botão de saída entram em etapas, preservando o suspense antes das consequências.
- Telas assentam suas folhas em uma cascata curta; abas recebem resposta de carimbo, a fita anima o acontecimento mais novo e botões ganharam pressão tátil.
- Movimento reduzido do sistema remove a contagem e as translações sem esconder nenhuma informação.

## 0.7.1 — Edição Zero — 2026-08-13

- Marcos históricos, novas plataformas e mudanças de era agora exibem uma fita regressiva de oito segundos e continuam automaticamente.
- O temporizador pausa enquanto o jogador interage com o aviso ou deixa a aba em segundo plano.
- Novo painel `CFG` concentra som, moeda, avisos da linha do tempo e acesso à criação de outra carreira.
- Avisos podem ser desligados sem apagar marcos do histórico nem notícias da indústria.
- Dois testes novos cobrem a classificação temporizada e o modo silencioso da linha do tempo.

## 0.7.0 — Edição Zero — 2026-08-13

- Nova capa inicial pensada para a primeira visita, sem criar save antes da confirmação do jogador.
- Save existente aparece como uma edição encontrada, com fundador, estúdio, data, caixa e progresso antes de continuar.
- Ficha de carreira permite escolher nome, estúdio, idade, ano entre 1980 e 2020, perfil inicial e moeda.
- A mesma ficha completa substitui o antigo reinício limitado apenas ao ano.
- Reais, dólares e euros podem ser alternados durante a carreira sem alterar o balanceamento interno.
- Barras de rolagem próprias usam papel e etiqueta vermelha em vez do estilo padrão do navegador.
- Identidade do fundador agora gera iniciais a partir do nome escolhido.
- Dois testes novos cobrem personalização e moeda; entrada e continuação foram auditadas em 320 e 390 px.

## 0.6.1 — Edição de Bolso — 2026-08-13

- Publicação estática preparada para GitHub Pages com deploy automático, teste e build a cada envio para `main`.
- Manifesto instalável, ícone próprio, metadados mobile e suporte a áreas seguras de aparelhos com recorte.
- Navegação principal fixa e horizontal com encaixe, foco automático na seção ativa e alvos de toque de pelo menos 44 px.
- Auditoria responsiva de produção em 320, 360, 390 e 430 px, incluindo overflow, legibilidade e controles.

## 0.6.0 — Mesa dos Grandes — 2026-08-13

- Relações persistentes com dez empresas reais, do primeiro contato à confiança rara.
- Envio de portfólio com custo, intervalo de seis meses e ganho baseado em provas concretas do estúdio.
- Parcerias estratégicas com verba, alcance adicional, prazo e histórico de projetos.
- Encomendas de IP exigem reputação alta e confiança excepcional; incluem licença temporária, gênero, meta, prazo, adiantamento, royalties, liberdade e bônus. Relações muito fortes também podem gerar spin-offs pequenos e deliberadamente fora do gênero habitual.
- O formulário de novo projeto incorpora o brief e impede abrir uma produção incompatível por engano.
- Entregas fortes aumentam confiança e autonomia futura; nota baixa ou prazo perdido ferem a relação.
- Valuation soma caixa, catálogo, equipe, IPs próprias, contratos licenciados, reputação, tecnologia e dívida.
- Gigantes podem apresentar proposta de controle com prêmio, autonomia, marca preservada ou revista, parcela por metas e contraproposta.
- Ser comprado não encerra o jogo: a controladora subsidia parte da operação, fica com participação e passa a encomendar com mais frequência.
- Save schema 6 migra carreiras 0.5 e corrige a cadeia de migração de schemas ainda mais antigos.
- Nova “Mesa dos grandes” dentro do Estúdio, com carta de avaliação, fichário de relações e propostas raras em CRT.
- Seis testes novos cobrem valuation, confiança, brief obrigatório, entrega, aquisição e migração.

## 0.5.0 — Parada de Milhões — 2026-08-13

- Nova tela “Paradas”, com Top 20 por década, ranking geral, líder editorial, clube do milhão e leitura de origem.
- 100 jogos históricos de base: 20 posições para cada década de 1980 a 2020.
- Vendas históricas amadurecem no calendário; uma carreira antiga não recebe lifetime futuro nem revela lançamentos adiantados.
- Jogos do jogador e da linha alternativa disputam as mesmas posições dos clássicos reais.
- Quatro estúdios fictícios nascem junto com o jogador, acumulam lançamentos, momentum, reputação e cauda de vendas.
- Estúdios da mesma turma podem produzir um estouro raro, ganhar status próprio e reescrever a parada da run.
- Catálogo de direitos ampliado de 18 para 59 IPs e sete novas condições contratuais.
- Números reportados, estimados e simulados são explicitamente diferenciados na interface.
- Save schema 5 injeta novas IPs e a turma de garagem em carreiras 0.4 sem apagar o mundo anterior.
- Quatro testes novos cobrem décadas, futuro, invasão procedural e amplitude do catálogo.

## 0.4.0 — Guerra de Direitos — 2026-08-13

- Mercado de licenças com personagens, franquias, universos e marcas reais em um banco histórico de referência.
- Elegibilidade por reputação e troféus, recusas explicadas e confiança do titular.
- Propostas temporárias com entrada, royalties, duração e chance de exclusividade.
- Leilões com ofertas de empresas concorrentes e janelas exclusivas que alteram a linha do tempo.
- Contratos ativos, vencimento, renovação, violações e condições criativas legíveis.
- Até duas IPs por projeto; crossovers ampliam alcance, empilham royalties, aprovações e volatilidade.
- Interferências de roteiro, guia visual e disputa por destaque durante o desenvolvimento.
- Lançamentos licenciados alteram popularidade, confiança, preço futuro e histórico da propriedade.
- Nova carreira pode começar em qualquer ano de 1980 a 2020.
- Catálogo curado com 37 plataformas reais e datas de lançamento por Japão, América do Norte, Europa e global.
- Linha do tempo cita empresas e jogos históricos; concorrentes reais participam da simulação alternativa.
- Três novas eras cobrem 1980–2002 antes do conteúdo que já existia.
- Nova tela “Licenças”, arquivo de hardware e rolo histórico na tela de Indústria.
- Importador de pacotes JSON com validação, IDs isolados e exemplo original.
- Save schema 4 com migração automática da versão anterior.

## 0.3.0 — Mundo em Cartucho — 2026-08-13

- Eras tecnológicas que transformam plataformas, custos e público.
- Equipe com especialidades, personalidade, moral, salário e contribuição real.
- Conversas de salário, crédito criativo, mentoria, exaustão e pedidos de demissão.
- Contratos, editoras, financiamento, royalties e pressão comercial.
- Hype, anúncio, lançamento silencioso ou campanha, pré-venda e expectativa.
- Cerimônias anuais, prêmios, rivalidades e comparações diretas.
- Relações mutáveis com concorrentes, colaboração, provocações e disputa por talentos.
- Pesquisa, cultura do estúdio, escritórios e despesas mensais.
- Gêneros híbridos podem nascer de projetos inovadores e entrar no mercado.
- Franquias acumulam reputação, expectativa, fãs e risco de desgaste.
- Projetos grandes e arrasa-quarteirão exigem estrutura; novas plataformas surgem com os anos.
- Saúde, relações e acontecimentos pessoais ligados ao ritmo de trabalho.
- Sucessão depois dos 65 anos: continuar, promover alguém da equipe ou iniciar uma nova geração sem apagar o mundo.
- Crise de insolvência com venda de participação, redução do estúdio ou recomeço preservando a carreira.
- Novo painel de indústria e dossiê completo do estúdio.
- Interface ampliada com estratégia de lançamento, atlas de gêneros, árvore de pesquisa, equipe, balcão de negócios e estante de troféus.
- Save schema 3 com migração da versão anterior.

## 0.2.0 — Fita Magnética — 2026-08-13

- Migração do protótipo para React e Vite.
- Engine e conteúdo separados da interface.
- Pós-lançamento com suporte, bugs, streamers e cauda de vendas.
- Memória de fãs, traços, filosofia, estúdio, concorrentes e franquias.
- Migração automática do save 0.1.
- Guia editorial e contrato visual.
- Versionamento e registro de prompts por script.

## 0.1.0 — Protótipo de Quarto — 2026-08-12

- Primeiro loop: projeto, meses, evento, lançamento e catálogo.
- Save local e interface responsiva sem dependências.
