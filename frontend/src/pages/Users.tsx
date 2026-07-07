import { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { User } from '../types'

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('xp')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')
  const searchRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setUsers(await api.users.list({ search, sort_by: sortBy, sort_order: sortOrder }))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [search, sortBy, sortOrder])

  useEffect(() => { load() }, [load])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    setError('')
    try {
      await api.users.create({ name: name.trim() })
      setName('')
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
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

  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h2>New User</h2></div>
        <form onSubmit={create}>
          <div className="form-row">
            <input
              className="input"
              placeholder="User name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ flex: 1, minWidth: 200 }}
            />
            <button className="btn btn-primary" type="submit" disabled={creating || !name.trim()}>
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        {loading && !users.length ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th colSpan={4} style={{ padding: '8px 16px', textTransform: 'none', letterSpacing: 0 }}>
                    <input
                      ref={searchRef}
                      className="input"
                      placeholder="Search by name..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </th>
                </tr>
                <tr>
                  {th('ID', 'id')}
                  {th('Name', 'name')}
                  {th('Level', 'level')}
                  {th('XP', 'xp')}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={4}><div className="empty">No users found</div></td></tr>
                ) : (
                  users.map(u => (
                    <tr key={u.Id}>
                      <td>{u.Id}</td>
                      <td>
                        <Link to={`/users/${u.Id}`} className="user-link">{u.Name}</Link>
                      </td>
                      <td>{u.Level}lvl({u.CompletedTasks}tasks)</td>
                      <td>{u.Xp}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
