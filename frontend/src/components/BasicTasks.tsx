import { useState } from 'react'
import { runSquare, runCube, runGreet, runAddNumbers, runMultiply } from '../services/api'
import TaskResult from './TaskResult'
import type { TaskResponse } from '../types'

export default function BasicTasks() {
  const [result, setResult] = useState<TaskResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Form states
  const [squareInput, setSquareInput] = useState('5')
  const [cubeInput, setCubeInput] = useState('3')
  const [greetInput, setGreetInput] = useState('Alice')
  const [addA, setAddA] = useState('5')
  const [addB, setAddB] = useState('3')
  const [mulA, setMulA] = useState('4')
  const [mulB, setMulB] = useState('7')

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
      <h2 className="text-2xl font-semibold">Basic Tasks</h2>
      <p className="text-gray-600">
        Simple synchronous and asynchronous tasks demonstrating core functionality.
      </p>

      {/* Square Task */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Square</h3>
        <p className="text-gray-600 text-sm mb-4">Compute the square of a number</p>
        <div className="flex gap-3">
          <input
            type="number"
            value={squareInput}
            onChange={(e) => setSquareInput(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
            placeholder="Enter a number"
          />
          <button
            onClick={() => handleTask(() => runSquare(parseInt(squareInput)))}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Run Task
          </button>
        </div>
      </div>

      {/* Cube Task */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Cube (Async)</h3>
        <p className="text-gray-600 text-sm mb-4">Compute the cube of a number (async task)</p>
        <div className="flex gap-3">
          <input
            type="number"
            value={cubeInput}
            onChange={(e) => setCubeInput(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
            placeholder="Enter a number"
          />
          <button
            onClick={() => handleTask(() => runCube(parseInt(cubeInput)))}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Run Task
          </button>
        </div>
      </div>

      {/* Greet Task */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Greet</h3>
        <p className="text-gray-600 text-sm mb-4">Generate a greeting message</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={greetInput}
            onChange={(e) => setGreetInput(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
            placeholder="Enter a name"
          />
          <button
            onClick={() => handleTask(() => runGreet(greetInput))}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Run Task
          </button>
        </div>
      </div>

      {/* Add Numbers Task */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Add Numbers (With Retry)</h3>
        <p className="text-gray-600 text-sm mb-4">Add two numbers with retry configuration</p>
        <div className="flex gap-3">
          <input
            type="number"
            value={addA}
            onChange={(e) => setAddA(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
            placeholder="First number"
          />
          <input
            type="number"
            value={addB}
            onChange={(e) => setAddB(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
            placeholder="Second number"
          />
          <button
            onClick={() => handleTask(() => runAddNumbers(parseInt(addA), parseInt(addB)))}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Run Task
          </button>
        </div>
      </div>

      {/* Multiply Task */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Multiply</h3>
        <p className="text-gray-600 text-sm mb-4">Multiply two numbers</p>
        <div className="flex gap-3">
          <input
            type="number"
            value={mulA}
            onChange={(e) => setMulA(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
            placeholder="First number"
          />
          <input
            type="number"
            value={mulB}
            onChange={(e) => setMulB(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
            placeholder="Second number"
          />
          <button
            onClick={() => handleTask(() => runMultiply(parseInt(mulA), parseInt(mulB)))}
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
