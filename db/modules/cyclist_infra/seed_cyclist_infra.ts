// db/seed/seedCyclistInfra.ts
import * as schemaInfra from "./schema_cyclist_infra";
import { db, readCsv } from "../../utils";
import path from "path";

// Tipo bruto para ler do CSV
interface RawRelation {
  id: string;
  name: string;
  pdc_ref: string;
  pdc_notes: string;
  pdc_typology: string;
  pdc_km: string;
  pdc_stretch: string;
  pdc_cities: string;
  osm_id: string; // pode vir vazio
  notes: string;
}
interface RawRelCity {
  relation_id: string;
  cities_id: string;
}
interface RawWay {
  osm_id: string; // pode vir vazio
  name: string;
  length: string;
  highway: string;
  has_cycleway: string;
  cycleway_typology: string;
  relation_id: string;
  geojson: string;
  lastupdated: string;
  city_id: string;
  dual_carriageway: string;
  pdc_typology: string;
}

export async function seedCyclistInfra() {
  // Relations
  const relsRaw = await readCsv<RawRelation>(
    path.resolve(__dirname, "relations.csv")
  );
  const rels = relsRaw.map((r) => ({
    id: parseInt(r.id, 10),
    name: r.name,
    pdcRef: r.pdc_ref,
    pdcNotes: r.pdc_notes,
    pdcTypology: r.pdc_typology,
    pdcKm: parseFloat(r.pdc_km),
    pdcStretch: r.pdc_stretch,
    pdcCities: r.pdc_cities,
    osmId: r.osm_id ? parseInt(r.osm_id, 10) : null,
    notes: r.notes,
  }));
  await db
    .insert(schemaInfra.cyclist_infra_relations)
    .values(rels)
    .onConflictDoNothing();
  console.log("✅ cyclist_infra_relations seeded");

  // Relation Cities
  const relCitiesRaw = await readCsv<RawRelCity>(
    path.resolve(__dirname, "relations_cities.csv")
  );
  const relCities = relCitiesRaw.map((rc) => ({
    relationId: parseInt(rc.relation_id, 10),
    citiesId: parseInt(rc.cities_id, 10),
  }));
  await db
    .insert(schemaInfra.cyclist_infra_relationCities)
    .values(relCities)
    .onConflictDoNothing();
  console.log("✅ cyclist_infra_relationCities seeded");

  // Ways: filtrar apenas osm_id válido
  const waysRaw = await readCsv<RawWay>(path.resolve(__dirname, "ways.csv"));
  const ways = waysRaw
    .filter((w) => w.osm_id && w.osm_id.trim() !== "")
    .map((w) => ({
      osmId: parseInt(w.osm_id, 10),
      name: w.name || null,
      length: parseFloat(w.length) || null,
      highway: w.highway || null,
      hasCycleway: w.has_cycleway.toLowerCase() === "true",
      cyclewayTypology: w.cycleway_typology || null,
      relationId: w.relation_id ? parseInt(w.relation_id, 10) : null,
      geojson: JSON.parse(w.geojson),
      // passar string para coluna date
      lastUpdated: w.lastupdated || null,
      cityId: w.city_id ? parseInt(w.city_id, 10) : null,
      dualCarriageway: w.dual_carriageway.toLowerCase() === "true",
      pdcTypology: w.pdc_typology || null,
    }));

  await db
    .insert(schemaInfra.cyclist_infra_ways)
    .values(ways)
    .onConflictDoNothing();
  console.log("✅ cyclist_infra_ways seeded (filtered null osm_id)");
}
