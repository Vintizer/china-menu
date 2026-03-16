"""
Обновляет поле image в menu.json на реальные имена файлов из папки images/
Маппинг выведен путём анализа порядка изображений из PDF-меню.

Структура: изображения в папке отсортированы числово и соответствуют 
порядку блюд в PDF (по разделам). Заголовки разделов — .png файлы без блюд.
"""

import json

# Полный маппинг: code → filename
IMAGE_MAP = {
    # G — Блюда с гарниром (33 блюда)
    "G1":  "22.jpg",  "G2":  "23.jpg",  "G3":  "24.jpg",
    "G4":  "25.jpg",  "G5":  "26.jpg",  "G6":  "27.jpg",
    "G7":  "28.jpg",  "G8":  "29.jpg",  "G9":  "30.jpg",
    "G10": "41.jpg",  "G11": "42.jpg",  "G12": "43.jpg",
    "G13": "44.jpg",  "G14": "45.jpg",  "G15": "46.jpg",
    "G16": "47.jpg",  "G17": "48.jpg",  "G18": "49.jpg",
    "G19": "51.jpg",  "G20": "53.jpg",  "G21": "55.jpg",
    "G22": "57.jpg",  "G23": "59.jpg",  "G24": "61.jpg",
    "G25": "63.jpg",  "G26": "65.jpg",  "G27": "67.jpg",
    "G28": "74.jpg",  "G29": "75.jpg",  "G30": "76.jpg",
    "G31": "77.jpg",  "G32": "78.jpg",  "G33": "79.jpg",

    # O — Фирменные блюда (14 блюд)  [header: 80.png]
    "O1":  "84.jpg",  "O2":  "86.jpg",  "O3":  "88.jpg",
    "O4":  "90.jpg",  "O5":  "93.jpg",  "O6":  "94.jpg",
    "O7":  "95.jpg",  "O8":  "96.jpg",  "O9":  "99.jpg",
    "O10": "104.jpg", "O11": "105.jpg", "O12": "106.jpg",
    "O13": "107.jpg", "O14": "108.jpg",

    # L — Холодные блюда (8 блюд)  [header: 109.png]
    "L1":  "116.jpg", "L2":  "117.jpg", "L3":  "118.jpg",
    "L4":  "119.jpg", "L5":  "120.jpg", "L6":  "121.jpg",
    "L7":  "122.jpg", "L8":  "123.jpg",

    # J — Блюда из курицы (7 блюд)  [header: 124.png]
    "J1":  "126.jpg", "J2":  "128.jpg", "J3":  "129.jpg",
    "J4":  "130.jpg", "J5":  "131.jpg", "J6":  "132.jpg",
    "J7":  "133.jpg",

    # Z — Блюда из свинины (15 блюд)  [header: 134.png]
    "Z1":  "138.jpg",
    "Z2":  "144.jpg", "Z3":  "145.jpg", "Z4":  "146.jpg",
    "Z5":  "147.jpg", "Z6":  "148.jpg", "Z7":  "149.jpg",
    "Z8":  "150.jpg",
    "Z9":  "155.jpg",
    "Z10": "159.jpg", "Z11": "160.jpg", "Z12": "161.jpg",
    "Z13": "162.jpg", "Z14": "163.jpg", "Z15": "164.jpg",

    # S — Вегетарианские блюда (16 блюд)  [header: 165.png]
    "S1":  "166.jpg", "S2":  "167.jpg", "S3":  "168.jpg",
    "S4":  "169.jpg", "S5":  "170.jpg", "S6":  "171.jpg",
    "S7":  "172.jpg", "S8":  "173.jpg",
    "S9":  "174.jpg", "S10": "175.jpg", "S11": "176.jpg",
    "S12": "177.jpg", "S13": "178.jpg", "S14": "179.jpg",
    "S15": "180.jpg", "S16": "181.jpg",

    # N — Блюда из говядины (8 блюд)  [header: 182.png]
    "N1":  "184.jpg", "N2":  "185.jpg", "N3":  "186.jpg",
    "N4":  "187.jpg", "N5":  "188.jpg", "N6":  "189.jpg",
    "N7":  "190.jpg", "N8":  "191.jpg",

    # T — Суп (4 блюда)  [header: 192.png]
    "T1":  "196.jpg", "T2":  "197.jpg",
    "T3":  "198.jpg", "T4":  "199.jpg",

    # F — Блюда из риса и муки (10 блюд)  [header: 200.png]
    "F1":  "204.jpg", "F2":  "205.jpg", "F3":  "206.jpg",
    "F14": "214.jpg", "F15": "215.jpg", "F16": "216.jpg",
    "F17": "217.jpg", "F18": "218.jpg", "F19": "219.jpg",
    "F20": "220.jpg",
}

with open(r"E:\projects\china-menu\menu.json", encoding="utf-8") as f:
    data = json.load(f)

updated = 0
not_found = []

for cat in data["categories"]:
    for item in cat["items"]:
        code = item["code"]
        if code in IMAGE_MAP:
            old = item.get("image")
            item["image"] = IMAGE_MAP[code]
            updated += 1
            if old != IMAGE_MAP[code]:
                print(f"  {code}: {old} -> {IMAGE_MAP[code]}")
        else:
            not_found.append(code)

# Сохраняем обновлённый JSON
with open(r"E:\projects\china-menu\menu.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Обновляем также копию в public/
with open(r"E:\projects\china-menu\public\menu.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"\nОбновлено: {updated} блюд")
if not_found:
    print(f"Не найдено в маппинге: {not_found}")
print("Готово!")
