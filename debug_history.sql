-- Query para verificar dados de sinistros por ano/mês
SELECT 
  EXTRACT(YEAR FROM data) as ano,
  EXTRACT(MONTH FROM data) as mes,
  COUNT(*) as count
FROM samu_calls 
WHERE data IS NOT NULL
GROUP BY EXTRACT(YEAR FROM data), EXTRACT(MONTH FROM data)
ORDER BY EXTRACT(YEAR FROM data), EXTRACT(MONTH FROM data);

-- Query para verificar se há dados em todos os meses
SELECT 
  EXTRACT(YEAR FROM data) as ano,
  COUNT(*) as total_ano,
  COUNT(DISTINCT EXTRACT(MONTH FROM data)) as meses_com_dados
FROM samu_calls 
WHERE data IS NOT NULL
GROUP BY EXTRACT(YEAR FROM data)
ORDER BY EXTRACT(YEAR FROM data);