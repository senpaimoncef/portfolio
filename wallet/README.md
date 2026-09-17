# Carte Google Wallet

Objectif : obtenir un bouton **« Enregistrer dans Google Wallet »** qui ajoute ta
carte de visite au téléphone, avec un QR code qui mène au portfolio.

> **À savoir avant de commencer**
> Google Wallet n'accepte pas de pass « fait maison » : il faut un compte
> émetteur (*issuer*) validé par Google. C'est gratuit, mais c'est une
> démarche à faire une fois, avec ton propre compte Google. Personne d'autre
> ne peut la faire à ta place.
>
> Tant que ce n'est pas fait, le QR code et la vCard de `card.html`
> fonctionnent déjà sur tous les téléphones — c'est 90 % de l'usage réel.

---

## Étape 1 — Créer le compte émetteur

1. Va sur <https://pay.google.com/business/console>
2. Connecte-toi avec ton compte Google.
3. Renseigne le nom de l'émetteur (par exemple `Moncef Ghellai`).
4. Note l'**Issuer ID** affiché (un nombre à ~19 chiffres).

## Étape 2 — Créer un compte de service Google Cloud

1. Va sur <https://console.cloud.google.com/> et crée un projet
   (ou réutilise un projet existant).
2. Active l'API : **APIs & Services → Library → « Google Wallet API » → Enable**.
3. **IAM & Admin → Service Accounts → Create service account**.
   - Nom : `wallet-portfolio`
   - Rôle : aucun rôle GCP n'est nécessaire.
4. Sur le compte de service créé : **Keys → Add key → Create new key → JSON**.
   Un fichier `.json` est téléchargé.
5. Renomme-le `service-account.json` et place-le dans ce dossier `wallet/`.

> ⚠️ **Ce fichier est une clé privée.** Il est déjà exclu par le `.gitignore`
> du dépôt. Ne le committe jamais, ne le partage jamais.

## Étape 3 — Autoriser le compte de service

Retourne sur <https://pay.google.com/business/console> →
**Users → Invite a user** → ajoute l'adresse `client_email` qui figure dans
`service-account.json`, avec le rôle **Developer** (ou Admin).

## Étape 4 — Générer le lien

Depuis la racine du dépôt :

```bash
npm install google-auth-library
```

Ouvre `wallet/generate-link.js` et renseigne en haut du fichier :

- `issuerId` — l'Issuer ID de l'étape 1
- `portfolioUrl` — l'URL publique de ton portfolio (celle de GitHub Pages)
- `logoUrl` — une image HTTPS publique (par défaut, ta photo sur le site)

Puis :

```bash
node wallet/generate-link.js
```

Le script affiche un lien `https://pay.google.com/gp/v/save/...` et l'écrit
aussi dans `wallet/save-url.txt`.

## Étape 5 — Brancher le bouton

Ouvre `config.js` à la racine et colle le lien :

```js
window.MG_CONFIG = {
  siteUrl: "",
  walletSaveUrl: "https://pay.google.com/gp/v/save/eyJhbGciOi..."
};
```

Committe, pousse — le bouton Wallet de `card.html` s'active tout seul et le
message d'explication disparaît.

---

## Notes

- **Mode démo** : tant que ton compte émetteur n'est pas validé par Google,
  seuls les comptes que tu as ajoutés dans la console (onglet *Users*) peuvent
  enregistrer le pass. Demande la validation via le bouton **« Request
  publishing access »** pour l'ouvrir à tout le monde.
- **Le lien est-il permanent ?** Oui. Le JWT signé n'expire pas, mais si tu
  changes l'URL du portfolio, il faut régénérer le lien et mettre à jour
  `config.js`.
- **Lien trop long ?** Si Google refuse le lien, crée d'abord la *classe* via
  l'API REST (`POST https://walletobjects.googleapis.com/walletobjects/v1/genericClass`),
  puis retire `genericClasses` du `payload` dans le script : seul
  `genericObjects` reste, et le lien raccourcit nettement.
- **Apple Wallet** : le principe est identique mais demande un compte Apple
  Developer payant (99 €/an) et un certificat de signature. Le QR code du site
  couvre déjà iPhone sans rien payer.

## Documentation officielle

- Google Wallet — Generic passes : <https://developers.google.com/wallet/generic>
- Console émetteur : <https://pay.google.com/business/console>
