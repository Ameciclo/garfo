// modules/datasus-deaths/config.ts

// Configurações para o módulo datasus-deaths
export const config = {
  // Filtros para causas específicas (CID-10)
  causas: {
    // Códigos CID-10 para acidentes de transporte (V01-V99)
    transporte: {
      prefixo: 'V',
      descricao: 'Acidentes de transporte'
    }
  },
  
  // Período padrão para análises
  periodos: {
    anosRetroativos: 10
  },
  
  // Mapeamento de códigos para valores legíveis
  mapeamentos: {
    sexo: {
      '0': 'Não informado',
      '1': 'Masculino',
      '2': 'Feminino',
      '9': 'Ignorado'
    },
    racacor: {
      '1': 'Branca',
      '2': 'Preta',
      '3': 'Amarela',
      '4': 'Parda',
      '5': 'Indígena',
      '9': 'Ignorado',
      'NA': 'Não informado'
    },
    localOcorrencia: {
      '1': 'Hospital',
      '2': 'Outro estabelecimento de saúde',
      '3': 'Domicílio',
      '4': 'Via pública',
      '5': 'Outros',
      '9': 'Ignorado'
    },
    modosTransporte: {
      'V0': 'Pedestre',
      'V1': 'Ciclista',
      'V2': 'Motociclista',
      'V3': 'Ocupante de triciclo',
      'V4': 'Ocupante de automóvel',
      'V5': 'Ocupante de caminhonete',
      'V6': 'Ocupante de veículo pesado',
      'V7': 'Ocupante de ônibus',
      'V8': 'Outros modos',
      'V9': 'Não especificado'
    },
    faixasEtarias: [
      { min: 0, max: 4, label: '0 a 4 anos' },
      { min: 5, max: 9, label: '5 a 9 anos' },
      { min: 10, max: 14, label: '10 a 14 anos' },
      { min: 15, max: 19, label: '15 a 19 anos' },
      { min: 20, max: 29, label: '20 a 29 anos' },
      { min: 30, max: 39, label: '30 a 39 anos' },
      { min: 40, max: 49, label: '40 a 49 anos' },
      { min: 50, max: 59, label: '50 a 59 anos' },
      { min: 60, max: 69, label: '60 a 69 anos' },
      { min: 70, max: 79, label: '70 a 79 anos' },
      { min: 80, max: 999, label: '80 anos ou mais' }
    ]
  }
};