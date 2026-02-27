"""
FastAPI backend for triggering Render workflows.

This API provides endpoints to execute workflow tasks and retrieve results.
"""

import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from dotenv import load_dotenv

from .models import TaskResponse
from .routes import basic, subtasks, parallel, openai, advanced
from .routes.utils import get_task_status

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Render SDK Examples API",
    description="API for triggering Render workflow tasks",
    version="0.1.0"
)

# Define allowed origins - include both staging and production URLs
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://slav-workflow-demo-test-web.onrender-staging.com",
    "https://slav-workflow-demo-web.onrender.com",
    "https://workflow-demo-test-web.onrender.com",
]

# Add any origins from environment variable
extra_origins = os.getenv("CORS_ORIGINS", "")
if extra_origins:
    ALLOWED_ORIGINS.extend([o.strip() for o in extra_origins.split(",") if o.strip()])


def get_cors_headers(request: Request) -> dict:
    """Get CORS headers based on request origin."""
    origin = request.headers.get("origin", "")
    if origin in ALLOWED_ORIGINS:
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        }
    return {}


# Exception handler to ensure CORS headers on error responses
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions with CORS headers."""
    headers = get_cors_headers(request)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=headers
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions with CORS headers."""
    headers = get_cors_headers(request)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers=headers
    )


# Configure CORS middleware with explicit origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(basic.router, prefix="/api/basic", tags=["Basic Tasks"])
app.include_router(subtasks.router, prefix="/api/subtasks", tags=["Subtasks"])
app.include_router(parallel.router, prefix="/api/parallel", tags=["Parallel"])
app.include_router(openai.router, prefix="/api/openai", tags=["OpenAI"])
app.include_router(advanced.router, prefix="/api/advanced", tags=["Advanced"])

@app.get("/api/task/{task_run_id}", response_model=TaskResponse)
async def poll_task(task_run_id: str):
    """Poll a task run's current status and result."""
    return await get_task_status(task_run_id)

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Render SDK Examples API",
        "version": "0.1.0"
    }

@app.get("/health")
async def health():
    """Detailed health check."""
    api_key = os.getenv("RENDER_API_KEY")
    return {
        "status": "healthy",
        "render_api_key_configured": bool(api_key),
        "openai_configured": bool(os.getenv("OPENAI_API_KEY"))
    }
