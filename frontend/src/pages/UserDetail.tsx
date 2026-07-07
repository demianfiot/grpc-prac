import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import type { User, Task } from '../types'

export default function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const uid = Number(id)
      const [u, ts] = await Promise.all([
        api.users.get(uid),
        api.users.tasks(uid),
      ])
      setUser(u)
      setTasks(ts)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

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

  const maxXp = user ? Math.max(user.Xp, 100) * 1.5 : 100
  const xpPercent = user ? Math.min((user.Xp / maxXp) * 100, 100) : 0
  const initial = user?.Name?.charAt(0)?.toUpperCase() ?? '?'

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error-msg">{error}</div>
  if (!user) return <div className="empty">User not found</div>

  const diffBadge = (d: string) => {
    const cls = d === 'easy' ? 'badge-easy' : d === 'hard' ? 'badge-hard' : 'badge-medium'
    return <span className={`badge ${cls}`}>{d}</span>
  }

  return (
    <div>
      <Link to="/users" style={{ color: '#4a6cf7', fontSize: 14, textDecoration: 'none', marginBottom: 16, display: 'inline-block' }}>
        &larr; Back to Users
      </Link>

      {success && <div className="success-msg">{success}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="user-card">
          <div className="user-avatar">{initial}</div>
          <div className="user-info">
            <h2>{user.Name}</h2>
            <div className="user-meta">
              <span>{user.Level}lvl ({user.CompletedTasks}tasks)</span>
              <span>{user.Xp} XP</span>
            </div>
            <div className="xp-bar-wrap">
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
              </div>
              <div className="xp-label">{user.Xp} / {Math.round(maxXp)} XP</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2>Tasks ({tasks.length})</h2></div>
        {tasks.length === 0 ? (
          <div className="empty">No tasks assigned</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>XP Reward</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.Id}>
                    <td>{t.Id}</td>
                    <td>{t.Title}</td>
                    <td>{diffBadge(t.Difficulty)}</td>
                    <td>+{t.XpReward}</td>
                    <td>
                      <span className={`badge ${t.Completed ? 'badge-done' : 'badge-pending'}`}>
                        {t.Completed ? 'Done' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {!t.Completed && (
                        <button className="btn btn-success btn-sm" onClick={() => complete(t.Id)}>
                          Complete
                        </button>
                      )}
                    </td>
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
