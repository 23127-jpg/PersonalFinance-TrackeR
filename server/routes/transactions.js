const express = require('express');
const { body } = require('express-validator');
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router
  .route('/')
  .get(getTransactions)
  .post(
    [
      body('description', 'Description is required').trim().notEmpty(),
      body('amount', 'Amount must be a number').isNumeric(),
      body('type', 'Type must be either income or expense').isIn(['income', 'expense']),
      body('category', 'Category is required').trim().notEmpty()
    ],
    createTransaction
  );

router
  .route('/:id')
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
