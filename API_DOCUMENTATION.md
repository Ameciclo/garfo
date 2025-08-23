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

### Códigos e Mapeamentos para SAMU

#### Sexo
- `M`: Masculino
- `F`: Feminino
- `I`: Ignorado

#### Categorias
- `ACIDENTE DE TRANSITO`: Acidente de Trânsito
- `ACIDENTE MOTO`: Acidente de Moto
- `ATROPELAMENTO`: Atropelamento
- `CAPOTAMENTO`: Capotamento
- `COLISAO`: Colisão
- `QUEDA DE MOTO`: Queda de Moto

#### Subtipos
- `ACIDENTMOTO`: Acidente de Motocicleta
- `ATROPELCARRO`: Atropelamento por Carro
- `ATROPELMOTO`: Atropelamento por Moto
- `CAPOTAMENTO`: Capotamento
- `COLISAO`: Colisão
- `QUEDAMOTO`: Queda de Motocicleta

#### Motivos de Finalização
- `TRANSPORTE REALIZADO`: Transporte Realizado
- `RECUSA DE TRANSPORTE`: Recusa de Transporte
- `OBITO NO LOCAL`: Óbito no Local
- `CANCELADO`: Cancelado
- `FALSO CHAMADO`: Falso Chamado

#### Motivos de Desfecho
- `ALTA HOSPITALAR`: Alta Hospitalar
- `INTERNACAO`: Internação
- `OBITO`: Óbito
- `TRANSFERENCIA`: Transferência
- `EVASAO`: Evasão

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

#### Desfechos Válidos vs Inválidos

**Desfechos Válidos:**
- Atendimento Concluído com Êxito
- Removido por Particulares
- Removido pelos Bombeiros/CIODS
- Óbito no Local/Atendimento

**Desfechos Inválidos:**
- Sem Desfecho/Casa Fechada/Não há paciente
- Desistência da solicitação
- Recusa de Remoção
- Inválido/Duplicado/Cancelado/Trote
- Não necessita/Sem Condições Clínicas
- Outros Desfechos

**Filtros de Desfecho:**
- `validos`: Apenas chamadas com desfechos válidos (padrão)
- `invalidos`: Apenas chamadas com desfechos inválidos
- `todos`: Todas as chamadas, independente do desfecho

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

### Cidades com Dados do SAMU

**Endpoint:** `/samu-calls/cities`

**Método:** GET

**Descrição:** Retorna a lista de cidades disponíveis nos dados do SAMU, incluindo contagem total de chamadas e histórico anual para cada cidade. As cidades são vinculadas através do city_id para obter informações oficiais.

**Exemplo de Uso:**
```
GET http://localhost:8080/samu-calls/cities
```

**Resposta:**
```json
{
  "cidades": [
    {
      "municipio_samu": "Recife",
      "count": 15420,
      "id": 2611606,
      "name": "Recife",
      "rmr": true,
      "historico_anual": [
        {
          "ano": 2020,
          "total_chamados": 3200
        },
        {
          "ano": 2021,
          "total_chamados": 3800
        },
        {
          "ano": 2022,
          "total_chamados": 4100
        },
        {
          "ano": 2023,
          "total_chamados": 4320
        }
      ]
    }
  ],
  "total": 25,
  "recife_id": 2611606
}
```

### Resumo de Chamadas

**Endpoint:** `/samu-calls/summary`

**Método:** GET

**Descrição:** Retorna um resumo das chamadas do SAMU, incluindo total de chamadas, distribuição por categoria, motivos de finalização e desfecho, e evolução anual.

**Exemplo de Uso:**
```
GET http://localhost:8080/samu-calls/summary
```

### Resumo Geral de Vias

**Endpoint:** `/samu-calls/streets/summary`

**Método:** GET

**Descrição:** Retorna estatísticas gerais sobre vias com sinistros do SAMU.

**Exemplo de Uso:**
```
GET http://localhost:8080/samu-calls/streets/summary
```

