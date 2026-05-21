const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please specify budget category (e.g., Food, Rent, or all for overall)'],
    default: 'all'
  },
  limit: {
    type: Number,
    required: [true, 'Please specify the budget limit amount']
  },
  month: {
    type: Number,
    required: [true, 'Please specify month (0-11)'],
    min: 0,
    max: 11
  },
  year: {
    type: Number,
    required: [true, 'Please specify year (e.g. 2026)']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure uniqueness of budget limit for a category per user per month
BudgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
