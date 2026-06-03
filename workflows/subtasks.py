"""
Subtask execution examples.

Demonstrates how tasks can call other tasks using await syntax.
"""

import asyncio
import logging
from app import app
from basic_tasks import square, multiply

logger = logging.getLogger(__name__)

@app.task
async def add_squares(a: int, b: int) -> int:
    """
    Add the squares of two numbers by calling the square task twice.

    This demonstrates subtask execution pattern.
    """
    logger.info(f"Computing add_squares: {a}² + {b}²")

    result1, result2 = await asyncio.gather(square(a), square(b))
    logger.info(f"First square result: {result1}")
    logger.info(f"Second square result: {result2}")

    total = result1 + result2
    logger.info(f"Total: {total}")
    return total

@app.task
async def calculate_area(length: int, width: int) -> dict:
    """
    Calculate area and perimeter using subtasks.

    Returns both area (via multiply subtask) and perimeter.
    """
    logger.info(f"Calculating area and perimeter for {length}x{width}")

    # Use multiply subtask for area
    area = await multiply(length, width)
    logger.info(f"Area calculated: {area}")

    # Calculate perimeter directly
    perimeter = 2 * (length + width)
    logger.info(f"Perimeter: {perimeter}")

    return {
        "area": area,
        "perimeter": perimeter,
        "dimensions": {"length": length, "width": width}
    }
