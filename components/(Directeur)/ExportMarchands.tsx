import * as XLSX from 'xlsx-js-style';

interface Marchand {
  id: number;
  nom: string;
  prenom: string | null;
  adress: string | null;
  description: string | null;
  activite: string | null;
  numCIN: string;
  numTel1: string | null;
  numTel2: string | null;
  stat: string | null;
  nif: string | null;
  estEndette: boolean | null;
  hasPlace: boolean;
  places: Place[];
  categorie: any;
}

interface Place {
  id: number;
  nom: string;
  marcheeName: string;
  salleName: string | null;
  zoneName: string | null;
  categorieName: string | null;
  montant: number | null;
}

// Palette de couleurs pour différencier les marchés
const MARCHE_COLORS = [
  'E3F2FD', // Bleu clair
  'F3E5F5', // Violet clair
  'E8F5E9', // Vert clair
  'FFF3E0', // Orange clair
  'FCE4EC', // Rose clair
  'F1F8E9', // Vert lime clair
  'FFF9C4', // Jaune clair
  'E0F2F1', // Turquoise clair
  'EFEBE9', // Marron clair
  'F5F5F5', // Gris clair
];

/**
 * Obtient une couleur pour un marché donné
 */
const getColorForMarche = (marcheeName: string, marcheMap: Map<string, string>): string => {
  if (!marcheMap.has(marcheeName)) {
    const colorIndex = marcheMap.size % MARCHE_COLORS.length;
    marcheMap.set(marcheeName, MARCHE_COLORS[colorIndex]);
  }
  return marcheMap.get(marcheeName)!;
};

/**
 * Crée un style de cellule
 */
const createCellStyle = (options: {
  bgColor?: string;
  fontColor?: string;
  fontSize?: number;
  bold?: boolean;
  alignment?: 'left' | 'center' | 'right';
  borderStyle?: 'thin' | 'medium' | 'thick';
  borderColor?: string;
}) => {
  const {
    bgColor,
    fontColor = '000000',
    fontSize = 11,
    bold = false,
    alignment = 'center',
    borderStyle = 'thin',
    borderColor = 'CCCCCC'
  } = options;

  return {
    font: {
      name: 'Calibri',
      sz: fontSize,
      bold: bold,
      color: { rgb: fontColor }
    },
    fill: bgColor ? {
      fgColor: { rgb: bgColor }
    } : undefined,
    alignment: {
      vertical: 'center',
      horizontal: alignment,
      wrapText: true
    },
    border: {
      top: { style: borderStyle, color: { rgb: borderColor } },
      bottom: { style: borderStyle, color: { rgb: borderColor } },
      left: { style: borderStyle, color: { rgb: borderColor } },
      right: { style: borderStyle, color: { rgb: borderColor } }
    }
  };
};

/**
 * Exporte les données des marchands vers un fichier Excel avec formatage
 */
