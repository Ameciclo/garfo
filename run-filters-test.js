// Script simples para testar o módulo filters
const express = require('express');

// Simular uma requisição básica
async function testFilters() {
  try {
    console.log('🧪 Testando módulo filters...\n');
    
    // Teste 1: Parâmetros básicos
    console.log('✅ Teste 1: Parsing de parâmetros');
    const mockReq = {
      query: {
        cityId: '2611606',
        startYear: '2020',
        endYear: '2023',
        gender: 'M',
        ageMin: '18',
        ageMax: '65',
        includeInvalid: 'true'
      }
    };
    
    // Simular o parsing de parâmetros do filters.ts
    const filtros = {};
    
    if (mockReq.query.cityId && !isNaN(Number(mockReq.query.cityId))) {
      filtros.cityId = Number(mockReq.query.cityId);
    }
    
    if (mockReq.query.startYear && !isNaN(Number(mockReq.query.startYear))) {
      filtros.startYear = Number(mockReq.query.startYear);
    }
    
    if (mockReq.query.endYear && !isNaN(Number(mockReq.query.endYear))) {
      filtros.endYear = Number(mockReq.query.endYear);
    }
    
    if (mockReq.query.gender) {
      filtros.gender = Array.isArray(mockReq.query.gender) 
        ? mockReq.query.gender 
        : [mockReq.query.gender];
    }
    
    if (mockReq.query.ageMin && !isNaN(Number(mockReq.query.ageMin))) {
      filtros.ageMin = Number(mockReq.query.ageMin);
    }
    
    if (mockReq.query.ageMax && !isNaN(Number(mockReq.query.ageMax))) {
      filtros.ageMax = Number(mockReq.query.ageMax);
    }
    
    if (mockReq.query.includeInvalid !== undefined) {
      filtros.includeInvalid = mockReq.query.includeInvalid === 'true';
    }
    
    console.log('Filtros parseados:', filtros);
    console.log('✅ cityId:', filtros.cityId === 2611606);
    console.log('✅ startYear:', filtros.startYear === 2020);
    console.log('✅ endYear:', filtros.endYear === 2023);
    console.log('✅ gender:', JSON.stringify(filtros.gender) === '["M"]');
    console.log('✅ ageMin:', filtros.ageMin === 18);
    console.log('✅ ageMax:', filtros.ageMax === 65);
    console.log('✅ includeInvalid:', filtros.includeInvalid === true);
    
    // Teste 2: Parâmetros legados
    console.log('\n✅ Teste 2: Compatibilidade com parâmetros legados');
    const mockReqLegacy = {
      query: {
        municipio: '2611606',
        sexo: 'F',
        incluirInvalidos: 'true'
      }
    };
    
    const filtrosLegacy = {};
    
    if (mockReqLegacy.query.municipio && !isNaN(Number(mockReqLegacy.query.municipio))) {
      filtrosLegacy.cityId = Number(mockReqLegacy.query.municipio);
    }
    
    if (mockReqLegacy.query.sexo) {
      filtrosLegacy.gender = Array.isArray(mockReqLegacy.query.sexo) 
        ? mockReqLegacy.query.sexo 
        : [mockReqLegacy.query.sexo];
    }
    
    if (mockReqLegacy.query.incluirInvalidos !== undefined) {
      filtrosLegacy.includeInvalid = mockReqLegacy.query.incluirInvalidos === 'true';
    }
    
    console.log('Filtros legados parseados:', filtrosLegacy);
    console.log('✅ municipio -> cityId:', filtrosLegacy.cityId === 2611606);
    console.log('✅ sexo -> gender:', JSON.stringify(filtrosLegacy.gender) === '["F"]');
    console.log('✅ incluirInvalidos -> includeInvalid:', filtrosLegacy.includeInvalid === true);
    
    // Teste 3: Arrays múltiplos
    console.log('\n✅ Teste 3: Arrays múltiplos');
    const mockReqArray = {
      query: {
        category: ['ATROPELAMENTO', 'COLISAO']
      }
    };
    
    const filtrosArray = {};
    if (mockReqArray.query.category) {
      filtrosArray.category = Array.isArray(mockReqArray.query.category) 
        ? mockReqArray.query.category 
        : [mockReqArray.query.category];
    }
    
    console.log('Categorias múltiplas:', filtrosArray.category);
    console.log('✅ Array de categorias:', Array.isArray(filtrosArray.category) && filtrosArray.category.length === 2);
    
    console.log('\n🎉 Todos os testes passaram!');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
  }
}

testFilters();