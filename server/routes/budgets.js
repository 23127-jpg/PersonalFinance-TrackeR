const express = require('express');
const { body } = require('express-validator');
const {
  getBudgets,
  upsertBudget,
  deleteBudget,
  getBudgetProgress
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/progress', getBudgetProgress);

router
  .route('/')
  .get(getBudgets)
  .post(
    [
      body('category', 'Category is required').trim().notEmpty(),
      body('limit', 'Limit must be a positive number').isNumeric().isFloat({ min: 0 }),
      body('month', 'Month is required and must be between 0 and 11').isInt({ min: 0, max: 11 }),
      body('year', 'Year must be a valid year integer').isInt({ min: 2000, max: 2100 })
    ],
    upsertBudget
  );

router.route('/:id').delete(deleteBudget);

module.exports = router;
