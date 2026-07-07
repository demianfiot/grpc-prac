import type { User, Task, CreateUserRequest, CreateTaskRequest, AssignTaskRequest } from '../types'

const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  users: {
    list: (params?: { search?: string; sort_by?: string; sort_order?: string }) => {
      const q = new URLSearchParams()
      if (params?.search) q.set('search', params.search)
      if (params?.sort_by) q.set('sort_by', params.sort_by)
      if (params?.sort_order) q.set('sort_order', params.sort_order)
      const s = q.toString()
      return request<User[]>(`/users${s ? '?' + s : ''}`)
    },
    get: (id: number) => request<User>(`/users/${id}`),
    create: (data: CreateUserRequest) =>
      request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
    tasks: (id: number) => request<Task[]>(`/users/${id}/tasks`),
  },
  tasks: {
    list: (params?: { sort_by?: string; sort_order?: string }) => {
      const q = new URLSearchParams()
      if (params?.sort_by) q.set('sort_by', params.sort_by)
      if (params?.sort_order) q.set('sort_order', params.sort_order)
      const s = q.toString()
      return request<Task[]>(`/tasks${s ? '?' + s : ''}`)
    },
    get: (id: number) => request<Task>(`/tasks/${id}`),
    create: (data: CreateTaskRequest) =>
      request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    assign: (id: number, data: AssignTaskRequest) =>
      request<Task>(`/tasks/${id}/assign`, { method: 'POST', body: JSON.stringify(data) }),
    complete: (id: number) =>
      request<Task>(`/tasks/${id}/complete`, { method: 'POST' }),
  },
}
