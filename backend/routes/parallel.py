"""
Endpoints for parallel execution examples.
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
    return await run_task_and_respond(get_client(), get_task_name("compute_multiple"), [data["numbers"]])

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
    return await run_task_and_respond(get_client(), get_task_name("sum_of_squares"), [data["numbers"]])

@router.post("/deep_parallel_tree", response_model=TaskResponse)
async def deep_parallel_tree(data: dict[str, Any]):
    """
    Execute the deep_parallel_tree task – a 10+ level deep, 100+ subtask
    parallel tree that fans out and reduces across multiple phases.

    Input: {"numbers": [1,2,3,4,5,6,7,8,9,10,11,12], "chunk_size": 4}
    (chunk_size is optional, defaults to 4)
    """
    args = [data["numbers"]]
    if "chunk_size" in data:
        args.append(data["chunk_size"])
    return await run_task_and_respond(get_client(), get_task_name("deep_parallel_tree"), args)
