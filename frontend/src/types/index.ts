export interface TaskResponse {
  task_run_id: string
  status: string
  message: string
  result?: any
}

export interface ErrorResponse {
  error: string
  detail?: string
}
