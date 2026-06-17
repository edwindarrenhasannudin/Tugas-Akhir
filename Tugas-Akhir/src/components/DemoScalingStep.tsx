import { ArrowRight } from 'lucide-react';

interface NutritionSummary {
  energy: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface NutritionData {
  id: number | string;
  name: string;
  energy: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface DemoScalingStepProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  rawDataForDisplay: NutritionData[];
  scaledDataForDisplay: NutritionData[];
  mins: NutritionSummary;
  maxs: NutritionSummary;
}

export function DemoScalingStep({
  currentStep,
  setCurrentStep,
  rawDataForDisplay,
  scaledDataForDisplay,
  mins,
  maxs,
}: DemoScalingStepProps) {
  if (currentStep !== 1) return null;

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
        <h2 className="text-gray-900 mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>Min-Max Scaling</h2>
        <p className="text-xs text-gray-400 mb-4" style={{ lineHeight: '1.5' }}>
          Normalisasi fitur numerik (energi, protein, lemak, karbohidrat) ke rentang 0–1 agar setiap fitur punya bobot yang setara saat perhitungan similarity.
        </p>

        <p className="text-xs text-gray-500 mb-2" style={{ fontWeight: 600 }}>Data Asli dari Nutrition Dataset</p>
        <div className="overflow-x-auto mb-5" style={{ maxHeight: '250px', overflowY: 'auto' }}>
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="text-left text-gray-500 px-3 py-2 border border-gray-200" style={{ fontWeight: 600 }}>Bahan</th>
                <th className="text-right text-gray-500 px-3 py-2 border border-gray-200" style={{ fontWeight: 600 }}>Energi (KKal)</th>
                <th className="text-right text-gray-500 px-3 py-2 border border-gray-200" style={{ fontWeight: 600 }}>Protein (g)</th>
                <th className="text-right text-gray-500 px-3 py-2 border border-gray-200" style={{ fontWeight: 600 }}>Lemak (g)</th>
                <th className="text-right text-gray-500 px-3 py-2 border border-gray-200" style={{ fontWeight: 600 }}>Karbo (g)</th>
              </tr>
            </thead>
            <tbody>
              {rawDataForDisplay.map((ing) => (
                <tr key={ing.id}>
                  <td className="px-3 py-2 border border-gray-200 text-gray-800">{ing.name}</td>
                  <td className="px-3 py-2 border border-gray-200 text-right text-gray-700">{ing.energy.toFixed(1)}</td>
                  <td className="px-3 py-2 border border-gray-200 text-right text-gray-700">{ing.protein.toFixed(1)}</td>
                  <td className="px-3 py-2 border border-gray-200 text-right text-gray-700">{ing.fat.toFixed(1)}</td>
                  <td className="px-3 py-2 border border-gray-200 text-right text-gray-700">{ing.carbs.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-4 mb-4 text-xs">
          <div className="bg-gray-50 px-3 py-2 rounded border border-gray-100">
            <span className="text-gray-400">Min: </span>
            <span className="text-gray-600">E={mins.energy} | P={mins.protein} | L={mins.fat} | K={mins.carbs}</span>
          </div>
          <div className="bg-gray-50 px-3 py-2 rounded border border-gray-100">
            <span className="text-gray-400">Max: </span>
            <span className="text-gray-600">E={maxs.energy} | P={maxs.protein} | L={maxs.fat} | K={maxs.carbs}</span>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 mb-5">
          <p className="text-xs text-gray-500" style={{ fontFamily: 'monospace' }}>
            X_scaled = (X - X_min) / (X_max - X_min)
          </p>
        </div>

        <p className="text-xs text-gray-500 mb-2" style={{ fontWeight: 600 }}>Hasil Normalisasi (0–1) dari nutrition_scaled_dataset.json</p>
        <div className="overflow-x-auto mb-5" style={{ maxHeight: '250px', overflowY: 'auto' }}>
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="text-left text-gray-500 px-3 py-2 border border-gray-200" style={{ fontWeight: 600 }}>Bahan</th>
                <th className="text-right text-gray-500 px-3 py-2 border border-gray-200" style={{ fontWeight: 600 }}>Energi</th>
                <th className="text-right text-gray-500 px-3 py-2 border border-gray-200" style={{ fontWeight: 600 }}>Protein</th>
                <th className="text-right text-gray-500 px-3 py-2 border border-gray-200" style={{ fontWeight: 600 }}>Lemak</th>
                <th className="text-right text-gray-500 px-3 py-2 border border-gray-200" style={{ fontWeight: 600 }}>Karbo</th>
              </tr>
            </thead>
            <tbody>
              {scaledDataForDisplay.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-2 border border-gray-200 text-gray-800">{row.name}</td>
                  <td className="px-3 py-2 border border-gray-200 text-right text-gray-700 tabular-nums">{row.energy.toFixed(4)}</td>
                  <td className="px-3 py-2 border border-gray-200 text-right text-gray-700 tabular-nums">{row.protein.toFixed(4)}</td>
                  <td className="px-3 py-2 border border-gray-200 text-right text-gray-700 tabular-nums">{row.fat.toFixed(4)}</td>
                  <td className="px-3 py-2 border border-gray-200 text-right text-gray-700 tabular-nums">{row.carbs.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setCurrentStep(2)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          Selanjutnya: One-Hot Encoding
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
