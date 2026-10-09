import React from 'react';
import { useBudget } from '../context/BudgetContext';
import type { Product } from '../types';
import { mockInventory } from '../data/mockInventory';
import { RefreshCw, TrendingDown } from 'lucide-react';

export const SmartSwapBanner: React.FC = () => {
  const { cart, budgetProfile, applySmartSwap } = useBudget();

  if (cart.length === 0) return null;

  // Let's search if there is any item in the cart that has a budget alternative
  const findSwapCandidates = () => {
    const candidates: Array<{
      currentProduct: Product;
      alternativeProduct: Product;
      quantity: number;
      savings: number;
    }> = [];

    cart.forEach(item => {
      const prod = item.product;
      
      // Let's see if there's any product in mockInventory that is a budget-alternative OR standard
      // that lists this product's ID as alternativeForId, OR if this product is premium
      // and has a cheaper version in the same category.
      let alternative: Product | undefined;

      if (prod.quality === 'premium') {
        // Find if there is a standard or budget-alternative item that is linked to it, or in the same category
        alternative = mockInventory.find(p => p.alternativeForId === prod.id);
        
        // If not found directly, find the cheapest in the same category
        if (!alternative) {
          alternative = mockInventory
            .filter(p => p.category === prod.category && p.quality !== 'premium')
            .sort((a, b) => a.price - b.price)[0];
        }
      } else if (prod.quality === 'standard') {
        // Find if there is a budget-alternative linked to it or in the same category
        alternative = mockInventory.find(p => p.alternativeForId === prod.id && p.quality === 'budget-alternative');
      }

      if (alternative && alternative.price < prod.price) {
        const savings = (prod.price - alternative.price) * item.quantity;
        candidates.push({
          currentProduct: prod,
          alternativeProduct: alternative,
          quantity: item.quantity,
          savings
        });
      }
    });

    // Sort by largest savings first
    return candidates.sort((a, b) => b.savings - a.savings);
  };

  const swapCandidates = findSwapCandidates();

  if (swapCandidates.length === 0) return null;

  // We show the swap candidate that gives the highest savings
  const bestCandidate = swapCandidates[0];
  const { currentProduct, alternativeProduct, quantity, savings } = bestCandidate;

  // If budget is active and we are near the limit, or if the user just wants to save money
  const isBudgetViolated = budgetProfile.active && (budgetProfile.remaining < 0 || budgetProfile.remaining < 150);

  return (
    <div 
      style={{
        margin: '12px',
        backgroundColor: isBudgetViolated ? '#fffcf5' : '#eaf6e8',
        border: `1.5px solid ${isBudgetViolated ? '#ff9900' : 'var(--amazon-fresh-green)'}`,
        borderRadius: '10px',
        padding: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <div 
          style={{
            backgroundColor: isBudgetViolated ? 'rgba(255,153,0,0.1)' : 'rgba(29,136,2,0.1)',
            borderRadius: '50%',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isBudgetViolated ? 'var(--amazon-orange)' : 'var(--amazon-fresh-green)'
          }}
        >
          <TrendingDown size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#111', marginBottom: '2px' }}>
            {isBudgetViolated ? 'Budget Alert: Smart Swap Suggested' : 'Optimize Your Spending'}
          </h4>
          <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Swap {quantity}x <strong>{currentProduct.name}</strong> ({currentProduct.brand}) with{' '}
            <strong>{alternativeProduct.name}</strong> ({alternativeProduct.brand}) to save{' '}
            <span style={{ color: 'var(--amazon-fresh-green)', fontWeight: '700' }}>₹{savings}</span>.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '32px', gap: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '10px', color: 'var(--text-secondary)' }}>
          <span>Premium unit: ₹{currentProduct.price}</span>
          <span>Budget unit: ₹{alternativeProduct.price}</span>
        </div>
        <button
          onClick={() => applySmartSwap(currentProduct.id, alternativeProduct)}
          style={{
            backgroundColor: '#ffffff',
            border: `1px solid ${isBudgetViolated ? '#ff9900' : 'var(--amazon-fresh-green)'}`,
            color: isBudgetViolated ? 'var(--amazon-orange)' : 'var(--amazon-fresh-green)',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = isBudgetViolated ? '#fff9f0' : 'var(--amazon-fresh-green-light)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
        >
          <RefreshCw size={12} />
          Swap & Save ₹{savings}
        </button>
      </div>
    </div>
  );
};

export default SmartSwapBanner;
