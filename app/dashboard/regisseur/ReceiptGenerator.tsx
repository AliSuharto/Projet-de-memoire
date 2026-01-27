'use client';

import React, { useRef } from 'react';
import { Printer, Download, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReceiptData {
  merchantName: string;
  cin: string;
  place: string;
  category: string;
  motif?: string;
  amount: string;
  amountText: string;
  receiptNumber: string;
  paymentDate: string;
  periodStart?: string;
  periodEnd?: string;
  agentName: string;
  paymentType: string;
}

interface ReceiptGeneratorProps {
  data: ReceiptData;
  onCancel: () => void;
  onComplete: () => void;
}

export default function ReceiptGenerator({ data, onCancel, onComplete }: ReceiptGeneratorProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const qrData = {
    place: data.place,
    categorie: data.category,
    date: data.paymentDate,
    montant: data.amount,
    quittance: data.receiptNumber,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;

    const canvas = await html2canvas(receiptRef.current, {
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
    pdf.save(`quittance_${data.receiptNumber}.pdf`);
  };

  // Composant réutilisable pour le reçu (format ticket de caisse)
  const ReceiptContent = () => ( 
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
          <span>{formatDate(data.paymentDate)}</span>
        </div>
        <div>
          <span style={{ fontWeight: '600' }}>N° quittance : </span>
          <span>{data.receiptNumber}</span>
        </div>
      </div>

      {/* Séparateur */}
      <div style={{ borderTop: '1px dashed #000', marginBottom: '10px' }}></div>

      {/* Détails marchand */}
      <div style={{ marginBottom: '10px', fontSize: '9px' }}>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ fontWeight: '600' }}>Reçu de : </span>
          <span>{data.merchantName}</span>
        </div>
        {data.motif && (
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontWeight: '600' }}>Pour : </span>
            <span>{data.motif}</span>
          </div>
        )}
        {data.place && (
          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontWeight: '600' }}>Place : </span>
            <span>{data.place}</span>
          </div>
        )}
        {data.category && (
          <div>
            <span style={{ fontWeight: '600' }}>Catégorie : </span>
            <span>{data.category}</span>
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
          <div style={{ fontStyle: 'italic' }}>{data.amountText}</div>
        </div>
        
        <div style={{ 
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid #000',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '8px', marginBottom: '2px' }}>MONTANT</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
            {data.amount} Ar
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
            {data.agentName}
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

  return (
    <>
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area,
          .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-duplicate {
            display: none !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 bg-black modal-overlay bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-4">
          {/* Header (non imprimé) */}
          <div className="no-print" style={{ 
            background: 'linear-gradient(to right, #2563eb, #1d4ed8)', 
            color: 'white', 
            padding: '16px 24px', 
            borderTopLeftRadius: '12px', 
            borderTopRightRadius: '12px' 
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                  Aperçu du Reçu
                </h2>
                <p style={{ color: '#bfdbfe', fontSize: '14px', marginTop: '4px' }}>
                  Vérifiez avant impression
                </p>
              </div>
              <button 
                onClick={onCancel} 
                className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
                style={{ 
                  padding: '8px', 
                  background: 'transparent', 
                  border: 'none', 
                  cursor: 'pointer',
                  borderRadius: '8px'
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Zone d'aperçu */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Reçu visible à l'écran (référence pour PDF) */}
            <div ref={receiptRef} className="print-area">
              <ReceiptContent />
            </div>

            {/* Deux copies uniquement pour l'impression */}
            <div className="print-duplicate hidden">
              <div className="receipt-copy">
                <ReceiptContent />
              </div>
              <div className="receipt-copy">
                <ReceiptContent />
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="no-print bg-gray-50 px-6 py-4 rounded-b-xl border-t flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm"
            >
              <X size={18} />
              Annuler
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
            >
              <Download size={18} />
              PDF
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
            >
              <Printer size={18} />
              Imprimer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}