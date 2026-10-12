import http.server
import socketserver
import os

PORT = 3000

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Disable ALL browser caching so JS/HTML changes are always reflected immediately
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        # If the requested file doesn't exist, rewrite to index.html (SPA routing)
        file_path = self.translate_path(self.path)
        if not os.path.exists(file_path) or os.path.isdir(file_path):
            self.path = '/index.html'
        return super().do_GET()

    def log_message(self, format, *args):
        pass  # Silence per-request logs to keep terminal clean

# Ensure we serve from the correct directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
    httpd.allow_reuse_address = True
    print(f"SPA Server running -> http://localhost:{PORT}")
    print("No-cache headers enabled. All changes load instantly.")
    httpd.serve_forever()