export const exportMarchandsToExcel = (marchands: Marchand[]) => {
  // Créer un nouveau workbook
  const wb = XLSX.utils.book_new();

  // Obtenir la date du jour formatée
  const today = new Date();
  const dateStr = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Map pour stocker les couleurs par marché
  const marcheColorMap = new Map<string, string>();

  // Préparer les données
  const data: any[][] = [];

  // === LIGNE 1: TITRE PRINCIPAL ===
  data.push([`LISTE DES MARCHANDS - ${dateStr.toUpperCase()}`]);
  
  // === LIGNE 2: VIDE ===
  data.push([]);

  // === LIGNE 3: EN-TÊTES ===
  data.push([
    'Nom et Prénom',
    'CIN',
    'Téléphone',
    'Activité',
    'NIF',
    'STAT',
    'Catégorie',
    'Marché',
    'Zone',
    'Hall',
    'Place'
  ]);

  // === DONNÉES DES MARCHANDS - TRIÉES PAR MARCHÉ, ZONE, HALL ===
  const rowMarcheMap = new Map<number, string>();
  
  // Créer une liste de toutes les entrées (marchand + place)
  interface MarchandEntry {
    marchand: Marchand;
    place: Place | null;
    sortKey: string;
  }
  
  const entries: MarchandEntry[] = [];
  
  marchands.forEach(marchand => {
    if (marchand.places && marchand.places.length > 0) {
      marchand.places.forEach(place => {
        // Clé de tri: Marché -> Zone -> Hall -> Place
        const sortKey = `${place.marcheeName || 'ZZZ_Sans marché'}_${place.zoneName || 'ZZZ'}_${place.salleName || 'ZZZ'}_${place.nom || 'ZZZ'}`;
        entries.push({ marchand, place, sortKey });
      });
    } else {
      // Marchands sans place à la fin
      const sortKey = 'ZZZ_Sans marché_ZZZ_ZZZ_ZZZ';
      entries.push({ marchand, place: null, sortKey });
    }
  });
  
  // Trier par la clé
  entries.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  
  // Ajouter les données triées
  entries.forEach(entry => {
    const { marchand, place } = entry;
    const rowIndex = data.length;
    const marcheeName = place?.marcheeName || 'Sans marché';
    rowMarcheMap.set(rowIndex, marcheeName);
    
    if (place) {
      data.push([
        `${marchand.nom || ''} ${marchand.prenom || ''}`.trim(),
        marchand.numCIN || '',
        marchand.numTel1 || marchand.numTel2 || '',
        marchand.activite || '',
        marchand.nif || '',
        marchand.stat || '',
        place.categorieName || '',
        place.marcheeName || '',
        place.zoneName || '',
        place.salleName || '',
        place.nom || ''
      ]);
    } else {
      data.push([
        `${marchand.nom || ''} ${marchand.prenom || ''}`.trim(),
        marchand.numCIN || '',
        marchand.numTel1 || marchand.numTel2 || '',
        marchand.activite || '',
        marchand.nif || '',
        marchand.stat || '',
        '', '', '', '', ''
      ]);
    }
  });

  // Créer la worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);

  // === APPLIQUER LES STYLES ===
  
  // Titre principal (A1)
  ws['A1'].s = createCellStyle({
    bgColor: '2E5090',
    fontColor: 'FFFFFF',
    fontSize: 16,
    bold: true,
    alignment: 'center',
    borderStyle: 'thick',
    borderColor: '1A3A5C'
  });

  // En-têtes (ligne 3)
  const headers = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  headers.forEach(col => {
    const cell = `${col}3`;
    if (ws[cell]) {
      ws[cell].s = createCellStyle({
        bgColor: '4472C4',
        fontColor: 'FFFFFF',
        fontSize: 14,
        bold: true,
        alignment: 'center',
        borderStyle: 'medium',
        borderColor: '2E5090'
      });
    }
  });

  // Données (à partir de la ligne 4)
  for (let rowIdx = 3; rowIdx < data.length; rowIdx++) {
    const marcheeName = rowMarcheMap.get(rowIdx) || '';
    const bgColor = getColorForMarche(marcheeName, marcheColorMap);

    headers.forEach((col, colIdx) => {
      const cell = `${col}${rowIdx + 1}`;
      if (ws[cell]) {
        // Déterminer l'alignement
        let alignment: 'left' | 'center' | 'right' = 'center';
        if (colIdx === 0) alignment = 'left'; // Nom
        else if ([1, 2, 4, 5].includes(colIdx)) alignment = 'center'; // CIN, Tel, NIF, STAT
        else alignment = 'center';

        ws[cell].s = createCellStyle({
          bgColor: bgColor,
          fontColor: '000000',
          fontSize: 11,
          bold: false,
          alignment: alignment,
          borderStyle: 'thin',
          borderColor: 'CCCCCC'
        });
      }
    });
  }

  // Fusionner les cellules du titre (A1:K1)
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } });

  // Définir la largeur des colonnes
  ws['!cols'] = [
    { wch: 28 }, // Nom et Prénom
    { wch: 22 }, // CIN
    { wch: 16 }, // Téléphone
    { wch: 22 }, // Activité
    { wch: 16 }, // NIF
    { wch: 16 }, // STAT
    { wch: 12 }, // Catégorie
    { wch: 20 }, // Marché
    { wch: 10 }, // Zone
    { wch: 16 }, // Hall
    { wch: 12 }  // Place
  ];

  // Définir la hauteur des lignes
  ws['!rows'] = [
    { hpx: 30 }, // Titre
    { hpx: 5 },  // Ligne vide
    { hpx: 25 }, // En-têtes
  ];
  
  // Hauteur pour les lignes de données
  for (let i = 3; i < data.length; i++) {
    if (!ws['!rows']) ws['!rows'] = [];
    ws['!rows'][i] = { hpx: 20 };
  }

  // Ajouter la feuille au workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Liste des Marchands');

  // Générer le nom du fichier
  const fileName = `Marchands_${today.toISOString().split('T')[0]}.xlsx`;

  // Télécharger le fichier
  XLSX.writeFile(wb, fileName);

  return fileName;
};

