import {
DEFAULT_SETTINGS,
DEMO_CUSTOMERS,
DEMO_PARTS,
DEMO_VEHICLES,
} from '../utils/constants';

import {
readStore,
writeStore,
} from '../utils/storage';

const DEFAULT_RECEIPT_STATUS = 'active';
const DEFAULT_PAYMENT_STATUS = 'unpaid';

/* ======================================================
SETTINGS
====================================================== */

export async function getSettings() {
return readStore(
'settings',
DEFAULT_SETTINGS
);
}

export async function saveSettings(settings) {
writeStore(
'settings',
settings
);

return settings;
}

/* ======================================================
CUSTOMERS
====================================================== */

export async function listCustomers(query = '') {
const customers = readStore(
'customers',
DEMO_CUSTOMERS
);

const search = String(query)
.toLowerCase()
.trim();

return customers
.filter((customer) => {
const searchable = [
customer.name,
customer.phone,
customer.email,
]
.filter(Boolean)
.join(' ')
.toLowerCase();


  return searchable.includes(search);
})
.slice(0, 12);


}

export async function saveCustomer(customer) {
const savedCustomer = {
...customer,


id:
  customer.id ||
  crypto.randomUUID(),

created_at:
  customer.created_at ||
  new Date().toISOString(),


};

const customers = readStore(
'customers',
[]
);

const index =
customers.findIndex(
(item) =>
item.id === savedCustomer.id
);

if (index >= 0) {
customers[index] = savedCustomer;
} else {
customers.unshift(
savedCustomer
);
}

writeStore(
'customers',
customers
);

return savedCustomer;
}

/* ======================================================
VEHICLES
====================================================== */

export async function getVehicles(customerId) {
const vehicles = readStore(
'vehicles',
DEMO_VEHICLES
);

return vehicles.filter(
(vehicle) =>
vehicle.customer_id === customerId
);
}

export async function saveVehicle(vehicle) {
const savedVehicle = {
...vehicle,


id:
  vehicle.id ||
  crypto.randomUUID(),

created_at:
  vehicle.created_at ||
  new Date().toISOString(),


};

const vehicles = readStore(
'vehicles',
[]
);

const index =
vehicles.findIndex(
(item) =>
item.id === savedVehicle.id
);

if (index >= 0) {
vehicles[index] = savedVehicle;
} else {
vehicles.unshift(
savedVehicle
);
}

writeStore(
'vehicles',
vehicles
);

return savedVehicle;
}

/* ======================================================
PARTS
====================================================== */

export async function searchParts(query = '') {
const parts = readStore(
'parts',
DEMO_PARTS
);

const search = String(query)
.toLowerCase()
.trim();

return parts
.filter((part) =>
String(part.name || '')
.toLowerCase()
.includes(search)
)
.slice(0, 12);
}

export async function listParts() {
return readStore(
'parts',
DEMO_PARTS
);
}

export async function upsertParts(parts) {
writeStore(
'parts',
parts
);

return parts;
}

/* ======================================================
RECEIPTS
====================================================== */

export async function listReceipts(filters = {}) {
let receipts = readStore(
'receipts',
[]
);

const search = String(
filters.q || ''
)
.toLowerCase()
.trim();

receipts = receipts.map(
(receipt) => ({
...receipt,


  status:
    receipt.status ||
    DEFAULT_RECEIPT_STATUS,

  payment_status:
    receipt.payment_status ||
    DEFAULT_PAYMENT_STATUS,

  items:
    Array.isArray(receipt.items)
      ? receipt.items
      : [],
})


);

if (search) {
receipts =
receipts.filter(
(receipt) => {
const searchable = [
receipt.receipt_no,
receipt.customer?.name,
receipt.customer?.phone,
receipt.customer?.email,
receipt.vehicle?.vin,
receipt.vehicle?.plate_number,
receipt.vehicle?.make,
receipt.vehicle?.model,
receipt.status,
receipt.payment_status,
]
.filter(Boolean)
.join(' ')
.toLowerCase();


      return searchable.includes(
        search
      );
    }
  );


}

return receipts;
}

/* ======================================================
GET SINGLE RECEIPT
====================================================== */

export async function getReceipt(id) {
const receipts =
await listReceipts();

const receipt =
receipts.find(
(item) =>
String(item.id) ===
String(id)
);

if (!receipt) {
return null;
}

return receipt;
}

/* ======================================================
SAVE RECEIPT
====================================================== */

export async function saveReceipt(receipt) {
const now =
new Date().toISOString();

const payload = {
...receipt,


id:
  receipt.id ||
  crypto.randomUUID(),

created_at:
  receipt.created_at ||
  now,

status:
  receipt.status ||
  DEFAULT_RECEIPT_STATUS,

payment_status:
  receipt.payment_status ||
  DEFAULT_PAYMENT_STATUS,

items:
  Array.isArray(receipt.items)
    ? receipt.items
    : [],

customer:
  receipt.customer || null,

vehicle:
  receipt.vehicle || null,


};

const receipts =
readStore(
'receipts',
[]
);

const index =
receipts.findIndex(
(item) =>
String(item.id) ===
String(payload.id)
);

if (index >= 0) {
receipts[index] = {
...receipts[index],
...payload,
};
} else {
receipts.unshift(
payload
);
}

writeStore(
'receipts',
receipts
);

return payload;
}

/* ======================================================
DELETE RECEIPT
====================================================== */

export async function deleteReceipt(id) {
const receipts =
readStore(
'receipts',
[]
);

const updated =
receipts.filter(
(receipt) =>
String(receipt.id) !==
String(id)
);

writeStore(
'receipts',
updated
);

return true;
}

/* ======================================================
EMPLOYEES
====================================================== */

export async function listEmployees() {
return [
{
id: 'demo-admin',
name: 'Admin',
email: '[admin@demo.local](mailto:admin@demo.local)',
role: 'admin',
},
{
id: 'demo-employee',
name: 'Employee',
email: '[employee@demo.local](mailto:employee@demo.local)',
role: 'employee',
},
];
}
