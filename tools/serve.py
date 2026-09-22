#!/usr/bin/env python3
"""Serveur local de NetPractice Academy.

- Cherche automatiquement un port libre à partir du port demandé.
- Désactive le cache HTTP pour éviter de conserver un ancien JavaScript pendant le développement.
- Écrit le port réellement utilisé dans .netpractice-port.
- Peut ouvrir le navigateur une seule fois quand le serveur est prêt.
"""

from __future__ import annotations

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
import shutil
import subprocess
import sys
import threading
import webbrowser

HOST = "127.0.0.1"
MAX_PORT_TRIES = 100
PORT_FILE = Path(".netpractice-port")


class NoCacheHandler(SimpleHTTPRequestHandler):
    """Serveur statique avec cache désactivé pour les fichiers du projet."""

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def create_server(start_port: int, directory: str) -> tuple[ThreadingHTTPServer, int]:
    handler = partial(NoCacheHandler, directory=directory)
    for port in range(start_port, min(start_port + MAX_PORT_TRIES, 65536)):
        try:
            return ThreadingHTTPServer((HOST, port), handler), port
        except OSError as exc:
            if exc.errno not in (48, 98):
                raise
    raise RuntimeError(
        f"Aucun port libre trouvé entre {start_port} et "
        f"{min(start_port + MAX_PORT_TRIES - 1, 65535)}."
    )


def open_browser(url: str) -> None:
    """Ouvre l'URL une seule fois, sans relancer ni rafraîchir le navigateur."""
    try:
        if sys.platform.startswith("linux") and shutil.which("xdg-open"):
            subprocess.Popen(
                ["xdg-open", url],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
            )
            return
        if sys.platform == "darwin" and shutil.which("open"):
            subprocess.Popen(
                ["open", url],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
            )
            return
        if os.name == "nt":
            os.startfile(url)  # type: ignore[attr-defined]
            return
        if not webbrowser.open(url, new=2, autoraise=True):
            print(f"Navigateur non détecté. Ouvre manuellement: {url}")
    except Exception as exc:
        print(f"Impossible d'ouvrir automatiquement le navigateur: {exc}")
        print(f"Ouvre manuellement: {url}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=49242)
    parser.add_argument("--directory", default=".")
    parser.add_argument("--open-browser", action="store_true")
    args = parser.parse_args()

    if not 1 <= args.port <= 65535:
        parser.error("le port doit être compris entre 1 et 65535")

    try:
        server, selected_port = create_server(args.port, args.directory)
    except (OSError, RuntimeError) as exc:
        print(f"Erreur: {exc}", file=sys.stderr)
        return 1

    PORT_FILE.write_text(str(selected_port), encoding="utf-8")
    url = f"http://{HOST}:{selected_port}/"
    if selected_port != args.port:
        print(f"Port {args.port} déjà utilisé → utilisation du port {selected_port}.")
    print(f"NetPractice Academy -> {url}")
    print("Arrêt: Ctrl+C")

    if args.open_browser:
        opener = threading.Timer(0.5, open_browser, args=(url,))
        opener.daemon = True
        opener.start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServeur arrêté.")
    finally:
        server.server_close()
        try:
            PORT_FILE.unlink()
        except FileNotFoundError:
            pass
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
