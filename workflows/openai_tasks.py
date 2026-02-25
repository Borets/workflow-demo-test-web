"""
OpenAI integration examples with GPT models.

These tasks demonstrate integration with OpenAI's API and show various
patterns of AI-powered workflows.

Requirements:
- OpenAI API key set in OPENAI_API_KEY environment variable
- openai package installed
"""

import json
import logging
import os
from app import app
from render_sdk import Retry

logger = logging.getLogger(__name__)

# OpenAI client initialization (lazy loading)
_openai_client = None
_openai_import_error = None

try:
    from openai import AsyncOpenAI
except ImportError as e:
    _openai_import_error = e
    logger.warning(
        "OpenAI package not installed - OpenAI tasks will fail. "
        "Install with: pip install openai"
    )

def get_openai_client():
    """
    Get or initialize the OpenAI client.

    This function initializes the client lazily, checking for the API key
    at the time of the first call rather than at module import time.

    Returns:
        AsyncOpenAI: The initialized OpenAI client

    Raises:
        ImportError: If the openai package is not installed
        ValueError: If OPENAI_API_KEY is not set
    """
    global _openai_client

    if _openai_import_error:
        raise ImportError(
            "OpenAI package not installed. Install with: pip install openai"
        ) from _openai_import_error

    if _openai_client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError(
                "OPENAI_API_KEY environment variable not set. "
                "Please set it in your Render environment variables."
            )

        _openai_client = AsyncOpenAI(api_key=api_key)
        logger.info("OpenAI client initialized successfully")

    return _openai_client


@app.task(retry=Retry(max_retries=3, wait_duration_ms=2000, backoff_scaling=2.0))
async def analyze_text_sentiment(text: str) -> dict:
    """
    Analyze text sentiment using OpenAI GPT.

    This is a basic example of calling an external API from a task.
    Includes retry configuration for handling API failures.

    Args:
        text: The text to analyze

    Returns:
        dict with 'sentiment' and 'explanation' keys
    """
    logger.info(f"[OpenAI Task] Analyzing sentiment for text: {text[:50]}...")

    client = get_openai_client()

    try:
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a sentiment analysis expert. Analyze the sentiment "
                        "and respond with a JSON object containing 'sentiment' "
                        "(positive/negative/neutral) and 'explanation' fields."
                    ),
                },
                {"role": "user", "content": f"Analyze this text: {text}"},
            ],
            response_format={"type": "json_object"},
        )

        result = json.loads(response.choices[0].message.content)
        logger.info(f"[OpenAI Task] Sentiment analysis complete: {result['sentiment']}")
        return result

    except Exception as e:
        logger.error(f"[OpenAI Task] Failed to analyze text: {e}")
        raise


@app.task(retry=Retry(max_retries=3, wait_duration_ms=2000, backoff_scaling=2.0))
async def translate_text(text: str, target_language: str) -> str:
    """
    Translate text to a target language using OpenAI GPT.

    This task is designed to be used as a subtask in more complex workflows.

    Args:
        text: The text to translate
        target_language: Target language (e.g., 'Spanish', 'French', 'Japanese')

    Returns:
        Translated text
    """
    logger.info(
        f"[Translation Task] Translating text to {target_language}: {text[:50]}..."
    )

    client = get_openai_client()

    try:
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"You are a professional translator. Translate the following "
                        f"text to {target_language}. Only respond with the "
                        f"translation, no explanations."
                    ),
                },
                {"role": "user", "content": text},
            ],
        )

        translation = response.choices[0].message.content
        logger.info(f"[Translation Task] Translation complete: {translation[:50]}...")
        return translation

    except Exception as e:
        logger.error(f"[Translation Task] Failed to translate text: {e}")
        raise


@app.task(retry=Retry(max_retries=3, wait_duration_ms=2000, backoff_scaling=2.0))
async def summarize_text(text: str, max_sentences: int = 3) -> str:
    """
    Summarize text using OpenAI GPT.

    This task is designed to be used as a subtask in more complex workflows.

    Args:
        text: The text to summarize
        max_sentences: Maximum number of sentences in summary

    Returns:
        Summarized text
    """
    logger.info(f"[Summary Task] Summarizing text ({len(text)} chars)...")

    client = get_openai_client()

    try:
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"You are a professional summarizer. Summarize the following "
                        f"text in {max_sentences} sentences or less. Be concise and "
                        f"capture the key points."
                    ),
                },
                {"role": "user", "content": text},
            ],
        )

        summary = response.choices[0].message.content
        logger.info(f"[Summary Task] Summary complete: {summary[:50]}...")
        return summary

    except Exception as e:
        logger.error(f"[Summary Task] Failed to summarize text: {e}")
        raise
