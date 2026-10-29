"""Download the first-party CN product gallery assets for local review."""
import concurrent.futures
import hashlib
import io
import json
from pathlib import Path
import urllib.parse
import urllib.request

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "research/sources/zeeho"
OUT = ROOT / "public/images/catalog/zeeho"
OUT.mkdir(parents=True, exist_ok=True)
items = json.loads((SOURCE / "product-index.json").read_text())
assets = []
for item in items:
    if item['category'] == 'products-dz' or item['series'] == '概念车':
        continue
    slug = item['pageLink'].split('/')[-1].removesuffix('.html')
    group = item['category'] + '-' + slug
    components = json.loads((SOURCE / (group + '.components.json')).read_text())
    urls = [(item['image'], 'render')]
    for component in components:
        if component['tag'] == 'productgallerycomponent':
            for attr, kind in [('lpicturelist', 'gallery'), ('spicturelist', 'detail')]:
                urls += [(u, kind) for u in json.loads(component['attrs'].get(attr, '{}')).get('imageList', [])[:5 if kind == 'gallery' else 3]]
    for index, (url, kind) in enumerate(urls):
        original = 'https://www.zeehoev.com' + url
        original = urllib.parse.quote(original, safe=':/%?=&')
        digest = hashlib.sha256(original.encode()).hexdigest()[:14]
        assets.append({'group': group, 'name': item['title'], 'index': index, 'originalUrl': original,
                       'file': digest + '.webp', 'role': kind,
                       'sourcePage': 'https://www.zeehoev.com' + item['pageLink'].replace('/content/zeeho', '')})

def download(asset):
    target = OUT / asset['file']
    try:
        if not target.exists():
            req = urllib.request.Request(asset['originalUrl'], headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=45) as response:
                image = Image.open(io.BytesIO(response.read()))
                image.thumbnail((1600, 1600))
                if image.mode not in ('RGB', 'RGBA'): image = image.convert('RGB')
                image.save(target, 'WEBP', quality=84, method=4)
        with Image.open(target) as image: asset['dimensions'] = list(image.size)
        asset['src'] = '/images/catalog/zeeho/' + asset['file']
        return asset
    except Exception as e:
        asset['error'] = str(e)
        return asset

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    result = list(pool.map(download, assets))
(SOURCE / 'assets-manifest.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')

unique = list({x['file']:x for x in result if 'error' not in x}.values())
for batch in range(0, len(unique), 30):
    entries = unique[batch:batch+30]
    sheet = Image.new('RGB', (1400, 5 * 190), 'white')
    draw = ImageDraw.Draw(sheet)
    for i, asset in enumerate(entries):
        image = Image.open(OUT / asset['file']).convert('RGBA')
        image.thumbnail((224, 155))
        x, y = (i % 6) * 233, (i // 6) * 190
        sheet.paste(image, (x + (224-image.width)//2, y), image)
        draw.text((x+3, y+157), str(batch+i) + ' ' + asset['group'][9:] + '/' + str(asset['index']), fill='black')
    sheet.save(SOURCE / ('contact-sheet-' + str(batch//30+1) + '.jpg'), quality=90)
print(json.dumps({'references':len(result), 'uniqueFiles':len(unique), 'errors':[x for x in result if 'error' in x]}, ensure_ascii=False))
