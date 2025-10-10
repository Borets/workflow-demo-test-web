import { createContext, useContext, useState, ReactNode } from 'react'
import type { TaskResponse } from '../types'

export interface TaskExecution {
  id: string
  name: string
  status: 'running' | 'completed' | 'error'
  startTime: Date
  endTime?: Date
  result?: TaskResponse
  error?: string
  inputs?: Record<string, any>
}

interface TaskExecutionContextType {
  tasks: TaskExecution[]
  addTask: (name: string, inputs?: Record<string, any>) => string
  updateTask: (id: string, update: Partial<TaskExecution>) => void
  completeTask: (id: string, result: TaskResponse) => void
  failTask: (id: string, error: string) => void
  clearTasks: () => void
}

const TaskExecutionContext = createContext<TaskExecutionContextType | undefined>(undefined)

export function TaskExecutionProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<TaskExecution[]>([])

  const addTask = (name: string, inputs?: Record<string, any>): string => {
    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newTask: TaskExecution = {
      id,
      name,
      status: 'running',
      startTime: new Date(),
      inputs,
    }
    setTasks(prev => [newTask, ...prev])
    return id
  }

  const updateTask = (id: string, update: Partial<TaskExecution>) => {
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, ...update } : task))
    )
  }

  const completeTask = (id: string, result: TaskResponse) => {
    updateTask(id, {
      status: 'completed',
      endTime: new Date(),
      result,
    })
  }

  const failTask = (id: string, error: string) => {
    updateTask(id, {
      status: 'error',
      endTime: new Date(),
      error,
    })
  }

  const clearTasks = () => {
    setTasks([])
  }

  return (
    <TaskExecutionContext.Provider
      value={{ tasks, addTask, updateTask, completeTask, failTask, clearTasks }}
    >
      {children}
    </TaskExecutionContext.Provider>
  )
}

export function useTaskExecution() {
  const context = useContext(TaskExecutionContext)
  if (!context) {
    throw new Error('useTaskExecution must be used within TaskExecutionProvider')
  }
  return context
}

