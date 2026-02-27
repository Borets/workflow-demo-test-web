"""
Endpoints for OpenAI integration examples.
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

@router.post("/analyze_sentiment", response_model=TaskResponse)
async def analyze_sentiment(data: dict[str, Any]):
    """
    Execute the analyze_text_sentiment task.

    Input: {"text": "I love this product!"}
    Output: {"sentiment": "positive", "explanation": "..."}
    """
    return await run_task_and_respond(
        get_client(), get_task_name("analyze_text_sentiment"), [data["text"]],
        message="Sentiment analysis completed",
    )

@router.post("/translate", response_model=TaskResponse)
async def translate(data: dict[str, Any]):
    """
    Execute the translate_text task.

    Input: {"text": "Hello world", "target_language": "Spanish"}
    Output: "Hola mundo"
    """
    return await run_task_and_respond(
        get_client(), get_task_name("translate_text"), [data["text"], data["target_language"]],
        message="Translation completed",
    )

@router.post("/summarize", response_model=TaskResponse)
async def summarize(data: dict[str, Any]):
    """
    Execute the summarize_text task.

    Input: {"text": "Long text here...", "max_sentences": 2}
    Output: "Summary in 2 sentences."
    """
    return await run_task_and_respond(
        get_client(), get_task_name("summarize_text"), [data["text"], data.get("max_sentences", 3)],
        message="Summarization completed",
    )
