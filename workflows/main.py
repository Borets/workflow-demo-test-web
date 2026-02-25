"""
Entry point for Render Workflows service.

This file creates the Workflows app instance and imports all task definitions.
The app registers all tasks with Render and executes them when triggered.
"""

import logging

from render_sdk import Retry, Workflows

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Workflows(
    default_retry=Retry(max_retries=3, wait_duration_ms=1000, backoff_scaling=2.0),
    default_timeout=300,
    default_plan="standard",
)

# Import all task modules to register tasks
import basic_tasks      # Simple sync/async tasks
import subtasks         # Tasks calling other tasks
import parallel_tasks   # Parallel execution examples
import openai_tasks     # OpenAI/LLM integration
import advanced_tasks   # Complex pipelines

logger.info("Starting Render Workflows service...")
logger.info("Registered modules: basic_tasks, subtasks, parallel_tasks, openai_tasks, advanced_tasks")

app.start()
