import { formatCurrency } from './formatters';

/**
 * AI Budget Planner Engine
 * Combines financial planning methodologies (50/30/20, Aggressive Wealth, Habit Optimizer)
 * with user's actual transaction history to construct actionable, balanced monthly budgets.
 */

export const BUDGET_STRATEGIES = [
  {
    id: 'habit-optimizer',
    name: 'Smart Habit Optimizer',
    tag: 'AI Recommended',
    description: 'Calibrates around your actual spending habits, gently trimming detected discretionary leakages.',
    needsPct: 52,
    wantsPct: 23,
    savingsPct: 25
  },
  {
    id: '50-30-20',
    name: '50 / 30 / 20 Rule',
    tag: 'Gold Standard',
    description: 'Allocates 50% to essential needs, 30% to lifestyle wants, and 20% to savings.',
    needsPct: 50,
    wantsPct: 30,
    savingsPct: 20
  },
  {
    id: 'aggressive-wealth',
    name: 'Aggressive Wealth Builder',
    tag: 'High Growth',
    description: 'Prioritizes maximum capital accumulation by keeping lifestyle wants strictly disciplined at 15-20%.',
    needsPct: 45,
    wantsPct: 15,
    savingsPct: 40
  },
  {
    id: 'balanced-lifestyle',
    name: 'Flexible Lifestyle',
    tag: 'Relaxed',
    description: 'Provides more breathing room for social dining, outings, and recreation.',
    needsPct: 55,
    wantsPct: 35,
    savingsPct: 10
  }
];

