import * as XLSX from 'xlsx-js-style';

interface Place {
  id: number;
  nom: string;
  statut: 'Libre' | 'Occupée';
  nomMarchand?: string;
  statutMarchand?: string;
}

interface Hall {
  id: number;
  nom: string;
  nbrPlace: number;
  placeLibre: number;
  placeOccupe: number;
  place: Place[];
}

interface Zone {
  id: number;
  nom: string;
  nbrPlace: number;
  placeLibre: number;
  placeOccupe: number;
  hall: Hall[];
  place: Place[];
}

interface MarcheeData {
  id: number;
  nom: string;
  adresse: string;
  nbrPlace: number;
  placeLibre: number;
  placeOccupe: number;
  occupationRate: number;
  zone: Zone[];
  hall: Hall[];
  place: Place[];
}

// Fonction helper pour obtenir le style selon le taux d'occupation
function getOccupationStyle(taux: number) {
  if (taux < 50) {
    return {
      font: { sz: 14, bold: true, color: { rgb: "FFFFFF" }, name: "Calibri" },
      fill: { fgColor: { rgb: "70AD47" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "medium", color: { rgb: "548235" } },
        bottom: { style: "medium", color: { rgb: "548235" } },
        left: { style: "medium", color: { rgb: "548235" } },
        right: { style: "medium", color: { rgb: "548235" } }
      }
    };
  } else if (taux < 80) {
    return {
      font: { sz: 14, bold: true, color: { rgb: "FFFFFF" }, name: "Calibri" },
      fill: { fgColor: { rgb: "F39C12" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "medium", color: { rgb: "D68910" } },
        bottom: { style: "medium", color: { rgb: "D68910" } },
        left: { style: "medium", color: { rgb: "D68910" } },
        right: { style: "medium", color: { rgb: "D68910" } }
      }
    };
  } else {
    return {
      font: { sz: 14, bold: true, color: { rgb: "FFFFFF" }, name: "Calibri" },
      fill: { fgColor: { rgb: "E74C3C" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "medium", color: { rgb: "C0392B" } },
        bottom: { style: "medium", color: { rgb: "C0392B" } },
        left: { style: "medium", color: { rgb: "C0392B" } },
        right: { style: "medium", color: { rgb: "C0392B" } }
      }
    };
  }
}

