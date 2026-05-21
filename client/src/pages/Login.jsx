import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState(null);

  // Forgot Password modal simulation
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    clearError();

    if (!usernameOrEmail || !password) {
      setSubmitError('Please fill out all required fields');
      return;
    }

    const result = await login(usernameOrEmail, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setSubmitError(result.error);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(`A secure reset link has been dispatched to ${forgotEmail}. Please check your inbox.`);
    setForgotEmail('');
  };

  return (
    <div className="auth-page">
      {/* Toast notifications */}
      {(submitError || error) && (
        <div className="notification-box">
          <div className="alert-toast error">
            <i className="fas fa-exclamation-triangle"></i>
            <span>{submitError || error}</span>
          </div>
        </div>
      )}

      <div className="login-container">
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h2>Welcome Back</h2>
            <p>Enter your credentials to access your tracker dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="modern-login-form">
            <div className="form-group">
              <label htmlFor="username">
                <i className="fas fa-user"></i> Username or Email <span>*</span>
              </label>
              <input 
                type="text" 
                id="username" 
                required 
                placeholder="Enter your username or email" 
                value={usernameOrEmail}
                onChange={(e) => {
                  setUsernameOrEmail(e.target.value);
                  if (submitError) setSubmitError(null);
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i> Password <span>*</span>
              </label>
              <input 
                type="password" 
                id="password" 
                required 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (submitError) setSubmitError(null);
                }}
              />
            </div>

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Authenticating...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i> Sign In
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
            <p>
              <button 
                onClick={() => { setShowForgotModal(true); setForgotSuccess(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary-deep)', fontWeight: '600', cursor: 'pointer', outline: 'none' }}
              >
                Forgot your password?
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal Overlay */}
      {showForgotModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--glass-border)',
            padding: '30px', borderRadius: '16px', maxWidth: '400px', width: '100%',
            position: 'relative', boxShadow: 'var(--shadow-lg)'
          }}>
            <button 
              onClick={() => setShowForgotModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '18px', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              <i className="fas fa-times"></i>
            </button>
            
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '10px', color: 'var(--text-primary)' }}>Reset Password</h3>
            
            {forgotSuccess ? (
              <div style={{ color: 'var(--success)', fontSize: '14px', lineHeight: '1.6', marginTop: '10px' }}>
                <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i> {forgotSuccess}
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} style={{ marginTop: '15px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '15px', lineHeight: '1.5' }}>
                  Please enter the email address linked to your account. We will transmit a temporary password reset code.
                </p>
                <div className="form-group">
                  <label htmlFor="forgot-email"><i className="fas fa-envelope"></i> Email Address</label>
                  <input 
                    type="email" 
                    id="forgot-email" 
                    required 
                    placeholder="name@domain.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
                <button type="submit" className="login-btn">
                  Send Recovery Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
