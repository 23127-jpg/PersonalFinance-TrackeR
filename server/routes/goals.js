const express = require('express');
const { body } = require('express-validator');
const {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal
} = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getGoals)
  .post(
    [
      body('name', 'Goal name is required').trim().notEmpty(),
      body('targetAmount', 'Target amount must be a positive number').isNumeric().isFloat({ min: 0.01 }),
      body('targetDate', 'Target date is required').trim().notEmpty()
    ],
    createGoal
  );

router
  .route('/:id')
  .put(updateGoal)
  .delete(deleteGoal);

module.exports = router;
