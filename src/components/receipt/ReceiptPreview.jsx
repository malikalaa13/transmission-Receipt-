import ReceiptRenderer from './ReceiptRenderer';
export default function ReceiptPreview({ receipt, settings }) { return <div className="receipt-preview-wrap"><ReceiptRenderer receipt={receipt} settings={settings}/></div>; }
