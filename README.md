# Render Workflows Demo

A full-stack example application demonstrating the Render Workflows SDK (`render-sdk` v0.5.0) with real-world use cases including parallel fan-out/fan-in trees, OpenAI integration, and multi-level subtask composition.

## Architecture

```
┌─────────────┐
│   Browser   │
│  (React UI) │  Static Site on Render
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────┐
│   Backend   │
│  (FastAPI)  │  Web Service on Render
└──────┬──────┘
       │ RenderAsync SDK client
       ▼
┌─────────────┐
│   Render    │
│ Workflows   │
│     API     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Workflow   │
│   Worker    │  Workflow Service on Render
│  (Tasks)    │
└─────────────┘
```

Three services from a single repo, each with its own **root directory**:

| Service | Type | Root Directory | Start Command |
|---------|------|----------------|---------------|
| Workflow Worker | **Workflow** | `workflows` | `render-workflows main:app` |
| Backend API | **Web Service** | *(repo root)* | `uvicorn backend.main:app --host 0.0.0.0 --port $PORT` |
| Frontend | **Static Site** | *(repo root)* | *(n/a — publish path `frontend/dist`)* |

## Deploying to Render

### Service 1: Workflow Worker

This is a **Workflow** service type (not a Background Worker).

| Setting | Value |
|---------|-------|
| **Type** | Workflow |
| **Root Directory** | `workflows` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `render-workflows main:app` |
| **Plan** | Standard (or higher) |

**Root directory is critical.** The start command `render-workflows main:app` imports `main` as a Python module. If the root directory is not set to `workflows`, the runner will fail with:

```
Error: Could not import module 'main': No module named 'main'
```

**Environment variables:**
- `RENDER_API_KEY` — your Render API key (from Account Settings)
- `OPENAI_API_KEY` — (optional) required for AI-powered tasks

### Service 2: Backend API

| Setting | Value |
|---------|-------|
| **Type** | Web Service |
| **Runtime** | Python |
| **Build Command** | `cd backend && pip install -r requirements.txt` |
| **Start Command** | `uvicorn backend.main:app --host 0.0.0.0 --port $PORT` |

**Environment variables:**
- `RENDER_API_KEY` — same key as above
- `WORKFLOW_SERVICE_SLUG` — the slug of your workflow service (visible in the dashboard URL, e.g. `workflow-demo-test-web`). This tells the API which workflow service to route tasks to.
- `OPENAI_API_KEY` — (optional)
- `CORS_ORIGINS` — (optional) comma-separated list of additional allowed origins

### Service 3: Frontend

| Setting | Value |
|---------|-------|
| **Type** | Static Site |
| **Build Command** | `cd frontend && npm install && npm run build` |
| **Publish Directory** | `frontend/dist` |

**Environment variables:**
- `VITE_API_URL` — URL of your backend service (e.g. `https://workflow-demo-test-web-api.onrender.com`)

## SDK v0.5.0 Migration Notes

This project uses `render-sdk>=0.5.0`. Key changes from earlier versions:

### Python SDK (v0.3.x/v0.4.x to v0.5.0)

1. **`Render()` is now sync.** Use `RenderAsync()` in async code (e.g. FastAPI handlers). Using `await` with the sync client raises `TypeError`.

2. **Double-await is gone.** `run_task()` returns `TaskRunDetails` directly:
   ```python
   # Old (v0.4.x)
   task_run = await client.workflows.run_task(...)
   result = await task_run

   # New (v0.5.0)
   result = await client.workflows.run_task(...)
   ```
   Use `start_task()` if you need fire-and-forget.

3. **`default_timeout` renamed to `default_timeout_seconds`** in `Workflows()` config.

4. **`RenderSync` removed.** Just use `Render` for sync or `RenderAsync` for async.

5. **SSE streaming changed.** `render.workflows.task_run_events()` uses a plain `for` loop on the sync client (not `async for`).

### TypeScript SDK (v0.1.0 to v0.4.1)

1. Package renamed from `@render/sdk` to `@renderinc/sdk`.
2. `startTaskServer()` removed — tasks register on definition.
3. `wait_duration` renamed to `wait_duration_ms` in retry config.
4. `BlobClient` renamed to `ObjectClient` (`experimental.storage.objects`).
5. `runTask()` no longer opens SSE immediately.
6. `taskRunEvents()` and `startTask()` require v0.4.0+.

## Local Development

### Prerequisites

- Python 3.10+
- Node.js 18+
- A Render API key

### 1. Setup

```bash
git clone https://github.com/Borets/workflow-demo-test-web.git
cd workflow-demo-test-web
cp .env.example .env
# Edit .env: set RENDER_API_KEY (and optionally OPENAI_API_KEY)
```

### 2. Run Workflow Worker (Terminal 1)

```bash
cd workflows
pip install -r requirements.txt
render ea tasks dev -- render-workflows main:app
```

### 3. Run Backend (Terminal 2)

