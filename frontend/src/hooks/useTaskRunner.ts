import { useTaskExecution } from '../contexts/TaskExecutionContext'
import { getTaskStatus } from '../services/api'

const FAST_POLL_INTERVAL = 250
const STEADY_POLL_INTERVAL = 1000
const FAST_POLL_WINDOW_MS = 3000

export function useTaskRunner() {
  const { addTask, completeTask, failTask, updateTask } = useTaskExecution()

  const runTask = async (
    taskName: string,
    taskFn: () => Promise<any>,
    inputs?: Record<string, any>
  ) => {
    const taskId = addTask(taskName, inputs)
    try {
      const response = await taskFn()
      const data = response.data

      // Update immediately so the dashboard link is visible while running
      updateTask(taskId, { result: data })

      if (data.status === 'failed') {
        failTask(taskId, data.message || 'Task failed', data)
        return
      }

      if (data.status === 'completed') {
        completeTask(taskId, data)
        return
      }

      // Task is running — poll until terminal state
      await pollUntilDone(taskId, data.task_run_id)
    } catch (err: any) {
      failTask(taskId, err.response?.data?.detail || err.message)
    }
  }

  const pollUntilDone = async (taskId: string, taskRunId: string) => {
    const startedAt = Date.now()
    while (true) {
      const elapsedMs = Date.now() - startedAt
      const pollInterval = elapsedMs < FAST_POLL_WINDOW_MS
        ? FAST_POLL_INTERVAL
        : STEADY_POLL_INTERVAL

      await new Promise(r => setTimeout(r, pollInterval))
      try {
        const res = await getTaskStatus(taskRunId)
        const data = res.data

        if (data.status === 'completed') {
          completeTask(taskId, data)
          return
        }
        if (data.status === 'failed') {
          failTask(taskId, data.message || 'Task failed', data)
          return
        }
        // Still running — update result in case fields changed
        updateTask(taskId, { result: data })
      } catch {
        failTask(taskId, 'Lost connection while polling task status')
        return
      }
    }
  }

  return { runTask }
}
