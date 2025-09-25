const express = require('express');
const router = express.Router();
const controller = require('../controllers');

// Example endpoints
router.get('/executions', controller.getAllExecutions);
router.post('/executions', controller.createExecution);
router.get('/executions/:id', controller.getExecutionById);
router.put('/executions/:id', controller.updateExecution);
router.delete('/executions/:id', controller.deleteExecution);

module.exports = router;