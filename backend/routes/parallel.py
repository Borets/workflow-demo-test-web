"""
Endpoints for parallel execution examples.
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

@router.post("/compute_multiple", response_model=TaskResponse)
async def compute_multiple(data: dict[str, Any]):
    """
    Execute the compute_multiple task (parallel squares and cubes).

    Input: {"numbers": [2, 3, 4]}
    Output: {
        "input": [2, 3, 4],
        "squares": [4, 9, 16],
        "cubes": [8, 27, 64],
        "count": 3
    }
    """
    client = get_client()
    try:
        task_run = await client.workflows.run_task(get_task_name("compute_multiple"), [data["numbers"]])
        result = await task_run

        return TaskResponse(
            task_run_id=result.id,
            status=result.status,
            message=f"Task completed successfully",
            result=result.results
        )
    except RenderError as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sum_of_squares", response_model=TaskResponse)
async def sum_of_squares(data: dict[str, Any]):
    """
    Execute the sum_of_squares task (parallel computation + aggregation).

    Input: {"numbers": [1, 2, 3, 4]}
    Output: {
        "numbers": [1, 2, 3, 4],
        "squares": [1, 4, 9, 16],
        "sum": 30
    }
    """
    client = get_client()
    try:
        task_run = await client.workflows.run_task(get_task_name("sum_of_squares"), [data["numbers"]])
        result = await task_run

        return TaskResponse(
            task_run_id=result.id,
            status=result.status,
            message=f"Task completed successfully",
            result=result.results
        )
    except RenderError as e:
        raise HTTPException(status_code=500, detail=str(e))
