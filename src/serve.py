"""Local preview: re-renders the pages on every request, then serves the repository root."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from render import render, SITE

class PreviewHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        render()
        super().do_GET()

handler = partial(PreviewHandler, directory=str(SITE))
server = ThreadingHTTPServer(('127.0.0.1', 4173), handler)
print('Local: http://127.0.0.1:4173', flush=True)
server.serve_forever()
