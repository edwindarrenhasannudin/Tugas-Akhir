import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Ingredient } from '../App';

interface DemoOneHotStepProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  relevantIngredients: Ingredient[];
  laukData: any[];
  sayuranData: any[];
}

export function DemoOneHotStep({
  currentStep,
  setCurrentStep,
  relevantIngredients,
  laukData,
  sayuranData,
}: DemoOneHotStepProps) {
  if (currentStep !== 2) return null;

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
        <h2 className="text-gray-900 mb-1" style={{ fontSize: '16px', fontWeight: 600 }}>One-Hot Encoding</h2>
        <p className="text-xs text-gray-400 mb-4" style={{ lineHeight: '1.5' }}>
          Mengubah fitur kategorikal (tekstur dan kategori) menjadi representasi biner (0/1) agar bisa dihitung secara numerik dalam similarity.
        </p>

        <p className="text-xs text-gray-500 mb-2" style={{ fontWeight: 600 }}>Data Kategorikal Asli</p>
        <div className="overflow-x-auto mb-5">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-gray-500 px-3 py-2 border border-gray-200" style={{ fontWeight: 600 }}>Bahan</th>
                <th className="text-left text-gray-500 px-3 py-2 border border-gray-200" style={{ fontWeight: 600 }}>Tekstur</th>
                <th className="text-left text-gray-500 px-3 py-2 border border-gray-200" style={{ fontWeight: 600 }}>Kategori</th>
              </tr>
            </thead>
            <tbody>
              {relevantIngredients.map((ing, i) => (
                <tr key={ing.id} className={i === 0 ? 'bg-blue-50' : ''}>
                  <td className="px-3 py-2 border border-gray-200 text-gray-800" style={{ fontWeight: i === 0 ? 600 : 400 }}>
                    {ing.name} {i === 0 && <span className="text-blue-600 text-[10px]">(target)</span>}
                  </td>
                  <td className="px-3 py-2 border border-gray-200 text-gray-700">{ing.texture}</td>
                  <td className="px-3 py-2 border border-gray-200 text-gray-700">{ing.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-4" style={{ fontWeight: 600 }}>Hasil One-Hot Encoding</p>

          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>A. Hasil One-Hot Encoding Bahan Lauk</p>
            <p className="text-xs text-gray-400 mb-3">Fitur tekstur dan kategori diubah menjadi representasi biner (0/1)</p>
            <div className="overflow-x-auto border border-gray-200 rounded-lg" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="text-xs border-collapse" style={{ minWidth: '100%' }}>
                <thead style={{ position: 'sticky', top: 0 }}>
                  <tr className="bg-blue-50">
                    <th className="text-left text-gray-600 px-2 py-2 border border-gray-200 whitespace-nowrap" style={{ fontWeight: 600, minWidth: '150px' }}>Bahan</th>
                    <th className="text-center text-gray-500 px-1 py-2 border border-gray-200 whitespace-nowrap" style={{ fontWeight: 600, fontSize: '10px' }}>Tekstur Padat</th>
                    <th className="text-center text-gray-500 px-1 py-2 border border-gray-200 whitespace-nowrap" style={{ fontWeight: 600, fontSize: '10px' }}>Tekstur Lembut</th>
                    <th className="text-center text-gray-500 px-1 py-2 border border-gray-200 whitespace-nowrap" style={{ fontWeight: 600, fontSize: '10px' }}>Tekstur Cair</th>
                  </tr>
                </thead>
                <tbody>
                  {laukData.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-2 py-2 border border-gray-200 text-gray-800 whitespace-nowrap" style={{ fontWeight: 600, minWidth: '150px' }}>{item.name}</td>
                      <td className="px-1 py-2 border border-gray-200 text-center" style={{ color: item.texture_padat === 1 ? '#059669' : '#d1d5db', fontWeight: item.texture_padat === 1 ? 600 : 400 }}>{item.texture_padat ? '1' : '0'}</td>
                      <td className="px-1 py-2 border border-gray-200 text-center" style={{ color: item.texture_lembut === 1 ? '#059669' : '#d1d5db', fontWeight: item.texture_lembut === 1 ? 600 : 400 }}>{item.texture_lembut ? '1' : '0'}</td>
                      <td className="px-1 py-2 border border-gray-200 text-center" style={{ color: item.texture_cair === 1 ? '#059669' : '#d1d5db', fontWeight: item.texture_cair === 1 ? 600 : 400 }}>{item.texture_cair ? '1' : '0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>B. Hasil One-Hot Encoding Bahan Sayuran</p>
            <p className="text-xs text-gray-400 mb-3">Fitur tekstur dan kategori diubah menjadi representasi biner (0/1)</p>
            <div className="overflow-x-auto border border-gray-200 rounded-lg" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="text-xs border-collapse" style={{ minWidth: '100%' }}>
                <thead style={{ position: 'sticky', top: 0 }}>
                  <tr className="bg-green-50">
                    <th className="text-left text-gray-600 px-2 py-2 border border-gray-200 whitespace-nowrap" style={{ fontWeight: 600, minWidth: '150px' }}>Bahan</th>
                    <th className="text-center text-gray-500 px-1 py-2 border border-gray-200 whitespace-nowrap" style={{ fontWeight: 600, fontSize: '10px' }}>Tekstur Padat</th>
                    <th className="text-center text-gray-500 px-1 py-2 border border-gray-200 whitespace-nowrap" style={{ fontWeight: 600, fontSize: '10px' }}>Tekstur Lembut</th>
                    <th className="text-center text-gray-500 px-1 py-2 border border-gray-200 whitespace-nowrap" style={{ fontWeight: 600, fontSize: '10px' }}>Tekstur Renyah</th>
                  </tr>
                </thead>
                <tbody>
                  {sayuranData.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-2 py-2 border border-gray-200 text-gray-800 whitespace-nowrap" style={{ fontWeight: 600, minWidth: '150px' }}>{item.name}</td>
                      <td className="px-1 py-2 border border-gray-200 text-center" style={{ color: item.texture_padat === 1 ? '#059669' : '#d1d5db', fontWeight: item.texture_padat === 1 ? 600 : 400 }}>{item.texture_padat ? '1' : '0'}</td>
                      <td className="px-1 py-2 border border-gray-200 text-center" style={{ color: item.texture_lembut === 1 ? '#059669' : '#d1d5db', fontWeight: item.texture_lembut === 1 ? 600 : 400 }}>{item.texture_lembut ? '1' : '0'}</td>
                      <td className="px-1 py-2 border border-gray-200 text-center" style={{ color: item.texture_renyah === 1 ? '#059669' : '#d1d5db', fontWeight: item.texture_renyah === 1 ? 600 : 400 }}>{item.texture_renyah ? '1' : '0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Min-Max Scaling
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          Selanjutnya: Hasil Rekomendasi
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
