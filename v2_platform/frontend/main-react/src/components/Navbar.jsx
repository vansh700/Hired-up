import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="nav-logo">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#logo-grad)" strokeWidth="2" strokeLinejoin="round" />
                        <path d="M2 17L12 22L22 17" stroke="url(#logo-grad)" strokeWidth="2" strokeLinejoin="round" />
                        <path d="M2 12L12 17L22 12" stroke="url(#logo-grad)" strokeWidth="2" strokeLinejoin="round" />
                        <defs>
                            <linearGradient id="logo-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#4f46e5" />
                                <stop offset="1" stopColor="#06b6d4" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span>HiredUp</span>
                </Link>
                <div className="nav-links">
                    <a href="#features" className="nav-link">Features</a>
                    <a href="#how-it-works" className="nav-link">How it works</a>
                    <Link to="/candidates" className="nav-link">Candidates</Link>
                    <Link to="/skill-gap" className="nav-link">Skill Gap</Link>
                </div>
                <div className="nav-actions">
                    <Link to="/auth" className="btn btn-outline">Log In</Link>
                    <Link to="/auth" className="btn btn-primary">Get Started</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
