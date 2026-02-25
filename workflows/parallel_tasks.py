"""
Parallel execution examples using asyncio.gather.

Shows how to execute multiple tasks concurrently.
"""

import asyncio
import logging
from main import app
from basic_tasks import square, cube

logger = logging.getLogger(__name__)

@app.task
async def compute_multiple(numbers: list[int]) -> dict:
    """
    Compute squares and cubes for multiple numbers in parallel.

    Args:
        numbers: List of integers to process

    Returns:
        Dict with 'squares' and 'cubes' lists
    """
    logger.info(f"Processing {len(numbers)} numbers in parallel")

    # Launch all square tasks in parallel
    square_tasks = [square(n) for n in numbers]
    squares = await asyncio.gather(*square_tasks)
    logger.info(f"Squares computed: {squares}")

    # Launch all cube tasks in parallel
    cube_tasks = [cube(n) for n in numbers]
    cubes = await asyncio.gather(*cube_tasks)
    logger.info(f"Cubes computed: {cubes}")

    return {
        "input": numbers,
        "squares": squares,
        "cubes": cubes,
        "count": len(numbers)
    }

@app.task
async def sum_of_squares(numbers: list[int]) -> dict:
    """
    Calculate the sum of squares for a list of numbers in parallel.

    Demonstrates parallel computation followed by aggregation.
    """
    logger.info(f"Calculating sum of squares for {len(numbers)} numbers")

    # Compute all squares in parallel
    square_tasks = [square(n) for n in numbers]
    squares = await asyncio.gather(*square_tasks)

    # Sum the results
    total = sum(squares)
    logger.info(f"Sum of squares: {total}")

    return {
        "numbers": numbers,
        "squares": squares,
        "sum": total
    }
