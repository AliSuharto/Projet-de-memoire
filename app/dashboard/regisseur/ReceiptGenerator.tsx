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
      format: 'a4',
    });

    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`quittance_${data.receiptNumber}.pdf`);
  };

  // Composant réutilisable pour le reçu (évite la duplication de code)
  const ReceiptContent = () => ( 
    <div  style={{ 
      
      backgroundColor: '#ffffff', 
      border: '2px solid #d1d5db', 
      borderRadius: '8px', 
      padding: '32px', 
      maxWidth: '512px', 
      margin: '0 auto',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    }}>
      {/* En-tête */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '24px', 
        paddingBottom: '16px', 
        borderBottom: '2px solid #d1d5db' 
      }}>
        <h1 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          color: '#111827', 
          marginBottom: '4px' 
        }}>
          Commune Urbaine de Diego Suarez
        </h1>
        <div style={{ 
          height: '2px', 
          width: '160px', 
          backgroundColor: '#9ca3af', 
          margin: '8px auto 0' 
        }}></div>
      </div>

      {/* Infos principales */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '16px', 
        marginBottom: '20px' 
      }}>
        <div>
          <p style={{ fontSize: '12px', color: '#4b5563', marginBottom: '4px' }}>
            Date de Paiement :
          </p>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>
            {formatDate(data.paymentDate)}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '12px', color: '#4b5563', marginBottom: '4px' }}>
            N° quittance :
          </p>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>
            {data.receiptNumber}
          </p>
        </div>
      </div>

      {/* Détails */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '14px', color: '#111827', marginBottom: '8px' }}>
          <span style={{ fontWeight: '600' }}>Reçu de :</span> {data.merchantName}
        </p>
        {data.motif && (
          <p style={{ fontSize: '14px', color: '#111827' }}>
            <span style={{ fontWeight: '600' }}>Pour :</span> {data.motif}
          </p>
        )}
      </div>

      {/* Montants */}
      <div style={{ 
        backgroundColor: '#f9fafb', 
        border: '1px solid #d1d5db', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '20px' 
      }}>
        <p style={{ fontSize: '12px', color: '#111827', marginBottom: '8px' }}>
          <span style={{ fontWeight: '600' }}>Somme en lettres :</span>
        </p>
        <p style={{ fontSize: '14px', color: '#111827', marginBottom: '12px' }}>
          {data.amountText}
        </p>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingTop: '8px', 
          borderTop: '1px solid #d1d5db' 
        }}>
          <span style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>
            Somme en chiffres :
          </span>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
            {data.amount} Ar
          </span>
        </div>
      </div>

      {/* Pied de page */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end' 
      }}>
        <div>
          <p style={{ fontSize: '12px', color: '#4b5563', marginBottom: '4px' }}>
            Nom du régisseur :
          </p>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
            {data.agentName}
          </p>
        </div>

        <div style={{ 
          border: '1px solid #d1d5db', 
          padding: '8px', 
          backgroundColor: '#ffffff', 
          borderRadius: '4px' 
        }}>
          <QRCodeSVG 
            value={JSON.stringify(qrData)} 
            size={96} 
            level="M" 
            includeMargin={false} 
          />
        </div>
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