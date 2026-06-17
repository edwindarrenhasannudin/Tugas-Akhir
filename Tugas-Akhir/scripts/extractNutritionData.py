"""
Script untuk Extract Nutrition Data dari nutrition_pipeline.xlsx
Ekstrak PURE data dari sheet 'lauk' dan 'sayuran' dengan filtering
Output langsung ke: ingredientsData.ts

Cara pakai:
  python scripts/extractNutritionData.py
"""

import pandas as pd
import os
from pathlib import Path


# ============================================================================
# KONFIGURASI FILTER
# ============================================================================
# Tambahkan/hapus kata kunci di sini untuk mengatur bahan mana yang diambil.


# 1. BLACKLIST: Kata kunci yang SELALU dibuang (substring match, case-insensitive)
#    Jika nama bahan mengandung kata ini, bahan TIDAK akan dimasukkan.
BLACKLIST_KEYWORDS = [
    # Olahan / cara masak (bukan bahan mentah)
    'goreng', 'bakar', 'rebus', 'kukus', 'tumis', 'asap', 'kering',
    'abon', 'dendeng', 'kornet', 'sosis', 'pindang', 'pepes', 
    # Makanan jadi
    'sop', 'soto', 'sate', 'lodeh', 'sayur', 'asinan', 'rujak',
    'kue', 'martabak', 'dodol', 'keripik', 'kerupuk', 'gulai', 'semur',
    # Hewan tidak umum
    'babi', 'anjing', 'kuda', 'ular', 'buaya', 'penyu', 'katak',
    'keong', 'kodok', 'kura-kura', 'ulat', 'belut', 'hiu', 'rebon',
    # Bagian tubuh hewan
    'jantung', 'ginjal', 'otak', 'lidah', 'perut', 'dideh', 'lemak',
    # Lainnya
    'masakan', 'mentah', 'bubuk', 'tepung', 'bagian putih', 'kedelai',
    'prey', 'pelecing', 'mostarda', 'lokio', 'besar', 'galah', 'karet', 
    'ambon', 'ampenan', 'kopang', 'pecai', 'taiwan', 'tanah', 'bagian kuning',
    'pipil', 'muda', 'giling',  
]

# 2. CONDITIONAL_RULES: Kata kunci yang HANYA boleh masuk jika diikuti kata tertentu.
#    Format: { 'keyword': ['kata_pendamping_1', 'kata_pendamping_2', ...] }
#    Contoh: 'daun' hanya boleh jika ada 'bawang', 'singkong', 'katuk', atau 'bayam'
CONDITIONAL_RULES = {  
    'jagung': ['kuning'], 
    'tomat': ['merah'], 
}

# 3. WHITELIST_OVERRIDE: Nama PERSIS yang SELALU dimasukkan meskipun terkena blacklist.
#    Gunakan nama lowercase (SEBELUM strip_words diterapkan).
#    Kalau nama bahan cocok persis, dia pasti masuk.
WHITELIST_OVERRIDE = [
    'kool kembang', 
    # Contoh: 'telur ayam rebus' -> meskipun ada 'rebus' di blacklist, tetap masuk
    # 'telur ayam rebus',
]


def should_include(name):
    """
    Cek apakah bahan makanan harus dimasukkan ke output.
    
    Urutan pengecekan:
      1. Whitelist override -> SELALU masuk
      2. Blacklist keywords -> SELALU dibuang
      3. Conditional rules  -> Masuk HANYA jika ada kata pendamping yang valid
      4. Default            -> Masuk
    
    Returns: (bool, str) -> (masuk/tidak, alasan)
    """
    name_lower = name.lower().strip()
    
    # Layer 1: Whitelist override
    if name_lower in WHITELIST_OVERRIDE:
        return True, "whitelist override"
    
    # Layer 2: Blacklist
    for keyword in BLACKLIST_KEYWORDS:
        if keyword.lower() in name_lower:
            return False, f"blacklist: '{keyword}'"
    
    # Layer 3: Conditional rules
    for keyword, allowed_companions in CONDITIONAL_RULES.items():
        if keyword.lower() in name_lower:
            # Cek apakah ada kata pendamping yang valid
            has_companion = any(comp.lower() in name_lower for comp in allowed_companions)
            if not has_companion:
                return False, f"conditional: '{keyword}' tanpa pendamping valid"
    
    # Layer 4: Default -> masuk
    return True, "passed"




# ============================================================================
# FUNGSI UTILITAS
# ============================================================================

