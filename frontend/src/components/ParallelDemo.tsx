import { useState } from 'react'
import { runComputeMultiple, runSumOfSquares } from '../services/api'
import TaskResult from './TaskResult'
import type { TaskResponse } from '../types'

export default function ParallelDemo() {
  const [result, setResult] = useState<TaskResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [computeNumbers, setComputeNumbers] = useState('2, 3, 4')
  const [sumNumbers, setSumNumbers] = useState('1, 2, 3, 4')

  const parseNumbers = (input: string): number[] => {
    return input.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))
  }

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
      <h2 className="text-2xl font-semibold">Parallel Execution</h2>
      <p className="text-gray-600">
        Demonstrate concurrent task execution using asyncio.gather() for improved performance.
      </p>

      {/* Compute Multiple Task */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Compute Multiple</h3>
        <p className="text-gray-600 text-sm mb-4">
          Compute squares and cubes for multiple numbers in parallel
        </p>
        <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
          <strong>Workflow:</strong> This task takes a list of numbers and computes their squares
          and cubes in parallel using asyncio.gather(). All square tasks run concurrently, then all
          cube tasks run concurrently.
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={computeNumbers}
            onChange={(e) => setComputeNumbers(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
            placeholder="Enter numbers (comma-separated)"
          />
          <button
            onClick={() => handleTask(() => runComputeMultiple(parseNumbers(computeNumbers)))}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Run Task
          </button>
        </div>
      </div>

      {/* Sum of Squares Task */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Sum of Squares</h3>
        <p className="text-gray-600 text-sm mb-4">
          Calculate sum of squares with parallel computation
        </p>
        <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
          <strong>Workflow:</strong> This task computes the square of each number in parallel,
          then aggregates the results by summing them. Demonstrates parallel computation followed
          by aggregation. Example: [1, 2, 3, 4] → [1, 4, 9, 16] → 30
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={sumNumbers}
            onChange={(e) => setSumNumbers(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
            placeholder="Enter numbers (comma-separated)"
          />
          <button
            onClick={() => handleTask(() => runSumOfSquares(parseNumbers(sumNumbers)))}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Run Task
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Running task...</p>
        </div>
      )}

      {/* Results */}
      <TaskResult result={result} error={error} />
    </div>
  )
}