export const generateAIBudgetPlan = ({
  income = [],
  expenses = [],
  categories = [],
  profile = {},
  strategyId = 'habit-optimizer',
  month = new Date().getMonth(),
  year = new Date().getFullYear(),
  currency = 'INR'
}) => {
  // 1. Calculate Monthly Inflow Base
  const monthIncome = income.filter(i => {
    const d = new Date(i.income_date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  let totalIncome = monthIncome.reduce((sum, i) => sum + Number(i.amount), 0);
  
  // If current month has no income yet, fall back to previous month or default monthly baseline
  if (totalIncome === 0) {
    const allIncome = income.reduce((sum, i) => sum + Number(i.amount), 0);
    totalIncome = allIncome > 0 ? Math.round(allIncome / Math.max(1, new Set(income.map(i => i.income_date.substring(0, 7))).size)) : 60000;
  }

  // 2. Aggregate Recent Category Spend
  const currentMonthExpenses = expenses.filter(e => {
    const d = new Date(e.expense_date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const catSpendMap = new Map();
  currentMonthExpenses.forEach(exp => {
    const id = exp.category_id || 'cat-other';
    catSpendMap.set(id, (catSpendMap.get(id) || 0) + Number(exp.amount));
  });

  const totalCurrentSpent = currentMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // 3. Find selected strategy
  const strategy = BUDGET_STRATEGIES.find(s => s.id === strategyId) || BUDGET_STRATEGIES[0];

  const targetSavings = Math.round(totalIncome * (strategy.savingsPct / 100));
  const totalSpendable = totalIncome - targetSavings;
  const needsPool = Math.round(totalIncome * (strategy.needsPct / 100));
  const wantsPool = Math.round(totalIncome * (strategy.wantsPct / 100));

  // 4. Distribute allocations to categories
  const essentialCategories = categories.filter(c => !c.is_discretionary);
  const discretionaryCategories = categories.filter(c => c.is_discretionary);

  const allocations = [];

  // Essential category allocations
  const essentialWeightSum = essentialCategories.reduce((sum, c) => sum + (c.benchmark_pct || 10), 0);
  essentialCategories.forEach(cat => {
    const weight = (cat.benchmark_pct || 10) / essentialWeightSum;
    let allocated = Math.round(needsPool * weight);

    // If habit-optimizer, adjust slightly if user has real history
    const currentSpend = catSpendMap.get(cat.id) || 0;
    if (strategyId === 'habit-optimizer' && currentSpend > 0) {
      allocated = Math.max(currentSpend, allocated);
    }

    allocations.push({
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      color: cat.color,
      isDiscretionary: false,
      allocatedAmount: allocated,
      currentSpent: currentSpend,
      delta: allocated - currentSpend,
      recommendation: currentSpend > allocated
        ? `Exceeding target by ${formatCurrency(currentSpend - allocated, currency)}`
        : `Within safe buffer (${formatCurrency(allocated - currentSpend, currency)} remaining)`
    });
  });

  // Discretionary category allocations
  const discWeightSum = discretionaryCategories.reduce((sum, c) => sum + (c.benchmark_pct || 8), 0);
  discretionaryCategories.forEach(cat => {
    const weight = (cat.benchmark_pct || 8) / discWeightSum;
    let allocated = Math.round(wantsPool * weight);

    const currentSpend = catSpendMap.get(cat.id) || 0;
    if (strategyId === 'habit-optimizer' && currentSpend > 0) {
      // In habit optimizer, gently trim excessive discretionary spend by 15-20%
      if (currentSpend > allocated) {
        allocated = Math.round(currentSpend * 0.82);
      }
    }

    allocations.push({
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      color: cat.color,
      isDiscretionary: true,
      allocatedAmount: allocated,
      currentSpent: currentSpend,
      delta: allocated - currentSpend,
      recommendation: currentSpend > allocated
        ? `Trim suggested: ${formatCurrency(currentSpend - allocated, currency)}`
        : `Healthy room: +${formatCurrency(allocated - currentSpend, currency)}`
    });
  });

  const totalAllocatedBudget = allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);

  // 5. Generate AI Natural Language Rationale
  let aiExplanation = '';
  if (strategyId === 'habit-optimizer') {
    aiExplanation = `Based on your recent outflow of ${formatCurrency(totalCurrentSpent, currency)} against an income of ${formatCurrency(totalIncome, currency)}, this AI plan reserves ${formatCurrency(targetSavings, currency)} (${strategy.savingsPct}%) for wealth accumulation while rightsizing discretionary categories like Dining and Shopping.`;
  } else if (strategyId === '50-30-20') {
    aiExplanation = `The classic 50/30/20 plan assigns ${formatCurrency(needsPool, currency)} (50%) to your essential life needs (Groceries, Bills, Transport), ${formatCurrency(wantsPool, currency)} (30%) for discretionary recreation, and guarantees ${formatCurrency(targetSavings, currency)} (20%) monthly savings.`;
  } else if (strategyId === 'aggressive-wealth') {
    aiExplanation = `Built for rapid milestone progress. It caps discretionary spending strictly at ${formatCurrency(wantsPool, currency)} to unlock a massive ${formatCurrency(targetSavings, currency)} (${strategy.savingsPct}%) monthly savings rate.`;
  } else {
    aiExplanation = `A balanced, low-stress allocation offering ${formatCurrency(wantsPool, currency)} for recreation and social dining while keeping essential bills smoothly covered.`;
  }

  return {
    strategy,
    totalIncome,
    totalAllocatedBudget,
    targetSavings,
    savingsRate: strategy.savingsPct,
    needsPool,
    wantsPool,
    allocations,
    aiExplanation
  };
};

/**
 * AI Assistant Query Handler: Answers financial budgeting questions
 * using real numbers and actionable intelligence.
 */
export const answerBudgetAssistantQuery = (query, plan, currency = 'INR') => {
  const q = query.toLowerCase();

  if (q.includes('save') || q.includes('goal') || q.includes('faster')) {
    return {
      title: 'Accelerating Your Savings Target',
      content: `Under the ${plan.strategy.name}, you are currently scheduled to retain ${formatCurrency(plan.targetSavings, currency)} this month. To accelerate this:
1. Switching to the "Aggressive Wealth Builder" will increase your monthly savings by ~${formatCurrency(Math.round(plan.totalIncome * 0.15), currency)}.
2. The fastest lever is trimming Dining Out and Shopping by 15%, which immediately retains another ${formatCurrency(1200, currency)} – ${formatCurrency(2400, currency)}.`
    };
  }

  if (q.includes('dining') || q.includes('food') || q.includes('swiggy') || q.includes('zomato')) {
    const foodAlloc = plan.allocations.find(a => a.categoryName.includes('Food'));
    return {
      title: 'Food & Dining Optimization',
      content: `Your AI target for Food & Dining is ${formatCurrency(foodAlloc ? foodAlloc.allocatedAmount : 4500, currency)}.
• Tip: Pre-cooking weekday dinners and reserving food delivery apps exclusively for weekends typically reduces food expenditure by 35% without reducing enjoyment.`
    };
  }

  if (q.includes('shopping') || q.includes('clothes') || q.includes('amazon')) {
    const shopAlloc = plan.allocations.find(a => a.categoryName.includes('Shopping'));
    return {
      title: 'Shopping & Cart Control',
      content: `Your target allocation for Shopping & Apparel is ${formatCurrency(shopAlloc ? shopAlloc.allocatedAmount : 3500, currency)}.
• Tip: Implement a 48-hour cart hold rule on Amazon/Myntra checkouts. Studies show that 68% of impulse online purchases are voluntarily abandoned after 48 hours.`
    };
  }

  return {
    title: 'AI Budget Recommendation',
    content: `For your monthly income of ${formatCurrency(plan.totalIncome, currency)}, the recommended overall ceiling is ${formatCurrency(plan.totalAllocatedBudget, currency)}, retaining ${formatCurrency(plan.targetSavings, currency)} (${plan.savingsRate}%) as a safety reserve. Clicking "Apply AI Plan" will automatically calibrate your category limits.`
  };
};
