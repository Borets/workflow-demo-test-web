import { useState } from 'react'
import { runAnalyzeSentiment, runTranslate, runSummarize } from '../services/api'
import TaskResult from './TaskResult'
import type { TaskResponse } from '../types'

export default function OpenAIDemo() {
  const [result, setResult] = useState<TaskResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [sentimentText, setSentimentText] = useState('I absolutely love this product! It works perfectly.')
  const [translateText, setTranslateText] = useState('Hello, how are you today?')
  const [targetLanguage, setTargetLanguage] = useState('Spanish')
  const [summarizeText, setSummarizeText] = useState(
    'Artificial intelligence is rapidly transforming the world. Machine learning algorithms are becoming more sophisticated, enabling computers to perform tasks that were once thought to require human intelligence. From healthcare to finance, AI is being applied across various industries to improve efficiency and decision-making.'
  )
  const [maxSentences, setMaxSentences] = useState('2')

  const handleTask = async (taskFn: () => Promise<any>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await taskFn()
      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">OpenAI Integration</h2>
      <p className="text-gray-600">
        Workflow tasks that integrate with OpenAI's GPT models for AI-powered processing.
      </p>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> These tasks require the OPENAI_API_KEY environment variable
          to be set in your workflow worker service.
        </p>
      </div>

      {/* Sentiment Analysis */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Sentiment Analysis</h3>
        <p className="text-gray-600 text-sm mb-4">
          Analyze the sentiment of text using GPT
        </p>
        <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
          <strong>Workflow:</strong> Sends text to OpenAI GPT-4 with instructions to analyze
          sentiment and return a JSON object with sentiment (positive/negative/neutral) and explanation.
        </div>
        <div className="space-y-3">
          <textarea
            value={sentimentText}
            onChange={(e) => setSentimentText(e.target.value)}
            className="border rounded px-3 py-2 w-full h-24"
            placeholder="Enter text to analyze"
          />
          <button
            onClick={() => handleTask(() => runAnalyzeSentiment(sentimentText))}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 w-full"
          >
            Analyze Sentiment
          </button>
        </div>
      </div>

      {/* Translation */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Translation</h3>
        <p className="text-gray-600 text-sm mb-4">
          Translate text to another language using GPT
        </p>
        <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
          <strong>Workflow:</strong> Uses GPT-4 to translate text to the specified target language.
          Often used as a subtask in more complex workflows.
        </div>
        <div className="space-y-3">
          <textarea
            value={translateText}
            onChange={(e) => setTranslateText(e.target.value)}
            className="border rounded px-3 py-2 w-full h-20"
            placeholder="Enter text to translate"
          />
          <input
            type="text"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="Target language (e.g., Spanish, French, Japanese)"
          />
          <button
            onClick={() => handleTask(() => runTranslate(translateText, targetLanguage))}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 w-full"
          >
            Translate
          </button>
        </div>
      </div>

      {/* Summarization */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Summarization</h3>
        <p className="text-gray-600 text-sm mb-4">
          Summarize long text into key points using GPT
        </p>
        <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
          <strong>Workflow:</strong> Uses GPT-4 to create a concise summary of the input text,
          limiting the summary to the specified number of sentences.
        </div>
        <div className="space-y-3">
          <textarea
            value={summarizeText}
            onChange={(e) => setSummarizeText(e.target.value)}
            className="border rounded px-3 py-2 w-full h-32"
            placeholder="Enter text to summarize"
          />
          <input
            type="number"
            value={maxSentences}
            onChange={(e) => setMaxSentences(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="Max sentences in summary"
            min="1"
            max="10"
          />
          <button
            onClick={() => handleTask(() => runSummarize(summarizeText, parseInt(maxSentences)))}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 w-full"
          >
            Summarize
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Running task (this may take a few seconds)...</p>
        </div>
      )}

      {/* Results */}
      <TaskResult result={result} error={error} />
    </div>
  )
}
