import express, { Request, Response } from "express";
import { db } from "../../db";
import * as schema from "../../db/migration/schema";
import { eq } from "drizzle-orm";

const router = express.Router();

interface City {
  cities: {
    id: number;
    name: string;
    state: string;
  };
  relation_cities: {
    relationId: number | null;
    citiesId: number | null;
  };
}

interface CyclistInfraWay {
  osmId: number;
  name: string | null;
  length: number | null;
  highway: string | null;
  hasCycleway: boolean | null;
  cyclewayTypology: string | null;
  relationId: number | null;
  geojson: any; // Substitua 'any' pelo tipo apropriado para o seu caso
  lastUpdated: string | null;
  cityId: number | null;
  dualCarriageway: boolean | null;
  pdcTypology: string | null;
}

interface CyclistInfraRelation {
  id: number;
  name: string | null;
  pdcRef: string | null;
  pdcNotes: string | null;
  pdcTypology: string | null;
  pdcKm: number | null;
  pdcStretch: string | null;
  pdcCities: string | null;
  osmId: number | null;
  notes: string | null;
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const citiesData: City[] = await getCitiesData();
    const waysData: CyclistInfraWay[] = await getWaysData();
    const relationsData: CyclistInfraRelation[] = await getRelationsData();

    const citiesWithInfo: { [key: number]: any } = {};

    citiesData.forEach((city) => {
      if (!citiesWithInfo[city.cities.id]) {
        citiesWithInfo[city.cities.id] = {
          city_id: city.cities.id,
          name: city.cities.name,
          state: city.cities.state,
          relations: [],
        };
      }

      relationsData
        .filter((relation) => relation.id === city.relation_cities.relationId)
        .forEach((relation) => {
          const relationWays = waysData.filter(
            (way) => way.relationId === relation.id
          );
          const relationLength = relationWays.reduce(
            (total, way) => total + way.length!,
            0
          );
          const relationHasCyclewayLength = relationWays.reduce(
            (total, way) => (way.hasCycleway ? total + way.length! : total),
            0
          );

          const typologies = relationWays.reduce(
            (typologiesObj: { [key: string]: number }, way) => {
              if (way.cyclewayTypology) {
                typologiesObj[way.cyclewayTypology] =
                  (typologiesObj[way.cyclewayTypology] || 0) + way.length!;
              }
              return typologiesObj;
            },
            {}
          );

          citiesWithInfo[city.cities.id].relations.push({
            relation_id: relation.id,
            pdc_ref: relation.pdcRef,
            name: relation.name,
            cod_name: `(${relation.pdcRef}) ${relation.name}`,
            length: relationLength,
            has_cycleway_length: relationHasCyclewayLength,
            pdc_typology: relation.pdcTypology,
            typologies_str: Object.keys(typologies).join(", "),
            typologies,
          });
        });
    });

    console.log(
      "GET /cyclist-infra/relationsByCity: Data processed successfully"
    );
    res.json(citiesWithInfo);
  } catch (error) {
    console.error(
      "GET /cyclist-infra/relationsByCity: Error processing data:",
      error
    );
    res.status(500).json({ error: "An error occurred while processing data." });
  }
});

async function getWaysData() {
  try {
    const ways = await db.select().from(schema.cyclist_infra_ways).execute();
    return ways;
  } catch (error) {
    console.error("Error fetching ways data:", error);
    throw new Error("An error occurred while fetching ways data.");
  }
}

async function getCitiesData() {
  try {
    const citiesData = await db
      .select()
      .from(schema.cities)
      .innerJoin(
        schema.cyclist_infra_relationCities,
        eq(schema.cities.id, schema.cyclist_infra_relationCities.citiesId)
      )
      .execute();
    return citiesData;
  } catch (error) {
    console.error("Error fetching cities data:", error);
    throw new Error("An error occurred while fetching cities data.");
  }
}

async function getRelationsData() {
  try {
    const relations = await db
      .select()
      .from(schema.cyclist_infra_relations)
      .execute();
    return relations;
  } catch (error) {
    console.error("Error fetching relations data:", error);
    throw new Error("An error occurred while fetching relations data.");
  }
}

export default router;
