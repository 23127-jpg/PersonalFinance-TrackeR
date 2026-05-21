import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Support() {
  const { user } = useAuth();
  const [fullname, setFullname] = useState(user ? user.username : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('medium');
  const [query, setQuery] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed) {
      showNotification('Please agree to the Terms of Service & Privacy Policy', 'error');
      return;
    }
    
    // Simulate support submission
    console.log('Support Query Submitted:', { fullname, email, subject, priority, query });
    showNotification('Thank you! Your support message has been sent. We will review it shortly.');
    
    // Clear form except user defaults
    setSubject('');
    setQuery('');
    setAgreed(false);
  };

  return (
    <main id="main-content" role="main" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      {/* Toast Notification */}
      {notification && (
        <div className="notification-box">
          <div className={`alert-toast ${notification.type === 'error' ? 'error' : 'success'}`}>
            <i className={`fas ${notification.type === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}></i>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Support Hero Cards */}
      <section style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px', color: 'white', display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1', minWidth: '320px' }}>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '800', background: 'linear-gradient(135deg, #ffffff, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px' }}>How can we help?</h1>
          <p style={{ opacity: 0.9, lineHeight: '1.7', fontSize: '16px' }}>Get the support you need to make the most of your finance tracking experience. Our team is here to help you succeed.</p>
          <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
            <div>
              <i className="fas fa-clock" style={{ color: '#ff8c00', fontSize: '20px', marginRight: '8px' }}></i>
              <span>24/7 Support</span>
            </div>
            <div>
              <i className="fas fa-shield-alt" style={{ color: '#10b981', fontSize: '20px', marginRight: '8px' }}></i>
              <span>Secure & Private</span>
            </div>
          </div>
        </div>

        <div style={{ flex: '1', minWidth: '320px', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', borderRadius: '16px', backdropFilter: 'blur(10px)', textAlign: 'center', width: '150px' }}>
            <i className="fas fa-headset" style={{ fontSize: '32px', color: '#ff8c00', marginBottom: '10px' }}></i>
            <h4 style={{ margin: '0 0 5px' }}>Live Help</h4>
            <p style={{ fontSize: '11px', opacity: 0.7 }}>Instant assistance</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', borderRadius: '16px', backdropFilter: 'blur(10px)', textAlign: 'center', width: '150px' }}>
            <i className="fas fa-envelope" style={{ fontSize: '32px', color: '#10b981', marginBottom: '10px' }}></i>
            <h4 style={{ margin: '0 0 5px' }}>Email</h4>
            <p style={{ fontSize: '11px', opacity: 0.7 }}>Detailed responses</p>
          </div>
        </div>
      </section>

      {/* Support Form Wrapper */}
      <section className="support-container" style={{ marginTop: '40px' }}>
        <div className="support-wrapper">
          <h2>Send us a message</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px', fontSize: '14px' }}>
            Fill out the form below and we'll get back to you within 24 hours
          </p>

          <form className="modern-support-form" onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="fullname">
                  <i className="fas fa-user"></i> Full Name <span>*</span>
                </label>
                <input 
                  type="text" 
                  id="fullname" 
                  required 
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="Enter your full name" 
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="email">
                  <i className="fas fa-envelope"></i> Email Address <span>*</span>
                </label>
                <input 
                  type="email" 
                  id="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address" 
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="subject">
                <i className="fas fa-tag"></i> Subject <span>*</span>
              </label>
              <input 
                type="text" 
                id="subject" 
                required 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What's this about?" 
              />
            </div>

            <div className="form-group">
              <label htmlFor="priority">
                <i className="fas fa-exclamation-triangle"></i> Priority Level
              </label>
              <select 
                id="priority" 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low - General question</option>
                <option value="medium">Medium - Need assistance</option>
                <option value="high">High - Urgent issue</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="query">
                <i className="fas fa-comment-alt"></i> Message <span>*</span>
              </label>
              <textarea 
                id="query" 
                required 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe your issue or question in detail..."
                style={{ width: '100%', minHeight: '120px', padding: '12px 16px', borderRadius: '8px', background: 'var(--input-bg)', border: '2px solid var(--input-border)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
              ></textarea>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="checkbox" 
                id="agreed"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="agreed" style={{ fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer', margin: 0, fontWeight: 'normal' }}>
                I agree to the <a href="#" style={{ color: 'var(--primary-deep)', fontWeight: 'bold', textDecoration: 'none' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--primary-deep)', fontWeight: 'bold', textDecoration: 'none' }}>Privacy Policy</a>
              </label>
            </div>

            <button type="submit" className="login-btn">
              <i className="fas fa-paper-plane"></i> Send Message
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
            Need immediate help? <a href="mailto:support@financetracker.com" style={{ color: 'var(--primary-deep)', fontWeight: 'bold', textDecoration: 'none' }}>Email us directly</a> or call <a href="tel:+15551234567" style={{ color: 'var(--primary-deep)', fontWeight: 'bold', textDecoration: 'none' }}>+1 (555) 123-4567</a>
          </div>
        </div>
      </section>
    </main>
  );
}
