const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// Compliance report (audits below threshold)
router.get('/compliance', auth, async (req, res) => {
  const result = await pool.query(`
    SELECT a.audit_id, a.score, t.name AS template_name, u.name AS auditor_name
    FROM audits a
    JOIN templates t ON a.template_id = t.template_id
    JOIN users u ON a.assigned_to = u.user_id
    WHERE a.score < (t.scoring_rules->>'threshold')::NUMERIC
  `);
  res.json(result.rows);
});

// Section-wise breakdown for an audit
router.get('/breakdown/:audit_id', auth, async (req, res) => {
  const { audit_id } = req.params;
  const result = await pool.query(
    `SELECT responses FROM audits WHERE audit_id=$1`, [audit_id]
  );
  res.json(result.rows[0]?.responses || {});
});

module.exports = router;