**Resposta:**
```json
{
  "totalSinistros": 15420,
  "totalVias": 2341,
  "periodoInicio": "2016",
  "periodoFim": "2024",
  "mesUltimoDado": "2024.03",
  "anoMaisPerigoso": {
    "ano": "2023",
    "total": 1850
  },
  "viaMaisPerigosa": {
    "nome": "Avenida Norte Miguel Arraes de Alencar",
    "id": 1,
    "total": 245,
    "percentual": 1.59,
    "extensao": 2321
  }
}
```

### Top Vias com Dados Cumulativos

**Endpoint:** `/samu-calls/streets/top`

**Método:** GET

**Parâmetros:**
- `intervalo` (opcional): Intervalo para agrupamento (padrão: 1)
- `anoInicio` (opcional): Ano inicial para filtrar (padrão: 2018)
- `anoFim` (opcional): Ano final para filtrar (padrão: 2024)
- `limite` (opcional): Número máximo de vias (padrão: 50)

**Descrição:** Retorna análise cumulativa das vias mais perigosas, com dados de sinistros, quilometragem e densidade.

**Exemplos de Uso:**
```
# Top 50 vias com dados cumulativos
GET http://localhost:8080/samu-calls/streets/top

# Top 20 vias entre 2020-2023 com intervalo de 5
GET http://localhost:8080/samu-calls/streets/top?limite=20&anoInicio=2020&anoFim=2023&intervalo=5
```

**Resposta:**
```json
{
  "dados": [
    {
      "top": 1,
      "sinistros": 245,
      "km": 12.5,
      "sinistros_por_km": 19.6,
      "percentual_total": 1.59
    },
    {
      "top": 2,
      "sinistros": 467,
      "km": 25.8,
      "sinistros_por_km": 18.1,
      "percentual_total": 3.03
    }
  ],
  "parametros": {
    "intervalo": 1,
    "periodo": "2018-2024",
    "total_sinistros": 15420
  }
}
```

### Mapa GeoJSON das Vias

**Endpoint:** `/samu-calls/streets/map`

**Método:** GET

**Parâmetros:**
- `anoInicio` (opcional): Ano inicial para filtrar (padrão: 2018)
- `anoFim` (opcional): Ano final para filtrar (padrão: 2024)
- `limite` (opcional): Número máximo de vias (padrão: 50)
- `desfechos` (opcional): Filtro de desfechos - `validos` (padrão), `invalidos`, ou `todos`

**Descrição:** Retorna dados geoespaciais das vias com sinistros em formato adequado para mapas.

**Exemplos de Uso:**
```
# Mapa das 50 vias mais perigosas (desfechos válidos)
GET http://localhost:8080/samu-calls/streets/map

# Mapa das 20 vias entre 2020-2023 incluindo todos os desfechos
GET http://localhost:8080/samu-calls/streets/map?limite=20&anoInicio=2020&anoFim=2023&desfechos=todos
```

**Resposta:**
```json
{
  "vias": [
    {
      "id": 12345,
      "nome": "Avenida Norte Miguel Arraes de Alencar",
      "sinistros": 245,
      "geometria": {
        "type": "LineString",
        "coordinates": [[-34.123, -8.456], [-34.124, -8.457]]
      }
    }
  ],
  "filtro_desfechos": "validos"
}
```

### Listar Vias com Slugs

**Endpoint:** `/samu-calls/streets/list`

**Método:** GET

**Parâmetros:**
- `cityId` (opcional): ID da cidade (padrão: 2611606 - Recife)
- `limit` (opcional): Número máximo de resultados (padrão: 100, "all" para todas)
- `slug` (opcional): Slug específico da via para buscar

**Descrição:** Lista vias com sinistros do SAMU, incluindo seus slugs. Se o parâmetro `slug` for fornecido, retorna dados completos da via específica.

**Exemplos de Uso:**
```
# Listar todas as vias com slugs
GET http://localhost:8080/samu-calls/streets/list

# Listar 20 vias
GET http://localhost:8080/samu-calls/streets/list?limit=20

# Buscar via específica por slug
GET http://localhost:8080/samu-calls/streets/list?slug=avenida-boa-viagem
```

