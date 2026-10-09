import { useBudget } from '../context/BudgetContext';
import { mockInventory } from '../data/mockInventory';
import type { CartItem } from '../types';

interface TaxonomyEntry {
  category: string;
  phrases: string[];
  target_skus_classes: string[];
}

const SITUATION_TAXONOMY: TaxonomyEntry[] = [
  {
    category: "UNEXPECTED_GUESTS_HOSPITALITY",
    phrases: ["guests arrived", "relatives came over", "sudden kitty party", "friends visiting", "people over at home", "unexpected visitors dropping by"],
    target_skus_classes: ["carbonated_beverages", "savory_snacks_chips", "premium_biscuits", "instant_tea_coffee", "disposable_plates_napkins", "assorted_sweets"]
  },
  {
    category: "MEDICAL_HEALTH_EMERGENCY",
    phrases: ["feeling sick", "sudden cold and flu", "baby crying need supplies", "headache fever", "first aid emergency", "bad stomach ache remedies"],
    target_skus_classes: ["otc_analgesics", "cough_lozenges", "antiseptic_wipes", "baby_diapers_formula", "electrolyte_sachets_rehydration"]
  },
  {
    category: "FITNESS_GYM_FUEL",
    phrases: ["heading to the gym", "post workout meal", "running late for training", "need muscle protein pre-workout", "early morning exercise", "bodybuilding nutrition snacks"],
    target_skus_classes: ["fresh_bananas", "whey_protein_bars", "sports_drinks_hydration", "oats_muesli", "peanut_butter"]
  },
  {
    category: "MONSOON_WEATHER_DISRUPTION",
    phrases: ["heavy rain stuck inside", "unexpected power cut", "storm downpour blackout", "flooded street stay home", "weather crisis essentials"],
    target_skus_classes: ["emergency_candles_matchboxes", "aaa_aa_batteries", "instant_noodles_ready_meals", "mosquito_repellent_coils", "packaged_drinking_water"]
  },
  {
    category: "LATE_NIGHT_STUDY_CRAM",
    phrases: ["exam prep all nighter", "coding sprint finish project", "late night shift fatigue", "studying till morning", "project development crunch time"],
    target_skus_classes: ["energy_drinks_caffeine", "dark_chocolates", "instant_cup_noodles", "roasted_nuts_munchies"]
  }
];

