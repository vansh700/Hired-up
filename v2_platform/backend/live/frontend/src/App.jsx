import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProblemSolve from './pages/ProblemSolve';
import AptitudeTest from './pages/AptitudeTest';
import AptitudeCategories from './pages/AptitudeCategories';
import TopicsPage from './pages/TopicsPage';
import Certificates from './pages/Certificates';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import TakeAssessment from './pages/TakeAssessment';
import './App.css';

const MAIN_API = 'http://localhost:5000';

function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem('hiredUpTheme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hiredUpTheme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      style={{
        position: 'fixed', bottom: '2rem', left: '2rem',
        width: '50px', height: '50px', borderRadius: '50%',
        backgroundColor: theme === 'light' ? '#ffffff' : '#282828',
        border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#3e3e3e'}`,
        color: theme === 'light' ? '#000000' : '#ffffff',
        fontSize: '1.5rem', display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer', zIndex: 9999,
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}
      title="Toggle Theme"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

/**
 * App-level auth guard — runs ONCE on mount, not per route.
 * Captures ?token from URL, syncs hiredUpUser from backend if missing.
 */
function App() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    async function initAuth() {
      // 1. Capture token from URL (passed by main platform via ?token=...)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      if (urlToken) {
        localStorage.setItem('hiredUpToken', urlToken);
        // Remove token from URL bar (clean URL)
        window.history.replaceState({}, '', window.location.pathname + window.location.hash);
      }

      const token = localStorage.getItem('hiredUpToken');

      // 2. No token at all → redirect to main platform login
      if (!token) {
        window.location.href = `${MAIN_API}/auth.html`;
        return;
      }

      // 3. Token exists but user not in THIS localStorage (cross-port isolation)
      const existing = localStorage.getItem('hiredUpUser');
      if (!existing || existing === 'null') {
        try {
          const res = await fetch(`${MAIN_API}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const userData = await res.json();
            localStorage.setItem('hiredUpUser', JSON.stringify(userData));
          } else {
            // Token invalid/expired
            localStorage.removeItem('hiredUpToken');
            window.location.href = `${MAIN_API}/auth.html`;
            return;
          }
        } catch (e) {
          console.warn('Could not fetch user profile:', e.message);
          // Non-fatal — allow app to proceed (works if DB is accessible)
        }
      }

      setAuthReady(true);
    }

    initAuth();
  }, []); // Runs ONCE on app mount

  if (!authReady) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#0a0a0c', gap: '1rem'
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '3px solid rgba(109,92,255,0.2)',
          borderTopColor: '#6d5cff',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ color: '#6d5cff', fontSize: '0.85rem', fontWeight: 700 }}>
          Authenticating…
        </span>
      </div>
    );
  }

  return (
    <Router>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/problems" element={<Dashboard />} />
        <Route path="/topics" element={<TopicsPage />} />
        <Route path="/solve/:id" element={<ProblemSolve />} />
        <Route path="/aptitude-test" element={<AptitudeTest />} />
        <Route path="/aptitude-selection" element={<AptitudeCategories />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/take-assessment/:id" element={<TakeAssessment />} />
      </Routes>
    </Router>
  );
}

export default App;
