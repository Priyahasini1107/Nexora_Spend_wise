import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Car,
  ShoppingBag,
  Film,
  Receipt,
  HeartPulse,
  GraduationCap,
  Plane,
  Sparkles,
  MoreHorizontal,
  Tag,
  Wallet,
  Briefcase,
  TrendingUp,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
  PiggyBank
} from 'lucide-react';

const ICON_MAP = {
  Utensils,
  ShoppingCart,
  Car,
  ShoppingBag,
  Film,
  Receipt,
  HeartPulse,
  GraduationCap,
  Plane,
  Sparkles,
  MoreHorizontal,
  Tag,
  Wallet,
  Briefcase,
  TrendingUp,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
  PiggyBank
};

export const CategoryIcon = ({
  icon = 'Tag',
  color = '#121417',
  size = 20,
  containerSize = 40,
  className = ''
}) => {
  const IconComponent = ICON_MAP[icon] || Tag;

  return (
    <div
      className={`cat-icon-container ${className}`}
      style={{
        width: `${containerSize}px`,
        height: `${containerSize}px`,
        borderRadius: '12px',
        backgroundColor: `${color}18`, // 10% opacity background
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
    >
      <IconComponent size={size} color={color} strokeWidth={2.2} />
    </div>
  );
};
