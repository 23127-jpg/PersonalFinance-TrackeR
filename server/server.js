const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
// Root route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running!' });
});



// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finance_tracker';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB successfully connected.'))
  .catch(err => {
    console.error('MongoDB connection error details:');
    console.error(err);
    console.log('Ensure MongoDB service is running locally, or configure a valid MONGO_URI in server/.env');
  });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Personal Finance Tracker API is healthy and running.',
    timestamp: new Date()
  });
});

// Routes configuration
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/goals', require('./routes/goals'));

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err.message || err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = { app, server };
