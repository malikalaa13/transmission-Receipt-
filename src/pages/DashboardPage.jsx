import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Download,
  Edit3,
  Eye,
  Printer,
  Search,
  Trash2,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import {
  deleteReceipt,
  listReceipts,
  getSettings,
} from '../services/dataService';

import {
  calculateFinancials,
  formatMoney,
} from '../utils/calculations';

export default function DashboardPage() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [settings, setSettings] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const nav = useNavigate();

  const load = () =>
    Promise.all([
      listReceipts({ q }),
      getSettings(),
    ]).then(([r, s]) => {
      setRows(r);
      setSettings(s);
    });

  useEffect(() => {
    load();
  }, [q]);

  const pdf = async (receipt) => {
    try {
      setDownloading(true);

      /*
       * Open the receipt page temporarily so we can
       * capture the exact ReceiptRenderer design.
       */
      nav(`/receipts/${receipt.id}`);

      setTimeout(async () => {
        try {
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

          const pdfFile = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });

          const pageWidth = pdfFile.internal.pageSize.getWidth();
          const pageHeight = pdfFile.internal.pageSize.getHeight();

          const margin = 10;
          const width = pageWidth - margin * 2;
          const height = (canvas.height * width) / canvas.width;

          pdfFile.addImage(
            imgData,
            'PNG',
            margin,
            margin,
            width,
            height
          );

          pdfFile.save(`receipt-${receipt.receipt_no}.pdf`);
        } catch (error) {
          console.error('PDF generation failed:', error);
          alert('Unable to download PDF.');
        } finally {
          setDownloading(false);
        }
      }, 500);
    } catch (error) {
      console.error(error);
      setDownloading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">WORKSHOP</p>

          <h1 className="page-title">
            Payment Receipts
          </h1>

          <p className="text-sm text-slate-500">
            Create, search, edit and print customer repair receipts.
          </p>
        </div>

        <Link
          to="/receipts/new"
          className="btn-primary"
        >
          + NEW RECEIPT
        </Link>
      </div>

      <div className="card mb-5 p-4">
        <div className="relative">
          <input
            className="input pl-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search receipt number, customer, phone or VIN"
          />

          <Search
            className="absolute left-3 top-3 text-slate-400"
            size={18}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">
                  Receipt
                </th>

                <th className="px-5 py-3">
                  Customer
                </th>

                <th className="px-5 py-3">
                  Vehicle
                </th>

                <th className="px-5 py-3">
                  Date
                </th>

                <th className="px-5 py-3 text-right">
                  Total
                </th>

                <th className="px-5 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => {
                const f = calculateFinancials(
                  r.items,
                  r.discount,
                  r.tax_rate
                );

                return (
                  <tr
                    key={r.id}
                    className="border-t"
                  >
                    <td className="px-5 py-4 font-black">
                      #{r.receipt_no}
                    </td>

                    <td className="px-5 py-4">
                      {r.customer?.name || '—'}

                      <div className="text-xs text-slate-400">
                        {r.customer?.phone}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {[
                        r.vehicle?.year,
                        r.vehicle?.make,
                        r.vehicle?.model,
                      ]
                        .filter(Boolean)
                        .join(' ') || '—'}

                      <div className="text-xs text-slate-400">
                        {r.vehicle?.vin}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {new Date(
                        r.created_at
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 text-right font-black">
                      ${formatMoney(f.total)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          className="icon-btn"
                          title="View"
                          onClick={() =>
                            nav(`/receipts/${r.id}`)
                          }
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          className="icon-btn"
                          title="Edit"
                          onClick={() =>
                            nav(`/receipts/${r.id}/edit`)
                          }
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          className="icon-btn"
                          title="Print"
                          onClick={() => {
                            nav(`/receipts/${r.id}`);

                            setTimeout(
                              () => window.print(),
                              250
                            );
                          }}
                        >
                          <Printer size={16} />
                        </button>

                        <button
                          className="icon-btn"
                          title="Download PDF"
                          disabled={downloading}
                          onClick={() => pdf(r)}
                        >
                          <Download size={16} />
                        </button>

                        <button
                          className="icon-btn text-red-600"
                          title="Delete"
                          onClick={async () => {
                            if (
                              confirm(
                                'Delete this receipt?'
                              )
                            ) {
                              await deleteReceipt(r.id);
                              load();
                            }
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="p-10 text-center text-slate-500">
            No receipts found.
          </div>
        )}
      </div>
    </div>
  );
}