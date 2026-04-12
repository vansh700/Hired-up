import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<div className="container" style={{paddingTop: '120px'}}><h2>Profile Page (Porting in Progress...)</h2></div>} />
            <Route path="/recruiter" element={<div className="container" style={{paddingTop: '120px'}}><h2>Recruiter Dashboard (Porting in Progress...)</h2></div>} />
          </Routes>
        </main>
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '4rem 0', marginTop: '4rem', background: 'rgba(15, 23, 42, 0.5)', textAlign: 'center' }}>
          <p style={{ opacity: 0.5 }}>&copy; 2026 HiredUp Inc. Designed for the Future.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
