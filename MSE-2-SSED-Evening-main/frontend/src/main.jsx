import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const API = '/api';
function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [auth, setAuth] = useState({ name: '', email: '', password: '' });
  const [mode, setMode] = useState('login');
  const [message, setMessage] = useState('');
  const [cacheSource, setCacheSource] = useState('');

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  async function loadTasks() {
    try {
      const data = await request('/tasks');
      setTasks(data.tasks);
      setCacheSource(data.source);
    } catch (error) { setMessage(error.message); }
  }

  useEffect(() => { if (token) loadTasks(); }, [token]);

  async function authenticate(event) {
    event.preventDefault();
    try {
      const data = await request(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(auth) });
      if (mode === 'register') {
        setMessage('Account created. Please log in.');
        setMode('login');
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token); setUser(data.user); setMessage('');
      }
    } catch (error) { setMessage(error.message); }
  }

  async function addTask(event) {
    event.preventDefault();
    try {
      await request('/tasks', { method: 'POST', body: JSON.stringify(form) });
      setForm({ title: '', description: '' }); await loadTasks();
    } catch (error) { setMessage(error.message); }
  }

  async function updateStatus(task, status) {
    try { await request(`/tasks/${task.id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); await loadTasks(); }
    catch (error) { setMessage(error.message); }
  }

  async function deleteTask(id) {
    try { await request(`/tasks/${id}`, { method: 'DELETE' }); await loadTasks(); }
    catch (error) { setMessage(error.message); }
  }

  function logout() {
    localStorage.removeItem('token'); localStorage.removeItem('user');
    setToken(''); setUser(null); setTasks([]);
  }

  if (!token) return <main className="auth-shell">
    <section className="auth-card">
      <div className="brand-mark">T</div><p className="eyebrow">DOCKER HANDS-ON PROJECT</p>
      <h1>TaskFlow</h1><p className="muted">A simple space to organize your work.</p>
      <form onSubmit={authenticate}>
        {mode === 'register' && <label>Name<input required value={auth.name} onChange={e => setAuth({ ...auth, name: e.target.value })} /></label>}
        <label>Email<input type="email" required value={auth.email} onChange={e => setAuth({ ...auth, email: e.target.value })} /></label>
        <label>Password<input type="password" minLength="6" required value={auth.password} onChange={e => setAuth({ ...auth, password: e.target.value })} /></label>
        <button>{mode === 'login' ? 'Log in' : 'Create account'}</button>
      </form>
      <p className="switch">{mode === 'login' ? 'New here?' : 'Already registered?'} <button className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Create an account' : 'Log in'}</button></p>
      {message && <p className="notice">{message}</p>}
    </section>
  </main>;

  return <main className="app-shell">
    <header><div><div className="brand"><span className="brand-mark small">T</span><strong>TaskFlow</strong></div><p className="muted">Your work, in a clearer flow.</p></div><div className="profile"><span>{user?.name || 'Student'}</span><button className="outline" onClick={logout}>Log out</button></div></header>
    <section className="welcome"><div><p className="eyebrow">YOUR WORKSPACE</p><h1>Good to see you, {user?.name || 'there'}.</h1><p className="muted">Capture a task and keep moving forward.</p></div><div className="count"><strong>{tasks.length}</strong><span>total tasks</span></div></section>
    <section className="panel">
      <h2>Add a task</h2>
      <form className="task-form" onSubmit={addTask}>
        <input placeholder="What needs to get done?" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Short description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <button>Add task</button>
      </form>
    </section>
    <section className="task-section">
      <div className="section-heading"><div><h2>Your tasks</h2><p className="muted">Update status or remove completed work.</p></div><button className="outline" onClick={loadTasks}>Refresh</button></div>
      {cacheSource && <p className="cache-label">Last response source: <b>{cacheSource}</b></p>}
      {tasks.length === 0 ? <div className="empty">No tasks yet. Add your first task above.</div> : <div className="task-list">{tasks.map(task => <article className="task" key={task.id}>
        <div className="task-info"><h3>{task.title}</h3><p>{task.description || 'No description'}</p><small>Task #{task.id}</small></div>
        <div className="task-actions"><select value={task.status} onChange={e => updateStatus(task, e.target.value)}><option>Pending</option><option>In Progress</option><option>Completed</option></select><button className="delete" onClick={() => deleteTask(task.id)}>Delete</button></div>
      </article>)}</div>}
    </section>
    {message && <p className="notice">{message}</p>}
    <footer>TaskFlow · React + Express + PostgreSQL + Redis</footer>
  </main>;
}
createRoot(document.getElementById('root')).render(<App />);
