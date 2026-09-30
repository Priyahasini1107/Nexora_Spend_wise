// Realistic Seed / Sandbox Data for INR Expenses & Incomes
// Demonstrates rich patterns, discretionary overspending, and MoM trends

export const MOCK_USER = {
  id: 'usr_demo_8829',
  email: 'arjun.sharma@example.com',
  user_metadata: {
    full_name: 'Arjun Sharma',
    avatar_url: ''
  }
};

export const MOCK_PROFILE = {
  id: 'usr_demo_8829',
  full_name: 'Arjun Sharma',
  email: 'arjun.sharma@example.com',
  currency: 'INR',
  monthly_savings_goal: 25000,
  created_at: '2026-01-15T09:00:00Z'
};

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth(); // 0-indexed

// Helper to generate dynamic dates in current and previous months
const getDateInCurrentMonth = (day) => {
  const d = new Date(currentYear, currentMonth, Math.min(day, 28));
  return d.toISOString().split('T')[0];
};

const getDateInPrevMonth = (day) => {
  const d = new Date(currentYear, currentMonth - 1, Math.min(day, 28));
  return d.toISOString().split('T')[0];
};

const getDateInTwoMonthsAgo = (day) => {
  const d = new Date(currentYear, currentMonth - 2, Math.min(day, 28));
  return d.toISOString().split('T')[0];
};

export const MOCK_EXPENSES = [
  // Current Month Expenses
  {
    id: 'exp-101',
    user_id: 'usr_demo_8829',
    category_id: 'cat-food',
    category_name: 'Food & Dining',
    amount: 1450,
    description: 'Swiggy Gourmet Dinner & Delivery',
    expense_date: getDateInCurrentMonth(26),
    payment_method: 'UPI',
    notes: 'Dinner with friends'
  },
  {
    id: 'exp-102',
    user_id: 'usr_demo_8829',
    category_id: 'cat-shopping',
    category_name: 'Shopping & Apparel',
    amount: 3200,
    description: 'Zara Weekend Casual Shirts',
    expense_date: getDateInCurrentMonth(24),
    payment_method: 'Card',
    notes: 'Sale discount'
  },
  {
    id: 'exp-103',
    user_id: 'usr_demo_8829',
    category_id: 'cat-groceries',
    category_name: 'Groceries',
    amount: 4850,
    description: 'Nature Basket Weekly Vegetables & Pantry',
    expense_date: getDateInCurrentMonth(22),
    payment_method: 'UPI',
    notes: 'Monthly staples'
  },
  {
    id: 'exp-104',
    user_id: 'usr_demo_8829',
    category_id: 'cat-food',
    category_name: 'Food & Dining',
    amount: 680,
    description: 'Blue Tokai Specialty Coffee & Croissant',
    expense_date: getDateInCurrentMonth(20),
    payment_method: 'UPI',
    notes: 'Work from cafe'
  },
  {
    id: 'exp-105',
    user_id: 'usr_demo_8829',
    category_id: 'cat-transport',
    category_name: 'Transportation',
    amount: 1250,
    description: 'Uber Premier rides to BKC office',
    expense_date: getDateInCurrentMonth(19),
    payment_method: 'UPI',
    notes: ''
  },
  {
    id: 'exp-106',
    user_id: 'usr_demo_8829',
    category_id: 'cat-entertainment',
    category_name: 'Entertainment & OTT',
    amount: 1199,
    description: 'Netflix 4K Premium & Spotify Family',
    expense_date: getDateInCurrentMonth(15),
    payment_method: 'Card',
    notes: 'Recurring auto-debit'
  },
  {
    id: 'exp-107',
    user_id: 'usr_demo_8829',
    category_id: 'cat-shopping',
    category_name: 'Shopping & Apparel',
    amount: 2499,
    description: 'Amazon Electronics & Gadget Desk Mat',
    expense_date: getDateInCurrentMonth(14),
    payment_method: 'Card',
    notes: ''
  },
  {
    id: 'exp-108',
    user_id: 'usr_demo_8829',
    category_id: 'cat-food',
    category_name: 'Food & Dining',
    amount: 2200,
    description: 'Zomato Italian Trattoria Family Order',
    expense_date: getDateInCurrentMonth(11),
    payment_method: 'UPI',
    notes: ''
  },
  {
    id: 'exp-109',
    user_id: 'usr_demo_8829',
    category_id: 'cat-bills',
    category_name: 'Bills & Utilities',
    amount: 2650,
    description: 'Tata Power Electricity Bill',
    expense_date: getDateInCurrentMonth(8),
    payment_method: 'NetBanking',
    notes: 'September bill'
  },
  {
    id: 'exp-110',
    user_id: 'usr_demo_8829',
    category_id: 'cat-bills',
    category_name: 'Bills & Utilities',
    amount: 1199,
    description: 'Airtel Fiber 300Mbps Broadband',
    expense_date: getDateInCurrentMonth(5),
    payment_method: 'UPI',
    notes: ''
  },
  {
    id: 'exp-111',
    user_id: 'usr_demo_8829',
    category_id: 'cat-food',
    category_name: 'Food & Dining',
    amount: 1850,
    description: 'Weekend Brunch at Bistro',
    expense_date: getDateInCurrentMonth(4),
    payment_method: 'Card',
    notes: ''
  },
  {
    id: 'exp-112',
    user_id: 'usr_demo_8829',
    category_id: 'cat-health',
    category_name: 'Healthcare & Meds',
    amount: 1450,
    description: 'Apollo Pharmacy Vitamins & Consult',
    expense_date: getDateInCurrentMonth(2),
    payment_method: 'UPI',
    notes: ''
  },

  // Previous Month (For Month-over-Month comparison)
  {
    id: 'exp-201',
    user_id: 'usr_demo_8829',
    category_id: 'cat-food',
    category_name: 'Food & Dining',
    amount: 4200,
    description: 'Total dining & food orders (Prev month)',
    expense_date: getDateInPrevMonth(20),
    payment_method: 'UPI'
  },
  {
    id: 'exp-202',
    user_id: 'usr_demo_8829',
    category_id: 'cat-shopping',
    category_name: 'Shopping & Apparel',
    amount: 2800,
    description: 'Apparel & essentials (Prev month)',
    expense_date: getDateInPrevMonth(15),
    payment_method: 'Card'
  },
  {
    id: 'exp-203',
    user_id: 'usr_demo_8829',
    category_id: 'cat-groceries',
    category_name: 'Groceries',
    amount: 5200,
    description: 'Supermarket groceries (Prev month)',
    expense_date: getDateInPrevMonth(10),
    payment_method: 'UPI'
  },
  {
    id: 'exp-204',
    user_id: 'usr_demo_8829',
    category_id: 'cat-transport',
    category_name: 'Transportation',
    amount: 2100,
    description: 'Fuel & metro passes (Prev month)',
    expense_date: getDateInPrevMonth(8),
    payment_method: 'UPI'
  },
  {
    id: 'exp-205',
    user_id: 'usr_demo_8829',
    category_id: 'cat-bills',
    category_name: 'Bills & Utilities',
    amount: 3800,
    description: 'Utilities & broadband (Prev month)',
    expense_date: getDateInPrevMonth(5),
    payment_method: 'NetBanking'
  },
  {
    id: 'exp-206',
    user_id: 'usr_demo_8829',
    category_id: 'cat-entertainment',
    category_name: 'Entertainment & OTT',
    amount: 1500,
    description: 'Movies & subscriptions (Prev month)',
    expense_date: getDateInPrevMonth(3),
    payment_method: 'Card'
  },

  // 2 Months Ago
  {
    id: 'exp-301',
    user_id: 'usr_demo_8829',
    category_id: 'cat-food',
    category_name: 'Food & Dining',
    amount: 3900,
    description: 'Food & groceries',
    expense_date: getDateInTwoMonthsAgo(15),
    payment_method: 'UPI'
  },
  {
    id: 'exp-302',
    user_id: 'usr_demo_8829',
    category_id: 'cat-shopping',
    category_name: 'Shopping & Apparel',
    amount: 2200,
    description: 'Shopping items',
    expense_date: getDateInTwoMonthsAgo(12),
    payment_method: 'Card'
  },
  {
    id: 'exp-303',
    user_id: 'usr_demo_8829',
    category_id: 'cat-groceries',
    category_name: 'Groceries',
    amount: 4900,
    description: 'Monthly grocery',
    expense_date: getDateInTwoMonthsAgo(7),
    payment_method: 'UPI'
  }
];

