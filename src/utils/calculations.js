export function toMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function calculateFinancials(items = [], discount = 0, taxRate = 0) {
  const subtotal = items.reduce((sum, item) => sum + toMoney(item.total), 0);
  const discountValue = toMoney(discount);
  const taxable = Math.max(subtotal - discountValue, 0);
  const tax = taxable * (toMoney(taxRate) / 100);
  const total = taxable + tax;
  return { subtotal, discount: discountValue, taxable, tax, total, totalAfterDiscount: subtotal - discountValue };
}

export function formatMoney(value) {
  return toMoney(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function nextReceiptNumber(receipts = []) {
  const max = receipts.reduce((m, r) => Math.max(m, parseInt(r.receipt_no, 10) || 0), 105);
  return String(max + 1).padStart(5, '0');
}
