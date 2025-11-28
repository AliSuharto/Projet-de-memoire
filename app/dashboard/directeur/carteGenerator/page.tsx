"use client";

import React, { useState } from "react";
import { X, Download, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

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
// ⚡⚡⚡ COMPOSANT HD — CARTE 3150 × 4440 px (VERSION IMPRESSION EXPORT)
// =====================================================================
const MerchantCardHD: React.FC<{
  marchand: Marchand;
  templateUrl: string;
}> = ({ marchand, templateUrl }) => {
  const qrData = JSON.stringify({
    id: marchand.id,
    nom: `${marchand.nom.toUpperCase()} ${marchand.prenom}`,
    cin: marchand.numCIN,
    tel: marchand.numTel1 || "-",
    activite: marchand.activite || "-",
    place: marchand.places?.[0]?.nom || "Non assignée",
    marche: marchand.places?.[0]?.marcheeName || "-",
    zone: marchand.places?.[0]?.zoneName || "-",
    hall: marchand.places?.[0]?.salleName || "-",
    date: formatDate(marchand.dateEnregistrement),
  });

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
      {/* ============================================================== */}
      {/* NOM + PRENOM — 828 x, 1393 y — Couleur BLEUE                   */}
      {/* ============================================================== */}
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
        {marchand.nom.toUpperCase()} {marchand.prenom.toUpperCase()}
      </div>

      {/* ============================================================== */}
      {/* Marche — 1242 x, 2037 y — Noir                               */}
      {/* ============================================================== */}
      <div
        style={{
          position: "absolute",
          left: "1680px",
          top: "1380px",
          fontSize: "120px",
          fontWeight: "bold",
          textTransform: "uppercase",
          color: "#000",
        }}
      >
         { marchand.places?.[0]?.marcheeName || "-"}
      </div>

      {/* ============================================================== */}
      {/* Place — 1242 x, 2037 y — Noir                               */}
      {/* ============================================================== */}
      <div
        style={{
          position: "absolute",
          left: "1680px",
          top: "1680px",
          fontSize: "120px",
          fontWeight: "bold",
          textTransform: "uppercase",
          color: "#000",
        }}
      >
         { marchand.places?.[0]?.nom+"-"+marchand.places?.[0]?.salleName || "-"}
      </div>

      {/* ============================================================== */}
      {/* ACTIVITE — 1242 x, 2037 y — Noir                               */}
      {/* ============================================================== */}
      <div
        style={{
          position: "absolute",
          left: "1680px",
          top: "2030px",
          fontSize: "120px",
          fontWeight: "bold",
          textTransform: "uppercase",
          color: "#000",
        }}
      >
         {marchand.activite || "-"}
      </div>

      {/* ============================================================== */}
      {/* CIN — 1242 x, 2037 y — Noir                               */}
      {/* ============================================================== */}
      <div
        style={{
          position: "absolute",
          left: "1680px",
          top: "2300px",
          fontSize: "120px",
          fontWeight: "bold",
          textTransform: "uppercase",
          color: "#000",
        }}
      >
         {marchand.numCIN || "-"}
      </div>

      {/* ============================================================== */}
      {/* Categorie — 1242 x, 2037 y — Noir                               */}
      {/* ============================================================== */}
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

      {/* ============================================================== */}
      {/* STAT — position au-dessus du NIF                               */}
      {/* ============================================================== */}
      <div
        style={{
          position: "absolute",
          left: "280px",
          top: "3300px",
          fontSize: "160px",
          fontWeight: "bold",
          color: "#000",
        }}
      >
       {marchand.stat || " "}
      </div>
      
      {/* ============================================================== */}
      {/* NIF — juste sous STAT                                          */}
      {/* ============================================================== */}
      <div
        style={{
          position: "absolute",
          left: "280px",
          top: "3400px",
          fontSize: "160px",
          fontWeight: "semi-bold",
          color: "#000",
        }}
      >
       {marchand.nif || " "}
      </div>

      {/* ============================================================== */}
      {/* TELEPHONE — 280 x, 3493 y — Noir                               */}
      {/* ============================================================== */}
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

      {/* ============================================================== */}
      {/* QR CODE — BAS DROITE — 1489 × 1393 px                           */}
      {/* ============================================================== */}
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
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <QRCodeSVG
          value={qrData}
          size={1380}
          level="H"
          style={{
            transform: "scaleX(1462 / 1380)",
            transformOrigin: "center",
            display: "block",
          }}
        />
      </div>
    </div>
  );
};

