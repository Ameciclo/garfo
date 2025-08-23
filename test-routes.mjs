import fetch from 'node-fetch';

// Lista de todas as rotas para testar
const routes = [
  '/cities',
  '/cyclist-counts',
  '/cyclist-counts/edition/1',
  '/cyclist-infra/relations',
  '/cyclist-infra/relationsByCity',
  '/cyclist-infra/relation/16000464',
  '/cyclist-infra/ways',
  '/cyclist-infra/ways/all-ways',
  '/cyclist-infra/ways/summary',
  '/traffic-crashes/summary',
  '/traffic-crashes/geojson',
  '/traffic-crashes/vehicles',
  '/traffic-crashes/streets-summary',
  '/datasus-deaths/summary',
  '/datasus-deaths/matrix',
  '/datasus-deaths/cities-by-year',
  '/datasus-deaths/filtros',
  '/datasus-deaths/causas-secundarias',
  '/samu-calls/summary',
  '/samu-calls/cities',
  '/samu-calls/filters',
  '/samu-calls/filtros',
  '/samu-calls/streets/summary',
  '/samu-calls/streets/top',
  '/samu-calls/streets/list',
  '/samu-calls/streets/search?street=rua',
  '/samu-calls/streets/map',
  '/samu-calls/streets/history'
];

// URL base da API
const BASE_URL = process.env.API_URL || 'http://localhost:8080';

// Função para testar uma rota
async function testRoute(route) {
  const url = `${BASE_URL}${route}`;
  console.log(`Testando rota: ${route}`);
  
  try {
    const startTime = Date.now();
    const response = await fetch(url, { timeout: 10000 }); // 10 segundos de timeout
    const endTime = Date.now();
    const timeElapsed = endTime - startTime;
    
    if (response.ok) {
      // Tenta obter o conteúdo da resposta
      let responseData;
      try {
        responseData = await response.json();
        const dataSize = JSON.stringify(responseData).length;
        console.log(`✅ ${route} - Status: ${response.status} - Tempo: ${timeElapsed}ms - Tamanho: ${formatBytes(dataSize)}`); 
        return { 
          route, 
          status: response.status, 
          working: true, 
          time: timeElapsed,
          dataSize,
          hasData: Array.isArray(responseData) ? responseData.length > 0 : Object.keys(responseData).length > 0
        };
      } catch (parseError) {
        console.log(`⚠️ ${route} - Status: ${response.status} - Tempo: ${timeElapsed}ms - Erro ao processar resposta: ${parseError.message}`);
        return { 
          route, 
          status: response.status, 
          working: true, 
          time: timeElapsed,
          parseError: parseError.message 
        };
      }
    } else {
      console.log(`❌ ${route} - Status: ${response.status} - Tempo: ${timeElapsed}ms`);
      return { 
        route, 
        status: response.status, 
        working: false, 
        time: timeElapsed 
      };
    }
  } catch (error) {
    console.log(`❌ ${route} - Erro: ${error.message}`);
    return { 
      route, 
      status: 'Error', 
      working: false, 
      error: error.message 
    };
  }
}

// Função para formatar bytes em KB, MB, etc.
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Função principal para testar todas as rotas
async function testAllRoutes() {
  console.log('Iniciando teste de rotas...');
  console.log(`URL base: ${BASE_URL}`);
  console.log('----------------------------------------');
  
  const results = [];
  
  for (const route of routes) {
    const result = await testRoute(route);
    results.push(result);
  }
  
  console.log('----------------------------------------');
  console.log('Resumo dos testes:');
  
  const workingRoutes = results.filter(r => r.working);
  const failedRoutes = results.filter(r => !r.working);
  const emptyDataRoutes = workingRoutes.filter(r => r.hasData === false);
  
  console.log(`Total de rotas: ${routes.length}`);
  console.log(`Rotas funcionando: ${workingRoutes.length}`);
  console.log(`Rotas com falha: ${failedRoutes.length}`);
  console.log(`Rotas sem dados: ${emptyDataRoutes.length}`);
  
  if (failedRoutes.length > 0) {
    console.log('----------------------------------------');
    console.log('Rotas com falha:');
    failedRoutes.forEach(route => {
      console.log(`- ${route.route} (Status: ${route.status}${route.error ? `, Erro: ${route.error}` : ''})`);
    });
  }
  
  if (emptyDataRoutes.length > 0) {
    console.log('----------------------------------------');
    console.log('Rotas que retornam dados vazios:');
    emptyDataRoutes.forEach(route => {
      console.log(`- ${route.route}`);
    });
  }
  
  // Ordenar rotas por tempo de resposta
  const sortedByTime = [...workingRoutes].sort((a, b) => b.time - a.time);
  
  console.log('----------------------------------------');
  console.log('Top 5 rotas mais lentas:');
  sortedByTime.slice(0, 5).forEach(route => {
    console.log(`- ${route.route} (${route.time}ms)`);
  });
}

// Executar os testes
testAllRoutes().catch(error => {
  console.error('Erro ao executar testes:', error);
});