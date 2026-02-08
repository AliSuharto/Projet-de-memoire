"use client";

import React, { useState, useEffect } from "react";
import { Search, Eye, MapPin, Users, TrendingUp, RefreshCw, Download } from "lucide-react";
import API_BASE_URL from "@/services/APIbaseUrl";
import * as XLSX from 'xlsx-js-style';

// Types
interface Market {
  id: number;
  nom: string;
  adresse: string;
  totalPlaces: number;
  placesOccupees: number;
  tauxOccupation: number;
}

// Composant principal
const MarketsManagement: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Charger les marchés depuis l'API
  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/marchees`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();
      setMarkets(data);
    } catch (error) {
      console.error("Erreur lors du chargement des marchés:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'export Excel avec styles
  const handleExportExcel = () => {
    try {
      setExporting(true);

      // Styles définis
      const styles = {
        header: {
          font: { bold: true, color: { rgb: "FFFFFF" }, size: 16 },
          fill: { fgColor: { rgb: "1F4788" } },
          alignment: { horizontal: "center", vertical: "center" }
        },
        subHeader: {
          font: { italic: true, size: 10 },
          alignment: { horizontal: "left" }
        },
        columnHeader: {
          font: { bold: true, color: { rgb: "FFFFFF" }, size: 11 },
          fill: { fgColor: { rgb: "2E5C8A" } },
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        },
        cellCenter: {
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } }
          }
        },
        cellLeft: {
          alignment: { horizontal: "left", vertical: "center", wrapText: true },
          border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } }
          }
        },
        greenBackground: {
          fill: { fgColor: { rgb: "E8F5E9" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } }
          }
        },
        yellowBackground: {
          fill: { fgColor: { rgb: "FFF9C4" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } }
          }
        },
        redBackground: {
          fill: { fgColor: { rgb: "FFEBEE" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            bottom: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } }
          }
        },
        totalRow: {
          font: { bold: true, size: 11 },
          fill: { fgColor: { rgb: "D3D3D3" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "double", color: { rgb: "000000" } },
            bottom: { style: "double", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        },
        statsHeader: {
          font: { bold: true, color: { rgb: "FFFFFF" }, size: 12 },
          fill: { fgColor: { rgb: "1F4788" } },
          alignment: { horizontal: "center", vertical: "center" }
        },
        statsBold: {
          font: { bold: true }
        },
        percentage: {
          alignment: { horizontal: "center", vertical: "center" },
          numFmt: "0.0%"
        },
        number: {
          alignment: { horizontal: "center", vertical: "center" },
          numFmt: "#,##0"
        }
      };

      // Créer un nouveau classeur
      const wb = XLSX.utils.book_new();

      // === FEUILLE 1: DONNÉES PRINCIPALES ===
      const wsData: any[][] = [];

      // Ligne 1: Titre principal
      wsData.push([{ v: "RAPPORT D'OCCUPATION DES MARCHÉS", t: "s", s: styles.header }]);
      
      // Ligne 2: Date de génération
      wsData.push([{ v: `Généré le : ${new Date().toLocaleString('fr-FR')}`, t: "s", s: styles.subHeader }]);
      
      // Ligne 3: Ligne vide
      wsData.push([]);

      // Ligne 4: En-têtes des colonnes
      wsData.push([
        { v: "N° Réf.", t: "s", s: styles.columnHeader },
        { v: "Nom du Marché", t: "s", s: styles.columnHeader },
        { v: "Adresse", t: "s", s: styles.columnHeader },
        { v: "Places Totales", t: "s", s: styles.columnHeader },
        { v: "Places Occupées", t: "s", s: styles.columnHeader },
        { v: "Places Disponibles", t: "s", s: styles.columnHeader },
        { v: "Taux d'Occupation (%)", t: "s", s: styles.columnHeader }
      ]);

      // Données des marchés avec styles conditionnels
      markets.forEach((market) => {
        const taux = market.tauxOccupation / 100;
        let rowStyle = styles.cellCenter;
        
        // Déterminer la couleur de fond selon le taux
        if (market.tauxOccupation >= 90) {
          rowStyle = styles.greenBackground;
        } else if (market.tauxOccupation >= 70) {
          rowStyle = styles.yellowBackground;
        } else {
          rowStyle = styles.redBackground;
        }

        wsData.push([
          { v: `MCH-${String(market.id).padStart(4, '0')}`, t: "s", s: styles.cellCenter },
          { v: market.nom, t: "s", s: styles.cellLeft },
          { v: market.adresse, t: "s", s: styles.cellLeft },
          { v: market.totalPlaces, t: "n", s: { ...rowStyle, numFmt: "#,##0" } },
          { v: market.placesOccupees, t: "n", s: { ...rowStyle, numFmt: "#,##0" } },
          { v: market.totalPlaces - market.placesOccupees, t: "n", s: { ...rowStyle, numFmt: "#,##0" } },
          { v: taux, t: "n", s: { ...rowStyle, numFmt: "0.0%" } }
        ]);
      });

      // Calculs des totaux
      const totalPlaces = markets.reduce((sum, m) => sum + m.totalPlaces, 0);
      const totalOccupees = markets.reduce((sum, m) => sum + m.placesOccupees, 0);
      const totalDisponibles = totalPlaces - totalOccupees;
      const tauxMoyen = markets.length > 0 
        ? markets.reduce((sum, m) => sum + m.tauxOccupation, 0) / markets.length / 100
        : 0;

      // Ligne vide avant totaux
      wsData.push([]);

      // Ligne de totaux
      wsData.push([
        { v: "", t: "s", s: styles.totalRow },
        { v: "TOTAL GÉNÉRAL", t: "s", s: { ...styles.totalRow, alignment: { horizontal: "right", vertical: "center" } } },
        { v: "", t: "s", s: styles.totalRow },
        { v: totalPlaces, t: "n", s: { ...styles.totalRow, numFmt: "#,##0" } },
        { v: totalOccupees, t: "n", s: { ...styles.totalRow, numFmt: "#,##0" } },
        { v: totalDisponibles, t: "n", s: { ...styles.totalRow, numFmt: "#,##0" } },
        { v: tauxMoyen, t: "n", s: { ...styles.totalRow, numFmt: "0.0%" } }
      ]);

      // Statistiques
      wsData.push([]);
      wsData.push([{ v: "STATISTIQUES", t: "s", s: styles.statsHeader }]);
      wsData.push([
        { v: "Nombre de marchés :", t: "s", s: styles.statsBold },
        { v: markets.length, t: "n", s: styles.number }
      ]);
      wsData.push([
        { v: "Taux d'occupation moyen :", t: "s", s: styles.statsBold },
        { v: tauxMoyen, t: "n", s: { ...styles.percentage, numFmt: "0.0%" } }
      ]);
      wsData.push([
        { v: "Taux maximum :", t: "s", s: styles.statsBold },
        { v: Math.max(...markets.map(m => m.tauxOccupation)) / 100, t: "n", s: { ...styles.percentage, numFmt: "0.0%" } }
      ]);
      wsData.push([
        { v: "Taux minimum :", t: "s", s: styles.statsBold },
        { v: Math.min(...markets.map(m => m.tauxOccupation)) / 100, t: "n", s: { ...styles.percentage, numFmt: "0.0%" } }
      ]);

      // Légende
      wsData.push([]);
      wsData.push([{ v: "LÉGENDE", t: "s", s: styles.statsBold }]);
      wsData.push([
        { v: "●", t: "s", s: { font: { color: { rgb: "4CAF50" }, size: 14 } } },
        { v: "Taux ≥ 90% (Très bonne occupation)", t: "s" }
      ]);
      wsData.push([
        { v: "●", t: "s", s: { font: { color: { rgb: "FBC02D" }, size: 14 } } },
        { v: "Taux 70-89% (Occupation correcte)", t: "s" }
      ]);
      wsData.push([
        { v: "●", t: "s", s: { font: { color: { rgb: "F44336" }, size: 14 } } },
        { v: "Taux < 70% (Sous-occupation)", t: "s" }
      ]);

      // Créer la feuille
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Fusionner les cellules pour le titre
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // Titre principal
        { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }, // Date
        { s: { r: markets.length + 6, c: 0 }, e: { r: markets.length + 6, c: 2 } } // STATISTIQUES
      ];

      // Définir les largeurs de colonnes
      ws['!cols'] = [
        { wch: 12 },  // N° Réf
        { wch: 28 },  // Nom
        { wch: 45 },  // Adresse
        { wch: 14 },  // Places totales
        { wch: 16 },  // Places occupées
        { wch: 18 },  // Places disponibles
        { wch: 22 }   // Taux
      ];

      // Définir les hauteurs de lignes
      ws['!rows'] = [
        { hpt: 30 },  // Ligne 1 - Titre
        { hpt: 20 },  // Ligne 2 - Date
        { hpt: 5 },   // Ligne 3 - Vide
        { hpt: 35 }   // Ligne 4 - En-têtes
      ];

      // Ajouter la feuille au classeur
      XLSX.utils.book_append_sheet(wb, ws, "Données Marchés");

      // === FEUILLE 2: TABLEAU DE BORD ===
      const wsDashboard: any[][] = [];
      
      wsDashboard.push([{ v: "TABLEAU DE BORD - VUE D'ENSEMBLE", t: "s", s: styles.header }]);
      wsDashboard.push([]);
      wsDashboard.push([
        { v: "Indicateur", t: "s", s: styles.columnHeader },
        { v: "Valeur", t: "s", s: styles.columnHeader }
      ]);
      wsDashboard.push([
        { v: "Total Marchés", t: "s", s: styles.cellLeft },
        { v: markets.length, t: "n", s: styles.number }
      ]);
      wsDashboard.push([
        { v: "Total Places", t: "s", s: styles.cellLeft },
        { v: totalPlaces, t: "n", s: styles.number }
      ]);
      wsDashboard.push([
        { v: "Places Occupées", t: "s", s: styles.cellLeft },
        { v: totalOccupees, t: "n", s: styles.number }
      ]);
      wsDashboard.push([
        { v: "Places Disponibles", t: "s", s: styles.cellLeft },
        { v: totalDisponibles, t: "n", s: styles.number }
      ]);
      wsDashboard.push([
        { v: "Taux Moyen d'Occupation", t: "s", s: styles.cellLeft },
        { v: tauxMoyen, t: "n", s: { ...styles.percentage, numFmt: "0.0%" } }
      ]);
      wsDashboard.push([]);
      wsDashboard.push([{ v: "RÉPARTITION PAR TAUX D'OCCUPATION", t: "s", s: styles.statsHeader }]);
      
      const excellente = markets.filter(m => m.tauxOccupation >= 90).length;
      const bonne = markets.filter(m => m.tauxOccupation >= 70 && m.tauxOccupation < 90).length;
      const faible = markets.filter(m => m.tauxOccupation < 70).length;

      wsDashboard.push([
        { v: "Excellente (≥90%)", t: "s", s: { ...styles.cellLeft, fill: { fgColor: { rgb: "E8F5E9" } } } },
        { v: excellente, t: "n", s: { ...styles.number, fill: { fgColor: { rgb: "E8F5E9" } } } }
      ]);
      wsDashboard.push([
        { v: "Bonne (70-89%)", t: "s", s: { ...styles.cellLeft, fill: { fgColor: { rgb: "FFF9C4" } } } },
        { v: bonne, t: "n", s: { ...styles.number, fill: { fgColor: { rgb: "FFF9C4" } } } }
      ]);
      wsDashboard.push([
        { v: "Faible (<70%)", t: "s", s: { ...styles.cellLeft, fill: { fgColor: { rgb: "FFEBEE" } } } },
        { v: faible, t: "n", s: { ...styles.number, fill: { fgColor: { rgb: "FFEBEE" } } } }
      ]);

      const wsDash = XLSX.utils.aoa_to_sheet(wsDashboard);
      wsDash['!cols'] = [{ wch: 30 }, { wch: 15 }];
      wsDash['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
        { s: { r: 8, c: 0 }, e: { r: 8, c: 1 } }
      ];
      wsDash['!rows'] = [{ hpt: 30 }];
      
      XLSX.utils.book_append_sheet(wb, wsDash, "Tableau de Bord");

      // === FEUILLE 3: DÉTAIL PAR MARCHÉ ===
      const wsDetail: any[][] = [];
      wsDetail.push([{ v: "DÉTAIL PAR MARCHÉ - ANALYSE COMPLÈTE", t: "s", s: styles.header }]);
      wsDetail.push([]);
      
      markets.forEach((market, index) => {
        if (index > 0) wsDetail.push([]);
        
        wsDetail.push([{ v: `MARCHÉ ${index + 1}: ${market.nom}`, t: "s", s: styles.statsHeader }]);
        wsDetail.push([
          { v: "Référence", t: "s", s: styles.statsBold },
          { v: `MCH-${String(market.id).padStart(4, '0')}`, t: "s" }
        ]);
        wsDetail.push([
          { v: "Adresse", t: "s", s: styles.statsBold },
          { v: market.adresse, t: "s", s: { alignment: { wrapText: true } } }
        ]);
        wsDetail.push([
          { v: "Places Totales", t: "s", s: styles.statsBold },
          { v: market.totalPlaces, t: "n", s: styles.number }
        ]);
        wsDetail.push([
          { v: "Places Occupées", t: "s", s: styles.statsBold },
          { v: market.placesOccupees, t: "n", s: styles.number }
        ]);
        wsDetail.push([
          { v: "Places Disponibles", t: "s", s: styles.statsBold },
          { v: market.totalPlaces - market.placesOccupees, t: "n", s: styles.number }
        ]);
        wsDetail.push([
          { v: "Taux d'Occupation", t: "s", s: styles.statsBold },
          { v: market.tauxOccupation / 100, t: "n", s: { ...styles.percentage, numFmt: "0.0%" } }
        ]);
        
        let evaluation = "";
        let evalStyle = styles.cellLeft;
        if (market.tauxOccupation >= 90) {
          evaluation = "Excellente occupation";
          evalStyle = { ...styles.cellLeft, fill: { fgColor: { rgb: "E8F5E9" } }, font: { bold: true } };
        } else if (market.tauxOccupation >= 70) {
          evaluation = "Bonne occupation";
          evalStyle = { ...styles.cellLeft, fill: { fgColor: { rgb: "FFF9C4" } }, font: { bold: true } };
        } else {
          evaluation = "Sous-occupation - Action requise";
          evalStyle = { ...styles.cellLeft, fill: { fgColor: { rgb: "FFEBEE" } }, font: { bold: true } };
        }
        
        wsDetail.push([
          { v: "Évaluation", t: "s", s: styles.statsBold },
          { v: evaluation, t: "s", s: evalStyle }
        ]);
      });

      const wsDetailSheet = XLSX.utils.aoa_to_sheet(wsDetail);
      wsDetailSheet['!cols'] = [{ wch: 25 }, { wch: 50 }];
      wsDetailSheet['!rows'] = [{ hpt: 30 }];
      
      XLSX.utils.book_append_sheet(wb, wsDetailSheet, "Détail par Marché");

      // Générer le fichier Excel
      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Rapport_Marches_${date}.xlsx`);

      console.log("✅ Export Excel réussi!");
    } catch (error) {
      console.error("❌ Erreur lors de l'export Excel:", error);
      alert("Une erreur est survenue lors de l'export. Veuillez réessayer.");
    } finally {
      setExporting(false);
    }
  };

  // Navigation vers les détails d'un marché
  const handleViewMarket = (marketId: number) => {
    window.location.href = `/dashboard/ordo/marchee/${marketId}`;
  };

  // Filtrage par recherche
  const filteredMarkets = markets.filter(market =>
    market.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistiques
  const totalMarkets = markets.length;
  const totalPlaces = markets.reduce((sum, m) => sum + m.totalPlaces, 0);
  const totalOccupees = markets.reduce((sum, m) => sum + m.placesOccupees, 0);
  const avgOccupation = markets.length > 0 
    ? Math.round(markets.reduce((sum, m) => sum + m.tauxOccupation, 0) / markets.length)
    : 0;

  const getOccupationColor = (rate: number) => {
    if (rate >= 90) return "text-green-600 bg-green-50";
    if (rate >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getOccupationBorderColor = (rate: number) => {
    if (rate >= 90) return "border-green-200";
    if (rate >= 70) return "border-yellow-200";
    return "border-red-200";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-1 pt-20 md:pt-6">
      {/* En-tête administratif */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Direction des Marchés Communaux
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Commune Urbaine de Diego Suarez - Service de Gestion des Marchés
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Bouton Export Excel */}
              <button
                onClick={handleExportExcel}
                disabled={exporting || loading || markets.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className={`w-4 h-4 ${exporting ? 'animate-bounce' : ''}`} />
                {exporting ? 'Export en cours...' : 'Exporter Excel'}
              </button>

              {/* Bouton Actualiser */}
              <button
                onClick={loadMarkets}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Marchés</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalMarkets}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Places Totales</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalPlaces}</p>
                <p className="text-xs text-gray-500 mt-1">{totalOccupees} occupées</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupation Moyenne</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{avgOccupation}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un marché par nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              {filteredMarkets.length} résultat{filteredMarkets.length > 1 ? 's' : ''} trouvé{filteredMarkets.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Liste des marchés */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* En-tête du tableau */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Registre des Marchés Communaux
            </h2>
          </div>

          {/* Tableau */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    N° Réf.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Marché
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Places
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Places Occupées
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Taux d'Occupation
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                        <p className="text-gray-600">Chargement des marchés...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredMarkets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Search className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="font-medium">Aucun marché trouvé</p>
                        <p className="text-sm mt-1">
                          {searchTerm 
                            ? "Essayez de modifier votre recherche" 
                            : "Aucun marché enregistré"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMarkets.map((market) => (
                    <tr 
                      key={market.id} 
                      onClick={() => handleViewMarket(market.id)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-600">
                          MCH-{String(market.id).padStart(4, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{market.nom}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {market.adresse}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-16 h-8 bg-blue-50 text-blue-700 font-semibold rounded-md text-sm">
                          {market.totalPlaces}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-16 h-8 bg-gray-50 text-gray-700 font-semibold rounded-md text-sm">
                          {market.placesOccupees}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getOccupationColor(market.tauxOccupation)} ${getOccupationBorderColor(market.tauxOccupation)}`}>
                          <span className="font-semibold text-sm">
                            {market.tauxOccupation.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleViewMarket(market.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pied de tableau */}
          {!loading && filteredMarkets.length > 0 && (
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
              <p className="text-sm text-gray-600">
                Affichage de <span className="font-semibold">{filteredMarkets.length}</span> marché{filteredMarkets.length > 1 ? 's' : ''} sur <span className="font-semibold">{totalMarkets}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketsManagement;