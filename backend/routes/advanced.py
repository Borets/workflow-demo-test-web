"""
Endpoints for advanced workflow examples.
"""

from typing import Any
from fastapi import APIRouter
from render_sdk import RenderAsync
import os

from ..models import TaskResponse
from .utils import run_task_and_respond, run_trigger_task_and_respond

router = APIRouter()

def get_client() -> RenderAsync:
    """Get Render async API client."""
    return RenderAsync()

def get_task_name(task: str) -> str:
    """Get full task name with service slug if configured."""
    service_slug = os.getenv("WORKFLOW_SERVICE_SLUG", "workflow-demo-test-web")
    return f"{service_slug}/{task}"

@router.post("/process_document", response_model=TaskResponse)
async def process_document(data: dict[str, Any], engine: str = "render"):
    """
    Execute the process_document_pipeline task (multi-level subtasks).

    Input: {
        "document": "Long text here...",
        "translate_to": "Spanish"  # Optional
    }
    """
    if engine == "trigger":
        payload: dict[str, Any] = {"document": data["document"]}
        if data.get("translate_to"):
            payload["translateTo"] = data["translate_to"]
        return await run_trigger_task_and_respond(
            "process_document_pipeline", payload,
            message="Document pipeline completed",
        )
    return await run_task_and_respond(
        get_client(), get_task_name("process_document_pipeline"),
        [data["document"], data.get("translate_to")],
        message="Document pipeline completed",
    )

@router.post("/parallel_sentiment", response_model=TaskResponse)
async def parallel_sentiment(data: dict[str, Any], engine: str = "render"):
    """
    Execute the parallel_sentiment_analysis task.

    Input: {
        "texts": ["Great product!", "Terrible service.", "It's okay."]
    }
    """
    if engine == "trigger":
        return await run_trigger_task_and_respond(
            "parallel_sentiment_analysis", {"texts": data["texts"]},
            message="Parallel sentiment analysis completed",
        )
    return await run_task_and_respond(
        get_client(), get_task_name("parallel_sentiment_analysis"), [data["texts"]],
        message="Parallel sentiment analysis completed",
    )

@router.post("/multi_language_summary", response_model=TaskResponse)
async def multi_language_summary(data: dict[str, Any], engine: str = "render"):
    """
    Execute the multi_language_summary task.

    Input: {
        "text": "Long text to summarize...",
        "languages": ["Spanish", "French", "German"]
    }
    """
    if engine == "trigger":
        return await run_trigger_task_and_respond(
            "multi_language_summary", {"text": data["text"], "languages": data["languages"]},
            message="Multi-language summary completed",
        )
    return await run_task_and_respond(
        get_client(), get_task_name("multi_language_summary"),
        [data["text"], data["languages"]],
        message="Multi-language summary completed",
    )
