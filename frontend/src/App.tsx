import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Users from './pages/Users'
import Tasks from './pages/Tasks'
import UserDetail from './pages/UserDetail'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <nav className="nav">
        <div className="nav-inner">
          <span className="nav-brand">Task Manager</span>
          <div className="nav-links">
            <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Users
            </NavLink>
            <NavLink to="/tasks" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Tasks
            </NavLink>
          </div>
        </div>
      </nav>
      <main className="main">
        <Routes>
          <Route path="/" element={<Users />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/tasks" element={<Tasks />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
