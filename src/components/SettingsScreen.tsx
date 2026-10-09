import React from 'react';
import { useBudget } from '../context/BudgetContext';
import { ShieldCheck, History, Shield, Trash2, Calendar } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { budgetProfile, clearBudget, orders } = useBudget();

  return (
    <div className="responsive-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 12px' }}>
      
      {/* Active Profile Info */}
      <div 
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--amazon-border-gray)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: 'var(--amazon-card-shadow)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={20} color="var(--amazon-teal)" />
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111' }}>Budget Control Preferences</h3>
        </div>

        {budgetProfile.active ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <span style={{ color: 'var(--amazon-fresh-green)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> Active
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Budget Limit:</span>
                <span style={{ fontWeight: '700' }}>₹{budgetProfile.limit}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Rollover Period:</span>
                <span style={{ fontWeight: '700' }}>{budgetProfile.period}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Spent This Cycle:</span>
                <span style={{ fontWeight: '700' }}>₹{budgetProfile.spent}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Remaining Cushion:</span>
                <span style={{ color: 'var(--amazon-fresh-green)', fontWeight: '700' }}>₹{budgetProfile.remaining}</span>
              </div>
            </div>

            <button 
              onClick={clearBudget}
              style={{
                backgroundColor: 'rgba(244, 67, 54, 0.08)',
                border: '1px solid #f44336',
                borderRadius: '8px',
                color: '#f44336',
                padding: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '6px'
              }}
            >
              <Trash2 size={13} />
              Deactivate Budget Control
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '10px 0', fontSize: '13px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
              No budget limit set. Add item constraints to use smart shopping.
            </p>
          </div>
        )}
      </div>

      {/* History panel */}
      <div 
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--amazon-border-gray)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: 'var(--amazon-card-shadow)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={20} color="var(--amazon-teal)" />
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111' }}>Recent Order Receipts</h3>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
            No order history found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.map((order) => (
              <div 
                key={order.id}
                style={{
                  border: '1px solid var(--amazon-border-gray)',
                  borderRadius: '8px',
                  padding: '10px',
                  backgroundColor: '#f9f9f9',
                  fontSize: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', borderBottom: '1px solid #eee', paddingBottom: '4px', marginBottom: '6px' }}>
                  <span>{order.id}</span>
                  <span>₹{order.total}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={11} /> {order.date}
                  </span>
                  {order.budgetApplied && (
                    <span style={{ color: 'var(--amazon-fresh-green)', fontWeight: '600' }}>
                      ✓ Budget Adhered (₹{order.budgetLimit})
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {order.items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item.quantity}x {item.product.name}</span>
                      <span>₹{item.product.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security note */}
      <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '10px' }}>
        <span>Amazon Safe Shopping Program • Secure local data encryption</span>
      </div>

    </div>
  );
};

export default SettingsScreen;
