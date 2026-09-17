/* Carte de visite dématérialisée — Moncef Ghellai
   QR code, partage natif, téléchargement du QR, bouton Google Wallet. */

(function () {
  "use strict";

  var CFG = window.MG_CONFIG || {};

  /* ---------------------------------------------------------
     1. URL du portfolio
     --------------------------------------------------------- */
  function portfolioUrl() {
    if (CFG.siteUrl) return CFG.siteUrl;

    // Déduit l'URL du dossier courant : .../card.html -> .../
    if (location.protocol === "http:" || location.protocol === "https:") {
      return new URL(".", location.href).href;
    }

    // Ouverture locale (file://) : pas d'URL publique exploitable
    return "";
  }

  var SITE = portfolioUrl();
  var PRETTY = SITE.replace(/^https?:\/\//, "").replace(/\/$/, "");

  /* ---------------------------------------------------------
     2. Rendu du QR code
     --------------------------------------------------------- */
  var QR_MARGIN = 4;   // zone de silence, en modules (minimum 4)
  var frame = document.getElementById("qrFrame");
  var qrModel = null;

  function buildQr(text) {
    // typeNumber 0 = version choisie automatiquement ; 'M' = 15 % de correction
    var qr = window.qrcode(0, "M");
    qr.addData(text);
    qr.make();
    return qr;
  }

  function qrToSvg(qr, px) {
    var n = qr.getModuleCount();
    var size = n + QR_MARGIN * 2;
    var path = "";

    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (qr.isDark(r, c)) {
          path += "M" + (c + QR_MARGIN) + "," + (r + QR_MARGIN) + "h1v1h-1z";
        }
      }
    }

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + " " + size + '"' +
           ' width="' + px + '" height="' + px + '" shape-rendering="crispEdges"' +
           ' role="img" aria-label="QR code vers le portfolio de Moncef Ghellai">' +
           '<rect width="' + size + '" height="' + size + '" fill="#FFFFFF"/>' +
           '<path d="' + path + '" fill="#0B1220"/>' +
           "</svg>";
  }

  if (frame) {
    if (SITE) {
      qrModel = buildQr(SITE);
      frame.innerHTML = qrToSvg(qrModel, 168);
      frame.removeAttribute("aria-hidden");
    } else {
      frame.innerHTML =
        '<div style="width:168px;height:168px;display:grid;place-items:center;' +
        'color:#5A6781;font-size:12px;text-align:center;line-height:1.5;padding:12px">' +
        "QR code disponible<br>une fois le portfolio<br>mis en ligne</div>";
    }
  }

  var qrUrl = document.getElementById("qrUrl");
  if (qrUrl) qrUrl.textContent = PRETTY || "";

  /* ---------------------------------------------------------
     3. Ligne « Portfolio » de la carte
     --------------------------------------------------------- */
  var rowSite = document.getElementById("rowSite");
  var rowSiteText = document.getElementById("rowSiteText");
  if (rowSite && SITE) {
    rowSite.href = SITE;
    if (rowSiteText) rowSiteText.textContent = PRETTY;
  } else if (rowSite) {
    rowSite.href = "index.html";
  }

  /* ---------------------------------------------------------
     4. Notifications
     --------------------------------------------------------- */
  var toast = document.getElementById("toast");
  var toastTimer;

  function notify(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2600);
  }

  /* ---------------------------------------------------------
     5. Partage
     --------------------------------------------------------- */
  var shareBtn = document.getElementById("shareBtn");

  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var url = SITE || location.href;
      var payload = {
        title: "Moncef Ghellai — Chef de projet Data/IA",
        text: "Chef de projet Data/IA · Ingénieur en automatique industrielle",
        url: url
      };

      if (navigator.share) {
        navigator.share(payload).catch(function () { /* partage annulé */ });
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(
          function () { notify("Lien copié dans le presse-papiers"); },
          function () { notify(url); }
        );
        return;
      }

      notify(url);
    });
  }

  /* ---------------------------------------------------------
     6. Téléchargement du QR code (PNG haute définition)
     --------------------------------------------------------- */
  var qrDownloadBtn = document.getElementById("qrDownloadBtn");

  if (qrDownloadBtn) {
    qrDownloadBtn.addEventListener("click", function () {
      if (!qrModel) {
        notify("Le QR code sera disponible une fois le site en ligne");
        return;
      }

      var n = qrModel.getModuleCount();
      var size = n + QR_MARGIN * 2;
      var scale = Math.max(8, Math.ceil(1024 / size));  // ≈ 1024 px de côté

      var canvas = document.createElement("canvas");
      canvas.width = canvas.height = size * scale;
      var ctx = canvas.getContext("2d");

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0B1220";

      for (var r = 0; r < n; r++) {
        for (var c = 0; c < n; c++) {
          if (qrModel.isDark(r, c)) {
            ctx.fillRect((c + QR_MARGIN) * scale, (r + QR_MARGIN) * scale, scale, scale);
          }
        }
      }

      canvas.toBlob(function (blob) {
        if (!blob) { notify("Téléchargement impossible sur ce navigateur"); return; }
        var href = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = href;
        a.download = "qr-moncef-ghellai.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(href); }, 4000);
        notify("QR code téléchargé");
      }, "image/png");
    });
  }

  /* ---------------------------------------------------------
     7. Google Wallet
     --------------------------------------------------------- */
  var walletBtn = document.getElementById("walletBtn");
  var walletHint = document.getElementById("walletHint");

  if (walletBtn) {
    if (CFG.walletSaveUrl) {
      walletBtn.href = CFG.walletSaveUrl;
      walletBtn.removeAttribute("aria-disabled");
      walletBtn.target = "_blank";
      walletBtn.rel = "noopener noreferrer";
      if (walletHint) walletHint.hidden = true;
    } else {
      walletBtn.addEventListener("click", function (event) {
        event.preventDefault();
        notify("Carte Wallet pas encore générée — voir wallet/README.md");
      });
    }
  }
})();
