"""
Advanced task examples demonstrating complex workflows.

These tasks show:
- Multi-level subtask execution
- Complex pipelines combining multiple operations
- Conditional workflows
- Data aggregation across subtasks
"""

import asyncio
import logging
from app import app
from openai_tasks import analyze_text_sentiment, translate_text, summarize_text

logger = logging.getLogger(__name__)

@app.task
async def process_document_pipeline(document: str, translate_to: str = None) -> dict:
    """
    Complex document processing pipeline with multiple levels of subtasks.

    Workflow:
      Level 1: Translate document (if translate_to is specified)
      Level 2: Summarize the translated (or original) document
      Level 3: Analyze sentiment of the summary

    This demonstrates nested subtask execution - each subtask calling other subtasks.

    Args:
        document: The document to process
        translate_to: Optional language to translate to (e.g., 'Spanish')

    Returns:
        dict containing all pipeline results
    """
    logger.info("[Pipeline Task] Starting document processing pipeline...")
    logger.info(f"[Pipeline Task] Document length: {len(document)} chars")
    logger.info(f"[Pipeline Task] Translation target: {translate_to or 'None'}")

    results = {"original_document": document}

    # Level 1: Translation (if requested)
    if translate_to:
        logger.info("[Pipeline Task] → Level 1: Calling translate_text subtask...")
        translated = await translate_text(document, translate_to)
        results["translated_text"] = translated
        text_to_summarize = translated
    else:
        logger.info("[Pipeline Task] → Level 1: Skipping translation")
        text_to_summarize = document

    # Level 2: Summarization
    logger.info("[Pipeline Task] → Level 2: Calling summarize_text subtask...")
    summary = await summarize_text(text_to_summarize, max_sentences=2)
    results["summary"] = summary

    # Level 3: Sentiment Analysis
    logger.info(
        "[Pipeline Task] → Level 3: Calling analyze_text_sentiment subtask..."
    )
    sentiment = await analyze_text_sentiment(summary)
    results["sentiment_analysis"] = sentiment

    logger.info("[Pipeline Task] Pipeline complete!")
    logger.info(f"[Pipeline Task] Final sentiment: {sentiment['sentiment']}")

    return results


@app.task
async def parallel_sentiment_analysis(texts: list[str]) -> dict:
    """
    Analyze multiple text snippets in parallel using concurrent subtask execution.

    This demonstrates how to execute multiple subtasks concurrently using
    asyncio.gather().

    Args:
        texts: List of text snippets to analyze

    Returns:
        dict with 'results' (list of sentiment analyses) and 'summary'
        (aggregated stats)
    """
    logger.info(f"[Parallel Analysis] Starting analysis of {len(texts)} text snippets")

    # Execute all sentiment analyses in parallel
    logger.info("[Parallel Analysis] → Launching parallel subtasks...")
    sentiment_tasks = [analyze_text_sentiment(text) for text in texts]
    results = await asyncio.gather(*sentiment_tasks)

    logger.info("[Parallel Analysis] → All parallel subtasks completed")

    # Aggregate results
    sentiments = [r["sentiment"] for r in results]
    sentiment_counts = {
        "positive": sentiments.count("positive"),
        "negative": sentiments.count("negative"),
        "neutral": sentiments.count("neutral"),
    }

    logger.info(f"[Parallel Analysis] Sentiment distribution: {sentiment_counts}")

    return {
        "results": results,
        "summary": sentiment_counts,
        "total": len(texts),
        "texts": texts
    }


@app.task
async def multi_language_summary(text: str, languages: list[str]) -> dict:
    """
    Generate summaries in multiple languages in parallel.

    Workflow:
      1. Summarize original text
      2. Translate summary to all requested languages in parallel
      3. Return all summaries

    Args:
        text: The text to summarize and translate
        languages: List of languages to translate to (e.g., ['Spanish', 'French'])

    Returns:
        dict with original summary and translations
    """
    logger.info(f"[Multi-Language] Generating summaries in {len(languages)} languages")

    # Step 1: Summarize the original text
    logger.info("[Multi-Language] → Step 1: Summarizing original text...")
    original_summary = await summarize_text(text, max_sentences=3)

    # Step 2: Translate summary to all languages in parallel
    logger.info(f"[Multi-Language] → Step 2: Translating to {languages}...")
    translation_tasks = [
        translate_text(original_summary, lang) for lang in languages
    ]
    translations = await asyncio.gather(*translation_tasks)

    # Build result dictionary
    results = {
        "original_summary": original_summary,
        "translations": {
            lang: translation
            for lang, translation in zip(languages, translations)
        }
    }

    logger.info("[Multi-Language] Complete!")
    return results
