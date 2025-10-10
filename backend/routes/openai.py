"""
Endpoints for OpenAI integration examples.
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

@router.post("/analyze_sentiment", response_model=TaskResponse)
async def analyze_sentiment(data: dict[str, Any]):
    """
    Execute the analyze_text_sentiment task.

    Input: {"text": "I love this product!"}
    Output: {"sentiment": "positive", "explanation": "..."}
    """
    client = get_client()
    try:
        task_run = await client.workflows.run_task(get_task_name("analyze_text_sentiment"), [data["text"]])
        result = await task_run

        return TaskResponse(
            task_run_id=result.id,
            status=result.status,
            message=f"Sentiment analysis completed",
            result=result.results
        )
    except RenderError as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/translate", response_model=TaskResponse)
async def translate(data: dict[str, Any]):
    """
    Execute the translate_text task.

    Input: {"text": "Hello world", "target_language": "Spanish"}
    Output: "Hola mundo"
    """
    client = get_client()
    try:
        task_run = await client.workflows.run_task(get_task_name("translate_text"), [data["text"], data["target_language"]])
        result = await task_run

        return TaskResponse(
            task_run_id=result.id,
            status=result.status,
            message=f"Translation completed",
            result=result.results
        )
    except RenderError as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize", response_model=TaskResponse)
async def summarize(data: dict[str, Any]):
    """
    Execute the summarize_text task.

    Input: {"text": "Long text here...", "max_sentences": 2}
    Output: "Summary in 2 sentences."
    """
    client = get_client()
    try:
        task_run = await client.workflows.run_task(get_task_name("summarize_text"), [data["text"], data.get("max_sentences", 3)])
        result = await task_run

        return TaskResponse(
            task_run_id=result.id,
            status=result.status,
            message=f"Summarization completed",
            result=result.results
        )
    except RenderError as e:
        raise HTTPException(status_code=500, detail=str(e))
