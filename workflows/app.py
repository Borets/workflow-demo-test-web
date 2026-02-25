"""Shared Workflows app instance.

All task modules import `app` from here. Kept separate from main.py
to avoid circular imports when main.py imports the task modules.
"""

from render_sdk import Retry, Workflows

app = Workflows(
    default_retry=Retry(max_retries=3, wait_duration_ms=1000, backoff_scaling=2.0),
    default_timeout=300,
    default_plan="standard",
)
