"""
Entry point for Render Workflows service.

This file imports all task definitions and starts the workflow runner.
The runner will register all tasks with Render and execute them when triggered.
"""

import logging

# Import all task modules to register tasks
from workflows import (
    basic_tasks,      # Simple sync/async tasks
    subtasks,         # Tasks calling other tasks
    parallel_tasks,   # Parallel execution examples
    openai_tasks,     # OpenAI/LLM integration
    advanced_tasks,   # Complex pipelines
)

from render_sdk.workflows import start

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.info("Starting Render Workflows service...")
    logger.info("Registered modules: basic_tasks, subtasks, parallel_tasks, openai_tasks, advanced_tasks")

    # Start the workflow runner
    # This will read RENDER_SDK_MODE env var and either:
    # - register: Send all task definitions to Render
    # - run: Execute a specific task
    start()