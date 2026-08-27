import { supabase } from '../lib/supabase';
import { DEFAULT_SETTINGS, DEMO_CUSTOMERS, DEMO_PARTS, DEMO_VEHICLES } from '../utils/constants';
import { readStore, writeStore } from '../utils/storage';

const seedReceipts = () => readStore('receipts', [{
  id: 'demo-00106', receipt_no: '00106', customer_id: 'c1', vehicle_id: 'v1', created_at: '2026-08-26T14:00:00Z',
  customer: DEMO_CUSTOMERS[0], vehicle: DEMO_VEHICLES[0], vehicle_details: '', show_vehicle_details: false,
  items: [
    { id: 'i1', description: 'Installation', qty: 1, total: 890 }, { id: 'i2', description: 'Torque converter', qty: 1, total: 1100 },
    { id: 'i3', description: 'Valve body', qty: 1, total: 890 }, { id: 'i4', description: 'Banner Kit', qty: 1, total: 650 },
    { id: 'i5', description: 'Reprogramming', qty: 1, total: 275 }, { id: 'i6', description: 'OutPut shell', qty: 1, total: 380 },
    { id: 'i7', description: 'P1 Planet', qty: 1, total: 430 }, { id: 'i8', description: 'P2 Planet', qty: 1, total: 485 },
    { id: 'i9', description: 'Hew Pump', qty: 1, total: 700 }, { id: 'i10', description: 'Oil & Filter', qty: 1, total: 325 },
  ], discount: 325, tax_rate: 6, guarantee: '', notes: DEFAULT_SETTINGS.default_notes, signature: '',
}]);

export const isRemote = Boolean(supabase);

export async function getSettings() {
  if (supabase) { const { data, error } = await supabase.from('company_settings').select('*').single(); if (!error && data) return data; }
  return readStore('settings', DEFAULT_SETTINGS);
}
export async function saveSettings(settings) {
  writeStore('settings', settings);
  if (supabase) await supabase.from('company_settings').upsert({ id: settings.id || 1, ...settings });
  return settings;
}
export async function listCustomers(query = '') {
  if (supabase) { const { data } = await supabase.from('customers').select('*').or(`name.ilike.%${query}%,phone.ilike.%${query}%`).order('name').limit(12); return data || []; }
  return DEMO_CUSTOMERS.filter(c => `${c.name} ${c.phone}`.toLowerCase().includes(query.toLowerCase())).slice(0, 12);
}
export async function getVehicles(customerId) {
  if (supabase) { const { data } = await supabase.from('vehicles').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }); return data || []; }
  return DEMO_VEHICLES.filter(v => v.customer_id === customerId);
}
export async function saveCustomer(customer) {
  if (supabase) { const { data, error } = await supabase.from('customers').upsert(customer).select().single(); if (error) throw error; return data; }
  return { ...customer, id: customer.id || crypto.randomUUID(), created_at: customer.created_at || new Date().toISOString() };
}
export async function saveVehicle(vehicle) {
  if (supabase) { const { data, error } = await supabase.from('vehicles').upsert(vehicle).select().single(); if (error) throw error; return data; }
  return { ...vehicle, id: vehicle.id || crypto.randomUUID() };
}
export async function searchParts(query = '') {
  if (supabase) { const { data } = await supabase.from('parts').select('*').ilike('name', `%${query}%`).order('name').limit(12); return data || []; }
  return DEMO_PARTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 12);
}
export async function listParts() {
  if (supabase) { const { data } = await supabase.from('parts').select('*').order('name'); return data || []; }
  return readStore('parts', DEMO_PARTS);
}
export async function upsertParts(parts) {
  writeStore('parts', parts);
  if (supabase) { const { data, error } = await supabase.from('parts').upsert(parts).select(); if (error) throw error; return data; }
  return parts;
}
export async function listReceipts(filters = {}) {
  if (supabase) {
    let q = supabase.from('receipts').select('*, customers(*), vehicles(*), receipt_items(*)').order('created_at', { ascending: false });
    if (filters.q) q = q.or(`receipt_no.ilike.%${filters.q}%`);
    const { data } = await q; return (data || []).map(r => ({ ...r, customer: r.customers, vehicle: r.vehicles, items: r.receipt_items }));
  }
  let rows = seedReceipts();
  if (filters.q) { const q = filters.q.toLowerCase(); rows = rows.filter(r => `${r.receipt_no} ${r.customer?.name} ${r.customer?.phone} ${r.vehicle?.vin}`.toLowerCase().includes(q)); }
  return rows;
}
export async function getReceipt(id) {
  const rows = await listReceipts(); return rows.find(r => r.id === id) || rows[0];
}
export async function saveReceipt(receipt) {
  const isNew = !receipt.id;
  const payload = { ...receipt, id: receipt.id || crypto.randomUUID(), created_at: receipt.created_at || new Date().toISOString() };
  if (supabase) {
    const rpcReceipt = { ...payload, customer: undefined, vehicle: undefined, items: undefined };
    if (isNew) delete rpcReceipt.receipt_no;
    const { data, error } = await supabase.rpc('create_receipt_atomic', {
      p_receipt: rpcReceipt,
      p_items: payload.items || [],
    });
    if (error) throw error; return data;
  }
  const rows = readStore('receipts', []); const index = rows.findIndex(r => r.id === payload.id); if (index >= 0) rows[index] = payload; else rows.unshift(payload); writeStore('receipts', rows); return payload;
}
export async function deleteReceipt(id) {
  if (supabase) { const { error } = await supabase.from('receipts').delete().eq('id', id); if (error) throw error; return true; }
  writeStore('receipts', readStore('receipts', []).filter(r => r.id !== id)); return true;
}
export async function listEmployees() {
  if (supabase) { const { data } = await supabase.from('profiles').select('*').order('name'); return data || []; }
  return [{ id: 'demo-admin', name: 'Admin', email: 'admin@demo.local', role: 'admin' }, { id: 'demo-employee', name: 'Employee', email: 'employee@demo.local', role: 'employee' }];
}
