import React, { useState } from 'react';
import { X, Bot, Sparkles, Send, Lightbulb, CheckCircle2 } from 'lucide-react';
import { answerBudgetAssistantQuery } from '../../utils/aiBudgetPlannerEngine';

export const AIAssistantModal = ({ isOpen, onClose, currentPlan, currency }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      title: 'KuberPulse AI Budget Advisor',
      content: `Hello! I have analyzed your income of ${currency === 'INR' ? '₹' : '$'}${currentPlan?.totalIncome?.toLocaleString()} and active spending patterns. Ask me any question or tap a prompt below to optimize your monthly budget.`
    }
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'How do I accelerate my savings target?',
    'How can I optimize Food & Dining spending?',
    'Tips to reduce impulse Shopping & Apparel',
    'Explain the recommended overall ceiling'
  ];

  const handleSend = (textToSend) => {
    const text = textToSend || query;
    if (!text.trim()) return;

    // Add user message
    const userMsg = { sender: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    setTimeout(() => {
      const response = answerBudgetAssistantQuery(text, currentPlan, currency);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          title: response.title,
          content: response.content
        }
      ]);
      setLoading(false);
    }, 400);
  };

  return (
    <div
      className="modal-overlay as-bottom-sheet"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '560px', height: '85vh', display: 'flex', flexDirection: 'column', padding: '20px' }}
      >
        <div className="sheet-handle-bar" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: 'var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--text-primary)',
                color: 'var(--accent-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Bot size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  AI Budget Advisor
                </h3>
                <span className="badge badge-lime" style={{ fontSize: '0.65rem' }}>Active</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                Personalized advice based on your verified data
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ width: '34px', height: '34px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Chat History Container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-lg)',
                  background: msg.sender === 'user' ? 'var(--text-primary)' : 'var(--bg-card-subtle)',
                  color: msg.sender === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                  border: msg.sender === 'user' ? 'none' : 'var(--border-light)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {msg.title && (
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Sparkles size={13} color="var(--accent-lime-border)" />
                    {msg.title}
                  </div>
                )}
                <div style={{ fontSize: '0.86rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '6px' }}>
              <Sparkles size={14} className="pulse-accent" />
              <span>AI Advisor is calculating recommendations...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts Chips */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '10px',
            scrollbarWidth: 'none'
          }}
        >
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(18, 20, 23, 0.05)',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                border: 'var(--border-light)',
                cursor: 'pointer'
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: 'var(--border-light)' }}
        >
          <input
            type="text"
            placeholder="Ask about your budget, dining cutbacks, savings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="form-input"
            style={{ flex: 1, padding: '10px 14px', fontSize: '0.88rem' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '10px 16px' }}
            disabled={!query.trim() || loading}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