**Resposta (listagem):**
```json
{
  "vias": [
    {
      "id": 12345,
      "codlogradouro": 67890,
      "nome_oficial_logradouro": "Avenida Boa Viagem",
      "nome_logradouro_concatenado": "AVENIDA BOA VIAGEM",
      "nome_logradouro_resumido": "AV BOA VIAGEM",
      "slug": "avenida-boa-viagem",
      "nomeBairro": "Boa Viagem",
      "codbairro": 123,
      "cod_indica_pavimentacao": "A",
      "desc_indica_pavimentacao": "Asfalto",
      "indica_corredor_transporte": "S",
      "indica_perimetral": "N"
    }
  ],
  "total": 1,
  "limite": 100,
  "filtro_slug": "avenida-boa-viagem"
}
```

### Buscar Sinistros por Slug da Via

**Endpoint:** `/samu-calls/streets/slug/:slug`

**Método:** GET

**Parâmetros:**
- `slug` (obrigatório): Slug da via (na URL)
- `limit` (opcional): Número máximo de resultados (padrão: 100, "all" para todos)
- `includeGeom` (opcional): Incluir geometria (padrão: false)
- `desfechos` (opcional): Filtro de desfechos - `validos` (padrão), `invalidos`, ou `todos`
- `cityId` (opcional): ID da cidade (padrão: 2611606 - Recife)

**Descrição:** Busca chamadas do SAMU em uma via específica usando seu slug.

**Exemplos de Uso:**
```
# Buscar sinistros na Avenida Boa Viagem
GET http://localhost:8080/samu-calls/streets/slug/avenida-boa-viagem

# Buscar com geometria incluída
GET http://localhost:8080/samu-calls/streets/slug/avenida-boa-viagem?includeGeom=true

# Buscar incluindo desfechos inválidos
GET http://localhost:8080/samu-calls/streets/slug/avenida-boa-viagem?desfechos=invalidos
```

**Resposta:**
```json
{
  "sinistros": [
    {
      "id": 123456,
      "data": "2023-03-15",
      "hora_minuto": "18:30:00",
      "endereco": "Avenida Boa Viagem, 1234",
      "nome_oficial_logradouro": "Avenida Boa Viagem",
      "slug": "avenida-boa-viagem",
      "nomeBairro": "Boa Viagem",
      "categoria": "Acidente de Moto",
      "subtipo": "Colisão",
      "sexo": "M",
      "idade": 28,
      "motivo_fin_cat": "Transporte Realizado",
      "motivo_desf_cat": "Atendimento Concluído com Êxito"
    }
  ],
  "total": 1,
  "slug": "avenida-boa-viagem",
  "limite": 100,
  "includeGeom": false,
  "filtro_desfechos": "validos"
}
```

### Buscar Sinistros por Via

**Endpoint:** `/samu-calls/streets/search`

**Método:** GET

**Parâmetros:**
- `street` (obrigatório): Nome da via para buscar
- `limit` (opcional): Número máximo de resultados (padrão: 100)
- `includeGeom` (opcional): Incluir geometria (padrão: false)
- `desfechos` (opcional): Filtro de desfechos - `validos` (padrão), `invalidos`, ou `todos`
- `cityId` (opcional): ID da cidade (padrão: 2611606 - Recife)

**Descrição:** Busca chamadas do SAMU em uma via específica por nome (busca parcial).

**Exemplo de Uso:**
```
GET http://localhost:8080/samu-calls/streets/search?street=Boa%20Viagem&limit=50
```

### Histórico de Sinistros por Via

**Endpoint:** `/samu-calls/streets/history`

**Método:** GET

**Parâmetros:**
- `via` (opcional): Nome da via para filtrar (busca parcial)
- `desfechos` (opcional): Filtro de desfechos - `validos` (padrão), `invalidos`, ou `todos`