export const MOCK_INCOME = [
  {
    id: 'inc-101',
    user_id: 'usr_demo_8829',
    amount: 72000,
    source: 'Salary',
    income_date: getDateInCurrentMonth(1),
    description: 'Monthly Corporate Salary Credited'
  },
  {
    id: 'inc-102',
    user_id: 'usr_demo_8829',
    amount: 18500,
    source: 'Freelance / Client',
    income_date: getDateInCurrentMonth(15),
    description: 'FinTech Mobile App UI Design Milestone'
  },
  {
    id: 'inc-201',
    user_id: 'usr_demo_8829',
    amount: 72000,
    source: 'Salary',
    income_date: getDateInPrevMonth(1),
    description: 'Corporate Salary'
  },
  {
    id: 'inc-202',
    user_id: 'usr_demo_8829',
    amount: 12000,
    source: 'Freelance / Client',
    income_date: getDateInPrevMonth(18),
    description: 'Website Redesign'
  }
];

export const MOCK_BUDGETS = [
  // Total Monthly Budget
  {
    id: 'bud-overall',
    user_id: 'usr_demo_8829',
    category_id: null,
    amount: 38000,
    month: currentMonth + 1,
    year: currentYear
  },
  // Category specific budgets
  {
    id: 'bud-food',
    user_id: 'usr_demo_8829',
    category_id: 'cat-food',
    amount: 5000,
    month: currentMonth + 1,
    year: currentYear
  },
  {
    id: 'bud-shopping',
    user_id: 'usr_demo_8829',
    category_id: 'cat-shopping',
    amount: 4000,
    month: currentMonth + 1,
    year: currentYear
  },
  {
    id: 'bud-groceries',
    user_id: 'usr_demo_8829',
    category_id: 'cat-groceries',
    amount: 6000,
    month: currentMonth + 1,
    year: currentYear
  },
  {
    id: 'bud-transport',
    user_id: 'usr_demo_8829',
    category_id: 'cat-transport',
    amount: 2500,
    month: currentMonth + 1,
    year: currentYear
  }
];
