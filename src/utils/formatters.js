export const formatCurrency = (amount, currencyCode = 'INR') => {
  const num = Number(amount) || 0;
  
  if (currencyCode === 'INR') {
    // Format Indian Rupee with Indian number grouping: ₹1,23,456.00
    const parts = num.toFixed(0).split('.');
    let integerPart = parts[0];
    const isNegative = integerPart.startsWith('-');
    if (isNegative) integerPart = integerPart.substring(1);

    let lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }
    const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
    return `${isNegative ? '-' : ''}₹${formatted}`;
  }

  // Standard international currency formatting
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(num);
};

export const formatDate = (dateString, style = 'short') => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  if (style === 'short') {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  }

  if (style === 'full') {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  if (style === 'relative') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((today - target) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7 && diffDays > 1) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  return date.toLocaleDateString();
};

export const formatPercentage = (value, showSign = true) => {
  const num = Number(value) || 0;
  const prefix = showSign && num > 0 ? '+' : '';
  return `${prefix}${num.toFixed(1)}%`;
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const getMonthName = (monthIndex, format = 'long') => {
  const date = new Date(2026, monthIndex, 1);
  return date.toLocaleString('en-IN', { month: format });
};
