"""
Endpoints for subtask examples.
"""

from typing import Any
from fastapi import APIRouter

from ..models import TaskResponse
from .utils import get_client, get_task_name, run_task_and_respond

router = APIRouter()

@router.post("/add_squares", response_model=TaskResponse)
async def add_squares(data: dict[str, Any]):
    """
    Execute the add_squares task (calls square task twice).

    Input: {"a": 3, "b": 4}
    Output: 25 (9 + 16)
    """
    return await run_task_and_respond(get_client(), get_task_name("add_squares"), [data["a"], data["b"]])

@router.post("/calculate_area", response_model=TaskResponse)
async def calculate_area(data: dict[str, Any]):
    """
    Execute the calculate_area task (uses multiply subtask).

    Input: {"length": 5, "width": 3}
    Output: {"area": 15, "perimeter": 16, "dimensions": {"length": 5, "width": 3}}
    """
    return await run_task_and_respond(get_client(), get_task_name("calculate_area"), [data["length"], data["width"]])
