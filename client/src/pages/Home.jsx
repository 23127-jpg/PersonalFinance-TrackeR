import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const sendEmailInvite = (e) => {
    e.preventDefault();
    if (!email) {
      showNotification('Please enter an email address', 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    const subject = 'Join our Personal Finance Tracker community!';
    const body = `Hi! I've been using this amazing Personal Finance Tracker app to manage my finances and I thought you might find it useful too. It helps you track income, expenses, and manage your budget effectively. Check it out: ${window.location.origin}`;
    
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setEmail('');
    showNotification('Community invite opened in mail client!');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.origin);
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    window.open(linkedinUrl, 'linkedin-share', 'width=600,height=400,scrollbars=yes,resizable=yes');
    showNotification('LinkedIn share opened!');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.origin);
    const text = encodeURIComponent('Join our Personal Finance Tracker community! Track your finances effortlessly.');
    const twitterUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    window.open(twitterUrl, 'twitter-share', 'width=600,height=400,scrollbars=yes,resizable=yes');
    showNotification('Twitter share opened!');
  };

  return (
    <main id="main-content" role="main">
      {/* Toast Notification */}
      {notification && (
        <div className="notification-box">
          <div className={`alert-toast ${notification.type === 'error' ? 'error' : 'success'}`}>
            <i className={`fas ${notification.type === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}></i>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Hero Welcome Section */}
      <section className="section-box">
        <div className="main-landing">
          <div className="content">
            <h1 className="under-welcome-h1">Take Control of Your Finances</h1>
            <div className="under-h1"></div>
            <p className="under-welcome-p">
              Track your income and expenses effortlessly. Manage your budget, set
              financial goals, and make smarter decisions for a more secure future.
            </p>
            {user ? (
              <Link to="/dashboard" className="under-welcome-btn">Go to Dashboard</Link>
            ) : (
              <Link to="/signup" className="under-welcome-btn">Sign Up Now</Link>
            )}
          </div>
          <div className="under-welcome-image">
            {/* SVG or simple premium placeholder style rendering */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '24px',
              padding: '40px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              color: 'white',
              position: 'relative'
            }}>
              <i className="fas fa-wallet" style={{ fontSize: '72px', color: '#ffd700', marginBottom: '20px', display: 'block' }}></i>
              <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>Smart Wallet</h2>
              <p style={{ opacity: 0.8, fontSize: '15px' }}>Your central station for total spending monitoring and wealth optimization.</p>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '30px', justifyContent: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 15px', borderRadius: '12px', fontSize: '12px' }}>
                  <i className="fas fa-chart-pie" style={{ display: 'block', fontSize: '20px', color: '#ff8c00', marginBottom: '5px' }}></i>
                  Breakdowns
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 15px', borderRadius: '12px', fontSize: '12px' }}>
                  <i className="fas fa-bullseye" style={{ display: 'block', fontSize: '20px', color: '#10b981', marginBottom: '5px' }}></i>
                  Goal Meter
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 15px', borderRadius: '12px', fontSize: '12px' }}>
                  <i className="fas fa-bell" style={{ display: 'block', fontSize: '20px', color: '#ef4444', marginBottom: '5px' }}></i>
                  Email Alerts
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works list */}
      <section className="how-it-works" id="how-it-works">
        <div className="head-text">
          <h1>How It Works</h1>
          <div className="under-head-text"></div>
        </div>
        
        <div className="working-content">
          <div className="left-working">
            <h5 className="working-head">
              Experience the power of{' '}
              <span style={{ color: '#ffd700', fontWeight: 'bold' }}>Personal Finance Tracker</span>
            </h5>
            <ul className="ul-items">
              <li className="check-list-items">
                <i className="fas fa-check-circle"></i>
                <span>Track income and expenses effortlessly</span>
              </li>
              <li className="check-list-items">
                <i className="fas fa-check-circle"></i>
                <span>Create multiple monthly category-based budgets</span>
              </li>
              <li className="check-list-items">
                <i className="fas fa-check-circle"></i>
                <span>Receive background email warnings when limits are exceeded</span>
              </li>
              <li className="check-list-items">
                <i className="fas fa-check-circle"></i>
                <span>Establish and add savings contributions to custom Goals</span>
              </li>
              <li className="check-list-items">
                <i className="fas fa-check-circle"></i>
                <span>Observe monthly metrics in dynamic premium interactive charts</span>
              </li>
              <li className="check-list-items">
                <i className="fas fa-check-circle"></i>
                <span>Download transaction logs instantly as CSV or formatted PDF</span>
              </li>
            </ul>
            {!user && (
              <Link to="/signup" className="sign-up-button-btn">Sign Up Now</Link>
            )}
          </div>
          
          <div className="right-working-image" style={{ textAlign: 'center' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '40px',
              color: 'white',
              backdropFilter: 'blur(10px)'
            }}>
              <i className="fas fa-shield-alt" style={{ fontSize: '64px', color: '#10b981', marginBottom: '20px', display: 'block' }}></i>
              <h3>Stateless Cryptographic Security</h3>
              <p style={{ opacity: 0.8, marginTop: '10px', fontSize: '14px', lineHeight: '1.6' }}>
                We secure your dashboard behind encrypted JWT authorization. Your sessions are encrypted locally, and passwords hashed on server node databases using industry-leading bcrypt security mechanisms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Invite Section */}
      <section className="invite-section" id="invite">
        <div className="head-text">
          <h1>Community Invite</h1>
          <div className="under-head-text"></div>
        </div>
        
        <div className="invite-container">
          <div className="invite-card">
            <h2>Join Our Community</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '15px' }}>
              Invite your colleagues, friends or partners to share the finance monitoring experience!
            </p>
            
            <form onSubmit={sendEmailInvite} className="email-invite">
              <input 
                type="email" 
                placeholder="Enter an email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="btn-head btn-action">
                Send Invite
              </button>
            </form>
            
            <div className="social-share">
              <button onClick={shareOnLinkedIn} className="linkedin-share-btn">
                <i className="fab fa-linkedin-in"></i> Share
              </button>
              <button onClick={shareOnTwitter} className="twitter-share-btn">
                <i className="fab fa-twitter"></i> Tweet
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
