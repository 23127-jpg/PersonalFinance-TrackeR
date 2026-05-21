import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useAuth } from '../context/AuthContext';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const { user } = useAuth();
  
  // Transactions, Budgets, Goals states
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Forms states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [editedId, setEditedId] = useState(null);

  // Currency Converter state
  const [currency, setCurrency] = useState('INR');

  // Budget setting form states
  const [budgetCategory, setBudgetCategory] = useState('Food');
  const [budgetLimit, setBudgetLimit] = useState('');

  // Goal setting form states
  const [goalName, setGoalName] = useState('');
  const [goalTargetAmount, setGoalTargetAmount] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');
  
  // Goal contribution state
  const [contributeAmount, setContributeAmount] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState('');

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Categories list
  const categoriesList = ['Food', 'Salary', 'Rent/Bills', 'Entertainment', 'Utilities', 'Shopping', 'Travel', 'Others'];

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setApiError(null);
      try {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const [txRes, budgetRes, goalRes] = await Promise.all([
          axios.get('/api/transactions'),
          axios.get(`/api/budgets/progress?month=${currentMonth}&year=${currentYear}`),
          axios.get('/api/goals')
        ]);

        if (txRes.data.success) setTransactions(txRes.data.data);
        if (budgetRes.data.success) setBudgets(budgetRes.data.data);
        if (goalRes.data.success) setGoals(goalRes.data.data);

      } catch (err) {
        setApiError('Unable to load tracker data. Check database connections.');
        console.error('Fetch dashboard error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch budget progress sheet
  const refreshBudgets = async () => {
    try {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const budgetRes = await axios.get(`/api/budgets/progress?month=${currentMonth}&year=${currentYear}`);
      if (budgetRes.data.success) {
        setBudgets(budgetRes.data.data);
      }
    } catch (err) {
      console.error('Refresh budgets failed:', err.message);
    }
  };

  // Add / Edit Transaction
  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount || !date) {
      showNotification('Please fill in description, amount, and date', 'error');
      return;
    }

    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        showNotification('Amount must be a positive number', 'error');
        return;
      }

      let res;
      if (editedId) {
        // Edit Mode
        res = await axios.put(`/api/transactions/${editedId}`, {
          description,
          amount: parsedAmount,
          type,
          category,
          date
        });
      } else {
        // Add Mode
        res = await axios.post('/api/transactions', {
          description,
          amount: parsedAmount,
          type,
          category,
          date
        });
      }

      if (res.data.success) {
        if (editedId) {
          setTransactions(prev => prev.map(tx => tx._id === editedId ? res.data.data : tx));
          showNotification('Transaction updated successfully.');
        } else {
          setTransactions(prev => [res.data.data, ...prev]);
          showNotification('Transaction added successfully.');
        }

        // Check if server fired a budget warning trigger
        if (res.data.budgetExceeded) {
          res.data.alerts.forEach(alertMsg => {
            showNotification(`⚠️ Budget Alert: ${alertMsg}`, 'error');
          });
        }

        // Reset inputs
        setDescription('');
        setAmount('');
        setEditedId(null);
        refreshBudgets();
      }
    } catch (err) {
      showNotification(err.response?.data?.error || 'Save transaction transaction failed', 'error');
    }
  };

  // Start edit transaction
  const startEditTransaction = (tx) => {
    setEditedId(tx._id);
    setDescription(tx.description);
    setAmount(tx.amount);
    setType(tx.type);
    setCategory(tx.category);
    setDate(new Date(tx.date).toISOString().split('T')[0]);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditedId(null);
    setDescription('');
    setAmount('');
    setType('expense');
    setCategory('Food');
    setDate(new Date().toISOString().split('T')[0]);
  };

  // Delete Transaction
  const deleteTransaction = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      const res = await axios.delete(`/api/transactions/${id}`);
      if (res.data.success) {
        setTransactions(prev => prev.filter(tx => tx._id !== id));
        showNotification('Transaction removed.');
        refreshBudgets();
      }
    } catch (err) {
      showNotification('Delete failed', 'error');
    }
  };

  // Set / Upsert Category Budget Limit
  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    if (!budgetLimit) return;
    
    try {
      const parsedLimit = parseFloat(budgetLimit);
      if (isNaN(parsedLimit) || parsedLimit < 0) {
        showNotification('Limit must be a valid positive amount', 'error');
        return;
      }

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const res = await axios.post('/api/budgets', {
        category: budgetCategory,
        limit: parsedLimit,
        month: currentMonth,
        year: currentYear
      });

      if (res.data.success) {
        showNotification(`Budget limit set successfully for ${budgetCategory}.`);
        setBudgetLimit('');
        refreshBudgets();
      }
    } catch (err) {
      showNotification(err.response?.data?.error || 'Unable to update budget limit', 'error');
    }
  };

  // Delete Budget Limit
  const deleteBudget = async (budgetId) => {
    if (!window.confirm('Delete this budget limit?')) return;
    try {
      const res = await axios.delete(`/api/budgets/${budgetId}`);
      if (res.data.success) {
        showNotification('Budget limit removed.');
        refreshBudgets();
      }
    } catch (err) {
      showNotification('Delete failed', 'error');
    }
  };

  // Add Goal
  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    if (!goalName || !goalTargetAmount || !goalTargetDate) {
      showNotification('Please fill goal name, target amount, and deadline', 'error');
      return;
    }

    try {
      const parsedTarget = parseFloat(goalTargetAmount);
      if (isNaN(parsedTarget) || parsedTarget <= 0) {
        showNotification('Target must be a positive number', 'error');
        return;
      }

      const res = await axios.post('/api/goals', {
        name: goalName,
        targetAmount: parsedTarget,
        targetDate: goalTargetDate
      });

      if (res.data.success) {
        setGoals(prev => [res.data.data, ...prev]);
        showNotification('Financial goal established successfully.');
        setGoalName('');
        setGoalTargetAmount('');
        setGoalTargetDate('');
      }
    } catch (err) {
      showNotification(err.response?.data?.error || 'Create goal failed', 'error');
    }
  };

  // Contribute savings to Goal
  const handleGoalContribution = async (e) => {
    e.preventDefault();
    if (!selectedGoalId || !contributeAmount) return;

    try {
      const contribution = parseFloat(contributeAmount);
      if (isNaN(contribution) || contribution <= 0) {
        showNotification('Contribution must be positive', 'error');
        return;
      }

      const targetGoal = goals.find(g => g._id === selectedGoalId);
      if (!targetGoal) return;

      const newCurrent = targetGoal.currentAmount + contribution;

      const res = await axios.put(`/api/goals/${selectedGoalId}`, {
        currentAmount: newCurrent
      });

      if (res.data.success) {
        setGoals(prev => prev.map(g => g._id === selectedGoalId ? res.data.data : g));
        showNotification(`Added ₹${contribution} savings towards goal "${targetGoal.name}".`);
        setContributeAmount('');
        setSelectedGoalId('');
      }
    } catch (err) {
      showNotification('Savings contribution failed', 'error');
    }
  };

  // Delete Goal
  const deleteGoal = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      const res = await axios.delete(`/api/goals/${id}`);
      if (res.data.success) {
        setGoals(prev => prev.filter(g => g._id !== id));
        showNotification('Savings goal removed.');
      }
    } catch (err) {
      showNotification('Delete failed', 'error');
    }
  };

  // Exporters: CSV Formatter
  const exportToCSV = () => {
    if (transactions.length === 0) return;
    const csvContent =
      'Date,Description,Amount,Type,Category\n' +
      transactions
        .map(tx => {
          const formattedDate = new Date(tx.date).toLocaleDateString();
          return `"${formattedDate}","${tx.description.replace(/"/g, '""')}",${tx.amount},"${tx.type}","${tx.category}"`;
        })
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `finance_tracker_${user?.username}_transactions.csv`;
    link.click();
    showNotification('CSV exported successfully.');
  };

  // Exporters: PDF Document Formatter using pdfMake from global window
  const exportToPDF = () => {
    if (transactions.length === 0) return;
    if (!window.pdfMake) {
      showNotification('PDF generator tool is loading. Please retry shortly.', 'error');
      return;
    }

    const docDefinition = {
      content: [
        { text: 'Personal Finance Tracker Statement', style: 'header', alignment: 'center', margin: [0, 0, 0, 20] },
        { text: `Statement for user: ${user?.username}`, style: 'subheader', margin: [0, 0, 0, 10] },
        { text: `Generated on: ${new Date().toLocaleString()}`, margin: [0, 0, 0, 20], fontStyle: 'italic' },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Date', style: 'tableHeader' },
                { text: 'Description', style: 'tableHeader' },
                { text: 'Amount', style: 'tableHeader' },
                { text: 'Type', style: 'tableHeader' },
                { text: 'Category', style: 'tableHeader' }
              ],
              ...transactions.map(tx => [
                new Date(tx.date).toLocaleDateString(),
                tx.description,
                `${currencySign()}${tx.amount.toFixed(2)}`,
                tx.type.toUpperCase(),
                tx.category
              ])
            ]
          },
          layout: 'lightHorizontalLines'
        }
      ],
      styles: {
        header: { fontSize: 18, bold: true },
        subheader: { fontSize: 12, bold: true },
        tableHeader: { bold: true, fillColor: '#e9ecef', alignment: 'center' }
      }
    };

    window.pdfMake.createPdf(docDefinition).download(`finance_tracker_${user?.username}_transactions.pdf`);
    showNotification('PDF exported successfully.');
  };

  // Currency Converter Helpers
  const currencyRates = { INR: 1, USD: 0.012, EUR: 0.011 };
  
  const currencySign = () => {
    if (currency === 'USD') return '$';
    if (currency === 'EUR') return '€';
    return '₹';
  };

  const convertAmount = (val) => {
    const rate = currencyRates[currency] || 1;
    return val * rate;
  };

  const formatCurrency = (val) => {
    const converted = convertAmount(val);
    return `${currencySign()}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Balance calculation
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  // Chart 1 Data: Monthly Income vs Expense
  const barChartData = {
    labels: ['Monthly Breakdown'],
    datasets: [
      {
        label: 'Income',
        data: [convertAmount(totalIncome)],
        backgroundColor: '#10b981',
        borderRadius: 8
      },
      {
        label: 'Expense',
        data: [convertAmount(totalExpense)],
        backgroundColor: '#ef4444',
        borderRadius: 8
      }
    ]
  };

  // Chart 2 Data: Category-wise Spending (Arc Pie)
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const spendingByCategory = categoriesList.reduce((acc, cat) => {
    const sum = expenseTransactions.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0);
    if (sum > 0) acc[cat] = convertAmount(sum);
    return acc;
  }, {});

  const pieChartData = {
    labels: Object.keys(spendingByCategory),
    datasets: [
      {
        data: Object.values(spendingByCategory),
        backgroundColor: [
          '#fb923c', '#818cf8', '#f87171', '#facc15', '#34d399', '#60a5fa', '#c084fc', '#94a3b8'
        ],
        borderWidth: 1
      }
    ]
  };

  // Chart 3 Data: Cumulative Savings Trend Line
  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  let runningSavings = 0;
  const trendLabels = [];
  const trendData = [];

  sortedTransactions.forEach(t => {
    if (t.type === 'income') {
      runningSavings += t.amount;
    } else {
      runningSavings -= t.amount;
    }
    trendLabels.push(new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
    trendData.push(convertAmount(runningSavings));
  });

  const lineChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Net Balance Trend',
        data: trendData,
        fill: true,
        borderColor: '#818cf8',
        backgroundColor: 'rgba(129, 140, 248, 0.1)',
        tension: 0.3,
        pointBackgroundColor: '#fb923c',
        pointRadius: 4
      }
    ]
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', color: 'white' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#ffd700', marginBottom: '20px' }}></i>
        <h2>Verifying database links and building analytical engines...</h2>
      </div>
    );
  }

  return (
    <main className="dashboard-container">
      {/* Toast Notification Box */}
      {notification && (
        <div className="notification-box">
          <div className={`alert-toast ${notification.type === 'error' ? 'error' : 'success'}`}>
            <i className={`fas ${notification.type === 'error' ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}></i>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {apiError && (
        <div style={{ background: 'var(--danger)', color: 'white', padding: '16px', borderRadius: '12px', marginBottom: '30px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <i className="fas fa-exclamation-circle" style={{ fontSize: '20px' }}></i>
          <span>{apiError}</span>
        </div>
      )}

      {/* Tracker Card */}
      <section className="tracker-part">
        <div className="tracker-balance">
          Current Balance
          <span className={`current-balance ${currentBalance < 0 ? 'negative-balance' : 'positive-balance'}`}>
            {formatCurrency(currentBalance)}
          </span>
        </div>

        {/* Currency & Date Selectors */}
        <div className="currency-filter">
          <div className="filter-left">
            <label htmlFor="currency">Display Currency:</label>
            <select 
              id="currency" 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div className="filter-right" style={{ justifyContent: 'flex-end' }}>
            <button onClick={exportToCSV} className="btn-head btn-success" style={{ marginRight: '10px' }}>
              <i className="fas fa-file-csv"></i> Export CSV
            </button>
            <button onClick={exportToPDF} className="btn-head">
              <i className="fas fa-file-pdf"></i> Export PDF
            </button>
          </div>
        </div>

        {/* Add/Edit Transaction Form */}
        <form onSubmit={handleTransactionSubmit} className="transaction-form" style={{ background: 'var(--neutral-200)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <div className="form-group" style={{ flex: '2' }}>
            <label style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '13px' }}><i className="fas fa-edit"></i> Description</label>
            <input 
              type="text" 
              placeholder="E.g. Office salary, Grocery shopping" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '13px' }}><i className="fas fa-coins"></i> Amount</label>
            <input 
              type="number" 
              step="0.01"
              placeholder="Amount" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '13px' }}><i className="fas fa-list"></i> Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '13px' }}><i className="fas fa-exchange-alt"></i> Type</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div className="form-group">
            <label style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '13px' }}><i className="fas fa-calendar-day"></i> Date</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn-head btn-success">
              <i className="fas fa-plus"></i> {editedId ? 'Save' : 'Add'}
            </button>
            {editedId && (
              <button type="button" onClick={cancelEdit} className="btn-head btn-danger">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Transactions Table */}
        <h3 style={{ margin: '30px 0 15px', color: 'var(--text-primary)', fontSize: '18px', fontWeight: '800' }}>Recent Logs</h3>
        <div className="table-part">
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <i className="fas fa-history" style={{ fontSize: '40px', marginBottom: '10px', display: 'block' }}></i>
              No logs recorded. Log your first expense or income above!
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx._id}>
                    <td>{new Date(tx.date).toLocaleDateString()}</td>
                    <td style={{ fontWeight: '600' }}>{tx.description}</td>
                    <td><span style={{ background: 'var(--neutral-300)', padding: '4px 8px', borderRadius: '20px', fontSize: '12px' }}>{tx.category}</span></td>
                    <td style={{ fontWeight: 'bold', color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                      {tx.type.toUpperCase()}
                    </td>
                    <td style={{ fontWeight: 'bold' }}>{formatCurrency(tx.amount)}</td>
                    <td>
                      <button onClick={() => startEditTransaction(tx)} className="edit-button">
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button onClick={() => deleteTransaction(tx._id)} className="delete-button">
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Analytics Charts Grid */}
      {transactions.length > 0 && (
        <section className="charts-grid">
          <div className="chart-card">
            <h3>Monthly Income vs Expense</h3>
            <div style={{ flex: '1', position: 'relative' }}>
              <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          {Object.keys(spendingByCategory).length > 0 && (
            <div className="chart-card">
              <h3>Category-wise Spending</h3>
              <div style={{ flex: '1', position: 'relative', display: 'flex', justifyContent: 'center', maxHeight: '300px' }}>
                <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          )}

          <div className="chart-card">
            <h3>Savings Trend Over Time</h3>
            <div style={{ flex: '1', position: 'relative' }}>
              <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </section>
      )}

      {/* Budgets and Financial Goals */}
      <section className="budget-goals-section">
        {/* Budgets Card */}
        <div className="bg-card">
          <h3>Category Budgets Limit</h3>
          
          {/* Set Budget Form */}
          <form onSubmit={handleBudgetSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap', background: 'var(--neutral-200)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <select value={budgetCategory} onChange={(e) => setBudgetCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="all">Overall Monthly Budget</option>
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '120px' }}>
              <input 
                type="number" 
                placeholder="Limit Amount"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}
                required
              />
            </div>
            <button type="submit" className="btn-head btn-success" style={{ padding: '0 20px', height: '40px' }}>
              <i className="fas fa-plus"></i> Set
            </button>
          </form>

          {/* Budget Limit Progress Bars */}
          <div>
            {budgets.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No budget limits configured for this month. Set one above!</p>
            ) : (
              budgets.map(b => (
                <div key={b.id} className="budget-progress-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>
                    <span style={{ textTransform: 'capitalize' }}>
                      {b.category === 'all' ? 'Overall Monthly Budget' : `${b.category} Budget`}
                    </span>
                    <span style={{ color: b.isExceeded ? 'var(--danger)' : 'var(--text-primary)' }}>
                      {formatCurrency(b.spent)} / {formatCurrency(b.limit)} ({b.percentage}%)
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className={`budget-progress-fill ${b.isExceeded ? 'exceeded' : ''}`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <button 
                    onClick={() => deleteBudget(b.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', float: 'right', marginTop: '-4px' }}
                  >
                    Delete Limit
                  </button>
                  <div style={{ clear: 'both' }}></div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Goals Card */}
        <div className="bg-card">
          <h3>Savings Goals Tracker</h3>

          {/* Add Goal Form */}
          <form onSubmit={handleGoalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px', background: 'var(--neutral-200)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="Goal e.g., Save for laptop" 
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                style={{ flex: '2', minWidth: '180px', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}
                required
              />
              <input 
                type="number" 
                placeholder="Target ₹" 
                value={goalTargetAmount}
                onChange={(e) => setGoalTargetAmount(e.target.value)}
                style={{ flex: '1', minWidth: '100px', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Deadline:</label>
              <input 
                type="date" 
                value={goalTargetDate}
                onChange={(e) => setGoalTargetDate(e.target.value)}
                style={{ flex: '1', padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}
                required
              />
              <button type="submit" className="btn-head btn-success" style={{ height: '38px', padding: '0 16px' }}>
                <i className="fas fa-bullseye"></i> Set Goal
              </button>
            </div>
          </form>

          {/* Record Savings Contribution Form */}
          {goals.length > 0 && (
            <form onSubmit={handleGoalContribution} style={{ display: 'flex', gap: '10px', marginBottom: '25px', background: 'var(--neutral-200)', padding: '12px', borderRadius: '12px', border: '1px dashed var(--accent-orange)' }}>
              <select 
                value={selectedGoalId} 
                onChange={(e) => setSelectedGoalId(e.target.value)}
                style={{ flex: '1', padding: '8px', borderRadius: '8px' }}
                required
              >
                <option value="">Select Target Goal</option>
                {goals.map(g => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
              <input 
                type="number" 
                placeholder="Contribute ₹" 
                value={contributeAmount}
                onChange={(e) => setContributeAmount(e.target.value)}
                style={{ width: '120px', padding: '8px', borderRadius: '8px' }}
                required
              />
              <button type="submit" className="btn-head btn-success" style={{ height: '36px', padding: '0 16px' }}>
                Contribute
              </button>
            </form>
          )}

          {/* Goals Progress Meters */}
          <div>
            {goals.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No active goals established. Start saving today!</p>
            ) : (
              goals.map(g => {
                const percentage = g.targetAmount > 0 ? parseFloat(((g.currentAmount / g.targetAmount) * 100).toFixed(1)) : 0;
                return (
                  <div key={g._id} className="goal-item">
                    <div className="goal-info">
                      <span>{g.name} (Deadline: {new Date(g.targetDate).toLocaleDateString()})</span>
                      <span>{formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)} ({percentage}%)</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                    </div>
                    <button 
                      onClick={() => deleteGoal(g._id)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', float: 'right', marginTop: '-4px' }}
                    >
                      Delete Goal
                    </button>
                    <div style={{ clear: 'both' }}></div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
