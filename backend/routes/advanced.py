"""
Endpoints for advanced workflow examples.
"""

from typing import Any
from fastapi import APIRouter

from ..models import TaskResponse
from .utils import get_client, get_task_name, run_task_and_respond

router = APIRouter()

@router.post("/process_document", response_model=TaskResponse)
async def process_document(data: dict[str, Any]):
    """
    Execute the process_document_pipeline task (multi-level subtasks).

    Input: {
        "document": "Long text here...",
        "translate_to": "Spanish"  # Optional
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
    """
    return await run_task_and_respond(
        get_client(), get_task_name("multi_language_summary"),
        [data["text"], data["languages"]],
        message="Multi-language summary completed",
    )
