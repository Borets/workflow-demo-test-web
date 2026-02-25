"""
Entry point for Render Workflows service.

Run locally:  render ea tasks dev -- render-workflows main:app
Deploy:       Start command should be `render-workflows main:app`

The app instance lives in app.py to avoid circular imports.
Task modules register themselves on import via @app.task decorators.
"""

import logging
import os
import sys

# Ensure sibling modules are importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

from app import app  # noqa: E402 - the Workflows instance

# Import all task modules to register tasks with app
import basic_tasks      # noqa: E402, F401 - Simple sync/async tasks
import subtasks         # noqa: E402, F401 - Tasks calling other tasks
import parallel_tasks   # noqa: E402, F401 - Parallel execution examples
import openai_tasks     # noqa: E402, F401 - OpenAI/LLM integration
import advanced_tasks   # noqa: E402, F401 - Complex pipelines

logger.info("Registered modules: basic_tasks, subtasks, parallel_tasks, openai_tasks, advanced_tasks")
