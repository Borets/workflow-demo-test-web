"""
Endpoints for basic task examples.
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


@router.post("/square", response_model=TaskResponse)
async def square(data: dict[str, Any]):
    """
    Execute the square task.

    Input: {"a": 5}
    Output: 25
    """
    return await run_task_and_respond(get_client(), get_task_name("square"), [data["a"]])

@router.post("/cube", response_model=TaskResponse)
async def cube(data: dict[str, Any]):
    """
    Execute the cube task.

    Input: {"a": 3}
    Output: 27
    """
    return await run_task_and_respond(get_client(), get_task_name("cube"), [data["a"]])

@router.post("/greet", response_model=TaskResponse)
async def greet(data: dict[str, Any]):
    """
    Execute the greet task.

    Input: {"name": "Alice"}
    Output: "Hello, Alice! Welcome to Render Workflows."
    """
    return await run_task_and_respond(get_client(), get_task_name("greet"), [data["name"]])

@router.post("/add_numbers", response_model=TaskResponse)
async def add_numbers(data: dict[str, Any]):
    """
    Execute the add_numbers task (with retry config).

    Input: {"a": 5, "b": 3}
    Output: 8
    """
    return await run_task_and_respond(get_client(), get_task_name("add_with_retry"), [data["a"], data["b"]])

@router.post("/multiply", response_model=TaskResponse)
async def multiply(data: dict[str, Any]):
    """
    Execute the multiply task.

    Input: {"a": 4, "b": 7}
    Output: 28
    """
    return await run_task_and_respond(get_client(), get_task_name("multiply"), [data["a"], data["b"]])
