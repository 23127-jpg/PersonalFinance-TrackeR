const Goal = require('../models/Goal');
const { validationResult } = require('express-validator');

// @desc    Get all goals
// @route   GET /api/goals
// @access  Private
exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
exports.createGoal = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, targetAmount, currentAmount, targetDate } = req.body;

  try {
    const goal = await Goal.create({
      user: req.user.id,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      targetDate
    });

    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a goal (e.g. contribution added or limit adjustment)
// @route   PUT /api/goals/:id
// @access  Private
exports.updateGoal = async (req, res, next) => {
  const { name, targetAmount, currentAmount, targetDate } = req.body;

  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    // Verify ownership
    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'User not authorized to update this goal'
      });
    }

    // Update fields
    const updatedData = {};
    if (name !== undefined) updatedData.name = name;
    if (targetAmount !== undefined) updatedData.targetAmount = targetAmount;
    if (currentAmount !== undefined) updatedData.currentAmount = currentAmount;
    if (targetDate !== undefined) updatedData.targetDate = targetDate;

    goal = await Goal.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a savings goal
// @route   DELETE /api/goals/:id
// @access  Private
exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    // Verify ownership
    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'User not authorized to delete this goal'
      });
    }

    await Goal.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
