import { useState, type KeyboardEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Ingredient } from '../App';
import { ingredientsDatabase } from '../data/ingredientsData';
import nutritionRawData from '../data/nutrition_raw_dataset.json';
import nutritionScaledData from '../data/nutrition_scaled_dataset.json';
import laukData from '../data/lauk_dataset.json';
import sayuranData from '../data/sayuran_dataset.json';
import { euclideanDistance_NutritionOnly, manhattanDistance_NutritionOnly, cosineSimilarity_NutritionOnly } from '../utils/contentBasedFiltering';
import { detectIngredientFromDish, searchIngredients } from '../utils/ingredientSearch';
import { RecommendationWithMetrics } from '../utils/demoSystemHelpers';
import { DemoSearchInput } from './DemoSearchInput';
import { DemoStepNavigator } from './DemoStepNavigator';
import { DemoScalingStep } from './DemoScalingStep';
import { DemoOneHotStep } from './DemoOneHotStep';
import { RecommendationCard } from './RecommendationCard';
import { HeaderLogo } from './HeaderLogo';

interface NutritionData {
  id: number | string;
  name: string;
  energy: number;
  protein: number;
  fat: number;
  carbs: number;
  category?: string;
  image?: string;
}

interface DemoSystemPageProps {
  onBack: () => void;
}

