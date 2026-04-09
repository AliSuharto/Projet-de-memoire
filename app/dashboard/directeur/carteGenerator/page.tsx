"use client";

import React, { useState } from "react";
import { X, Download, Check, Shield, ChevronDown, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// =============================
// SÉCURITÉ - SIGNATURE QR CODE
// =============================

const PREFIX = "CUDS112233";
 
/**
 * Génère une signature SHA-256 identique au code WinDev :
 *  Input  : "CUDS112233" + Nom_et_prénoms + "//" + N_CIN + "//" + Téléphone
 *  Hash   : SHA-256 → hex uppercase
 *  Sig    : Gauche(hex, 4) + Droite(hex, 4)  →  8 caractères
 */
async function generateSignature(nom: string, cin: string, telephone: string): Promise<string> {
  const input = `${PREFIX}${nom}//${cin}//${telephone}`;
 
  const encoder = new TextEncoder();
  const data = encoder.encode(input); // UTF-8, identique à ChaîneVersUTF8()
 
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
 
  // Conversion en hex uppercase, identique à la boucle WinDev NumériqueVersChaîne(Asc(...), "02X")
  const hex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
    .join("");
 
  // Gauche(hex, 4) + Droite(hex, 4)
  return hex.substring(0, 4) + hex.substring(hex.length - 4);
}
 
/**
 * Génère la chaîne QR au format WinDev :
 *   "Nom_et_prénoms//N_CIN//Téléphone**SSSSSSSS"
 *
 * Les infos supplémentaires (activité, place, marché…) sont encodées
 * dans un bloc JSON séparé après le "##" pour rester lisibles côté scanner
 * sans casser la vérification de signature.
 *
 * Format final :
 *   "Nom//CIN//Tel**SIG##{"activite":"...","place":"...",...}"
 */
async function generateSecureQRData(marchand: Marchand): Promise<string> {
  // ── Champs utilisés pour la signature (identiques à WinDev) ──
  const nom       = `${marchand.nom.toUpperCase()} ${marchand.prenom}`;
  const cin       = marchand.numCIN;
  const telephone = marchand.numTel1 || "-";
 
  // ── Signature ──
  const sig = await generateSignature(nom, cin, telephone);
 
  // ── Partie principale (vérifiable) ──
  const mainPart = `${nom}//${cin}//${telephone}**${sig}`;
 
  // ── Métadonnées supplémentaires (non signées, informatives) ──
  const meta = {
    activite  : marchand.activite                          || "-",
    place     : marchand.places?.[0]?.nom                  || "Non assignée",
    marche    : marchand.places?.[0]?.marcheeName          || "-",
    zone      : marchand.places?.[0]?.zoneName             || "-",
    hall      : marchand.places?.[0]?.salleName            || "-",
    categorie : marchand.places?.[0]?.categorieName        || "-",
    date      : formatDate(marchand.dateEnregistrement),
  };
 
  return `${mainPart}##${JSON.stringify(meta)}`;
}

// =============================
// UTILITAIRES
// =============================

/**
 * Formate l'adresse de la place selon les valeurs disponibles
 * Format: place-hall-zone ou place-hall ou place-zone ou place
 */
const formatPlaceAddress = (place?: Place): string => {
  if (!place?.nom) return "-";
  
  const placeName = place.nom;
  const hallName = place.salleName;
  const zoneName = place.zoneName;
  
  // Si les deux existent
  if (hallName && zoneName) {
    return `${placeName}-${hallName}-${zoneName}`;
  }
  // Si seulement hall existe
  if (hallName) {
    return `${placeName}-${hallName}`;
  }
  // Si seulement zone existe
  if (zoneName) {
    return `${placeName}-${zoneName}`;
  }
  // Seulement le nom de la place
  return placeName;
};

const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("fr-FR") : "Non renseignée";

// =============================
// INTERFACES
// =============================
interface Place {
  id: number;
  nom: string;
  marcheeName?: string;
  zoneName?: string;
  salleName?: string;
  categorieName?: string;
}

interface Marchand {
  id: number;
  nom: string;
  stat?: string;
  nif?: string;
  prenom: string;
  numCIN: string;
  photo?: string;
  numTel1?: string;
  activite?: string;
  categorieName?: string;
  places?: Place[];
  dateEnregistrement?: string;
}

interface MerchantCardGeneratorProps {
  marchands: Marchand[];
  onClose: () => void;
}

// =====================================================================
// ⚡ COMPOSANT HD — CARTE 3150 × 4440 px (VERSION IMPRESSION EXPORT)
// =====================================================================
const MerchantCardHD: React.FC<{
  marchand: Marchand;
  templateUrl: string;
  secureQRData: string;
}> = ({ marchand, templateUrl, secureQRData }) => {
  const qrPayload = JSON.parse(secureQRData);
  const signature = qrPayload.sig;

  return (
    <div
      id={`card-hd-${marchand.id}`}
      className="merchant-card-print"
      style={{
        width: "3150px",
        height: "4440px",
        position: "relative",
        background: `url(${templateUrl}) center/cover no-repeat`,
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* NOM + PRENOM */}
      <div
        style={{
          position: "absolute",
          left: "815px",
          top: "980px",
          fontSize: "120px",
          fontWeight: "bold",
          color: "#083e7dff",
          letterSpacing: "4px",
          textShadow: "3px 3px 8px rgba(253, 253, 253, 1)",
        }}
      >
        {marchand.nom.toUpperCase()}
      </div>

      {/* MARCHE */}
      <div
        style={{
          position: "absolute",
          left: "1680px",
          top: "1380px",
          fontSize: "120px",
          fontWeight: "bold",
          color: "#000",
        }}
      >
        {marchand.places?.[0]?.marcheeName || "-"}
      </div>

      {/* PLACE (FORMAT AMÉLIORÉ) */}
      <div
        style={{
          position: "absolute",
          left: "1680px",
          top: "1680px",
          fontSize: "120px",
          fontWeight: "bold",
          color: "#000",
        }}
      >
        {formatPlaceAddress(marchand.places?.[0])}
      </div>

      {/* ACTIVITE */}
      <div
        style={{
          position: "absolute",
          left: "1680px",
          top: "2020px",
          fontSize: "120px",
          fontWeight: "bold",
          color: "#000",
        }}
      >
        {marchand.activite || "-"}
      </div>

      {/* CIN */}
      <div
        style={{
          position: "absolute",
          left: "1680px",
          top: "2300px",
          fontSize: "120px",
          fontWeight: "bold",
          color: "#000",
        }}
      >
        {marchand.numCIN || "-"}
      </div>

      {/* CATEGORIE */}
      <div
        style={{
          position: "absolute",
          left: "2410px",
          top: "2530px",
          fontSize: "120px",
          fontWeight: "bold",
          color: "#000",
        }}
      >
        {marchand.places?.[0]?.categorieName || "-"}
      </div>

      {/* STAT */}
      <div
        style={{
          position: "absolute",
          left: "280px",
          top: "3010px",
          fontSize: "120px",
          fontWeight: "bold",
          color: "#000",
        }}
      >
        {marchand.stat || "-"}
      </div>

      {/* NIF */}
      <div
        style={{
          position: "absolute",
          left: "280px",
          top: "2690px",
          fontSize: "120px",
          fontWeight: "bold",
          color: "#000",
        }}
      >
        {marchand.nif || "-"}
      </div>

      {/* TELEPHONE */}
      <div
        style={{
          position: "absolute",
          left: "280px",
          top: "3310px",
          fontSize: "120px",
          fontWeight: "bold",
          color: "#000",
        }}
      >
        {marchand.numTel1 || "-"}
      </div>

      {/* QR CODE SÉCURISÉ */}
      <div
        style={{
          position: "absolute",
          bottom: "230px",
          right: "95px",
          width: "1462px",
          height: "1380px",
          background: "white",
          borderRadius: "40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <QRCodeSVG
          value={secureQRData}
          size={1200}
          level="H"
          style={{
            transform: "scaleX(1.05)",
            transformOrigin: "center",
            display: "block",
          }}
        />
        <div
          style={{
            marginTop: "20px",
            fontSize: "50px",
            fontWeight: "bold",
            color: "#333",
            letterSpacing: "4px",
            fontFamily: "monospace",
          }}
        >
          🔒 {signature.substring(0, 8).toUpperCase()}
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// ⚡ VERSION PREVIEW - RÉDUITE
// =====================================================================
const MerchantCardPreview: React.FC<{
  marchand: Marchand;
  templateUrl: string;
  secureQRData: string;
}> = ({ marchand, templateUrl, secureQRData }) => {
  const scale = 0.11;
  const qrPayload = JSON.parse(secureQRData);
  const signature = qrPayload.sig;

  return (
    <div
      className="relative bg-white rounded-xl shadow-2xl overflow-hidden"
      style={{
        width: `${3150 * scale}px`,
        height: `${4440 * scale}px`,
        minWidth: `${3150 * scale}px`,
        background: `url(${templateUrl}) center/cover no-repeat`,
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Badge de sécurité */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          background: "rgba(16, 185, 129, 0.9)",
          color: "white",
          padding: "4px 8px",
          borderRadius: "6px",
          fontSize: "10px",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <Shield size={12} />
        SÉCURISÉ
      </div>

      {/* NOM + PRENOM */}
      <div
        style={{
          position: "absolute",
          left: `${815 * scale}px`,
          top: `${990 * scale}px`,
          fontSize: `${120 * scale}px`,
          fontWeight: "bold",
          color: "#083e7dff",
          letterSpacing: `${4 * scale}px`,
          textShadow: `${3 * scale}px ${3 * scale}px ${8 * scale}px rgba(253, 253, 253, 1)`,
          lineHeight: 1,
        }}
      >
        {marchand.nom.toUpperCase()}
      </div>

      {/* MARCHE */}
      <div
        style={{
          position: "absolute",
          left: `${1680 * scale}px`,
          top: `${1450 * scale}px`,
          fontSize: `${120 * scale}px`,
          fontWeight: "bold",
          color: "#000",
          lineHeight: 1,
        }}
      >
        {marchand.places?.[0]?.marcheeName || "-"}
      </div>

      {/* PLACE (FORMAT AMÉLIORÉ) */}
      <div
        style={{
          position: "absolute",
          left: `${1680 * scale}px`,
          top: `${1780 * scale}px`,
          fontSize: `${120 * scale}px`,
          fontWeight: "bold",
          color: "#000",
          lineHeight: 1,
        }}
      >
        {formatPlaceAddress(marchand.places?.[0])}
      </div>

      {/* ACTIVITE */}
      <div
        style={{
          position: "absolute",
          left: `${1680 * scale}px`,
          top: `${2085 * scale}px`,
          fontSize: `${120 * scale}px`,
          fontWeight: "bold",
          color: "#000",
          lineHeight: 1,
        }}
      >
        {marchand.activite || "-"}
      </div>

      {/* CIN */}
      <div
        style={{
          position: "absolute",
          left: `${1680 * scale}px`,
          top: `${2390 * scale}px`,
          fontSize: `${120 * scale}px`,
          fontWeight: "bold",
          color: "#000",
          lineHeight: 1,
        }}
      >
        {marchand.numCIN || "-"}
      </div>

      {/* CATEGORIE */}
      <div
        style={{
          position: "absolute",
          left: `${2440 * scale}px`,
          top: `${2615 * scale}px`,
          fontSize: `${120 * scale}px`,
          fontWeight: 600,
          color: "#000",
          lineHeight: 1,
        }}
      >
        {marchand.places?.[0]?.categorieName || "-"}
      </div>

      {/* STAT */}
      <div
        style={{
          position: "absolute",
          left: `${280 * scale}px`,
          top: `${3100 * scale}px`,
          fontSize: `${120 * scale}px`,
          fontWeight: "bold",
          color: "#000",
          lineHeight: 1,
        }}
      >
        {marchand.stat || "-"}
      </div>

      {/* NIF */}
      <div
        style={{
          position: "absolute",
          left: `${280 * scale}px`,
          top: `${2800 * scale}px`,
          fontSize: `${120 * scale}px`,
          fontWeight: 600,
          color: "#000",
          lineHeight: 1,
        }}
      >
        {marchand.nif || "-"}
      </div>

      {/* TELEPHONE */}
      <div
        style={{
          position: "absolute",
          left: `${280 * scale}px`,
          top: `${3400 * scale}px`,
          fontSize: `${120 * scale}px`,
          fontWeight: 600,
          color: "#000",
          lineHeight: 1,
        }}
      >
        {marchand.numTel1 || "-"}
      </div>

      {/* QR CODE SÉCURISÉ */}
      <div
        style={{
          position: "absolute",
          bottom: `${230 * scale}px`,
          right: `${95 * scale}px`,
          width: `${1462 * scale}px`,
          height: `${1380 * scale}px`,
          background: "white",
          borderRadius: `${40 * scale}px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <QRCodeSVG
          value={secureQRData}
          size={130}
          level="H"
          style={{
            transform: `scaleX(1.05)`,
            transformOrigin: "center",
            display: "block",
          }}
        />
        <div
          style={{
            marginTop: "3px",
            fontSize: "6px",
            fontWeight: "bold",
            color: "#333",
            letterSpacing: "0.5px",
            fontFamily: "monospace",
          }}
        >
          🔒 {signature.substring(0, 8).toUpperCase()}
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// ⚡ COMPOSANT PRINCIPAL
// =====================================================================
const MerchantCardGenerator: React.FC<MerchantCardGeneratorProps> = ({
  marchands,
  onClose,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>(
    marchands.map((m) => m.id)
  );
  const [template, setTemplate] = useState("/carte-bazarykely.png");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [qrDataMap, setQrDataMap] = useState<Record<number, string>>({});
  const [isGeneratingQR, setIsGeneratingQR] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resolution, setResolution] = useState<"high" | "standard">("high");

  const selected = marchands.filter((m) => selectedIds.includes(m.id));
  const currentMarchand = marchands[currentIndex];

  // Génération des QR codes sécurisés au montage
  React.useEffect(() => {
    const generateAllQR = async () => {
      const map: Record<number, string> = {};
      for (const marchand of marchands) {
        map[marchand.id] = await generateSecureQRData(marchand);
      }
      setQrDataMap(map);
      setIsGeneratingQR(false);
    };
    generateAllQR();
  }, [marchands]);

  const toggle = (id: number) =>
    setSelectedIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const toggleAll = () =>
    setSelectedIds(
      selectedIds.length === marchands.length ? [] : marchands.map((m) => m.id)
    );

  // ✨ TÉLÉCHARGEMENT OPTIMISÉ (plus rapide)
  const downloadSelected = async () => {
    if (selected.length === 0) return;

    setIsDownloading(true);

    try {
      const html2canvas = (await import("html2canvas")).default;

      // Traiter par lots de 3 cartes en parallèle pour accélérer
      const batchSize = 3;
      for (let i = 0; i < selected.length; i += batchSize) {
        const batch = selected.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (marchand) => {
            const el = document.getElementById(`card-hd-${marchand.id}`);
            if (!el) return;

            const canvas = await html2canvas(el, {
              scale: 1,
              useCORS: true,
              allowTaint: true,
              backgroundColor: null,
              logging: false, // Désactiver les logs pour accélérer
            });

            const a = document.createElement("a");
            a.download = `CARTE_SECURISEE_${marchand.nom}_${marchand.prenom}_${String(
              marchand.id
            ).padStart(4, "0")}.png`;
            a.href = canvas.toDataURL("image/png", 0.95); // Compression légère
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          })
        );

        // Petit délai entre les lots
        if (i + batchSize < selected.length) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      alert("Erreur lors du téléchargement des cartes.");
    } finally {
      setIsDownloading(false);
    }
  };

  // ✨ IMPRESSION DIRECTE (avec conversion en images pour inclure le template)
  const printSelected = async () => {
    if (selected.length === 0) return;

    setIsPrinting(true);

    try {
      const html2canvas = (await import("html2canvas")).default;

      // Convertir chaque carte en image
      const cardImages: string[] = [];
      
      for (const marchand of selected) {
        const el = document.getElementById(`card-hd-${marchand.id}`);
        if (!el) continue;

        const canvas = await html2canvas(el, {
          scale: 1,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          logging: false,
        });

        cardImages.push(canvas.toDataURL("image/png"));
      }

      // Créer une fenêtre d'impression avec les images
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Veuillez autoriser les pop-ups pour l'impression");
        setIsPrinting(false);
        return;
      }

      // CSS pour l'impression
      const printStyles = `
        <style>
          @page {
            size: 3150px 4440px;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .card-page {
            page-break-after: always;
            width: 3150px;
            height: 4440px;
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .card-page:last-child {
            page-break-after: auto;
          }
          .card-page img {
            width: 3150px;
            height: 4440px;
            display: block;
          }
        </style>
      `;

      // Générer le HTML avec les images
      const cardsHTML = cardImages
        .map((imgData, index) => `
          <div class="card-page">
            <img src="${imgData}" alt="Carte ${index + 1}" />
          </div>
        `)
        .join("");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Impression Cartes Marchands</title>
            ${printStyles}
          </head>
          <body>
            ${cardsHTML}
          </body>
        </html>
      `);

      printWindow.document.close();

      // Attendre que les images soient chargées
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
          setIsPrinting(false);
        }, 500);
      }, 1000);

    } catch (error) {
      console.error("Erreur lors de l'impression:", error);
      alert("Erreur lors de l'impression des cartes.");
      setIsPrinting(false);
    }
  };

  if (marchands.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white p-12 rounded-2xl text-center">
          <p className="text-2xl font-bold text-red-600">Aucun marchand</p>
          <button
            className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  if (isGeneratingQR) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-white p-12 rounded-2xl text-center">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-xl font-bold text-gray-800">
            Génération des QR codes sécurisés...
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Création des signatures cryptographiques
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex overflow-hidden">
          {/* COLONNE GAUCHE - PREVIEW */}
          <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 p-12 flex flex-col items-center justify-center">
            <div className="mb-6">
              <p className="text-sm text-slate-600 italic text-center">
                Aperçu en direct : Votre carte d'identité numérique
              </p>
            </div>

            <div className="flex flex-col items-center">
              <MerchantCardPreview
                marchand={currentMarchand}
                templateUrl={template}
                secureQRData={qrDataMap[currentMarchand.id]}
              />

              {/* Info marchand sous la carte */}
              <div className="mt-6 text-center bg-white px-6 py-4 rounded-xl shadow-md">
                <p className="font-bold text-gray-800 text-base">
                  {currentMarchand.nom} {currentMarchand.prenom}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {formatPlaceAddress(currentMarchand.places?.[0])}
                </p>
                <p className="text-xs text-green-600 mt-2 font-mono">
                  🔒 {JSON.parse(qrDataMap[currentMarchand.id]).sig.substring(0, 8).toUpperCase()}
                </p>
              </div>

              {/* Navigation entre les marchands */}
              {marchands.length > 1 && (
                <div className="flex items-center gap-3 mt-6">
                  <button
                    onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 bg-white text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                  >
                    ← Précédent
                  </button>
                  <span className="text-sm text-gray-600 font-medium">
                    {currentIndex + 1} / {marchands.length}
                  </span>
                  <button
                    onClick={() => setCurrentIndex((p) => Math.min(marchands.length - 1, p + 1))}
                    disabled={currentIndex === marchands.length - 1}
                    className="px-4 py-2 bg-white text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* COLONNE DROITE - SETTINGS */}
          <div className="w-[420px] bg-white flex flex-col">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Aperçu de votre carte marchand
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Vérifiez votre design et choisissez un format.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Body - Settings */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* PARAMÈTRES D'EXPORT */}
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
                  Paramètres d'export
                </h3>

                {/* Format de fichier */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Format de fichier
                  </label>
                  <div className="relative">
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-xl appearance-none bg-white text-sm font-medium text-gray-700 cursor-pointer hover:border-gray-400 transition-colors">
                      <option>Portable Network Graphics (PNG)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                  </div>
                </div>

                {/* Résolution */}
                <div className="space-y-3 mt-6">
                  <label className="text-sm font-medium text-gray-700">
                    Résolution
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setResolution("high")}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        resolution === "high"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      Haute (300 DPI)
                    </button>
                    <button
                      onClick={() => setResolution("standard")}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        resolution === "standard"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      Standard (72 DPI)
                    </button>
                  </div>
                </div>

                {/* Info SVG */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">i</span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Les formats vectoriels (SVG) sont recommandés pour l'impression professionnelle et les supports de branding.
                  </p>
                </div>
              </div>

              {/* Sélection des cartes */}
              <div className="pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Cartes sélectionnées
                  </h3>
                  <button
                    onClick={toggleAll}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {selectedIds.length === marchands.length ? "Tout désélectionner" : "Tout sélectionner"}
                  </button>
                </div>

                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {marchands.map((m) => (
                    <label
                      key={m.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(m.id)}
                        onChange={() => toggle(m.id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {m.nom} {m.prenom}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatPlaceAddress(m.places?.[0])}
                        </p>
                      </div>
                      <Check
                        size={16}
                        className={`flex-shrink-0 ${
                          selectedIds.includes(m.id) ? "text-green-600" : "text-transparent"
                        }`}
                      />
                    </label>
                  ))}
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  {selected.length} carte(s) sélectionnée(s)
                </p>
              </div>
            </div>

            {/* Footer - Actions */}
            <div className="p-6 border-t space-y-3">
              {/* Bouton Télécharger */}
              <button
                onClick={downloadSelected}
                disabled={isDownloading || selected.length === 0}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
              >
                <Download size={20} />
                {isDownloading
                  ? "Téléchargement en cours..."
                  : "Télécharger maintenant"}
              </button>

              {/* Bouton Imprimer */}
              <button
                onClick={printSelected}
                disabled={isPrinting || selected.length === 0}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
              >
                <Printer size={20} />
                {isPrinting
                  ? "Préparation de l'impression..."
                  : "Imprimer directement"}
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Annuler et retourner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CARTES HD INVISIBLES */}
      <div style={{ position: "absolute", top: "-99999px", left: "-99999px" }}>
        {marchands.map((m) => (
          <MerchantCardHD
            key={`hd-${m.id}`}
            marchand={m}
            templateUrl={template}
            secureQRData={qrDataMap[m.id]}
          />
        ))}
      </div>
    </>
  );
};

export default MerchantCardGenerator;