def detect_column_names(df):
    """
    Deteksi nama kolom yang ada di Excel
    Karena Excel bisa punya nama kolom berbeda
    """
    columns_map = {}
    
    # Kolom yang dicari
    search_columns = {
        'name': ['nama_bahan', 'ingredient', 'name', 'bahan'],
        'category': ['kategori', 'category', 'tipe', 'type'],
        'energy': ['calories', 'energy', 'kalori', 'kcal'],
        'protein': ['proteins'],
        'carbs': ['karbohidrat', 'carbs', 'karbo', 'carbohydrate'],
        'fat': ['lemak', 'fat'],
        'texture': ['tekstur', 'texture'],
    }
    
    for required_col, alternatives in search_columns.items():
        for col in df.columns:
            if col.lower().strip() in alternatives:
                columns_map[required_col] = col
                break
        
        if required_col not in columns_map:
            print(f"[WARNING] Kolom '{required_col}' tidak ditemukan")
            columns_map[required_col] = None
    
    return columns_map

def generate_typescript_file(ingredients):
    """
    Generate TypeScript file dengan ingredients database
    Format sudah TypeScript dan siap diimport langsung
    """
    ts_lines = [
        "import { Ingredient } from '../App';",
        "",
        "export const ingredientsDatabase: Ingredient[] = [",
    ]
    
    for idx, ingredient in enumerate(ingredients):
        ts_lines.append("  {")
        ts_lines.append(f"    id: '{ingredient['id']}',")
        ts_lines.append(f"    name: '{ingredient['name']}',")
        ts_lines.append(f"    category: '{ingredient['category']}',")
        ts_lines.append(f"    energy: {ingredient['energy']},")
        ts_lines.append(f"    protein: {ingredient['protein']},")
        ts_lines.append(f"    carbs: {ingredient['carbs']},")
        ts_lines.append(f"    fat: {ingredient['fat']},")
        ts_lines.append(f"    texture: '{ingredient['texture']}',")
        
        # Add comma if not last element
        if idx < len(ingredients) - 1:
            ts_lines.append("  },")
        else:
            ts_lines.append("  }")
    
    ts_lines.append("];")
    ts_lines.append("")
    
    return "\n".join(ts_lines)