export function DemoSystemPage({ onBack }: DemoSystemPageProps) {
  const [dishInput, setDishInput] = useState('');
  const [detectedIngredient, setDetectedIngredient] = useState<Ingredient | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationWithMetrics[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const detectIngredient = (dish: string): Ingredient | null => {
    if (!dish.trim()) return null;
    const detected = detectIngredientFromDish(dish);
    if (detected) return detected;
    const searchResults = searchIngredients(dish);
    if (searchResults.length === 0) return null;
    return searchResults[0].ingredient;
  };

  const handleSearch = () => {
    if (!dishInput.trim()) return;
    const detected = detectIngredient(dishInput);

    if (!detected) {
      alert('Maaf, bahan tidak terdeteksi. Coba masukkan nama masakan seperti "Kare Ayam", "Rendang Sapi", "Soto Ayam", atau nama bahan seperti "Ayam", "Bayam", dll.');
      return;
    }

    setDetectedIngredient(detected);

    const recs = ingredientsDatabase
      .filter(item => item.id !== detected.id)
      .map(item => {
        const euc = euclideanDistance_NutritionOnly(detected, item);
        const man = manhattanDistance_NutritionOnly(detected, item);
        const cos = cosineSimilarity_NutritionOnly(detected, item);
        const cos_distance = 1 - cos;
        const avg = (euc + man + cos_distance) / 3;
        return { ingredient: item, euc, man, cos, avg };
      })
      .sort((a, b) => {
        const categoryMatch_a = a.ingredient.category === detected.category ? 0 : 1;
        const categoryMatch_b = b.ingredient.category === detected.category ? 0 : 1;
        if (categoryMatch_a !== categoryMatch_b) {
          return categoryMatch_a - categoryMatch_b;
        }

        const textureMatch_a = a.ingredient.texture === detected.texture ? 0 : 1;
        const textureMatch_b = b.ingredient.texture === detected.texture ? 0 : 1;
        
        if (textureMatch_a !== textureMatch_b) {
          return textureMatch_a - textureMatch_b;
        }
        
        return a.avg - b.avg;
      })
      .slice(0, 5);

    setRecommendations(recs);
    setShowResults(true);
    setCurrentStep(1);
  };

  const handleReset = () => {
    setDishInput('');
    setDetectedIngredient(null);
    setRecommendations([]);
    setShowResults(false);
    setCurrentStep(0);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const rawDataForDisplay: NutritionData[] = nutritionRawData as NutritionData[];
  const scaledDataForDisplay: NutritionData[] = nutritionScaledData as NutritionData[];

  const getMinMaxValues = (data: NutritionData[]) => {
    if (data.length === 0) return { mins: { energy: 0, protein: 0, fat: 0, carbs: 0 }, maxs: { energy: 0, protein: 0, fat: 0, carbs: 0 } };
    
    return {
      mins: {
        energy: Math.min(...data.map(d => typeof d.energy === 'number' ? d.energy : 0)),
        protein: Math.min(...data.map(d => typeof d.protein === 'number' ? d.protein : 0)),
        fat: Math.min(...data.map(d => typeof d.fat === 'number' ? d.fat : 0)),
        carbs: Math.min(...data.map(d => typeof d.carbs === 'number' ? d.carbs : 0)),
      },
      maxs: {
        energy: Math.max(...data.map(d => typeof d.energy === 'number' ? d.energy : 0)),
        protein: Math.max(...data.map(d => typeof d.protein === 'number' ? d.protein : 0)),
        fat: Math.max(...data.map(d => typeof d.fat === 'number' ? d.fat : 0)),
        carbs: Math.max(...data.map(d => typeof d.carbs === 'number' ? d.carbs : 0)),
      }
    };
  };

  const { mins, maxs } = getMinMaxValues(rawDataForDisplay);

  const relevantIngredients = detectedIngredient
    ? [detectedIngredient, ...recommendations.map(r => r.ingredient)]
    : [];

  const steps = [
    { num: 1, label: 'Min-Max Scaling' },
    { num: 2, label: 'One-Hot Encoding' },
    { num: 3, label: 'Hasil Rekomendasi' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <HeaderLogo onClick={onBack} />
          <nav className="flex gap-6">
            <span className="text-blue-600 text-sm" style={{ fontWeight: 600 }}>Demo Sistem</span>
            <button onClick={onBack} className="text-gray-500 hover:text-blue-600 text-sm">Beranda</button>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {!showResults ? (
          <>
            <div className="mb-8">
              <h1 className="text-2xl text-gray-900 mb-2" style={{ fontWeight: 700 }}>Demo Sistem Rekomendasi</h1>
              <p className="text-gray-500" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                Masukkan nama masakan, sistem akan mendeteksi bahan utama dan mencarikan pengganti
                berdasarkan energi, protein, lemak, karbohidrat, tekstur, dan kategori.
              </p>
            </div>

            <DemoSearchInput
              dishInput={dishInput}
              setDishInput={setDishInput}
              onSearch={handleSearch}
              onKeyPress={handleKeyPress}
            />
          </>
        ) : (
          <div>
            <DemoStepNavigator
              dishInput={dishInput}
              detectedIngredient={detectedIngredient}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              onReset={handleReset}
              steps={steps}
            />

            <DemoScalingStep
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              rawDataForDisplay={rawDataForDisplay}
              scaledDataForDisplay={scaledDataForDisplay}
              mins={mins}
              maxs={maxs}
            />

            <DemoOneHotStep
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              relevantIngredients={relevantIngredients}
              laukData={laukData as any[]}
              sayuranData={sayuranData as any[]}
            />

            {currentStep === 3 && detectedIngredient && (
              <div>
                <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
                  <p className="text-xs text-gray-500 mb-2">Nutrisi bahan dari 
                    <span className="text-sm text-gray-900 mb-4" style={{ fontWeight: 600 }}> {detectedIngredient.name}</span>
                      <span className="text-gray-400 ml-1" style={{ fontWeight: 400, fontSize: '13px' }}>
                        ({detectedIngredient.category})
                      </span>
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left text-xs text-gray-400 pb-2" style={{ fontWeight: 500 }}>Energi</th>
                          <th className="text-left text-xs text-gray-400 pb-2" style={{ fontWeight: 500 }}>Protein</th>
                          <th className="text-left text-xs text-gray-400 pb-2" style={{ fontWeight: 500 }}>Lemak</th>
                          <th className="text-left text-xs text-gray-400 pb-2" style={{ fontWeight: 500 }}>Karbo</th>
                          <th className="text-left text-xs text-gray-400 pb-2" style={{ fontWeight: 500 }}>Tekstur</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="pt-2 text-gray-900" style={{ fontWeight: 500 }}>{detectedIngredient.energy.toFixed(4)} (scaled)</td>
                          <td className="pt-2 text-gray-900" style={{ fontWeight: 500 }}>{detectedIngredient.protein.toFixed(4)} (scaled)</td>
                          <td className="pt-2 text-gray-900" style={{ fontWeight: 500 }}>{detectedIngredient.fat.toFixed(4)} (scaled)</td>
                          <td className="pt-2 text-gray-900" style={{ fontWeight: 500 }}>{detectedIngredient.carbs.toFixed(4)} (scaled)</td>
                          <td className="pt-2 text-gray-900" style={{ fontWeight: 500 }}>{detectedIngredient.texture}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mb-4">
                  <h2 className="text-gray-900 mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>Rekomendasi Bahan Pengganti</h2>
                  <p className="text-xs text-gray-400">Top 5 bahan diurutkan berdasarkan rata-rata (Avg) dari Euclidean, Manhattan, dan Cosine Similarity</p>
                </div>

                <div className="space-y-3 mb-6">
                  {recommendations.map((rec, index) => (
                    <RecommendationCard
                      key={rec.ingredient.id}
                      rec={rec}
                      index={index}
                      detectedIngredient={detectedIngredient}
                    />
                  ))}
                </div>

                <div className="flex justify-start">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    One-Hot Encoding
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
