import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    clearError();

    if (!username || !email || !password || !confirmPassword) {
      setSubmitError('Please fill out all required fields');
      return;
    }

    if (password.length < 6) {
      setSubmitError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match');
      return;
    }

    const result = await register(username, email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setSubmitError(result.error);
    }
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
        <div className="login-form-wrapper" style={{ padding: '30px 40px' }}>
          <div className="login-form-header">
            <h2>Create An Account</h2>
            <p>Join us today to manage your wealth efficiently</p>
          </div>

          <form onSubmit={handleSubmit} className="modern-login-form">
            <div className="form-group">
              <label htmlFor="reg-username">
                <i className="fas fa-user"></i> Username <span>*</span>
              </label>
              <input 
                type="text" 
                id="reg-username" 
                required 
                placeholder="Enter a username (min 3 chars)" 
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (submitError) setSubmitError(null);
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">
                <i className="fas fa-envelope"></i> Email Address <span>*</span>
              </label>
              <input 
                type="email" 
                id="reg-email" 
                required 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (submitError) setSubmitError(null);
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">
                <i className="fas fa-lock"></i> Password <span>*</span>
              </label>
              <input 
                type="password" 
                id="reg-password" 
                required 
                placeholder="Enter a password (min 6 chars)" 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (submitError) setSubmitError(null);
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-confirm-password">
                <i className="fas fa-lock"></i> Confirm Password <span>*</span>
              </label>
              <input 
                type="password" 
                id="reg-confirm-password" 
                required 
                placeholder="Re-enter your password" 
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (submitError) setSubmitError(null);
                }}
              />
            </div>

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i> Sign Up
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Already have an account? <Link to="/login">Sign in here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
