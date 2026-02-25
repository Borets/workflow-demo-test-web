import axios from 'axios'
import type { TaskResponse } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Basic tasks
export const runSquare = (a: number) =>
  api.post<TaskResponse>('/api/basic/square', { a })

export const runCube = (a: number) =>
  api.post<TaskResponse>('/api/basic/cube', { a })

export const runGreet = (name: string) =>
  api.post<TaskResponse>('/api/basic/greet', { name })

export const runAddNumbers = (a: number, b: number) =>
  api.post<TaskResponse>('/api/basic/add_numbers', { a, b })

export const runMultiply = (a: number, b: number) =>
  api.post<TaskResponse>('/api/basic/multiply', { a, b })

// Subtasks
export const runAddSquares = (a: number, b: number) =>
  api.post<TaskResponse>('/api/subtasks/add_squares', { a, b })

export const runCalculateArea = (length: number, width: number) =>
  api.post<TaskResponse>('/api/subtasks/calculate_area', { length, width })

// Parallel
export const runComputeMultiple = (numbers: number[]) =>
  api.post<TaskResponse>('/api/parallel/compute_multiple', { numbers })

export const runSumOfSquares = (numbers: number[]) =>
  api.post<TaskResponse>('/api/parallel/sum_of_squares', { numbers })

export const runDeepParallelTree = (numbers: number[], chunk_size?: number) =>
  api.post<TaskResponse>('/api/parallel/deep_parallel_tree', { numbers, ...(chunk_size && { chunk_size }) })

// OpenAI
export const runAnalyzeSentiment = (text: string) =>
  api.post<TaskResponse>('/api/openai/analyze_sentiment', { text })

export const runTranslate = (text: string, target_language: string) =>
  api.post<TaskResponse>('/api/openai/translate', { text, target_language })

export const runSummarize = (text: string, max_sentences: number = 3) =>
  api.post<TaskResponse>('/api/openai/summarize', { text, max_sentences })

// Advanced
export const runProcessDocument = (document: string, translate_to?: string) =>
  api.post<TaskResponse>('/api/advanced/process_document', { document, translate_to })

export const runParallelSentiment = (texts: string[]) =>
  api.post<TaskResponse>('/api/advanced/parallel_sentiment', { texts })

export const runMultiLanguageSummary = (text: string, languages: string[]) =>
  api.post<TaskResponse>('/api/advanced/multi_language_summary', { text, languages })

export default api
