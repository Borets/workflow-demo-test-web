import { useTaskExecution } from '../contexts/TaskExecutionContext'
import type { TaskExecution } from '../contexts/TaskExecutionContext'

export default function TaskSidebar() {
  const { tasks, clearTasks } = useTaskExecution()

  const runningCount = tasks.filter(t => t.status === 'running').length
  const completedCount = tasks.filter(t => t.status === 'completed').length
  const errorCount = tasks.filter(t => t.status === 'error').length

  const getStatusIcon = (status: TaskExecution['status']) => {
    switch (status) {
      case 'running':
        return (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
        )
      case 'completed':
        return (
          <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      case 'error':
        return (
          <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const getStatusColor = (status: TaskExecution['status']) => {
    switch (status) {
      case 'running': return 'bg-blue-50 border-blue-200'
      case 'completed': return 'bg-green-50 border-green-200'
      case 'error': return 'bg-red-50 border-red-200'
    }
  }

  const formatDuration = (task: TaskExecution) => {
    if (!task.endTime) return 'Running...'
    const duration = task.endTime.getTime() - task.startTime.getTime()
    return `${(duration / 1000).toFixed(2)}s`
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 border-l border-gray-200">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Task Executions</h2>
          {tasks.length > 0 && (
            <button
              onClick={clearTasks}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
            >
              Clear All
            </button>
          )}
        </div>
        
        {/* Stats */}
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-600">{runningCount} Running</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-600">{completedCount} Done</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-600">{errorCount} Failed</span>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No tasks executed yet
          </div>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              className={`border rounded-lg p-3 ${getStatusColor(task.status)} transition-all`}
            >
              {/* Task Header */}
              <div className="flex items-start gap-2 mb-2">
                <div className="mt-0.5">{getStatusIcon(task.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {task.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDuration(task)}
                  </div>
                </div>
              </div>

              {/* Inputs */}
              {task.inputs && Object.keys(task.inputs).length > 0 && (
                <div className="mb-2 text-xs">
                  <div className="text-gray-600 font-medium mb-1">Inputs:</div>
                  <div className="bg-white bg-opacity-50 rounded p-2 font-mono">
                    {JSON.stringify(task.inputs, null, 2)}
                  </div>
                </div>
              )}

              {/* Result */}
              {task.status === 'completed' && task.result && (
                <div className="text-xs">
                  <div className="text-gray-600 font-medium mb-1">Result:</div>
                  <div className="bg-white bg-opacity-50 rounded p-2 font-mono max-h-32 overflow-y-auto">
                    {JSON.stringify(task.result.result, null, 2)}
                  </div>
                </div>
              )}

              {/* Error */}
              {task.status === 'error' && task.error && (
                <div className="text-xs">
                  <div className="text-red-700 font-medium mb-1">Error:</div>
                  <div className="bg-white bg-opacity-50 rounded p-2 text-red-600">
                    {task.error}
                  </div>
                </div>
              )}

              {/* Task Run ID */}
              {task.result?.task_run_id && (
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                  <span className="text-gray-500">ID:</span>{' '}
                  <span className="font-mono text-gray-700">
                    {task.result.task_run_id.substring(0, 12)}...
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

