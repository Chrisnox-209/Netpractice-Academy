# NetPractice Academy — Cours, tutoriel et entraînement NetPractice pour 42

<p align="center">
  <strong>Apprendre IPv4, le subnetting, les masques CIDR et le routage avant de résoudre NetPractice.</strong><br>
  Un site pédagogique local, visuel et progressif pensé pour les élèves de 42 qui partent de zéro.
</p>

<p align="center">
  <a href="README.md"><strong>Français</strong></a> ·
  <a href="README_EN.md">English</a> ·
  <a href="README_ES.md">Español</a>
</p>

<p align="center">
  <img alt="NetPractice" src="https://img.shields.io/badge/42-NetPractice-111111?style=flat-square">
  <img alt="IPv4" src="https://img.shields.io/badge/IPv4-Subnetting-0071e3?style=flat-square">
  <img alt="CIDR" src="https://img.shields.io/badge/CIDR-%2F24%20%E2%86%92%20%2F30-248a3d?style=flat-square">
  <img alt="Local" src="https://img.shields.io/badge/100%25-Local-6e6e73?style=flat-square">
  <img alt="Languages" src="https://img.shields.io/badge/Langues-FR%20%7C%20EN%20%7C%20ES-c96b00?style=flat-square">
</p>

## Pourquoi ce projet ?

**NetPractice** est un projet de l'école 42 consacré aux bases du réseau IPv4. Le problème pour beaucoup de débutants n'est pas de remplir une case : c'est de comprendre **pourquoi** une IP, un masque ou une route fonctionne.

NetPractice Academy a été créé comme un **cours et tutoriel NetPractice interactif**. L'objectif est de rendre visibles les notions qui sont normalement abstraites : plage d'un sous-réseau, adresse réseau, broadcast, chevauchement, gateway, route par défaut et trajet aller/retour d'un paquet.

Le site ne donne pas simplement une série de réponses à mémoriser. Il essaie de construire les réflexes nécessaires pour résoudre les exercices soi-même.

> Ce projet est un outil communautaire d'apprentissage. Il n'est ni officiel ni affilié à 42 et ne remplace pas le sujet ou les ressources officielles de NetPractice.

## Fonctionnalités

### Cours NetPractice pour débutants

Le parcours théorique part de zéro et explique avec des mots simples :

- ce qu'est un réseau, un hôte, un switch et un routeur ;
- comment lire une adresse **IPv4** ;
- les **masques de sous-réseau** et la notation **CIDR** ;
- `/24`, `/25`, `/26`, `/27`, `/28`, `/29` et `/30` ;
- l'adresse réseau, le broadcast et les adresses hôtes utilisables ;
- comment déterminer si deux machines sont dans le **même sous-réseau** ;
- pourquoi deux sous-réseaux peuvent se **chevaucher** ;
- le rôle d'une **gateway / passerelle par défaut** ;
- les **tables de routage**, next hops et `0.0.0.0/0` ;
- une méthode de résolution reproductible pour les exercices NetPractice.

### Laboratoire visuel de subnetting

Le laboratoire permet de manipuler les valeurs et de **voir** les calculs au lieu de seulement lire un résultat.

Il contient notamment :

- **Où tombe cette IP ?** — visualisation de la position d'une IPv4 dans son sous-réseau ;
- **Masque en binaire** — distinction visuelle entre bits réseau et bits hôte ;
- **Chevauchement de sous-réseaux** — deux plages superposées avec la zone commune mise en évidence ;
- **Découpage d'un /24** — représentation des blocs `/24` à `/30` ;
- **Même réseau ?** — comparaison graphique de deux machines ;
- **Masque le plus précis** — distinction entre « fonctionne » et « réponse optimale » ;
- **Trajet d'un paquet** — visualisation du passage par la gateway et du chemin retour ;
- **Repères rapides** — correspondance CIDR ↔ masque décimal complet.

Exemple de repères :

