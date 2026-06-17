import { ArrowLeft, ChevronRight, Utensils } from 'lucide-react';
import type { Ingredient } from '../App';

interface StepInfo {
  num: number;
  label: string;
}

interface DemoStepNavigatorProps {
  dishInput: string;
  detectedIngredient: Ingredient | null;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onReset: () => void;
  steps: StepInfo[];
}

export function DemoStepNavigator({ dishInput, detectedIngredient, currentStep, setCurrentStep, onReset, steps }: DemoStepNavigatorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
            <Utensils className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Masakan: {dishInput}</p>
            <p className="text-gray-900" style={{ fontSize: '15px', fontWeight: 600 }}>
              Bahan pengganti dari: {detectedIngredient?.name}
              <span className="text-gray-400 ml-1" style={{ fontWeight: 400, fontSize: '13px' }}>
                ({detectedIngredient?.category})
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Cari lagi
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {steps.map((step, i) => (
          <div key={step.num} className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep(step.num)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                currentStep === step.num
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
              style={{ fontWeight: currentStep === step.num ? 600 : 400 }}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{
                background: currentStep === step.num ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
                fontWeight: 600,
              }}>
                {step.num}
              </span>
              {step.label}
            </button>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300" />}
          </div>
        ))}
      </div>
    </div>
  );
}
