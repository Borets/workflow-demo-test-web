"""
FastAPI backend for triggering Render workflows.

This API provides endpoints to execute workflow tasks and retrieve results.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from backend.routes import basic, subtasks, parallel, openai, advanced

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Render SDK Examples API",
    description="API for triggering Render workflow tasks",
    version="0.1.0"
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
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
