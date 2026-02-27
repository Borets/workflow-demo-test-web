"""
Endpoints for OpenAI integration examples.
"""

from typing import Any
from fastapi import APIRouter, HTTPException
from render_sdk import RenderAsync
import os

from ..models import TaskResponse
from .utils import handle_sdk_error, get_workflow_id

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
    client = get_client()
    try:
        result = await client.workflows.run_task(get_task_name("analyze_text_sentiment"), [data["text"]])
        wf_id = await get_workflow_id(client)

        return TaskResponse(
            task_run_id=result.id,
            workflow_id=wf_id,
            status=result.status,
            message=f"Sentiment analysis completed",
            result=result.results
        )
    except Exception as e:
        raise handle_sdk_error(e)

@router.post("/translate", response_model=TaskResponse)
async def translate(data: dict[str, Any]):
    """
    Execute the translate_text task.

    Input: {"text": "Hello world", "target_language": "Spanish"}
    Output: "Hola mundo"
    """
    client = get_client()
    try:
        result = await client.workflows.run_task(get_task_name("translate_text"), [data["text"], data["target_language"]])
        wf_id = await get_workflow_id(client)

        return TaskResponse(
            task_run_id=result.id,
            workflow_id=wf_id,
            status=result.status,
            message=f"Translation completed",
            result=result.results
        )
    except Exception as e:
        raise handle_sdk_error(e)

@router.post("/summarize", response_model=TaskResponse)
async def summarize(data: dict[str, Any]):
    """
    Execute the summarize_text task.

    Input: {"text": "Long text here...", "max_sentences": 2}
    Output: "Summary in 2 sentences."
    """
    client = get_client()
    try:
        result = await client.workflows.run_task(get_task_name("summarize_text"), [data["text"], data.get("max_sentences", 3)])
        wf_id = await get_workflow_id(client)

        return TaskResponse(
            task_run_id=result.id,
            workflow_id=wf_id,
            status=result.status,
            message=f"Summarization completed",
            result=result.results
        )
    except Exception as e:
        raise handle_sdk_error(e)
