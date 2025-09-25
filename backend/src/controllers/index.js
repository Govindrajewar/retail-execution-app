// In-memory data for demo
let executions = [];
let idCounter = 1;

exports.getAllExecutions = (req, res) => {
  res.json(executions);
};

exports.createExecution = (req, res) => {
  const exec = { id: idCounter++, ...req.body };
  executions.push(exec);
  res.status(201).json(exec);
};

exports.getExecutionById = (req, res) => {
  const exec = executions.find(e => e.id == req.params.id);
  if (!exec) return res.status(404).json({ error: 'Not found' });
  res.json(exec);
};

exports.updateExecution = (req, res) => {
  const idx = executions.findIndex(e => e.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  executions[idx] = { ...executions[idx], ...req.body };
  res.json(executions[idx]);
};

exports.deleteExecution = (req, res) => {
  executions = executions.filter(e => e.id != req.params.id);
  res.status(204).send();
};