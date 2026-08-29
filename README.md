# Task API

A small in-memory CRUD API for managing a to-do list. Built with Node.js + Express.

## What this is
Five CRUD endpoints over an in-memory task list, plus health check, stats, and
reset extras. No database — data resets when the server restarts.

## How to run it
```bash
npm install
npm start
```
Server runs at `http://localhost:3000`. Swagger UI at `http://localhost:3000/docs`.

## Endpoints

| Method | Path        | Meaning                          | Success | Errors        |
|--------|-------------|-----------------------------------|---------|---------------|
| GET    | /           | API info                          | 200     | —             |
| GET    | /health     | Health check                      | 200     | —             |
| GET    | /tasks      | List all tasks (filter: `?done=`, `?search=`) | 200 | — |
| GET    | /tasks/:id  | Get one task                      | 200     | 404           |
| POST   | /tasks      | Create a task                     | 201     | 400           |
| PUT    | /tasks/:id  | Update a task                     | 200     | 400, 404      |
| DELETE | /tasks/:id  | Delete a task                     | 204     | 404           |
| GET    | /stats      | Task counts (total/done/open)     | 200     | —             |
| POST   | /reset      | Restore the 3 seed tasks          | 200     | —             |

## Example curl output

```
$ curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Buy milk"}'

[paste your actual terminal output here]
```

## Swagger UI screenshot

[paste your screenshot here]

## The mortality experiment
[Restart the server after creating tasks, GET /tasks again, write two sentences
on what happened and why — this is the in-memory-vs-database lesson.]

## AI vs me (Stage 7, if attempted)
[Your own prompt, run independently in a fresh chat, the AI's code kept in
ai-version/, and your three-point comparison — what it did better, what it
got wrong, what your prompt forgot to specify.]
