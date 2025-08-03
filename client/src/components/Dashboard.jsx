import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

export default function Dashboard({ user, token, setUser, setToken }) {
  const [dashboard, setDashboard] = useState(null);
  const [todos, setTodos] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [error, setError] = useState('');
  const [todoTitle, setTodoTitle] = useState('');
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [reminderText, setReminderText] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const navigate = useNavigate();

  // Fetch dashboard stats, todos, and reminders
  useEffect(() => {
    if (user) {
      fetch(`http://localhost:4000/dashboard?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setDashboard(data))
        .catch(err => setError(err.message));
      fetch(`http://localhost:4000/todos`)
        .then(res => res.json())
        .then(data => setTodos(data.filter(todo => todo.userId === user.id)))
        .catch(err => setError(err.message));
      fetch(`http://localhost:4000/reminders?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setReminders(data))
        .catch(err => setError(err.message));
    }
  }, [user]);

  // Add new todo
  const handleAddTodo = async (e) => {
    e.preventDefault();
    setError('');
    if (!todoTitle.trim()) return;
    try {
      const res = await fetch('http://localhost:4000/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: todoTitle, userId: user.id })
      });
      if (!res.ok) throw new Error('Failed to add todo');
      setTodoTitle('');
      // Refresh todos
      fetch(`http://localhost:4000/todos`)
        .then(res => res.json())
        .then(data => setTodos(data.filter(todo => todo.userId === user.id)));
      // Refresh dashboard stats
      fetch(`http://localhost:4000/dashboard?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setDashboard(data));
    } catch (err) {
      setError(err.message);
    }
  };

  // Edit todo
  const handleEditTodo = (todo) => {
    setEditingTodoId(todo.id);
    setEditingTitle(todo.title);
  };

  const handleSaveTodo = async (todoId) => {
    setError('');
    try {
      const res = await fetch(`http://localhost:4000/todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingTitle })
      });
      if (!res.ok) throw new Error('Failed to update todo');
      setEditingTodoId(null);
      setEditingTitle('');
      // Refresh todos
      fetch(`http://localhost:4000/todos`)
        .then(res => res.json())
        .then(data => setTodos(data.filter(todo => todo.userId === user.id)));
    } catch (err) {
      setError(err.message);
    }
  };

  // Toggle todo completed
  const handleToggleCompleted = async (todo) => {
    setError('');
    try {
      const res = await fetch(`http://localhost:4000/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      });
      if (!res.ok) throw new Error('Failed to update todo');
      // Refresh todos
      fetch(`http://localhost:4000/todos`)
        .then(res => res.json())
        .then(data => setTodos(data.filter(t => t.userId === user.id)));
      // Refresh dashboard stats
      fetch(`http://localhost:4000/dashboard?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setDashboard(data));
    } catch (err) {
      setError(err.message);
    }
  };

  // Add new reminder
  const handleAddReminder = async (e) => {
    e.preventDefault();
    setError('');
    if (!reminderText.trim() || !reminderDate) return;
    try {
      const res = await fetch('http://localhost:4000/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reminderText, dueDate: reminderDate, userId: user.id })
      });
      if (!res.ok) throw new Error('Failed to add reminder');
      setReminderText('');
      setReminderDate('');
      // Refresh reminders
      fetch(`http://localhost:4000/reminders?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setReminders(data));
      // Refresh dashboard stats
      fetch(`http://localhost:4000/dashboard?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setDashboard(data));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setToken && setToken(null);
    setDashboard(null);
    navigate('/login');
  };

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>Menu</div>
        <button
          className={`${styles.sidebarTab} ${activeTab === 'todos' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('todos')}
        >
          Todos
        </button>
        <button
          className={`${styles.sidebarTab} ${activeTab === 'reminders' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('reminders')}
        >
          Reminders
        </button>
        <button className={styles.sidebarSignout} onClick={handleSignOut}>
          Sign Out
        </button>
      </aside>
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h2 className={styles.title}>Dashboard</h2>
        </div>
        <div className={styles.welcome}>
          Welcome, <span className={styles.email}>{user.email}</span>!
        </div>
        {activeTab === 'todos' && (
          <>
            {/* Add Todo Form */}
            <form className={styles.form} onSubmit={handleAddTodo}>
              <input
                type="text"
                placeholder="New Todo Title"
                value={todoTitle}
                onChange={e => setTodoTitle(e.target.value)}
                className={styles.input}
              />
              <button className={styles.addButton} type="submit">Add Todo</button>
            </form>
            {/* Todo List */}
            <div className={styles.todoList}>
              <h3 className={styles.todoListTitle}>Your Todos</h3>
              {todos.length === 0 ? (
                <div className={styles.loading}>No todos yet.</div>
              ) : (
                todos.map(todo => (
                  <div key={todo.id} className={styles.todoItem}>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleCompleted(todo)}
                      className={styles.todoCheckbox}
                    />
                    {editingTodoId === todo.id ? (
                      <>
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={e => setEditingTitle(e.target.value)}
                          className={styles.input}
                        />
                        <button className={styles.addButton} onClick={() => handleSaveTodo(todo.id)}>Save</button>
                        <button className={styles.addButton} onClick={() => setEditingTodoId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <span className={todo.completed ? styles.todoCompleted : ''}>{todo.title}</span>
                        <button className={styles.addButton} onClick={() => handleEditTodo(todo)}>Edit</button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
        {activeTab === 'reminders' && (
          <>
            {/* Add Reminder Form */}
            <form className={styles.form} onSubmit={handleAddReminder}>
              <input
                type="text"
                placeholder="Reminder message"
                value={reminderText}
                onChange={e => setReminderText(e.target.value)}
                className={styles.input}
              />
              <input
                type="date"
                value={reminderDate}
                onChange={e => setReminderDate(e.target.value)}
                className={styles.input}
              />
              <button className={styles.addButton} type="submit">Add Reminder</button>
            </form>
            {/* Reminder List */}
            <div className={styles.todoList}>
              <h3 className={styles.todoListTitle}>Your Reminders</h3>
              {reminders.length === 0 ? (
                <div className={styles.loading}>No reminders yet.</div>
              ) : (
                reminders.map(reminder => (
                  <div key={reminder.id} className={styles.todoItem}>
                    <span>{reminder.message}</span>
                    <span style={{ marginLeft: 'auto', color: '#888', fontSize: '0.95em' }}>
                      {new Date(reminder.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
        {dashboard && (
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Active Todos</span>
              <span className={styles.statValue}>{dashboard.activeTodos}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Total Reminders</span>
              <span className={`${styles.statValue} ${styles.statValuePurple}`}>{dashboard.reminders}</span>
            </div>
          </div>
        )}
        {error && (
          <div className={styles.error}>{error}</div>
        )}
      </main>
    </div>
  );
}