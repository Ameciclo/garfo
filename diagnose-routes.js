const fs = require('fs');
const path = require('path');

// Função para verificar se um arquivo existe
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Função para ler um arquivo
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return null;
  }
}

// Função para verificar se um módulo exporta um router
function checkModuleExportsRouter(filePath) {
  const content = readFile(filePath);
  if (!content) return false;
  
  // Verificar se o arquivo exporta um router
  return content.includes('export default router') || 
         content.includes('module.exports = router') ||
         content.includes('export default app') ||
         content.includes('module.exports = app');
}

// Função para verificar as rotas definidas no index.ts
function checkIndexRoutes() {
  const indexPath = path.join(__dirname, 'index.ts');
  const content = readFile(indexPath);
  if (!content) {
    console.error('Não foi possível ler o arquivo index.ts');
    return [];
  }
  
  // Extrair as rotas definidas com app.use()
  const routeRegex = /app\.use\(['"](\/[^'"]+)['"]/g;
  const routes = [];
  let match;
  
  while ((match = routeRegex.exec(content)) !== null) {
    routes.push(match[1]);
  }
  
  return routes;
}

// Função para verificar os módulos e suas rotas
function checkModules() {
  const modulesDir = path.join(__dirname, 'modules');
  const results = {
    modules: [],
    issues: []
  };
  
  // Verificar se o diretório de módulos existe
  if (!fileExists(modulesDir)) {
    results.issues.push('Diretório de módulos não encontrado');
    return results;
  }
  
  // Obter todos os diretórios dentro de modules
  const moduleDirs = fs.readdirSync(modulesDir)
    .filter(dir => fs.statSync(path.join(modulesDir, dir)).isDirectory());
  
  // Verificar cada módulo
  for (const moduleDir of moduleDirs) {
    const modulePath = path.join(modulesDir, moduleDir);
    const moduleFiles = fs.readdirSync(modulePath)
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    
    const moduleInfo = {
      name: moduleDir,
      files: moduleFiles,
      hasIndexFile: moduleFiles.includes('index.ts') || moduleFiles.includes('index.js'),
      routes: []
    };
    
    // Verificar o arquivo index do módulo
    if (moduleInfo.hasIndexFile) {
      const indexFile = moduleFiles.includes('index.ts') ? 'index.ts' : 'index.js';
      const indexPath = path.join(modulePath, indexFile);
      
      if (checkModuleExportsRouter(indexPath)) {
        // Extrair as rotas definidas no arquivo index
        const content = readFile(indexPath);
        const routeRegex = /router\.use\(['"](\/[^'"]+)['"]/g;
        let match;
        
        while ((match = routeRegex.exec(content)) !== null) {
          moduleInfo.routes.push(match[1]);
        }
      } else {
        results.issues.push(`O arquivo index do módulo ${moduleDir} não exporta um router`);
      }
    } else {
      results.issues.push(`O módulo ${moduleDir} não possui um arquivo index`);
    }
    
    // Verificar cada arquivo do módulo
    for (const file of moduleFiles) {
      if (file === 'index.ts' || file === 'index.js') continue;
      
      const filePath = path.join(modulePath, file);
      if (!checkModuleExportsRouter(filePath)) {
        results.issues.push(`O arquivo ${moduleDir}/${file} não exporta um router`);
      }
    }
    
    results.modules.push(moduleInfo);
  }
  
  return results;
}

// Função para verificar as rotas solicitadas pelo usuário
function checkRequestedRoutes(requestedRoutes) {
  const indexRoutes = checkIndexRoutes();
  const moduleResults = checkModules();
  const results = {
    requestedRoutes: [],
    issues: [...moduleResults.issues]
  };
  
  // Verificar cada rota solicitada
  for (const route of requestedRoutes) {
    const routeInfo = {
      path: route,
      definedInIndex: false,
      moduleFound: false,
      subRouteFound: false,
      issues: []
    };
    
    // Verificar se a rota está definida no index.ts
    const baseRoute = '/' + route.split('/')[1]; // Pega apenas o primeiro segmento da rota
    routeInfo.definedInIndex = indexRoutes.some(r => r === baseRoute);
    
    if (!routeInfo.definedInIndex) {
      routeInfo.issues.push(`Rota base '${baseRoute}' não está definida no index.ts`);
    }
    
    // Verificar se o módulo correspondente existe
    const moduleDir = baseRoute.substring(1).replace(/-/g, '-'); // Remove a barra inicial
    const moduleFound = moduleResults.modules.find(m => m.name === moduleDir);
    routeInfo.moduleFound = !!moduleFound;
    
    if (!routeInfo.moduleFound) {
      routeInfo.issues.push(`Módulo '${moduleDir}' não encontrado`);
    } else if (route !== baseRoute) {
      // Se for uma sub-rota, verificar se está definida no módulo
      const subRoute = '/' + route.split('/').slice(2).join('/'); // Pega os segmentos após o primeiro
      routeInfo.subRouteFound = moduleFound.routes.some(r => r === subRoute || r === '*');
      
      if (!routeInfo.subRouteFound) {
        routeInfo.issues.push(`Sub-rota '${subRoute}' não encontrada no módulo '${moduleDir}'`);
      }
    }
    
    results.requestedRoutes.push(routeInfo);
  }
  
  return results;
}

// Lista de rotas solicitadas pelo usuário
const requestedRoutes = [
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
  '/datasus-deaths/causas-secundarias'
];

// Executar a verificação
const results = checkRequestedRoutes(requestedRoutes);

// Exibir os resultados
console.log('=== Diagnóstico de Rotas ===');
console.log('\nProblemas gerais encontrados:');
if (results.issues.length === 0) {
  console.log('Nenhum problema geral encontrado.');
} else {
  results.issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`);
  });
}

console.log('\nAnálise das rotas solicitadas:');
results.requestedRoutes.forEach(route => {
  console.log(`\nRota: ${route.path}`);
  console.log(`- Definida no index.ts: ${route.definedInIndex ? 'Sim' : 'Não'}`);
  console.log(`- Módulo encontrado: ${route.moduleFound ? 'Sim' : 'Não'}`);
  
  if (route.path.split('/').length > 2) {
    console.log(`- Sub-rota encontrada: ${route.subRouteFound ? 'Sim' : 'Não'}`);
  }
  
  if (route.issues.length > 0) {
    console.log('- Problemas:');
    route.issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`);
    });
  } else {
    console.log('- Problemas: Nenhum');
  }
});

// Resumo final
const routesWithIssues = results.requestedRoutes.filter(r => r.issues.length > 0);
console.log('\n=== Resumo ===');
console.log(`Total de rotas analisadas: ${results.requestedRoutes.length}`);
console.log(`Rotas com problemas: ${routesWithIssues.length}`);
console.log(`Rotas sem problemas: ${results.requestedRoutes.length - routesWithIssues.length}`);

if (routesWithIssues.length > 0) {
  console.log('\nRotas com problemas:');
  routesWithIssues.forEach(route => {
    console.log(`- ${route.path}`);
  });
}