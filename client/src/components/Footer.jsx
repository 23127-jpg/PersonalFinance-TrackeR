import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer role="contentinfo">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-chart-line" style={{ fontSize: '20px', color: 'var(--primary-deep)' }}></i>
              <h3 style={{ margin: 0 }}>Finance Tracker</h3>
            </div>
            <p className="footer-description" style={{ marginTop: '12px' }}>
              Take control of your finances with our comprehensive personal finance tracking tool. 
              Manage your income, expenses, and financial goals effortlessly.
            </p>
            <div className="social-links">
              <a href="https://github.com/neeraj542/Personal-Finance-Tracker" target="_blank" rel="noopener noreferrer" className="social-link"><i className="fab fa-github"></i></a>
              <a href="#" className="social-link"><i class="fab fa-linkedin"></i></a>
              <a href="#" className="social-link"><i class="fab fa-twitter"></i></a>
              <a href="#" className="social-link"><i class="fab fa-facebook"></i></a>
            </div>
          </div>
          
          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/support">Support</Link></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4>Resources</h4>
            <ul className="footer-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Help Center</a></li>
            </ul>
          </div>
          
          <div class="footer-section">
            <h4>Contact Info</h4>
            <div className="contact-info" style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-muted)' }}>
              <p style={{ margin: 0 }}><i className="fas fa-envelope"></i> support@financetracker.com</p>
              <p style={{ margin: 0 }}><i className="fas fa-phone"></i> +1 (555) 123-4567</p>
              <p style={{ margin: 0 }}><i className="fas fa-map-marker-alt"></i> New York, NY</p>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2026 Finance Tracker. All rights reserved.</p>
            <p className="developer-credit" style={{ marginTop: '8px' }}>Created by <strong>Neeraj Meena</strong> - Full Stack MERN Developer</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