// =====================================================================
// ⚡⚡⚡ VERSION PREVIEW - MÊME STYLE QUE HD MAIS RÉDUITE
// =====================================================================
const MerchantCardPreview: React.FC<{
  marchand: Marchand;
  templateUrl: string;
}> = ({ marchand, templateUrl }) => {
  const qrData = JSON.stringify({
    id: marchand.id,
    nom: `${marchand.nom.toUpperCase()} ${marchand.prenom}`,
    cin: marchand.numCIN,
    tel: marchand.numTel1 || "-",
    activite: marchand.activite || "-",
    place: marchand.places?.[0]?.nom || "Non assignée",
    marche: marchand.places?.[0]?.marcheeName || "-",
    zone: marchand.places?.[0]?.zoneName || "-",
    hall: marchand.places?.[0]?.salleName || "-",
    date: formatDate(marchand.dateEnregistrement),
  });

  // Facteur de réduction pour l'affichage
  const scale = 0.15; // 15% de la taille originale

  return (
    <div
      className="relative bg-white rounded-xl shadow-2xl overflow-hidden border-8 border-white"
      style={{
        width: `${3150 * scale}px`,
        height: `${4440 * scale}px`,
        minWidth: `${3150 * scale}px`,
        background: `url(${templateUrl}) center/cover no-repeat`,
        fontFamily: "Arial, sans-serif",
      }}
    >
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
        {marchand.nom.toUpperCase()} {marchand.prenom.toUpperCase()}
      </div>

      {/* MARCHE */}
      <div
        style={{
          position: "absolute",
          left: `${1680 * scale}px`,
          top: `${1380 * scale}px`,
          fontSize: `${120 * scale}px`,
          fontWeight: "bold",
          textTransform: "uppercase",
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
          textTransform: "uppercase",
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
          textTransform: "uppercase",
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
          textTransform: "uppercase",
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
          top: `${3300 * scale}px`,
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
          top: `${3400 * scale}px`,
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

      {/* QR CODE */}
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
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <QRCodeSVG
          value={qrData}
          size={1380 * scale}
          level="H"
          style={{
            transform: `scaleX(${1462 / 1380})`,
            transformOrigin: "center",
            display: "block",
          }}
        />
      </div>
    </div>
  );
};

// =====================================================================
//   ⚡⚡⚡ COMPOSANT PRINCIPAL AVEC CARTE CENTRÉE
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

  const selected = marchands.filter((m) => selectedIds.includes(m.id));

  // Selection
  const toggle = (id: number) =>
    setSelectedIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const toggleAll = () =>
    setSelectedIds(
      selectedIds.length === marchands.length ? [] : marchands.map((m) => m.id)
    );

  // Téléchargement multiple
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
        a.download = `CARTE_${marchand.nom}_${marchand.prenom}_${String(marchand.id).padStart(4, "0")}.png`;
        a.href = canvas.toDataURL("image/png");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Petit délai entre chaque téléchargement
        await new Promise(resolve => setTimeout(resolve, 300));
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

  return (
    <>
      {/* MODAL AVEC CARTE CENTRÉE */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
          {/* HEADER */}
          <div className="flex justify-between items-center p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Générer les cartes</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selected.length} carte(s) sélectionnée(s) sur {marchands.length}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleAll}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {selected.length === marchands.length ? "Tout désélectionner" : "Tout sélectionner"}
              </button>

              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* CONTROLES */}
          <div className="p-4 bg-blue-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Template:</span>
                <input
                  type="text"
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-80"
                  placeholder="URL du template de carte"
                />
              </div>

              <button
                onClick={downloadSelected}
                disabled={isDownloading || selected.length === 0}
                className="px-6 py-3 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Download size={20} />
                {isDownloading ? "Téléchargement..." : `Télécharger ${selected.length} carte(s)`}
              </button>
            </div>
          </div>

          {/* ZONE DE PREVIEW CENTRÉE */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="flex flex-col items-center space-y-8">
              {marchands.map((m) => (
                <div key={m.id} className="relative w-full flex flex-col items-center">
                  {/* BOUTON SELECTION */}
                  <button
                    onClick={() => toggle(m.id)}
                    className={`absolute -top-4 -left-4 z-10 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
                      selectedIds.includes(m.id)
                        ? "bg-green-500 text-white border-2 border-white"
                        : "bg-white border-2 border-gray-400"
                    }`}
                  >
                    {selectedIds.includes(m.id) && <Check size={24} />}
                  </button>

                  {/* CARTE CENTRÉE */}
                  <div className="flex flex-col items-center">
                    <MerchantCardPreview marchand={m} templateUrl={template} />
                    
                    {/* INFORMATIONS DU MARCHAND */}
                    <div className="mt-4 text-center">
                      <p className="font-semibold text-gray-800 text-lg">
                        {m.nom} {m.prenom}
                      </p>
                      <p className="text-sm text-gray-600">
                        {m.places?.[0]?.marcheeName || "Non assigné"} • {m.activite || "Non spécifié"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        CIN: {m.numCIN} • Tél: {m.numTel1 || "Non renseigné"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CARTES HD INVISIBLES POUR EXPORT */}
      <div style={{ position: "absolute", top: "-99999px", left: "-99999px" }}>
        {marchands.map((m) => (
          <MerchantCardHD
            key={`hd-${m.id}`}
            marchand={m}
            templateUrl={template}
          />
        ))}
      </div>
    </>
  );
};

export default MerchantCardGenerator;