| CIDR | Masque décimal | Taille du bloc | Hôtes utilisables* |
|---|---|---:|---:|
| `/24` | `255.255.255.0` | 256 | 254 |
| `/25` | `255.255.255.128` | 128 | 126 |
| `/26` | `255.255.255.192` | 64 | 62 |
| `/27` | `255.255.255.224` | 32 | 30 |
| `/28` | `255.255.255.240` | 16 | 14 |
| `/29` | `255.255.255.248` | 8 | 6 |
| `/30` | `255.255.255.252` | 4 | 2 |

\*Dans le modèle IPv4 classique utilisé dans ce type d'exercice.

### 21 exercices pratiques

La partie pratique reprend l'esprit d'une **training interface NetPractice** : topologie réseau, interfaces, zones IP/masque, routes, bouton de vérification et journal de diagnostic.

Les exercices couvrent trois paliers :

- **Bases** — IP, masque, même LAN, gateway ;
- **NetPractice** — routes statiques, route par défaut, Internet, VLSM et chevauchements ;
- **Complexe / Boss** — plusieurs routeurs, plusieurs LAN, réseaux de transit, agrégation, VLSM dense, Internet et routes aller/retour.

Le validateur distingue volontairement deux situations :

```text
✅ Configuration valide — réponse attendue
⚠️ Configuration fonctionnelle — réponse différente de celle attendue
```

Ainsi, si `/25` fonctionne mais que `/26` est le plus petit réseau attendu, le site explique la différence au lieu d'indiquer simplement « faux ».

Les masques peuvent être saisis dans les deux formats :

```text
/25
```

ou :

```text
255.255.255.128
```

## Interface multilingue

Le site est disponible en :

- 🇫🇷 Français ;
- 🇬🇧 English ;
- 🇪🇸 Español.

La langue se change directement dans la barre supérieure avec le sélecteur **FR / EN / ES**. Le choix est enregistré dans `localStorage` et reste actif au prochain lancement.

## Installation et lancement

### Prérequis

Il suffit d'avoir :

- `make` ;
- Python 3 ;
- un navigateur web moderne.

Aucun framework JavaScript, `npm`, Docker ou serveur externe n'est nécessaire.

### Lancer NetPractice Academy

```bash
make
```

Le serveur démarre puis **ouvre automatiquement NetPractice Academy dans le navigateur par défaut**.

Il essaie d'abord `http://localhost:49242`. Si ce port est déjà utilisé, il choisit automatiquement le prochain port libre, ouvre la bonne URL et l'affiche aussi dans le terminal.

Pour choisir un autre port de départ :

```bash
make PORT=8000
```

Pour lancer le serveur **sans ouvrir automatiquement le navigateur** :

```bash
make AUTO_OPEN=0
```

### Vérifier le projet

```bash
make check
```

Les smoke tests vérifient notamment la présence des 21 exercices, les formats CIDR/décimaux et l'interface multilingue.

## Comment utiliser ce tutoriel NetPractice

Pour un débutant, l'ordre conseillé est le suivant :

1. lire les modules **Cours** dans l'ordre ;
2. utiliser **Laboratoire** dès qu'une notion paraît abstraite ;
3. tester plusieurs masques dans les visualiseurs pour comprendre leurs plages ;
4. commencer les exercices **Bases** ;
5. passer aux exercices **NetPractice** ;
6. terminer par les modes **Complexe / Boss** ;
7. lors d'une erreur, suivre le paquet dans les deux sens avant de regarder la solution.

La règle la plus importante est de ne pas apprendre une configuration par cœur : il faut être capable d'expliquer **pourquoi les deux extrémités sont dans le même réseau**, **pourquoi une gateway est joignable**, et **comment le paquet revient à sa source**.

## Chevauchement de sous-réseaux : exemple rapide

Prenons :

```text
Réseau A : 192.168.1.0/25
→ 192.168.1.0 à 192.168.1.127

Réseau B : 192.168.1.64/26
→ 192.168.1.64 à 192.168.1.127
```

