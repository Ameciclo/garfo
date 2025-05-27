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
  }
};