**Descrição:** Retorna histórico detalhado de sinistros por ano, incluindo distribuição mensal, por dia da semana, por horário, dias com dados e dias com sinistros.

**Exemplos de Uso:**
```
# Histórico geral (todos os anos, desfechos válidos)
GET http://localhost:8080/samu-calls/streets/history

# Histórico de uma via específica
GET http://localhost:8080/samu-calls/streets/history?via=Avenida Norte Miguel Arraes

# Histórico incluindo desfechos inválidos
GET http://localhost:8080/samu-calls/streets/history?via=Boa Viagem&desfechos=invalidos

# Histórico com todos os desfechos
GET http://localhost:8080/samu-calls/streets/history?desfechos=todos
```

**Resposta:**
```json
{
  "evolucao": [
    {
      "ano": 2023,
      "sinistros": 150,
      "meses": {
        "1": 12,  // Janeiro
        "2": 15,  // Fevereiro
        "3": 18,  // Março
        "4": 10,  // Abril
        "5": 14,  // Maio
        "6": 16,  // Junho
        "7": 13,  // Julho
        "8": 11,  // Agosto
        "9": 9,   // Setembro
        "10": 12, // Outubro
        "11": 10, // Novembro
        "12": 10  // Dezembro
      },
      "dias_com_dados": 365,      // Dias com dados no ano (geral)
      "dias_com_sinistros": 89,   // Dias com sinistros na via específica
      "ultimo_dia": "2023-12-31",
      "dias_semana": {
        "0": 20,  // Domingo
        "1": 25,  // Segunda-feira
        "2": 22,  // Terça-feira
        "3": 18,  // Quarta-feira
        "4": 24,  // Quinta-feira
        "5": 26,  // Sexta-feira
        "6": 15   // Sábado
      },
      "horarios": {
        "0": 2,   // 00:00-00:59
        "1": 1,   // 01:00-01:59
        "2": 0,   // 02:00-02:59
        "3": 1,   // 03:00-03:59
        "4": 2,   // 04:00-04:59
        "5": 4,   // 05:00-05:59
        "6": 8,   // 06:00-06:59
        "7": 12,  // 07:00-07:59
        "8": 15,  // 08:00-08:59
        "9": 10,  // 09:00-09:59
        "10": 8,  // 10:00-10:59
        "11": 9,  // 11:00-11:59
        "12": 11, // 12:00-12:59
        "13": 9,  // 13:00-13:59
        "14": 7,  // 14:00-14:59
        "15": 6,  // 15:00-15:59
        "16": 8,  // 16:00-16:59
        "17": 12, // 17:00-17:59
        "18": 14, // 18:00-18:59
        "19": 8,  // 19:00-19:59
        "20": 6,  // 20:00-20:59
        "21": 4,  // 21:00-21:59
        "22": 3,  // 22:00-22:59
        "23": 2   // 23:00-23:59
      },
      "por_sexo": {
        "masculino": 95,
        "feminino": 45,
        "nao_informado": 10
      },
      "por_faixa_etaria": {
        "0_17_anos": 8,
        "18_29_anos": 35,
        "30_49_anos": 45,
        "50_64_anos": 32,
        "65_mais_anos": 20,
        "nao_informado": 10
      },
      "por_categoria": {
        "sinistro_moto": 65,
        "sinistro_carro": 25,
        "atropelamento_carro": 30,
        "atropelamento_moto": 15,
        "sinistro_bicicleta": 8,
        "sinistro_onibus_caminhao": 3,
        "atropelamento_onibus_caminhao": 2,
        "atropelamento_bicicleta": 1,
        "outro": 1,
        "nao_informado": 0
      }
    }
  ],
  "via": "Avenida Norte Miguel Arraes",
  "filtro_desfechos": "validos"
}
```

