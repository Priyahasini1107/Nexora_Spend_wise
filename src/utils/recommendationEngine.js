import { DEFAULT_CATEGORIES } from '../lib/constants';
import { formatCurrency } from './formatters';

/**
 * Deterministic Expense Recommendation & Savings Intelligence Engine
 * Transparent, explainable, and grounded strictly in user's actual expense data.
 */

export const analyzeSavingsOpportunities = ({
  expenses = [],
  categories = DEFAULT_CATEGORIES,
  budgets = [],
  currentMonth = new Date().getMonth(),
  currentYear = new Date().getFullYear(),
  currency = 'INR'
}) => {
  // 1. Separate current month and previous month expenses
  const currentMonthExpenses = expenses.filter(exp => {
    const d = new Date(exp.expense_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const prevMonthExpenses = expenses.filter(exp => {
    const d = new Date(exp.expense_date);
    return d.getMonth() === prevMonthIndex && d.getFullYear() === prevMonthYear;
  });

  const totalCurrentSpent = currentMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalPrevSpent = prevMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  if (totalCurrentSpent === 0) {
    return {
      hasData: false,
      totalPotentialSavingsMin: 0,
      totalPotentialSavingsMax: 0,
      opportunities: [],
      summary: 'Add expenses for this month to discover tailored saving opportunities.'
    };
  }

  // 2. Aggregate category-level totals
  const categoryMap = new Map();
  categories.forEach(cat => {
    categoryMap.set(cat.id, {
      ...cat,
      currentSpent: 0,
      prevSpent: 0,
      transactionCount: 0,
      budget: null
    });
  });

  // Attach current month spend
  currentMonthExpenses.forEach(exp => {
    const cat = categoryMap.get(exp.category_id) || {
      id: exp.category_id || 'cat-other',
      name: exp.category_name || 'Miscellaneous',
      color: '#6C757D',
      icon: 'Tag',
      is_discretionary: true,
      currentSpent: 0,
      prevSpent: 0,
      transactionCount: 0
    };
    cat.currentSpent += Number(exp.amount);
    cat.transactionCount += 1;
    categoryMap.set(cat.id, cat);
  });

  // Attach previous month spend
  prevMonthExpenses.forEach(exp => {
    const cat = categoryMap.get(exp.category_id);
    if (cat) {
      cat.prevSpent += Number(exp.amount);
    }
  });

  // Attach budgets
  budgets.forEach(b => {
    if (b.category_id && categoryMap.has(b.category_id)) {
      categoryMap.get(b.category_id).budget = Number(b.amount);
    }
  });

  const opportunities = [];
  let totalMinSavings = 0;
  let totalMaxSavings = 0;

  // 3. Evaluate each category with explainable logic
  for (const cat of categoryMap.values()) {
    if (cat.currentSpent <= 0) continue;

    const shareOfTotal = (cat.currentSpent / totalCurrentSpent) * 100;
    const diffFromPrev = cat.currentSpent - cat.prevSpent;
    const pctChangeFromPrev = cat.prevSpent > 0 ? (diffFromPrev / cat.prevSpent) * 100 : 0;
    const hasExceededBudget = cat.budget && cat.currentSpent > cat.budget;
    const budgetOverage = hasExceededBudget ? cat.currentSpent - cat.budget : 0;

    let opportunity = null;

    // A. Discretionary overspending detection
    if (cat.is_discretionary) {
      // Condition 1: Significant increase compared to previous month
      if (cat.prevSpent > 0 && pctChangeFromPrev >= 15) {
        // Savings range: ~50% to 80% of the recent surge
        const minSave = Math.round(diffFromPrev * 0.5);
        const maxSave = Math.round(diffFromPrev * 0.85);

        opportunity = {
          categoryId: cat.id,
          categoryName: cat.name,
          categoryIcon: cat.icon,
          color: cat.color,
          isDiscretionary: true,
          urgency: pctChangeFromPrev > 35 ? 'high' : 'medium',
          currentSpent: cat.currentSpent,
          prevSpent: cat.prevSpent,
          potentialMin: minSave,
          potentialMax: maxSave,
          title: `${cat.name} spending spiked by ${pctChangeFromPrev.toFixed(0)}%`,
          why: `You spent ${formatCurrency(cat.currentSpent, currency)} this month compared to ${formatCurrency(cat.prevSpent, currency)} last month. That is an extra ${formatCurrency(diffFromPrev, currency)} in discretionary spending.`,
          suggestion: getActionableSuggestion(cat.name, minSave, maxSave, currency),
          type: 'spike'
        };
      }
      // Condition 2: High proportion of monthly budget (> 18% of total spending)
      else if (shareOfTotal >= 18 && cat.currentSpent >= 2500) {
        const targetTrimPct = 0.20; // Trimming 20%
        const minSave = Math.round(cat.currentSpent * 0.15);
        const maxSave = Math.round(cat.currentSpent * 0.25);

        opportunity = {
          categoryId: cat.id,
          categoryName: cat.name,
          categoryIcon: cat.icon,
          color: cat.color,
          isDiscretionary: true,
          urgency: shareOfTotal > 25 ? 'high' : 'medium',
          currentSpent: cat.currentSpent,
          prevSpent: cat.prevSpent,
          potentialMin: minSave,
          potentialMax: maxSave,
          title: `High discretionary share: ${shareOfTotal.toFixed(0)}% of monthly budget`,
          why: `${cat.name} accounts for ${shareOfTotal.toFixed(1)}% of all your monthly expenses (${formatCurrency(cat.currentSpent, currency)} across ${cat.transactionCount} transactions).`,
          suggestion: getActionableSuggestion(cat.name, minSave, maxSave, currency),
          type: 'high_share'
        };
      }
      // Condition 3: Budget breached
      else if (hasExceededBudget) {
        const minSave = Math.round(budgetOverage * 0.8);
        const maxSave = Math.round(budgetOverage);

        opportunity = {
          categoryId: cat.id,
          categoryName: cat.name,
          categoryIcon: cat.icon,
          color: cat.color,
          isDiscretionary: true,
          urgency: 'high',
          currentSpent: cat.currentSpent,
          prevSpent: cat.prevSpent,
          potentialMin: minSave,
          potentialMax: maxSave,
          title: `Exceeded monthly budget by ${formatCurrency(budgetOverage, currency)}`,
          why: `Your set budget was ${formatCurrency(cat.budget, currency)}, but recorded spend reached ${formatCurrency(cat.currentSpent, currency)}.`,
          suggestion: `Pausing non-essential orders for the rest of the cycle will realign you with your original budget.`,
          type: 'budget_exceeded'
        };
      }
    } 
    // B. Essential Category Attention (Healthcare, Bills, Groceries)
    // Non-discretionary: Never treat as frivolous, but inform user of anomalous spikes
    else {
      if (cat.prevSpent > 0 && pctChangeFromPrev >= 30 && diffFromPrev > 1000) {
        opportunity = {
          categoryId: cat.id,
          categoryName: cat.name,
          categoryIcon: cat.icon,
          color: cat.color,
          isDiscretionary: false,
          urgency: 'info',
          currentSpent: cat.currentSpent,
          prevSpent: cat.prevSpent,
          potentialMin: 0,
          potentialMax: 0,
          title: `Notice: ${cat.name} outflow is higher than usual (+${pctChangeFromPrev.toFixed(0)}%)`,
          why: `Essential expenses in ${cat.name} rose from ${formatCurrency(cat.prevSpent, currency)} to ${formatCurrency(cat.currentSpent, currency)}. Because this is essential, prioritize necessity while checking for duplicate billings or annual insurance renewals.`,
          suggestion: `Review itemized bills or utility usage trends to ensure no unintentional billing errors occurred.`,
          type: 'essential_notice'
        };
      }
    }

    if (opportunity) {
      opportunities.push(opportunity);
      totalMinSavings += opportunity.potentialMin;
      totalMaxSavings += opportunity.potentialMax;
    }
  }

  // Sort opportunities by urgency and highest potential savings
  opportunities.sort((a, b) => {
    if (a.urgency === 'high' && b.urgency !== 'high') return -1;
    if (b.urgency === 'high' && a.urgency !== 'high') return 1;
    return b.potentialMax - a.potentialMax;
  });

  return {
    hasData: true,
    totalCurrentSpent,
    totalPrevSpent,
    totalPotentialSavingsMin: totalMinSavings,
    totalPotentialSavingsMax: totalMaxSavings,
    opportunities,
    summary: opportunities.length > 0
      ? `By adjusting discretionary categories like ${opportunities[0].categoryName}, you could comfortably retain ${formatCurrency(totalMinSavings, currency)} – ${formatCurrency(totalMaxSavings, currency)} this month.`
      : 'Your spending is disciplined and well within typical historical ranges across all categories.'
  };
};

function getActionableSuggestion(categoryName, minSave, maxSave, currency) {
  const minFmt = formatCurrency(minSave, currency);
  const maxFmt = formatCurrency(maxSave, currency);

  switch (categoryName) {
    case 'Food & Dining':
      return `Replacing 2 restaurant deliveries per week with home-cooked meals or meal prepping can easily retain ${minFmt} – ${maxFmt}.`;
    case 'Shopping & Apparel':
      return `Applying a 48-hour "cooling period" for impulsive online cart checkouts typically reduces non-urgent buys by ${minFmt} – ${maxFmt}.`;
    case 'Entertainment & OTT':
      return `Audit recurring subscriptions; pausing dormant video/music apps or sharing family plans can recover ~${minFmt} every month.`;
    case 'Travel & Outings':
      return `Booking weekend travel 10-14 days earlier and comparing shared rides can preserve ${minFmt} – ${maxFmt}.`;
    case 'Personal Care':
      return `Spacing salon or specialty grooming sessions by an extra 10 days can save ${minFmt} over a quarterly cycle.`;
    default:
      return `Trimming small frequent impulse expenses in this discretionary group could free up ${minFmt} – ${maxFmt} for your savings goal.`;
  }
}
