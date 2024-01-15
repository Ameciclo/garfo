//cyclists-counts/editions.js

const { Pool } = require("pg");
const express = require("express");
const router = express.Router();

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
 // ssl: true,
});

router.get("/:id", async (req, res) => {
  try {
    const { id: req_id } = req.params;

    if (!req_id) {
      return res.status(400).json({ error: "Missing ID parameter" });
    }

    const editionQuery = `SELECT
                          e.id,
                          e.name,
                          CAST((SELECT SUM(dc.count) FROM cyclist_count.direction_counts dc JOIN cyclist_count.session s ON dc.session_id = s.id WHERE s.edition_id = e.id) AS INTEGER) AS total_cyclists,
                          e.date,
                          CAST(SUM(CASE WHEN ch.type = 'cargo' THEN cc.count ELSE 0 END) AS INTEGER) AS total_cargo,
                          CAST(SUM(CASE WHEN ch.type = 'helmet' THEN cc.count ELSE 0 END) AS INTEGER) AS total_helmet,
                          CAST(SUM(CASE WHEN ch.type = 'juveniles' THEN cc.count ELSE 0 END) AS INTEGER) AS total_juveniles,
                          CAST(SUM(CASE WHEN ch.type = 'motor' THEN cc.count ELSE 0 END) AS INTEGER) AS total_motor,
                          CAST(SUM(CASE WHEN ch.type = 'ride' THEN cc.count ELSE 0 END) AS INTEGER) AS total_ride,
                          CAST(SUM(CASE WHEN ch.type = 'service' THEN cc.count ELSE 0 END) AS INTEGER) AS total_service,
                          CAST(SUM(CASE WHEN ch.type = 'shared_bike' THEN cc.count ELSE 0 END) AS INTEGER) AS total_shared_bike,
                          CAST(SUM(CASE WHEN ch.type = 'sidewalk' THEN cc.count ELSE 0 END) AS INTEGER) AS total_sidewalk,
                          CAST(SUM(CASE WHEN ch.type = 'women' THEN cc.count ELSE 0 END) AS INTEGER) AS total_women,
                          CAST(SUM(CASE WHEN ch.type = 'wrong_way' THEN cc.count ELSE 0 END) AS INTEGER) AS total_wrong_way
                        FROM
                          cyclist_count.edition e
                        LEFT JOIN
                          cyclist_count.characteristics_count cc ON e.id = cc.edition_id
                        LEFT JOIN
                          cyclist_count.characteristics ch ON cc.characteristics_id = ch.id
                        WHERE
                          e.id = $1
                        GROUP BY
                          e.id, e.name, e.date
                      `;

    const client = await pool.connect();
    console.log(`conectado à ${process.env.POSTGRES_DATABASE}`);

    try {
      const { rows: editionData } = await client.query(editionQuery, [req_id]);

      if (editionData.length === 0) {
        return res.status(404).json({ error: "Edition not found" });
      }

      let { id, name, date, ...summary } = editionData[0];

      const coordinatesQuery = `SELECT c.point, c."type", c."name"
                              FROM public.coordinates c
                              JOIN cyclist_count.edition e ON e.coordinates_id = c.id
                              WHERE e.id = $1;
                            `;
      const { rows: coordinates } = await client.query(coordinatesQuery, [
        req_id,
      ]);

      const sessionsQuery = `SELECT s.start_time, s.end_time, s.id
                              FROM cyclist_count."session" s
                              WHERE s.edition_id = $1;
                            `;
      const { rows: sessionsData } = await client.query(sessionsQuery, [
        req_id,
      ]);

      const sessions = {};
      let maxCount = 0;
      let max_hour = null;
      let directions = {};

      for (const session of sessionsData) {
        const sessionId = session.id;
        const characteristicsQuery = `SELECT cc.characteristics_id, cc.count, ch."name"
                                      FROM cyclist_count.characteristics_count cc
                                      JOIN cyclist_count.characteristics ch ON cc.characteristics_id = ch.id
                                      WHERE cc.session_id = $1;
                                    `;
        const characteristicsData = await client.query(characteristicsQuery, [
          sessionId,
        ]);

        const characteristics = {};
        for (const characteristic of characteristicsData.rows) {
          characteristics[characteristic.name] = characteristic.count;
        }

        // Query para obter os dados quantitativos da sessão
        const quantitativeQuery = `SELECT dc.origin_cardinal, dc.destin_cardinal, dc.count, dc.origin, dc.destin
                                    FROM cyclist_count.direction_counts dc
                                    WHERE dc.session_id = $1;
                                  `;
        const quantitativeData = await client.query(quantitativeQuery, [
          sessionId,
        ]);

        let total_cyclists = 0;
        const quantitative = {};
        for (const d of quantitativeData.rows) {
          const key = `${d.origin_cardinal}_${d.destin_cardinal}`;
          quantitative[key] = d.count;
          total_cyclists += d.count;
          directions[key] = {
            origin: d.origin,
            destin: d.destin,
            origin_cardinal: d.origin_cardinal,
            destin_cardinal: d.destin_cardinal,
          };
        }
        if (total_cyclists > maxCount) {
          maxCount = total_cyclists;
          max_hour = total_cyclists;
        }
        sessions[sessionId] = {
          start_time: session.start_time,
          end_time: session.end_time,
          total_cyclists,
          characteristics,
          quantitative,
        };
      }

      const slugName = name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")
        .toLowerCase();

      const slugDate = new Date(date).toISOString().slice(0, 10);
      const slug = `${req_id}-${slugDate}-${slugName}`;

      summary = { max_hour, ...summary };

      const data = {
        id: parseInt(req_id),
        slug,
        name,
        date,
        summary,
        coordinates,
        sessions,
        directions,
      };

      console.log(`GET /your-route/${req_id}: Data fetched successfully`);
      res.json(data);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error executing SQL queries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
