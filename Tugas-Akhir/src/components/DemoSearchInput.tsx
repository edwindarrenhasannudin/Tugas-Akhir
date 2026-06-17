import type { KeyboardEvent } from 'react';
import { Search } from 'lucide-react';

interface DemoSearchInputProps {
  dishInput: string;
  setDishInput: (value: string) => void;
  onSearch: () => void;
  onKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void;
}

const SUGGESTIONS = ['Kare Ayam', 'Rendang Sapi', 'Gulai Kambing', 'Soto Ayam', 'Pepes Ikan'];

export function DemoSearchInput({ dishInput, setDishInput, onSearch, onKeyPress }: DemoSearchInputProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <label className="block text-gray-900 mb-3" style={{ fontSize: '15px', fontWeight: 600 }}>
        Mau cari pengganti bahan masakan apa?
      </label>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={dishInput}
          onChange={(e) => setDishInput(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Contoh: Kare Ayam, Rendang Sapi, Soto Ayam..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          style={{ fontSize: '14px' }}
        />
        <button
          onClick={onSearch}
          disabled={!dishInput.trim()}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Search className="w-4 h-4" />
          Cari
        </button>
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-2">Coba salah satu:</p>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setDishInput(suggestion)}
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
