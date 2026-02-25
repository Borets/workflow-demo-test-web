"""
Endpoints for subtask examples.
"""

from typing import Any
from fastapi import APIRouter, HTTPException
from render_sdk import RenderAsync
import os

from ..models import TaskResponse
from .utils import handle_sdk_error

router = APIRouter()

def get_client() -> RenderAsync:
    """Get Render async API client."""
    return RenderAsync()

def get_task_name(task: str) -> str:
    """Get full task name with service slug if configured."""
    service_slug = os.getenv("WORKFLOW_SERVICE_SLUG", "workflow-demo-test-web")
    return f"{service_slug}/{task}"

@router.post("/add_squares", response_model=TaskResponse)
async def add_squares(data: dict[str, Any]):
    """
    Execute the add_squares task (calls square task twice).

    Input: {"a": 3, "b": 4}
    Output: 25 (9 + 16)
    """
    client = get_client()
    try:
        result = await client.workflows.run_task(get_task_name("add_squares"), [data["a"], data["b"]])

        return TaskResponse(
            task_run_id=result.id,
            status=result.status,
            message=f"Task completed successfully",
            result=result.results
        )
    except Exception as e:
        raise handle_sdk_error(e)

@router.post("/calculate_area", response_model=TaskResponse)
async def calculate_area(data: dict[str, Any]):
    """
    Execute the calculate_area task (uses multiply subtask).

    Input: {"length": 5, "width": 3}
    Output: {"area": 15, "perimeter": 16, "dimensions": {"length": 5, "width": 3}}
    """
    client = get_client()
    try:
        result = await client.workflows.run_task(get_task_name("calculate_area"), [data["length"], data["width"]])

        return TaskResponse(
            task_run_id=result.id,
            status=result.status,
            message=f"Task completed successfully",
            result=result.results
        )
    except Exception as e:
        raise handle_sdk_error(e)