```bash
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

### 4. Run Frontend (Terminal 3)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Examples

### Basic Tasks
- **Square** — compute x^2
- **Cube** — compute x^3 (async)
- **Greet** — generate greeting message
- **Add Numbers** — addition with retry config
- **Multiply** — multiplication

### Subtasks
- **Add Squares** — computes a^2 + b^2 by calling `square` twice
- **Calculate Area** — uses `multiply` subtask for area calculation

### Parallel Execution
- **Compute Multiple** — squares and cubes in parallel
- **Sum of Squares** — parallel computation with aggregation
- **Deep Parallel Tree** — 10+ levels deep, 100+ subtasks across scatter/gather, cross-reduce, and recursive fan-in phases (see below)

### OpenAI Integration (requires `OPENAI_API_KEY`)
- **Sentiment Analysis** — analyze text sentiment via GPT-4
- **Translation** — translate to any language
- **Summarization** — generate concise summaries

### Advanced Workflows
- **Document Pipeline** — translation -> summarization -> sentiment analysis
- **Parallel Sentiment** — analyze multiple texts concurrently
- **Multi-Language Summary** — summaries in multiple languages in parallel

### Deep Parallel Tree

The `deep_parallel_tree` task demonstrates a complex fan-out/fan-in pattern:

```
L0  deep_parallel_tree        (root orchestrator)
L1  tree_scatter              (split into N chunks)
L2  tree_chunk_process ×N     (per-chunk processing)
L3  tree_square ×N*M          (leaf: square each number)
L4  tree_cube ×N*M            (leaf: cube each number)
L5  tree_combine ×N*M         (combine square + cube)
L6  tree_cross_reduce         (pair values across chunks)
L7  tree_pair_add ×pairs      (add each pair)
L8  tree_pair_multiply ×pairs (multiply each pair)
L9  tree_layered_sum          (start recursive fan-in)
L10 tree_partial_sum          (halve-and-add recursively)
L11 tree_partial_sum          (continued recursion)
L12 tree_finalize             (assemble final result)
```

With 12 numbers and `chunk_size=4`, this spawns ~120 subtasks across 12+ levels.

**API call:**
```bash
curl -X POST https://your-backend.onrender.com/api/parallel/deep_parallel_tree \
  -H "Content-Type: application/json" \
  -d '{"numbers": [1,2,3,4,5,6,7,8,9,10,11,12], "chunk_size": 4}'
```

## Project Structure

```
workflow-demo-test-web/
├── workflows/                 # Workflow service (root dir on Render)
│   ├── app.py                # Workflows instance (shared across modules)
│   ├── main.py               # Entry point — imports all task modules
│   ├── basic_tasks.py        # Simple sync/async tasks
│   ├── subtasks.py           # Tasks calling other tasks
│   ├── parallel_tasks.py     # Parallel execution + deep tree
│   ├── openai_tasks.py       # OpenAI/GPT integration
│   ├── advanced_tasks.py     # Complex multi-stage pipelines
│   ├── requirements.txt
│   └── pyproject.toml
│
├── backend/                   # FastAPI API service
│   ├── main.py               # FastAPI app, CORS, routers
│   ├── models.py             # Pydantic response schemas
│   ├── routes/
│   │   ├── utils.py          # Shared error handling
│   │   ├── basic.py          # /api/basic/*
│   │   ├── subtasks.py       # /api/subtasks/*
│   │   ├── parallel.py       # /api/parallel/*
│   │   ├── openai.py         # /api/openai/*
│   │   └── advanced.py       # /api/advanced/*
│   ├── requirements.txt
│   └── pyproject.toml
│
└── frontend/                  # React static site
    ├── src/
    │   ├── App.tsx
    │   ├── components/        # Tab components per category
    │   ├── hooks/             # useTaskRunner hook
    │   ├── services/api.ts    # Axios API client
    │   └── types/
    └── package.json
```

## Environment Variables

| Variable | Required | Used By | Description |
|----------|----------|---------|-------------|
| `RENDER_API_KEY` | Yes | Backend, Workflows | Render API key from Account Settings |
| `WORKFLOW_SERVICE_SLUG` | Yes | Backend | Slug of your workflow service (e.g. `workflow-demo-test-web`) |
| `OPENAI_API_KEY` | No | Workflows | Required only for OpenAI/AI tasks |
| `VITE_API_URL` | Yes | Frontend | Backend service URL |
| `CORS_ORIGINS` | No | Backend | Additional allowed CORS origins (comma-separated) |

## Testing

```bash
# Health check
curl http://localhost:8000/health

# Basic task
curl -X POST http://localhost:8000/api/basic/square \
  -H "Content-Type: application/json" \
  -d '{"a": 5}'

# Deep parallel tree
curl -X POST http://localhost:8000/api/parallel/deep_parallel_tree \
  -H "Content-Type: application/json" \
  -d '{"numbers": [1,2,3,4,5,6,7,8,9,10,11,12]}'
```

API docs available at `/docs` (Swagger) and `/redoc` when backend is running.

## Troubleshooting

### "No module named 'main'" on workflow service
The **Root Directory** on Render must be set to `workflows`. Without this, `render-workflows main:app` can't find `main.py`.

### "TypeError: object TaskRunDetails can't be used in 'await' expression"
You're using the sync `Render()` client with `await`. Switch to `RenderAsync()` for async code (SDK v0.5.0 change).

### "RENDER_API_KEY not configured"
Set the environment variable in your `.env` file or in the Render dashboard under Environment.

### OpenAI tasks failing
Ensure `OPENAI_API_KEY` is set and your account has available credits.

### CORS errors in frontend
Check that `VITE_API_URL` points to the correct backend URL. You can also add origins via the `CORS_ORIGINS` env var.

### Tasks not registering / empty task list
Verify the workflow service root directory is `workflows` and the start command is `render-workflows main:app`. Check deploy logs for import errors.

### Workflow service slug mismatch
The `WORKFLOW_SERVICE_SLUG` env var on the backend must match the slug shown in your workflow service's Render dashboard URL. If not set, it defaults to `workflow-demo-test-web`.

## Resources

- [Render Workflows Documentation](https://docs.render.com/workflows)
- [Render SDK on PyPI](https://pypi.org/project/render_sdk/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
