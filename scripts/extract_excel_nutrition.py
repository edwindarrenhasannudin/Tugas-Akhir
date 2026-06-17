"""
Extract nutrition_pipeline.xlsx sheets ke JSON files
Kombinasi dengan kategori/texture dari existing data
"""
import pandas as pd
import json
from pathlib import Path
import sys
import os

# Pindah ke root directory terlebih dahulu
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

excel_file = Path('nutrition/dataset/nutrition_pipeline.xlsx')

print(f"DEBUG: Excel file path: {excel_file}")
print(f"DEBUG: Excel file exists: {excel_file.exists()}")
sys.stdout.flush()

# Read both sheets dengan engine explicit dan verbose
try:
    print(f"DEBUG: Reading 'Dataset Asli' sheet...")
    sys.stdout.flush()
    df_raw = pd.read_excel(excel_file, sheet_name='Dataset Asli', engine='openpyxl')
    print(f"✓ Loaded 'Dataset Asli': {len(df_raw)} rows, columns: {list(df_raw.columns)}")
    
    print(f"DEBUG: Reading 'Nutrition Scaled' sheet...")
    sys.stdout.flush()
    df_scaled = pd.read_excel(excel_file, sheet_name='Nutrition Scaled', engine='openpyxl')
    print(f"✓ Loaded 'Nutrition Scaled': {len(df_scaled)} rows, columns: {list(df_scaled.columns)}")
    
except Exception as e:
    print(f"ERROR: Failed to read Excel sheets: {e}")
    print(f"ERROR Type: {type(e).__name__}")
    sys.exit(1)

# Read kategori dari sheet lauk dan sayuran untuk mapping nama -> kategori
try:
    print(f"DEBUG: Reading category sheets...")
    sys.stdout.flush()
    df_lauk = pd.read_excel(excel_file, sheet_name='lauk', usecols=['name'], engine='openpyxl')
    df_sayuran = pd.read_excel(excel_file, sheet_name='sayuran', usecols=['name'], engine='openpyxl')
    
    lauk_names = set(df_lauk['name'].str.lower().tolist())
    sayuran_names = set(df_sayuran['name'].str.lower().tolist())
    print(f"✓ Loaded categories: {len(lauk_names)} lauk, {len(sayuran_names)} sayuran")
    
    def get_category(name):
        name_lower = str(name).lower()
        if name_lower in lauk_names:
            return 'lauk'
        elif name_lower in sayuran_names:
            return 'sayuran'
        return 'other'
    
    df_raw['category'] = df_raw['name'].apply(get_category)
    df_scaled['category'] = df_scaled['name'].apply(get_category)
    
except Exception as e:
    print(f"WARNING: Could not read category sheets: {e}")
    df_raw['category'] = 'other'
    df_scaled['category'] = 'other'

# Rename columns untuk sesuai dengan app standard
print(f"DEBUG: Renaming columns...")
sys.stdout.flush()
df_raw = df_raw.rename(columns={
    'calories': 'energy',
    'proteins': 'protein',
    'carbohydrate': 'carbs'
}, errors='ignore')

df_scaled = df_scaled.rename(columns={
    'calories': 'energy',
    'proteins': 'protein',
    'carbohydrate': 'carbs'
}, errors='ignore')

print(f"DEBUG: Final raw columns: {list(df_raw.columns)}")
print(f"DEBUG: Final scaled columns: {list(df_scaled.columns)}")

# Convert to dict
print(f"DEBUG: Converting to dict...")
sys.stdout.flush()
raw_data = df_raw.to_dict('records')
scaled_data = df_scaled.to_dict('records')

# Save to src/data/
print(f"DEBUG: Saving JSON files...")
sys.stdout.flush()
output_dir = Path('src/data')
output_dir.mkdir(exist_ok=True)

with open(output_dir / 'nutrition_raw_dataset.json', 'w', encoding='utf-8') as f:
    json.dump(raw_data, f, indent=2, ensure_ascii=False)
print(f"✓ Saved nutrition_raw_dataset.json ({len(raw_data)} records)")

with open(output_dir / 'nutrition_scaled_dataset.json', 'w', encoding='utf-8') as f:
    json.dump(scaled_data, f, indent=2, ensure_ascii=False)
print(f"✓ Saved nutrition_scaled_dataset.json ({len(scaled_data)} records)")

print("\n✓ SUCCESS: All files extracted successfully!")
if len(raw_data) > 0:
    print("\nSample record (raw):")
    print(json.dumps(raw_data[0], indent=2, ensure_ascii=False))
    print("\nSample record (scaled):")
    print(json.dumps(scaled_data[0], indent=2, ensure_ascii=False))
