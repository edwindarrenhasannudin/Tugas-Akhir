import os
import re
import math
import matplotlib.pyplot as plt
import numpy as np

def load_ingredients_from_ts(filepath):
    """
    Extrak data dari ingredientsData.ts tanpa memerlukan Node.js.
    Memanfaatkan Regex dan simple parsing agar sesuai dengan objek TS.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find array of objects
    start_idx = content.find('[')
    end_idx = content.rfind(']')
    if start_idx == -1 or end_idx == -1:
        return []
        
    array_content = content[start_idx+1:end_idx]
    ingredients = []
    
    # regex untuk menangkap semua string yang dikurung kurawal
    obj_pattern = re.compile(r'\{\s*(.*?)\s*\}', re.DOTALL)
    for match in obj_pattern.finditer(array_content):
        obj_str = match.group(1)
        
        ingredient = {}
        # Parse baris per baris ("id: 'ayam',", "energy: 0.32,")
        lines = obj_str.split('\n')
        for line in lines:
            line = line.strip()
            if not line: continue
            if line.endswith(','): line = line[:-1]
            if ':' not in line: continue
            
            key, val = line.split(':', 1)
            key = key.strip()
            val = val.strip().strip("'\"")
            
            # Ubah jadi number/float jika mampu
            try:
                if '.' in val or val.isdigit() or val == '0':
                    val = float(val)
            except ValueError:
                pass
                
            ingredient[key] = val
            
        if 'id' in ingredient:
            ingredients.append(ingredient)
            
    return ingredients

def to_vector(ingredient):
    """
    Mengubah dictionary bahan menjadi Feature Vector dengan struktur yang sama persis
    seperti di `contentBasedFiltering.ts` (Nutrition Only: 4 dimensi murni).
    """
    features = [
        float(ingredient.get('energy', 0)),
        float(ingredient.get('protein', 0)),
        float(ingredient.get('fat', 0)),
        float(ingredient.get('carbs', 0))
    ]
    return features


def cosine_sim(v1, v2):
    dot = sum(a*b for a,b in zip(v1, v2))
    mag1 = math.sqrt(sum(a*a for a in v1))
    mag2 = math.sqrt(sum(b*b for b in v2))
    if mag1 == 0 or mag2 == 0: return 0
    return dot / (mag1 * mag2)

def euclidean_similarity(v1, v2):
    """
    Euclidean distance: d(x, y) = √(Σ(xi - yi)²)
    """
    dist = math.sqrt(sum((a-b)**2 for a,b in zip(v1, v2)))
    return dist
    
def manhattan_similarity(v1, v2):
    """
    Manhattan distance: d(x, y) = Σ|xi - yi|
    """
    dist = sum(abs(a-b) for a,b in zip(v1, v2))
    return dist


def main():
    print("=" * 60)
    print("ANALISIS SIMILARITAS BAHAN PENGGANTI")
    print("=" * 60)

    # Resolve path ke letak ingredientsData.ts (antisipasi di-run dari root atau folder analysis)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    filepath = os.path.join(project_root, 'src', 'data', 'ingredientsData.ts')
    
    if not os.path.exists(filepath):
        print(f"[ERROR] File database tidak ditemukan di:\n{filepath}")
        return
        
    print("[1] Membaca database bahan dari ingredientsData.ts...")
    db = load_ingredients_from_ts(filepath)
    if not db:
        print("[ERROR] Gagal memuat database bahan!")
        return
    print(f"    [OK] Total bahan berhasil dimuat: {len(db)}")
        
    query = input("\n[2] Masukkan nama bahan pengganti yang ingin dianalisis (contoh: 'ayam'): ").strip()
    if not query:
        print("Input kosong. Program dihentikan.")
        return
        
    # Cari ingredient berdasarkan nama (case-insensitive)
    query_lower = query.lower()
    query_ing = None
    for item in db:
        if str(item.get('name', '')).lower() == query_lower or str(item.get('id', '')).lower() == query_lower:
            query_ing = item
            break
            
    if not query_ing:
        print(f"\n[ERROR] Bahan '{query}' tidak ditemukan di database.")
        contoh_bahan = [i.get('name', '') for i in db[:10] if i.get('name')]
        print("Contoh bahan yang tersedia: " + ", ".join(contoh_bahan) + " ...")
        return
        
    print(f"\n[3] Menganalisis similaritas '{query_ing['name']}' dengan bahan lainnya...")
    
    qv = to_vector(query_ing)
    
    # Hitung nilai similarity untuk tiap bahan lain
    results = []
    for ing in db:
        if ing.get('id') == query_ing.get('id'): 
            continue
            
        tv = to_vector(ing)
        c = cosine_sim(qv, tv)
        e = euclidean_similarity(qv, tv)
        m = manhattan_similarity(qv, tv)
        
        category_match = 0 if ing.get('category') == query_ing.get('category') else 1
        texture_match = 0 if ing.get('texture') == query_ing.get('texture') else 1
        
        cos_distance = 1 - c
        avg = (e + m + cos_distance) / 3

        results.append({
            'name': ing.get('name', 'Unknown'),
            'cosine': c,
            'euclidean': e,
            'manhattan': m,
            'avg': avg,
            'category_match': category_match,
            'texture_match': texture_match
        })
        
    # Urutkan dan ambil Top 5 berdasarkan perhitungan Average (Sama seperti Demo System)
    # PRIORITAS: category_match -> texture_match -> avg
    top_5_overall = sorted(results, key=lambda x: (x['category_match'], x['texture_match'], x['avg']))[:5]
    
    print("\n[4] Mempersiapkan visualisasi grafik (Matplotlib)...")
    
    # ---- 1. Cosine Plot ----
    fig1, ax1 = plt.subplots(figsize=(8, 5))
    fig1.canvas.manager.set_window_title('Cosine Similarity Analysis')
    fig1.suptitle(f"Analisis Similaritas Bahan: {query_ing['name']} (Top 5 Rekomendasi Teratas)", fontsize=13, fontweight='bold')
    
    cosine_sorted = sorted(top_5_overall, key=lambda r: r['cosine'], reverse=True)
    names_c = [r['name'] for r in cosine_sorted]
    vals_c = [r['cosine'] for r in cosine_sorted]
    y_pos1 = np.arange(len(names_c))
    
    ax1.barh(y_pos1, vals_c, color='skyblue', edgecolor='black', height=0.6)
    ax1.set_yticks(y_pos1)
    ax1.set_yticklabels(names_c, fontsize=10)
    ax1.invert_yaxis()  
    ax1.set_xlabel('Nilai Similarity (Semakin Besar Semakin Baik)')
    ax1.set_title('Cosine Similarity', pad=10)
    for i, v in enumerate(vals_c):
        # Angka di sebelah kanan kotak, jaraknya dirapatkan (1.015)
        ax1.text(1.015, i, f"{v:.4f}", va='center', transform=ax1.get_yaxis_transform(), fontsize=10, fontweight='bold')    
    ax1.grid(axis='x', linestyle='--', alpha=0.7)
    ax1.set_axisbelow(True)
    fig1.tight_layout(rect=[0, 0, 0.95, 1]) # Margin kanan untuk text

    # ---- 2. Euclidean Plot ----
    fig2, ax2 = plt.subplots(figsize=(8, 5))
    fig2.canvas.manager.set_window_title('Euclidean Distance Analysis')
    fig2.suptitle(f"Analisis Similaritas Bahan: {query_ing['name']} (Top 5 Rekomendasi Teratas)", fontsize=13, fontweight='bold')
    
    euclidean_sorted = sorted(top_5_overall, key=lambda r: r['euclidean'])
    names_e = [r['name'] for r in euclidean_sorted]
    raw_vals_e = [r['euclidean'] for r in euclidean_sorted]
    y_pos2 = np.arange(len(names_e))
    
    ax2.barh(y_pos2, raw_vals_e, color='salmon', edgecolor='black', height=0.6)
    ax2.set_yticks(y_pos2)
    ax2.set_yticklabels(names_e, fontsize=10)
    ax2.invert_yaxis()
    ax2.set_xlabel('Nilai Jarak (Semakin Kecil Semakin Baik)')
    ax2.set_title('Euclidean Distance', pad=10)
    for i, raw in enumerate(raw_vals_e):
        # Tampilkan Raw Distance sebagai text di sebelah bar
        ax2.text(1.015, i, f"{raw:.4f}", va='center', transform=ax2.get_yaxis_transform(), fontsize=10, fontweight='bold')
    ax2.grid(axis='x', linestyle='--', alpha=0.7)
    ax2.set_axisbelow(True)
    fig2.tight_layout(rect=[0, 0, 0.95, 1]) # Margin kanan untuk text

    # ---- 3. Manhattan Plot ----
    fig3, ax3 = plt.subplots(figsize=(8, 5))
    fig3.canvas.manager.set_window_title('Manhattan Distance Analysis')
    fig3.suptitle(f"Analisis Similaritas Bahan: {query_ing['name']} (Top 5 Rekomendasi Teratas)", fontsize=13, fontweight='bold')
    
    manhattan_sorted = sorted(top_5_overall, key=lambda r: r['manhattan'])
    names_m = [r['name'] for r in manhattan_sorted]
    raw_vals_m = [r['manhattan'] for r in manhattan_sorted]
    y_pos3 = np.arange(len(names_m))
    
    ax3.barh(y_pos3, raw_vals_m, color='lightgreen', edgecolor='black', height=0.6)
    ax3.set_yticks(y_pos3)
    ax3.set_yticklabels(names_m, fontsize=10)
    ax3.invert_yaxis()
    ax3.set_xlabel('Nilai Jarak (Semakin Kecil Semakin Baik)')
    ax3.set_title('Manhattan Distance', pad=10)
    for i, raw in enumerate(raw_vals_m):
        # Tampilkan Raw Distance sebagai text di sebelah bar
        ax3.text(1.015, i, f"{raw:.4f}", va='center', transform=ax3.get_yaxis_transform(), fontsize=10, fontweight='bold')
    ax3.grid(axis='x', linestyle='--', alpha=0.7)
    ax3.set_axisbelow(True)
    fig3.tight_layout(rect=[0, 0, 0.95, 1]) # Margin kanan untuk text
    
    print("\n[INFO] Menampilkan grafik visualisasi...")
    print("       (3 jendela halaman grafik telah terbuka. Silahkan cek tiap jedela Window tersebut.)")
    print("       (Tutup SEMUA jendela grafik/plot untuk mengakhiri program)")
    plt.show()

if __name__ == "__main__":
    import sys
    try:
        main()
    except KeyboardInterrupt:
        print("\nProgram dihentikan oleh user.")
        sys.exit(0)
