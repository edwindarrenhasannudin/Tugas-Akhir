import type { Ingredient } from '../App';
import type { RecommendationWithMetrics } from '../utils/demoSystemHelpers';
import { formatDifference, getVeganLabel, isIngredientVegan } from '../utils/demoSystemHelpers';

interface RecommendationCardProps {
  rec: RecommendationWithMetrics;
  index: number;
  detectedIngredient: Ingredient;
}

export function RecommendationCard({ rec, index, detectedIngredient }: RecommendationCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-gray-400" style={{ fontWeight: 600 }}>{index + 1}.</span>
          <div>
            <span className="text-gray-900" style={{ fontSize: '15px', fontWeight: 600 }}>{rec.ingredient.name}</span>
            <span className="text-xs text-gray-400 ml-2">{rec.ingredient.category}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ml-2 ${isIngredientVegan(rec.ingredient) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {getVeganLabel(rec.ingredient)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs tabular-nums">
          <span className="text-gray-400">Euc <span className="text-gray-700" style={{ fontWeight: 600 }}>{rec.euc.toFixed(4)}</span></span>
          <span className="text-gray-400">Man <span className="text-gray-700" style={{ fontWeight: 600 }}>{rec.man.toFixed(4)}</span></span>
          <span className="text-gray-400">Cos <span className="text-gray-700" style={{ fontWeight: 600 }}>{rec.cos.toFixed(4)}</span></span>
          <span className="text-gray-400">Avg <span className="text-blue-700" style={{ fontWeight: 600 }}>{rec.avg.toFixed(4)}</span></span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-gray-400 pb-1.5 pr-4" style={{ fontWeight: 500 }}>Energi</th>
              <th className="text-left text-gray-400 pb-1.5 pr-4" style={{ fontWeight: 500 }}>Protein</th>
              <th className="text-left text-gray-400 pb-1.5 pr-4" style={{ fontWeight: 500 }}>Lemak</th>
              <th className="text-left text-gray-400 pb-1.5 pr-4" style={{ fontWeight: 500 }}>Karbo</th>
              <th className="text-left text-gray-400 pb-1.5" style={{ fontWeight: 500 }}>Tekstur</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="pt-1.5 pr-4 text-gray-700">
                {rec.ingredient.energy.toFixed(4)} KKal
                <div className="text-[11px] text-gray-500 mt-0.5">{formatDifference(rec.ingredient.energy, detectedIngredient.energy)}</div>
              </td>
              <td className="pt-1.5 pr-4 text-gray-700">
                {rec.ingredient.protein.toFixed(4)}g
                <div className="text-[11px] text-gray-500 mt-0.5">{formatDifference(rec.ingredient.protein, detectedIngredient.protein)}</div>
              </td>
              <td className="pt-1.5 pr-4 text-gray-700">
                {rec.ingredient.fat.toFixed(4)}g
                <div className="text-[11px] text-gray-500 mt-0.5">{formatDifference(rec.ingredient.fat, detectedIngredient.fat)}</div>
              </td>
              <td className="pt-1.5 pr-4 text-gray-700">
                {rec.ingredient.carbs.toFixed(4)}g
                <div className="text-[11px] text-gray-500 mt-0.5">{formatDifference(rec.ingredient.carbs, detectedIngredient.carbs)}</div>
              </td>
              <td className="pt-1.5 text-gray-700">{rec.ingredient.texture}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
