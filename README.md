# Render SDK Examples

A comprehensive, full-stack example application demonstrating the Render Workflows SDK with real-world use cases.

## 🏗️ Architecture

This repository contains three services that work together:

1. **Workflow Worker** (`workflows/`) - Defines and executes workflow tasks
2. **Backend API** (`backend/`) - FastAPI service to trigger workflows
3. **Frontend** (`frontend/`) - React UI to interact with workflows

```
┌─────────────┐
│   Browser   │
│  (React UI) │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────┐
│   Backend   │
│  (FastAPI)  │
└──────┬──────┘
       │ SDK Client
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
│   Worker    │
│  (Tasks)    │
└─────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **uv** - Install via `pip install uv`
- **Render Account** - [Sign up](https://render.com/)

### Local Development

#### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd render-sdk-examples
cp .env.example .env
# Edit .env and add your API keys
```

#### 2. Run Workflows (Terminal 1)

```bash
cd workflows
uv pip install -r requirements.txt
python main.py
```

#### 3. Run Backend (Terminal 2)

```bash
cd backend
uv pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### 4. Run Frontend (Terminal 3)

```bash
cd frontend
npm install
npm run dev
```

#### 5. Open Browser

Navigate to `http://localhost:5173` to see the UI.

## 📚 Examples Overview

### Basic Tasks

Simple synchronous and asynchronous tasks:
- **Square** - Compute x²
- **Cube** - Compute x³ (async)
- **Greet** - Generate greeting message
- **Add Numbers** - Addition with retry config
- **Multiply** - Multiplication

### Subtasks

Tasks that call other tasks:
- **Add Squares** - Computes a² + b² by calling square twice
- **Calculate Area** - Uses multiply subtask for area calculation

### Parallel Execution

Concurrent task execution with `asyncio.gather()`:
- **Compute Multiple** - Calculate squares and cubes in parallel
- **Sum of Squares** - Parallel computation with aggregation

### OpenAI Integration

AI-powered workflows (requires `OPENAI_API_KEY`):
- **Sentiment Analysis** - Analyze text sentiment
- **Translation** - Translate to any language
- **Summarization** - Generate concise summaries

### Advanced Workflows

Complex multi-stage pipelines:
- **Document Pipeline** - Translation → Summarization → Sentiment Analysis
- **Parallel Sentiment** - Analyze multiple texts concurrently
- **Multi-Language Summary** - Generate summaries in multiple languages

## 🛠️ Technology Stack

### Workflows
- **Language**: Python 3.10+
- **SDK**: `render_sdk` (official Render Workflows SDK)
- **AI**: OpenAI GPT-4 (optional)

### Backend
- **Framework**: FastAPI
- **Server**: Uvicorn
- **Client**: Render SDK Client for triggering workflows

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

## 📦 Project Structure

```
render-sdk-examples/
├── workflows/              # Service 1: Workflow definitions
│   ├── main.py            # Entry point (calls start())
│   ├── basic_tasks.py     # Simple task examples
│   ├── subtasks.py        # Subtask execution examples
│   ├── parallel_tasks.py  # Parallel execution examples
│   ├── openai_tasks.py    # OpenAI integration
│   └── advanced_tasks.py  # Complex pipelines
│
├── backend/               # Service 2: REST API
│   ├── main.py           # FastAPI app
│   ├── models.py         # Pydantic schemas
│   └── routes/           # API endpoints
│       ├── basic.py      # /api/basic/*
│       ├── subtasks.py   # /api/subtasks/*
│       ├── parallel.py   # /api/parallel/*
│       ├── openai.py     # /api/openai/*
│       └── advanced.py   # /api/advanced/*
│
└── frontend/             # Service 3: React UI
    ├── src/
    │   ├── App.tsx          # Main app with tabs
    │   ├── components/      # React components
    │   ├── services/        # API client
    │   └── types/           # TypeScript types
    └── package.json
```

## 🌐 Deployment to Render

### Service 1: Workflow Worker (Background Worker)

- **Name**: `render-sdk-workflows`
- **Type**: Background Worker
- **Build Command**: `cd workflows && pip install -r requirements.txt`
- **Start Command**: `python -m workflows.main`
- **Environment Variables**:
  - `RENDER_API_KEY` (from Render dashboard)
  - `OPENAI_API_KEY` (optional)

### Service 2: Backend API (Web Service)

- **Name**: `render-sdk-backend`
- **Type**: Web Service
- **Build Command**: `cd backend && pip install -r requirements.txt`
- **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `RENDER_API_KEY`
  - `OPENAI_API_KEY` (optional)

### Service 3: Frontend (Static Site)

- **Name**: `render-sdk-frontend`
- **Type**: Static Site
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/dist`
- **Environment Variables**:
  - `VITE_API_URL` (URL of your backend service)

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:8000/health

# Test square task
curl -X POST http://localhost:8000/api/basic/square \
  -H "Content-Type: application/json" \
  -d '{"a": 5}'

# Test greet task
curl -X POST http://localhost:8000/api/basic/greet \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice"}'
```

### Test Frontend

1. Open `http://localhost:5173`
2. Navigate through tabs (Basic, Subtasks, Parallel, OpenAI, Advanced)
3. Fill in form inputs and click "Run Task"
4. View results in the result panel

## 📖 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🔑 Environment Variables

### Required

- `RENDER_API_KEY` - Your Render API key (get from Render dashboard)

### Optional

- `OPENAI_API_KEY` - OpenAI API key (required for AI examples)
- `VITE_API_URL` - Backend URL for frontend (default: `http://localhost:8000`)

## 🎯 Use Cases

### Simple Tasks
Perfect for learning the basics of Render Workflows:
- Function decoration with `@task`
- Sync vs async tasks
- Retry configuration

### Subtask Composition
Build complex workflows by composing simple tasks:
- Use `await` to call other tasks
- Pass data between tasks
- Create reusable task libraries

### Parallel Execution
Improve performance with concurrent execution:
- Use `asyncio.gather()` for parallel subtasks
- Process multiple items simultaneously
- Aggregate results from parallel operations

### AI Integration
Leverage LLMs in your workflows:
- Sentiment analysis
- Translation services
- Text summarization
- Custom AI-powered pipelines

## 🤝 Contributing

Contributions are welcome! To add new examples:

1. Add task to appropriate file in `workflows/`
2. Add API endpoint in `backend/routes/`
3. Add UI component in `frontend/src/components/`
4. Update this README with the new example

## 📝 License

MIT License - See LICENSE file for details

## 🔗 Resources

- [Render Workflows Documentation](https://docs.render.com/workflows)
- [Render SDK on PyPI](https://pypi.org/project/render_sdk/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## 💡 Tips

- **Local Development**: Use the workflow worker only when testing the full flow. For API development, you can mock responses.
- **OpenAI Costs**: Be mindful of OpenAI API costs when running AI examples frequently.
- **Debugging**: Check backend logs for workflow execution details and errors.
- **Performance**: Parallel tasks significantly speed up workflows with multiple independent operations.

## 🐛 Troubleshooting

### "RENDER_API_KEY not configured"
Set the environment variable in your `.env` file or Render dashboard.

### OpenAI tasks failing
Ensure `OPENAI_API_KEY` is set and your account has available credits.

### CORS errors in frontend
Check that `VITE_API_URL` points to the correct backend URL and CORS is enabled.

### Frontend can't connect to backend
Verify backend is running and accessible at the URL specified in `VITE_API_URL`.

---

**Built with ❤️ using Render Workflows**
