const { sql } = require('@vercel/postgres');
const express = require('express');
const router = express.Router();

// Rota GET para "cyclist-profile"
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT * FROM cyclist_profile.categories LIMIT 1';
    const { rows } = await sql.query(query);

    res.json(rows);
  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
