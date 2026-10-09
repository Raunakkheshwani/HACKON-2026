import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import type { BudgetPeriod } from '../types';
import { X, Delete, ShieldCheck } from 'lucide-react';

interface OnboardingSheetProps {
  onClose: () => void;
}

export const OnboardingSheet: React.FC<OnboardingSheetProps> = ({ onClose }) => {
  const { setBudget } = useBudget();
  const [amount, setAmount] = useState('1000');
  const [period, setPeriod] = useState<BudgetPeriod>('Weekly');

  const handleKeyPress = (num: string) => {
    if (amount === '0') {
      setAmount(num);
    } else {
      setAmount(prev => prev + num);
    }
  };

  const handleDelete = () => {
    if (amount.length <= 1) {
      setAmount('0');
    } else {
      setAmount(prev => prev.slice(0, -1));
    }
  };

  const handlePreset = (val: number) => {
    setAmount(val.toString());
  };

  const handleSave = () => {
    const limit = parseFloat(amount);
    if (limit > 0) {
      setBudget(limit, period);
      onClose();
    }
  };

  return (
    <div className="bottom-sheet-overlay">
      <div className="bottom-sheet">
        {/* Header */}
        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--amazon-fresh-green)" />
            <span className="sheet-title" style={{ fontSize: '16px' }}>Set Budget Control</span>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Content */}
        <div className="sheet-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
          
          <div style={{ textAlign: 'center', margin: '5px 0' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Define your spending target to filter out expensive items
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>₹</span>
              <span style={{ fontSize: '42px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                {parseFloat(amount).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Period Selector Toggle */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Budget Rollover Cycle
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['Before Every Purchase', 'Weekly', 'Monthly'] as BudgetPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    border: period === p ? '2px solid var(--amazon-teal)' : '1px solid var(--amazon-border-gray)',
                    backgroundColor: period === p ? 'var(--amazon-teal-light)' : '#ffffff',
                    color: period === p ? 'var(--amazon-teal)' : 'var(--text-primary)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {p === 'Before Every Purchase' ? 'Per-Purchase' : p}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
            {[300, 500, 1000, 2500].map(val => (
              <button
                key={val}
                onClick={() => handlePreset(val)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f7f8f8',
                  border: '1px solid var(--amazon-border-gray)',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                +₹{val}
              </button>
            ))}
          </div>

          {/* Custom Stylized Numeric Keypad */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '8px', 
            backgroundColor: '#f7f8f8', 
            padding: '12px', 
            borderRadius: '12px',
            border: '1px solid var(--amazon-border-gray)'
          }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0'].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num)}
                style={{
                  height: '42px',
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  borderRadius: '6px',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleDelete}
              style={{
                height: '42px',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                border: 'none',
                borderRadius: '6px',
                fontSize: '18px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Delete size={18} />
            </button>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '5px' }}>
            <button 
              className="btn-primary" 
              onClick={handleSave}
              disabled={parseFloat(amount) <= 0}
              style={{ opacity: parseFloat(amount) <= 0 ? 0.6 : 1 }}
            >
              Activate Budget Control
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OnboardingSheet;
