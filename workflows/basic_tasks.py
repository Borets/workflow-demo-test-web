"""
Basic task examples demonstrating simple sync and async patterns.

These tasks show:
- Simple synchronous functions
- Async functions
- Type annotations
- Retry configuration
"""

import logging
from render.workflows import task, Options, Retry

logger = logging.getLogger(__name__)

@task
def square(a: int) -> int:
    """Synchronous task: Square a number."""
    logger.info(f"Computing square of {a}")
    return a * a

@task
async def cube(a: int) -> int:
    """Async task: Cube a number."""
    logger.info(f"Computing cube of {a}")
    return a * a * a

@task(
    name="add_with_retry",
    options=Options(retry=Retry(max_retries=3, wait_duration_ms=1000))
)
def add_numbers(a: int, b: int) -> int:
    """Add two numbers with retry configuration."""
    logger.info(f"Adding {a} + {b}")
    return a + b

@task
def greet(name: str) -> str:
    """Simple greeting task."""
    logger.info(f"Greeting {name}")
    return f"Hello, {name}! Welcome to Render Workflows."

@task
def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    logger.info(f"Multiplying {a} * {b}")
    return a * b