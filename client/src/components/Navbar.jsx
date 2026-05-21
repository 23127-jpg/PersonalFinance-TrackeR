import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav role="navigation" aria-label="Main navigation">
      <div className="navbar">
        <Link to="/" className="logo">
          <i className="fas fa-chart-line"></i> Finance Tracker
        </Link>

        {/* Mobile Hamburger menu */}
        <div 
          className="menu-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          role="button"
          tabIndex="0"
          aria-label="Toggle navigation menu"
        >
          <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </div>

        <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
          <li>
            <Link 
              to="/" 
              className={isActive('/') ? 'active' : ''}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
          </li>
          {user && (
            <li>
              <Link 
                to="/dashboard" 
                className={isActive('/dashboard') ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            </li>
          )}
          <li>
            <Link 
              to="/support" 
              className={isActive('/support') ? 'active' : ''}
              onClick={() => setMobileMenuOpen(false)}
            >
              Support
            </Link>
          </li>
          
          {/* Mobile view authentication buttons */}
          {mobileMenuOpen && (
            <li style={{ marginTop: '20px', border: 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={toggleDarkMode} className="theme-toggle" style={{ alignSelf: 'center', marginBottom: '10px' }}>
                  <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                </button>
                {user ? (
                  <>
                    <span style={{ color: 'var(--text-primary)', textAlign: 'center', fontWeight: 'bold' }}>
                      Hi, {user.username}
                    </span>
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="btn-head btn-danger" style={{ justifyContent: 'center' }}>
                      <i className="fas fa-sign-out-alt"></i> Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-head" style={{ justifyContent: 'center' }}>
                      <i className="fas fa-sign-in-alt"></i> Log In
                    </Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="btn-head" style={{ justifyContent: 'center' }}>
                      <i className="fas fa-user-plus"></i> Sign Up
                    </Link>
                  </>
                )}
              </div>
            </li>
          )}
        </ul>

        {/* Desktop view controls */}
        <div className="buttons" style={{ display: mobileMenuOpen ? 'none' : 'flex' }}>
          <button onClick={toggleDarkMode} className="theme-toggle" aria-label="Toggle theme">
            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`} style={{ color: 'var(--primary-deep)' }}></i>
          </button>
          
          {user ? (
            <>
              <span style={{ color: 'var(--text-primary)', marginRight: '10px', fontWeight: '600' }}>
                Hi, <strong>{user.username}</strong>
              </span>
              <button onClick={handleLogout} className="btn-head btn-danger">
                <i className="fas fa-sign-out-alt"></i> Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-head">
                <i className="fas fa-sign-in-alt"></i> Log In
              </Link>
              <Link to="/signup" className="btn-head">
                <i className="fas fa-user-plus"></i> Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
