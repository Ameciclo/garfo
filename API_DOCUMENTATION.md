# Documentação da API Garfo

Este documento descreve os endpoints disponíveis na API Garfo, uma API para acesso a dados de mobilidade urbana, incluindo contagens de ciclistas, infraestrutura cicloviária e dados de sinistros de trânsito.

## Índice

1. [Cidades](#1-cidades)
2. [Contagens de Ciclistas](#2-contagens-de-ciclistas)
3. [Infraestrutura Cicloviária](#3-infraestrutura-cicloviária)
4. [Sinistros de Trânsito (CTTU)](#4-sinistros-de-trânsito-cttu)
5. [Mortes no Trânsito (DATASUS)](#5-mortes-no-trânsito-datasus)
6. [Chamadas do SAMU](#6-chamadas-do-samu)

## 1. Cidades

### Listar Cidades

**Endpoint:** `/cities`

**Método:** GET

**Descrição:** Retorna a lista de cidades disponíveis.

**Exemplo de Uso:**
```
GET http://localhost:8080/cities
```

## 2. Contagens de Ciclistas

### Resumo de Contagens

**Endpoint:** `/cyclist-counts`

**Método:** GET

**Descrição:** Retorna um resumo das contagens de ciclistas.

**Exemplo de Uso:**
```
GET http://localhost:8080/cyclist-counts
```

### Contagens por Edição

**Endpoint:** `/cyclist-counts/edition`

**Método:** GET

**Descrição:** Retorna dados de contagens de ciclistas por edição.

**Exemplo de Uso:**
```
GET http://localhost:8080/cyclist-counts/edition
```

## 3. Infraestrutura Cicloviária

### Relações de Infraestrutura

**Endpoint:** `/cyclist-infra/relations`

**Método:** GET

**Descrição:** Retorna relações de infraestrutura cicloviária.

**Exemplo de Uso:**
```
GET http://localhost:8080/cyclist-infra/relations
```

### Relações por Cidade

**Endpoint:** `/cyclist-infra/relationsByCity`

**Método:** GET

**Descrição:** Retorna relações de infraestrutura cicloviária por cidade.

**Exemplo de Uso:**
```
GET http://localhost:8080/cyclist-infra/relationsByCity
```

### Detalhes de Relação

**Endpoint:** `/cyclist-infra/relation`

**Método:** GET

**Parâmetros:**
- `id`: ID da relação

**Descrição:** Retorna detalhes de uma relação específica.

**Exemplo de Uso:**
```
GET http://localhost:8080/cyclist-infra/relation?id=123
```

### Vias Cicloviárias

**Endpoint:** `/cyclist-infra/ways`

**Método:** GET

**Descrição:** Retorna dados de vias cicloviárias.

**Exemplo de Uso:**
```
GET http://localhost:8080/cyclist-infra/ways
```

## 4. Sinistros de Trânsito (CTTU)

### Resumo de Sinistros

**Endpoint:** `/traffic-crashes/summary`

**Método:** GET

**Descrição:** Retorna um resumo dos sinistros de trânsito.

**Exemplo de Uso:**
```
GET http://localhost:8080/traffic-crashes/summary
```

### Dados Geoespaciais de Sinistros

**Endpoint:** `/traffic-crashes/geojson`

**Método:** GET

**Descrição:** Retorna dados geoespaciais de sinistros de trânsito em formato GeoJSON.

**Exemplo de Uso:**
```
GET http://localhost:8080/traffic-crashes/geojson
```

### Sinistros por Tipo de Veículo

**Endpoint:** `/traffic-crashes/vehicles`

**Método:** GET

**Descrição:** Retorna dados de sinistros por tipo de veículo.

**Exemplo de Uso:**
```
GET http://localhost:8080/traffic-crashes/vehicles
```

### Resumo de Sinistros por Rua

**Endpoint:** `/traffic-crashes/streets-summary`

**Método:** GET

**Descrição:** Retorna um resumo dos sinistros de trânsito por rua.

**Exemplo de Uso:**
```
GET http://localhost:8080/traffic-crashes/streets-summary
```

## 5. Mortes no Trânsito (DATASUS)

### Sumário de Informações

**Endpoint:** `/datasus-deaths/summary`

**Método:** GET

**Descrição:** Retorna um resumo das mortes no trânsito na RMR, incluindo totais, crescimento anual e ano mais violento.

**Exemplo de Uso:**
```
GET http://localhost:8080/datasus-deaths/summary
```

**Resposta:**
```json
{
  "porLocalOcorrencia": {
    "totalSinistrosUltimos10Anos": 1234,
    "totalUltimoAno": 123,
    "ultimoAno": 2022,
    "crescimentoRelacaoAnoAnterior": 5.2,
    "anoMaisViolento": {
      "ano": 2019,
      "total": 150
    },
    "dadosPorAno": [
      { "ano": 2013, "total": 120 },
      { "ano": 2014, "total": 125 },
      // ...
    ]
  },
  "porLocalResidencia": {
    // Mesma estrutura que porLocalOcorrencia
  }
}
```

### Matriz de Colisão

**Endpoint:** `/datasus-deaths/matrix`

**Método:** GET

**Parâmetros:**
- `cityId` (opcional): ID do município específico (se não informado, usa todos da RMR)
- `startYear` (opcional): Ano inicial para filtrar (padrão: últimos 10 anos)
- `endYear` (opcional): Ano final para filtrar (padrão: ano atual)
- `byResidence` (opcional): Se `true`, usa local de residência; se `false` ou não informado, usa local de ocorrência
- `deathLocation` (opcional): Código do local de ocorrência do óbito (1 = hospital, 2 = outros estabelecimentos de saúde, 3 = domicílio, 4 = via pública, 5 = outros, 9 = ignorado). Aceita múltiplos valores separados por vírgula (ex: `1,2` para locais de saúde)

**Descrição:** Retorna uma matriz de colisão mostrando o número de mortes por tipo de vítima e contraparte.

**Exemplos de Uso:**
```
# Matriz de colisão para toda a RMR por local de ocorrência
GET http://localhost:8080/datasus-deaths/matrix

# Matriz de colisão para o Recife em 2023
GET http://localhost:8080/datasus-deaths/matrix?cityId=2611606&startYear=2023&endYear=2023

# Matriz de colisão por local de residência
GET http://localhost:8080/datasus-deaths/matrix?byResidence=true

# Matriz de colisão para o Recife entre 2018 e 2022 por local de residência
GET http://localhost:8080/datasus-deaths/matrix?cityId=2611606&startYear=2018&endYear=2022&byResidence=true

# Matriz de colisão para mortes ocorridas em via pública
GET http://localhost:8080/datasus-deaths/matrix?deathLocation=4

# Matriz de colisão para mortes ocorridas em locais de saúde (hospitais e outros estabelecimentos)
GET http://localhost:8080/datasus-deaths/matrix?deathLocation=1,2

# Matriz de colisão para mortes ocorridas em outros locais (domicílio, outros e ignorado)
GET http://localhost:8080/datasus-deaths/matrix?deathLocation=3,5,9
```

**Resposta:**
```json
{
  "matrix": {
    "pedestre": {
      "pedestre": 0,
      "ciclista": 5,
      "motociclista": 25,
      "ocupanete_automovel": 120,
      "onibus": 30,
      "outros": 3,
      "objeto_fixo": 0,
      "sem_colisao": 0,
      "nao_especificado": 10,
      "total": 193
    },
    "ciclista": {
      "pedestre": 2,
      "ciclista": 3,
      "motociclista": 8,
      "ocupanete_automovel": 45,
      "onibus": 12,
      "outros": 1,
      "objeto_fixo": 10,
      "sem_colisao": 15,
      "nao_especificado": 5,
      "total": 101
    },
    // ... outros modos de transporte
    "total": {
      "pedestre": 5,
      "ciclista": 10,
      "motociclista": 50,
      "ocupanete_automovel": 280,
      "onibus": 60,
      "outros": 15,
      "objeto_fixo": 70,
      "sem_colisao": 50,
      "nao_especificado": 60,
      "total": 600
    }
  },
  "metadata": {
    "cityId": 2611606,
    "startYear": 2023,
    "endYear": 2023,
    "byResidence": false,
    "deathLocation": "4",
    "locationType": "Local de Ocorrência",
    "description": "Matriz de colisão mostrando o número de mortes por tipo de vítima e contraparte"
  }
}
```

### Mortes por Cidade e Ano

**Endpoint:** `/datasus-deaths/cities-by-year`

**Método:** GET

**Parâmetros:**
- `type` (opcional): Tipo de local a considerar (`occurrence` ou `residence`). Padrão: `occurrence`.
- `deathLocation` (opcional): Código do local de ocorrência do óbito (1 = hospital, 2 = outros estabelecimentos de saúde, 3 = domicílio, 4 = via pública, 5 = outros, 9 = ignorado). Aceita múltiplos valores separados por vírgula (ex: `1,2` para locais de saúde).

**Parâmetros legados (ainda suportados para compatibilidade):**
- `tipo`: Equivalente a `type` (`ocorrencia` = `occurrence`, `residencia` = `residence`)
- `localOcorrenciaObito`: Equivalente a `deathLocation`

**Descrição:** Retorna dados de mortes por cidade da RMR, divididos por ano e modo de transporte.

**Exemplo de Uso:**
```
GET http://localhost:8080/datasus-deaths/cities-by-year
GET http://localhost:8080/datasus-deaths/cities-by-year?type=residence
GET http://localhost:8080/datasus-deaths/cities-by-year?deathLocation=4
GET http://localhost:8080/datasus-deaths/cities-by-year?type=occurrence&deathLocation=4
GET http://localhost:8080/datasus-deaths/cities-by-year?deathLocation=1,2
GET http://localhost:8080/datasus-deaths/cities-by-year?deathLocation=3,5,9
```

**Resposta:**
```json
{
  "locationType": "Occurrence Location",
  "deathLocation": {
    "value": "4",
    "description": "Via pública"
  },
  "years": [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
  "transportModes": ["Pedestre", "Ciclista", "Motociclista", "Ocupante de automóvel", "Ocupante de ônibus", "Outros modos"],
  "cities": [
    {
      "id": 2611606,
      "name": "Recife",
      "2013": 50,
      "2014": 55,
      // ... outros anos
      "total": 500,
      "transportModes": {
        "Pedestre": {
          "2013": 15,
          "2014": 18,
          // ... outros anos
          "total": 150
        },
        "Motociclista": {
          "2013": 25,
          "2014": 28,
          // ... outros anos
          "total": 250
        },
        // ... outros modos de transporte
      }
    },
    // ... outras cidades
  ]
}
```

### Filtros Avançados

**Endpoint:** `/datasus-deaths/filtros`

**Método:** GET

**Parâmetros:**
- `cityId` (opcional): ID do município específico (se não informado, usa todos da RMR)
- `locationType` (opcional): `residence` ou `occurrence` (padrão: `occurrence`)
- `startYear` (opcional): Ano inicial para filtrar (padrão: últimos 10 anos)
- `endYear` (opcional): Ano final para filtrar
- `gender` (opcional): Código do sexo (1 = Masculino, 2 = Feminino)
- `race` (opcional): Código da raça/cor (1 = Branca, 2 = Preta, 4 = Parda, etc.)
- `ageMin` (opcional): Idade mínima
- `ageMax` (opcional): Idade máxima
- `transportMode` (opcional): Código do modo de transporte (V0 = Pedestre, V2 = Motociclista, V4 = Ocupante de automóvel, etc.)
- `deathLocation` (opcional): Código do local de ocorrência do óbito (1 = hospital, 2 = outros estabelecimentos de saúde, 3 = domicílio, 4 = via pública, 5 = outros, 9 = ignorado). Aceita múltiplos valores separados por vírgula (ex: `1,2` para locais de saúde)

**Parâmetros legados (ainda suportados para compatibilidade):**
- `municipio`: Equivalente a `cityId`
- `tipoLocal`: Equivalente a `locationType` (`residencia` = `residence`, `ocorrencia` = `occurrence`)
- `anoInicio`: Equivalente a `startYear`
- `anoFim`: Equivalente a `endYear`
- `sexo`: Equivalente a `gender`
- `racacor`: Equivalente a `race`
- `faixaEtariaMin`: Equivalente a `ageMin`
- `faixaEtariaMax`: Equivalente a `ageMax`
- `modoTransporte`: Equivalente a `transportMode`
- `localOcorrenciaObito`: Equivalente a `deathLocation`

### Causas Secundárias

**Endpoint:** `/datasus-deaths/causas-secundarias`

**Método:** GET

**Parâmetros:**
- `cityId` (opcional): ID do município específico (se não informado, usa todos da RMR)
- `locationType` (opcional): `residence` ou `occurrence` (padrão: `occurrence`)
- `startYear` (opcional): Ano inicial para filtrar (padrão: últimos 10 anos)
- `endYear` (opcional): Ano final para filtrar (padrão: ano atual)
- `ageMin` (opcional): Idade mínima para filtrar
- `ageMax` (opcional): Idade máxima para filtrar
- `gender` (opcional): Código do sexo (1 = Masculino, 2 = Feminino)
- `transportMode` (opcional): Código do modo de transporte (V0 = Pedestre, V2 = Motociclista, etc.)
- `deathLocation` (opcional): Código do local de ocorrência do óbito (1 = hospital, 2 = outros estabelecimentos de saúde, 3 = domicílio, 4 = via pública, 5 = outros, 9 = ignorado). Aceita múltiplos valores separados por vírgula (ex: `1,2` para locais de saúde)

**Parâmetros legados (ainda suportados para compatibilidade):**
- `tipoLocal`: Equivalente a `locationType`
- `idadeMin`: Equivalente a `ageMin`
- `idadeMax`: Equivalente a `ageMax`
- `sexo`: Equivalente a `gender`
- `modoTransporte`: Equivalente a `transportMode`
- `localOcorrenciaObito`: Equivalente a `deathLocation`

**Descrição:** Retorna as causas secundárias das mortes por sinistro de trânsito, agrupadas por linhas da declaração de óbito (A, B, C, D e II).

**Exemplos de Uso:**
```
# Todas as causas secundárias na RMR
GET http://localhost:8080/datasus-deaths/causas-secundarias

# Causas secundárias para óbitos em via pública
GET http://localhost:8080/datasus-deaths/causas-secundarias?deathLocation=4

# Causas secundárias para óbitos em locais de saúde (hospitais e outros estabelecimentos)
GET http://localhost:8080/datasus-deaths/causas-secundarias?deathLocation=1,2

# Causas secundárias para motociclistas
GET http://localhost:8080/datasus-deaths/causas-secundarias?transportMode=V2

# Causas secundárias para homens entre 20 e 29 anos
GET http://localhost:8080/datasus-deaths/causas-secundarias?gender=1&ageMin=20&ageMax=29

# Combinação de filtros
GET http://localhost:8080/datasus-deaths/causas-secundarias?cityId=2611606&startYear=2018&endYear=2022&transportMode=V2&deathLocation=4
```

**Resposta:**
```json
{
  "filtrosAplicados": {
    "city": 2611606,
    "locationType": "occurrence",
    "yearPeriod": {
      "start": 2018,
      "end": 2022
    },
    "transportMode": {
      "code": "V2",
      "description": "Motociclista"
    },
    "deathLocation": {
      "code": "4",
      "description": "Via pública"
    }
  },
  "totalRegistros": 150,
  "causasSecundarias": {
    "linhaa": [
      { "codigo": "S06.9", "count": 45 },
      { "codigo": "S27.9", "count": 30 },
      { "codigo": "T07", "count": 25 },
      // ...
    ],
    "linhab": [
      { "codigo": "T14.9", "count": 40 },
      { "codigo": "S36.9", "count": 35 },
      // ...
    ],
    "linhac": [
      // ...
    ],
    "linhad": [
      // ...
    ],
    "linhaii": [
      // ...
    ]
  },
  "descricao": "Causas secundárias das mortes por sinistro de trânsito"
}

**Descrição:** Permite filtrar os dados de mortes no trânsito por diversos critérios.

**Exemplos de Uso:**
```
# Todos os óbitos na RMR nos últimos 10 anos
GET http://localhost:8080/datasus-deaths/filtros

# Óbitos por local de residência
GET http://localhost:8080/datasus-deaths/filtros?locationType=residence

# Óbitos apenas no Recife
GET http://localhost:8080/datasus-deaths/filtros?cityId=2611606

# Óbitos apenas de pessoas do sexo masculino
GET http://localhost:8080/datasus-deaths/filtros?gender=1

# Óbitos de pessoas entre 20 e 29 anos
GET http://localhost:8080/datasus-deaths/filtros?ageMin=20&ageMax=29

# Óbitos de motociclistas
GET http://localhost:8080/datasus-deaths/filtros?transportMode=V2

# Combinação: Motociclistas do sexo masculino
GET http://localhost:8080/datasus-deaths/filtros?transportMode=V2&gender=1

# Combinação: Óbitos em Recife por local de residência entre 2018 e 2022
GET http://localhost:8080/datasus-deaths/filtros?cityId=2611606&locationType=residence&startYear=2018&endYear=2022

# Óbitos ocorridos em via pública
GET http://localhost:8080/datasus-deaths/filtros?deathLocation=4

# Óbitos ocorridos em locais de saúde (hospitais e outros estabelecimentos)
GET http://localhost:8080/datasus-deaths/filtros?deathLocation=1,2

# Óbitos ocorridos em outros locais (domicílio, outros e ignorado)
GET http://localhost:8080/datasus-deaths/filtros?deathLocation=3,5,9

# Combinação: Motociclistas com óbito em via pública
GET http://localhost:8080/datasus-deaths/filtros?transportMode=V2&deathLocation=4
```

**Resposta:**
```json
{
  "filtrosAplicados": {
    "tipoLocal": "ocorrencia",
    "anoInicio": 2013,
    "modoTransporte": ["V2"]
  },
  "totalGeral": 456,
  "resumo": {
    "porAno": {
      "2013": 40,
      "2014": 45,
      // ...
    },
    "porSexo": {
      "Masculino": 400,
      "Feminino": 56
    },
    "porRacaCor": {
      "Branca": 100,
      "Preta": 50,
      "Parda": 300,
      "Não informado": 6
    },
    "porFaixaEtaria": {
      "20 a 29 anos": 150,
      "30 a 39 anos": 120,
      // ...
    },
    "porMunicipio": {
      "Recife": 200,
      "Olinda": 80,
      // ...
    },
    "porModoTransporte": {
      "Motociclista": 456
    },
    "porLocalOcorrenciaObito": {
      "Via pública": 300,
      "Hospital": 120,
      "Outros": 36
    }
  },
  "dados": [
    // Dados detalhados de cada registro
  ]
}
```

### Códigos e Mapeamentos para DATASUS

#### Sexo
- `0`: Não informado
- `1`: Masculino
- `2`: Feminino
- `9`: Ignorado

#### Raça/Cor
- `1`: Branca
- `2`: Preta
- `3`: Amarela
- `4`: Parda
- `5`: Indígena
- `9`: Ignorado
- `NA`: Não informado

#### Modos de Transporte (Códigos CID-10)
- `V0`: Pedestre
- `V1`: Ciclista
- `V2`: Motociclista
- `V3`: Ocupante de triciclo
- `V4`: Ocupante de automóvel
- `V5`: Ocupante de caminhonete
- `V6`: Ocupante de veículo pesado
- `V7`: Ocupante de ônibus
- `V8`: Outros modos
- `V9`: Não especificado

#### Faixas Etárias
- 0 a 4 anos
- 5 a 9 anos
- 10 a 14 anos
- 15 a 19 anos
- 20 a 29 anos
- 30 a 39 anos
- 40 a 49 anos
- 50 a 59 anos
- 60 a 69 anos
- 70 a 79 anos
- 80 anos ou mais

## 6. Chamadas do SAMU

### Resumo de Chamadas

**Endpoint:** `/samu-calls/summary`

**Método:** GET

**Descrição:** Retorna um resumo das chamadas do SAMU, incluindo total de chamadas, distribuição por categoria, motivos de finalização e desfecho, e evolução anual.

**Exemplo de Uso:**
```
GET http://localhost:8080/samu-calls/summary
```

### Top Vias com Mais Sinistros

**Endpoint:** `/samu-calls/streets/top`

**Método:** GET

**Parâmetros:**
- `limit` (opcional): Número máximo de vias a retornar (padrão: 50)

**Descrição:** Retorna as vias com maior número de chamadas do SAMU, incluindo dados georreferenciados.

**Exemplo de Uso:**
```
GET http://localhost:8080/samu-calls/streets/top?limit=20
```

### Buscar Sinistros por Via

**Endpoint:** `/samu-calls/streets/search`

**Método:** GET

**Parâmetros:**
- `street` (obrigatório): Nome da via para buscar
- `limit` (opcional): Número máximo de resultados (padrão: 100)

**Descrição:** Busca chamadas do SAMU em uma via específica.

**Exemplo de Uso:**
```
GET http://localhost:8080/samu-calls/streets/search?street=Boa%20Viagem&limit=50
```

### Evolução Temporal

**Endpoint:** `/samu-calls/evolution`

**Método:** GET

**Parâmetros:**
- `startYear` (opcional): Ano inicial para filtrar
- `endYear` (opcional): Ano final para filtrar

**Descrição:** Retorna a evolução das chamadas mês a mês e ano a ano.

**Exemplo de Uso:**
```
GET http://localhost:8080/samu-calls/evolution?startYear=2020&endYear=2023
```

### Rankings Temporais

**Endpoint:** `/samu-calls/ranking/temporal`

**Método:** GET

**Descrição:** Retorna rankings de dias da semana, meses e distribuição horária das chamadas.

**Exemplo de Uso:**
```
GET http://localhost:8080/samu-calls/ranking/temporal
```

### Ranking por Cidades

**Endpoint:** `/samu-calls/ranking/cities`

**Método:** GET

**Parâmetros:**
- `year` (opcional): Ano específico para filtrar

**Descrição:** Retorna ranking de chamadas por cidade, incluindo classificação da RMR.

**Exemplo de Uso:**
```
GET http://localhost:8080/samu-calls/ranking/cities?year=2023
```

### Filtros Avançados

**Endpoint:** `/samu-calls/filters`

**Método:** GET

**Parâmetros:**
- `idade_min`, `idade_max`: Filtros de idade
- `sexo`: Sexo da vítima
- `ano_inicio`, `ano_fim`: Período temporal
- `categoria`, `subtipo`: Tipo de sinistro
- `municipio`: Município
- `hora_inicio`, `hora_fim`: Faixa horária (0-23)
- `motivo_fin_cat`, `motivo_desf_cat`: Motivos de finalização e desfecho
- `limit`: Número máximo de resultados (padrão: 1000)

**Descrição:** Permite filtrar as chamadas do SAMU por diversos critérios.

**Exemplos de Uso:**
```
GET http://localhost:8080/samu-calls/filters?idade_min=20&idade_max=30
GET http://localhost:8080/samu-calls/filters?sexo=M&ano_inicio=2023
GET http://localhost:8080/samu-calls/filters?hora_inicio=18&hora_fim=6
```