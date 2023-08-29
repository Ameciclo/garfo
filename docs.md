# Documentação de Rotas da API

Neste documento, você encontrará informações detalhadas sobre as rotas disponíveis na API.

# Cities Module

## Get cities

- `GET /cities`
  - Retorna uma lista de cidades.
  - Parâmetros de consulta: nenhum.
  - Exemplo de Resposta:
    ```json
    [
      {"id": 1, "name": "Cidade A", "state": "Estado X"},
      {"id": 2, "name": "Cidade B", "state": "Estado Y"}
      // ...
    ]
    ```

# Contagem de Ciclistas

## Resumo das Contagens de Ciclistas

- `GET /cyclist-count/summary`
  - Retorna um resumo das contagens de ciclistas, incluindo estatísticas e detalhes.
  - Parâmetros de consulta: nenhum.
  - Exemplo de Resposta:
    ```json
    {
      "summary": {
        "total": 1500,
        "last_count": "2023-08-15T00:00:00.000Z",
        "number_counts": 10,
        "different_counts_points": 5,
        "max_total_of_count": 300,
        "where_max_count": {
          "id": 5,
          "name": "Cidade X",
          // ...
        },
        "total_cargo": 100,
        "total_helmet": 800,
        "total_juveniles": 50,
        // ...
      },
      "counts": [
        {
          "id": 1,
          "slug": "1-2023-01-05-edicao-um",
          "name": "Edição Um",
          "date": "2023-01-05T00:00:00.000Z",
          // ...
        },
        // ...
      ]
    }
    ```

## Contagem de Ciclistas - Edição Específica

- `GET /cyclist-counts/edition/:id`
  - Retorna os detalhes de uma edição específica da contagem de ciclistas.
  - Parâmetros de rota: `id` (ID da edição).
  - Exemplo de Resposta:
    ```json
    {
      "id": 1,
      "slug": "1-2023-01-05-edicao-um",
      "name": "Edição Um",
      "date": "2023-01-05T00:00:00.000Z",
      "summary": {
        "max_hour": 123,
        "total_cyclists": 1000,
        // ...
      },
      "coordinates": [
        {
          "point": "POINT(-34.90958786058795 -8.04814101957825)",
          "type": "Point",
          "name": "Recife"
        }
        // ...
      ],
      "sessions": {
        "1": {
          "start_time": "2023-01-05T08:00:00.000Z",
          "end_time": "2023-01-05T09:00:00.000Z",
          "total_cyclists": 100,
          "characteristics": {
            "cargo": 20,
            "helmet": 50,
            // ...
          },
          "quantitative": {
            "NW_SE": 10,
            "SE_NW": 15,
            // ...
          }
        }
        // ...
      },
      "directions": {
        "NW_SE": {
          "origin": "Norte-Oeste",
          "destin": "Sul-Leste",
          "origin_cardinal": "NW",
          "destin_cardinal": "SE"
        }
        // ...
      }
    }
    ```

# Infraestrutura Ciclística

## Relations

- `GET /cyclist-infra/relations`
  - Retorna informações sobre as relações de infraestrutura ciclística.
  - Parâmetros de consulta: nenhum.
  - Exemplo de Resposta:
    ```json
    [
      {
        "id": 1,
        "name": "Relação 1",
        "pdc_ref": "ABC123",
        // ...
      },
      // ...
    ]
    ```

## Relations By City

- `GET /cyclist-infra/relations-by-city`
  - Retorna informações sobre relações de infraestrutura ciclística agrupadas por cidade.
  - Parâmetros de consulta: nenhum.
  - Exemplo de Resposta:
    ```json
    {
      "1": {
        "city_id": 1,
        "name": "Cidade 1",
        "state": "Estado 1",
        "relations": [
          {
            "relation_id": 1,
            "pdc_ref": "ABC123",
            // ...
          },
          // ...
        ]
      },
      // ...
    }
    ```

## Detalhes de uma Relação de Infraestrutura Ciclística

- `GET /cyclist-infra/relation/:relationId`
  - Retorna informações detalhadas sobre uma relação de infraestrutura ciclística específica.
  - Parâmetros de consulta:
    - `:relationId` (parâmetro de caminho): O ID da relação de infraestrutura.
  - Exemplo de Resposta:
    ```json
    {
      "type": "relation",
      "id": 123456,
      "members": [
        // ...
      ],
      "tags": {
        "name": "Nome da Relação",
        // ...
      },
      "pdc": {
        "id": 1,
        "name": "Relação 1",
        "pdc_ref": "ABC123",
        // ...
      }
    }
    ```

## Atualização de Dados de Infraestrutura Ciclística

- `GET /cyclist-infra/updater`
  - Atualiza os dados de infraestrutura ciclística na base de dados, comparando projetos planejados com infraestruturas existentes.
  - Parâmetros de consulta: nenhum.
  - Exemplo de Resposta (vazio):
    ```json
    []
    ```

# Pesquisa Perfil Ciclista

## Sumário

- `GET /cyclist-profile/summary`
  - Retorna um resumo do perfil do ciclista, incluindo informações sobre edições e categorias.
  - Exemplo de Resposta:
    ```json
    {
      "editions": [
        {
          "id": 1,
          "year": 2023,
          "total_questionnaires": 100,
          "categories": {
            "category_type_1": {
              "category_1": 25,
              "category_2": 30
            },
            "category_type_2": {
              "category_3": 45,
              "category_4": 0
            }
          }
        },
        // ...
      ],
      "categories": {
        "category_type_1": ["category_1", "category_2"],
        "category_type_2": ["category_3", "category_4"]
      }
    }
    ```

## Edições

- `GET /cyclist-profile/editions/:editionId`
  - Retorna informações detalhadas sobre uma edição específica do perfil do ciclista, incluindo contagens de categorias.
  - Parâmetros de consulta:
    - `:editionId` (parâmetro de caminho): O ID da edição do perfil do ciclista.
  - Exemplo de Resposta:
    ```json
    {
      "editionId": 1,
      "categoriesCount": {
        "category_type_1": {
          "category_1": 25,
          "category_2": 30
        },
        "category_type_2": {
          "category_3": 45,
          "category_4": 0
        }
      }
    }
    ```
