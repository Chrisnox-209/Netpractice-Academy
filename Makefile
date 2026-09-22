PORT ?= 49242
PYTHON ?= python3
AUTO_OPEN ?= 1

.DEFAULT_GOAL := serve

.PHONY: serve open check help

serve:
	@if [ "$(AUTO_OPEN)" = "0" ]; then \
		$(PYTHON) tools/serve.py --port $(PORT) --directory .; \
	else \
		$(PYTHON) tools/serve.py --port $(PORT) --directory . --open-browser; \
	fi

open:
	@PORT_USED=$$(cat .netpractice-port 2>/dev/null || echo "$(PORT)"); \
	URL="http://localhost:$$PORT_USED"; \
	if command -v xdg-open >/dev/null 2>&1; then xdg-open $$URL >/dev/null 2>&1; \
	elif command -v open >/dev/null 2>&1; then open $$URL; \
	else echo "Ouvre $$URL dans ton navigateur."; fi

check:
	@$(PYTHON) tests/smoke_test.py
	@$(PYTHON) -m py_compile tools/serve.py

help:
	@echo "make                  Lance le site et ouvre le navigateur"
	@echo "make PORT=8000        Commence la recherche à partir du port 8000"
	@echo "make AUTO_OPEN=0      Lance le site sans ouvrir le navigateur"
	@echo "make open             Ouvre l'URL du serveur déjà lancé"
	@echo "make check            Lance les tests"
