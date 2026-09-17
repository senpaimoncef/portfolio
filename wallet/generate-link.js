#!/usr/bin/env node
/* =========================================================================
   Génère le lien « Enregistrer dans Google Wallet » de la carte de visite.
   Voir wallet/README.md pour la marche à suivre complète.

   Usage :
     npm install google-auth-library
     node wallet/generate-link.js
   ========================================================================= */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/* -------------------------------------------------------------------------
   1. Paramètres — à adapter
   ------------------------------------------------------------------------- */
const CONFIG = {
  // Identifiant d'émetteur, obtenu sur https://pay.google.com/business/console
  issuerId: process.env.WALLET_ISSUER_ID || "3388000000022000000",

  // Chemin de la clé du compte de service (fichier JSON téléchargé sur GCP).
  // NE JAMAIS committer ce fichier sur GitHub.
  keyFile: process.env.WALLET_KEY_FILE || path.join(__dirname, "service-account.json"),

  // URL publique du portfolio : c'est elle qui est encodée dans le QR code du pass.
  portfolioUrl: process.env.PORTFOLIO_URL || "https://senpaimoncef.github.io/portfolio/",

  // Identifiants internes du pass
  classSuffix: "carte_visite_moncef",
  objectSuffix: "moncef_ghellai_001",

  // Données affichées sur la carte
  fullName: "Moncef Ghellai",
  headline: "Chef de projet Data/IA",
  subtitle: "Ingénieur en automatique industrielle",
  phone: "+33745492476",
  email: "ghellaimoncef.pro@gmail.com",
  linkedin: "https://www.linkedin.com/in/moncef-ghellai-61859b32a",

  // Image du logo : URL HTTPS publique et accessible (ex. le favicon du site).
  logoUrl: "https://senpaimoncef.github.io/portfolio/assets/photo-sm.jpg",

  // Couleur de fond du pass (hexadécimal)
  backgroundColor: "#0B1220"
};

/* -------------------------------------------------------------------------
   2. Définition du pass générique
   ------------------------------------------------------------------------- */
const classId = `${CONFIG.issuerId}.${CONFIG.classSuffix}`;
const objectId = `${CONFIG.issuerId}.${CONFIG.objectSuffix}`;

const genericClass = {
  id: classId,
  classTemplateInfo: {
    cardTemplateOverride: {
      cardRowTemplateInfos: [
        {
          twoItems: {
            startItem: { firstValue: { fields: [{ fieldPath: "object.textModulesData['phone']" }] } },
            endItem:   { firstValue: { fields: [{ fieldPath: "object.textModulesData['email']" }] } }
          }
        }
      ]
    }
  }
};

const genericObject = {
  id: objectId,
  classId: classId,
  state: "ACTIVE",
  hexBackgroundColor: CONFIG.backgroundColor,

  cardTitle:    { defaultValue: { language: "fr", value: CONFIG.headline } },
  header:       { defaultValue: { language: "fr", value: CONFIG.fullName } },
  subheader:    { defaultValue: { language: "fr", value: CONFIG.subtitle } },

  logo: {
    sourceUri: { uri: CONFIG.logoUrl },
    contentDescription: { defaultValue: { language: "fr", value: "Photo de Moncef Ghellai" } }
  },

  // Le QR code du pass renvoie vers le portfolio
  barcode: {
    type: "QR_CODE",
    value: CONFIG.portfolioUrl,
    alternateText: CONFIG.portfolioUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
  },

  textModulesData: [
    { id: "phone", header: "Téléphone", body: CONFIG.phone },
    { id: "email", header: "Email",     body: CONFIG.email }
  ],

  linksModuleData: {
    uris: [
      { uri: CONFIG.portfolioUrl,          description: "Portfolio",  id: "portfolio" },
      { uri: CONFIG.linkedin,              description: "LinkedIn",   id: "linkedin" },
      { uri: `tel:${CONFIG.phone}`,        description: "Appeler",    id: "tel" },
      { uri: `mailto:${CONFIG.email}`,     description: "Écrire",     id: "mail" }
    ]
  }
};

/* -------------------------------------------------------------------------
   3. Signature du JWT (RS256, sans dépendance externe)
   ------------------------------------------------------------------------- */
function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function signJwt(payload, clientEmail, privateKey) {
  const header = { alg: "RS256", typ: "JWT" };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;

  const signature = crypto
    .createSign("RSA-SHA256")
    .update(unsigned)
    .sign(privateKey)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${unsigned}.${signature}`;
}

/* -------------------------------------------------------------------------
   4. Exécution
   ------------------------------------------------------------------------- */
function main() {
  if (!fs.existsSync(CONFIG.keyFile)) {
    console.error(`\n  Clé de compte de service introuvable : ${CONFIG.keyFile}`);
    console.error("  Télécharge-la depuis Google Cloud Console, puis relance.");
    console.error("  Détails : wallet/README.md\n");
    process.exit(1);
  }

  const key = JSON.parse(fs.readFileSync(CONFIG.keyFile, "utf8"));

  const claims = {
    iss: key.client_email,
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    origins: [new URL(CONFIG.portfolioUrl).origin],
    payload: {
      genericClasses: [genericClass],
      genericObjects: [genericObject]
    }
  };

  const token = signJwt(claims, key.client_email, key.private_key);
  const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

  console.log("\n  Lien « Enregistrer dans Google Wallet » généré.\n");
  console.log(`  Longueur du lien : ${saveUrl.length} caractères`);
  if (saveUrl.length > 1800) {
    console.log("  (Lien long : si Wallet le refuse, crée la classe via l'API puis");
    console.log("   ne mets que genericObjects dans le payload.)");
  }
  console.log("\n  Colle cette valeur dans config.js -> walletSaveUrl :\n");
  console.log(saveUrl);
  console.log("");

  const out = path.join(__dirname, "save-url.txt");
  fs.writeFileSync(out, saveUrl + "\n", "utf8");
  console.log(`  Également écrit dans : ${out}\n`);
}

main();
