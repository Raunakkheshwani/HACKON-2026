import React, { useState, useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';
import { mockInventory } from '../data/mockInventory';
import type { SituationSuite, CartItem } from '../types';
import { ShoppingCart, Star, Sparkles, AlertCircle, Eye, Plus, Minus, CheckCircle } from 'lucide-react';

interface HomeScreenProps {
  onOpenOnboarding: () => void;
  onOpenSituation: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenOnboarding, onOpenSituation }) => {
  const { 
    budgetProfile, 
    addToCart, 
    aiSuites, 
    cart, 
    searchQuery, 
    searchCeilingApplied, 
    setSearchCeilingApplied,
    updateSuiteItemQuantity,
    checkoutSuiteItems,
    updateCartQuantity
  } = useBudget();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [inspectingSuiteId, setInspectingSuiteId] = useState<string | null>(null);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [placedOrderInfo, setPlacedOrderInfo] = useState<{ id: string; total: number } | null>(null);

  const inspectingSuite = aiSuites.find(s => s.id === inspectingSuiteId) || null;

  const checkedSuiteItems = inspectingSuite 
    ? inspectingSuite.items.filter(item => checkedIds.includes(item.product.id)) 
    : [];

  const checkedSubtotal = checkedSuiteItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 
    0
  );

  useEffect(() => {
    if (inspectingSuite) {
      setCheckedIds(inspectingSuite.items.map(item => item.product.id));
    } else {
      setCheckedIds([]);
    }
  }, [inspectingSuiteId]);

  // Categories list
  const categories = [
    { name: 'Dairy & Bread', icon: '🥛' },
    { name: 'Fruits & Vegetables', icon: '🍎' },
    { name: 'Pantry Staples', icon: '🧂' },
    { name: 'Proteins & Health', icon: '💪' },
    { name: 'Snacks & Beverages', icon: '🍪' }
  ];

  // Filtering products based on category and search
  const getFilteredProducts = () => {
    let list = mockInventory;

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query) || 
        p.brand.toLowerCase().includes(query)
      );
    } else if (selectedCategory) {
      // Filter by category
      list = list.filter(p => p.category === selectedCategory);
    }

    return list;
  };

  const unfilteredCount = getFilteredProducts().length;

  // Apply search ceiling if budget is active
  const getCeilingFilteredProducts = () => {
    let list = getFilteredProducts();

    if (budgetProfile.active && searchCeilingApplied) {
      // INTERCEPT LOGIC: Filter out premium products OR products that cost more than 40% of the remaining budget
      list = list.filter(p => {
        const tooExpensive = p.price > (budgetProfile.remaining * 0.4);
        const isPremium = p.quality === 'premium';
        return !(isPremium && tooExpensive);
      });
    }

    return list;
  };

  const displayedProducts = getCeilingFilteredProducts();
  const hiddenProductsCount = unfilteredCount - displayedProducts.length;

  // Add entire suite to cart
  const handleAddSuiteToCart = (suite: SituationSuite) => {
    suite.items.forEach(item => {
      addToCart(item.product, item.quantity);
    });
  };

  // Helper to check if item is in cart
  const isItemInCart = (productId: string) => {
    return cart.some(item => item.product.id === productId);
  };

  return (
    <div className="responsive-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* Budget Cycle Alert Banner if not active */}
      {!budgetProfile.active && (
        <div 
          onClick={onOpenOnboarding}
          style={{
            background: 'linear-gradient(90deg, #ff9900 0%, #ffb74d 100%)',
            color: '#111',
            padding: '10px 14px',
            margin: '10px 12px 2px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} />
            <span>Enable <strong>Entry-Control Budgeting</strong> to auto-optimise groceries</span>
          </div>
          <span style={{ fontSize: '10px', backgroundColor: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>SET NOW</span>
        </div>
      )}

      {/* AI SUITES SECTION (Shows only if budget is active) */}
      {budgetProfile.active && aiSuites.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#111', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={15} color="var(--amazon-teal)" />
              Your AI-Generated Budget Suites
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--amazon-teal)', fontWeight: '600' }}>For ₹{budgetProfile.limit} limit</span>
          </div>

          {/* Horizontal Carousel */}
          <div className="ai-suites-container">
            {aiSuites.map((suite: SituationSuite) => (
              <div 
                key={suite.id}
                style={{
                  minWidth: '280px',
                  width: '280px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--amazon-border-gray)',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: 'var(--amazon-card-shadow)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  scrollSnapAlign: 'start',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Suite Badge */}
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span 
                    style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      backgroundColor: 
                        suite.badge === 'Essentials' ? 'var(--amazon-fresh-green-light)' :
                        suite.badge === 'Discovery' ? '#fffcf5' : 'var(--amazon-teal-light)',
                      color:
                        suite.badge === 'Essentials' ? 'var(--amazon-fresh-green)' :
                        suite.badge === 'Discovery' ? 'var(--amazon-orange)' : 'var(--amazon-teal)',
                      border:
                        suite.badge === 'Essentials' ? '1px solid #c3e6cb' :
                        suite.badge === 'Discovery' ? '1px solid #ffeeba' : '1px solid #bee5eb'
                    }}
                  >
                    {suite.badge}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#111' }}>
                    ₹{suite.total}
                  </span>
                </div>

                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#111', marginBottom: '2px' }}>{suite.name}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', height: '28px', overflow: 'hidden', lineHeight: '1.3' }}>
                    {suite.description}
                  </p>
                </div>

                {/* Micro preview of items (emojis) */}
                <div style={{ display: 'flex', gap: '6px', overflow: 'hidden', height: '24px', alignItems: 'center' }}>
                  {suite.items.map((item: CartItem, idx: number) => (
                    <span 
                      key={idx} 
                      title={item.product.name}
                      style={{ 
                        fontSize: '16px', 
                        backgroundColor: '#f5f5f5', 
                        borderRadius: '4px', 
                        padding: '2px', 
                        width: '24px', 
                        height: '24px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}
                    >
                      {item.product.image}
                    </span>
                  ))}
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    +{suite.items.length} items
                  </span>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <button 
                    onClick={() => setInspectingSuiteId(suite.id)}
                    style={{
                      flex: 1,
                      backgroundColor: '#ffffff',
                      border: '1px solid var(--amazon-border-gray)',
                      borderRadius: '6px',
                      padding: '6px 0',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Eye size={12} />
                    Inspect
                  </button>
                  <button 
                    onClick={() => handleAddSuiteToCart(suite)}
                    style={{
                      flex: 1.5,
                      backgroundColor: 'var(--amazon-orange)',
                      border: '1px solid #a88734',
                      borderRadius: '6px',
                      padding: '6px 0',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#111',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <ShoppingCart size={12} />
                    1-Click Add
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUICK SITUATIONS BAR */}
      <div style={{ padding: '0 12px' }}>
        <div 
          onClick={onOpenSituation}
          className="urgent-situation-card"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#111' }}>Shop for an Emergency Situation</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Gym diet prep, sudden guests at home, late night snack party...</p>
          </div>
          <div style={{ 
            width: '28px', 
            height: '28px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--amazon-teal-light)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--amazon-teal)'
          }}>
            ⚡
          </div>
        </div>
      </div>

      {/* CATEGORY GRID */}
      <div style={{ padding: '0 12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#111', marginBottom: '8px' }}>Shop by Category</h3>
        <div className="category-grid">
          {categories.map((cat) => (
            <div 
              key={cat.name}
              onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
              style={{
                backgroundColor: selectedCategory === cat.name ? 'var(--amazon-teal-light)' : '#ffffff',
                border: selectedCategory === cat.name ? '1.5px solid var(--amazon-teal)' : '1px solid var(--amazon-border-gray)',
                borderRadius: '8px',
                padding: '8px 4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: '20px' }}>{cat.icon}</span>
              <span style={{ fontSize: '9px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.2' }}>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SEARCH OR CATEGORY FILTER TITLE */}
      <div style={{ padding: '0 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#111' }}>
          {searchQuery ? `Search Results for "${searchQuery}"` : selectedCategory ? selectedCategory : 'Amazon Easy Deals For You'}
        </h3>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          {displayedProducts.length} items
        </span>
      </div>

      {/* INTERCEPT INTELLIGENCE WARNING BANNER */}
      {budgetProfile.active && hiddenProductsCount > 0 && (
        <div 
          style={{
            margin: '0 12px',
            backgroundColor: '#fffcf5',
            border: '1px solid #ffeeba',
            borderRadius: '8px',
            padding: '8px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11.5px',
            color: '#856404'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} />
            <span>Hiding {hiddenProductsCount} premium products to secure ₹{Math.round(budgetProfile.remaining)} budget.</span>
          </div>
          <button 
            onClick={() => setSearchCeilingApplied(false)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--amazon-teal)', 
              fontWeight: '700', 
              fontSize: '11px', 
              cursor: 'pointer' 
            }}
          >
            SHOW ALL
          </button>
        </div>
      )}

      {/* PRODUCT GRID */}
      <div className="product-grid">
        {displayedProducts.map((product) => {
          // Check if there is an alternative available to show a "Swap" badge
          const hasAlternative = mockInventory.some(p => p.alternativeForId === product.id && p.price < product.price);

          return (
            <div key={product.id} className="product-card">
              {/* Quality Tag */}
              <span className={`product-quality-tag quality-${product.quality === 'budget-alternative' ? 'budget' : product.quality}`}>
                {product.quality === 'budget-alternative' ? 'Amazon Brand' : product.quality}
              </span>

              {/* Product Visual */}
              <div 
                style={{ 
                  height: '90px', 
                  backgroundColor: '#f9f9f9', 
                  borderRadius: '6px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '42px',
                  marginTop: '12px'
                }}
              >
                {product.image}
              </div>

              {/* Product Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>{product.brand}</span>
                <h4 style={{ fontSize: '12px', fontWeight: '600', color: '#111', height: '32px', overflow: 'hidden', lineHeight: '1.3' }}>
                  {product.name}
                </h4>
                
                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Star size={10} fill="var(--amazon-orange)" color="var(--amazon-orange)" />
                  <span style={{ fontSize: '10px', fontWeight: '600', color: '#111' }}>{product.rating}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>({product.reviewsCount})</span>
                </div>

                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{product.weight}</span>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#111' }}>₹</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#111' }}>{product.price}</span>
                </div>

                {/* Premium Warning banner for swaps */}
                {hasAlternative && budgetProfile.active && (
                  <div style={{ fontSize: '9px', color: 'var(--amazon-fresh-green)', fontWeight: '600', marginTop: '2px' }}>
                    💡 Cheaper alternative available
                  </div>
                )}
              </div>

              {/* Add to Cart or Quantity Selector */}
              {isItemInCart(product.id) ? (
                (() => {
                  const cartItem = cart.find(item => item.product.id === product.id);
                  const qty = cartItem ? cartItem.quantity : 0;
                  return (
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        border: '1.5px solid var(--amazon-fresh-green)',
                        backgroundColor: 'var(--amazon-fresh-green-light)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        height: '28px',
                        width: '100%',
                        marginTop: '4px'
                      }}
                    >
                      <button
                        onClick={() => updateCartQuantity(product.id, qty - 1)}
                        style={{
                          width: '28px',
                          height: '100%',
                          border: 'none',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--amazon-fresh-green)',
                          fontWeight: '800'
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--amazon-fresh-green)' }}>
                        {qty}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(product.id, qty + 1)}
                        style={{
                          width: '28px',
                          height: '100%',
                          border: 'none',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--amazon-fresh-green)',
                          fontWeight: '800'
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  );
                })()
              ) : (
                <button
                  onClick={() => addToCart(product)}
                  style={{
                    backgroundColor: 'var(--amazon-orange)',
                    border: '1px solid #a88734',
                    borderRadius: '16px',
                    padding: '6px 0',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#111',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    width: '100%',
                    marginTop: '4px',
                    height: '28px'
                  }}
                >
                  Add to Cart
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* INSPECT SUITE DRAWER */}
      {inspectingSuite && (
        <div className="bottom-sheet-overlay" style={{ zIndex: 1100 }}>
          <div className="bottom-sheet">
            <div className="sheet-header">
              <span className="sheet-title">{inspectingSuite.name}</span>
              <button 
                onClick={() => setInspectingSuiteId(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--amazon-teal)', fontWeight: '700' }}
              >
                Close
              </button>
            </div>
            <div className="sheet-content" style={{ padding: '16px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {inspectingSuite.description}
              </p>
              
              {/* Checked Subtotal Display */}
              <div 
                style={{
                  backgroundColor: 'var(--amazon-teal-light)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  fontSize: '13px'
                }}
              >
                <span style={{ fontWeight: '600', color: 'var(--amazon-teal)' }}>Selected Subtotal:</span>
                <span style={{ fontWeight: '800', color: 'var(--text-primary)' }}>₹{checkedSubtotal} / ₹{inspectingSuite.total}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {inspectingSuite.items.map((item: CartItem, idx: number) => {
                  const isChecked = checkedIds.includes(item.product.id);
                  return (
                    <div 
                      key={item.product.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid var(--amazon-border-gray)',
                        padding: '8px 0',
                        opacity: isChecked ? 1 : 0.6
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Selection Checkbox */}
                        <input 
                          type="checkbox"
                          className="suite-item-checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setCheckedIds(checkedIds.filter(id => id !== item.product.id));
                            } else {
                              setCheckedIds([...checkedIds, item.product.id]);
                            }
                          }}
                        />
                        <span style={{ fontSize: '20px' }}>{item.product.image}</span>
                        <div>
                          <h5 style={{ fontSize: '12px', fontWeight: '600' }}>{item.product.name}</h5>
                          <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{item.product.brand} • {item.product.weight}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Quantity Adjusters */}
                        <div className="suite-item-qty-container">
                          <button
                            className="suite-item-qty-btn"
                            onClick={() => updateSuiteItemQuantity(inspectingSuite.id, item.product.id, item.quantity - 1)}
                          >
                            <Minus size={10} />
                          </button>
                          <span className="suite-item-qty-val">{item.quantity}</span>
                          <button
                            className="suite-item-qty-btn"
                            onClick={() => updateSuiteItemQuantity(inspectingSuite.id, item.product.id, item.quantity + 1)}
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '700', minWidth: '40px', textAlign: 'right' }}>
                          ₹{item.product.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Checkout Routes Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      const orderId = 'AMZN-' + Math.floor(100000 + Math.random() * 900000);
                      checkoutSuiteItems(checkedSuiteItems);
                      setPlacedOrderInfo({ id: orderId, total: checkedSubtotal });
                      setInspectingSuiteId(null);
                    }}
                    disabled={checkedSuiteItems.length === 0}
                  >
                    Add Selected to Cart
                  </button>
                  <button 
                    className="btn-primary"
                    style={{ flex: 1.2 }}
                    onClick={() => {
                      const orderId = 'AMZN-' + Math.floor(100000 + Math.random() * 900000);
                      checkoutSuiteItems(inspectingSuite.items);
                      setPlacedOrderInfo({ id: orderId, total: inspectingSuite.total });
                      setInspectingSuiteId(null);
                    }}
                  >
                    Proceed with Full Cart
                  </button>
                </div>
                <button 
                  className="btn-secondary"
                  onClick={() => setInspectingSuiteId(null)}
                  style={{ width: '100%' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDER PLACED CONFIRMATION OVERLAY */}
      {placedOrderInfo && (
        <div className="bottom-sheet-overlay" style={{ zIndex: 1200 }}>
          <div className="bottom-sheet" style={{ width: '400px', padding: '24px', alignItems: 'center', textAlign: 'center', gap: '16px', borderRadius: '12px' }}>
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
                <span style={{ fontWeight: '700' }}>{placedOrderInfo.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Amount Paid:</span>
                <span style={{ fontWeight: '700' }}>₹{placedOrderInfo.total}</span>
              </div>
            </div>

            <button 
              className="btn-primary" 
              onClick={() => setPlacedOrderInfo(null)}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default HomeScreen;
