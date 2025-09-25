const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// Create template (draft or published)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, category, sections, scoring_rules } = req.body;
    const userId = req.user.user_id;
    const result = await pool.query(
      `INSERT INTO templates (name, description, category, sections, scoring_rules, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        name,
        description,
        category,
        JSON.stringify(sections),        // Ensure JSON string
        JSON.stringify(scoring_rules),   // Ensure JSON string
        userId
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update template (draft or publish)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, category, sections, scoring_rules, is_published } = req.body;
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE templates SET name=$1, description=$2, category=$3, sections=$4, scoring_rules=$5, is_published=$6, updated_at=NOW()
       WHERE template_id=$7 RETURNING *`,
      [
        name,
        description,
        category,
        JSON.stringify(sections),        // Ensure JSON string
        JSON.stringify(scoring_rules),   // Ensure JSON string
        is_published,
        id
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Get all published templates
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM templates WHERE is_published=TRUE');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get template by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM templates WHERE template_id=$1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

module.exports = router;