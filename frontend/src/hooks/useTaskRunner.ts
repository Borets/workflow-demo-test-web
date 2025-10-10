import { useTaskExecution } from '../contexts/TaskExecutionContext'

export function useTaskRunner() {
  const { addTask, completeTask, failTask } = useTaskExecution()

  const runTask = async (
    taskName: string,
    taskFn: () => Promise<any>,
    inputs?: Record<string, any>
  ) => {
    const taskId = addTask(taskName, inputs)
    try {
      const response = await taskFn()
      completeTask(taskId, response.data)
    } catch (err: any) {
      failTask(taskId, err.response?.data?.detail || err.message)
    }
  }

  return { runTask }
}

