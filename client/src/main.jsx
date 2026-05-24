import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';

import App from './App.jsx';
import './index.css';

// Configure global Axios baseURL for seamless local/production routing
axios.defaults.baseURL = 'https://personalfinance-tracker.onrender.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
