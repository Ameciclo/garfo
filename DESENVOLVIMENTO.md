# Guia de Desenvolvimento Local

## Configuração Rápida com Docker

### 1. Setup Automático
```bash
npm run docker:setup
```

### 2. Comandos Úteis
```bash
# Subir containers
npm run docker:up

# Ver logs em tempo real
npm run docker:logs

# Parar containers
npm run docker:down

# Testar conexão com banco
npm run test:connection
```

## Arquitetura da Comunicação

- **API**: Container `garfo-app` na porta 8080
- **Banco**: Container `garfo-db` (sem exposição externa)
- **Comunicação**: Interna via rede Docker (`db:5432`)

## Configurações

### Docker (.env)
```
DATABASE_URL=postgresql://postgres:1234@db:5432/postgres
POSTGRES_HOST=db
```

### Local (.env.local)
```
DATABASE_URL=postgresql://postgres:1234@localhost:5432/postgres
POSTGRES_HOST=localhost
```

## Verificações

1. **Containers rodando**: `docker compose ps`
2. **Logs da API**: `docker compose logs app`
3. **Logs do DB**: `docker compose logs db`
4. **Teste de conexão**: `npm run test:connection`

## Troubleshooting

- Se a API não conectar no banco, aguarde o healthcheck
- Para reset completo: `docker compose down -v && npm run docker:setup`
- Verificar se não há conflito de portas (8080)