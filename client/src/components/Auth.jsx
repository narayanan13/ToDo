import React, { useState } from 'react';
import styles from './Auth.module.css';

function SignInForm({ email, setEmail, password, setPassword, handleAuth, error }) {
  return (
    <form onSubmit={handleAuth} className="w-full flex flex-col gap-3">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className={styles.inputBox}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className={styles.inputBox}
        required
      />
      <div className="text-xs text-gray-400 text-left pl-1">Forgot your password?</div>
      <button
        className="w-full py-2 bg-blue-500 text-white font-bold rounded-lg shadow hover:bg-blue-600 transition"
        type="submit"
      >
        SIGN IN
      </button>
      {error && <div className="text-center text-red-500 font-semibold">{error}</div>}
    </form>
  );
}

function SignUpForm({ email, setEmail, password, setPassword, handleAuth, error, setMode }) {
  return (
    <form onSubmit={handleAuth} className="w-full flex flex-col gap-3">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className={styles.inputBox}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className={styles.inputBox}
        required
      />
      <button
        className="w-full py-2 bg-blue-500 text-white font-bold rounded-lg shadow hover:bg-blue-600 transition"
        type="submit"
      >
        SIGN UP
      </button>
      <button
        className="w-full py-2 mt-2 border-2 border-blue-500 text-blue-500 font-bold rounded-lg hover:bg-blue-50 transition"
        type="button"
        onClick={() => setMode('signin')}
      >
        Back to Sign In
      </button>
      {error && <div className="text-center text-red-500 font-semibold">{error}</div>}
    </form>
  );
}

export default function Auth({ setUser, setToken }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = mode === 'signup' ? '/signup' : '/signin';
    try {
      const res = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auth failed');
      setUser(data.user);
      setToken(data.token);
      // Redirect to dashboard or wherever you want
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        {/* Sign In Panel */}
        <div className={styles.authPanel}>
          <h2 className="text-3xl font-bold mb-2 text-gray-800">Sign in</h2>
          <div className={styles.socialIcons}>
            <button className={styles.socialIconBtn}>
              <span className="material-icons">lock</span>
            </button>
            <button className={styles.socialIconBtn}>
              <span className="material-icons">account_circle</span>
            </button>
            <button className={styles.socialIconBtn}>
              <span className="material-icons">g_translate</span>
            </button>
          </div>
          <div className="text-gray-400 text-xs mb-2">Or sign in using E-Mail Address</div>
          {mode === 'signin' ? (
            <SignInForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleAuth={handleAuth}
              error={error}
            />
          ) : (
            <button
              className="px-8 py-2 border-2 border-blue-500 text-blue-500 font-bold rounded-full hover:bg-blue-50 transition mt-8"
              onClick={() => setMode('signin')}
              type="button"
            >
              Back to Sign In
            </button>
          )}
        </div>
        {/* Sign Up Panel */}
        <div className={`${styles.authPanel} ${styles.authPanelBlue}`}>
          <h2 className="text-3xl font-bold mb-2">Create,<br />Account!</h2>
          <div className="mb-4 text-center text-white/90">
            Sign up if you still don't have an account ...
          </div>
          <button
            className="px-8 py-2 border-2 border-white rounded-full font-bold hover:bg-white hover:text-blue-500 transition"
            onClick={() => setMode('signup')}
            type="button"
          >
            SIGN UP
          </button>
          {/* Overlay to switch to sign up mode */}
          {mode === 'signup' && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col justify-center items-center z-10 transition p-8 rounded-2xl gap-4">
              <h2 className="text-3xl font-bold mb-4 text-blue-500">Sign Up</h2>
              <SignUpForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                handleAuth={handleAuth}
                error={error}
                setMode={setMode}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
