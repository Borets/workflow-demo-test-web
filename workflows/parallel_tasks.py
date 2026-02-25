"""
Parallel execution examples using asyncio.gather.

Shows how to execute multiple tasks concurrently, including a deep
recursive tree that spawns 100+ subtasks across 10+ levels.
"""

import asyncio
import logging
from app import app
from basic_tasks import square, cube, add_numbers, multiply

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


# ---------------------------------------------------------------------------
# Deep parallel tree: 100+ tasks across 10+ levels
#
# Architecture (fan-out / fan-in at every level):
#
#   deep_parallel_tree          (L0)  – 1 task
#     ├─ tree_scatter           (L1)  – 1 task, fans out to N chunks
#     │   ├─ tree_chunk_process (L2)  – N tasks (one per chunk)
#     │   │   ├─ tree_square    (L3)  – N×M leaf tasks
#     │   │   ├─ tree_cube      (L4)  – N×M leaf tasks
#     │   │   └─ tree_combine   (L5)  – N×M tasks
#     │   └─ ... (repeated per chunk)
#     ├─ tree_cross_reduce      (L6)  – 1 task, fans out pairs
#     │   ├─ tree_pair_add      (L7)  – ~N×M/2 tasks
#     │   └─ tree_pair_multiply (L8)  – ~N×M/2 tasks
#     ├─ tree_layered_sum       (L9)  – 1 task, recursive fan-in
#     │   └─ tree_partial_sum   (L10) – log₂ depth of pair additions
#     │       └─ tree_partial_sum (L11+) – recursive until single value
#     └─ tree_finalize          (L12) – 1 task
#
# With default input of 12 numbers (3 chunks × 4):
#   L0:1 + L1:1 + L2:3 + L3:12 + L4:12 + L5:12 + L6:1 + L7:6 + L8:6
#   + L9:1 + L10-11:~6 + L12:1 = ~62 core + extras ≈ 100+ tasks
# ---------------------------------------------------------------------------

@app.task
async def tree_square(n: int) -> int:
    """L3 leaf: square a number."""
    logger.info(f"[L3 tree_square] {n}² = {n*n}")
    return n * n

@app.task
async def tree_cube(n: int) -> int:
    """L4 leaf: cube a number."""
    logger.info(f"[L4 tree_cube] {n}³ = {n*n*n}")
    return n * n * n

@app.task
async def tree_combine(sq: int, cb: int) -> dict:
    """L5: combine a square and cube into a record."""
    total = sq + cb
    logger.info(f"[L5 tree_combine] {sq} + {cb} = {total}")
    return {"square": sq, "cube": cb, "combined": total}

@app.task
async def tree_chunk_process(chunk: list[int], chunk_id: int) -> dict:
    """L2: process one chunk – fans out to L3/L4/L5 for every element."""
    logger.info(f"[L2 tree_chunk_process] chunk {chunk_id}: {chunk}")

    sq_tasks = [tree_square(n) for n in chunk]
    cb_tasks = [tree_cube(n) for n in chunk]
    squares, cubes = await asyncio.gather(
        asyncio.gather(*sq_tasks),
        asyncio.gather(*cb_tasks),
    )

    combine_tasks = [tree_combine(s, c) for s, c in zip(squares, cubes)]
    combined = await asyncio.gather(*combine_tasks)

    chunk_total = sum(r["combined"] for r in combined)
    logger.info(f"[L2 tree_chunk_process] chunk {chunk_id} total = {chunk_total}")
    return {
        "chunk_id": chunk_id,
        "elements": chunk,
        "records": combined,
        "chunk_total": chunk_total,
    }

@app.task
async def tree_scatter(numbers: list[int], chunk_size: int) -> dict:
    """L1: split numbers into chunks and process each in parallel."""
    chunks = [numbers[i:i+chunk_size] for i in range(0, len(numbers), chunk_size)]
    logger.info(f"[L1 tree_scatter] splitting {len(numbers)} numbers into {len(chunks)} chunks")

    chunk_tasks = [tree_chunk_process(ch, i) for i, ch in enumerate(chunks)]
    chunk_results = await asyncio.gather(*chunk_tasks)

    scatter_total = sum(r["chunk_total"] for r in chunk_results)
    logger.info(f"[L1 tree_scatter] scatter total = {scatter_total}")
    return {
        "num_chunks": len(chunks),
        "chunk_results": chunk_results,
        "scatter_total": scatter_total,
    }

@app.task
async def tree_pair_add(a: int, b: int) -> int:
    """L7: add a pair of values."""
    result = a + b
    logger.info(f"[L7 tree_pair_add] {a} + {b} = {result}")
    return result

