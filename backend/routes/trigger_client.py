"""
Trigger.dev REST API client for triggering and polling tasks.
"""

import logging
import os
import httpx

logger = logging.getLogger(__name__)

TRIGGER_API_URL = os.getenv("TRIGGER_API_URL", "https://api.trigger.dev")

# Status mapping from Trigger.dev to our unified status
_RUNNING_STATUSES = {"QUEUED", "EXECUTING", "REATTEMPTING", "FROZEN", "WAITING_FOR_DEPLOY"}
_COMPLETED_STATUSES = {"COMPLETED"}
_FAILED_STATUSES = {"FAILED", "CRASHED", "CANCELED", "TIMED_OUT", "SYSTEM_FAILURE", "INTERRUPTED", "EXPIRED"}


def _get_secret_key() -> str:
    key = os.getenv("TRIGGER_SECRET_KEY")
    if not key:
        raise ValueError("TRIGGER_SECRET_KEY environment variable not set")
    return key


def _map_status(trigger_status: str) -> str:
    if trigger_status in _COMPLETED_STATUSES:
        return "completed"
    if trigger_status in _FAILED_STATUSES:
        return "failed"
    return "running"


async def trigger_task(task_id: str, payload: dict) -> dict:
    """
    Trigger a task on Trigger.dev Cloud.

    Returns dict with 'id' (run ID) and 'status'.
    """
    secret_key = _get_secret_key()
    url = f"{TRIGGER_API_URL}/api/v1/tasks/{task_id}/trigger"

    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            json={"payload": payload},
            headers={
                "Authorization": f"Bearer {secret_key}",
                "Content-Type": "application/json",
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        logger.info(f"Trigger.dev task '{task_id}' triggered: run_id={data.get('id')}")
        return data


async def get_trigger_run_status(run_id: str) -> dict:
    """
    Get the current status of a Trigger.dev run.

    Returns dict with 'id', 'status' (unified), 'output', 'error', and raw 'trigger_status'.
    """
    secret_key = _get_secret_key()
    url = f"{TRIGGER_API_URL}/api/v3/runs/{run_id}"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers={"Authorization": f"Bearer {secret_key}"},
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()

    trigger_status = data.get("status", "UNKNOWN")
    unified_status = _map_status(trigger_status)

    return {
        "id": data.get("id"),
        "status": unified_status,
        "trigger_status": trigger_status,
        "output": data.get("output"),
        "error": data.get("error"),
        "created_at": data.get("createdAt"),
        "started_at": data.get("startedAt"),
        "completed_at": data.get("completedAt"),
    }
