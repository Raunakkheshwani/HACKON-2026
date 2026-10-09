import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import SmartSwapBanner from './SmartSwapBanner';
import { Trash2, ShoppingBag, Plus, Minus, CheckCircle, ShieldAlert } from 'lucide-react';

interface CartScreenProps {
  onNavigateToHome: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({ onNavigateToHome }) => {
  const { 
    cart, 
    budgetProfile, 
    updateCartQuantity, 
    removeFromCart, 
    checkoutCart 
  } = useBudget();

  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Budget calculations
  const totalAllocated = budgetProfile.limit;
  const alreadySpent = budgetProfile.spent;
  const totalCommited = alreadySpent + cartTotal;
  const remainingBudget = Math.max(0, totalAllocated - totalCommited);
  const isOverBudget = budgetProfile.active && totalCommited > totalAllocated;
  const overBudgetValue = totalCommited - totalAllocated;

  // Percentage calculations for progress bar
  const spentPercent = totalAllocated > 0 ? (alreadySpent / totalAllocated) * 100 : 0;
  const cartPercent = totalAllocated > 0 ? (cartTotal / totalAllocated) * 100 : 0;

  const handleCheckout = () => {
    const orderId = 'AMZN-' + Math.floor(100000 + Math.random() * 900000);
    setPlacedOrderId(orderId);
    checkoutCart();
    setCheckoutComplete(true);
  };

  const handleCheckoutClick = () => {
    if (isOverBudget) {
      setShowBudgetWarning(true);
    } else {
      handleCheckout();
    }
  };

  if (checkoutComplete) {
    return (
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          textAlign: 'center',
          gap: '16px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          margin: '20px 16px',
          boxShadow: 'var(--amazon-card-shadow)',
          animation: 'fadeIn 0.4s ease-out'
        }}
      >
        <div 
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--amazon-fresh-green-light)',
            color: 'var(--amazon-fresh-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px'
          }}
        >
          <CheckCircle size={36} />
        </div>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111' }}>Order Placed!</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Your Amazon Easy delivery is scheduled.
          </p>
        </div>

        <div 
          style={{
            border: '1px solid var(--amazon-border-gray)',
            borderRadius: '8px',
            width: '100%',
            padding: '12px',
            backgroundColor: '#f9f9f9',
            fontSize: '12.5px',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Order ID:</span>
            <span style={{ fontWeight: '700' }}>{placedOrderId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Amount Paid:</span>
            <span style={{ fontWeight: '700' }}>₹{cartTotal}</span>
          </div>
          {budgetProfile.active && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--amazon-fresh-green)' }}>
              <span>Budget Period:</span>
              <span style={{ fontWeight: '600' }}>{budgetProfile.period}</span>
            </div>
          )}
        </div>

        <button 
          className="btn-primary" 
          onClick={() => {
            setCheckoutComplete(false);
            onNavigateToHome();
          }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="responsive-container" style={{ paddingBottom: '20px' }}>
      
      {/* Budget Ceiling Visualizer Panel */}
      {budgetProfile.active && (
        <div 
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--amazon-border-gray)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: 'var(--amazon-card-shadow)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {budgetProfile.period} Budget Progress
            </span>
            <span style={{ fontSize: '12px', fontWeight: '800', color: isOverBudget ? 'red' : 'var(--amazon-fresh-green)' }}>
              ₹{totalCommited} / ₹{totalAllocated}
            </span>
          </div>

          {/* Stacked Progress Bar */}
          <div 
            style={{ 
              height: '10px', 
              backgroundColor: '#eee', 
              borderRadius: '5px', 
              position: 'relative',
              overflow: 'hidden',
              display: 'flex'
            }}
          >
            {/* Already Spent (dark green/blue) */}
            <div 
              style={{ 
                width: `${Math.min(100, spentPercent)}%`, 
                backgroundColor: 'var(--amazon-navy)', 
                height: '100%' 
              }}
              title={`Spent: ₹${alreadySpent}`}
            ></div>
            {/* Current Cart (light green or red if exceeded) */}
            <div 
              style={{ 
                width: `${Math.min(100 - spentPercent, cartPercent)}%`, 
                backgroundColor: isOverBudget ? '#f44336' : 'var(--amazon-fresh-green)', 
                height: '100%',
                transition: 'width 0.3s ease'
              }}
              title={`Current Cart: ₹${cartTotal}`}
            ></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <span>Spent: ₹{alreadySpent}</span>
            <span>Current Cart: ₹{cartTotal}</span>
            <span>Remaining: ₹{remainingBudget}</span>
          </div>

          {/* Alert if violated */}
          {isOverBudget && (
            <div 
              style={{ 
                backgroundColor: '#fdf3f2', 
                border: '1px solid #f8d7da', 
                borderRadius: '6px', 
                padding: '6px 10px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '11px',
                color: '#721c24',
                marginTop: '4px'
              }}
            >
              <ShieldAlert size={14} color="#f44336" />
              <span>Cart exceeds budget by <strong>₹{overBudgetValue}</strong>! Apply swaps below.</span>
            </div>
          )}
        </div>
      )}

      {/* Smart Swaps Recommendation Container */}
      <SmartSwapBanner />

      {/* Cart Items List */}
      <div style={{ padding: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111', marginBottom: '10px' }}>
          Your Shopping Cart ({totalItemsCount} items)
        </h3>

        {cart.length === 0 ? (
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              border: '1px solid var(--amazon-border-gray)'
            }}
          >
            <ShoppingBag size={48} color="#ccc" />
            <div>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>Your Cart is Empty</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Add fresh ingredients to checkout.</p>
            </div>
            <button 
              className="btn-secondary" 
              onClick={onNavigateToHome}
              style={{ width: 'auto', padding: '8px 16px' }}
            >
              Shop Amazon Easy Deals
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cart.map((item) => (
              <div 
                key={item.product.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid var(--amazon-border-gray)',
                  padding: '12px',
                  display: 'flex',
                  gap: '12px',
                  position: 'relative'
                }}
              >
                {/* Product Icon */}
                <div 
                  style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px'
                  }}
                >
                  {item.product.image}
                </div>

                {/* Info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <h4 style={{ fontSize: '12.5px', fontWeight: '700', color: '#111', paddingRight: '20px' }}>
                    {item.product.name}
                  </h4>
                  <p style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                    {item.product.brand} • {item.product.weight}
                  </p>
                  
                  <span 
                    style={{
                      alignSelf: 'flex-start',
                      fontSize: '8px',
                      fontWeight: '700',
                      padding: '1px 4px',
                      borderRadius: '3px',
                      textTransform: 'uppercase',
                      backgroundColor: 
                        item.product.quality === 'budget-alternative' ? 'var(--amazon-fresh-green-light)' :
                        item.product.quality === 'premium' ? '#fffcf5' : '#d1ecf1',
                      color:
                        item.product.quality === 'budget-alternative' ? 'var(--amazon-fresh-green)' :
                        item.product.quality === 'premium' ? 'var(--amazon-orange)' : '#0c5460'
                    }}
                  >
                    {item.product.quality === 'budget-alternative' ? 'Amazon Brand' : item.product.quality}
                  </span>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    {/* Price */}
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#111' }}>
                      ₹{item.product.price * item.quantity}
                    </span>

                    {/* Quantity Selector */}
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        border: '1px solid var(--amazon-border-gray)',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        height: '26px'
                      }}
                    >
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        style={{
                          width: '26px',
                          border: 'none',
                          backgroundColor: '#f7f8f8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#111'
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ padding: '0 8px', fontSize: '12px', fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        style={{
                          width: '26px',
                          border: 'none',
                          backgroundColor: '#f7f8f8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#111'
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Delete trash button */}
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary & Checkout */}
      {cart.length > 0 && (
        <div 
          style={{
            backgroundColor: '#ffffff',
            margin: '0 12px',
            border: '1px solid var(--amazon-border-gray)',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal ({totalItemsCount} items):</span>
              <span>₹{cartTotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee:</span>
              <span style={{ color: 'var(--amazon-fresh-green)', fontWeight: '600' }}>FREE</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800' }}>
              <span>Order Total:</span>
              <span>₹{cartTotal}</span>
            </div>
          </div>

          <button 
            className="btn-primary"
            onClick={handleCheckoutClick}
            style={{ 
              cursor: 'pointer'
            }}
          >
            Proceed to Checkout
          </button>
        </div>
      )}

      {/* Over Budget Confirmation Warning Alert Modal */}
      {showBudgetWarning && (
        <div className="bottom-sheet-overlay" style={{ zIndex: 1200 }}>
          <div 
            className="bottom-sheet" 
            style={{ 
              width: '90%', 
              maxWidth: '400px', 
              padding: '24px', 
              alignItems: 'center', 
              textAlign: 'center', 
              gap: '16px', 
              borderRadius: '12px',
              backgroundColor: '#ffffff'
            }}
          >
            <div 
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#fdf3f2',
                color: '#d9534f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}
            >
              ⚠️
            </div>

            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111' }}>Budget Alert</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>
                Your current basket exceeds your set budget by <strong>₹{overBudgetValue}</strong>. Would you still like to proceed?
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '8px' }}>
              <button 
                className="btn-secondary" 
                style={{ flex: 1, height: '40px', borderRadius: '20px' }}
                onClick={() => setShowBudgetWarning(false)}
              >
                Review Cart
              </button>
              <button 
                className="btn-primary" 
                style={{ flex: 1, height: '40px', borderRadius: '20px', backgroundColor: 'var(--amazon-orange)', border: '1px solid #a88734' }}
                onClick={() => {
                  setShowBudgetWarning(false);
                  handleCheckout();
                }}
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CartScreen;
