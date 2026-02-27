"""
Endpoints for advanced workflow examples.
"""

from typing import Any
from fastapi import APIRouter
from render_sdk import RenderAsync
import os

from ..models import TaskResponse
from .utils import run_task_and_respond

router = APIRouter()

def get_client() -> RenderAsync:
    """Get Render async API client."""
    return RenderAsync()

def get_task_name(task: str) -> str:
    """Get full task name with service slug if configured."""
    service_slug = os.getenv("WORKFLOW_SERVICE_SLUG", "workflow-demo-test-web")
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
    return await run_task_and_respond(
        get_client(), get_task_name("process_document_pipeline"),
        [data["document"], data.get("translate_to")],
        message="Document pipeline completed",
    )

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
    return await run_task_and_respond(
        get_client(), get_task_name("parallel_sentiment_analysis"), [data["texts"]],
        message="Parallel sentiment analysis completed",
    )

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
    return await run_task_and_respond(
        get_client(), get_task_name("multi_language_summary"),
        [data["text"], data["languages"]],
        message="Multi-language summary completed",
    )
