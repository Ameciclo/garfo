#!/bin/bash

# URL base da API
BASE_URL="http://localhost:8080"

# Lista de rotas para testar
ROUTES=(
  "/cities"
  "/cyclist-counts"
  "/cyclist-counts/edition/1"
  "/cyclist-infra/relations"
  "/cyclist-infra/relationsByCity"
  "/cyclist-infra/relation/16000464"
  "/cyclist-infra/ways"
  "/cyclist-infra/ways/all-ways"
  "/cyclist-infra/ways/summary"
  "/traffic-crashes/summary"
  "/traffic-crashes/geojson"
  "/traffic-crashes/vehicles"
  "/traffic-crashes/streets-summary"
  "/datasus-deaths/summary"
  "/datasus-deaths/matrix"
  "/datasus-deaths/cities-by-year"
  "/datasus-deaths/filtros"
  "/datasus-deaths/causas-secundarias"
)

# Contadores
TOTAL=${#ROUTES[@]}
SUCCESS=0
FAILED=0

# Cores para o terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Iniciando teste de rotas..."
echo "URL base: $BASE_URL"
echo "----------------------------------------"

# Array para armazenar rotas com falha
declare -a FAILED_ROUTES

# Testar cada rota
for route in "${ROUTES[@]}"; do
  url="${BASE_URL}${route}"
  echo -n "Testando $route... "
  
  # Usar curl para testar a rota com timeout de 5 segundos
  response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url")
  
  if [[ $response -ge 200 && $response -lt 400 ]]; then
    echo -e "${GREEN}OK ($response)${NC}"
    ((SUCCESS++))
  else
    echo -e "${RED}FALHA ($response)${NC}"
    ((FAILED++))
    FAILED_ROUTES+=("$route ($response)")
  fi
done

echo "----------------------------------------"
echo "Resumo dos testes:"
echo "Total de rotas: $TOTAL"
echo "Rotas funcionando: $SUCCESS"
echo "Rotas com falha: $FAILED"

if [[ $FAILED -gt 0 ]]; then
  echo "----------------------------------------"
  echo "Rotas com falha:"
  for failed_route in "${FAILED_ROUTES[@]}"; do
    echo "- $failed_route"
  done
fi