// 5D Semantic Vocabulary mapping to Category Intent Dimensions:
// [0: Hospitality, 1: Medical, 2: Fitness, 3: Monsoon, 4: Study Cram]
const WORD_EMBEDDINGS: Record<string, number[]> = {
  // hospitality (Dim 0)
  guests: [0.9, 0.0, 0.0, 0.0, 0.0],
  arrived: [0.6, 0.0, 0.0, 0.0, 0.0],
  relatives: [0.9, 0.0, 0.0, 0.0, 0.0],
  kitty: [1.0, 0.0, 0.0, 0.0, 0.0],
  visiting: [0.8, 0.0, 0.0, 0.0, 0.0],
  visitors: [0.9, 0.0, 0.0, 0.0, 0.0],
  people: [0.5, 0.0, 0.0, 0.0, 0.0],
  dropping: [0.6, 0.0, 0.0, 0.0, 0.0],
  hospitality: [0.9, 0.0, 0.0, 0.0, 0.0],
  party: [0.8, 0.0, 0.2, 0.0, 0.4],

  // medical (Dim 1)
  sick: [0.0, 0.9, 0.0, 0.0, 0.0],
  cold: [0.0, 0.8, 0.0, 0.2, 0.0],
  flu: [0.0, 0.9, 0.0, 0.0, 0.0],
  baby: [0.0, 1.0, 0.0, 0.0, 0.0],
  crying: [0.0, 0.8, 0.0, 0.0, 0.0],
  headache: [0.0, 1.0, 0.0, 0.0, 0.0],
  fever: [0.0, 1.0, 0.0, 0.0, 0.0],
  medicine: [0.0, 0.9, 0.0, 0.0, 0.0],
  medical: [0.0, 1.0, 0.0, 0.0, 0.0],
  health: [0.0, 0.8, 0.4, 0.0, 0.0],
  cough: [0.0, 0.9, 0.0, 0.0, 0.0],
  stomach: [0.0, 0.9, 0.0, 0.0, 0.0],
  ache: [0.0, 0.9, 0.0, 0.0, 0.0],
  remedies: [0.0, 0.8, 0.0, 0.0, 0.0],
  first: [0.0, 0.7, 0.0, 0.0, 0.0],
  aid: [0.0, 0.8, 0.0, 0.0, 0.0],
  diapers: [0.0, 0.9, 0.0, 0.0, 0.0],
  formula: [0.0, 0.8, 0.0, 0.0, 0.0],
  electrolyte: [0.0, 0.8, 0.5, 0.0, 0.0],
  rehydration: [0.0, 0.8, 0.6, 0.0, 0.0],

  // fitness (Dim 2)
  gym: [0.0, 0.0, 1.0, 0.0, 0.0],
  workout: [0.0, 0.0, 1.0, 0.0, 0.0],
  training: [0.0, 0.0, 0.9, 0.0, 0.2],
  muscle: [0.0, 0.0, 1.0, 0.0, 0.0],
  protein: [0.0, 0.1, 1.0, 0.0, 0.1],
  bodybuilding: [0.0, 0.0, 1.0, 0.0, 0.0],
  exercise: [0.0, 0.0, 0.9, 0.0, 0.0],
  fit: [0.0, 0.2, 0.8, 0.0, 0.0],
  fitness: [0.0, 0.2, 0.9, 0.0, 0.0],
  pre: [0.0, 0.0, 0.7, 0.0, 0.3],
  post: [0.0, 0.0, 0.7, 0.0, 0.2],
  bananas: [0.2, 0.0, 0.6, 0.0, 0.0],
  banana: [0.2, 0.0, 0.6, 0.0, 0.0],

  // monsoon (Dim 3)
  rain: [0.0, 0.0, 0.0, 1.0, 0.0],
  heavy: [0.0, 0.0, 0.0, 0.8, 0.0],
  monsoon: [0.0, 0.0, 0.0, 1.0, 0.0],
  stuck: [0.0, 0.0, 0.0, 0.8, 0.4],
  weather: [0.0, 0.0, 0.0, 0.9, 0.0],
  power: [0.0, 0.0, 0.0, 0.9, 0.3],
  cut: [0.0, 0.0, 0.0, 0.8, 0.0],
  blackout: [0.0, 0.0, 0.0, 1.0, 0.0],
  storm: [0.0, 0.0, 0.0, 1.0, 0.0],
  downpour: [0.0, 0.0, 0.0, 1.0, 0.0],
  flooded: [0.0, 0.0, 0.0, 1.0, 0.0],
  street: [0.0, 0.0, 0.0, 0.7, 0.0],
  mosquito: [0.0, 0.4, 0.0, 0.8, 0.0],
  repellent: [0.0, 0.4, 0.0, 0.8, 0.0],

  // study cram (Dim 4)
  exam: [0.0, 0.0, 0.0, 0.0, 1.0],
  exams: [0.0, 0.0, 0.0, 0.0, 1.0],
  prep: [0.0, 0.0, 0.3, 0.0, 0.8],
  study: [0.0, 0.0, 0.0, 0.0, 1.0],
  studying: [0.0, 0.0, 0.0, 0.0, 1.0],
  nighter: [0.0, 0.0, 0.0, 0.0, 1.0],
  cram: [0.0, 0.0, 0.0, 0.0, 1.0],
  coding: [0.0, 0.0, 0.0, 0.0, 1.0],
  sprint: [0.0, 0.0, 0.3, 0.0, 0.8],
  project: [0.0, 0.0, 0.0, 0.0, 0.9],
  shift: [0.0, 0.0, 0.0, 0.0, 0.8],
  fatigue: [0.0, 0.5, 0.0, 0.0, 0.8],
  crunch: [0.0, 0.0, 0.0, 0.0, 1.0],

  // General helpers
  sudden: [0.4, 0.4, 0.2, 0.4, 0.4],
  unexpected: [0.4, 0.4, 0.2, 0.4, 0.4],
  emergency: [0.2, 0.8, 0.0, 0.6, 0.0],
  crisis: [0.2, 0.6, 0.0, 0.8, 0.0],
  need: [0.3, 0.3, 0.3, 0.3, 0.3],
  home: [0.4, 0.1, 0.0, 0.4, 0.0],
  house: [0.5, 0.0, 0.0, 0.3, 0.0]
};

