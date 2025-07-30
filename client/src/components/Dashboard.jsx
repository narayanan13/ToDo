import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

export default function Dashboard({ user, token, setUser, setToken }) {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [todoTitle, setTodoTitle] = useState('');
  const [reminderText, setReminderText] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:4000/dashboard?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setDashboard(data))
        .catch(err => setError(err.message));
    }
  }, [user]);

  const handleSignOut = () => {
    setUser(null);
    setToken && setToken(null);
    setDashboard(null);
    navigate('/login');
  };

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
    console.log('[ADD REMINDER] Request:', { reminderText, reminderDate, userId: user.id }); // Log incoming request
    try {
      const res = await fetch('http://localhost:4000/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reminderText, dueDate: reminderDate, userId: user.id })
      });
      if (!res.ok) throw new Error('Failed to add reminder');
      setReminderText('');
      setReminderDate('');
      // Refresh dashboard stats
      fetch(`http://localhost:4000/dashboard?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setDashboard(data));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Dashboard</h2>
        </div>
        <div className={styles.welcome}>
          Welcome, <span className={styles.email}>{user.email}</span>!
        </div>
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
        {dashboard ? (
          <>
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
            <button className={styles.button} onClick={handleSignOut}>
              Sign Out
            </button>
          </>
        ) : (
          <div className={styles.loading}>Loading dashboard...</div>
        )}
        {error && (
          <div className={styles.error}>{error}</div>
        )}
      </div>
    </div>
  );
}