**Métricas Incluídas:**
- **sinistros**: Total de sinistros no ano
- **meses**: Distribuição mensal (1-12)
- **dias_com_dados**: Dias com dados no sistema (geral do ano)
- **dias_com_sinistros**: Dias com sinistros na via específica
- **ultimo_dia**: Última data com dados no ano
- **dias_semana**: Distribuição por dia da semana (0=Domingo, 6=Sábado)
- **horarios**: Distribuição por hora do dia (0-23h)
- **por_sexo**: Perfil das vítimas por sexo (masculino, feminino, nao_informado)
- **por_faixa_etaria**: Perfil das vítimas por faixa etária (0-17, 18-29, 30-49, 50-64, 65+, nao_informado)
- **por_categoria**: Perfil das vítimas por categoria de sinistro (sinistro_moto, sinistro_carro, atropelamento_carro, atropelamento_moto, sinistro_bicicleta, sinistro_onibus_caminhao, atropelamento_onibus_caminhao, atropelamento_bicicleta, outro, nao_informado)

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

**Endpoint:** `/samu-calls/filters` ou `/samu-calls/filtros`

**Método:** GET

**Parâmetros:**
- `cityId`/`municipio`: ID do município específico (se não informado, usa todos da RMR)
- `startYear`/`anoInicio`: Ano inicial para filtrar (padrão: últimos 10 anos)
- `endYear`/`anoFim`: Ano final para filtrar
- `gender`/`sexo`: Sexo da vítima (array)
- `ageMin`/`idadeMin`: Idade mínima
- `ageMax`/`idadeMax`: Idade máxima
- `category`/`categoria`: Categoria do sinistro (array)
- `subtype`/`subtipo`: Subtipo do sinistro (array)
- `startHour`/`horaInicio`: Hora inicial (0-23)
- `endHour`/`horaFim`: Hora final (0-23)
- `finalizationReason`/`motivoFinalizacao`: Motivo de finalização (array)
- `outcomeReason`/`motivoDesfecho`: Motivo de desfecho (array)
- `includeInvalid`/`incluirInvalidos`: Incluir desfechos inválidos (padrão: false)

**Descrição:** Permite filtrar as chamadas do SAMU por diversos critérios com agrupamentos e estatísticas detalhadas.

**Exemplos de Uso:**
```
# Filtros básicos
GET http://localhost:8080/samu-calls/filtros?ageMin=20&ageMax=30
GET http://localhost:8080/samu-calls/filtros?gender=M&startYear=2023
GET http://localhost:8080/samu-calls/filtros?startHour=18&endHour=6

# Filtros por categoria
GET http://localhost:8080/samu-calls/filtros?category=ACIDENTE%20DE%20TRANSITO
GET http://localhost:8080/samu-calls/filtros?subtype=ATROPELCARRO

# Filtros por município
GET http://localhost:8080/samu-calls/filtros?cityId=2611606

# Incluir desfechos inválidos
GET http://localhost:8080/samu-calls/filtros?includeInvalid=true

# Combinação de filtros
GET http://localhost:8080/samu-calls/filtros?cityId=2611606&startYear=2020&endYear=2023&category=ATROPELAMENTO&gender=M
```

**Resposta:**
```json
{
  "filtrosAplicados": {
    "cityId": 2611606,
    "startYear": 2020,
    "endYear": 2023,
    "category": ["ATROPELAMENTO"],
    "gender": ["M"],
    "includeInvalid": false
  },
  "totalGeral": 1250,
  "resumo": {
    "porAno": {
      "2020": 300,
      "2021": 320,
      "2022": 315,
      "2023": 315
    },
    "porSexo": {
      "Masculino": 1250,
      "Feminino": 0
    },
    "porFaixaEtaria": {
      "20 a 29 anos": 350,
      "30 a 39 anos": 280,
      "40 a 49 anos": 220
    },
    "porMunicipio": {
      "Recife": 1250
    },
    "porCategoria": {
      "Atropelamento": 1250
    },
    "porSubtipo": {
      "Atropelamento por Carro": 800,
      "Atropelamento por Moto": 450
    },
    "porHora": {
      "6": 45,
      "7": 65,
      "8": 80,
      "18": 95,
      "19": 85
    }
  },
  "dados": [
    {
      "ano": 2023,
      "mes": 3,
      "hora": 18,
      "municipio": {
        "nome": "Recife"
      },
      "sexo": {
        "codigo": "M",
        "descricao": "Masculino"
      },
      "idade": 35,
      "faixaEtaria": "30 a 39 anos",
      "categoria": {
        "codigo": "ATROPELAMENTO",
        "descricao": "Atropelamento"
      },
      "subtipo": {
        "codigo": "ATROPELCARRO",
        "descricao": "Atropelamento por Carro"
      },
      "motivoFinalizacao": {
        "codigo": "TRANSPORTE REALIZADO",
        "descricao": "Transporte Realizado"
      },
      "motivoDesfecho": {
        "codigo": "INTERNACAO",
        "descricao": "Internação"
      },
      "total": 15
    }
  ]
}
```

