import { useState } from 'react'
import { runAddSquares, runCalculateArea } from '../services/api'
import TaskResult from './TaskResult'
import type { TaskResponse } from '../types'

export default function SubtaskDemo() {
  const [result, setResult] = useState<TaskResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [addA, setAddA] = useState('3')
  const [addB, setAddB] = useState('4')
  const [length, setLength] = useState('5')
  const [width, setWidth] = useState('3')

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
      <h2 className="text-2xl font-semibold">Subtask Examples</h2>
      <p className="text-gray-600">
        Tasks that call other tasks as subtasks, demonstrating workflow composition.
      </p>

      {/* Add Squares Task */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Add Squares</h3>
        <p className="text-gray-600 text-sm mb-4">
          Computes a² + b² by calling the square task twice
        </p>
        <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
          <strong>Workflow:</strong> This task calls the "square" task twice (once for each number)
          and then adds the results together. Example: 3² + 4² = 9 + 16 = 25
        </div>
        <div className="flex gap-3">
          <input
            type="number"
            value={addA}
            onChange={(e) => setAddA(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
            placeholder="First number (a)"
          />
          <input
            type="number"
            value={addB}
            onChange={(e) => setAddB(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
            placeholder="Second number (b)"
          />
          <button
            onClick={() => handleTask(() => runAddSquares(parseInt(addA), parseInt(addB)))}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Run Task
          </button>
        </div>
      </div>

      {/* Calculate Area Task */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Calculate Area</h3>
        <p className="text-gray-600 text-sm mb-4">
          Calculate area (using multiply subtask) and perimeter of a rectangle
        </p>
        <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
          <strong>Workflow:</strong> This task calls the "multiply" task to calculate the area
          (length × width) and computes the perimeter directly. Returns both values along with dimensions.
        </div>
        <div className="flex gap-3">
          <input
            type="number"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
            placeholder="Length"
          />
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
            placeholder="Width"
          />
          <button
            onClick={() => handleTask(() => runCalculateArea(parseInt(length), parseInt(width)))}
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
