-- Custom SQL migration file, put your code below! --
ALTER TABLE streets.pref_street_names
  -- 1) Define o novo tipo e SRID
  ALTER COLUMN geom
    TYPE geometry(MULTILINESTRING, 4326)
  -- 2) Converte os valores existentes: 
  --    - seta o SRID correto (se ainda não estiver)
  --    - garante que seja um Multi-* (se já for multilinestring mantém, 
  --      se for linestring agrupa num multi)
  USING ST_Multi(ST_SetSRID(geom, 4326));