def extract_nutrition_data(excel_path='nutrition/dataset/nutrition_pipeline.xlsx'):
    """
    Extract nutrition data dari Excel file
    Hanya ambil dari sheet "Lauk" dan "Sayuran"
    """
    print("=" * 80)
    print("EXTRACT NUTRITION DATA FROM EXCEL")
    print("(Sheet: Lauk & Sayuran)")
    print("=" * 80)
    
    # Check file exists
    if not os.path.exists(excel_path):
        print(f"[ERROR] File '{excel_path}' tidak ditemukan!")
        return False
    
    print(f"\n[1] Membaca file: {excel_path}")
    
    # Try to read Excel dengan engine openpyxl
    try:
        xls = pd.ExcelFile(excel_path, engine='openpyxl')
        print(f"    Available sheets: {xls.sheet_names}")
    except Exception as e:
        print(f"[ERROR] Error membaca Excel: {e}")
        return False
    
    # Combine data dari sheet Lauk dan Sayuran
    df_list = []
    target_sheets = ['lauk', 'sayuran']
    
    for target_sheet in target_sheets:
        # Case-insensitive search for sheet names
        matching_sheet = None
        for sheet in xls.sheet_names:
            if sheet.lower() == target_sheet.lower():
                matching_sheet = sheet
                break
        
        if matching_sheet:
            try:
                df_temp = pd.read_excel(excel_path, sheet_name=matching_sheet, engine='openpyxl')
                print(f"    [OK] Sheet '{matching_sheet}' loaded ({len(df_temp)} rows)")
                df_list.append(df_temp)
            except Exception as e:
                print(f"    [WARNING] Error reading sheet '{matching_sheet}': {str(e)}")
        else:
            print(f"    [WARNING] Sheet '{target_sheet}' tidak ditemukan")
    
    if not df_list:
        print("[ERROR] Tidak ada sheet 'Lauk' atau 'Sayuran' yang ditemukan!")
        print(f"   Available sheets: {xls.sheet_names}")
        return False
    
    # Combine all sheets
    df = pd.concat(df_list, ignore_index=True)
    print(f"    [OK] Total data: {len(df)} bahan")
    
    print(f"    Total baris: {len(df)}")
    print(f"    Total kolom: {len(df.columns)}")
    
    # Detect column names
    print("\n[2] Mendeteksi kolom Excel...")
    columns_map = detect_column_names(df)
    print(f"    Mapping kolom:")
    for key, val in columns_map.items():
        print(f"      {key:12} -> {val}")
    
    # Extract dan normalize data DENGAN FILTERING
    print("\n[3] Extract data (dengan filtering)...")
    ingredients = []
    filtered_out = []  # Track bahan yang dibuang beserta alasannya
    errors = []
    
    for idx, row in df.iterrows():
        try:
            # Get name
            name = str(row[columns_map['name']]).strip() if columns_map['name'] else f"Ingredient_{idx}"
            
            # Cek filter
            include, reason = should_include(name)
            if not include:
                filtered_out.append((name, reason))
                continue
            
            category = str(row[columns_map['category']]).strip() if columns_map['category'] else "Umum"
            
            # Parse numeric values
            energy = parse_float(row, columns_map['energy'], 0)
            protein = parse_float(row, columns_map['protein'], 0)
            carbs = parse_float(row, columns_map['carbs'], 0)
            fat = parse_float(row, columns_map['fat'], 0)
            
            texture = str(row[columns_map['texture']]).strip() if columns_map['texture'] else "Umum"
            
            # Create unique ID
            ingredient_id = name.lower().replace(' ', '-').replace('_', '-').replace('(', '').replace(')', '').replace('/', '-')
            
            ingredient = {
                'id': ingredient_id,
                'name': name,
                'category': category,
                'energy': energy,
                'protein': protein,
                'carbs': carbs,
                'fat': fat,
                'texture': texture,
            }
            
            ingredients.append(ingredient)
            
        except Exception as e:
            errors.append(f"Row {idx}: {str(e)}")
    
    print(f"    [OK] {len(ingredients)} bahan lolos filter")
    print(f"    [FILTERED] {len(filtered_out)} bahan dibuang")
    if errors:
        print(f"    [ERROR] {len(errors)} error ditemukan:")
        for err in errors[:5]:
            print(f"       - {err}")
    
    # Filter report
    if filtered_out:
        print(f"\n[3b] Filter Report:")
        
        # Hitung per alasan
        reason_counts = {}
        for name, reason in filtered_out:
            key = reason.split(":")[0].strip()  # Group by type (blacklist/conditional)
            reason_counts[key] = reason_counts.get(key, 0) + 1
        
        for reason_type, count in sorted(reason_counts.items(), key=lambda x: -x[1]):
            print(f"     - {reason_type}: {count} item dibuang")
        
        # Tampilkan 10 sampel yang dibuang
        print(f"\n     Sampel bahan yang dibuang (max 10):")
        for name, reason in filtered_out[:10]:
            print(f"       x {name:<35} -> {reason}")
        if len(filtered_out) > 10:
            print(f"       ... dan {len(filtered_out) - 10} lainnya")
    
    # Statistics
    print(f"\n[4] Data Statistics (setelah filter):")
    if ingredients:
        energies = [i['energy'] for i in ingredients]
        proteins = [i['protein'] for i in ingredients]
        
        print(f"    Energy range: {min(energies):.2f} - {max(energies):.2f} KKal")
        print(f"    Protein range: {min(proteins):.2f} - {max(proteins):.2f} g")
        
        categories = set(i['category'] for i in ingredients)
        print(f"    Total categories: {len(categories)}")
        print(f"    Categories: {', '.join(sorted(categories))}")
    
    # Save to TypeScript
    print("\n[5] Menyimpan ke ingredientsData.ts...")
    output_dir = Path('src/data')
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / 'ingredientsData.ts'
    
    # Generate TypeScript code
    ts_code = generate_typescript_file(ingredients)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(ts_code)
    
    print(f"    [OK] Data disimpan ke: {output_file}")
    
    print("\n" + "=" * 80)
    print("[DONE] EXTRACTION SELESAI!")
    print("=" * 80)
    print(f"\nData siap digunakan di React:")
    print(f"  Import dari: src/data/ingredientsData.ts")
    print(f"  Jumlah bahan: {len(ingredients)}")
    
    return True

def parse_float(row, column, default=0):
    """Parse float value from row, with fallback value"""
    if column is None:
        return default
    
    try:
        val = row[column]
        if pd.isna(val):
            return default
        return float(val)
    except:
        return default

if __name__ == '__main__':
    # Change to script directory
    script_dir = Path(__file__).parent.parent
    os.chdir(script_dir)
    
    success = extract_nutrition_data()
    exit(0 if success else 1)