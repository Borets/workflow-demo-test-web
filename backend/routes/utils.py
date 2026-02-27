"""
Shared utilities for route handlers.
"""

import logging
import os
from fastapi import HTTPException
from render_sdk import RenderAsync
from render_sdk.client.errors import RenderError
from render_sdk.public_api.api.workflows_ea import list_workflows
import httpx

logger = logging.getLogger(__name__)

_workflow_id_cache: str | None = None


async def get_workflow_id(client: RenderAsync) -> str | None:
    global _workflow_id_cache
    if _workflow_id_cache is not None:
        return _workflow_id_cache
    try:
        response = await list_workflows.asyncio_detailed(client=client._client.internal, limit=10)
        if response.parsed and isinstance(response.parsed, list) and len(response.parsed) > 0:
            service_slug = os.getenv("WORKFLOW_SERVICE_SLUG", "workflow-demo-test-web")
            for item in response.parsed:
                wf = item.workflow
                if wf.slug == service_slug:
                    _workflow_id_cache = wf.id
                    return _workflow_id_cache
            # Fallback to first workflow if no slug match
            _workflow_id_cache = response.parsed[0].workflow.id
            return _workflow_id_cache
    except Exception as e:
        logger.warning(f"Failed to fetch workflow ID: {e}")
    return None


async def run_task_and_respond(
    client: RenderAsync,
    task_name: str,
    args: list,
    message: str = "Task completed successfully",
) -> "TaskResponse":
    """Create a task and return immediately with its ID (non-blocking)."""
    from ..models import TaskResponse

    try:
        result = await client.workflows.run_task(task_name, args)
        wf_id = await get_workflow_id(client)
        return TaskResponse(
            task_run_id=result.id,
            workflow_id=wf_id,
            status="running",
            message="Task started",
        )
    except Exception as e:
        raise handle_sdk_error(e)


async def get_task_status(task_run_id: str) -> "TaskResponse":
    """Poll a task run's current status."""
    from ..models import TaskResponse

    client = RenderAsync()
    try:
        details = await client.workflows.get_task_run(task_run_id)
        wf_id = await get_workflow_id(client)
        status = details.status.value if hasattr(details.status, 'value') else str(details.status)
        result = None
        message = f"Task {status}"
        if status == "completed":
            result = details.results
            message = "Task completed successfully"
        elif status == "failed":
            message = details.error if hasattr(details, 'error') and details.error else "Task failed"
        return TaskResponse(
            task_run_id=task_run_id,
            workflow_id=wf_id,
            status=status,
            message=message,
            result=result,
        )
    except Exception as e:
        raise handle_sdk_error(e)


def handle_sdk_error(e: Exception) -> HTTPException:
    """Handle SDK errors including the streaming response bug.
    
    The render_sdk has a bug where it tries to access response.text on
    a streaming response without calling read() first. This causes
    httpx.ResponseNotRead exceptions when there are SSE stream errors.
    """
    if isinstance(e, httpx.ResponseNotRead):
        logger.error(f"SDK streaming error (likely auth or connection issue): {e}")
        return HTTPException(
            status_code=503,
            detail="Workflow service unavailable - SSE stream error. Check RENDER_API_KEY and workflow service status."
        )
    elif isinstance(e, RenderError):
        logger.error(f"Render API error: {e}")
        return HTTPException(status_code=500, detail=str(e))
    else:
        logger.error(f"Unexpected error: {type(e).__name__}: {e}")
        return HTTPException(status_code=500, detail=f"Unexpected error: {type(e).__name__}")