// Maps SKU classes to specific product IDs in mockInventory
const mapSkuClassToProductIds = (skuClass: string): string[] => {
  switch (skuClass) {
    case "carbonated_beverages":
      return ["tax_coke", "sb3"];
    case "savory_snacks_chips":
      return ["tax_chips", "sb4", "sb5"];
    case "premium_biscuits":
      return ["tax_cookies"];
    case "instant_tea_coffee":
      return ["sb2", "sb3"];
    case "disposable_plates_napkins":
      return ["tax_plates"];
    case "assorted_sweets":
      return ["tax_sweets"];
      
    case "otc_analgesics":
      return ["tax_crocin"];
    case "cough_lozenges":
      return ["tax_vicks"];
    case "antiseptic_wipes":
      return ["tax_wipes"];
    case "baby_diapers_formula":
      return ["tax_diapers"];
    case "electrolyte_sachets_rehydration":
      return ["tax_electral"];
      
    case "fresh_bananas":
      return ["tax_bananas"];
    case "whey_protein_bars":
      return ["tax_yobar"];
    case "sports_drinks_hydration":
      return ["tax_gatorade"];
    case "oats_muesli":
      return ["tax_oats_kg", "h3"];
    case "peanut_butter":
      return ["h2", "h3"];
      
    case "emergency_candles_matchboxes":
      return ["tax_candle"];
    case "aaa_aa_batteries":
      return ["tax_battery"];
    case "instant_noodles_ready_meals":
      return ["tax_maggi"];
    case "mosquito_repellent_coils":
      return ["tax_mosquito"];
    case "packaged_drinking_water":
      return ["tax_water_2l"];
      
    case "energy_drinks_caffeine":
      return ["tax_redbull", "sb2"];
    case "dark_chocolates":
      return ["tax_bournville"];
    case "instant_cup_noodles":
      return ["tax_cupnoodles"];
    case "roasted_nuts_munchies":
      return ["tax_cashews", "sb4"];
      
    default:
      return [];
  }
};

// Returns a human-friendly category label
const getCategoryLabel = (category: string): string => {
  switch (category) {
    case "UNEXPECTED_GUESTS_HOSPITALITY":
      return "Unexpected Guests & Hospitality";
    case "MEDICAL_HEALTH_EMERGENCY":
      return "Medical & Health Emergency";
    case "FITNESS_GYM_FUEL":
      return "Gym & Fitness Fuel";
    case "MONSOON_WEATHER_DISRUPTION":
      return "Monsoon & Weather Disruption";
    case "LATE_NIGHT_STUDY_CRAM":
      return "Late Night Study & Crunch";
    default:
      return "Situational Emergency";
  }
};

// Gets the historical platform average for a category
const getHistoricalAverage = (category: string): number => {
  switch (category) {
    case "UNEXPECTED_GUESTS_HOSPITALITY": return 600;
    case "MEDICAL_HEALTH_EMERGENCY": return 400;
    case "FITNESS_GYM_FUEL": return 450;
    case "MONSOON_WEATHER_DISRUPTION": return 500;
    case "LATE_NIGHT_STUDY_CRAM": return 350;
    default: return 400;
  }
};

// Vector helper functions
const getVectorForText = (text: string): number[] => {
  const words = text.toLowerCase().split(/[^a-z0-9]+/);
  const vector = [0, 0, 0, 0, 0];
  words.forEach(word => {
    const wordVec = WORD_EMBEDDINGS[word];
    if (wordVec) {
      for (let i = 0; i < 5; i++) {
        vector[i] += wordVec[i];
      }
    }
  });

  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) {
    return [0.447, 0.447, 0.447, 0.447, 0.447]; // Uniform distribution fallback
  }
  return vector.map(val => val / magnitude);
};

const cosineSimilarity = (a: number[], b: number[]): number => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Pre-calculate reference taxonomy vectors
const TAXONOMY_REF_VECTORS = SITUATION_TAXONOMY.map(entry => {
  const phraseVectors = entry.phrases.map(phrase => ({
    phrase,
    vector: getVectorForText(phrase)
  }));
  return {
    category: entry.category,
    target_skus_classes: entry.target_skus_classes,
    phraseVectors
  };
});

