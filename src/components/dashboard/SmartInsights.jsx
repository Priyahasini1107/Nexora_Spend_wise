import React from 'react';
import { Lightbulb, PieChart, Calendar, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';

const INSIGHT_ICONS = {
  PieChart,
  Calendar,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Lightbulb
};

export const SmartInsights = () => {
  const { smartInsights } = useExpenses();

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <Lightbulb size={20} />
            Smart Insights
          </h3>
          <p className="card-subtitle">
            Patterns observed in your actual data
          </p>
        </div>
        <span className="badge badge-lime">
          Calculated
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        {smartInsights.map(insight => {
          const Icon = INSIGHT_ICONS[insight.icon] || Lightbulb;

          let badgeBorder = 'var(--border-light)';
          let iconColor = 'var(--text-primary)';
          let iconBg = 'rgba(18, 20, 23, 0.05)';

          if (insight.type === 'warning') {
            iconColor = 'var(--color-warning)';
            iconBg = 'var(--color-warning-bg)';
          } else if (insight.type === 'success') {
            iconColor = 'var(--color-success)';
            iconBg = 'var(--color-success-bg)';
          }

          return (
            <div
              key={insight.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-card-subtle)',
                border: badgeBorder
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: iconBg,
                  color: iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Icon size={18} strokeWidth={2.2} />
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                  {insight.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {insight.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
