ALTER TABLE casualties.samu_calls
  -- 1) Define o novo tipo e SRID
  ALTER COLUMN geom
    TYPE geometry(MULTILINESTRING, 4326)