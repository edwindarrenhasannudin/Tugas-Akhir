import { Ingredient } from '../App';
import { ingredientsDatabase } from '../data/ingredientsData';

/**
 * Search dan filter ingredients dengan smart matching
 * Priority:
 * 1. Exact match (case-insensitive)
 * 2. Word start match (bayam = "Bayam" matches "Bayam Merah")
 * 3. Substring match (tapi hindari "ayam" ketika "bayam")
 */

export interface SearchResult {
  ingredient: Ingredient;
  score: number; // 0-1, higher = better match
  matchType: 'exact' | 'word-start' | 'substring';
}

// ============================================================
// Kata-kata masak/metode yang BUKAN bahan — harus di-skip
// ============================================================
const COOKING_TERMS = new Set([
  // Metode masak
  'goreng', 'bakar', 'rebus', 'kukus', 'panggang', 'tumis', 'sangrai',
  'oseng', 'ceplok', 'geprek', 'penyet', 'rica', 'balado', 'sambal',
  // Jenis masakan
  'kare', 'kari', 'gulai', 'soto', 'rawon', 'opor', 'rendang', 'pepes',
  'semur', 'sop', 'sup', 'tongseng', 'lodeh', 'sayur', 'laksa', 'sup',
  'pindang', 'pallu', 'acar', 'urap', 'gado', 'pecel', 'rujak',
  'capcay', 'sapo', 'asam', 'manis', 'pedas', 'asin',
  // Karbohidrat / base (bukan bahan utama protein/sayur)
  'nasi', 'mie', 'mi', 'bihun', 'kwetiau', 'bakso', 'bakmi',
  'lontong', 'ketupat', 'bubur',
  // Kata bantu umum
  'ala', 'khas', 'spesial', 'special', 'hari', 'ini', 'enak', 'lezat',
  'sederhana', 'rumahan', 'padang', 'jawa', 'sunda', 'manado', 'bali',
]);

// ============================================================
// Compound keyword aliases — multi-word phrases yang harus
// di-match secara utuh SEBELUM single-word alias
// ============================================================
const COMPOUND_KEYWORD_ALIASES: Record<string, string[]> = {
  'telur ayam':   ['Telur Ayam'],
  'telur bebek':  ['Telur bebek tambak'],
};

// ============================================================
// Mapping keyword pendek → nama ingredient di database
// ============================================================
const KEYWORD_ALIASES: Record<string, string[]> = {
  'ayam':     ['Ayam'],
  'bebek':    ['Bebek (itik)'],
  'itik':     ['Bebek (itik)'],
  'sapi':     ['Daging Sapi'],
  'kambing':  ['Daging Kambing'],
  'kerbau':   ['Daging Kerbau'],
  'cumi':     ['Cumi-cumi'],
  'udang':    ['Udang'],
  'kepiting': ['Kepiting'],
  'kerang':   ['Kerang'],
  'ikan':     ['Ikan'],
  'tahu':     ['Tahu', 'Kembang tahu', 'Moon tahu'],
  'tempe':    ['Tempe pasar'],
  'telur':    ['Telur Ayam', 'Telur bebek tambak'],
  // Sayuran
  'bayam':    ['Bayam', 'Bayam Merah'],
  'kangkung': ['Kangkung'],
  'sawi':     ['Sawi'],
  'kol':      ['Kool Kembang'],
  'kol kembang': ['Kool Kembang'],
  'kool':     ['Kool Kembang'],
  'terong':   ['Terong', 'Terong Belanda'],
  'kentang':  ['Kentang'],
  'wortel':   ['Wortel'],
  'buncis':   ['Buncis'],
  'tomat':    ['Tomat merah'],
  'selada':   ['Selada', 'Selada Air'],
  'lobak':    ['Lobak'],
  'jengkol':  ['Jengkol'],
  'rebung':   ['Rebung'],
  'labu':     ['Labu Siam', 'Labu Air', 'Labu waluh'],
  'ketimun':  ['Ketimun'],
  'timun':    ['Ketimun'],
  'oyong':    ['Gambas (Oyong)'],
  'gambas':   ['Gambas (Oyong)'],
  'ceplok':   ['Telur Ayam'],
  'dadar':    ['Telur Ayam'],
};

