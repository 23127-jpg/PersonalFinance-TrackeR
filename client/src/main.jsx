import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.jsx';
import './index.css';

// Configure global Axios baseURL for seamless local/production routing
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