### Categorias por Cidade e Ano

**Endpoint:** `/samu-calls/categories-by-city-year`

**Método:** GET

**Parâmetros:**
- `cidade` (opcional): Nome do município
- `ano_inicio` (opcional): Ano inicial
- `ano_fim` (opcional): Ano final

**Descrição:** Retorna dados de categorias de sinistros por ano.

**Exemplo de Uso:**
```
GET http://localhost:8080/samu-calls/categories-by-city-year?cidade=Recife&ano_inicio=2020&ano_fim=2023
```

### Desfechos por Cidade/Modo

**Endpoint:** `/samu-calls/outcomes`

**Método:** GET

**Parâmetros:**
- `cidade` (opcional): Nome do município
- `modo` (opcional): Tipo de sinistro (acidente-moto, acidente-carro, acidente-bicicleta, atropelamento-carro, atropelamento-moto, acidente-onibus-caminhao, atropelamento-onibus-caminhao, atropelamento-bicicleta, outro)

**Descrição:** Retorna distribuição de desfechos das chamadas.

**Exemplo de Uso:**
```
GET http://localhost:8080/samu-calls/outcomes?cidade=Recife&modo=atropelamento-carro
```

### Finalizações por Cidade/Modo

**Endpoint:** `/samu-calls/finalizations`

**Método:** GET

**Parâmetros:**
- `cidade` (opcional): Nome do município
- `modo` (opcional): Tipo de sinistro (acidente-moto, acidente-carro, acidente-bicicleta, atropelamento-carro, atropelamento-moto, acidente-onibus-caminhao, atropelamento-onibus-caminhao, atropelamento-bicicleta, outro)

**Descrição:** Retorna distribuição de finalizações das chamadas.

**Exemplo de Uso:**
```
GET http://localhost:8080/samu-calls/finalizations?cidade=Recife&modo=acidente-moto
```

### Perfil de Sexo por Cidade/Modo

**Endpoint:** `/samu-calls/gender-profile`

**Método:** GET

**Parâmetros:**
- `cidade` (opcional): Nome do município
- `modo` (opcional): Tipo de sinistro (acidente-moto, acidente-carro, acidente-bicicleta, atropelamento-carro, atropelamento-moto, acidente-onibus-caminhao, atropelamento-onibus-caminhao, atropelamento-bicicleta, outro)

**Descrição:** Retorna distribuição por sexo das vítimas.

**Exemplo de Uso:**
```
GET http://localhost:8080/samu-calls/gender-profile?cidade=Recife
```

### Perfil de Idade por Cidade/Modo

**Endpoint:** `/samu-calls/age-profile`

**Método:** GET

**Parâmetros:**
- `cidade` (opcional): Nome do município
- `modo` (opcional): Tipo de sinistro (acidente-moto, acidente-carro, acidente-bicicleta, atropelamento-carro, atropelamento-moto, acidente-onibus-caminhao, atropelamento-onibus-caminhao, atropelamento-bicicleta, outro)

**Descrição:** Retorna distribuição por faixa etária das vítimas.

**Exemplo de Uso:**
```
GET http://localhost:8080/samu-calls/age-profile?modo=atropelamento-carro
```