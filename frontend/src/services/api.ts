import axios from 'axios'
import type { TaskResponse, Engine } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Basic tasks
export const runSquare = (a: number, engine: Engine = 'render') =>
  api.post<TaskResponse>(`/api/basic/square?engine=${engine}`, { a })

export const runCube = (a: number, engine: Engine = 'render') =>
  api.post<TaskResponse>(`/api/basic/cube?engine=${engine}`, { a })

export const runGreet = (name: string, engine: Engine = 'render') =>
  api.post<TaskResponse>(`/api/basic/greet?engine=${engine}`, { name })

export const runAddNumbers = (a: number, b: number, engine: Engine = 'render') =>
  api.post<TaskResponse>(`/api/basic/add_numbers?engine=${engine}`, { a, b })

export const runMultiply = (a: number, b: number, engine: Engine = 'render') =>
  api.post<TaskResponse>(`/api/basic/multiply?engine=${engine}`, { a, b })

// Subtasks
export const runAddSquares = (a: number, b: number, engine: Engine = 'render') =>
  api.post<TaskResponse>(`/api/subtasks/add_squares?engine=${engine}`, { a, b })

export const runCalculateArea = (length: number, width: number, engine: Engine = 'render') =>
  api.post<TaskResponse>(`/api/subtasks/calculate_area?engine=${engine}`, { length, width })

// Parallel
export const runComputeMultiple = (numbers: number[], engine: Engine = 'render') =>
  api.post<TaskResponse>(`/api/parallel/compute_multiple?engine=${engine}`, { numbers })

export const runSumOfSquares = (numbers: number[], engine: Engine = 'render') =>
  api.post<TaskResponse>(`/api/parallel/sum_of_squares?engine=${engine}`, { numbers })

export const runDeepParallelTree = (numbers: number[], engine: Engine = 'render', chunk_size?: number) =>
  api.post<TaskResponse>(`/api/parallel/deep_parallel_tree?engine=${engine}`, { numbers, ...(chunk_size && { chunk_size }) })

// OpenAI
export const runAnalyzeSentiment = (text: string, engine: Engine = 'render') =>
  api.post<TaskResponse>(`/api/openai/analyze_sentiment?engine=${engine}`, { text })

export const runTranslate = (text: string, target_language: string, engine: Engine = 'render') =>
  api.post<TaskResponse>(`/api/openai/translate?engine=${engine}`, { text, target_language })

export const runSummarize = (text: string, engine: Engine = 'render', max_sentences: number = 3) =>
  api.post<TaskResponse>(`/api/openai/summarize?engine=${engine}`, { text, max_sentences })

// Advanced
export const runProcessDocument = (document: string, engine: Engine = 'render', translate_to?: string) =>
  api.post<TaskResponse>(`/api/advanced/process_document?engine=${engine}`, { document, translate_to })

export const runParallelSentiment = (texts: string[], engine: Engine = 'render') =>
  api.post<TaskResponse>(`/api/advanced/parallel_sentiment?engine=${engine}`, { texts })

export const runMultiLanguageSummary = (text: string, languages: string[], engine: Engine = 'render') =>
  api.post<TaskResponse>(`/api/advanced/multi_language_summary?engine=${engine}`, { text, languages })

// Task status polling
export const getTaskStatus = (taskRunId: string, engine: Engine = 'render') =>
  api.get<TaskResponse>(`/api/task/${taskRunId}?engine=${engine}`)

export default api
