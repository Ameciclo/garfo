# API de Mortes no Trânsito - DATASUS

Esta API fornece acesso aos dados de mortes no trânsito da Região Metropolitana do Recife (RMR), com base nos dados do DATASUS.

## Endpoints Disponíveis

### 1. Sumário de Informações

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

### 2. Mortes por Cidade e Ano

**Endpoint:** `/datasus-deaths/cities-by-year`

**Método:** GET

**Parâmetros:**
- `tipo` (opcional): Tipo de local a considerar (`ocorrencia` ou `residencia`). Padrão: `ocorrencia`.

**Descrição:** Retorna dados de mortes por cidade da RMR, divididos por ano.

**Exemplo de Uso:**
```
GET http://localhost:8080/datasus-deaths/cities-by-year
GET http://localhost:8080/datasus-deaths/cities-by-year?tipo=residencia
```

**Resposta:**
```json
{
  "tipo": "Local de Ocorrência",
  "anos": [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022],
  "cidades": [
    {
      "id": 2611606,
      "nome": "Recife",
      "2013": 50,
      "2014": 55,
      // ... outros anos
      "total": 500
    },
    // ... outras cidades
  ]
}
```

### 3. Filtros Avançados

**Endpoint:** `/datasus-deaths/filtros`

**Método:** GET

**Parâmetros:**
- `municipio` (opcional): ID do município específico (se não informado, usa todos da RMR)
- `tipoLocal` (opcional): `residencia` ou `ocorrencia` (padrão: `ocorrencia`)
- `anoInicio` (opcional): Ano inicial para filtrar (padrão: últimos 10 anos)
- `anoFim` (opcional): Ano final para filtrar
- `sexo` (opcional): Código do sexo (1 = Masculino, 2 = Feminino)
- `racacor` (opcional): Código da raça/cor (1 = Branca, 2 = Preta, 4 = Parda, etc.)
- `faixaEtariaMin` (opcional): Idade mínima
- `faixaEtariaMax` (opcional): Idade máxima
- `modoTransporte` (opcional): Código do modo de transporte (V0 = Pedestre, V2 = Motociclista, V4 = Ocupante de automóvel, etc.)

**Descrição:** Permite filtrar os dados de mortes no trânsito por diversos critérios.

**Exemplos de Uso:**
```
# Todos os óbitos na RMR nos últimos 10 anos
GET http://localhost:8080/datasus-deaths/filtros

# Óbitos por local de residência
GET http://localhost:8080/datasus-deaths/filtros?tipoLocal=residencia

# Óbitos apenas no Recife
GET http://localhost:8080/datasus-deaths/filtros?municipio=2611606

# Óbitos apenas de pessoas do sexo masculino
GET http://localhost:8080/datasus-deaths/filtros?sexo=1

# Óbitos de pessoas entre 20 e 29 anos
GET http://localhost:8080/datasus-deaths/filtros?faixaEtariaMin=20&faixaEtariaMax=29

# Óbitos de motociclistas
GET http://localhost:8080/datasus-deaths/filtros?modoTransporte=V2

# Combinação: Motociclistas do sexo masculino
GET http://localhost:8080/datasus-deaths/filtros?modoTransporte=V2&sexo=1

# Combinação: Óbitos em Recife por local de residência entre 2018 e 2022
GET http://localhost:8080/datasus-deaths/filtros?municipio=2611606&tipoLocal=residencia&anoInicio=2018&anoFim=2022
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
    }
  },
  "dados": [
    // Dados detalhados de cada registro
  ]
}
```

## Códigos e Mapeamentos

### Sexo
- `0`: Não informado
- `1`: Masculino
- `2`: Feminino
- `9`: Ignorado

### Raça/Cor
- `1`: Branca
- `2`: Preta
- `3`: Amarela
- `4`: Parda
- `5`: Indígena
- `9`: Ignorado
- `NA`: Não informado

### Modos de Transporte (Códigos CID-10)
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

### Faixas Etárias
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

## Notas Importantes

1. **Formato da Idade**: O campo `idade` no DATASUS tem uma estrutura específica:
   - O primeiro dígito indica a unidade de medida (0=horas, 1=horas, 2=dias, 3=meses, 4=anos, 5=anos+100)
   - Os dois dígitos seguintes indicam a quantidade nessa unidade
   - Exemplo: `424` = 4 (anos) + 24 (quantidade) = 24 anos

2. **Modo de Transporte**: Os códigos de modo de transporte são baseados na Classificação Internacional de Doenças (CID-10) e são armazenados no campo `causabas_o`.

3. **Municípios da RMR**: A API considera apenas os municípios da Região Metropolitana do Recife, identificados pelo campo `rmr = true` na tabela de cidades.