"""
Endpoints for subtask examples.
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

@router.post("/add_squares", response_model=TaskResponse)
async def add_squares(data: dict[str, Any], engine: str = "render"):
    """
    Execute the add_squares task (calls square task twice).

    Input: {"a": 3, "b": 4}
    Output: 25 (9 + 16)
    """
    if engine == "trigger":
        return await run_trigger_task_and_respond("add_squares", {"a": data["a"], "b": data["b"]})
    return await run_task_and_respond(get_client(), get_task_name("add_squares"), [data["a"], data["b"]])

@router.post("/calculate_area", response_model=TaskResponse)
async def calculate_area(data: dict[str, Any], engine: str = "render"):
    """
    Execute the calculate_area task (uses multiply subtask).

    Input: {"length": 5, "width": 3}
    Output: {"area": 15, "perimeter": 16, "dimensions": {"length": 5, "width": 3}}
    """
    if engine == "trigger":
        return await run_trigger_task_and_respond("calculate_area", {"length": data["length"], "width": data["width"]})
    return await run_task_and_respond(get_client(), get_task_name("calculate_area"), [data["length"], data["width"]])
