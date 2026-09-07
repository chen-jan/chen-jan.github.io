"""Expand shared content into the static pages at the repository root."""
from pathlib import Path
import re

SRC = Path(__file__).resolve().parent
SITE = SRC.parent
PAGES = {'academic': 'index.html', 'minimal': 'minimal.html'}

def render():
    text = (SRC / 'content/shared.html').read_text()
    sections = dict(re.findall(r'<!-- BEGIN (\w+) -->\s*(.*?)\s*<!-- END \1 -->', text, re.S))
    for template in (SRC / 'templates').glob('*.html'):
        page = re.sub(r'{{\s*(\w+)\s*}}', lambda m: sections[m[1]], template.read_text())
        if template.stem == 'minimal':
            page = re.sub(r' <span class="link-arrow" aria-hidden="true">↗</span>', '', page)
        destination = SITE / PAGES[template.stem]
        if not destination.exists() or destination.read_text() != page:
            destination.write_text(page)

if __name__ == '__main__':
    render()
