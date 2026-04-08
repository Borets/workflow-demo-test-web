import { task } from "@trigger.dev/sdk/v3";
import { analyzeTextSentiment, translateText, summarizeText } from "./openai";
import { unwrap } from "./utils";

export const processDocumentPipeline = task({
  id: "process_document_pipeline",
  run: async (payload: { document: string; translateTo?: string }) => {
    console.log("[Pipeline Task] Starting document processing pipeline...");

    const results: Record<string, any> = {
      original_document: payload.document,
    };

    // Level 1: Translation (if requested)
    let textToSummarize: string;
    if (payload.translateTo) {
      console.log("[Pipeline Task] -> Level 1: Calling translate_text subtask...");
      const translated = unwrap<string>(
        await translateText.triggerAndWait({
          text: payload.document,
          targetLanguage: payload.translateTo,
        })
      );
      results.translated_text = translated;
      textToSummarize = translated;
    } else {
      console.log("[Pipeline Task] -> Level 1: Skipping translation");
      textToSummarize = payload.document;
    }

    // Level 2: Summarization
    console.log("[Pipeline Task] -> Level 2: Calling summarize_text subtask...");
    const summary = unwrap<string>(
      await summarizeText.triggerAndWait({
        text: textToSummarize,
        maxSentences: 2,
      })
    );
    results.summary = summary;

    // Level 3: Sentiment Analysis
    console.log(
      "[Pipeline Task] -> Level 3: Calling analyze_text_sentiment subtask..."
    );
    const sentiment = unwrap<any>(
      await analyzeTextSentiment.triggerAndWait({ text: summary })
    );
    results.sentiment_analysis = sentiment;

    console.log("[Pipeline Task] Pipeline complete!");
    return results;
  },
});

export const parallelSentimentAnalysis = task({
  id: "parallel_sentiment_analysis",
  run: async (payload: { texts: string[] }) => {
    console.log(
      `[Parallel Analysis] Starting analysis of ${payload.texts.length} text snippets`
    );

    const results: any[] = [];
    for (const text of payload.texts) {
      results.push(
        unwrap<any>(await analyzeTextSentiment.triggerAndWait({ text }))
      );
    }

    const sentiments = results.map((r: any) => r.sentiment);
    const sentimentCounts = {
      positive: sentiments.filter((s: string) => s === "positive").length,
      negative: sentiments.filter((s: string) => s === "negative").length,
      neutral: sentiments.filter((s: string) => s === "neutral").length,
    };

    console.log(
      `[Parallel Analysis] Sentiment distribution: ${JSON.stringify(sentimentCounts)}`
    );

    return {
      results,
      summary: sentimentCounts,
      total: payload.texts.length,
      texts: payload.texts,
    };
  },
});

export const multiLanguageSummary = task({
  id: "multi_language_summary",
  run: async (payload: { text: string; languages: string[] }) => {
    console.log(
      `[Multi-Language] Generating summaries in ${payload.languages.length} languages`
    );

    // Step 1: Summarize the original text
    const originalSummary = unwrap<string>(
      await summarizeText.triggerAndWait({ text: payload.text, maxSentences: 3 })
    );

    // Step 2: Translate summary to all languages
    const translations: string[] = [];
    for (const lang of payload.languages) {
      translations.push(
        unwrap<string>(
          await translateText.triggerAndWait({
            text: originalSummary,
            targetLanguage: lang,
          })
        )
      );
    }

    const translationMap: Record<string, string> = {};
    payload.languages.forEach((lang, i) => {
      translationMap[lang] = translations[i];
    });

    console.log("[Multi-Language] Complete!");
    return {
      original_summary: originalSummary,
      translations: translationMap,
    };
  },
});
