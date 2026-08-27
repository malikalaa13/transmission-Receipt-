import { formatMoney, calculateFinancials } from '../../utils/calculations';
import './receipt.css';

const text = v => v ?? '';

export default function ReceiptRenderer({ receipt, settings }) {
  const financials = calculateFinancials(receipt.items || [], receipt.discount, receipt.tax_rate ?? settings?.tax_rate ?? 0);
  const c = receipt.customer || {}; const v = receipt.vehicle || {};
  const showDetails = receipt.show_vehicle_details && receipt.vehicle_details;
  return <div className="receipt-page" id="receipt-document">
    <header className="receipt-header">
      <h1>PAYMENT RECEIPT</h1>
      <img className="receipt-logo" src={settings?.logo_url || '/assets/mr-transmission-logo.png'} alt="Company logo" />
      <div className="company-lines">
        <div>{text(settings?.address)}</div>
        <div>PHONE : {text(settings?.phone)} * FAX: {text(settings?.fax)}</div>
        <div>{text(settings?.email)}</div>
      </div>
    </header>

    <section className="receipt-meta">
      <div className="customer-meta">
        <div><b>RECEIPT NO:</b> <span>{text(receipt.receipt_no)}</span></div>
        <div><b>BILLED TO:</b> <span>{text(c.name)}</span></div>
        <div><b>ADDRESS:</b> <span>{text(c.address)}</span></div>
        <div className="spacer" />
        <div><b>PHONE NUMBER :</b> <span>{text(c.phone)}</span></div>
        <div><b>E-MAIL:</b> <span>{text(c.email)}</span></div>
        <div><b>PLATE NUMBER:</b> <span>{text(v.plate_number || c.plate_number)}</span></div>
        <div><b>VIN:</b> <span>{text(v.vin)}</span></div>
      </div>
      <div className="vehicle-meta">
        <div><b>ARRIVE:</b> <span>{text(receipt.arrive_date)}</span></div>
        <div><b>YEAR:</b> <span>{text(v.year)}</span></div>
        <div><b>MAKE:</b> <span>{text(v.make)}</span></div>
        <div><b>MODEL:</b> <span>{text(v.model)}</span></div>
        <div><b>COLOR:</b> <span>{text(v.color)}</span></div>
        <div><b>MILEAGE IN:</b> <span>{text(v.mileage_in)}</span></div>
        <div><b>MILEAGE OUT:</b> <span>{text(v.mileage_out)}</span></div>
        <div><b>ENGINE SIZE:</b> <span>{text(v.engine_size)}</span></div>
      </div>
    </section>

    {showDetails && <section className="receipt-details"><b>VEHICLE DETAILS:</b><div>{text(receipt.vehicle_details)}</div></section>}

    <table className="receipt-items"><colgroup><col/><col className="qty-col"/><col className="total-col"/></colgroup><thead><tr><th>DESCRIPTION</th><th>QTY</th><th>TOTAL</th></tr></thead><tbody>{(receipt.items || []).map((item, i) => <tr key={item.id || i}><td>{text(item.description)}</td><td>{text(item.qty)}</td><td>{formatMoney(item.total)}</td></tr>)}</tbody></table>

    <div className="receipt-lower">
      <div className="guarantee-notes">
        <div className="guarantee"><b>GUARANTEE:</b><div>{text(receipt.guarantee)}</div></div>
        <div className="notes"><b>NOTES:</b><div>{text(receipt.notes)}</div></div>
      </div>
      <div className="totals">
        <div className="rule"/><div><span>SUB-TOTAL:</span><strong>{formatMoney(financials.subtotal)}</strong></div>
        <div><span>DISCOUNT:</span><strong>-{formatMoney(financials.discount)}</strong></div>
        <div><span>TAX:</span><strong>{formatMoney(financials.tax)}</strong></div>
        <div className="final"><span>TOTAL:</span><strong>${formatMoney(financials.total)}</strong></div>
        <div className="signature">SIGNATURE</div>
      </div>
    </div>
  </div>;
}
