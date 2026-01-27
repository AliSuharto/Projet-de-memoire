import React from 'react';
import jsPDF from 'jspdf';

interface PaiementDTO {
  id: number;
  montant: number;
  datePaiement: string;
  typePaiement: string;
  motif?: string;
  modePaiement?: string;
  moisdePaiement?: string;
  nomMarchands?: string;
  idMarchand?: number;
  ActiviteMarchands?: string;
  nomPlaceComplet?: string;
  idAgent?: number;
  nomAgent?: string;
  idPlace?: number;
  nomPlace?: string;
  sessionId?: number;
  recuNumero?: string;
  quittanceId?: number;
  dernierePaiement?: string;
}

interface SessionDTO {
  id: number;
  nomSession: string;
  user: {
    id: number;
    nom: string;
    prenom: string;
  };
  type: string;
  dateSession: string;
  status: 'OUVERTE' | 'FERMEE' | 'EN_VALIDATION' | 'VALIDEE' | 'REJETEE';
  montantCollecte: number;
  isValid: boolean;
  paiements?: PaiementDTO[];
  notes?: string;
}

interface GroupedQuittance {
  numero: string; // Ex: "100A-115E"
  count: number;
  prixUnitaire: number;
  montant: number;
}

// Fonction pour extraire le numéro de base et la lettre d'une quittance
const parseQuittanceNumber = (recuNumero: string): { base: number; letter: string } | null => {
  const match = recuNumero.match(/^(\d+)([A-Z])$/);
  if (!match) return null;
  return {
    base: parseInt(match[1]),
    letter: match[2]
  };
};

// Fonction pour regrouper les quittances
const groupQuittances = (paiements: PaiementDTO[]): GroupedQuittance[] => {
  // Regrouper par montant
  const groupsByAmount: { [key: number]: PaiementDTO[] } = {};
  
  paiements.forEach(p => {
    if (p.recuNumero) {
      if (!groupsByAmount[p.montant]) {
        groupsByAmount[p.montant] = [];
      }
      groupsByAmount[p.montant].push(p);
    }
  });

  const result: GroupedQuittance[] = [];

  // Pour chaque groupe de montant
  Object.entries(groupsByAmount).forEach(([montant, payments]) => {
    const amount = parseFloat(montant);
    
    // Trier par numéro de quittance
    const sorted = payments
      .map(p => ({ payment: p, parsed: parseQuittanceNumber(p.recuNumero!) }))
      .filter(item => item.parsed !== null)
      .sort((a, b) => {
        if (a.parsed!.base !== b.parsed!.base) {
          return a.parsed!.base - b.parsed!.base;
        }
        return a.parsed!.letter.localeCompare(b.parsed!.letter);
      });

    if (sorted.length === 0) return;

    // Identifier les séquences continues
    let currentSequence: typeof sorted = [sorted[0]];
    
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1].parsed!;
      const curr = sorted[i].parsed!;
      
      const isConsecutive = 
        (prev.base === curr.base && curr.letter.charCodeAt(0) === prev.letter.charCodeAt(0) + 1) ||
        (prev.base + 1 === curr.base && prev.letter === 'Z' && curr.letter === 'A') ||
        (prev.base === curr.base - 1 && curr.letter === 'A');
      
      if (isConsecutive) {
        currentSequence.push(sorted[i]);
      } else {
        // Terminer la séquence actuelle
        if (currentSequence.length > 0) {
          const first = currentSequence[0].payment.recuNumero!;
          const last = currentSequence[currentSequence.length - 1].payment.recuNumero!;
          const numero = currentSequence.length > 1 ? `${first}-${last}` : first;
          
          result.push({
            numero,
            count: currentSequence.length,
            prixUnitaire: amount,
            montant: amount * currentSequence.length
          });
        }
        
        // Démarrer une nouvelle séquence
        currentSequence = [sorted[i]];
      }
    }
    
    // Ajouter la dernière séquence
    if (currentSequence.length > 0) {
      const first = currentSequence[0].payment.recuNumero!;
      const last = currentSequence[currentSequence.length - 1].payment.recuNumero!;
      const numero = currentSequence.length > 1 ? `${first}-${last}` : first;
      
      result.push({
        numero,
        count: currentSequence.length,
        prixUnitaire: amount,
        montant: amount * currentSequence.length
      });
    }
  });

  return result;
};

// Fonction pour formater la date
const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Fonction pour formater les montants sans slash
const formatAmount = (amount: number): string => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// Fonction principale pour générer le PDF
export const generateSessionExportPDF = (session: SessionDTO) => {
  if (!session.paiements || session.paiements.length === 0) {
    alert('Aucun paiement à exporter');
    return;
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // En-tête
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  const title = `Titre: ${session.nomSession || '___________'}`;
  pdf.text(title, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  const agentName = `Nom agent: ${session.user ? `${session.user.prenom} ${session.user.nom}` : '___________'}`;
  pdf.text(agentName, margin, yPos);
  yPos += 8;

  const sessionDate = `Date: ${formatDateShort(session.dateSession)}`;
  pdf.text(sessionDate, margin, yPos);
  yPos += 15;

  // Tableau
  const groupedQuittances = groupQuittances(session.paiements);
  
  // En-têtes du tableau
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  
  const col1X = margin;
  const col2X = margin + 60;
  const col3X = margin + 100;
  const col4X = margin + 140;
  
  // Dessiner les en-têtes
  pdf.text('Numero Quittance', col1X, yPos);
  pdf.text('Nombre', col2X, yPos);
  pdf.text('Prix Unitaire', col3X, yPos);
  pdf.text('Montant', col4X, yPos);
  
  yPos += 2;
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Données
  pdf.setFont('helvetica', 'normal');
  let totalMontant = 0;

  groupedQuittances.forEach(item => {
    // Vérifier si on a besoin d'une nouvelle page
    if (yPos > pageHeight - 40) {
      pdf.addPage();
      yPos = margin;
    }

    pdf.text(item.numero, col1X, yPos);
    pdf.text(item.count.toString(), col2X + 10, yPos, { align: 'center' });
    pdf.text(formatAmount(item.prixUnitaire), col3X + 15, yPos, { align: 'right' });
    pdf.text(formatAmount(item.montant), col4X + 20, yPos, { align: 'right' });
    
    totalMontant += item.montant;
    yPos += 7;
  });

  // Ligne de séparation avant le total
  yPos += 3;
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Total
  pdf.setFont('helvetica', 'bold');
  pdf.text('Total', col1X, yPos);
  pdf.text(formatAmount(totalMontant) + ' Ar', col4X + 20, yPos, { align: 'right' });

  // Pied de page avec signature
  yPos = pageHeight - 30;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Signature:', margin, yPos);
  pdf.line(margin + 25, yPos, margin + 70, yPos);

  // Télécharger le PDF
  const fileName = `rapport_session_${session.id}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

// Composant React (optionnel, pour utilisation standalone)
// export const SessionExportButton: React.FC<{ session: SessionDTO }> = ({ session }) => {
//   return (
//     <button
//       onClick={() => generateSessionExportPDF(session)}
//       className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
//     >
//       Exporter Rapport
//     </button>
//   );
// };