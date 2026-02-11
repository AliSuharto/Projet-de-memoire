'use client';
import API_BASE_URL from '@/services/APIbaseUrl';
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx-js-style';

// Types
interface UserSummaryDTO {
  id: number;
  nom: string;
  prenom: string;
}

interface PaiementDTO {
  id: number;
  montant: number;
  datePaiement: string;
  typePaiement: 'droit_annuel' | 'droit_place' | 'marchand_ambulant' | null | undefined;
  motif: string;
  modePaiement: string;
  moisdePaiement: string;
  nomMarchands: string;
  ActiviteMarchands: string;
  nomPlaceComplet: string;
  idMarchand: number;
  idAgent: number;
  nomAgent: string;
  idPlace: number;
  nomPlace: string;
  sessionId: number;
  recuNumero: string;
  quittanceId: number;
  dernierePaiement: string;
}

interface SessionDTO {
  id: number;
  nomSession: string;
  user: UserSummaryDTO;
  type: string;
  dateSession: string;
  status: string;
  montantCollecte: number;
  isValid: boolean;
  paiements: PaiementDTO[];
  notes: string;
}

interface GroupedPaiement {
  typePaiement: string;
  motif: string;
  montantTotal: number;
  nombrePaiements: number;
  recuNumeros: string[];
}

