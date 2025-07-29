import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ user, token, setUser, setToken }) {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
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
    setToken(null);
    setDashboard(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="bg-white/90 p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-700 tracking-tight drop-shadow">Dashboard</h2>
        {dashboard ? (
          <>
            <div className="mb-6 text-lg text-gray-700 text-center">Welcome, <span className="font-bold text-blue-600">{user.email}</span>!</div>
            <div className="mb-4 flex justify-between items-center bg-blue-50 rounded-lg px-4 py-3 shadow">
              <span className="text-gray-700 font-medium">Total Active Todos</span>
              <span className="text-2xl font-bold text-blue-700">{dashboard.activeTodos}</span>
            </div>
            <div className="mb-4 flex justify-between items-center bg-purple-50 rounded-lg px-4 py-3 shadow">
              <span className="text-gray-700 font-medium">Total Reminders</span>
              <span className="text-2xl font-bold text-purple-700">{dashboard.reminders}</span>
            </div>
            <button
              className="mt-6 w-full bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 py-3 rounded-lg font-semibold shadow hover:from-gray-400 hover:to-gray-500 transition"
              onClick={handleSignOut}
            >Sign Out</button>
          </>
        ) : (
          <div>Loading dashboard...</div>
        )}
        {error && <div className="mt-6 text-center text-red-500 font-semibold bg-red-50 rounded-lg py-2 px-4">{error}</div>}
      </div>
    </div>
  );
}
