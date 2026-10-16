# Balanceamento

Este arquivo é o contrato do ritmo. Os números podem mudar; a sensação abaixo não deve mudar por acidente.

## Nota

A nota nasce do **volume de trabalho** comparado com a régua da época (`eraBar`, 6% ao ano) e o tamanho do jogo. Em cima disso entram encaixe no gênero, combinação, plataforma, moda, novidade, promessa da capa, sequência, bugs, fama e sorte. Cada tamanho tem um teto suave: micro não passa de ~80.

- A régua sobe mais rápido que as ferramentas. Quem não pesquisa e não contrata perde nota com o tempo.
- Equipes grandes rendem um pouco menos por pessoa (lei de Brooks de bolso).
- Estúdios famosos são julgados com mais rigor (até −4,5 pontos de qualidade).

## Vendas

Demanda histórica × curva de qualidade (expoente 2,4) × tamanho da plataforma × alcance do tamanho × fãs × hype × moda × combinação × encaixe na plataforma. Jogos 80+ têm chance pequena de viralizar (2× a 4,2×).

## Metas medidas pelo robô sensato

`npm run balance -- 18 25 sensato` (18 carreiras, 25 anos, seis eras iniciais):

| Faixa | p10 | p50 | p90 | 9+ | Retorno p50* | Prejuízo |
|---|---:|---:|---:|---:|---:|---:|
| jogos 1–3 | 6,0 | 7,0 | 7,8 | 0% | 4,8× | 2% |
| jogos 4–8 | 6,3 | 7,3 | 8,5 | 1% | 5,7× | 2% |
| jogos 9–16 | 6,3 | 7,3 | 8,5 | 3% | 3,4× | 6% |
| jogos 17–30 | 6,5 | 7,5 | 8,5 | 4% | 2,4× | 6% |
| jogos 31+ | 6,5 | 7,8 | 9,0 | 11% | 2,2× | 12% |

\* receita dividida por custo de produção + salários da equipe do projeto. Os primeiros jogos parecem lucrativos porque o fundador não recebe salário; aluguel e custo de vida ficam fora da conta.

Equipes mais fortes que o tamanho pede terminam até 45% antes; equipes fracas atrasam até 30%.

Ritmo de escritório (mediana do robô, que joga perto do ótimo): garagem no 1º ano, salinha no 3º, escritório no 6º, sede no 12º (16 de 18 carreiras chegam lá). Na medição da 1.1.0 o robô sensato não faliu nenhuma vez; carreiras de 1980 que apostam em console durante o crash de 1983 continuam sendo as mais arriscadas.

A coletiva de imprensa não entra na conta: o robô fecha a janela sem responder. Respostas mexem pouco (fãs em %, humor da equipe, hype guardado para o próximo jogo com teto de 40) e a polêmica é uma aposta de valor esperado parecido com a resposta confiante.

O robô preguiçoso (só PC, sozinho, sem pesquisa, combinações aleatórias) começa perto de 6,8 e cai para 5,8 com as décadas (p10 de 4,3). Ele quebra várias vezes e volta pro quarto, que é exatamente o recado do jogo.

## Antes de aceitar mudança em nota ou economia

1. `npm run test`
2. `npm run balance -- 18 25 sensato`
3. `npm run balance -- 12 25 preguicoso`
4. Comparar com a tabela acima. Se mudou de propósito, atualize a tabela.
