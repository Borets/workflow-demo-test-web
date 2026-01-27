"""
Shared utilities for route handlers.
"""

import logging
from fastapi import HTTPException
from render_sdk.client.errors import RenderError
import httpx

logger = logging.getLogger(__name__)


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