// Styles améliorés
const styles = {
  // Titre principal - Grand header bleu foncé
  titleMain: {
    font: { bold: true, sz: 24, color: { rgb: "FFFFFF" }, name: "Calibri" },
    fill: { fgColor: { rgb: "0F4C81" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "medium", color: { rgb: "0F4C81" } },
      bottom: { style: "medium", color: { rgb: "0F4C81" } },
      left: { style: "medium", color: { rgb: "0F4C81" } },
      right: { style: "medium", color: { rgb: "0F4C81" } }
    }
  },
  
  // Sections principales
  sectionHeader: {
    font: { bold: true, sz: 16, color: { rgb: "FFFFFF" }, name: "Calibri" },
    fill: { fgColor: { rgb: "2E75B5" } },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top: { style: "medium", color: { rgb: "2E75B5" } },
      bottom: { style: "medium", color: { rgb: "2E75B5" } },
      left: { style: "medium", color: { rgb: "2E75B5" } },
      right: { style: "medium", color: { rgb: "2E75B5" } }
    }
  },
  
  // En-têtes de tableaux
  tableHeader: {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12, name: "Calibri" },
    fill: { fgColor: { rgb: "4472C4" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "medium", color: { rgb: "2E5C8A" } },
      bottom: { style: "medium", color: { rgb: "2E5C8A" } },
      left: { style: "thin", color: { rgb: "FFFFFF" } },
      right: { style: "thin", color: { rgb: "FFFFFF" } }
    }
  },
  
  // Carte statistique - Label
  statCardLabel: {
    font: { bold: true, sz: 11, color: { rgb: "FFFFFF" }, name: "Calibri" },
    fill: { fgColor: { rgb: "4472C4" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "medium", color: { rgb: "2E5C8A" } },
      left: { style: "medium", color: { rgb: "2E5C8A" } },
      right: { style: "medium", color: { rgb: "2E5C8A" } }
    }
  },
  
  // Carte statistique - Valeur
  statCardValue: {
    font: { bold: true, sz: 20, color: { rgb: "2E75B5" }, name: "Calibri" },
    fill: { fgColor: { rgb: "FFFFFF" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      bottom: { style: "medium", color: { rgb: "2E5C8A" } },
      left: { style: "medium", color: { rgb: "2E5C8A" } },
      right: { style: "medium", color: { rgb: "2E5C8A" } }
    }
  },
  
  // Info - Label
  infoLabel: {
    font: { bold: true, sz: 11, color: { rgb: "2E75B5" }, name: "Calibri" },
    fill: { fgColor: { rgb: "E7E6E6" } },
    alignment: { horizontal: "right", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "BFBFBF" } },
      bottom: { style: "thin", color: { rgb: "BFBFBF" } },
      left: { style: "thin", color: { rgb: "BFBFBF" } },
      right: { style: "thin", color: { rgb: "BFBFBF" } }
    }
  },
  
  // Info - Valeur
  infoValue: {
    font: { sz: 11, name: "Calibri" },
    fill: { fgColor: { rgb: "FFFFFF" } },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "BFBFBF" } },
      bottom: { style: "thin", color: { rgb: "BFBFBF" } },
      left: { style: "thin", color: { rgb: "BFBFBF" } },
      right: { style: "thin", color: { rgb: "BFBFBF" } }
    }
  },
  
  // Cellule libre - Vert
  cellLibre: {
    font: { sz: 11, bold: true, color: { rgb: "FFFFFF" }, name: "Calibri" },
    fill: { fgColor: { rgb: "70AD47" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "548235" } },
      bottom: { style: "thin", color: { rgb: "548235" } },
      left: { style: "thin", color: { rgb: "548235" } },
      right: { style: "thin", color: { rgb: "548235" } }
    }
  },
  
  // Cellule occupée - Rouge
  cellOccupe: {
    font: { sz: 11, bold: true, color: { rgb: "FFFFFF" }, name: "Calibri" },
    fill: { fgColor: { rgb: "E74C3C" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "C0392B" } },
      bottom: { style: "thin", color: { rgb: "C0392B" } },
      left: { style: "thin", color: { rgb: "C0392B" } },
      right: { style: "thin", color: { rgb: "C0392B" } }
    }
  },
  
  // Cellule normale
  cellNormal: {
    font: { sz: 11, name: "Calibri" },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "D9D9D9" } },
      bottom: { style: "thin", color: { rgb: "D9D9D9" } },
      left: { style: "thin", color: { rgb: "D9D9D9" } },
      right: { style: "thin", color: { rgb: "D9D9D9" } }
    }
  },
  
  // Cellule centrée
  cellCenter: {
    font: { sz: 11, name: "Calibri" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "D9D9D9" } },
      bottom: { style: "thin", color: { rgb: "D9D9D9" } },
      left: { style: "thin", color: { rgb: "D9D9D9" } },
      right: { style: "thin", color: { rgb: "D9D9D9" } }
    }
  },
  
  // Titre de zone/hall
  zoneTitle: {
    font: { bold: true, sz: 14, color: { rgb: "FFFFFF" }, name: "Calibri" },
    fill: { fgColor: { rgb: "5B9BD5" } },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      top: { style: "medium", color: { rgb: "2E75B5" } },
      bottom: { style: "medium", color: { rgb: "2E75B5" } },
      left: { style: "medium", color: { rgb: "2E75B5" } },
      right: { style: "medium", color: { rgb: "2E75B5" } }
    }
  }
};

