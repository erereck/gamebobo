const company = (id, name, availableFrom, specialty, ipIds, voice, strategy, acquisitionFloor, autonomy) => ({
  id, name, availableFrom, specialty, ipIds, voice, strategy, acquisitionFloor, autonomy,
})

export const CORPORATE_PARTNERS = [
  company('nintendo', 'Nintendo', 1980, 'design', ['mario', 'zelda-ip', 'metroid', 'kirby', 'animal-crossing', 'pokemon'], 'Começa com um projeto pequeno. Se funcionar, a conversa fica menos vigiada.', 'Jogabilidade legível, acabamento e confiança de longo prazo.', 85000000, 64),
  company('capcom', 'Capcom', 1983, 'action', ['street-fighter', 'resident-evil', 'monster-hunter', 'mega-man'], 'Gosta de equipe que resolve problema no controle, não no discurso.', 'Ação, produção disciplinada e franquias capazes de durar.', 70000000, 58),
  company('sega', 'Sega', 1980, 'action', ['sonic'], 'Aceita uma ideia rápida se ela souber exatamente por que precisa existir.', 'Velocidade, personalidade e projetos com gancho imediato.', 45000000, 68),
  company('bandai-namco', 'Bandai Namco', 1980, 'fighting', ['dragon-ball', 'pac-man-ip', 'tekken-ip', 'gundam'], 'Tem muitas propriedades e pouca paciência para equipes que atrasam aprovação.', 'Catálogo amplo, ação e adaptação global.', 65000000, 55),
  company('warner', 'Warner Bros.', 1986, 'action', ['batman', 'superman', 'dc-universe', 'harry-potter', 'mortal-kombat', 'matrix'], 'A reunião sempre tem mais gente do que você esperava.', 'Grandes marcas, janela coordenada e alcance mundial.', 110000000, 42),
  company('disney', 'Disney', 1980, 'adventure', ['disney', 'pixar', 'toy-story', 'marvel-universe', 'spider-man', 'star-wars', 'avatar'], 'A porta abre devagar e fecha rápido quando a marca corre risco.', 'Marca protegida, público amplo e execução previsível.', 140000000, 38),
  company('mattel', 'Mattel', 1984, 'racing', ['barbie', 'hot-wheels', 'hot-wheels-unleashed'], 'Procura formatos novos para marcas que já vivem fora dos videogames.', 'Brinquedo, família e ideias fáceis de explicar.', 42000000, 62),
  company('paramount', 'Paramount', 1989, 'adventure', ['tmnt', 'spongebob', 'transformers'], 'Quer reconhecer a propriedade no primeiro minuto, mas aceita uma boa esquisitice.', 'Personagens fortes e adaptação para públicos diferentes.', 55000000, 54),
  company('electronic-arts', 'Electronic Arts', 1982, 'sports', ['fifa'], 'Confia em calendário, escala e capacidade de dar suporte depois da estreia.', 'Produção recorrente, esporte e operação de longo prazo.', 95000000, 45),
  company('netflix', 'Netflix', 2016, 'story', ['stranger-things'], 'Pensa em catálogo e conversa cultural antes de pensar em caixa de loja.', 'Narrativa, lançamento global e descoberta por audiência.', 60000000, 52),
]

export const corporatePartnerById = id => CORPORATE_PARTNERS.find(item => item.id === id)
