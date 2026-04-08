import { task } from "@trigger.dev/sdk/v3";
import OpenAI from "openai";

// Lazy-initialized client (uses OPENAI_API_KEY env var automatically)
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI();
  }
  return openaiClient;
}

export const analyzeTextSentiment = task({
  id: "analyze_text_sentiment",
  retry: { maxAttempts: 3, minTimeoutInMs: 2000, factor: 2 },
  run: async (payload: { text: string }) => {
    console.log(
      `[OpenAI Task] Analyzing sentiment for text: ${payload.text.slice(0, 50)}...`
    );

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a sentiment analysis expert. Analyze the sentiment " +
            "and respond with a JSON object containing 'sentiment' " +
            "(positive/negative/neutral) and 'explanation' fields.",
        },
        { role: "user", content: `Analyze this text: ${payload.text}` },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content!);
    console.log(
      `[OpenAI Task] Sentiment analysis complete: ${result.sentiment}`
    );
    return result;
  },
});

export const translateText = task({
  id: "translate_text",
  retry: { maxAttempts: 3, minTimeoutInMs: 2000, factor: 2 },
  run: async (payload: { text: string; targetLanguage: string }) => {
    console.log(
      `[Translation Task] Translating text to ${payload.targetLanguage}: ${payload.text.slice(0, 50)}...`
    );

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            `You are a professional translator. Translate the following ` +
            `text to ${payload.targetLanguage}. Only respond with the ` +
            `translation, no explanations.`,
        },
        { role: "user", content: payload.text },
      ],
    });

    const translation = response.choices[0].message.content!;
    console.log(
      `[Translation Task] Translation complete: ${translation.slice(0, 50)}...`
    );
    return translation;
  },
});

export const summarizeText = task({
  id: "summarize_text",
  retry: { maxAttempts: 3, minTimeoutInMs: 2000, factor: 2 },
  run: async (payload: { text: string; maxSentences?: number }) => {
    const maxSentences = payload.maxSentences ?? 3;
    console.log(
      `[Summary Task] Summarizing text (${payload.text.length} chars)...`
    );

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            `You are a professional summarizer. Summarize the following ` +
            `text in ${maxSentences} sentences or less. Be concise and ` +
            `capture the key points.`,
        },
        { role: "user", content: payload.text },
      ],
    });

    const summary = response.choices[0].message.content!;
    console.log(`[Summary Task] Summary complete: ${summary.slice(0, 50)}...`);
    return summary;
  },
});
