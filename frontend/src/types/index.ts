export interface TaskResponse {
  task_run_id: string
  workflow_id?: string
  status: string
  message: string
  result?: any
}

export interface ErrorResponse {
  error: string
  detail?: string
}
