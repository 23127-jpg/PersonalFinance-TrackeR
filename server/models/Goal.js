const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a goal name (e.g. Save for a new laptop)'],
    trim: true
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please add a target amount']
  },
  currentAmount: {
    type: Number,
    required: true,
    default: 0
  },
  targetDate: {
    type: Date,
    required: [true, 'Please specify target deadline date']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Goal', GoalSchema);
