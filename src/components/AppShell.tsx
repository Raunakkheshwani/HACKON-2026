import React, { useState, useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';
import HomeScreen from './HomeScreen';
import CartScreen from './CartScreen';
import SettingsScreen from './SettingsScreen';
import OnboardingSheet from './OnboardingSheet';
import SituationSheet from './SituationSheet';
import { ShoppingCart, Home, Settings, Search, Menu, MapPin, Bell, Mic, ShieldAlert } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { budgetProfile, cart, searchQuery, setSearchQuery, activeSwapAlert, setActiveSwapAlert, applySmartSwap } = useBudget();
  const [activeTab, setActiveTab] = useState<'home' | 'settings' | 'cart'>('home');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSituation, setShowSituation] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Clock for the status bar
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Show onboarding automatically if budget isn't active
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!budgetProfile.active) {
        setShowOnboarding(true);
      }
    }, 800); // Small delay for visual effect
    return () => clearTimeout(timer);
  }, [budgetProfile.active]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="device-shell">
      {/* Native-style Status Bar (desktop simulator only) */}
      <div className="status-bar">
        <span>{currentTime}</span>
        <div className="icons">
          <Bell size={12} />
          <span>5G</span>
          <span>98%</span>
        </div>
      </div>

      <div className="screen-container">
        {/* Amazon Header */}
        <header className="amazon-header">
          <div className="header-top-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="amazon-logo" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>
                amazon<span>easy</span>
                <span className="fresh-badge">Easy</span>
              </div>
              
              {/* Desktop Location Pin (hidden on mobile) */}
              <div className="desktop-location-pin" onClick={() => setShowSituation(true)}>
                <MapPin size={14} />
                <div>
                  <div style={{ fontSize: '10px', opacity: 0.8 }}>Deliver to Devanshi</div>
                  <div style={{ fontSize: '12px', fontWeight: '700' }}>Bangalore 560001 ▾</div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links (hidden on mobile) */}
            <div className="desktop-navigation">
              <button 
                className={`desktop-nav-link ${activeTab === 'home' ? 'active' : ''}`} 
                onClick={() => setActiveTab('home')}
              >
                <Home size={16} />
                <span>Home</span>
              </button>
              <button 
                className="desktop-nav-link" 
                onClick={() => setShowSituation(true)}
              >
                <span>Situations</span>
              </button>
              <button 
                className={`desktop-nav-link ${activeTab === 'cart' ? 'active' : ''}`} 
                onClick={() => setActiveTab('cart')}
              >
                <ShoppingCart size={16} />
                <span>Cart</span>
                {totalCartCount > 0 && <span className="desktop-cart-badge">{totalCartCount}</span>}
              </button>
              <button 
                className={`desktop-nav-link ${activeTab === 'settings' ? 'active' : ''}`} 
                onClick={() => setActiveTab('settings')}
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
            </div>

            {/* Budget status badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {budgetProfile.active ? (
                <div 
                  className="header-budget-badge"
                  onClick={() => setActiveTab('settings')}
                >
                  <div className="budget-dot"></div>
                  Budget Active
                </div>
              ) : (
                <button 
                  className="header-budget-btn"
                  onClick={() => setShowOnboarding(true)}
                >
                  <ShieldAlert size={12} />
                  Set Budget
                </button>
              )}
            </div>
          </div>

          {/* Search bar row */}
          <div className="search-bar-container">
            <Search size={16} color="#888" />
            <input 
              type="text" 
              placeholder="Search bananas, organic milk, oats..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'home') setActiveTab('home');
              }}
            />
            <button 
              onClick={() => setShowSituation(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
              title="Shop for a Situation"
            >
              <Mic size={16} color="var(--amazon-teal)" className="pulse-animation" style={{ borderRadius: '50%', background: 'var(--amazon-teal-light)', padding: '2px', boxSizing: 'content-box' }} />
            </button>
          </div>
        </header>

        {/* Mobile Location Selector Pin (hidden on desktop) */}
        <div className="delivery-bar mobile-only" onClick={() => setShowSituation(true)}>
          <MapPin size={13} />
          <span>Deliver to Devanshi - Bangalore 560001 ▾</span>
        </div>

        {/* Scrollable Screen Content */}
        <div className="scroll-content">
          {activeTab === 'home' && (
            <HomeScreen 
              onOpenOnboarding={() => setShowOnboarding(true)} 
              onOpenSituation={() => setShowSituation(true)} 
            />
          )}
          {activeTab === 'settings' && <SettingsScreen />}
          {activeTab === 'cart' && <CartScreen onNavigateToHome={() => setActiveTab('home')} />}
        </div>

        {/* Mobile-only Sticky bottom navigation bar (hidden on desktop) */}
        <nav className="bottom-nav mobile-only">
          <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
            <Home size={20} />
            <span>Home</span>
          </div>
          
          <div className="nav-item" onClick={() => setShowSituation(true)}>
            <Search size={20} />
            <span>Situations</span>
          </div>

          <div className={`nav-item ${activeTab === 'cart' ? 'active' : ''}`} onClick={() => setActiveTab('cart')}>
            <div style={{ position: 'relative' }}>
              <ShoppingCart size={20} />
              {totalCartCount > 0 && <div className="cart-count-badge">{totalCartCount}</div>}
            </div>
            <span>Cart</span>
          </div>

          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={20} />
            <span>Settings</span>
          </div>

          <div className="nav-item">
            <Menu size={20} />
            <span>Menu</span>
          </div>
        </nav>
      </div>

      {/* Sheets and Overlays */}
      {showOnboarding && <OnboardingSheet onClose={() => setShowOnboarding(false)} />}
      {showSituation && <SituationSheet onClose={() => setShowSituation(false)} />}

      {/* Floating Smart Swap Popover */}
      {activeSwapAlert && (
        <div 
          style={{
            position: 'fixed',
            bottom: '80px', // slightly above the mobile bottom nav
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '380px',
            backgroundColor: '#ffffff',
            border: '2px solid var(--amazon-teal)',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            animation: 'slideUp 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--amazon-teal)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              💡 Real-Time Smart Swap
            </span>
            <button 
              onClick={() => setActiveSwapAlert(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#888', padding: '2px' }}
            >
              ✕
            </button>
          </div>
          
          <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
            Adding <strong>{activeSwapAlert.itemAdded.name}</strong>? Swap to <strong>{activeSwapAlert.alternative.name}</strong> (Save <strong style={{ color: 'var(--amazon-fresh-green)' }}>₹{activeSwapAlert.savings}</strong>) instead!
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <button 
              className="btn-secondary" 
              style={{ flex: 1, padding: '8px 0', fontSize: '12px', height: '32px', borderRadius: '16px' }}
              onClick={() => setActiveSwapAlert(null)}
            >
              Keep Original
            </button>
            <button 
              className="btn-primary" 
              style={{ flex: 1.5, padding: '8px 0', fontSize: '12px', height: '32px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', backgroundColor: 'var(--amazon-orange)' }}
              onClick={() => {
                applySmartSwap(activeSwapAlert.itemAdded.id, activeSwapAlert.alternative);
                setActiveSwapAlert(null);
              }}
            >
              Swap Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppShell;
