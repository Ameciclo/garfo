import express, { Request, Response } from "express";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import * as schema from "../../db/migration/schema";

const router = express.Router();

// Em seguida, para cada directionId, obtenha as informações correspondentes da tabela directions
interface DirectionDetail {
  origin: string;
  originCardinal: string;
  destin: string;
  destinCardinal: string;
}

export interface CountEditionCoordinates {
  point: {
    x: number;
    y: number;
  };
  type: string;
  name: string;
}

interface SessionData {
  start_time: Date;
  end_time: Date;
  total_cyclists: number;
  quantitative: { [key: string]: number };
  characteristics: { [key: string]: number };
}

export interface CountEditionSummary {
  max_hour: number;
  total_cyclists: number;
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
}

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const editionId = parseInt(req.params.id);
    if (isNaN(editionId)) {
      return res.status(400).json({ error: "Invalid edition ID" });
    }

    // Obter informações da edição
    const editionData = await db.query.cyclist_count_edition.findFirst({
      where: eq(schema.cyclist_count_edition.id, editionId),
    });

    if (!editionData) {
      return res.status(404).json({ error: "Edition not found" });
    }

    const { id, cityId, name, date, coordinatesId } = editionData;

    // FAZ O SLUG DA CONTAGEM

    const slugName = name!
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
      .toLowerCase();

    const slugDate = new Date(date!).toISOString().slice(0, 10);
    const slug = `${editionId}-${slugDate}-${slugName}`;

    // Obter cidade relacionadas a esta edição
    const city = await db.query.cities.findFirst({
      where: eq(schema.cities.id, cityId!),
    });

    // Obter coordenadas relacionadas a esta edição
    const coordinatesData = await db.query.coordinates.findFirst({
      where: eq(schema.coordinates.id, coordinatesId!),
    });

    // Converter a string de coordenadas para o formato da interface
    const coordParts = coordinatesData!.point
      .toString()
      .split(", ")
      .map(Number);
    const coordinates: CountEditionCoordinates[] = [] 
    coordinates.push({
      point: {
        x: coordParts[0],
        y: coordParts[1],
      },
      type: "Point",
      name: name,
    });

    const sessionsData = await db.query.cyclist_count_session.findMany({
      where: eq(schema.cyclist_count_session.editionId, editionId),
    });

    // Verifica se há sessões disponíveis
    if (sessionsData.length === 0) {
      return res
        .status(404)
        .json({ error: "No sessions found for this edition" });
    }

    // Pega a primeira sessão
    const firstSession = sessionsData[0];

    // Obtem detalhes de direção para cada ID de direção
    let directions: { [key: string]: string } = {};

    // Obter todos os directionIds únicos de todas as sessões
    let allDirectionCounts = await db.query.direction_count.findMany({
      where: eq(schema.direction_count.sessionId, firstSession.id),
    });

    let uniqueDirectionIds = [
      ...new Set(allDirectionCounts.map((dc) => dc.directionId)),
    ];

    // Obter detalhes de direção para todos os directionIds únicos
    let directionDetails: { [directionId: number]: DirectionDetail } = {};
    for (const directionId of uniqueDirectionIds) {
      const detail = await db.query.directions.findFirst({
        where: eq(schema.directions.id, directionId),
      });

      if (detail) {
        directionDetails[directionId] = {
          origin: detail.origin,
          originCardinal: detail.originCardinal,
          destin: detail.destin,
          destinCardinal: detail.destinCardinal,
        };
        directions[detail.originCardinal] = detail.origin;
      }
    }

    // 1. Listar todas as características possíveis do banco
    const allCharacteristics =
      await db.query.cyclist_count_characteristics.findMany();
    let characteristicsTemplate: { [key: string]: number } = {};
    let total_characteristics: { [key: string]: number } = {};
    let allCharacteristicsTypes: { [key: string]: string } = {};
    allCharacteristics.forEach((char) => {
      characteristicsTemplate[char.type] = 0;
      total_characteristics[char.type] = 0;
      allCharacteristicsTypes[char.id] = char.type;
    });

    let summary: CountEditionSummary = {
      max_hour: 0,
      total_cyclists: 0,
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

    // Processar cada sessão
    let sessions: { [sessionId: number]: SessionData } = {};
    for (const session of sessionsData) {
      const {
        id: sessionId,
        startTime: start_time,
        endTime: end_time,
      } = session;

      let session_total_cyclists = 0;

      // Obter todos os directionIds únicos de todas as sessões
      let sessionDirectionCount = await db.query.direction_count.findMany({
        where: eq(schema.direction_count.sessionId, session.id),
      });

      // Obter counts de direção para a sessão
      const directionCounts = sessionDirectionCount.filter(
        (dc) => dc.sessionId === sessionId
      );

      // Calcular total de ciclistas e detalhes quantitativos
      let quantitative: { [key: string]: number } = {};

      directionCounts.forEach((dc) => {
        session_total_cyclists += dc.count;
        if (directionDetails[dc.directionId]) {
          const key = `${directionDetails[dc.directionId].originCardinal}_${
            directionDetails[dc.directionId].destinCardinal
          }`;
          quantitative[key] = (quantitative[key] || 0) + dc.count;
        }
      });

      summary.total_cyclists += session_total_cyclists;

      if (session_total_cyclists > summary.max_hour)
        summary.max_hour = session_total_cyclists;

      // 2. Pegar contagens de características para a sessão
      const characteristicsCounts =
        await db.query.cyclist_count_characteristicsCount.findMany({
          where: eq(
            schema.cyclist_count_characteristicsCount.sessionId,
            session.id
          ),
        });

      let characteristics: { [key: string]: number } = {
        ...characteristicsTemplate,
      };

      characteristicsCounts.forEach((cc) => {
        const characteristic_type =
          allCharacteristicsTypes[cc.characteristicsId!];
        characteristics[characteristic_type] += cc.count || 0;
        total_characteristics[characteristic_type] += cc.count || 0;
      });

      // Adicionar dados da sessão
      sessions[sessionId] = {
        start_time,
        end_time,
        total_cyclists: session_total_cyclists,
        quantitative,
        characteristics,
      };
    }

    for (const [key, value] of Object.entries(total_characteristics)) {
      const total_key = "total_" + key;
      if (total_key in summary) {
        summary[total_key as keyof CountEditionSummary] = value;
      }
    }

    const response = {
      id,
      slug,
      name,
      date,
      city,
      coordinates,
      directions,
      sessions,
      summary,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching edition data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
