#!/usr/bin/env python3
from pathlib import Path
import re
import subprocess

root = Path(__file__).resolve().parents[1]
required = [
    root / "index.html",
    root / "assets/js/network.js",
    root / "assets/js/courses.js",
    root / "assets/js/levels.js",
    root / "assets/js/app.js",
    root / "assets/css/style.css",
]
for path in required:
    assert path.exists() and path.stat().st_size > 0, f"Fichier manquant ou vide: {path}"

levels = (root / "assets/js/levels.js").read_text(encoding="utf-8")
ids = re.findall(r"\bid:\s*(\d+),", levels)
assert ids[:21] == [str(i) for i in range(1, 22)], f"Les 21 niveaux ne sont pas présents dans l'ordre: {ids[:21]}"

courses = (root / "assets/js/courses.js").read_text(encoding="utf-8")
for concept in ["Chevauchement", "Passerelle", "Tables de routage", "Masques"]:
    assert concept.lower() in courses.lower(), f"Cours manquant: {concept}"

app = (root / "assets/js/app.js").read_text(encoding="utf-8")
assert "Get my config" not in app and "exportConfig" not in app, "Le bouton d'export doit être absent du mode entraînement"
assert 'id="nextLevel"' in app and "Suivant →" in app, "Le bouton Suivant manque"
for mask in ['255.255.255.0','255.255.255.128','255.255.255.192','255.255.255.224','255.255.255.240','255.255.255.248','255.255.255.252']:
    assert mask in app, f"Masque absent des repères rapides: {mask}"
assert 'Configuration fonctionnelle — réponse différente de celle attendue' in app, 'Le statut fonctionnel/non attendu manque'
for visualizer in ['splitPrefixPicker','bestMaskForm','routeForm','subnet-position','overlap-map','same-map']:
    assert visualizer in app, f'Visualiseur de laboratoire manquant: {visualizer}'

node_test = r"""
const N = require('./assets/js/network.js');
const cases = [
  ['/25', 25], ['25', 25], ['255.255.255.128', 25],
  ['/26', 26], ['255.255.255.192', 26],
  ['/30', 30], ['255.255.255.252', 30]
];
for (const [value, expected] of cases) {
  if (N.parsePrefix(value) !== expected) throw new Error(value + ' != /' + expected);
}
let invalid = false;
try { N.parsePrefix('255.0.255.0'); } catch (e) { invalid = true; }
if (!invalid) throw new Error('Un masque non contigu a été accepté');
"""
subprocess.run(["node", "-e", node_test], cwd=root, check=True)

level_test = r"""
const N = require('./assets/js/network.js');
global.window = {NetUtils:N};
require('./assets/js/levels.js');
const l2 = window.LEVELS.find(x => x.id === 2);
let r = l2.validate({prefix:'/25'});
if (!r.ok || r.expected !== false) throw new Error('/25 doit être fonctionnel mais non attendu au niveau 2');
r = l2.validate({prefix:'255.255.255.192'});
if (!r.ok || r.expected !== true) throw new Error('255.255.255.192 doit être la réponse attendue au niveau 2');
r = l2.validate({prefix:'/27'});
if (r.ok) throw new Error('/27 ne doit pas fonctionner au niveau 2');
if (window.LEVELS.length !== 21) throw new Error('21 niveaux attendus');
"""
subprocess.run(["node", "-e", level_test], cwd=root, check=True)

print("OK — structure, 21 niveaux, réponses alternatives, bouton Suivant et masques CIDR/décimaux validés.")


# Multilingual UI
assert (root / "assets/js/i18n.js").exists(), "i18n.js missing"
index = (root / "index.html").read_text(encoding="utf-8")
assert "languageSelect" in index and "assets/js/i18n.js" in index
i18n = (root / "assets/js/i18n.js").read_text(encoding="utf-8")
assert "\"fr\"" in i18n and "\"en\"" in i18n and "\"es\"" in i18n

# Refresh-loop regression guards
assert "location.reload" not in i18n, "Le changement de langue ne doit jamais recharger la page"
assert '<form' not in app.lower(), "Le site d'entraînement ne doit plus utiliser de formulaires HTML natifs (évite les GET /? involontaires)"
assert 'addEventListener("submit"' not in app, "Aucun submit natif ne doit pouvoir recharger la page"
assert 'id="checkConfig"' in app, "Le bouton de validation explicite manque"
assert 'autocomplete="off"' in index, "Le sélecteur de langue doit désactiver la restauration automatique du navigateur"
assert 'history.replaceState' not in index, "Aucun correctif d'URL ne doit s'exécuter au chargement"