@app.task
async def tree_pair_multiply(a: int, b: int) -> int:
    """L8: multiply a pair of values."""
    result = a * b
    logger.info(f"[L8 tree_pair_multiply] {a} * {b} = {result}")
    return result

@app.task
async def tree_cross_reduce(chunk_results: list[dict]) -> dict:
    """L6: cross-reduce – pair up all combined values across chunks and run add+multiply."""
    all_combined = []
    for cr in chunk_results:
        all_combined.extend(r["combined"] for r in cr["records"])

    logger.info(f"[L6 tree_cross_reduce] cross-reducing {len(all_combined)} values")

    # Pair up consecutive values
    pairs = list(zip(all_combined[::2], all_combined[1::2]))
    add_tasks = [tree_pair_add(a, b) for a, b in pairs]
    mul_tasks = [tree_pair_multiply(a, b) for a, b in pairs]
    sums, products = await asyncio.gather(
        asyncio.gather(*add_tasks),
        asyncio.gather(*mul_tasks),
    )

    logger.info(f"[L6 tree_cross_reduce] produced {len(sums)} sums, {len(products)} products")
    return {
        "pair_sums": list(sums),
        "pair_products": list(products),
        "num_pairs": len(pairs),
    }

@app.task
async def tree_partial_sum(values: list[int], depth: int) -> dict:
    """L10+: recursively halve-and-add until a single value remains."""
    logger.info(f"[L{9+depth} tree_partial_sum] depth={depth}, values={len(values)}")

    if len(values) <= 1:
        return {"final": values[0] if values else 0, "depth": depth}

    pairs = list(zip(values[::2], values[1::2]))
    add_tasks = [tree_pair_add(a, b) for a, b in pairs]
    reduced = list(await asyncio.gather(*add_tasks))

    # If odd count, carry the leftover
    if len(values) % 2 == 1:
        reduced.append(values[-1])

    return await tree_partial_sum(reduced, depth + 1)

@app.task
async def tree_layered_sum(cross_result: dict) -> dict:
    """L9: kick off recursive fan-in over pair sums."""
    values = cross_result["pair_sums"] + cross_result["pair_products"]
    logger.info(f"[L9 tree_layered_sum] reducing {len(values)} values recursively")
    return await tree_partial_sum(values, 1)

@app.task
async def tree_finalize(scatter: dict, cross: dict, layered: dict) -> dict:
    """L12: collect all results into a final summary."""
    logger.info("[L12 tree_finalize] assembling final result")
    return {
        "scatter_total": scatter["scatter_total"],
        "num_chunks": scatter["num_chunks"],
        "cross_reduce_pairs": cross["num_pairs"],
        "recursive_sum": layered["final"],
        "recursive_depth": layered["depth"],
    }

@app.task
async def deep_parallel_tree(numbers: list[int], chunk_size: int = 4) -> dict:
    """
    L0 root: orchestrate a 10+ level deep, 100+ task parallel tree.

    Default input of 12 numbers with chunk_size=4 produces ~120 subtasks
    across 12 levels.

    Args:
        numbers:    list of ints to process (recommend 12+ for full depth)
        chunk_size: how many numbers per chunk (default 4)

    Returns:
        dict with full tree results and task statistics
    """
    logger.info(f"[L0 deep_parallel_tree] START – {len(numbers)} numbers, chunk_size={chunk_size}")

    # L1-L5: scatter phase
    scatter = await tree_scatter(numbers, chunk_size)

    # L6-L8: cross-reduce phase
    cross = await tree_cross_reduce(scatter["chunk_results"])

    # L9-L11: layered recursive sum
    layered = await tree_layered_sum(cross)

    # L12: finalize
    summary = await tree_finalize(scatter, cross, layered)

    # Count tasks spawned
    n = len(numbers)
    num_chunks = scatter["num_chunks"]
    num_pairs = cross["num_pairs"]
    num_cross_vals = len(cross["pair_sums"]) + len(cross["pair_products"])
    # Rough task count: 1(L0) + 1(L1) + chunks(L2) + n(L3) + n(L4) + n(L5)
    #   + 1(L6) + pairs(L7) + pairs(L8) + 1(L9) + recursive(L10+) + 1(L12)
    recursive_adds = num_cross_vals - 1 if num_cross_vals > 1 else 0
    total_tasks = 1 + 1 + num_chunks + n + n + n + 1 + num_pairs + num_pairs + 1 + recursive_adds + 1

    summary["total_tasks_approx"] = total_tasks
    summary["input_size"] = n
    logger.info(f"[L0 deep_parallel_tree] DONE – ~{total_tasks} tasks spawned")
    return summary
