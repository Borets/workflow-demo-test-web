import type { TaskResponse } from '../types'

interface TaskResultProps {
  result: TaskResponse | null
  error?: string | null
}

export default function TaskResult({ result, error }: TaskResultProps) {
  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!result) {
    return null
  }

  return (
    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-lg font-semibold text-green-800 mb-2">Result</h3>
      <div className="space-y-2">
        <div>
          <span className="font-medium">Task Run ID:</span>{' '}
          <span className="font-mono text-sm">{result.task_run_id}</span>
        </div>
        <div>
          <span className="font-medium">Status:</span>{' '}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {result.status}
          </span>
        </div>
        <div>
          <span className="font-medium">Message:</span> {result.message}
        </div>
        {result.result !== undefined && (
          <div>
            <span className="font-medium">Output:</span>
            <pre className="mt-2 p-3 bg-gray-800 text-gray-100 rounded overflow-x-auto">
              {JSON.stringify(result.result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
