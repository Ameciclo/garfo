# Teste de Rotas da API Garfo

Este documento descreve como usar os scripts de teste de rotas para verificar o funcionamento da API Garfo.

## Scripts Disponíveis

Foram criados três scripts diferentes para testar as rotas da API:

1. **test-routes.mjs** - Um script Node.js que testa todas as rotas e fornece informações detalhadas sobre o status, tempo de resposta e conteúdo.
2. **test-routes.sh** - Um script Bash simples que usa curl para testar rapidamente o status das rotas.
3. **diagnose-routes.js** - Um script de diagnóstico que analisa o código-fonte para identificar possíveis problemas de implementação nas rotas.

## Como Usar

### Pré-requisitos

- Certifique-se de que a API está em execução na porta 8080 (ou ajuste a porta nos scripts conforme necessário).
- Para o script Node.js, o pacote `node-fetch` deve estar instalado (já está incluído nas dependências do projeto).

### Executando os Testes

Você pode executar os scripts usando os comandos npm definidos no package.json:

```bash
# Teste detalhado com Node.js
npm run test:routes

# Teste rápido com curl
npm run test:routes:bash

# Diagnóstico de implementação das rotas
npm run diagnose:routes
```

### Ajustando a URL Base

Por padrão, os scripts assumem que a API está rodando em `http://localhost:8080`. Se a API estiver em um host ou porta diferente, você pode:

- Para o script Node.js: definir a variável de ambiente `API_URL`
  ```bash
  API_URL=http://seu-host:porta npm run test:routes
  ```

- Para o script Bash: editar a variável `BASE_URL` no início do arquivo `test-routes.sh`

## Interpretando os Resultados

### test-routes.mjs

Este script fornece informações detalhadas sobre cada rota:

- Status HTTP
- Tempo de resposta
- Tamanho dos dados retornados
- Se a rota retorna dados vazios
- As 5 rotas mais lentas

### test-routes.sh

Este script fornece uma visão rápida do status de cada rota:

- OK (código 2xx ou 3xx)
- FALHA (código 4xx, 5xx ou erro de conexão)

### diagnose-routes.js

Este script analisa o código-fonte e identifica possíveis problemas:

- Rotas definidas no index.ts
- Módulos correspondentes
- Sub-rotas definidas nos módulos
- Problemas de implementação

## Solução de Problemas Comuns

Se uma rota não estiver funcionando, verifique:

1. Se a rota está corretamente definida no arquivo `index.ts`
2. Se o módulo correspondente existe e exporta um router
3. Se a sub-rota está definida no módulo
4. Se há erros no console do servidor quando a rota é acessada

## Adicionando Novas Rotas para Teste

Para adicionar novas rotas aos testes, edite a lista `routes` no início dos arquivos `test-routes.mjs`, `test-routes.sh` e `diagnose-routes.js`.