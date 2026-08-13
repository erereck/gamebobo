const eras = [
  { from: 1980, to: 1984, publicWord: 'leitores e lojistas', announce: 'APRESENTAR ÀS REVISTAS', quiet: 'Levar cópias a feiras e deixar o jogo circular.', plans: {
    shadow: ['Distribuição de garagem', 'Poucas cópias, feiras e boca a boca. Alcance baixo, cobrança baixa.'],
    standard: ['Anúncio em revista', 'Screenshots, uma coluna impressa e contato com lojistas.'],
    campaign: ['Feiras e distribuidores', 'Compra espaço impresso e tenta garantir lugar na prateleira.'],
  } },
  { from: 1985, to: 1993, publicWord: 'revistas, locadoras e jogadores', announce: 'REVELAR À IMPRENSA', quiet: 'Preparar uma demo sem prometer data para as revistas.', plans: {
    shadow: ['Lançamento discreto', 'Pouca tiragem e conversa direta com lojas especializadas.'],
    standard: ['Demo e anúncio em revista', 'Screenshots, disquete de demonstração e espaço editorial.'],
    campaign: ['Campanha nas locadoras', 'Revistas, material de balcão e distribuidores empurram o jogo.'],
  } },
  { from: 1994, to: 2002, publicWord: 'imprensa, fóruns e jogadores', announce: 'ANUNCIAR À IMPRENSA', quiet: 'Guardar a build até o demo em CD estar apresentável.', plans: {
    shadow: ['Lançamento sem alarde', 'Uma tiragem cautelosa e divulgação quase toda editorial.'],
    standard: ['Demo em CD', 'Kit para revistas, screenshots e demonstração jogável.'],
    campaign: ['Campanha de lançamento', 'Publicidade impressa, eventos e espaço caro nas lojas.'],
  } },
  { from: 2003, to: 2006, publicWord: 'sites, fóruns e jogadores', announce: 'ANUNCIAR NA INTERNET', quiet: 'Trabalhar sem abrir site nem mandar build para portais.', plans: {
    shadow: ['Soltar nos fóruns', 'Divulgação direta e alcance pequeno, sem campanha formal.'],
    standard: ['Site, demo e imprensa', 'Página oficial, demo para download e contato com portais.'],
    campaign: ['Campanha online e impressa', 'Banners, revistas e eventos compram atenção.'],
    early: ['Beta fundador', 'Uma comunidade pequena paga antes e testa a build.'],
  } },
  { from: 2007, to: 2011, publicWord: 'lojas digitais, sites e jogadores', announce: 'PUBLICAR O ANÚNCIO', quiet: 'Manter a página da loja em rascunho e trabalhar em silêncio.', plans: {
    shadow: ['Lançamento surpresa', 'A página entra no ar sem campanha. Menos expectativa e alcance.'],
    standard: ['Página de loja e trailer', 'Screenshots, trailer curto e alguma divulgação em sites.'],
    campaign: ['Campanha digital', 'Compra banners, destaque e cobertura de lançamento.'],
    early: ['Pré-venda com beta', 'Jogadores pagam antes e recebem uma build de teste.'],
  } },
  { from: 2012, to: 9999, publicWord: 'lojas, criadores e jogadores', announce: 'ANUNCIAR JOGO', quiet: 'Ainda dá para trabalhar sem página pública nem trailer.', plans: {
    shadow: ['Lançamento surpresa', 'Sem campanha. Menos expectativa e menos alcance.'],
    standard: ['Página de loja e trailer', 'Screenshots, trailer e divulgação básica.'],
    campaign: ['Campanha grande', 'Compra atenção em lojas, eventos e criadores. A cobrança vem junto.'],
    early: ['Acesso antecipado', 'Vende antes de terminar e transforma jogador em testador.'],
    creator: ['Estreia com criador', 'Uma transmissão patrocinada amplia o alcance. A opinião ao vivo continua sendo dele.'],
  } },
]

export const marketingForYear = year => eras.find(era => year >= era.from && year <= era.to) ?? eras.at(-1)

export const launchPlanMechanics = Object.freeze({
  shadow: { cost: 0, effect: 'ALCANCE −12% · PRESSÃO BAIXA' },
  standard: { cost: 1200, effect: 'ALCANCE BASE' },
  campaign: { cost: 8000, effect: 'HYPE +14 · ALCANCE +30%' },
  early: { cost: 500, effect: 'CAIXA AGORA · QUALIDADE −4' },
  creator: { cost: 3600, effect: 'HYPE +8 · ALCANCE +18% · CHAT AO VIVO' },
})
