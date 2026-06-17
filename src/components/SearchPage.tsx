import { Search, ChefHat, Utensils, ArrowRight } from 'lucide-react';
import bgImage from '../assets/Background.png';
import { HeaderLogo } from './HeaderLogo';

interface SearchPageProps {
  onDemoSystem: () => void;
}

export function SearchPage({ onDemoSystem }: SearchPageProps) {
  return (
      <div className="min-h-screen relative">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="absolute inset-0 bg-white/85"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <header className="border-b border-gray-200 bg-white/60 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
              <HeaderLogo />
              <nav className="flex gap-6">
                <button 
                  onClick={onDemoSystem} 
                  className="text-gray-600 hover:text-blue-600 text-sm"
                >
                  Demo Sistem
                </button>
              </nav>
            </div>
          </header>

          {/* Hero */}
          <div className="max-w-3xl mx-auto px-6 pt-20 pb-16">
            <div className="mb-10">
              <p className="text-sm text-blue-600 mb-3 tracking-wide uppercase">Content Based Filtering</p>
              <h1 className="text-3xl text-gray-900 mb-4 leading-snug" style={{ fontWeight: 700 }}>
                Sistem Rekomendasi<br />Pengganti Bahan Masakan
              </h1>
              <p className="text-gray-500 max-w-lg leading-relaxed" style={{ fontSize: '15px' }}>
                Cari alternatif bahan masakan berdasarkan kesamaan nutrisi, tekstur, dan kategori. 
                Cukup masukkan nama masakan, sistem akan memberikan rekomendasi pengganti yang paling mirip.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onDemoSystem}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
              >
                Coba Demo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="max-w-3xl mx-auto px-6 pb-20">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                  <Search className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-gray-900 mb-1" style={{ fontSize: '14px', fontWeight: 600 }}>Deteksi Otomatis</h3>
                <p className="text-gray-500" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  Bahan utama terdeteksi langsung dari nama masakan yang Anda input
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center mb-3">
                  <ChefHat className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-gray-900 mb-1" style={{ fontSize: '14px', fontWeight: 600 }}>6 Kriteria</h3>
                <p className="text-gray-500" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  Energi, protein, lemak, karbohidrat, tekstur, dan kategori bahan
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center mb-3">
                  <Utensils className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="text-gray-900 mb-1" style={{ fontSize: '14px', fontWeight: 600 }}>Similarity Score</h3>
                <p className="text-gray-500" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                  Weighted Sum untuk menghasilkan skor kemiripan yang akurat
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}