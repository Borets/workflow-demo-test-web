import { useState } from 'react'
import { runProcessDocument, runParallelSentiment, runMultiLanguageSummary } from '../services/api'
import { useTaskRunner } from '../hooks/useTaskRunner'

export default function AdvancedDemo() {
  const { runTask } = useTaskRunner()

  // Form states
  const [document, setDocument] = useState(
    'Climate change is one of the most pressing challenges of our time. Rising global temperatures are causing ice caps to melt, sea levels to rise, and weather patterns to become more extreme. Scientists around the world are working on solutions, from renewable energy to carbon capture technologies.'
  )
  const [translateTo, setTranslateTo] = useState('Spanish')
  const [enableTranslation, setEnableTranslation] = useState(false)

  const [sentimentTexts, setSentimentTexts] = useState(
    'Great product, highly recommend!\nTerrible experience, very disappointed.\nIt\'s okay, nothing special.'
  )

  const [summaryText, setSummaryText] = useState(
    'Artificial intelligence and machine learning are revolutionizing industries across the globe. These technologies enable computers to learn from data and make decisions without explicit programming.'
  )
  const [languages, setLanguages] = useState('Spanish, French, German')

  const parseLanguages = (input: string): string[] => {
    return input.split(',').map(l => l.trim()).filter(l => l.length > 0)
  }

  const parseTexts = (input: string): string[] => {
    return input.split('\n').filter(t => t.trim().length > 0)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Advanced Workflows</h2>
      <p className="text-gray-600">
        Complex multi-stage pipelines demonstrating nested subtasks, conditional execution, and parallel processing.
      </p>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> These workflows require OPENAI_API_KEY and may take longer to complete
          due to multiple API calls and subtask executions.
        </p>
      </div>

      {/* Document Processing Pipeline */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Document Processing Pipeline</h3>
        <p className="text-gray-600 text-sm mb-4">
          Multi-level pipeline: Translation → Summarization → Sentiment Analysis
        </p>
        <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
          <strong>Workflow:</strong>
          <ol className="list-decimal ml-5 mt-2 space-y-1">
            <li>Optional: Translate document to target language (subtask)</li>
            <li>Summarize the document (subtask calling GPT)</li>
            <li>Analyze sentiment of the summary (subtask calling GPT)</li>
          </ol>
          <p className="mt-2">Demonstrates nested subtask execution and conditional logic.</p>
        </div>
        <div className="space-y-3">
          <textarea
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            className="border rounded px-3 py-2 w-full h-32"
            placeholder="Enter document to process"
          />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={enableTranslation}
              onChange={(e) => setEnableTranslation(e.target.checked)}
              id="enable-translation"
              className="rounded"
            />
            <label htmlFor="enable-translation" className="text-sm">Enable translation</label>
            {enableTranslation && (
              <input
                type="text"
                value={translateTo}
                onChange={(e) => setTranslateTo(e.target.value)}
                className="border rounded px-3 py-2 flex-1"
                placeholder="Target language"
              />
            )}
          </div>
          <button
            onClick={() => runTask(
              'Process Document Pipeline',
              () => runProcessDocument(document, enableTranslation ? translateTo : undefined),
              { document, translate_to: enableTranslation ? translateTo : undefined }
            )}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition w-full"
          >
            Process Document
          </button>
        </div>
      </div>

      {/* Parallel Sentiment Analysis */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Parallel Sentiment Analysis</h3>
        <p className="text-gray-600 text-sm mb-4">
          Analyze multiple texts in parallel and aggregate results
        </p>
        <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
          <strong>Workflow:</strong> Launches sentiment analysis subtasks for each text in parallel
          using asyncio.gather(), then aggregates the results to show sentiment distribution
          (positive/negative/neutral counts).
        </div>
        <div className="space-y-3">
          <textarea
            value={sentimentTexts}
            onChange={(e) => setSentimentTexts(e.target.value)}
            className="border rounded px-3 py-2 w-full h-24"
            placeholder="Enter texts to analyze (one per line)"
          />
          <button
            onClick={() => runTask(
              'Parallel Sentiment Analysis',
              () => runParallelSentiment(parseTexts(sentimentTexts)),
              { texts: parseTexts(sentimentTexts) }
            )}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition w-full"
          >
            Analyze All in Parallel
          </button>
        </div>
      </div>

      {/* Multi-Language Summary */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Multi-Language Summary</h3>
        <p className="text-gray-600 text-sm mb-4">
          Summarize text and translate to multiple languages in parallel
        </p>
        <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
          <strong>Workflow:</strong>
          <ol className="list-decimal ml-5 mt-2 space-y-1">
            <li>Summarize the original text (subtask)</li>
            <li>Translate summary to all target languages in parallel (subtasks)</li>
            <li>Return original summary + all translations</li>
          </ol>
        </div>
        <div className="space-y-3">
          <textarea
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
            className="border rounded px-3 py-2 w-full h-24"
            placeholder="Enter text to summarize and translate"
          />
          <input
            type="text"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="Target languages (comma-separated)"
          />
          <button
            onClick={() => runTask(
              'Multi-Language Summary',
              () => runMultiLanguageSummary(summaryText, parseLanguages(languages)),
              { text: summaryText, languages: parseLanguages(languages) }
            )}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition w-full"
          >
            Generate Multi-Language Summary
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-sm text-purple-800">
          🚀 Complex multi-stage workflows! These tasks orchestrate multiple subtasks and can run concurrently. 
          Watch the sidebar to see the full execution flow in real-time.
        </p>
      </div>
    </div>
  )
}
