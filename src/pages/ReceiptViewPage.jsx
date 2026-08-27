import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download, Edit3, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import ReceiptRenderer from '../components/receipt/ReceiptRenderer';
import { getReceipt, getSettings } from '../services/dataService';

export default function ReceiptViewPage() {
  const { id } = useParams();

  const [receipt, setReceipt] = useState(null);
  const [settings, setSettings] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
<<<<<<< HEAD
    Promise.all([getReceipt(id), getSettings()]).then(([r, s]) => {
=======
    Promise.all([
      getReceipt(id),
      getSettings(),
    ]).then(([r, s]) => {
>>>>>>> e9e5f73 (Update receipt download)
      setReceipt(r);
      setSettings(s);
    });
  }, [id]);

  if (!receipt || !settings) {
<<<<<<< HEAD
    return <div className="p-10 text-center">Loading…</div>;
=======
    return (
      <div className="p-10 text-center">
        Loading…
      </div>
    );
>>>>>>> e9e5f73 (Update receipt download)
  }

  const downloadPDF = async () => {
    try {
      setDownloading(true);

      const element = document.querySelector('.receipt-stage');

      if (!element) {
        throw new Error('Receipt element not found');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;
<<<<<<< HEAD
      const availableWidth = pageWidth - margin * 2;

      const imageHeight =
        (canvas.height * availableWidth) / canvas.width;

      let heightLeft = imageHeight;
      let position = margin;
=======
      const width = pageWidth - margin * 2;
      const height = (canvas.height * width) / canvas.width;
>>>>>>> e9e5f73 (Update receipt download)

      pdf.addImage(
        imgData,
        'PNG',
        margin,
<<<<<<< HEAD
        position,
        availableWidth,
        imageHeight
      );

      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight + margin;

        pdf.addPage();

        pdf.addImage(
          imgData,
          'PNG',
          margin,
          position,
          availableWidth,
          imageHeight
        );

        heightLeft -= pageHeight - margin * 2;
      }

      pdf.save(`receipt-${receipt.receipt_no}.pdf`);
    } catch (error) {
      console.error('PDF download failed:', error);
      alert('Unable to download PDF. Please try again.');
=======
        margin,
        width,
        height
      );

      pdf.save(
        `receipt-${receipt.receipt_no}.pdf`
      );
    } catch (error) {
      console.error(
        'PDF generation failed:',
        error
      );

      alert(
        'Unable to download PDF. Please try again.'
      );
>>>>>>> e9e5f73 (Update receipt download)
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <div>
          <Link
            to="/"
            className="text-sm font-bold text-slate-500"
          >
            ← Receipts
          </Link>

          <h1 className="page-title">
            Receipt #{receipt.receipt_no}
          </h1>
        </div>

        <div className="flex gap-2">
          <Link
            className="btn-secondary"
<<<<<<< HEAD
            to={`/receipts/${receipt.id}?edit=1`}
=======
            to={`/receipts/${receipt.id}/edit`}
>>>>>>> e9e5f73 (Update receipt download)
          >
            <Edit3 size={16} />
            Edit
          </Link>

          <button
            className="btn-secondary"
            onClick={() => window.print()}
          >
            <Printer size={16} />
            Print
          </button>

          <button
            className="btn-primary"
            onClick={downloadPDF}
            disabled={downloading}
          >
            <Download size={16} />

<<<<<<< HEAD
            {downloading ? 'Generating PDF...' : 'Download PDF'}
=======
            {downloading
              ? 'Generating PDF...'
              : 'Download PDF'}
>>>>>>> e9e5f73 (Update receipt download)
          </button>
        </div>
      </div>

      <div className="receipt-stage">
        <ReceiptRenderer
          receipt={receipt}
          settings={settings}
        />
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> e9e5f73 (Update receipt download)
