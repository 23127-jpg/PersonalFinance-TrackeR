const express = require('express');
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Registration route with input validation
router.post(
  '/register',
  [
    body('username', 'Username is required and must be at least 3 characters')
      .trim()
      .isLength({ min: 3 }),
    body('email', 'Please provide a valid email').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters').isLength({
      min: 6
    })
  ],
  registerUser
);

// Login route with validation
router.post(
  '/login',
  [
    body('usernameOrEmail', 'Username or Email is required').notEmpty(),
    body('password', 'Password is required').notEmpty()
  ],
  loginUser
);

// Protected profile fetching
router.get('/me', protect, getMe);

// Logout route
router.post('/logout', logoutUser);

module.exports = router;
