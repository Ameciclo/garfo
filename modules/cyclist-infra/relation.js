// Import necessary modules and packages
const express = require("express");
const OSMController = require("../../OSMController");

const router = express.Router();

// Route to fetch data for a specific OSM relation by ID
router.get("/:relationId", async (req, res) => {
  try {
    const { relationId } = req.params;
    const relationData = await OSMController.getWaysFromRelationId(relationId);
    console.log(`GET /cyclist-infra/relation/${relationId}: Data fetched successfully`);
    res.json(relationData);
  } catch (error) {
    console.error(`GET /cyclist-infra/relation/`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
