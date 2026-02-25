"""
Endpoints for basic task examples.
"""

from typing import Any
from fastapi import APIRouter, HTTPException
from render_sdk import Render
import os

from ..models import TaskResponse
from .utils import handle_sdk_error

router = APIRouter()

def get_client() -> Render:
    """Get Render API client."""
    return Render()

def get_task_name(task: str) -> str:
    """Get full task name with service slug if configured."""
    service_slug = os.getenv("WORKFLOW_SERVICE_SLUG", "slav-workflow-demo-test-workflow-service")
    return f"{service_slug}/{task}"


@router.post("/square", response_model=TaskResponse)
async def square(data: dict[str, Any]):
    """
    Execute the square task.

    Input: {"a": 5}
    Output: 25
    """
    client = get_client()
    try:
        task_run = await client.workflows.run_task(get_task_name("square"), [data["a"]])
        result = await task_run

        return TaskResponse(
            task_run_id=result.id,
            status=result.status,
            message=f"Task completed successfully",
            result=result.results
        )
    except Exception as e:
        raise handle_sdk_error(e)

@router.post("/cube", response_model=TaskResponse)
async def cube(data: dict[str, Any]):
    """
    Execute the cube task.

    Input: {"a": 3}
    Output: 27
    """
    client = get_client()
    try:
        task_run = await client.workflows.run_task(get_task_name("cube"), [data["a"]])
        result = await task_run

        return TaskResponse(
            task_run_id=result.id,
            status=result.status,
            message=f"Task completed successfully",
            result=result.results
        )
    except Exception as e:
        raise handle_sdk_error(e)

@router.post("/greet", response_model=TaskResponse)
async def greet(data: dict[str, Any]):
    """
    Execute the greet task.

    Input: {"name": "Alice"}
    Output: "Hello, Alice! Welcome to Render Workflows."
    """
    client = get_client()
    try:
        task_run = await client.workflows.run_task(get_task_name("greet"), [data["name"]])
        result = await task_run

        return TaskResponse(
            task_run_id=result.id,
            status=result.status,
            message=f"Task completed successfully",
            result=result.results
        )
    except Exception as e:
        raise handle_sdk_error(e)

@router.post("/add_numbers", response_model=TaskResponse)
async def add_numbers(data: dict[str, Any]):
    """
    Execute the add_numbers task (with retry config).

    Input: {"a": 5, "b": 3}
    Output: 8
    """
    client = get_client()
    try:
        task_run = await client.workflows.run_task(get_task_name("add_with_retry"), [data["a"], data["b"]])
        result = await task_run

        return TaskResponse(
            task_run_id=result.id,
            status=result.status,
            message=f"Task completed successfully",
            result=result.results
        )
    except Exception as e:
        raise handle_sdk_error(e)

@router.post("/multiply", response_model=TaskResponse)
async def multiply(data: dict[str, Any]):
    """
    Execute the multiply task.

    Input: {"a": 4, "b": 7}
    Output: 28
    """
    client = get_client()
    try:
        task_run = await client.workflows.run_task(get_task_name("multiply"), [data["a"], data["b"]])
        result = await task_run

        return TaskResponse(
            task_run_id=result.id,
            status=result.status,
            message=f"Task completed successfully",
            result=result.results
        )
    except Exception as e:
        raise handle_sdk_error(e)
