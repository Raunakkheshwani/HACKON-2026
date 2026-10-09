export type QualityProfile = 'budget-alternative' | 'standard' | 'premium';

export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviewsCount: number;
  image: string;
  category: string;
  brand: string;
  quality: QualityProfile;
  alternativeForId?: string; // Links a budget-alternative product to the premium/standard item it can replace
  description?: string;
  weight?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type BudgetPeriod = 'Monthly' | 'Weekly' | 'Before Every Purchase';

export interface BudgetProfile {
  active: boolean;
  limit: number;
  remaining: number;
  period: BudgetPeriod;
  spent: number;
  mode: 'Entry-Control' | 'Normal'; // Entry-Control means defining budget up front, intercepting purchases
}

export interface SituationSuite {
  id: string;
  name: string;
  description: string;
  items: CartItem[];
  total: number;
  badge: 'Essentials' | 'Discovery' | 'Contextual';
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  budgetApplied: boolean;
  budgetLimit: number;
}