Les adresses `.64` à `.127` appartiennent aux deux plages : les réseaux se chevauchent.

Une disposition valide serait par exemple :

```text
Réseau A : 192.168.1.0/25
→ .0 à .127

Réseau B : 192.168.1.128/26
→ .128 à .191
```

Le laboratoire du site permet de modifier ces valeurs en direct et de visualiser la zone de conflit.

## Structure du projet

```text
.
├── Makefile
├── README.md
├── README_EN.md
├── README_ES.md
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── network.js
│       ├── courses.js
│       ├── levels.js
│       ├── i18n.js
│       └── app.js
├── tools/
│   └── serve.py
└── tests/
    └── smoke_test.py
```

Le projet fonctionne entièrement côté navigateur. Les calculs IPv4 et les validations sont faits localement.

## FAQ NetPractice

### Est-ce un corrigé des 10 niveaux officiels de NetPractice ?

Non. Le but est de comprendre les mécanismes nécessaires à NetPractice avec des scénarios pédagogiques et des exercices d'entraînement. Les topologies s'inspirent des notions et de la difficulté du projet, sans être une banque de réponses à mémoriser.

### Comment savoir si deux IP sont dans le même réseau ?

Applique le même masque aux deux adresses et compare leur **adresse réseau**. Si l'adresse réseau obtenue est identique, elles appartiennent au même sous-réseau pour ce masque.

### Pourquoi `/25` peut fonctionner alors que `/26` est attendu ?

Parce qu'un réseau plus grand peut contenir les deux hôtes. `/26` peut toutefois être la réponse la plus précise, c'est-à-dire le plus petit réseau qui respecte les contraintes. Le validateur explique ce cas au lieu de refuser une configuration réellement fonctionnelle.

### Pourquoi faut-il vérifier le chemin retour ?

Parce qu'atteindre la destination ne suffit pas. La machine distante doit aussi posséder un chemin valide pour renvoyer la réponse. C'est une source fréquente d'erreurs dans les exercices de routage.

### Pourquoi `0.0.0.0/0` est important ?

C'est la **route par défaut** : elle correspond aux destinations pour lesquelles aucune route plus spécifique n'est utilisée.

## Pour mieux référencer le dépôt sur GitHub

Si tu forks ou publies ce projet, une description GitHub courte et claire peut être :

> Interactive NetPractice 42 tutorial: IPv4, subnetting, CIDR, routing, visual labs and 21 practice exercises for beginners.

Topics GitHub recommandés :

```text
42
42-school
netpractice
netpractice-42
ipv4
subnetting
cidr
networking
routing
subnet-mask
computer-networks
network-learning
```

Ces termes correspondent aux recherches naturelles des élèves : **NetPractice 42 tutorial**, **cours NetPractice**, **NetPractice subnetting**, **CIDR calculator**, **IPv4 subnet mask**, **routing table** et **gateway**.

## Contributions

Les corrections pédagogiques, nouveaux visualiseurs et nouveaux scénarios sont les bienvenus. Pour une contribution importante, l'idéal est de conserver trois principes :

1. expliquer avant de donner la réponse ;
2. privilégier une représentation visuelle quand elle aide à comprendre ;
3. accepter les configurations réseau réellement valides même lorsqu'elles diffèrent de la réponse optimale, puis expliquer la différence.

## Langues

- [README français](README.md)
- [English README](README_EN.md)
- [README en español](README_ES.md)

---

**Mots-clés :** NetPractice 42, tutoriel NetPractice, cours NetPractice, IPv4, subnetting, sous-réseaux, CIDR, masque de sous-réseau, gateway, passerelle par défaut, routing, table de routage, VLSM, chevauchement de sous-réseaux, réseau informatique, 42 school.

### Réinitialiser un exercice

Dans l'interface **TRAINING**, le bouton **Reset all** remet **les 21 exercices** à zéro après confirmation : toutes les réponses enregistrées, validations et aides sont effacées, puis l'entraînement revient au niveau 1. Le choix de langue est conservé.
