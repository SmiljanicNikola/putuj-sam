"""Download accurately captioned Serbia photography and record its attribution.

Run once with Python 3. Network access is needed. The checked-in images allow
the production site to serve all photography from its own domain.
"""
import json
import re
import time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
API = 'https://en.wikipedia.org/w/api.php?'
HEADERS = {'User-Agent': 'PutujSamWebsite/1.0 (Serbia travel guide; asset attribution)'}
PAGES = {
    'tara': 'Tara (mountain)',
    'uvac': 'Uvac',
    'golubac': 'Golubac Fortress',
    'novi-sad': 'Novi Sad',
    'zlatibor': 'Zlatibor',
    'studenica': 'Studenica Monastery',
    'drina': 'Drina',
    'fruska-gora': 'Fruška Gora',
    'rtanj': 'Rtanj',
    'mokra-gora': 'Mokra Gora',
}

def fetch(url):
    with urlopen(Request(url, headers=HEADERS), timeout=40) as response:
        return response.read()

def query(params):
    return json.loads(fetch(API + urlencode({'action': 'query', 'format': 'json', **params})))

def plain(value):
    return re.sub('<[^>]+>', '', value)

credit_path = ROOT / 'public' / 'image-credits.json'
attributions = json.loads(credit_path.read_text()) if credit_path.exists() else []
pending = {slug: title for slug, title in PAGES.items() if not (ROOT / 'public' / 'images' / f'{slug}.jpg').exists()}
pages = query({'titles': '|'.join(pending.values()), 'prop': 'pageimages', 'pithumbsize': 1600})['query']['pages'].values() if pending else []
by_title = {page['title']: page for page in pages}
titles = '|'.join('File:' + page['pageimage'] for page in by_title.values() if 'pageimage' in page)
files = query({'titles': titles, 'prop': 'imageinfo', 'iiprop': 'url|extmetadata', 'iiurlwidth': 1600})['query']['pages'].values() if titles else []
by_file = {file['title'].replace('_', ' '): file for file in files}
for slug, title in pending.items():
    try:
        page = by_title.get(title, {})
        if 'pageimage' not in page:
            print(f'{slug}: no image')
            continue
        file_title = 'File:' + page['pageimage']
        info = by_file[file_title.replace('_', ' ')]['imageinfo'][0]
        url = info.get('thumburl', page['thumbnail']['source']).split('?')[0]
        content = fetch(url)
        (ROOT / 'public' / 'images' / f'{slug}.jpg').write_bytes(content)
        metadata = info.get('extmetadata', {})
        attributions.append({
            'image': f'/images/{slug}.jpg',
            'place': title,
            'author': plain(metadata.get('Artist', {}).get('value', 'See source')),
            'license': metadata.get('LicenseShortName', {}).get('value', 'See source'),
            'licenseUrl': metadata.get('LicenseUrl', {}).get('value', ''),
            'source': info.get('descriptionurl', ''),
        })
        print(f'{slug}: {len(content)} bytes')
        time.sleep(2)
    except Exception as error:
        print(f'{slug}: {error}')
(ROOT / 'public' / 'image-credits.json').write_text(json.dumps(attributions, ensure_ascii=False, indent=2))
