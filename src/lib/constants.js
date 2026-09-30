export const DEFAULT_CATEGORIES = [
  {
    id: 'cat-food',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: '#FF6B6B',
    is_discretionary: true,
    benchmark_pct: 15
  },
  {
    id: 'cat-groceries',
    name: 'Groceries',
    icon: 'ShoppingCart',
    color: '#2EC4B6',
    is_discretionary: false,
    benchmark_pct: 20
  },
  {
    id: 'cat-transport',
    name: 'Transportation',
    icon: 'Car',
    color: '#3A86FF',
    is_discretionary: false,
    benchmark_pct: 10
  },
  {
    id: 'cat-shopping',
    name: 'Shopping & Apparel',
    icon: 'ShoppingBag',
    color: '#FF9F1C',
    is_discretionary: true,
    benchmark_pct: 8
  },
  {
    id: 'cat-entertainment',
    name: 'Entertainment & OTT',
    icon: 'Film',
    color: '#9B5DE5',
    is_discretionary: true,
    benchmark_pct: 5
  },
  {
    id: 'cat-bills',
    name: 'Bills & Utilities',
    icon: 'Receipt',
    color: '#00BBF9',
    is_discretionary: false,
    benchmark_pct: 12
  },
  {
    id: 'cat-health',
    name: 'Healthcare & Meds',
    icon: 'HeartPulse',
    color: '#E63946',
    is_discretionary: false,
    benchmark_pct: 7
  },
  {
    id: 'cat-education',
    name: 'Education & Books',
    icon: 'GraduationCap',
    color: '#06D6A0',
    is_discretionary: false,
    benchmark_pct: 8
  },
  {
    id: 'cat-travel',
    name: 'Travel & Outings',
    icon: 'Plane',
    color: '#F77F00',
    is_discretionary: true,
    benchmark_pct: 5
  },
  {
    id: 'cat-personal',
    name: 'Personal Care',
    icon: 'Sparkles',
    color: '#E056FD',
    is_discretionary: true,
    benchmark_pct: 4
  },
  {
    id: 'cat-other',
    name: 'Miscellaneous',
    icon: 'MoreHorizontal',
    color: '#6C757D',
    is_discretionary: true,
    benchmark_pct: 6
  }
];

export const PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)', icon: 'Smartphone' },
  { id: 'Card', label: 'Credit / Debit Card', icon: 'CreditCard' },
  { id: 'Cash', label: 'Cash', icon: 'Banknote' },
  { id: 'NetBanking', label: 'Net Banking', icon: 'Building' },
  { id: 'Other', label: 'Other Method', icon: 'Wallet' }
];

export const INCOME_SOURCES = [
  'Salary',
  'Freelance / Client',
  'Business Income',
  'Investment Return / Dividend',
  'Rental Income',
  'Allowance / Gift',
  'Bonus',
  'Other'
];

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' }
];
