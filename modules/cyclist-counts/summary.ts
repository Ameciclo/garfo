import express, { Request, Response } from "express";
import { db } from "../../db";
import { or, eq, sql } from "drizzle-orm";
import * as schema from "../../db/migration/schema";

export type city = {
  id: number;
  name: string;
  state: string;
};

export interface CountEdition {
  id: number;
  slug: string;
  name: string;
  date: string;
  coordinates: CountEditionCoordinates;
  city: city;
  total_cyclists: number;
}

export interface CountEditionCoordinates {
  x: number;
  y: number;
  type: string;
  name: string;
}

export interface MaxCountedDetails {
  slug: string;
  coordinates: CountEditionCoordinates;
  total_cyclists: number;
  date: string;
}

export interface CountEditionSummary {
  total_cyclists: number;
  number_counts: number;
  different_counts_points: number;
  where_max_count: MaxCountedDetails;
  total_cargo: number;
  total_helmet: number;
  total_juveniles: number;
  total_motor: number;
  total_ride: number;
  total_service: number;
  total_shared_bike: number;
  total_sidewalk: number;
  total_women: number;
  total_wrong_way: number;
  [key: string]: number | MaxCountedDetails; // Allow any string key with number or MaxCountedDetails value
}

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    let editionsRes: CountEdition[] = [];
    let total_cyclists_summary = 0;

    let where_max_count: MaxCountedDetails = {
      slug: "nowhere",
      total_cyclists: 0,
      coordinates: {
        x: 0,
        y: 0,
        type: "Point",
        name: "nowhere",
      },
      date: "",
    };
    const editions = await db
      .select()
      .from(schema.cyclist_count_edition)
      .execute();

    // Extrair IDs únicos de cidades e coordenadas
    const citiesIds = new Set(editions.map((edition) => edition.cityId));
    const coordinatesIds = new Set(
      editions.map((edition) => edition.coordinatesId)
    );

    // Criar condições para buscar cidades e coordenadas
    const cityConditions = Array.from(citiesIds).map((id) =>
      eq(schema.cities.id, id)
    );
    const coordinatesConditions = Array.from(coordinatesIds).map((id) =>
      eq(schema.coordinates.id, id)
    );

    // Buscar cidades e coordenadas
    const cities =
      cityConditions.length > 0
        ? await db
            .select()
            .from(schema.cities)
            .where(or(...cityConditions))
            .execute()
        : [];
    const coordinates =
      coordinatesConditions.length > 0
        ? await db
            .select()
            .from(schema.coordinates)
            .where(or(...coordinatesConditions))
            .execute()
        : [];

    // Mapeamento para cidades
    const cityMapping: Record<number, city> = cities.reduce(
      (acc, city) => ({ ...acc, [city.id]: city }),
      {}
    );

    // Mapeamento para coordenadas
    const coordinatesMapping: Record<number, string> = coordinates.reduce(
      (acc, coord) => ({ ...acc, [coord.id]: coord.point }),
      {}
    );

    let total_cyclists;

    // Para cada edição, calcular o total de ciclistas
    for (const edition of editions) {
      const { id, cityId, name, date, coordinatesId } = edition;

      const totalCyclistsResult = await db
        .select({
          total_cyclists: sql<number>`cast(sum(${schema.direction_count.count}) as int)`,
        })
        .from(schema.direction_count)
        .leftJoin(
          schema.cyclist_count_session,
          eq(schema.cyclist_count_session.id, schema.direction_count.sessionId)
        )
        .where(eq(schema.cyclist_count_session.editionId, edition.id))
        .groupBy(schema.cyclist_count_session.editionId)
        .execute();

      total_cyclists = totalCyclistsResult[0]?.total_cyclists ?? 0;

      total_cyclists_summary += total_cyclists;

      const slugName = name!
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

      const slugDate = new Date(date!).toISOString().slice(0, 10);
      const slug = `${id}-${slugDate}-${slugName}`;

      // Converter a string de coordenadas para o formato da interface
      const coordParts = coordinatesMapping[coordinatesId]
        .split(", ")
        .map(Number);
      const coordinates: CountEditionCoordinates = {
        x: coordParts[0],
        y: coordParts[1],
        type: "Point",
        name: name,
      };

      if (total_cyclists > where_max_count.total_cyclists) {
        where_max_count = {
          slug,
          coordinates,
          total_cyclists,
          date,
        };
      }
      // Montar o objeto da edição
      editionsRes.push({
        id: id,
        slug: slug,
        name: name,
        date: new Date(date!).toISOString(),
        coordinates,
        city: cityMapping[cityId],
        total_cyclists,
      });
    }

    // 1. Pegar a tabela de características
    const allCharacteristics =
      await db.query.cyclist_count_characteristics.findMany();

    // 2. Criar um mapa de tipos de características e suas IDs
    const characteristicsTypeMap: Record<string, Set<number>> = {};
    allCharacteristics.forEach((char) => {
      if (!characteristicsTypeMap[char.type]) {
        characteristicsTypeMap[char.type] = new Set();
      }
      characteristicsTypeMap[char.type].add(char.id);
    });

    let summary: CountEditionSummary = {
      total_cyclists: total_cyclists_summary,
      number_counts: editions.length,
      different_counts_points: 0,
      where_max_count,
      total_cargo: 0,
      total_helmet: 0,
      total_juveniles: 0,
      total_motor: 0,
      total_ride: 0,
      total_service: 0,
      total_shared_bike: 0,
      total_sidewalk: 0,
      total_women: 0,
      total_wrong_way: 0,
    };

    // 3. Iterar por todos os tipos e verificar se total_${char.type} está em summary
    // Para cada tipo de característica, calcular a soma total diretamente no banco de dados
    for (const type in characteristicsTypeMap) {
      const totalTypeKey = `total_${type}`;
      if (totalTypeKey in summary) {
        const ids = Array.from(characteristicsTypeMap[type]);

        const totalForTypeResult = await db
          .select({
            totalForType: sql<number>`cast(sum(${schema.cyclist_count_characteristicsCount.count}) as int)`,
          })
          .from(schema.cyclist_count_characteristicsCount)
          .where(
            or(
              ...ids.map((id) =>
                eq(
                  schema.cyclist_count_characteristicsCount.characteristicsId,
                  id
                )
              )
            )
          )
          .execute();

        const totalForType = totalForTypeResult[0]?.totalForType ?? 0;
        summary[totalTypeKey] = totalForType;
      }
    }

    res.status(200).json({ counts: editionsRes, summary });
  } catch (error) {
    console.error("Error executing SQL queries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
