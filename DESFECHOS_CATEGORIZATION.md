# Categorização de Desfechos SAMU

## Implementação

Foi implementada a categorização dos dados por desfecho, separando desfechos válidos e inválidos.

### Desfechos VÁLIDOS
- "Atendimento Concluído com Êxito"
- "Removido por Particulares"
- "Removido pelos Bombeiros/CIODS"
- "Óbito no Local/Atendimento"

### Desfechos INVÁLIDOS
- "Sem Desfecho/Casa Fechada/Não há paciente"
- "Desistência da solicitação"
- "Recusa de Remoção"
- "Inválido/Duplicado/Cancelado/Trote"
- "Não necessita/Sem Condições Clínicas"
- "Outros Desfechos"

## Comportamento Padrão

Por padrão, todos os endpoints retornam apenas dados com desfechos válidos.

## Como Incluir Desfechos Inválidos

Para incluir todos os desfechos (válidos e inválidos), adicione o parâmetro:
- `incluir_invalidos=true` ou `include_invalid=true`

## Endpoints Atualizados

- `/samu-calls/summary`
- `/samu-calls/outcomes`
- `/samu-calls/filters`
- `/samu-calls/evolution`
- `/samu-calls/ranking/temporal`
- `/samu-calls/ranking/cities`

## Novo Endpoint

- `/samu-calls/outcomes-categories` - Lista as categorias de desfechos válidos e inválidos

## Exemplos de Uso

```bash
# Apenas desfechos válidos (padrão)
GET /samu-calls/summary

# Incluindo desfechos inválidos
GET /samu-calls/summary?incluir_invalidos=true

# Ver categorias de desfechos
GET /samu-calls/outcomes-categories
```