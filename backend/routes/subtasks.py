"""
Endpoints for subtask examples.
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

@router.post("/add_squares", response_model=TaskResponse)
async def add_squares(data: dict[str, Any]):
    """
    Execute the add_squares task (calls square task twice).

    Input: {"a": 3, "b": 4}
    Output: 25 (9 + 16)
    """
    client = get_client()
    try:
        task_run = await client.workflows.run_task(get_task_name("add_squares"), [data["a"], data["b"]])
        result = await task_run

        return TaskResponse(
            task_run_id=result.id,
            status=result.status,
            message=f"Task completed successfully",
            result=result.results
        )
    except RenderError as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/calculate_area", response_model=TaskResponse)
async def calculate_area(data: dict[str, Any]):
    """
    Execute the calculate_area task (uses multiply subtask).

    Input: {"length": 5, "width": 3}
    Output: {"area": 15, "perimeter": 16, "dimensions": {"length": 5, "width": 3}}
    """
    client = get_client()
    try:
        task_run = await client.workflows.run_task(get_task_name("calculate_area"), [data["length"], data["width"]])
        result = await task_run

        return TaskResponse(
            task_run_id=result.id,
            status=result.status,
            message=f"Task completed successfully",
            result=result.results
        )
    except RenderError as e:
        raise HTTPException(status_code=500, detail=str(e))
