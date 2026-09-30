import { getMonthName } from './formatters';

export const calculateFinancialSummary = ({
  expenses = [],
  income = [],
  budgets = [],
  month = new Date().getMonth(),
  year = new Date().getFullYear()
}) => {
  // Filter for requested month and year
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.expense_date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const monthIncome = income.filter(i => {
    const d = new Date(i.income_date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const totalExpense = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalIncome = monthIncome.reduce((sum, i) => sum + Number(i.amount), 0);
  const balance = totalIncome - totalExpense;
  const savings = Math.max(0, balance);
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  // Previous month data for comparison
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;

  const prevMonthExpenses = expenses.filter(e => {
    const d = new Date(e.expense_date);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });

  const prevMonthIncome = income.filter(i => {
    const d = new Date(i.income_date);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });

  const prevTotalExpense = prevMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const prevTotalIncome = prevMonthIncome.reduce((sum, i) => sum + Number(i.amount), 0);

  const expenseChangePct = prevTotalExpense > 0
    ? ((totalExpense - prevTotalExpense) / prevTotalExpense) * 100
    : 0;

  const incomeChangePct = prevTotalIncome > 0
    ? ((totalIncome - prevTotalIncome) / prevTotalIncome) * 100
    : 0;

  // Overall budget progress
  const overallBudgetObj = budgets.find(b => !b.category_id && b.month === (month + 1) && b.year === year);
  const overallBudget = overallBudgetObj ? Number(overallBudgetObj.amount) : null;
  const budgetUsedPct = overallBudget ? (totalExpense / overallBudget) * 100 : null;

  let budgetStatus = 'Within budget';
  if (budgetUsedPct && budgetUsedPct >= 100) {
    budgetStatus = 'Budget exceeded';
  } else if (budgetUsedPct && budgetUsedPct >= 80) {
    budgetStatus = 'Approaching budget';
  }

  // Days in month calculation for safe daily spend
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = (month === new Date().getMonth() && year === new Date().getFullYear())
    ? new Date().getDate()
    : daysInMonth;
  const daysRemaining = Math.max(1, daysInMonth - currentDay);
  const safeDailySpend = overallBudget && overallBudget > totalExpense
    ? Math.round((overallBudget - totalExpense) / daysRemaining)
    : 0;

  return {
    totalIncome,
    totalExpense,
    balance,
    savings,
    savingsRate,
    prevTotalExpense,
    prevTotalIncome,
    expenseChangePct,
    incomeChangePct,
    overallBudget,
    budgetUsedPct,
    budgetStatus,
    daysRemaining,
    safeDailySpend,
    transactionCount: monthExpenses.length
  };
};

export const calculateCategoryBreakdown = ({
  expenses = [],
  categories = [],
  month = new Date().getMonth(),
  year = new Date().getFullYear()
}) => {
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.expense_date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const totalSpent = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const map = new Map();
  categories.forEach(cat => {
    map.set(cat.id, {
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      is_discretionary: cat.is_discretionary,
      amount: 0,
      count: 0
    });
  });

  monthExpenses.forEach(exp => {
    let cat = map.get(exp.category_id);
    if (!cat) {
      cat = {
        id: exp.category_id || 'cat-other',
        name: exp.category_name || 'Miscellaneous',
        icon: 'Tag',
        color: '#6C757D',
        is_discretionary: true,
        amount: 0,
        count: 0
      };
      map.set(cat.id, cat);
    }
    cat.amount += Number(exp.amount);
    cat.count += 1;
  });

  const breakdown = Array.from(map.values())
    .filter(cat => cat.amount > 0)
    .map(cat => ({
      ...cat,
      percentage: totalSpent > 0 ? (cat.amount / totalSpent) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  return breakdown;
};

export const calculateMonthComparison = ({
  expenses = [],
  categories = [],
  month = new Date().getMonth(),
  year = new Date().getFullYear()
}) => {
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;

  const currentExpenses = expenses.filter(e => {
    const d = new Date(e.expense_date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const prevExpenses = expenses.filter(e => {
    const d = new Date(e.expense_date);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });

  const currTotal = currentExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const prevTotal = prevExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const totalDiff = currTotal - prevTotal;
  const totalChangePct = prevTotal > 0 ? (totalDiff / prevTotal) * 100 : 0;

  // Category comparisons
  const categoryChanges = [];
  categories.forEach(cat => {
    const currSpend = currentExpenses
      .filter(e => e.category_id === cat.id)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const prevSpend = prevExpenses
      .filter(e => e.category_id === cat.id)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    if (currSpend > 0 || prevSpend > 0) {
      const diff = currSpend - prevSpend;
      const changePct = prevSpend > 0 ? (diff / prevSpend) * 100 : (currSpend > 0 ? 100 : 0);

      categoryChanges.push({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        is_discretionary: cat.is_discretionary,
        current: currSpend,
        previous: prevSpend,
        diff,
        changePct
      });
    }
  });

  categoryChanges.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  return {
    currTotal,
    prevTotal,
    totalDiff,
    totalChangePct,
    categoryChanges
  };
};

export const calculateSpendingOverTime = ({
  expenses = [],
  period = 'month', // 'week', 'month', '6months', 'year'
  month = new Date().getMonth(),
  year = new Date().getFullYear()
}) => {
  const points = [];

  if (period === 'week') {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });

      const dayTotal = expenses
        .filter(e => e.expense_date === dateStr)
        .reduce((sum, e) => sum + Number(e.amount), 0);

      points.push({
        label: `${dayName} ${d.getDate()}`,
        date: dateStr,
        amount: dayTotal
      });
    }
  } else if (period === 'month') {
    // 4 weeks of current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const intervals = [
      { label: 'Day 1-7', start: 1, end: 7 },
      { label: 'Day 8-14', start: 8, end: 14 },
      { label: 'Day 15-21', start: 15, end: 21 },
      { label: `Day 22-${daysInMonth}`, start: 22, end: daysInMonth }
    ];

    intervals.forEach(inv => {
      const total = expenses
        .filter(e => {
          const d = new Date(e.expense_date);
          return (
            d.getMonth() === month &&
            d.getFullYear() === year &&
            d.getDate() >= inv.start &&
            d.getDate() <= inv.end
          );
        })
        .reduce((sum, e) => sum + Number(e.amount), 0);

      points.push({
        label: inv.label,
        amount: total
      });
    });
  } else if (period === '6months') {
    // Past 6 months
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(year, month - i, 1);
      const m = targetDate.getMonth();
      const y = targetDate.getFullYear();

      const total = expenses
        .filter(e => {
          const d = new Date(e.expense_date);
          return d.getMonth() === m && d.getFullYear() === y;
        })
        .reduce((sum, e) => sum + Number(e.amount), 0);

      points.push({
        label: `${getMonthName(m, 'short')}`,
        month: m,
        year: y,
        amount: total
      });
    }
  } else if (period === 'year') {
    // 12 months of the year
    for (let m = 0; m < 12; m++) {
      const total = expenses
        .filter(e => {
          const d = new Date(e.expense_date);
          return d.getMonth() === m && d.getFullYear() === year;
        })
        .reduce((sum, e) => sum + Number(e.amount), 0);

      points.push({
        label: `${getMonthName(m, 'short')}`,
        month: m,
        amount: total
      });
    }
  }

  const maxAmount = Math.max(...points.map(p => p.amount), 1);
  return points.map(p => ({
    ...p,
    pctOfMax: (p.amount / maxAmount) * 100
  }));
};

export const generateSmartInsights = ({
  expenses = [],
  income = [],
  categories = [],
  month = new Date().getMonth(),
  year = new Date().getFullYear()
}) => {
  const insights = [];
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.expense_date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  if (monthExpenses.length === 0) {
    return [
      {
        id: 'start-story',
        icon: 'Sparkles',
        type: 'info',
        title: 'Your spending story starts here',
        message: 'Add your first transaction to unlock dynamic spending analytics and savings recommendations.'
      }
    ];
  }

  const breakdown = calculateCategoryBreakdown({ expenses, categories, month, year });
  if (breakdown.length > 0) {
    const topCat = breakdown[0];
    insights.push({
      id: 'top-category',
      icon: 'PieChart',
      type: 'neutral',
      title: `${topCat.name} is your top expense`,
      message: `It constitutes ${topCat.percentage.toFixed(0)}% of your monthly expenditure with ${topCat.count} recorded payments.`
    });
  }

  // Weekend vs Weekday analysis
  let weekendSpend = 0;
  let weekdaySpend = 0;
  monthExpenses.forEach(e => {
    const day = new Date(e.expense_date).getDay();
    if (day === 0 || day === 6) weekendSpend += Number(e.amount);
    else weekdaySpend += Number(e.amount);
  });

  if (weekendSpend > 0 && weekdaySpend > 0) {
    const weekendAvg = weekendSpend / 8; // approx 8 weekend days
    const weekdayAvg = weekdaySpend / 22; // approx 22 weekdays
    if (weekendAvg > weekdayAvg * 1.3) {
      insights.push({
        id: 'weekend-spend',
        icon: 'Calendar',
        type: 'warning',
        title: 'Weekend spending is noticeably higher',
        message: `Your average weekend day outflow is ${((weekendAvg / weekdayAvg - 1) * 100).toFixed(0)}% higher than standard weekdays.`
      });
    }
  }

  // Highest transaction
  const sortedByAmt = [...monthExpenses].sort((a, b) => Number(b.amount) - Number(a.amount));
  if (sortedByAmt.length > 0 && sortedByAmt[0].amount > 2000) {
    insights.push({
      id: 'highest-transaction',
      icon: 'TrendingUp',
      type: 'info',
      title: 'Highest single transaction this month',
      message: `"${sortedByAmt[0].description}" on ${sortedByAmt[0].expense_date}.`
    });
  }

  return insights;
};
