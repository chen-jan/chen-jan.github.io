"""Render the pages into the repository root and validate them for GitHub Pages."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit

from render import render, SITE
render()

class PageCheck(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.links = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids.append(a['id'])
        if tag == 'a' and a.get('href', '').startswith('#'):
            self.links.append(a['href'][1:])
        for key in ('src', 'href'):
            url = urlsplit(a.get(key, ''))
            if url.path and not url.scheme and not url.netloc:
                assert (SITE / url.path).is_file(), f'Missing local destination: {url.path}'
        if tag == 'img':
            assert 'alt' in a, 'Missing image alt'

for page in sorted(SITE.glob('*.html')):
    check = PageCheck()
    text = page.read_text()
    check.feed(text)
    assert '<!doctype html>' in text.lower(), page
    assert len(check.ids) == len(set(check.ids)), f'Duplicate IDs: {page}'
    assert set(check.links) <= set(check.ids), f'Broken anchor: {page}'
    print(f'ok  {page.name}')
print('Built and validated all pages.')
