"""
Entry point for Render Workflows service.

This file imports all task definitions and starts the workflow runner.
The app instance lives in app.py to avoid circular imports.
"""

import logging
import os
import sys

# Ensure sibling modules are importable when run as `python -m workflows.main`
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import all task modules to register tasks
import basic_tasks      # Simple sync/async tasks
import subtasks         # Tasks calling other tasks
import parallel_tasks   # Parallel execution examples
import openai_tasks     # OpenAI/LLM integration
import advanced_tasks   # Complex pipelines

logger.info("Starting Render Workflows service...")
logger.info("Registered modules: basic_tasks, subtasks, parallel_tasks, openai_tasks, advanced_tasks")

app.start()
