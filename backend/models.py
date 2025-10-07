"""
Pydantic models for request/response validation.
"""

from typing import Any, Optional
from pydantic import BaseModel, Field

class TaskResponse(BaseModel):
    """Task execution response."""
    task_run_id: str = Field(..., description="Unique task run identifier")
    status: str = Field(..., description="Current task status")
    message: str = Field(..., description="Human-readable message")
    result: Optional[Any] = Field(None, description="Task result if completed")

class ErrorResponse(BaseModel):
    """Error response."""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Additional error details")
