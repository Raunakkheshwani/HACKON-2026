import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, CartItem, BudgetProfile, BudgetPeriod, SituationSuite, Order } from '../types';
import { mockInventory } from '../data/mockInventory';

interface BudgetContextType {
  budgetProfile: BudgetProfile;
  cart: CartItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchCeilingApplied: boolean;
  setSearchCeilingApplied: (apply: boolean) => void;
  orders: Order[];
  setBudget: (limit: number, period: BudgetPeriod) => void;
  clearBudget: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkoutCart: () => void;
  updateSuiteItemQuantity: (suiteId: string, productId: string, quantity: number) => void;
  checkoutSuiteItems: (checkoutItems: CartItem[]) => void;
  applySmartSwap: (removeProductId: string, addProduct: Product) => void;
  aiSuites: SituationSuite[];
  tempSituationBudget: number | null;
  setTempSituationBudget: (val: number | null) => void;
  regenerateSuites: () => void;
  activeSwapAlert: {
    itemAdded: Product;
    alternative: Product;
    savings: number;
  } | null;
  setActiveSwapAlert: (alert: { itemAdded: Product; alternative: Product; savings: number } | null) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_BUDGET = 'amazon_fresh_budget_profile';
const LOCAL_STORAGE_KEY_CART = 'amazon_fresh_budget_cart';
const LOCAL_STORAGE_KEY_ORDERS = 'amazon_fresh_budget_orders';

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [budgetProfile, setBudgetProfile] = useState<BudgetProfile>({
    active: false,
    limit: 0,
    remaining: 0,
    period: 'Weekly',
    spent: 0,
    mode: 'Entry-Control'
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCeilingApplied, setSearchCeilingApplied] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [aiSuites, setAiSuites] = useState<SituationSuite[]>([]);
  const [tempSituationBudget, setTempSituationBudget] = useState<number | null>(null);
  const [activeSwapAlert, setActiveSwapAlert] = useState<{
    itemAdded: Product;
    alternative: Product;
    savings: number;
  } | null>(null);

  // Load from local storage
  useEffect(() => {
    const savedBudget = localStorage.getItem(LOCAL_STORAGE_KEY_BUDGET);
    const savedCart = localStorage.getItem(LOCAL_STORAGE_KEY_CART);
    const savedOrders = localStorage.getItem(LOCAL_STORAGE_KEY_ORDERS);

    if (savedBudget) {
      setBudgetProfile(JSON.parse(savedBudget));
    }
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Sync to local storage
  const saveBudget = (profile: BudgetProfile) => {
    setBudgetProfile(profile);
    localStorage.setItem(LOCAL_STORAGE_KEY_BUDGET, JSON.stringify(profile));
  };

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem(LOCAL_STORAGE_KEY_CART, JSON.stringify(newCart));
  };

  // Calculate cart total
  const getCartTotal = (currentCart: CartItem[]) => {
    return currentCart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  // Recalculate remaining budget when cart or budget limit changes
  useEffect(() => {
    if (budgetProfile.active) {
      const cartTotal = getCartTotal(cart);
      const remaining = Math.max(0, budgetProfile.limit - budgetProfile.spent - cartTotal);
      if (remaining !== budgetProfile.remaining) {
        saveBudget({
          ...budgetProfile,
          remaining
        });
      }
    }
  }, [cart, budgetProfile.active, budgetProfile.limit, budgetProfile.spent]);

  // Generate suites when budget changes
  useEffect(() => {
    if (budgetProfile.active && budgetProfile.remaining > 0) {
      generateSuites(budgetProfile.remaining);
    } else {
      setAiSuites([]);
    }
  }, [budgetProfile.active, budgetProfile.remaining]);

  const setBudget = (limit: number, period: BudgetPeriod) => {
    const profile: BudgetProfile = {
      active: true,
      limit,
      remaining: limit,
      period,
      spent: 0,
      mode: 'Entry-Control'
    };
    saveBudget(profile);
  };

  const clearBudget = () => {
    const profile: BudgetProfile = {
      active: false,
      limit: 0,
      remaining: 0,
      period: 'Weekly',
      spent: 0,
      mode: 'Normal'
    };
    saveBudget(profile);
    setTempSituationBudget(null);
  };

  const addToCart = (product: Product, quantity = 1) => {
    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    let newCart = [...cart];

    if (existingIndex > -1) {
      newCart[existingIndex] = {
        ...newCart[existingIndex],
        quantity: newCart[existingIndex].quantity + quantity
      };
    } else {
      newCart.push({ product, quantity });
    }
    saveCart(newCart);

    // REAL-TIME SMART SWAP INTERCEPT EVALUATION
    if (budgetProfile.active && product.quality !== 'budget-alternative') {
      const alternative = mockInventory.find(p => p.alternativeForId === product.id) ||
                          mockInventory.find(p => p.category === product.category && p.quality === 'budget-alternative' && p.price < product.price);
      
      if (alternative && alternative.price < product.price) {
        const threshold = budgetProfile.remaining * 0.05;
        if (product.price >= threshold) {
          const savings = (product.price - alternative.price) * quantity;
          setActiveSwapAlert({
            itemAdded: product,
            alternative,
            savings
          });
        }
      }
    }
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    saveCart(newCart);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const newCart = cart.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    );
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const checkoutCart = () => {
    if (cart.length === 0) return;
    
    const cartTotal = getCartTotal(cart);
    
    // Add to order history
    const newOrder: Order = {
      id: 'AMZN-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      items: [...cart],
      total: cartTotal,
      budgetApplied: budgetProfile.active,
      budgetLimit: budgetProfile.limit
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem(LOCAL_STORAGE_KEY_ORDERS, JSON.stringify(updatedOrders));

    // Update spent and remaining in budget
    if (budgetProfile.active) {
      const newSpent = budgetProfile.spent + cartTotal;
      const newLimit = budgetProfile.limit;
      // For "Before Every Purchase" mode, the budget clears after checkout. For others, it deducts.
      if (budgetProfile.period === 'Before Every Purchase') {
        saveBudget({
          active: false,
          limit: 0,
          remaining: 0,
          period: 'Before Every Purchase',
          spent: 0,
          mode: 'Normal'
        });
        setTempSituationBudget(null);
      } else {
        const newRemaining = Math.max(0, newLimit - newSpent);
        saveBudget({
          ...budgetProfile,
          spent: newSpent,
          remaining: newRemaining
        });
        setTimeout(() => {
          generateSuites(newRemaining);
        }, 0);
      }
    }

    // Clear cart
    saveCart([]);
  };

  const applySmartSwap = (removeProductId: string, addProduct: Product) => {
    const existingItem = cart.find(item => item.product.id === removeProductId);
    if (!existingItem) return;

    // Filter out the old product, and insert/update the new product with the same quantity
    let newCart = cart.filter(item => item.product.id !== removeProductId);
    const existingTargetIndex = newCart.findIndex(item => item.product.id === addProduct.id);

    if (existingTargetIndex > -1) {
      newCart[existingTargetIndex] = {
        ...newCart[existingTargetIndex],
        quantity: newCart[existingTargetIndex].quantity + existingItem.quantity
      };
    } else {
      newCart.push({
        product: addProduct,
        quantity: existingItem.quantity
      });
    }
    saveCart(newCart);
  };

  const updateSuiteItemQuantity = (suiteId: string, productId: string, quantity: number) => {
    const updatedSuites = aiSuites.map(suite => {
      if (suite.id !== suiteId) return suite;

      let newItems = [...suite.items];
      const itemIndex = newItems.findIndex(item => item.product.id === productId);

      if (itemIndex > -1) {
        if (quantity <= 0) {
          newItems.splice(itemIndex, 1);
        } else {
          newItems[itemIndex] = {
            ...newItems[itemIndex],
            quantity
          };
        }
      }

      const newTotal = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      return {
        ...suite,
        items: newItems,
        total: newTotal
      };
    });
    setAiSuites(updatedSuites);
  };

  const checkoutSuiteItems = (checkoutItems: CartItem[]) => {
    if (checkoutItems.length === 0) return;

    const totalSpent = checkoutItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const newOrder: Order = {
      id: 'AMZN-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      items: [...checkoutItems],
      total: totalSpent,
      budgetApplied: budgetProfile.active,
      budgetLimit: budgetProfile.limit
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem(LOCAL_STORAGE_KEY_ORDERS, JSON.stringify(updatedOrders));

    if (budgetProfile.active) {
      const newSpent = budgetProfile.spent + totalSpent;
      const newLimit = budgetProfile.limit;
      const newRemaining = Math.max(0, newLimit - newSpent);

      const updatedProfile: BudgetProfile = {
        ...budgetProfile,
        spent: newSpent,
        remaining: newRemaining
      };
      saveBudget(updatedProfile);
      setTimeout(() => {
        generateSuites(newRemaining);
      }, 0);
    }
  };

  // Algorithmic Suite Generator based on budget constraint
  const generateSuites = (limit: number) => {
    // We aim to fill exactly 100% of the remaining budget ceiling
    const buildSuiteItems = (suiteId: string, target: number, qualityFilters: string[]) => {
      let currentTotal = 0;
      const selectedItems: CartItem[] = [];
      
      // Filter inventory matching quality priority
      const sortedInventory = [...mockInventory].sort((a, b) => {
        // Prefer products matching quality filter
        const aFit = qualityFilters.includes(a.quality) ? 1 : 0;
        const bFit = qualityFilters.includes(b.quality) ? 1 : 0;
        return bFit - aFit || a.price - b.price; // sort by fit, then cheapest
      });

      for (const product of sortedInventory) {
        // avoid adding duplicate categories in base suites to keep it diverse
        const categoryExists = selectedItems.some(item => item.product.category === product.category);
        if (categoryExists && selectedItems.length >= 3) continue;

        if (currentTotal + product.price <= target) {
          selectedItems.push({ product, quantity: 1 });
          currentTotal += product.price;
        }
      }

      // 100% Budget target cushion equalizing item
      const diff = target - currentTotal;
      if (diff > 0) {
        const adjusterProduct: Product = {
          id: `adjuster-${suiteId}-${Math.floor(1000 + Math.random() * 9000)}`,
          name: 'Amazon Easy Pantry Cushion (Waived / Budget Adjusted)',
          price: diff,
          rating: 4.9,
          reviewsCount: 124,
          image: '🎁',
          category: 'Pantry Staples',
          brand: 'Amazon Easy',
          quality: 'budget-alternative',
          description: 'Custom staple adjuster to match your cycle budget constraint exactly.'
        };
        selectedItems.push({ product: adjusterProduct, quantity: 1 });
        currentTotal += diff;
      }

      return { items: selectedItems, total: currentTotal };
    };

    // 1. Essentials Suite (Mostly budget-alternatives and standard items) -> 100% target
    const essentials = buildSuiteItems('essentials', limit, ['budget-alternative', 'standard']);
    const essentialsSuite: SituationSuite = {
      id: 'suite-essentials',
      name: 'The Essentials Base',
      description: 'Your basic daily grocery staples scaled to fit your budget perfectly.',
      items: essentials.items,
      total: essentials.total,
      badge: 'Essentials'
    };

    // 2. Discovery Suite (Value/Budget Saver) -> 75% target (strictly 70%-80%)
    const discoveryTarget = Math.round(limit * 0.75);
    const discovery = buildSuiteItems('discovery', discoveryTarget, ['standard', 'premium']);
    const discoverySuite: SituationSuite = {
      id: 'suite-discovery',
      name: 'Value & Budget Saver',
      description: 'Popular picks and organic upgrades with a deliberate 25% financial safety cushion.',
      items: discovery.items,
      total: discovery.total,
      badge: 'Discovery'
    };

    // 3. Contextual / Temporal Suite (Breakfast combo in morning, Dinner ingredients in evening) -> 100% target
    const contextualTarget = limit;
    const currentHour = new Date().getHours();
    const isMorning = currentHour >= 5 && currentHour < 12;
    
    let contextualItems: CartItem[] = [];
    let contextualName = '';
    let contextualDesc = '';
    let contextualTotal = 0;
    
    if (isMorning) {
      contextualName = 'Healthy Breakfast Base';
      contextualDesc = 'Start your morning with fresh oats, eggs, fruits, and milk packages.';
      
      // Grab breakfast related items: milk, curd, grapes, eggs, almonds, coffee
      const breakfastProducts = mockInventory.filter(p => 
        ['Dairy & Bread', 'Fruits & Vegetables', 'Proteins & Health', 'Snacks & Beverages'].includes(p.category) &&
        (p.id.includes('d') || p.id.includes('fv3') || p.id.includes('h5') || p.id.includes('sb3'))
      ).sort((a,b) => a.price - b.price);

      for (const p of breakfastProducts) {
        if (contextualTotal + p.price <= contextualTarget) {
          contextualItems.push({ product: p, quantity: 1 });
          contextualTotal += p.price;
        }
      }
    } else {
      contextualName = 'Family Dinner Basket';
      contextualDesc = 'Quick evening dinner staples: basmati rice, spinach, mustard oil, curd.';
      
      // Grab dinner related items: rice, oil, spinach, curd
      const dinnerProducts = mockInventory.filter(p => 
        ['Pantry Staples', 'Fruits & Vegetables', 'Dairy & Bread'].includes(p.category) &&
        (p.id === 'p6' || p.id === 'p3' || p.id === 'fv8' || p.id === 'd6' || p.id === 'd3')
      ).sort((a,b) => a.price - b.price);

      for (const p of dinnerProducts) {
        if (contextualTotal + p.price <= contextualTarget) {
          contextualItems.push({ product: p, quantity: 1 });
          contextualTotal += p.price;
        }
      }
    }

    const contextualDiff = contextualTarget - contextualTotal;
    if (contextualDiff > 0) {
      const adjusterProduct: Product = {
        id: `adjuster-contextual-${Math.floor(1000 + Math.random() * 9000)}`,
        name: 'Amazon Easy Pantry Cushion (Waived / Budget Adjusted)',
        price: contextualDiff,
        rating: 4.9,
        reviewsCount: 124,
        image: '🎁',
        category: 'Pantry Staples',
        brand: 'Amazon Easy',
        quality: 'budget-alternative',
        description: 'Custom staple adjuster to match your cycle budget constraint exactly.'
      };
      contextualItems.push({ product: adjusterProduct, quantity: 1 });
      contextualTotal += contextualDiff;
    }

    const contextualSuite: SituationSuite = {
      id: 'suite-contextual',
      name: contextualName,
      description: contextualDesc,
      items: contextualItems,
      total: contextualTotal,
      badge: 'Contextual'
    };

    setAiSuites([essentialsSuite, discoverySuite, contextualSuite]);
  };

  const regenerateSuites = () => {
    if (budgetProfile.active && budgetProfile.remaining > 0) {
      generateSuites(budgetProfile.remaining);
    }
  };

  return (
    <BudgetContext.Provider
      value={{
        budgetProfile,
        cart,
        searchQuery,
        setSearchQuery,
        searchCeilingApplied,
        setSearchCeilingApplied,
        orders,
        setBudget,
        clearBudget,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        checkoutCart,
        applySmartSwap,
        aiSuites,
        regenerateSuites,
        tempSituationBudget,
        setTempSituationBudget,
        updateSuiteItemQuantity,
        checkoutSuiteItems,
        activeSwapAlert,
        setActiveSwapAlert
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
