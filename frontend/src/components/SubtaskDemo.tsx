import { useState } from 'react'
import { runAddSquares, runCalculateArea } from '../services/api'
import { useTaskRunner } from '../hooks/useTaskRunner'

export default function SubtaskDemo() {
  const { runTask } = useTaskRunner()

  // Form states
  const [addA, setAddA] = useState('3')
  const [addB, setAddB] = useState('4')
  const [length, setLength] = useState('5')
  const [width, setWidth] = useState('3')

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
            onClick={() => runTask(
              'Add Squares',
              () => runAddSquares(parseInt(addA), parseInt(addB)),
              { a: parseInt(addA), b: parseInt(addB) }
            )}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
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
            onClick={() => runTask(
              'Calculate Area',
              () => runCalculateArea(parseInt(length), parseInt(width)),
              { length: parseInt(length), width: parseInt(width) }
            )}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
          >
            Run Task
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          ℹ️ Run multiple subtask workflows concurrently! Check the sidebar to see how each task calls its subtasks.
        </p>
      </div>
    </div>
  )
}
