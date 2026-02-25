import { useState } from 'react'
import { runComputeMultiple, runSumOfSquares, runDeepParallelTree } from '../services/api'
import { useTaskRunner } from '../hooks/useTaskRunner'

export default function ParallelDemo() {
  const { runTask } = useTaskRunner()

  // Form states
  const [computeNumbers, setComputeNumbers] = useState('2, 3, 4')
  const [sumNumbers, setSumNumbers] = useState('1, 2, 3, 4')
  const [treeNumbers, setTreeNumbers] = useState('1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12')
  const [chunkSize, setChunkSize] = useState('4')

  const parseNumbers = (input: string): number[] => {
    return input.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))
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
            onClick={() => runTask(
              'Compute Multiple',
              () => runComputeMultiple(parseNumbers(computeNumbers)),
              { numbers: parseNumbers(computeNumbers) }
            )}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
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
            onClick={() => runTask(
              'Sum of Squares',
              () => runSumOfSquares(parseNumbers(sumNumbers)),
              { numbers: parseNumbers(sumNumbers) }
            )}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
          >
            Run Task
          </button>
        </div>
      </div>

      {/* Deep Parallel Tree Task */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Deep Parallel Tree</h3>
        <p className="text-gray-600 text-sm mb-4">
          A 10+ level deep, 100+ subtask parallel tree with scatter/gather, cross-reduce, and recursive fan-in phases
        </p>
        <div className="bg-gray-50 p-3 rounded mb-4 text-sm">
          <strong>Workflow (12 levels):</strong>
          <ul className="list-disc ml-5 mt-1 space-y-0.5">
            <li>L0: Root orchestrator</li>
            <li>L1: Scatter into chunks</li>
            <li>L2-L5: Per-chunk parallel square, cube, combine</li>
            <li>L6-L8: Cross-reduce with pair add &amp; multiply</li>
            <li>L9-L11: Recursive halve-and-sum fan-in</li>
            <li>L12: Finalize results</li>
          </ul>
          <p className="mt-2">With 12 numbers and chunk_size=4, this spawns ~120 subtasks.</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={treeNumbers}
            onChange={(e) => setTreeNumbers(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
            placeholder="Enter numbers (comma-separated, 12+ recommended)"
          />
          <input
            type="number"
            value={chunkSize}
            onChange={(e) => setChunkSize(e.target.value)}
            className="border rounded px-3 py-2 w-24"
            placeholder="Chunk size"
            min="1"
          />
          <button
            onClick={() => runTask(
              'Deep Parallel Tree',
              () => runDeepParallelTree(
                parseNumbers(treeNumbers),
                parseInt(chunkSize) || undefined
              ),
              { numbers: parseNumbers(treeNumbers), chunk_size: parseInt(chunkSize) || 4 }
            )}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
          >
            Run Task
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          ℹ️ Parallel workflows run multiple internal subtasks concurrently! Watch the sidebar to see execution in real-time.
        </p>
      </div>
    </div>
  )
}