/**
 * Check if query matches word at word boundary
 * e.g., "bayam" matches "Bayam Segar" but not "Daging Sapi"
 */
const isWordMatch = (query: string, text: string): boolean => {
  const words = text.toLowerCase().split(/\s+/);
  const queryLower = query.toLowerCase();
  return words.some(word => 
    word === queryLower || 
    word.startsWith(queryLower)
  );
};

/**
 * Search ingredients dengan query
 * Return sorted by relevance
 */
export const searchIngredients = (query: string): SearchResult[] => {
  if (!query.trim()) return [];

  const queryLower = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  for (const ingredient of ingredientsDatabase) {
    const nameLower = ingredient.name.toLowerCase();
    let score = 0;
    let matchType: 'exact' | 'word-start' | 'substring' = 'substring';

    // 1. Exact match - nama bahan sama persis
    if (nameLower === queryLower) {
      score = 1.0;
      matchType = 'exact';
    }
    // 2. Word start match - bayam matches "Bayam Merah", "Bayam Segar"
    else if (isWordMatch(queryLower, ingredient.name)) {
      score = 0.9;
      matchType = 'word-start';
    }
    // 3. Substring match - BUT dengan penalti untuk false positives
    else if (nameLower.includes(queryLower)) {
      // Hindari "ayam" ketika cari "bayam"
      // Cek word boundary lebih ketat
      const words = nameLower.split(/\s+/);
      const foundInWord = words.some(w => w.includes(queryLower));
      
      if (foundInWord) {
        score = 0.7;
        matchType = 'substring';
      }
    }

    if (score > 0) {
      results.push({
        ingredient,
        score,
        matchType
      });
    }
  }

  // Sort by score (descending), then by name (ascending)
  return results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.ingredient.name.localeCompare(b.ingredient.name);
  });
};

/**
 * Get single best match ingredient
 * Sekarang coba detectIngredientFromDish dulu, baru fallback ke searchIngredients
 */
export const getClosestIngredient = (query: string): Ingredient | null => {
  // 1. Coba deteksi dari nama masakan (smart detection)
  const dishDetected = detectIngredientFromDish(query);
  if (dishDetected) return dishDetected;

  // 2. Fallback: cari langsung sebagai nama bahan
  const results = searchIngredients(query);
  
  if (results.length === 0) return null;
  
  // Return exact match jika ada
  const exactMatch = results.find(r => r.matchType === 'exact');
  if (exactMatch) return exactMatch.ingredient;
  
  // Return word-start match dengan score tinggi
  const wordMatch = results.find(r => r.matchType === 'word-start' && r.score >= 0.8);
  if (wordMatch) return wordMatch.ingredient;
  
  // Return best substring match dengan score cukup tinggi
  const substringMatch = results[0];
  if (substringMatch && substringMatch.score >= 0.7) {
    return substringMatch.ingredient;
  }
  
  return null;
};

/**
 * Get autocomplete suggestions
 * Limit ke top N results
 */
export const getIngredientSuggestions = (query: string, limit: number = 10): Ingredient[] => {
  return searchIngredients(query)
    .slice(0, limit)
    .map(r => r.ingredient);
};

/**
 * Helper: cari ingredient di database by nama (case-insensitive)
 */
const findIngredientByName = (name: string): Ingredient | null => {
  const lower = name.toLowerCase();
  return ingredientsDatabase.find(
    ing => ing.name.toLowerCase() === lower
  ) ?? null;
};

/**
 * Category priority untuk detection
 * Prioritas: lauk/protein > sayuran > bumbu
 */
const CATEGORY_PRIORITY: Record<string, number> = {
  'lauk': 100,
  'sayuran': 50,
  'bumbu': 10,
  'lainnya': 5,
};

const getCategoryPriority = (category: string): number => {
  return CATEGORY_PRIORITY[category] ?? 0;
};

