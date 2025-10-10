"""
Endpoints for advanced workflow examples.
"""

from typing import Any
from fastapi import APIRouter, HTTPException
from render_sdk.client import Client
from render_sdk.client.errors import RenderError
import os

from ..models import TaskResponse

router = APIRouter()

def get_client() -> Client:
    """Get Render API client."""
    api_key = os.getenv("RENDER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="RENDER_API_KEY not configured")
    return Client(api_key)

def get_task_name(task: str) -> str:
    """Get full task name with service slug if configured."""
    service_slug = os.getenv("WORKFLOW_SERVICE_SLUG", "slav-workflow-demo-test-workflow-service")
    return f"{service_slug}/{task}"

@router.post("/process_document", response_model=TaskResponse)
async def process_document(data: dict[str, Any]):
    """
    Execute the process_document_pipeline task (multi-level subtasks).

    Input: {
        "document": "Long text here...",
        "translate_to": "Spanish"  # Optional
    }
    Output: {
        "original_document": "...",
        "translated_text": "...",  # If translate_to specified
        "summary": "...",
        "sentiment_analysis": {...}
    }
    """
    client = get_client()
    try:
        task_run = await client.workflows.run_task(get_task_name("process_document_pipeline"), [data["document"], data.get("translate_to")])
        result = await task_run

        return TaskResponse(
            task_run_id=result.id,
            status=result.status,
            message=f"Document pipeline completed",
            result=result.results
        )
    except RenderError as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/parallel_sentiment", response_model=TaskResponse)
async def parallel_sentiment(data: dict[str, Any]):
    """
    Execute the parallel_sentiment_analysis task.

    Input: {
        "texts": ["Great product!", "Terrible service.", "It's okay."]
    }
    Output: {
        "results": [...],
        "summary": {"positive": 1, "negative": 1, "neutral": 1},
        "total": 3
    }
    """
    client = get_client()
    try:
        task_run = await client.workflows.run_task(get_task_name("parallel_sentiment_analysis"), [data["texts"]])
        result = await task_run

        return TaskResponse(
            task_run_id=result.id,
            status=result.status,
            message=f"Parallel sentiment analysis completed",
            result=result.results
        )
    except RenderError as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/multi_language_summary", response_model=TaskResponse)
async def multi_language_summary(data: dict[str, Any]):
    """
    Execute the multi_language_summary task.

    Input: {
        "text": "Long text to summarize...",
        "languages": ["Spanish", "French", "German"]
    }
    Output: {
        "original_summary": "...",
        "translations": {
            "Spanish": "...",
            "French": "...",
            "German": "..."
        }
    }
    """
    client = get_client()
    try:
        task_run = await client.workflows.run_task(get_task_name("multi_language_summary"), [data["text"], data["languages"]])
        result = await task_run

        return TaskResponse(
            task_run_id=result.id,
            status=result.status,
            message=f"Multi-language summary completed",
            result=result.results
        )
    except RenderError as e:
        raise HTTPException(status_code=500, detail=str(e))
