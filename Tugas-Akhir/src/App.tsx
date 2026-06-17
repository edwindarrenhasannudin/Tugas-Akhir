import { useState } from "react";
import { SearchPage } from "./components/SearchPage";
import { DemoSystemPage } from "./components/DemoSystemPage";

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  energy: number; // KKal
  protein: number;
  carbs: number;
  fat: number;
  texture: string;
  isVegan?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  image: string;
  ingredients: {
    ingredient: Ingredient;
    amount: string;
  }[];
  category: string;
}

type ViewMode = "home" | "demo";

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("home");

  const handleBackToHome = () => {
    setViewMode("home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {viewMode === "home" && (
        <SearchPage
          onDemoSystem={() => setViewMode("demo")}
        />
      )}

      {viewMode === "demo" && (
        <DemoSystemPage onBack={handleBackToHome} />
      )}
    </div>
  );
}