/**
 * Exporte avec statistiques
 */
export const exportMarchandsWithStats = (marchands: Marchand[]) => {
  const wb = XLSX.utils.book_new();
  const today = new Date();
  const dateStr = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Feuille 1: Liste des marchands (réutiliser la logique principale)
  const marcheColorMap = new Map<string, string>();
  const data1: any[][] = [];
  
  data1.push([`LISTE DES MARCHANDS - ${dateStr.toUpperCase()}`]);
  data1.push([]);
  data1.push(['Nom et Prénom', 'CIN', 'Téléphone', 'Activité', 'NIF', 'STAT', 'Catégorie', 'Marché', 'Zone', 'Hall', 'Place']);

  const rowMarcheMap = new Map<number, string>();
  
  // Créer et trier les entrées
  interface MarchandEntry {
    marchand: Marchand;
    place: Place | null;
    sortKey: string;
  }
  
  const entries: MarchandEntry[] = [];
  
  marchands.forEach(m => {
    if (m.places && m.places.length > 0) {
      m.places.forEach(p => {
        const sortKey = `${p.marcheeName || 'ZZZ_Sans marché'}_${p.zoneName || 'ZZZ'}_${p.salleName || 'ZZZ'}_${p.nom || 'ZZZ'}`;
        entries.push({ marchand: m, place: p, sortKey });
      });
    } else {
      const sortKey = 'ZZZ_Sans marché_ZZZ_ZZZ_ZZZ';
      entries.push({ marchand: m, place: null, sortKey });
    }
  });
  
  entries.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  
  entries.forEach(entry => {
    const { marchand: m, place: p } = entry;
    const rowIndex = data1.length;
    rowMarcheMap.set(rowIndex, p?.marcheeName || 'Sans marché');
    
    if (p) {
      data1.push([
        `${m.nom || ''} ${m.prenom || ''}`.trim(),
        m.numCIN || '', m.numTel1 || m.numTel2 || '', m.activite || '',
        m.nif || '', m.stat || '', p.categorieName || '', p.marcheeName || '',
        p.zoneName || '', p.salleName || '', p.nom || ''
      ]);
    } else {
      data1.push([
        `${m.nom || ''} ${m.prenom || ''}`.trim(),
        m.numCIN || '', m.numTel1 || m.numTel2 || '', m.activite || '',
        m.nif || '', m.stat || '', '', '', '', '', ''
      ]);
    }
  });

  const ws1 = XLSX.utils.aoa_to_sheet(data1);
  
  // Appliquer les styles (même logique que la fonction principale)
  ws1['A1'].s = createCellStyle({
    bgColor: '2E5090', fontColor: 'FFFFFF', fontSize: 16, bold: true, alignment: 'center', borderStyle: 'thick', borderColor: '1A3A5C'
  });
  
  const headers = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  headers.forEach(col => {
    const cell = `${col}3`;
    if (ws1[cell]) {
      ws1[cell].s = createCellStyle({
        bgColor: '4472C4', fontColor: 'FFFFFF', fontSize: 14, bold: true, alignment: 'center', borderStyle: 'medium', borderColor: '2E5090'
      });
    }
  });

  for (let rowIdx = 3; rowIdx < data1.length; rowIdx++) {
    const marcheeName = rowMarcheMap.get(rowIdx) || '';
    const bgColor = getColorForMarche(marcheeName, marcheColorMap);
    headers.forEach((col, colIdx) => {
      const cell = `${col}${rowIdx + 1}`;
      if (ws1[cell]) {
        let alignment: 'left' | 'center' | 'right' = colIdx === 0 ? 'left' : 'center';
        ws1[cell].s = createCellStyle({
          bgColor, fontColor: '000000', fontSize: 11, alignment, borderStyle: 'thin', borderColor: 'CCCCCC'
        });
      }
    });
  }

  ws1['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }];
  ws1['!cols'] = [{ wch: 28 }, { wch: 22 }, { wch: 16 }, { wch: 22 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 20 }, { wch: 10 }, { wch: 16 }, { wch: 12 }];
  ws1['!rows'] = [{ hpx: 30 }, { hpx: 5 }, { hpx: 25 }];
  for (let i = 3; i < data1.length; i++) {
    if (!ws1['!rows']) ws1['!rows'] = [];
    ws1['!rows'][i] = { hpx: 20 };
  }

  XLSX.utils.book_append_sheet(wb, ws1, 'Marchands');

  // Feuille 2: Statistiques
  const data2: any[][] = [];
  data2.push([`TABLEAU DE BORD - ${dateStr.toUpperCase()}`]);
  data2.push([]);
  data2.push(['INDICATEUR', 'VALEUR']);
  data2.push(['Total des marchands', marchands.length]);
  data2.push(['Marchands avec place', marchands.filter(m => m.hasPlace).length]);
  data2.push(['Marchands sans place', marchands.filter(m => !m.hasPlace).length]);
  data2.push(['Marchands endettés', marchands.filter(m => m.estEndette === true).length]);
  data2.push(['Marchands à jour', marchands.filter(m => m.estEndette === false).length]);

  const marcheStats = new Map<string, number>();
  marchands.forEach(m => {
    if (m.places && m.places.length > 0) {
      m.places.forEach(p => {
        const name = p.marcheeName || 'Non spécifié';
        marcheStats.set(name, (marcheStats.get(name) || 0) + 1);
      });
    }
  });

  data2.push([]);
  data2.push(['RÉPARTITION PAR MARCHÉ']);
  marcheStats.forEach((count, marche) => {
    data2.push([marche, count]);
  });

  const ws2 = XLSX.utils.aoa_to_sheet(data2);
  
  ws2['A1'].s = createCellStyle({
    bgColor: '2E5090', fontColor: 'FFFFFF', fontSize: 16, bold: true, alignment: 'center', borderStyle: 'thick', borderColor: '1A3A5C'
  });
  
  ['A3', 'B3'].forEach(cell => {
    if (ws2[cell]) {
      ws2[cell].s = createCellStyle({
        bgColor: '4472C4', fontColor: 'FFFFFF', fontSize: 12, bold: true, alignment: 'center'
      });
    }
  });

  ws2['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 8, c: 0 }, e: { r: 8, c: 1 } }
  ];
  ws2['!cols'] = [{ wch: 35 }, { wch: 18 }];
  ws2['!rows'] = [{ hpx: 30 }];

  XLSX.utils.book_append_sheet(wb, ws2, 'Statistiques');

  const fileName = `Rapport_Complet_${today.toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return fileName;
};