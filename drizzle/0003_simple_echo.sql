-- Custom SQL migration file, put your code below! --
ALTER TABLE global.speed_plates
  ALTER COLUMN geom
    TYPE geometry(POINT, 4326)
  USING ST_SetSRID(geom, 4326);