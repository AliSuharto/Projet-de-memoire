'use client';
import React, { useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { ArrowLeft, Calendar, User, DollarSign, FileText, Receipt, Store, MapPin, CheckCircle, XCircle, Clock, Download, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
import { generateSessionExportPDF } from '../../generePdf';

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
  user: UserSummaryDTO;
  type: string;
  dateSession: string;
  status: 'OUVERTE' | 'FERMEE' | 'EN_VALIDATION' | 'VALIDEE' | 'REJETEE';
  montantCollecte: number;
  isValid: boolean;
  paiements?: PaiementDTO[];
  notes?: string;
}

const SessionDetailPage: React.FC = () => {
  const router = useRouter();
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const sessionData = typeof window !== 'undefined' 
    ? sessionStorage.getItem('selectedSession')
    : null;
  
  const session: SessionDTO | null = sessionData ? JSON.parse(sessionData) : null;

  const getStatusConfig = (status: SessionDTO['status']) => {
    const configs = {
      'VALIDEE': { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle, label: 'Validée' },
      'REJETEE': { color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle, label: 'Rejetée' },
      'OUVERTE': { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Clock, label: 'Ouverte' },
      'EN_VALIDATION': { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock, label: 'En Validation' },
      'FERMEE': { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: XCircle, label: 'Fermée' }
    };
    return configs[status];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const numberToWords = (num: number): string => {
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix sept', 'dix huit', 'dix neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante dix', 'quatre vingt', 'quatre vingt dix'];

    if (num === 0) return 'Zéro';
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      const ten = Math.floor(num / 10);
      const unit = num % 10;
      if (ten === 7 || ten === 9) {
        return tens[ten] + (unit > 0 ? ' ' + (unit === 1 ? teens[0] : teens[unit]) : '');
      }
      return tens[ten] + (unit > 0 ? ' ' + units[unit] : '');
    }
    if (num < 1000) {
      const hundred = Math.floor(num / 100);
      const rest = num % 100;
      return (hundred > 1 ? units[hundred] + ' ' : '') + 'cent' + (rest > 0 ? ' ' + numberToWords(rest) : '');
    }
    if (num < 1000000) {
      const thousand = Math.floor(num / 1000);
      const rest = num % 1000;
      return (thousand > 1 ? numberToWords(thousand) + ' ' : '') + 'mille' + (rest > 0 ? ' ' + numberToWords(rest) : '');
    }
    return num.toString();
  };

  const handleGeneratePDF = async (paiement: PaiementDTO) => {
    if (!receiptRef.current) return;

    const amountInWords = numberToWords(paiement.montant);
    const amountText = amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1) + ' Ariary';
    
    const qrData = {
      place: paiement.nomPlaceComplet || paiement.nomPlace || '',
      categorie: paiement.ActiviteMarchands || '',
      date: paiement.datePaiement,
      montant: paiement.montant.toString(),
      quittance: paiement.recuNumero || '',
    };

    // Créer temporairement le contenu du reçu (format 80mm x 120mm)
    const receiptContent = (
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '12px', 
        width: '280px', // ~80mm à 96dpi
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif'
      }}>
        {/* En-tête */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '10px', 
          paddingBottom: '8px', 
          borderBottom: '1px solid #000'
        }}>
          <h1 style={{ 
            fontSize: '11px', 
            fontWeight: 'bold', 
            color: '#000', 
            marginBottom: '2px',
            lineHeight: '1.3'
          }}>
            Commune Urbaine de
          </h1>
          <h1 style={{ 
            fontSize: '11px', 
            fontWeight: 'bold', 
            color: '#000',
            lineHeight: '1.3'
          }}>
            Diego Suarez
          </h1>
        </div>

        {/* Date et N° quittance */}
        <div style={{ 
          marginBottom: '10px',
          fontSize: '9px'
        }}>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontWeight: '600' }}>Date : </span>
            <span>{formatDateShort(paiement.datePaiement)}</span>
          </div>
          <div>
            <span style={{ fontWeight: '600' }}>N° quittance : </span>
            <span>{paiement.recuNumero || 'N/A'}</span>
          </div>
        </div>

        {/* Séparateur */}
        <div style={{ borderTop: '1px dashed #000', marginBottom: '10px' }}></div>

        {/* Détails marchand */}
        <div style={{ marginBottom: '10px', fontSize: '9px' }}>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontWeight: '600' }}>Reçu de : </span>
            <span>{paiement.nomMarchands || 'N/A'}</span>
          </div>
          {paiement.motif && (
            <div style={{ marginBottom: '4px' }}>
              <span style={{ fontWeight: '600' }}>Pour : </span>
              <span>{paiement.motif}</span>
            </div>
          )}
          {paiement.nomPlaceComplet && (
            <div>
              <span style={{ fontWeight: '600' }}>Place : </span>
              <span>{paiement.nomPlaceComplet}</span>
            </div>
          )}
        </div>

        {/* Séparateur */}
        <div style={{ borderTop: '1px dashed #000', marginBottom: '10px' }}></div>

        {/* Montants */}
        <div style={{ 
          marginBottom: '10px',
          fontSize: '9px'
        }}>
          <div style={{ marginBottom: '6px' }}>
            <div style={{ fontWeight: '600', marginBottom: '3px' }}>Somme en lettres :</div>
            <div style={{ fontStyle: 'italic' }}>{amountText}</div>
          </div>
          
          <div style={{ 
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid #000',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '8px', marginBottom: '2px' }}>MONTANT</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
              {paiement.montant.toLocaleString('fr-FR')} Ar
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div style={{ borderTop: '1px dashed #000', marginBottom: '10px' }}></div>

        {/* Pied de page */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontSize: '9px'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '2px', fontSize: '8px', color: '#666' }}>
              Régisseur :
            </div>
            <div style={{ fontWeight: '600', fontSize: '9px' }}>
              {paiement.nomAgent || 'N/A'}
            </div>
          </div>

          <div style={{ 
            border: '1px solid #000', 
            padding: '4px', 
            backgroundColor: '#fff'
          }}>
            <QRCodeSVG 
              value={JSON.stringify(qrData)} 
              size={50} 
              level="M" 
              includeMargin={false} 
            />
          </div>
        </div>

        {/* Message de fin */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '10px',
          paddingTop: '8px',
          borderTop: '1px solid #000',
          fontSize: '8px'
        }}>
          Merci pour votre paiement
        </div>
      </div>
    );

    // Créer un div temporaire
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    document.body.appendChild(tempDiv);

    // Rendre le contenu
    const root = ReactDOM.createRoot(tempDiv);
    root.render(receiptContent);

    // Attendre que le rendu soit terminé
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(tempDiv.firstChild as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 120], // Format ticket de caisse (80mm x 120mm)
      });

      const pdfWidth = 80;
      const pdfHeight = 120;
      const imgWidth = pdfWidth - 10; // Marges de 5mm de chaque côté
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Centrer l'image
      const xOffset = 5;
      const yOffset = 5;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
      pdf.save(`quittance_${paiement.recuNumero || paiement.id}.pdf`);
    } finally {
      // Nettoyer
      root.unmount();
      document.body.removeChild(tempDiv);
    }
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('selectedSession');
    }
    router.back();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!session) return;
    
    const dataStr = JSON.stringify(session, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `session-${session.id}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white border-2 border-red-200 rounded-xl p-8 max-w-md shadow-xl">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-red-800 font-bold text-xl text-center mb-2">Session non trouvée</h3>
          <p className="text-red-600 text-center mb-4">Aucune donnée de session disponible.</p>
          <button
            onClick={handleGoBack}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(session.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Référence cachée pour le rendu */}
      <div ref={receiptRef} style={{ position: 'absolute', left: '-9999px' }} />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Retour aux sessions</span>
          </button>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{session.nomSession}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{formatDate(session.dateSession)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>{session.type}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Printer className="w-5 h-5" />
                Imprimer
              </button>
              <button
              onClick={() => generateSessionExportPDF(session)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
            >
              Exporter Rapport
            </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3 block">Statut</label>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg border-2 ${statusConfig.color}`}>
              <StatusIcon className="w-6 h-6" />
              {statusConfig.label}
            </span>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md p-6">
            <label className="text-xs uppercase tracking-wider text-blue-100 font-semibold mb-3 block">Montant Collecté</label>
            <p className="text-4xl font-bold text-white">{formatAmount(session.montantCollecte)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3 block">Paiements</label>
            <div className="flex items-center gap-3">
              <Receipt className="w-10 h-10 text-blue-500" />
              <p className="text-4xl font-bold text-gray-900">{session.paiements?.length || 0}</p>
            </div>
          </div>
        </div>

        {session.notes && (
          <div className="bg-yellow-50 rounded-xl shadow-sm p-6 mb-8 border-2 border-yellow-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Notes de session
            </h2>
            <p className="text-gray-800 leading-relaxed">{session.notes}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Détails des paiements ({session.paiements?.length || 0})
          </h2>

          {session.paiements && session.paiements.length > 0 ? (
            <div className="space-y-4">
              {session.paiements.map((paiement, index) => (
                <div 
                  key={paiement.id} 
                  className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{formatAmount(paiement.montant)}</p>
                        {paiement.recuNumero && (
                          <p className="text-sm text-gray-500">Reçu: {paiement.recuNumero}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-bold rounded-lg">
                        {paiement.typePaiement}
                      </span>
                      <button
                        onClick={() => handleGeneratePDF(paiement)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                        title="Télécharger le reçu PDF"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    {paiement.nomMarchands && (
                      <div className="flex items-center gap-2">
                        <Store className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Marchand</p>
                          <p className="font-medium text-gray-900">{paiement.nomMarchands}</p>
                        </div>
                      </div>
                    )}

                    {paiement.nomPlaceComplet && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Place</p>
                          <p className="font-medium text-gray-900">{paiement.nomPlaceComplet}</p>
                        </div>
                      </div>
                    )}

                    {paiement.modePaiement && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Mode de paiement</p>
                          <p className="font-medium text-gray-900">{paiement.modePaiement}</p>
                        </div>
                      </div>
                    )}

                    {paiement.datePaiement && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Date de paiement</p>
                          <p className="font-medium text-gray-900">{formatDate(paiement.datePaiement)}</p>
                        </div>
                      </div>
                    )}

                    {paiement.nomAgent && (
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Agent</p>
                          <p className="font-medium text-gray-900">{paiement.nomAgent}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {paiement.motif && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 italic">
                        <span className="font-semibold">Motif:</span> {paiement.motif}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun paiement enregistré</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionDetailPage;