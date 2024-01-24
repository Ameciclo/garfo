import express, { Request, Response } from "express";
import * as OSMController from "../../commons/osm-controller";

const router = express.Router();

// Route to fetch data for a specific OSM relation by ID
router.get("/:relationId", async (req: Request, res: Response) => {
  try {
    const { relationId } = req.params;
    const numericRelationId = parseInt(relationId, 10); // Parse relationId as a number

    if (isNaN(numericRelationId)) {
      // Handle the case where relationId is not a valid number
      throw new Error("Invalid relationId");
    }

    const relationData = await OSMController.getWaysFromRelationId(
      numericRelationId
    );

    console.log(
      `GET /cyclist-infra/relation/${relationId}: Data fetched successfully`
    );
    res.json(relationData);
  } catch (error) {
    console.error(`GET /cyclist-infra/relation/`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