const EtatVersement: React.FC = () => {
  const [sessions, setSessions] = useState<SessionDTO[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Récupérer les sessions depuis l'API
  useEffect(() => {
    const fetchSessions = async (): Promise<void> => {
      setLoading(true);
      setError('');
      
      try {
        const response = await fetch(`${API_BASE_URL}/sessions`);
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des sessions');
        }
        
        const data: SessionDTO[] = await response.json();
        setSessions(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(errorMessage);
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    void fetchSessions();
  }, []);

  // Normaliser le type de paiement (si null/undefined -> marchand_ambulant)
  const normalizeTypePaiement = (typePaiement: string | null | undefined): string => {
    if (!typePaiement || typePaiement === '' || typePaiement === 'null' || typePaiement === 'undefined') {
      return 'marchand_ambulant';
    }
    return typePaiement;
  };

  // Obtenir le motif selon le type de paiement
  const getMotif = (typePaiement: string | null | undefined): string => {
    const normalizedType = normalizeTypePaiement(typePaiement);
    
    switch (normalizedType) {
      case 'droit_place':
        return 'Emplacement';
      case 'droit_annuel':
        return 'Droit annuel';
      case 'marchand_ambulant':
        return 'Marchand ambulant';
      default:
        return normalizedType;
    }
  };

  // Grouper les paiements par type (droit_place, droit_annuel, marchand_ambulant)
  const groupPaiementsByType = (paiements: PaiementDTO[]): GroupedPaiement[] => {
    const grouped = paiements.reduce((acc, paiement) => {
      // Normaliser le type (null/undefined devient marchand_ambulant)
      const type = normalizeTypePaiement(paiement.typePaiement);
      
      if (!acc[type]) {
        acc[type] = {
          typePaiement: type,
          motif: getMotif(type),
          montantTotal: 0,
          nombrePaiements: 0,
          recuNumeros: [],
        };
      }
      
      acc[type].montantTotal += Number(paiement.montant);
      acc[type].nombrePaiements += 1;
      
      if (paiement.recuNumero) {
        acc[type].recuNumeros.push(paiement.recuNumero);
      }
      
      return acc;
    }, {} as Record<string, GroupedPaiement>);

    return Object.values(grouped);
  };

  // Générer le fichier Excel avec design
  const generateExcel = (): void => {
    if (!selectedSession) {
      alert('Veuillez sélectionner une session');
      return;
    }

    const groupedData = groupPaiementsByType(selectedSession.paiements);

    // Créer les données pour Excel
    const excelData: (string | number)[][] = [
      ['ÉTAT DE VERSEMENT'],
      [],
      ['Session:', selectedSession.nomSession],
      ['Agent:', `${selectedSession.user.prenom} ${selectedSession.user.nom}`],
      ['Date:', new Date(selectedSession.dateSession).toLocaleDateString('fr-FR')],
      ['Montant Total Collecté:', `${selectedSession.montantCollecte.toFixed(2)} Ar`],
      ['Statut:', selectedSession.status],
      ['Nombre de Paiements:', selectedSession.paiements.length],
      [],
      ['RÉSUMÉ PAR TYPE DE PAIEMENT'],
      [],
      ['Type de Paiement', 'Motif', 'Nombre', 'Montant Total', 'Numéros de Reçu'],
    ];

    // Ajouter les données groupées par type
    groupedData.forEach((group) => {
      excelData.push([
        group.typePaiement,
        group.motif,
        group.nombrePaiements,
        group.montantTotal.toFixed(2),
        group.recuNumeros.join(', '),
      ]);
    });

    // Créer le workbook et la worksheet
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'État de Versement');

    // Style pour le titre principal
    ws['A1'].s = {
      font: { bold: true, sz: 18, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2563EB' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };

    // Fusionner les cellules pour le titre
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Titre principal
      { s: { r: 9, c: 0 }, e: { r: 9, c: 4 } }, // Sous-titre "RÉSUMÉ"
    ];

    // Style pour les informations de session (lignes 3-8)
    for (let i = 3; i <= 8; i++) {
      const cellA = ws[`A${i}`];
      const cellB = ws[`B${i}`];
      
      if (cellA) {
        cellA.s = {
          font: { bold: true, sz: 11 },
          fill: { fgColor: { rgb: 'F3F4F6' } },
          alignment: { horizontal: 'right' },
        };
      }
      
      if (cellB) {
        cellB.s = {
          font: { sz: 11 },
          alignment: { horizontal: 'left' },
        };
      }
    }

    // Style pour le sous-titre "RÉSUMÉ PAR TYPE DE PAIEMENT"
    ws['A10'].s = {
      font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '059669' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };

    // Style pour les en-têtes du tableau (ligne 12)
    const headers = ['A12', 'B12', 'C12', 'D12', 'E12'];
    headers.forEach((cell) => {
      if (ws[cell]) {
        ws[cell].s = {
          font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '1F2937' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
        };
      }
    });

    // Style pour les lignes de données du tableau
    const dataStartRow = 13;
    const dataEndRow = dataStartRow + groupedData.length - 1;
    
    for (let row = dataStartRow; row <= dataEndRow; row++) {
      for (let col = 0; col < 5; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row - 1, c: col });
        if (!ws[cellRef]) continue;
        
        ws[cellRef].s = {
          font: { sz: 10 },
          alignment: { 
            horizontal: col === 2 || col === 3 ? 'center' : 'left',
            vertical: 'center',
          },
          border: {
            top: { style: 'thin', color: { rgb: 'D1D5DB' } },
            bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
            left: { style: 'thin', color: { rgb: 'D1D5DB' } },
            right: { style: 'thin', color: { rgb: 'D1D5DB' } },
          },
          fill: { fgColor: { rgb: row % 2 === 0 ? 'F9FAFB' : 'FFFFFF' } },
        };
        
        // Style spécial pour la colonne Montant Total
        if (col === 3) {
          ws[cellRef].s.font = { ...ws[cellRef].s.font, bold: true, color: { rgb: '059669' } };
        }
      }
    }

    // Ajuster la largeur des colonnes
    ws['!cols'] = [
      { wch: 22 },  // Type de Paiement
      { wch: 22 },  // Motif
      { wch: 12 },  // Nombre
      { wch: 18 },  // Montant Total
      { wch: 50 },  // Numéros de Reçu
    ];

    // Ajuster la hauteur des lignes
    ws['!rows'] = [
      { hpt: 30 }, // Titre principal
      { hpt: 10 }, // Ligne vide
      { hpt: 20 }, // Session
      { hpt: 20 }, // Agent
      { hpt: 20 }, // Date
      { hpt: 20 }, // Montant
      { hpt: 20 }, // Statut
      { hpt: 20 }, // Nombre de paiements
      { hpt: 10 }, // Ligne vide
      { hpt: 25 }, // Sous-titre
      { hpt: 10 }, // Ligne vide
      { hpt: 25 }, // En-têtes
    ];

    // Télécharger le fichier
    const fileName = `Etat_Versement_${selectedSession.nomSession}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">État de Versement</h1>

      {loading && (
        <div className="text-center py-4">
          <p className="text-blue-600">Chargement des sessions...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Sélectionner une Session</h2>
        
        <select
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedSession?.id || ''}
          onChange={(e) => {
            const session = sessions.find(s => s.id === Number(e.target.value));
            setSelectedSession(session || null);
          }}
        >
          <option value="">-- Choisir une session --</option>
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.nomSession} - {session.user.prenom} {session.user.nom} - 
              {new Date(session.dateSession).toLocaleDateString('fr-FR')} - 
              {session.montantCollecte.toFixed(2)} Ar
            </option>
          ))}
        </select>
      </div>

      {selectedSession && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Détails de la Session</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600">Session:</p>
              <p className="font-semibold">{selectedSession.nomSession}</p>
            </div>
            <div>
              <p className="text-gray-600">Agent:</p>
              <p className="font-semibold">
                {selectedSession.user.prenom} {selectedSession.user.nom}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Date:</p>
              <p className="font-semibold">
                {new Date(selectedSession.dateSession).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Montant Total:</p>
              <p className="font-semibold text-green-600">
                {selectedSession.montantCollecte.toFixed(2)} Ar
              </p>
            </div>
            <div>
              <p className="text-gray-600">Nombre de Paiements:</p>
              <p className="font-semibold">{selectedSession.paiements.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Statut:</p>
              <p className="font-semibold">{selectedSession.status}</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-3">Résumé par Type de Paiement</h3>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Type</th>
                  <th className="px-4 py-2 border">Motif</th>
                  <th className="px-4 py-2 border">Nombre</th>
                  <th className="px-4 py-2 border">Montant Total</th>
                  <th className="px-4 py-2 border">Numéros de Reçu</th>
                </tr>
              </thead>
              <tbody>
                {groupPaiementsByType(selectedSession.paiements).map((group, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{group.typePaiement}</td>
                    <td className="px-4 py-2 border">{group.motif}</td>
                    <td className="px-4 py-2 border text-center">{group.nombrePaiements}</td>
                    <td className="px-4 py-2 border text-right">
                      {group.montantTotal.toFixed(2)} Ar
                    </td>
                    <td className="px-4 py-2 border text-sm">
                      {group.recuNumeros.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={generateExcel}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
          >
            📥 Télécharger l&apos;État de Versement (Excel)
          </button>
        </div>
      )}
    </div>
  );
};

export default EtatVersement;