import { useEffect, useState, useCallback } from 'react'
import { api } from '../api'
import type { Task, User } from '../types'

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState('easy')
  const [xpReward, setXpReward] = useState(10)
  const [creating, setCreating] = useState(false)

  const [sortBy, setSortBy] = useState('completed')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC')

  const [assignUserId, setAssignUserId] = useState<Record<number, number>>({})

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [ts, us] = await Promise.all([
        api.tasks.list({ sort_by: sortBy, sort_order: sortOrder }),
        api.users.list(),
      ])
      setTasks(ts)
      setUsers(us)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [sortBy, sortOrder])

  useEffect(() => { load() }, [load])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setCreating(true)
    setError('')
    setSuccess('')
    try {
      await api.tasks.create({ title: title.trim(), difficulty, xp_reward: xpReward })
      setTitle('')
      setDifficulty('easy')
      setXpReward(10)
      setSuccess('Task created')
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  const assign = async (taskId: number) => {
    const userId = assignUserId[taskId]
    if (!userId) return
    setError('')
    setSuccess('')
    try {
      await api.tasks.assign(taskId, { user_id: userId })
      setSuccess('Task assigned')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const complete = async (taskId: number) => {
    setError('')
    setSuccess('')
    try {
      await api.tasks.complete(taskId)
      setSuccess('Task completed! XP awarded.')
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const userName = (id: number) => users.find(u => u.Id === id)?.Name ?? '—'

  const diffBadge = (d: string) => {
    const cls = d === 'easy' ? 'badge-easy' : d === 'hard' ? 'badge-hard' : 'badge-medium'
    return <span className={`badge ${cls}`}>{d}</span>
  }

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortBy(field)
      setSortOrder('DESC')
    }
  }

  const sortArrow = (field: string) => {
    if (sortBy !== field) return ''
    return sortOrder === 'ASC' ? ' \u25B2' : ' \u25BC'
  }

  const th = (label: string, field: string) => (
    <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort(field)}>
      {label}{sortArrow(field)}
    </th>
  )

  const doneCount = tasks.filter(t => t.Completed).length
  const pendingCount = tasks.length - doneCount

  return (
    <div>
      <div className="page-header">
        <h1>Tasks</h1>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h2>New Task</h2></div>
        <form onSubmit={create}>
          <div className="form-row">
            <input
              className="input"
              placeholder="Task title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ flex: 1, minWidth: 200 }}
            />
            <select className="select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <input
              className="input"
              type="number"
              placeholder="XP reward"
              value={xpReward}
              onChange={e => setXpReward(Number(e.target.value))}
              style={{ width: 100 }}
              min={1}
            />
            <button className="btn btn-primary" type="submit" disabled={creating || !title.trim()}>
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        {loading && !tasks.length ? (
          <div className="loading">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="empty">No tasks yet</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {th('ID', 'id')}
                  {th('Title', 'title')}
                  {th('Difficulty', 'difficulty')}
                  {th('XP', 'xp_reward')}
                  {th('Assigned To', 'assigned_user_id')}
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingCount > 0 && (
                  <tr className="section-row"><td colSpan={7}>Pending ({pendingCount})</td></tr>
                )}
                {tasks.filter(t => !t.Completed).map(t => (
                  <tr key={t.Id}>
                    <td>{t.Id}</td>
                    <td>{t.Title}</td>
                    <td>{diffBadge(t.Difficulty)}</td>
                    <td>{t.XpReward}</td>
                    <td>{userName(t.AssignedUserId)}</td>
                    <td>
                      <span className="badge badge-pending">Pending</span>
                    </td>
                    <td>
                      <div className="flex flex-wrap">
                        {!t.AssignedUserId && (
                          <div className="flex">
                            <select
                              className="select"
                              style={{ fontSize: 13, padding: '4px 10px' }}
                              value={assignUserId[t.Id] || ''}
                              onChange={e => setAssignUserId(prev => ({ ...prev, [t.Id]: Number(e.target.value) }))}
                            >
                              <option value="">User...</option>
                              {users.map(u => (
                                <option key={u.Id} value={u.Id}>{u.Name}</option>
                              ))}
                            </select>
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => assign(t.Id)}
                              disabled={!assignUserId[t.Id]}
                            >
                              Assign
                            </button>
                          </div>
                        )}
                        {t.AssignedUserId > 0 && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => complete(t.Id)}
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {doneCount > 0 && (
                  <tr className="section-row"><td colSpan={7}>Completed ({doneCount})</td></tr>
                )}
                {tasks.filter(t => t.Completed).map(t => (
                  <tr key={t.Id} className="row-done">
                    <td>{t.Id}</td>
                    <td>{t.Title}</td>
                    <td>{diffBadge(t.Difficulty)}</td>
                    <td>{t.XpReward}</td>
                    <td>{userName(t.AssignedUserId)}</td>
                    <td>
                      <span className="badge badge-done">Done</span>
                    </td>
                    <td>—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
