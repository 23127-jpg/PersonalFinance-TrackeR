const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

// @desc    Get all budgets for current month & year
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    
    let query = { user: req.user.id };
    
    if (month !== undefined && year !== undefined) {
      query.month = parseInt(month);
      query.year = parseInt(year);
    }

    const budgets = await Budget.find(query);
    
    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upsert budget (Create or Update if already exists)
// @route   POST /api/budgets
// @access  Private
exports.upsertBudget = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { category, limit, month, year } = req.body;

  try {
    // Upsert logic: find by user, category, month, and year. Update limit, or create new.
    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id, category, month, year },
      { limit },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a budget limit
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget limit not found'
      });
    }

    // Verify ownership
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'User not authorized to delete this budget limit'
      });
    }

    await Budget.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get spending progress vs budget limits
// @route   GET /api/budgets/progress
// @access  Private
exports.getBudgetProgress = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const targetMonth = month !== undefined ? parseInt(month) : new Date().getMonth();
    const targetYear = year !== undefined ? parseInt(year) : new Date().getFullYear();

    // 1. Fetch all budgets set for the targeted period
    const budgets = await Budget.find({ user: req.user.id, month: targetMonth, year: targetYear });

    // 2. Fetch all expense transactions for the user in targeted period
    const expenses = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          type: 'expense',
          date: {
            $gte: new Date(targetYear, targetMonth, 1),
            $lt: new Date(targetYear, targetMonth + 1, 1)
          }
        }
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' }
        }
      }
    ]);

    // Format results to pair limit and current spent amount
    const progress = budgets.map(b => {
      const exp = expenses.find(e => e._id === b.category);
      const spent = exp ? exp.totalSpent : 0;
      return {
        id: b._id,
        category: b.category,
        limit: b.limit,
        spent: spent,
        percentage: b.limit > 0 ? parseFloat(((spent / b.limit) * 100).toFixed(2)) : 0,
        isExceeded: spent > b.limit
      };
    });

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    next(error);
  }
};
