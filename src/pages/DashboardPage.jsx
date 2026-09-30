import React, { useState, useMemo } from 'react';
import { FinancialOverview } from '../components/dashboard/FinancialOverview';
import { AIBudgetPlanner } from '../components/dashboard/AIBudgetPlanner';
import { SpendingChart } from '../components/dashboard/SpendingChart';
import { WhereCanISave } from '../components/dashboard/WhereCanISave';
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown';
import { BudgetProgress } from '../components/dashboard/BudgetProgress';
import { MonthComparison } from '../components/dashboard/MonthComparison';
import { SmartInsights } from '../components/dashboard/SmartInsights';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { AIAssistantModal } from '../components/dashboard/AIAssistantModal';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import { generateAIBudgetPlan } from '../utils/aiBudgetPlannerEngine';

export const DashboardPage = () => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const { income, expenses, categories, selectedMonth, selectedYear, currency } = useExpenses();
  const { profile } = useAuth();

  const currentPlan = useMemo(() => {
    return generateAIBudgetPlan({
      income,
      expenses,
      categories,
      profile,
      month: selectedMonth,
      year: selectedYear,
      currency
    });
  }, [income, expenses, categories, profile, selectedMonth, selectedYear, currency]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Top Financial Inflow/Outflow/Balance Cards */}
      <FinancialOverview />

      {/* 2. AI Budget Planner Hero Section */}
      <AIBudgetPlanner onOpenAssistant={() => setIsAssistantOpen(true)} />

      {/* 3. Middle Row: Spending Trend Chart & HERO "WHERE CAN I SAVE?" Spotlight */}
      <div className="dashboard-grid">
        <div className="col-8">
          <SpendingChart />
        </div>
        <div className="col-4">
          <WhereCanISave />
        </div>
      </div>

      {/* 4. Breakdown & Comparison Row */}
      <div className="dashboard-grid">
        <div className="col-4">
          <CategoryBreakdown />
        </div>
        <div className="col-4">
          <BudgetProgress />
        </div>
        <div className="col-4">
          <MonthComparison />
        </div>
      </div>

      {/* 5. Bottom Row: Smart Insights & Recent Transactions */}
      <div className="dashboard-grid">
        <div className="col-4">
          <SmartInsights />
        </div>
        <div className="col-8">
          <RecentTransactions />
        </div>
      </div>

      {/* AI Budget Assistant Modal */}
      <AIAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        currentPlan={currentPlan}
        currency={currency}
      />
    </div>
  );
};
