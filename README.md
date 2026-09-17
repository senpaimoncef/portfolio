# Portfolio — Moncef Ghellai

Portfolio personnel au format « linktree », statique, sans build ni dépendance
serveur. Hébergeable tel quel sur GitHub Pages.

**Chef de projet Data/IA — Ingénieur en automatique industrielle**

---

## Contenu

| Fichier | Rôle |
|---|---|
| `index.html` | Page principale : profil, contact, CV, projets, compétences |
| `card.html` | Carte de visite dématérialisée : QR code, vCard, Google Wallet |
| `config.js` | **Seul fichier à éditer** après déploiement (URL du site, lien Wallet) |
| `styles.css` | Thème clair/sombre, responsive |
| `app.js` / `card.js` | Bascule de thème, génération du QR, partage |
| `vendor/qrcode.js` | Générateur de QR code (MIT, Kazuhiko Arase) — aucun CDN |
| `assets/` | Photo, CV PDF, mémoire PFE, vCard, favicon |
| `wallet/` | Script et mode d'emploi pour la carte Google Wallet |

## Déploiement sur GitHub Pages

### 1. Créer le dépôt

Sur <https://github.com/new> : nom `portfolio`, visibilité **Public**,
sans README ni `.gitignore` (ils sont déjà là).

### 2. Pousser le code

Depuis ce dossier :

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "Portfolio initial"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/senpaimoncef/portfolio.git
```

```bash
git push -u origin main
```

### 3. Activer Pages

Dans le dépôt : **Settings → Pages → Source : `Deploy from a branch`**,
branche `main`, dossier `/ (root)` → **Save**.

Le site est en ligne après une à deux minutes sur :

```
https://senpaimoncef.github.io/portfolio/
```

### 4. Vérifier

- Le QR code de `card.html` se calcule tout seul depuis l'URL de la page :
  rien à configurer.
- Si tu branches un **domaine personnalisé**, renseigne-le dans `config.js`
  (`siteUrl`) pour que le QR pointe bien dessus.

## Mettre à jour le CV

Remplace `assets/CV-Moncef-Ghellai.pdf` par la nouvelle version (même nom de
fichier), puis :

```bash
git add assets/CV-Moncef-Ghellai.pdf && git commit -m "Mise à jour du CV" && git push
```

## Carte Google Wallet

Voir [`wallet/README.md`](wallet/README.md) — démarche en 5 étapes.
Le QR code et la vCard fonctionnent déjà sans cette configuration.

## Licence

Contenu personnel (textes, photo, CV, mémoire) : tous droits réservés.
`vendor/qrcode.js` : licence MIT, © Kazuhiko Arase.