export const useSituationParser = () => {
  const { budgetProfile } = useBudget();

  const parseSituation = (input: string): {
    situationName: string;
    calculatedBudget: number;
    recommendedItems: CartItem[];
    budgetBasisDescription: string;
  } => {
    const text = input.toLowerCase();

    // 1. Explicit budget extraction
    const rupeeRegex = /(?:rs\.?|inr|₹|inr\s*|rs\s*)\s*(\d+)/;
    const numberRegex = /\b(\d{3,5})\b/;
    
    let explicitAmount: number | null = null;
    const rupeeMatch = text.match(rupeeRegex);
    const numberMatch = text.match(numberRegex);

    if (rupeeMatch) {
      explicitAmount = parseInt(rupeeMatch[1]);
    } else if (numberMatch) {
      explicitAmount = parseInt(numberMatch[1]);
    }

    // 2. Hybrid ML Classification via Cosine Similarity in 5D Semantic Vector Space
    const queryVec = getVectorForText(text);
    
    let bestCategory = "UNEXPECTED_GUESTS_HOSPITALITY";
    let bestScore = -1;
    let bestSkuClasses: string[] = [];

    TAXONOMY_REF_VECTORS.forEach(cat => {
      cat.phraseVectors.forEach(p => {
        const score = cosineSimilarity(queryVec, p.vector);
        if (score > bestScore) {
          bestScore = score;
          bestCategory = cat.category;
          bestSkuClasses = cat.target_skus_classes;
        }
      });
    });

    // 3. Platform average and dynamic budget padding (15%) calculations
    const platformAverage = getHistoricalAverage(bestCategory);
    const paddedAverage = platformAverage * 1.15;
    
    let calculatedBudget = 0;
    let budgetBasisDescription = '';

    if (explicitAmount !== null) {
      calculatedBudget = explicitAmount;
      budgetBasisDescription = `Set to ₹${explicitAmount} based on your explicit budget request.`;
    } else {
      if (budgetProfile.active) {
        calculatedBudget = Math.min(budgetProfile.remaining, paddedAverage);
        budgetBasisDescription = `Capped at ₹${Math.round(calculatedBudget)} to fit the minimum of your remaining cycle budget (₹${Math.round(budgetProfile.remaining)}) or historical average + 15% padding (₹${Math.round(paddedAverage)}).`;
      } else {
        calculatedBudget = paddedAverage;
        budgetBasisDescription = `Set to ₹${Math.round(paddedAverage)} based on average order size for ${getCategoryLabel(bestCategory)} + 15% padding.`;
      }
    }

    // 4. Extract candidates and map to mock inventory
    const targetProductIds = bestSkuClasses.flatMap(mapSkuClassToProductIds);
    let matchedProducts = mockInventory.filter(p => targetProductIds.includes(p.id));

    // Sort matching products prioritizing budget alternative or standard if budget is tight
    const sortedProducts = [...matchedProducts].sort((a, b) => {
      const aScore = a.quality === 'budget-alternative' ? 2 : a.quality === 'standard' ? 1 : 0;
      const bScore = b.quality === 'budget-alternative' ? 2 : b.quality === 'standard' ? 1 : 0;
      
      if (calculatedBudget < 500) {
        return bScore - aScore || a.price - b.price; // cheap items first
      }
      return bScore - aScore || b.price - a.price;
    });

    // Curate the basket with diversity guarantee (at least one per SKU class if possible)
    const recommendedItems: CartItem[] = [];
    let currentCost = 0;

    bestSkuClasses.forEach(skuClass => {
      const candidateIds = mapSkuClassToProductIds(skuClass);
      const candidates = sortedProducts.filter(p => candidateIds.includes(p.id));
      if (candidates.length > 0) {
        const bestChoice = candidates[0];
        if (!recommendedItems.some(item => item.product.id === bestChoice.id)) {
          if (currentCost + bestChoice.price <= calculatedBudget) {
            recommendedItems.push({ product: bestChoice, quantity: 1 });
            currentCost += bestChoice.price;
          }
        }
      }
    });

    // Fill remaining budget constraints with other matches
    for (const prod of sortedProducts) {
      if (!recommendedItems.some(item => item.product.id === prod.id)) {
        if (currentCost + prod.price <= calculatedBudget) {
          recommendedItems.push({ product: prod, quantity: 1 });
          currentCost += prod.price;
        }
      }
    }

    // Fallback if empty
    if (recommendedItems.length === 0 && sortedProducts.length > 0) {
      const cheapest = sortedProducts.reduce((min, p) => p.price < min.price ? p : min, sortedProducts[0]);
      if (cheapest.price <= calculatedBudget) {
        recommendedItems.push({ product: cheapest, quantity: 1 });
      }
    }

    return {
      situationName: getCategoryLabel(bestCategory),
      calculatedBudget: Math.round(calculatedBudget),
      recommendedItems,
      budgetBasisDescription
    };
  };

  return { parseSituation };
};
