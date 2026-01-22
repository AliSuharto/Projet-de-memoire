"use client";

import React, { useState } from "react";
import { X, Download, Check, Shield, ChevronDown } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// =============================
// SÉCURITÉ - SIGNATURE QR CODE
// =============================

// ⚠️ IMPORTANT: Cette clé doit être identique côté backend et mobile
// En production, utilisez une variable d'environnement sécurisée
const SECRET_KEY = process.env.NEXT_PUBLIC_QR_SECRET_KEY || "BAZARYKELY_2025_SECRET_KEY_CHANGE_ME";

/**
 * Génère une signature HMAC-SHA256 pour authentifier le QR code
 * Utilise l'API Web Crypto disponible dans les navigateurs modernes
 */
async function generateSignature(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SECRET_KEY);
  const messageData = encoder.encode(data);

  // Import de la clé
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Signature
  const signature = await crypto.subtle.sign("HMAC", key, messageData);

  // Conversion en hexadécimal
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .substring(0, 16); // 16 premiers caractères pour réduire la taille du QR
}

/**
 * Génère les données sécurisées pour le QR code
 */
async function generateSecureQRData(marchand: Marchand): Promise<string> {
  const merchantData = {
    id: marchand.id,
    nom: `${marchand.nom.toUpperCase()} ${marchand.prenom}`,
    cin: marchand.numCIN,
    tel: marchand.numTel1 || "-",
    activite: marchand.activite || "-",
    place: marchand.places?.[0]?.nom || "Non assignée",
    marche: marchand.places?.[0]?.marcheeName || "-",
    zone: marchand.places?.[0]?.zoneName || "-",
    hall: marchand.places?.[0]?.salleName || "-",
    categorie: marchand.places?.[0]?.categorieName || "-",
    date: formatDate(marchand.dateEnregistrement),
  };

  const dataString = JSON.stringify(merchantData);
  const signature = await generateSignature(dataString);

  // Structure finale avec versioning et timestamp
  return JSON.stringify({
    v: "1.0", // Version du format
    data: merchantData,
    sig: signature,
    ts: Date.now(), // Timestamp pour traçabilité
  });
}

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

// =============================
// UTILITAIRE
// =============================
const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("fr-FR") : "Non renseignée";

// =====================================================================
// ⚡ COMPOSANT HD — CARTE 3150 × 4440 px (VERSION IMPRESSION EXPORT)
// =====================================================================
const MerchantCardHD: React.FC<{
  marchand: Marchand;
  templateUrl: string;
  secureQRData: string;
}> = ({ marchand, templateUrl, secureQRData }) => {
  // Extraction de la signature pour affichage
  const qrPayload = JSON.parse(secureQRData);
  const signature = qrPayload.sig;

  return (
    <div
      id={`card-hd-${marchand.id}`}
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

      {/* PLACE */}
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
        {marchand.places?.[0]?.nom + "-" + marchand.places?.[0]?.salleName || "-"}
      </div>

      {/* ACTIVITE */}
      <div
        style={{
          position: "absolute",
          left: "1680px",
          top: "2030px",
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
          top: "2500px",
          fontSize: "120px",
          fontWeight: "semi-bold",
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
          top: "2955px",
          fontSize: "160px",
          fontWeight: "bold",
          color: "#000",
        }}
      >
        {marchand.stat || " "}
      </div>

      {/* NIF */}
      <div
        style={{
          position: "absolute",
          left: "280px",
          top: "2655px",
          fontSize: "160px",
          fontWeight: "semi-bold",
          color: "#000",
        }}
      >
        {marchand.nif || " "}
      </div>

      {/* TELEPHONE */}
      <div
        style={{
          position: "absolute",
          left: "280px",
          top: "3300px",
          fontSize: "160px",
          fontWeight: "semi-bold",
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
        {/* Numéro de sécurité visible */}
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
          top: `${980 * scale}px`,
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
          top: `${1380 * scale}px`,
          fontSize: `${120 * scale}px`,
          fontWeight: "bold",
          color: "#000",
          lineHeight: 1,
        }}
      >
        {marchand.places?.[0]?.marcheeName || "-"}
      </div>

      {/* PLACE */}
      <div
        style={{
          position: "absolute",
          left: `${1680 * scale}px`,
          top: `${1680 * scale}px`,
          fontSize: `${120 * scale}px`,
          fontWeight: "bold",
          color: "#000",
          lineHeight: 1,
        }}
      >
        {marchand.places?.[0]?.nom + "-" + marchand.places?.[0]?.salleName || "-"}
      </div>

      {/* ACTIVITE */}
      <div
        style={{
          position: "absolute",
          left: `${1680 * scale}px`,
          top: `${2030 * scale}px`,
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
          top: `${2300 * scale}px`,
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
          left: `${2410 * scale}px`,
          top: `${2500 * scale}px`,
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
          top: `${2950 * scale}px`,
          fontSize: `${160 * scale}px`,
          fontWeight: "bold",
          color: "#000",
          lineHeight: 1,
        }}
      >
        {marchand.stat || " "}
      </div>

      {/* NIF */}
      <div
        style={{
          position: "absolute",
          left: `${280 * scale}px`,
          top: `${2650 * scale}px`,
          fontSize: `${160 * scale}px`,
          fontWeight: 600,
          color: "#000",
          lineHeight: 1,
        }}
      >
        {marchand.nif || " "}
      </div>

      {/* TELEPHONE */}
      <div
        style={{
          position: "absolute",
          left: `${280 * scale}px`,
          top: `${3300 * scale}px`,
          fontSize: `${160 * scale}px`,
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

  const downloadSelected = async () => {
    if (selected.length === 0) return;

    setIsDownloading(true);

    try {
      const html2canvas = (await import("html2canvas")).default;

      for (const marchand of selected) {
        const el = document.getElementById(`card-hd-${marchand.id}`);
        if (!el) continue;

        const canvas = await html2canvas(el, {
          scale: 1,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
        });

        const a = document.createElement("a");
        a.download = `CARTE_SECURISEE_${marchand.nom}_${marchand.prenom}_${String(
          marchand.id
        ).padStart(4, "0")}.png`;
        a.href = canvas.toDataURL("image/png");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
    } finally {
      setIsDownloading(false);
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
                  ID Marchand: #{String(currentMarchand.id).padStart(4, "0")}
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
                          #{String(m.id).padStart(4, "0")}
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