/**
 * Detect ingredient dari nama masakan
 * 
 * Alur:
 * 1. Pecah input jadi kata-kata
 * 2. Buang kata-kata yang merupakan istilah masak (goreng, bakar, kare, dll)
 * 3. Coba cocokkan multi-word combo (2 kata) dulu, lalu single word
 * 4. Gunakan alias mapping untuk keyword pendek
 * 5. Prioritaskan lauk > sayuran > bumbu
 */
export const detectIngredientFromDish = (dishName: string): Ingredient | null => {
  if (!dishName.trim()) return null;

  const words = dishName.toLowerCase().trim().split(/\s+/);
  
  // Filter kata-kata masak
  const ingredientWords = words.filter(w => !COOKING_TERMS.has(w));

  // Jika semua kata terfilter, gunakan kata asli (mungkin user langsung ketik nama bahan)
  const wordsToUse = ingredientWords.length > 0 ? ingredientWords : words;

  // ---- Tahap 1: Coba cocokkan 2-word combos ----
  const twoWordMatches: Ingredient[] = [];
  for (let i = 0; i < wordsToUse.length - 1; i++) {
    const combo = wordsToUse[i] + ' ' + wordsToUse[i + 1];
    
    // 1a. Cek compound aliases (exact match) — prioritas tertinggi
    const compoundNames = COMPOUND_KEYWORD_ALIASES[combo];
    if (compoundNames) {
      for (const n of compoundNames) {
        const found = findIngredientByName(n);
        if (found) return found; // langsung return, ini match paling spesifik
      }
    }

    // 1b. Cek langsung di database (exact / startsWith)
    for (const ing of ingredientsDatabase) {
      const ingLower = ing.name.toLowerCase();
      if (ingLower === combo || ingLower.startsWith(combo)) {
        twoWordMatches.push(ing);
      }
    }
  }

  if (twoWordMatches.length > 0) {
    // Deduplicate dan sort by category priority
    const uniqueMatches = Array.from(new Map(twoWordMatches.map(m => [m.id, m])).values());
    uniqueMatches.sort((a, b) => getCategoryPriority(b.category) - getCategoryPriority(a.category));
    return uniqueMatches[0];
  }

  // ---- Tahap 2: Coba cocokkan single words via alias ----
  const singleMatches: Ingredient[] = [];
  for (const word of wordsToUse) {
    // Cek alias mapping
    const aliasNames = KEYWORD_ALIASES[word];
    if (aliasNames) {
      for (const n of aliasNames) {
        const found = findIngredientByName(n);
        if (found) singleMatches.push(found);
      }
    }
  }

  if (singleMatches.length > 0) {
    // Deduplicate dan sort by category priority
    const uniqueMatches = Array.from(new Map(singleMatches.map(m => [m.id, m])).values());
    uniqueMatches.sort((a, b) => getCategoryPriority(b.category) - getCategoryPriority(a.category));
    return uniqueMatches[0];
  }

  // ---- Tahap 3: Coba word-boundary match langsung di database ----
  const directMatches: Ingredient[] = [];
  for (const word of wordsToUse) {
    if (word.length < 3) continue; // skip kata terlalu pendek
    for (const ing of ingredientsDatabase) {
      const ingWords = ing.name.toLowerCase().split(/\s+/);
      // Word harus match di word boundary (exact atau startsWith), bukan substring
      const isMatch = ingWords.some(iw => iw === word || (iw.startsWith(word) && word.length >= 3));
      if (isMatch) {
        directMatches.push(ing);
      }
    }
  }

  if (directMatches.length > 0) {
    // Deduplicate dan sort by category priority
    const uniqueMatches = Array.from(new Map(directMatches.map(m => [m.id, m])).values());
    uniqueMatches.sort((a, b) => getCategoryPriority(b.category) - getCategoryPriority(a.category));
    return uniqueMatches[0];
  }

  return null;
};

/**
 * Get all unique categories sorted
 */
export const getCategories = (): string[] => {
  const categories = new Set(ingredientsDatabase.map(ing => ing.category));
  return Array.from(categories).sort();
};

/**
 * Filter ingredients by category
 */
export const filterByCategory = (query: string, category: string): Ingredient[] => {
  return searchIngredients(query)
    .filter(r => r.ingredient.category === category)
    .map(r => r.ingredient);
};
