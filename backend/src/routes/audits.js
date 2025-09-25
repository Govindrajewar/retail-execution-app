const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// Assign audit
router.post('/assign', auth, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { template_id, assigned_to, location } = req.body;
  const result = await pool.query(
    `INSERT INTO audits (template_id, assigned_to, location)
     VALUES ($1, $2, $3) RETURNING *`,
    [template_id, assigned_to, location]
  );
  res.status(201).json(result.rows[0]);
});

// Get audits assigned to user
router.get('/my', auth, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = req.user.user_id;
  const result = await pool.query(
    `SELECT a.*, t.name as template_name FROM audits a
     JOIN templates t ON a.template_id = t.template_id
     WHERE a.assigned_to=$1`, [userId]
  );
  res.json(result.rows);
});

const { calculateScore } = require('../controllers/scoring'); // <-- Import here

// Submit audit responses (with scoring)
router.put('/:id/submit', auth, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { responses } = req.body;
  const { id } = req.params;

  // Fetch template for scoring
  const auditRes = await pool.query('SELECT template_id FROM audits WHERE audit_id=$1', [id]);
  const templateId = auditRes.rows[0]?.template_id;
  const templateRes = await pool.query('SELECT * FROM templates WHERE template_id=$1', [templateId]);
  const template = templateRes.rows[0];

  // Calculate score
  const score = calculateScore(template, responses);

  const result = await pool.query(
    `UPDATE audits SET responses=$1, score=$2, status='Completed', submitted_at=NOW()
     WHERE audit_id=$3 RETURNING *`,
    [responses, score, id]
  );
  res.json(result.rows[0]);
});


// Save audit progress (draft)
router.put('/:id/save', auth, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { responses } = req.body;
  const { id } = req.params;
  const result = await pool.query(
    `UPDATE audits SET responses=$1, status='In Progress'
     WHERE audit_id=$2 RETURNING *`,
    [responses, id]
  );
  res.json(result.rows[0]);
});

module.exports = router;