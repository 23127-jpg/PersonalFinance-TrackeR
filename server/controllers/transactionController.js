const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const sendEmail = require('../utils/nodemailer');
const { validationResult } = require('express-validator');

// Helper to check and alert budget limits
async function checkBudgetLimits(userId, category, amount, dateInput, userEmail, username) {
  const date = new Date(dateInput || Date.now());
  const month = date.getMonth();
  const year = date.getFullYear();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[month];

  let alerts = [];
  let budgetExceeded = false;

  try {
    // 1. Check for specific category budget
    const categoryBudget = await Budget.findOne({ user: userId, category, month, year });
    if (categoryBudget) {
      // Aggregate expenses for this category in this month/year
      const expenses = await Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: 'expense',
            category,
            date: {
              $gte: new Date(year, month, 1),
              $lt: new Date(year, month + 1, 1)
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      const currentTotal = expenses.length > 0 ? expenses[0].total : 0;
      const newTotal = currentTotal + amount;

      if (newTotal > categoryBudget.limit) {
        budgetExceeded = true;
        const msg = `Budget exceeded for category "${category}" in ${monthName} ${year}! Limit: ₹${categoryBudget.limit}. Current Category Total: ₹${newTotal}.`;
        alerts.push(msg);
      }
    }

    // 2. Check for overall budget
    const overallBudget = await Budget.findOne({ user: userId, category: 'all', month, year });
    if (overallBudget) {
      // Aggregate all expenses in this month/year
      const totalExpenses = await Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: 'expense',
            date: {
              $gte: new Date(year, month, 1),
              $lt: new Date(year, month + 1, 1)
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      const currentOverallTotal = totalExpenses.length > 0 ? totalExpenses[0].total : 0;
      const newOverallTotal = currentOverallTotal + amount;

      if (newOverallTotal > overallBudget.limit) {
        budgetExceeded = true;
        const msg = `Overall monthly budget exceeded for ${monthName} ${year}! Limit: ₹${overallBudget.limit}. Current Total Spending: ₹${newOverallTotal}.`;
        alerts.push(msg);
      }
    }

    // If budget exceeded, trigger background email send
    if (budgetExceeded && userEmail) {
      const emailContent = `
        <h3>Finance Tracker Budget Alert</h3>
        <p>Hello ${username},</p>
        <p>This is an automated alert notifying you that you have exceeded one or more of your set monthly budgets:</p>
        <ul>
          ${alerts.map(a => `<li><strong>${a}</strong></li>`).join('')}
        </ul>
        <p>Please log in to your Personal Finance Tracker to review your transactions and manage your savings goals.</p>
        <p>Best regards,<br>Personal Finance Tracker Team</p>
      `;

      sendEmail({
        to: userEmail,
        subject: '⚠️ Finance Tracker: Budget Exceeded Alert',
        text: alerts.join('\n'),
        html: emailContent
      }).catch(err => console.error('Background budget email warning error:', err));
    }
  } catch (err) {
    console.error('Error running budget limits check:', err);
  }

  return { budgetExceeded, alerts };
}

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { description, amount, type, category, date } = req.body;

  try {
    const transaction = await Transaction.create({
      user: req.user.id,
      description,
      amount,
      type,
      category,
      date: date || Date.now()
    });

    let budgetStatus = { budgetExceeded: false, alerts: [] };

    // Run budget checks only for expenses
    if (type === 'expense') {
      budgetStatus = await checkBudgetLimits(
        req.user.id,
        category,
        amount,
        transaction.date,
        req.user.email,
        req.user.username
      );
    }

    res.status(201).json({
      success: true,
      data: transaction,
      ...budgetStatus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res, next) => {
  const { description, amount, type, category, date } = req.body;

  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Verify ownership
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'User not authorized to update this transaction'
      });
    }

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { description, amount, type, category, date },
      { new: true, runValidators: true }
    );

    let budgetStatus = { budgetExceeded: false, alerts: [] };

    // Run budget check if expense type
    if (type === 'expense') {
      budgetStatus = await checkBudgetLimits(
        req.user.id,
        category,
        amount,
        transaction.date,
        req.user.email,
        req.user.username
      );
    }

    res.status(200).json({
      success: true,
      data: transaction,
      ...budgetStatus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Verify ownership
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'User not authorized to delete this transaction'
      });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
