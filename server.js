const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());

// SQLite stores booleans as 0/1 — convert to true/false for JSON responses
function toJson(row) {
  return { id: row.id, title: row.title, done: !!row.done };
}

// ---- Stage 1: root + health ----
app.get('/', (req, res) => {
  res.json({
    name: 'Task API',
    version: '1.0',
    endpoints: ['/tasks'],
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ---- Stage 1 (W3): Read ----
app.get('/tasks', (req, res) => {
  let sql = 'SELECT * FROM tasks WHERE 1=1';
  const params = [];

  if (req.query.done !== undefined) {
    sql += ' AND done = ?';
    params.push(req.query.done === 'true' ? 1 : 0);
  }
  if (req.query.search) {
    sql += ' AND title LIKE ?';
    params.push(`%${req.query.search}%`);
  }
  sql += ' ORDER BY id';

  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(toJson));
});

app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!row) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }
  res.json(toJson(row));
});

// ---- Stage 2 (W3): Create ----
app.post('/tasks', (req, res) => {
  const { title } = req.body || {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required and must be a non-empty string' });
  }

  const info = db.prepare('INSERT INTO tasks (title, done) VALUES (?, 0)').run(title.trim());
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(toJson(row));
});

// ---- Stage 3 (W3): Update & Delete ----
app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  const { title, done } = req.body || {};

  if (title === undefined && done === undefined) {
    return res.status(400).json({ error: 'provide at least one of: title, done' });
  }
  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({ error: 'title must be a non-empty string' });
  }
  if (done !== undefined && typeof done !== 'boolean') {
    return res.status(400).json({ error: 'done must be a boolean' });
  }

  const newTitle = title !== undefined ? title.trim() : existing.title;
  const newDone = done !== undefined ? (done ? 1 : 0) : existing.done;

  db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(newTitle, newDone, id);
  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json(toJson(updated));
});

app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  res.status(204).send();
});

// ---- Extras ----
app.get('/stats', (req, res) => {
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM tasks').get();
  const { done } = db.prepare('SELECT COUNT(*) AS done FROM tasks WHERE done = 1').get();
  res.json({ total, done, open: total - done });
});

app.post('/reset', (req, res) => {
  db.prepare('DELETE FROM tasks').run();
  const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  insert.run('Buy milk', 0);
  insert.run('Walk the dog', 0);
  insert.run('Write README', 1);
  const rows = db.prepare('SELECT * FROM tasks ORDER BY id').all();
  res.json({ status: 'reset', tasks: rows.map(toJson) });
});

// ---- Stage 5 (W2): Swagger UI ----
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.listen(PORT, () => {
  console.log(`Task API running at http://localhost:${PORT}`);
  console.log(`Swagger UI at http://localhost:${PORT}/docs`);
  console.log(`Database file: tasks.db`);
});