export function generateMarcheeExcelReport(marchee: MarcheeData) {
  const wb = XLSX.utils.book_new();
  
  // === FEUILLE 1: TABLEAU DE BORD ===
  createDashboardSheet(wb, marchee);
  
  // === FEUILLE 2: DÉTAILS PAR ZONE ===
  createZonesDetailSheet(wb, marchee);
  
  // === FEUILLE 3: DÉTAILS PAR HALL ===
  createHallsDetailSheet(wb, marchee);
  
  // === FEUILLE 4: LISTE COMPLÈTE ===
  createPlacesListSheet(wb, marchee);
  
  // Générer le fichier
  const fileName = `Rapport_${marchee.nom.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

function createDashboardSheet(wb: XLSX.WorkBook, marchee: MarcheeData) {
  const data: any[][] = [];
  let row = 0;
  
  // === EN-TÊTE PRINCIPAL ===
  data[row] = ['TABLEAU DE BORD - GESTION DU MARCHÉ'];
  row += 2;
  
  // === INFORMATIONS DU MARCHÉ ===
  data[row] = ['📍 INFORMATIONS GÉNÉRALES'];
  row++;
  data[row] = ['Nom du marché:', marchee.nom, '', '', '', '', '', ''];
  row++;
  data[row] = ['Adresse:', marchee.adresse, '', '', '', '', '', ''];
  row++;
  data[row] = ['Date du rapport:', new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  }), '', '', '', '', '', ''];
  row += 2;
  
  // === STATISTIQUES GLOBALES - CARTES ===
  data[row] = ['📊 STATISTIQUES GLOBALES'];
  row++;
  
  // Labels des cartes
  data[row] = ['TOTAL PLACES', 'PLACES LIBRES', 'PLACES OCCUPÉES', 'TAUX OCCUPATION', 'ZONES', 'HALLS'];
  row++;
  
  // Valeurs des cartes
  data[row] = [
    marchee.nbrPlace,
    marchee.placeLibre,
    marchee.placeOccupe,
    `${marchee.occupationRate}%`,
    marchee.zone.length,
    marchee.zone.reduce((acc, z) => acc + z.hall.length, 0) + marchee.hall.length
  ];
  row += 2;
  
  // === GRAPHIQUE - RÉPARTITION GLOBALE ===
  data[row] = ['📈 RÉPARTITION DES PLACES'];
  row++;
  data[row] = ['Statut', 'Nombre', 'Pourcentage'];
  row++;
  data[row] = ['Libres', marchee.placeLibre, `${Math.round((marchee.placeLibre / marchee.nbrPlace) * 100)}%`];
  row++;
  data[row] = ['Occupées', marchee.placeOccupe, `${marchee.occupationRate}%`];
  row += 2;
  
  // === PERFORMANCE PAR ZONE ===
  data[row] = ['🏢 PERFORMANCE PAR ZONE'];
  row++;
  data[row] = ['Zone', 'Total', 'Libres', 'Occupées', 'Taux', 'Halls', 'Performance'];
  row++;
  
  marchee.zone.forEach(zone => {
    const taux = Math.round((zone.placeOccupe / zone.nbrPlace) * 100);
    const perf = taux < 50 ? '🟢 Faible' : taux < 80 ? '🟡 Moyenne' : '🔴 Élevée';
    data[row] = [
      zone.nom,
      zone.nbrPlace,
      zone.placeLibre,
      zone.placeOccupe,
      `${taux}%`,
      zone.hall.length,
      perf
    ];
    row++;
  });
  
  row += 2;
  
  // === HALLS INDÉPENDANTS ===
  if (marchee.hall.length > 0) {
    data[row] = ['🏛️ HALLS INDÉPENDANTS'];
    row++;
    data[row] = ['Hall', 'Total', 'Libres', 'Occupées', 'Taux', 'Performance'];
    row++;
    
    marchee.hall.forEach(hall => {
      const taux = Math.round((hall.placeOccupe / hall.nbrPlace) * 100);
      const perf = taux < 50 ? '🟢 Faible' : taux < 80 ? '🟡 Moyenne' : '🔴 Élevée';
      data[row] = [
        hall.nom,
        hall.nbrPlace,
        hall.placeLibre,
        hall.placeOccupe,
        `${taux}%`,
        perf
      ];
      row++;
    });
  }
  
  // Créer la feuille
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Largeurs optimales
  ws['!cols'] = [
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 15 },
    { wch: 18 },
    { wch: 5 }
  ];
  
  // Hauteurs de lignes
  ws['!rows'] = [];
  ws['!rows'][0] = { hpt: 35 }; // Titre principal
  ws['!rows'][2] = { hpt: 25 }; // Section headers
  ws['!rows'][7] = { hpt: 25 };
  
  // === APPLIQUER LES STYLES ===
  
  // Titre principal
  if (ws['A1']) {
    ws['A1'].s = styles.titleMain;
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];
  }
  
  // Section "Informations générales"
  if (ws['A3']) {
    ws['A3'].s = styles.sectionHeader;
    ws['!merges'] = ws['!merges'] || [];
    ws['!merges'].push({ s: { r: 2, c: 0 }, e: { r: 2, c: 7 } });
  }
  
  // Info labels et values
  ['A4', 'A5', 'A6'].forEach((cell, idx) => {
    if (ws[cell]) ws[cell].s = styles.infoLabel;
    const valCell = String.fromCharCode(66 + idx % 2) + (4 + idx); // B4, B5, B6
    if (ws[valCell]) {
      ws[valCell].s = styles.infoValue;
      ws['!merges'] = ws['!merges'] || [];
      ws['!merges'].push({ s: { r: 3 + idx, c: 1 }, e: { r: 3 + idx, c: 7 } });
    }
  });
  
  // Section "Statistiques globales"
  if (ws['A8']) {
    ws['A8'].s = styles.sectionHeader;
    ws['!merges'] = ws['!merges'] || [];
    ws['!merges'].push({ s: { r: 7, c: 0 }, e: { r: 7, c: 7 } });
  }
  
  // Cartes statistiques - Labels (ligne 9)
  ['A9', 'B9', 'C9', 'D9', 'E9', 'F9'].forEach(cell => {
    if (ws[cell]) ws[cell].s = styles.statCardLabel;
  });
  
  // Cartes statistiques - Valeurs (ligne 10)
  ['A10', 'B10', 'C10', 'E10', 'F10'].forEach(cell => {
    if (ws[cell]) ws[cell].s = styles.statCardValue;
  });
  
  // Taux d'occupation avec couleur selon le taux
  if (ws['D10']) {
    ws['D10'].s = getOccupationStyle(marchee.occupationRate);
  }
  
  // Section "Répartition des places"
  if (ws['A12']) {
    ws['A12'].s = styles.sectionHeader;
    ws['!merges'] = ws['!merges'] || [];
    ws['!merges'].push({ s: { r: 11, c: 0 }, e: { r: 11, c: 7 } });
  }
  
  // Headers du graphique
  ['A13', 'B13', 'C13'].forEach(cell => {
    if (ws[cell]) ws[cell].s = styles.tableHeader;
  });
  
  // Données du graphique
  if (ws['A14']) ws['A14'].s = styles.cellLibre;
  if (ws['B14']) ws['B14'].s = styles.cellCenter;
  if (ws['C14']) ws['C14'].s = styles.cellCenter;
  
  if (ws['A15']) ws['A15'].s = styles.cellOccupe;
  if (ws['B15']) ws['B15'].s = styles.cellCenter;
  if (ws['C15']) ws['C15'].s = styles.cellCenter;
  
  // Section "Performance par zone"
  if (ws['A17']) {
    ws['A17'].s = styles.sectionHeader;
    ws['!merges'] = ws['!merges'] || [];
    ws['!merges'].push({ s: { r: 16, c: 0 }, e: { r: 16, c: 7 } });
  }
  
  // Headers
  ['A18', 'B18', 'C18', 'D18', 'E18', 'F18', 'G18'].forEach(cell => {
    if (ws[cell]) ws[cell].s = styles.tableHeader;
  });
  
  // Données des zones (lignes 19+)
  for (let i = 0; i < marchee.zone.length; i++) {
    const zoneRow = 19 + i;
    const zone = marchee.zone[i];
    const taux = Math.round((zone.placeOccupe / zone.nbrPlace) * 100);
    
    if (ws[`A${zoneRow}`]) ws[`A${zoneRow}`].s = styles.cellNormal;
    if (ws[`B${zoneRow}`]) ws[`B${zoneRow}`].s = styles.cellCenter;
    if (ws[`C${zoneRow}`]) ws[`C${zoneRow}`].s = styles.cellCenter;
    if (ws[`D${zoneRow}`]) ws[`D${zoneRow}`].s = styles.cellCenter;
    if (ws[`E${zoneRow}`]) ws[`E${zoneRow}`].s = getOccupationStyle(taux);
    if (ws[`F${zoneRow}`]) ws[`F${zoneRow}`].s = styles.cellCenter;
    if (ws[`G${zoneRow}`]) ws[`G${zoneRow}`].s = styles.cellCenter;
  }
  
  // Section halls indépendants si présents
  if (marchee.hall.length > 0) {
    const hallStartRow = 19 + marchee.zone.length + 2;
    
    if (ws[`A${hallStartRow}`]) {
      ws[`A${hallStartRow}`].s = styles.sectionHeader;
      ws['!merges'] = ws['!merges'] || [];
      ws['!merges'].push({ s: { r: hallStartRow - 1, c: 0 }, e: { r: hallStartRow - 1, c: 7 } });
    }
    
    // Headers
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => {
      if (ws[`${col}${hallStartRow + 1}`]) {
        ws[`${col}${hallStartRow + 1}`].s = styles.tableHeader;
      }
    });
    
    // Données
    for (let i = 0; i < marchee.hall.length; i++) {
      const hallRow = hallStartRow + 2 + i;
      const hall = marchee.hall[i];
      const taux = Math.round((hall.placeOccupe / hall.nbrPlace) * 100);
      
      if (ws[`A${hallRow}`]) ws[`A${hallRow}`].s = styles.cellNormal;
      if (ws[`B${hallRow}`]) ws[`B${hallRow}`].s = styles.cellCenter;
      if (ws[`C${hallRow}`]) ws[`C${hallRow}`].s = styles.cellCenter;
      if (ws[`D${hallRow}`]) ws[`D${hallRow}`].s = styles.cellCenter;
      if (ws[`E${hallRow}`]) ws[`E${hallRow}`].s = getOccupationStyle(taux);
      if (ws[`F${hallRow}`]) ws[`F${hallRow}`].s = styles.cellCenter;
    }
  }
  
  XLSX.utils.book_append_sheet(wb, ws, 'Tableau de Bord');
}

function createZonesDetailSheet(wb: XLSX.WorkBook, marchee: MarcheeData) {
  const data: any[][] = [];
  let row = 0;
  
  // Titre
  data[row] = ['DÉTAILS PAR ZONE'];
  row += 2;
  
  marchee.zone.forEach((zone) => {
    // En-tête de zone
    data[row] = [`🏢 ZONE ${zone.nom}`];
    row++;
    data[row] = ['Total:', zone.nbrPlace, '', 'Libres:', zone.placeLibre, '', 'Occupées:', zone.placeOccupe, '', `Taux: ${Math.round((zone.placeOccupe / zone.nbrPlace) * 100)}%`];
    row += 2;
    
    // Halls de la zone
    zone.hall.forEach((hall) => {
      data[row] = [`   Hall ${hall.nom}`];
      row++;
      data[row] = ['Place', 'Statut', 'Marchand', 'Statut Marchand'];
      row++;
      
      hall.place.forEach(place => {
        data[row] = [
          place.nom,
          place.statut,
          place.nomMarchand || '-',
          place.statutMarchand || '-'
        ];
        row++;
      });
      
      row++;
    });
    
    // Places directes de la zone
    if (zone.place.length > 0) {
      data[row] = ['   Places directes de la zone'];
      row++;
      data[row] = ['Place', 'Statut', 'Marchand', 'Statut Marchand'];
      row++;
      
      zone.place.forEach(place => {
        data[row] = [
          place.nom,
          place.statut,
          place.nomMarchand || '-',
          place.statutMarchand || '-'
        ];
        row++;
      });
    }
    
    row += 2;
  });
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  ws['!cols'] = [
    { wch: 25 },
    { wch: 18 },
    { wch: 30 },
    { wch: 25 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 20 }
  ];
  
  // Styles
  if (ws['A1']) {
    ws['A1'].s = styles.titleMain;
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }];
  }
  
  // Appliquer les styles dynamiquement
  let processedRow = 3;
  marchee.zone.forEach((zone) => {
    // Titre zone
    if (ws[`A${processedRow}`]) {
      ws[`A${processedRow}`].s = styles.zoneTitle;
      ws['!merges'] = ws['!merges'] || [];
      ws['!merges'].push({ s: { r: processedRow - 1, c: 0 }, e: { r: processedRow - 1, c: 9 } });
    }
    processedRow++;
    
    // Ligne stats (labels et valeurs alternés)
    for (let col = 0; col < 10; col++) {
      const cell = String.fromCharCode(65 + col) + processedRow;
      if (ws[cell]) {
        ws[cell].s = col % 2 === 0 || col === 9 ? styles.infoLabel : styles.statCardValue;
      }
    }
    processedRow += 2;
    
    // Halls
    zone.hall.forEach((hall) => {
      // Titre hall
      if (ws[`A${processedRow}`]) {
        ws[`A${processedRow}`].s = { ...styles.sectionHeader, fill: { fgColor: { rgb: "8EA9DB" } } };
        ws['!merges'] = ws['!merges'] || [];
        ws['!merges'].push({ s: { r: processedRow - 1, c: 0 }, e: { r: processedRow - 1, c: 3 } });
      }
      processedRow++;
      
      // Headers
      ['A', 'B', 'C', 'D'].forEach(col => {
        if (ws[`${col}${processedRow}`]) ws[`${col}${processedRow}`].s = styles.tableHeader;
      });
      processedRow++;
      
      // Places
      hall.place.forEach(() => {
        if (ws[`A${processedRow}`]) ws[`A${processedRow}`].s = styles.cellNormal;
        if (ws[`B${processedRow}`]) {
          const statut = ws[`B${processedRow}`].v;
          ws[`B${processedRow}`].s = statut === 'Libre' ? styles.cellLibre : styles.cellOccupe;
        }
        if (ws[`C${processedRow}`]) ws[`C${processedRow}`].s = styles.cellNormal;
        if (ws[`D${processedRow}`]) ws[`D${processedRow}`].s = styles.cellNormal;
        processedRow++;
      });
      
      processedRow++;
    });
    
    // Places directes
    if (zone.place.length > 0) {
      if (ws[`A${processedRow}`]) {
        ws[`A${processedRow}`].s = { ...styles.sectionHeader, fill: { fgColor: { rgb: "8EA9DB" } } };
        ws['!merges'] = ws['!merges'] || [];
        ws['!merges'].push({ s: { r: processedRow - 1, c: 0 }, e: { r: processedRow - 1, c: 3 } });
      }
      processedRow++;
      
      ['A', 'B', 'C', 'D'].forEach(col => {
        if (ws[`${col}${processedRow}`]) ws[`${col}${processedRow}`].s = styles.tableHeader;
      });
      processedRow++;
      
      zone.place.forEach(() => {
        if (ws[`A${processedRow}`]) ws[`A${processedRow}`].s = styles.cellNormal;
        if (ws[`B${processedRow}`]) {
          const statut = ws[`B${processedRow}`].v;
          ws[`B${processedRow}`].s = statut === 'Libre' ? styles.cellLibre : styles.cellOccupe;
        }
        if (ws[`C${processedRow}`]) ws[`C${processedRow}`].s = styles.cellNormal;
        if (ws[`D${processedRow}`]) ws[`D${processedRow}`].s = styles.cellNormal;
        processedRow++;
      });
    }
    
    processedRow += 2;
  });
  
  XLSX.utils.book_append_sheet(wb, ws, 'Détails Zones');
}

function createHallsDetailSheet(wb: XLSX.WorkBook, marchee: MarcheeData) {
  const data: any[][] = [];
  let row = 0;
  
  // Titre
  data[row] = ['DÉTAILS PAR HALL'];
  row += 2;
  
  // Collecter tous les halls
  const allHalls: { hall: Hall; zoneName: string }[] = [];
  
  marchee.zone.forEach(zone => {
    zone.hall.forEach(hall => {
      allHalls.push({ hall, zoneName: `Zone ${zone.nom}` });
    });
  });
  
  marchee.hall.forEach(hall => {
    allHalls.push({ hall, zoneName: 'Hall indépendant' });
  });
  
  // Afficher chaque hall
  allHalls.forEach(({ hall, zoneName }) => {
    const taux = Math.round((hall.placeOccupe / hall.nbrPlace) * 100);
    
    // En-tête du hall
    data[row] = [`🏛️ HALL ${hall.nom}`];
    row++;
    data[row] = ['Zone:', zoneName];
    row++;
    data[row] = ['Total:', hall.nbrPlace, '', 'Libres:', hall.placeLibre, '', 'Occupées:', hall.placeOccupe, '', `Taux: ${taux}%`];
    row += 2;
    
    // Tableau des places
    data[row] = ['Place', 'Statut', 'Marchand', 'Statut Marchand'];
    row++;
    
    hall.place.forEach(place => {
      data[row] = [
        place.nom,
        place.statut,
        place.nomMarchand || '-',
        place.statutMarchand || '-'
      ];
      row++;
    });
    
    row += 2;
  });
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  ws['!cols'] = [
    { wch: 25 },
    { wch: 18 },
    { wch: 30 },
    { wch: 25 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 20 }
  ];
  
  // Styles
  if (ws['A1']) {
    ws['A1'].s = styles.titleMain;
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }];
  }
  
  // Appliquer les styles
  let processedRow = 3;
  
  allHalls.forEach(({ hall }) => {
    // Titre hall
    if (ws[`A${processedRow}`]) {
      ws[`A${processedRow}`].s = styles.zoneTitle;
      ws['!merges'] = ws['!merges'] || [];
      ws['!merges'].push({ s: { r: processedRow - 1, c: 0 }, e: { r: processedRow - 1, c: 9 } });
    }
    processedRow++;
    
    // Ligne zone
    if (ws[`A${processedRow}`]) ws[`A${processedRow}`].s = styles.infoLabel;
    if (ws[`B${processedRow}`]) {
      ws[`B${processedRow}`].s = styles.infoValue;
      ws['!merges'] = ws['!merges'] || [];
      ws['!merges'].push({ s: { r: processedRow - 1, c: 1 }, e: { r: processedRow - 1, c: 9 } });
    }
    processedRow++;
    
    // Ligne stats
    for (let col = 0; col < 10; col++) {
      const cell = String.fromCharCode(65 + col) + processedRow;
      if (ws[cell]) {
        ws[cell].s = col % 2 === 0 || col === 9 ? styles.infoLabel : styles.statCardValue;
      }
    }
    processedRow += 2;
    
    // Headers
    ['A', 'B', 'C', 'D'].forEach(col => {
      if (ws[`${col}${processedRow}`]) ws[`${col}${processedRow}`].s = styles.tableHeader;
    });
    processedRow++;
    
    // Places
    hall.place.forEach(() => {
      if (ws[`A${processedRow}`]) ws[`A${processedRow}`].s = styles.cellNormal;
      if (ws[`B${processedRow}`]) {
        const statut = ws[`B${processedRow}`].v;
        ws[`B${processedRow}`].s = statut === 'Libre' ? styles.cellLibre : styles.cellOccupe;
      }
      if (ws[`C${processedRow}`]) ws[`C${processedRow}`].s = styles.cellNormal;
      if (ws[`D${processedRow}`]) ws[`D${processedRow}`].s = styles.cellNormal;
      processedRow++;
    });
    
    processedRow += 2;
  });
  
  XLSX.utils.book_append_sheet(wb, ws, 'Détails Halls');
}

function createPlacesListSheet(wb: XLSX.WorkBook, marchee: MarcheeData) {
  const data: any[][] = [];
  
  // En-têtes
  data[0] = ['LISTE COMPLÈTE DES PLACES'];
  data[1] = [];
  data[2] = ['Zone', 'Hall', 'Place', 'Statut', 'Marchand', 'Statut Marchand'];
  
  let row = 3;
  
  // Collecter toutes les places
  marchee.zone.forEach(zone => {
    zone.hall.forEach(hall => {
      hall.place.forEach(place => {
        data[row] = [
          zone.nom,
          hall.nom,
          place.nom,
          place.statut,
          place.nomMarchand || '-',
          place.statutMarchand || '-'
        ];
        row++;
      });
    });
    
    zone.place.forEach(place => {
      data[row] = [
        zone.nom,
        'Zone directe',
        place.nom,
        place.statut,
        place.nomMarchand || '-',
        place.statutMarchand || '-'
      ];
      row++;
    });
  });
  
  marchee.hall.forEach(hall => {
    hall.place.forEach(place => {
      data[row] = [
        'Aucune',
        hall.nom,
        place.nom,
        place.statut,
        place.nomMarchand || '-',
        place.statutMarchand || '-'
      ];
      row++;
    });
  });
  
  marchee.place.forEach(place => {
    data[row] = [
      'Aucune',
      'Aucun',
      place.nom,
      place.statut,
      place.nomMarchand || '-',
      place.statutMarchand || '-'
    ];
    row++;
  });
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  ws['!cols'] = [
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 30 },
    { wch: 25 }
  ];
  
  // Styles
  if (ws['A1']) {
    ws['A1'].s = styles.titleMain;
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
  }
  
  // En-têtes
  ['A3', 'B3', 'C3', 'D3', 'E3', 'F3'].forEach(cell => {
    if (ws[cell]) ws[cell].s = styles.tableHeader;
  });
  
  // Données
  for (let R = 3; R < row; R++) {
    if (ws[`A${R + 1}`]) ws[`A${R + 1}`].s = styles.cellNormal;
    if (ws[`B${R + 1}`]) ws[`B${R + 1}`].s = styles.cellNormal;
    if (ws[`C${R + 1}`]) ws[`C${R + 1}`].s = styles.cellCenter;
    if (ws[`D${R + 1}`]) {
      const statut = ws[`D${R + 1}`].v;
      ws[`D${R + 1}`].s = statut === 'Libre' ? styles.cellLibre : styles.cellOccupe;
    }
    if (ws[`E${R + 1}`]) ws[`E${R + 1}`].s = styles.cellNormal;
    if (ws[`F${R + 1}`]) ws[`F${R + 1}`].s = styles.cellNormal;
  }
  
  XLSX.utils.book_append_sheet(wb, ws, 'Liste Complète');
}