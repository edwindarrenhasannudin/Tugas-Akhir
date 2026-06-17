import type { Ingredient } from '../App';

export interface RecommendationWithMetrics {
  ingredient: Ingredient;
  euc: number;
  man: number;
  cos: number;
  avg: number;
}

export const formatDifference = (current: number, target: number) => {
  const diff = current - target;
  const sign = diff >= 0 ? '+' : '-';
  return `(${sign}${Math.abs(diff).toFixed(4)})`;
};

export const isIngredientVegan = (ingredient: Ingredient): boolean => {
  if (ingredient.isVegan !== undefined) return ingredient.isVegan;

  const normalizedName = ingredient.name.toLowerCase();
  const veganCategories = new Set(['sayuran', 'buah', 'bumbu', 'rempah']);
  if (veganCategories.has(ingredient.category)) return true;

  const plantBasedKeywords = [
    'tempe', 'tahu', 'kacang', 'kedelai', 'jamur', 'kelapa', 'sayur', 'daun',
    'wortel', 'bayam', 'bawang', 'cabai', 'lada', 'sereh', 'serai',
  ];
  const animalKeywords = [
    'ayam', 'bebek', 'itik', 'sapi', 'kerbau', 'kambing', 'domba', 'ikan',
    'udang', 'kepiting', 'kerang', 'cumi', 'telur', 'daging', 'susu', 'keju',
    'tuna', 'salmon', 'babi',
  ];

  if (plantBasedKeywords.some(keyword => normalizedName.includes(keyword))) return true;
  if (animalKeywords.some(keyword => normalizedName.includes(keyword))) return false;

  return ingredient.category !== 'lauk';
};

export const getVeganLabel = (ingredient: Ingredient) => {
  return isIngredientVegan(ingredient) ? 'Vegan' : 'Non-Vegan';
};
