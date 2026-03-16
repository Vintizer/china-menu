import os

imgs = sorted(os.listdir(r'E:\projects\china-menu\images'), key=lambda x: int(x.split('.')[0]))

html_parts = [
    '<html><head><meta charset="utf-8">',
    '<style>body{font-family:sans-serif;background:#111;color:white;}',
    '.g{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;padding:8px;}',
    '.item{text-align:center;}',
    'img{width:100%;height:120px;object-fit:cover;border:2px solid #333;}',
    'p{margin:2px;font-size:11px;color:#aaa;}</style></head>',
    '<body><div class="g">'
]

for img in imgs:
    html_parts.append(f'<div class="item"><img src="/images/{img}"><p>{img}</p></div>')

html_parts.append('</div></body></html>')

with open(r'E:\projects\china-menu\public\gallery.html', 'w', encoding='utf-8') as f:
    f.write('\n'.join(html_parts))

print('Done,', len(imgs), 'images')
