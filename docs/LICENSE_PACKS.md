# Pacotes externos de licenças

A tela **Licenças** aceita um `.json` local. O pacote é validado, normalizado e salvo dentro da carreira atual. Ele não modifica arquivos do projeto.

Exemplo pronto: `public/content-packs/example-license-pack.json`.

## Formato

```json
{
  "name": "Meu pacote",
  "version": 1,
  "licenses": [
    {
      "id": "nome-estavel",
      "name": "Nome visível",
      "owner": "Titular na simulação",
      "kind": "character",
      "availableFrom": 1994,
      "popularity": 70,
      "prestige": 55,
      "minReputation": 30,
      "minTrophies": 0,
      "baseCost": 2000000,
      "royalty": 0.12,
      "durationYears": 4,
      "genres": ["action"],
      "themes": ["crime"],
      "audiences": ["adolescente"],
      "clauses": ["heroIntegrity", "teenRating"]
    }
  ]
}
```

## Valores aceitos

- `kind`: `character`, `franchise`, `universe` ou `brand`;
- `royalty`: decimal entre `0.05` e `0.30`;
- `popularity`, `prestige`, `minReputation`: `0–100`;
- `clauses`: IDs declarados em `src/game/data/licenseClauses.js`;
- gêneros e temas desconhecidos continuam válidos no dossiê, mas não recebem bônus de afinidade até existirem no catálogo do jogo.

IDs externos recebem automaticamente o prefixo `mod-`. Uma entrada repetida ou sem nome/titular é ignorada; o restante do pacote continua sendo importado.

O importador é uma facilidade técnica, não uma licença para redistribuir propriedade de terceiros. Veja `docs/CONTENT_NOTICE.md`.
