export interface User {
  Id: number
  Name: string
  Level: number
  Xp: number
  CompletedTasks: number
}

export interface Task {
  Id: number
  Title: string
  Difficulty: string
  XpReward: number
  AssignedUserId: number
  Completed: boolean
}

export interface CreateUserRequest {
  name: string
}

export interface CreateTaskRequest {
  title: string
  difficulty: string
  xp_reward: number
}

export interface AssignTaskRequest {
  user_id: number
}
