
import logoImage from '../assets/Logo.png';

interface HeaderLogoProps {
  onClick?: () => void;
}

export function HeaderLogo({ onClick }: HeaderLogoProps) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
    >
      <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
        <img src={logoImage} alt="Recipe Logo" className="w-full h-full object-cover" />
      </div>
      <div className="text-left">
        <div className="font-bold text-gray-900 text-base">Recipe</div>
        <div className="text-xs text-gray-600">Sistem Rekomendasi</div>
      </div>
    </button>
  );
}