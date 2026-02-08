import React from 'react';
import * as XLSX from 'xlsx-js-style';
import { Download } from 'lucide-react';

interface PaiementDTO {
  id: number;
  montant: number;
  datePaiement: string;
  typePaiement: string;
  motif: string;
  modePaiement: string;
  moisdePaiement: string;
  nomMarchands: string;
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

interface UserSummaryDTO {
  id: number;
  nom: string;
  prenom: string;
}

interface SessionDTO {
  id: number;
  nomSession: string;
  user: UserSummaryDTO;
  type: string;
  dateSession: string;
  status: 'OUVERTE' | 'FERMEE' | 'EN_VALIDATION' | 'VALIDEE' | 'REJETEE';
  montantCollecte: number;
  isValid: boolean;
  paiements: PaiementDTO[];
  notes: string;
}

interface ExportRecettesExcelProps {
  sessions: SessionDTO[];
  dateDebut: string;
  dateFin: string;
}

const ExportRecettesExcel: React.FC<ExportRecettesExcelProps> = ({ sessions, dateDebut, dateFin }) => {
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const exportToExcel = () => {
    // Filtrer uniquement les sessions validées
    const sessionsValidees = sessions.filter(s => s.status === 'VALIDEE');

    // Calculer les statistiques par agent
    const statsParAgent = sessionsValidees.reduce((acc, session) => {
      const agentName = session.user ? `${session.user.prenom} ${session.user.nom}` : 'Agent Inconnu';
      
      if (!acc[agentName]) {
        acc[agentName] = {
          nom: agentName,
          montantTotal: 0,
          nombreSessions: 0,
          nombrePaiements: 0,
          sessions: []
        };
      }
      
      acc[agentName].montantTotal += session.montantCollecte;
      acc[agentName].nombreSessions += 1;
      acc[agentName].nombrePaiements += session.paiements?.length || 0;
      acc[agentName].sessions.push({
        date: session.dateSession,
        montant: session.montantCollecte,
        nombrePaiements: session.paiements?.length || 0
      });
      
      return acc;
    }, {} as Record<string, any>);

    const agentsData = Object.values(statsParAgent).sort((a: any, b: any) => b.montantTotal - a.montantTotal);

    // Créer le workbook
    const wb = XLSX.utils.book_new();

    // ==================== FEUILLE 1: RÉSUMÉ GÉNÉRAL ====================
    createSummarySheet(wb, sessionsValidees, agentsData, dateDebut, dateFin);

    // ==================== FEUILLE 2: DÉTAILS PAR AGENT ====================
    createAgentDetailsSheet(wb, agentsData, dateDebut, dateFin);

    // Télécharger le fichier
    const fileName = `Rapport_Recettes_${formatDate(dateDebut)}_au_${formatDate(dateFin)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const createSummarySheet = (wb: any, sessions: SessionDTO[], agents: any[], dateDebut: string, dateFin: string) => {
    const ws_data: any[] = [];

    // Styles
    const headerStyle = {
      font: { name: 'Arial', sz: 14, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2563EB' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    };

    const titleStyle = {
      font: { name: 'Arial', sz: 18, bold: true, color: { rgb: '1E40AF' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const subHeaderStyle = {
      font: { name: 'Arial', sz: 12, bold: true, color: { rgb: '374151' } },
      fill: { fgColor: { rgb: 'E5E7EB' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    };

    const cellStyle = {
      font: { name: 'Arial', sz: 11 },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: 'D1D5DB' } },
        bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
        left: { style: 'thin', color: { rgb: 'D1D5DB' } },
        right: { style: 'thin', color: { rgb: 'D1D5DB' } }
      }
    };

    const numberStyle = {
      ...cellStyle,
      numFmt: '#,##0" Ar"',
      alignment: { horizontal: 'right', vertical: 'center' }
    };

    const totalStyle = {
      font: { name: 'Arial', sz: 12, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '10B981' } },
      numFmt: '#,##0" Ar"',
      alignment: { horizontal: 'right', vertical: 'center' },
      border: {
        top: { style: 'medium', color: { rgb: '000000' } },
        bottom: { style: 'medium', color: { rgb: '000000' } },
        left: { style: 'medium', color: { rgb: '000000' } },
        right: { style: 'medium', color: { rgb: '000000' } }
      }
    };

    // Titre principal
    ws_data.push([{ v: 'RAPPORT DE RECETTES - SESSIONS VALIDÉES', s: titleStyle }]);
    ws_data.push([]);

    // Période
    ws_data.push([
      { v: 'Période:', s: { font: { name: 'Arial', sz: 12, bold: true } } },
      { v: `Du ${formatDate(dateDebut)} au ${formatDate(dateFin)}`, s: { font: { name: 'Arial', sz: 12 } } }
    ]);
    ws_data.push([]);

    // Statistiques générales
    const montantTotal = sessions.reduce((sum, s) => sum + s.montantCollecte, 0);
    const nombreSessions = sessions.length;
    const nombrePaiements = sessions.reduce((sum, s) => sum + (s.paiements?.length || 0), 0);
    const montantMoyen = nombreSessions > 0 ? montantTotal / nombreSessions : 0;

    ws_data.push([{ v: 'RÉSUMÉ GÉNÉRAL', s: headerStyle }, { s: headerStyle }, { s: headerStyle }]);
    ws_data.push([
      { v: 'Indicateur', s: subHeaderStyle },
      { v: 'Valeur', s: subHeaderStyle },
      { v: 'Détails', s: subHeaderStyle }
    ]);
    
    ws_data.push([
      { v: 'Montant Total Collecté', s: cellStyle },
      { v: montantTotal, s: numberStyle },
      { v: 'Sessions validées uniquement', s: cellStyle }
    ]);
    
    ws_data.push([
      { v: 'Nombre de Sessions', s: cellStyle },
      { v: nombreSessions, s: { ...cellStyle, numFmt: '0' } },
      { v: 'Statut: VALIDEE', s: cellStyle }
    ]);
    
    ws_data.push([
      { v: 'Nombre de Paiements', s: cellStyle },
      { v: nombrePaiements, s: { ...cellStyle, numFmt: '0' } },
      { v: 'Total des transactions', s: cellStyle }
    ]);
    
    ws_data.push([
      { v: 'Montant Moyen par Session', s: cellStyle },
      { v: montantMoyen, s: numberStyle },
      { v: 'Montant total / Nombre de sessions', s: cellStyle }
    ]);

    ws_data.push([]);
    ws_data.push([]);

    // Tableau des agents
    ws_data.push([{ v: 'RECETTES PAR AGENT', s: headerStyle }, { s: headerStyle }, { s: headerStyle }, { s: headerStyle }, { s: headerStyle }]);
    ws_data.push([
      { v: 'Rang', s: subHeaderStyle },
      { v: 'Nom de l\'Agent', s: subHeaderStyle },
      { v: 'Montant Total', s: subHeaderStyle },
      { v: 'Sessions', s: subHeaderStyle },
      { v: 'Paiements', s: subHeaderStyle },
      { v: '% du Total', s: subHeaderStyle }
    ]);

    agents.forEach((agent: any, index: number) => {
      const pourcentage = montantTotal > 0 ? (agent.montantTotal / montantTotal) * 100 : 0;
      ws_data.push([
        { v: index + 1, s: cellStyle },
        { v: agent.nom, s: cellStyle },
        { v: agent.montantTotal, s: numberStyle },
        { v: agent.nombreSessions, s: { ...cellStyle, numFmt: '0', alignment: { horizontal: 'center' } } },
        { v: agent.nombrePaiements, s: { ...cellStyle, numFmt: '0', alignment: { horizontal: 'center' } } },
        { v: pourcentage / 100, s: { ...cellStyle, numFmt: '0.00%', alignment: { horizontal: 'center' } } }
      ]);
    });

    // Ligne de total
    ws_data.push([
      { v: '', s: totalStyle },
      { v: 'TOTAL GÉNÉRAL', s: totalStyle },
      { v: montantTotal, s: totalStyle },
      { v: nombreSessions, s: { ...totalStyle, numFmt: '0' } },
      { v: nombrePaiements, s: { ...totalStyle, numFmt: '0' } },
      { v: 1, s: { ...totalStyle, numFmt: '0.00%' } }
    ]);

    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Définir les largeurs de colonnes
    ws['!cols'] = [
      { wch: 8 },   // Rang
      { wch: 30 },  // Nom
      { wch: 18 },  // Montant
      { wch: 12 },  // Sessions
      { wch: 12 },  // Paiements
      { wch: 12 }   // %
    ];

    // Fusionner les cellules du titre
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Titre principal
      { s: { r: 5, c: 0 }, e: { r: 5, c: 2 } }, // Résumé général
      { s: { r: 14, c: 0 }, e: { r: 14, c: 5 } } // Recettes par agent
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Résumé Général');
  };

  const createAgentDetailsSheet = (wb: any, agents: any[], dateDebut: string, dateFin: string) => {
    const ws_data: any[] = [];

    const titleStyle = {
      font: { name: 'Arial', sz: 16, bold: true, color: { rgb: '1E40AF' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const agentHeaderStyle = {
      font: { name: 'Arial', sz: 13, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '3B82F6' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: {
        top: { style: 'medium', color: { rgb: '000000' } },
        bottom: { style: 'medium', color: { rgb: '000000' } },
        left: { style: 'medium', color: { rgb: '000000' } },
        right: { style: 'medium', color: { rgb: '000000' } }
      }
    };

    const subHeaderStyle = {
      font: { name: 'Arial', sz: 11, bold: true, color: { rgb: '374151' } },
      fill: { fgColor: { rgb: 'DBEAFE' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    };

    const cellStyle = {
      font: { name: 'Arial', sz: 10 },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: 'D1D5DB' } },
        bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
        left: { style: 'thin', color: { rgb: 'D1D5DB' } },
        right: { style: 'thin', color: { rgb: 'D1D5DB' } }
      }
    };

    const numberStyle = {
      ...cellStyle,
      numFmt: '#,##0" Ar"',
      alignment: { horizontal: 'right', vertical: 'center' }
    };

    const dateStyle = {
      ...cellStyle,
      numFmt: 'dd/mm/yyyy',
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const summaryStyle = {
      font: { name: 'Arial', sz: 11, bold: true },
      fill: { fgColor: { rgb: 'FEF3C7' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    };

    // Titre
    ws_data.push([{ v: `DÉTAILS PAR AGENT - ${formatDate(dateDebut)} au ${formatDate(dateFin)}`, s: titleStyle }]);
    ws_data.push([]);

    agents.forEach((agent: any, agentIndex: number) => {
      // En-tête de l'agent
      ws_data.push([{ v: `${agentIndex + 1}. ${agent.nom}`, s: agentHeaderStyle }]);
      
      // Statistiques de l'agent
      ws_data.push([
        { v: 'Montant Total Collecté:', s: summaryStyle },
        { v: agent.montantTotal, s: { ...summaryStyle, numFmt: '#,##0" Ar"', alignment: { horizontal: 'right' } } },
        { v: 'Sessions:', s: summaryStyle },
        { v: agent.nombreSessions, s: { ...summaryStyle, alignment: { horizontal: 'center' } } },
        { v: 'Paiements:', s: summaryStyle },
        { v: agent.nombrePaiements, s: { ...summaryStyle, alignment: { horizontal: 'center' } } }
      ]);

      ws_data.push([]);

      // Tableau des sessions
      ws_data.push([
        { v: 'N°', s: subHeaderStyle },
        { v: 'Date', s: subHeaderStyle },
        { v: 'Montant', s: subHeaderStyle },
        { v: 'Nb Paiements', s: subHeaderStyle },
        { v: 'Montant Moyen/Paiement', s: subHeaderStyle }
      ]);

      // Trier les sessions par date
      agent.sessions.sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      agent.sessions.forEach((session: any, sessionIndex: number) => {
        const montantMoyen = session.nombrePaiements > 0 ? session.montant / session.nombrePaiements : 0;
        ws_data.push([
          { v: sessionIndex + 1, s: cellStyle },
          { v: new Date(session.date), s: dateStyle },
          { v: session.montant, s: numberStyle },
          { v: session.nombrePaiements, s: { ...cellStyle, numFmt: '0', alignment: { horizontal: 'center' } } },
          { v: montantMoyen, s: numberStyle }
        ]);
      });

      ws_data.push([]);
      ws_data.push([]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Largeurs de colonnes
    ws['!cols'] = [
      { wch: 5 },   // N°
      { wch: 12 },  // Date
      { wch: 18 },  // Montant
      { wch: 15 },  // Nb Paiements
      { wch: 22 }   // Montant Moyen
    ];

    // Fusionner les cellules
    const merges: any[] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } } // Titre
    ];

    let currentRow = 2;
    agents.forEach((agent: any) => {
      merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 5 } }); // Nom agent
      currentRow += agent.sessions.length + 5;
    });

    ws['!merges'] = merges;

    XLSX.utils.book_append_sheet(wb, ws, 'Détails Agents');
  };

  const formatDate2 = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  return (
    <button
      onClick={exportToExcel}
      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
    >
      <Download className="w-5 h-5" />
      Exporter Excel
    </button>
  );
};

export default ExportRecettesExcel;