import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Save, Trash2, ArrowLeft } from 'lucide-react';

import {
Field,
Input,
Section,
Textarea,
} from '../components/ui';

import CustomerAutocomplete from '../components/autocomplete/CustomerAutocomplete';
import AddressAutocomplete from '../components/autocomplete/AddressAutocomplete';
import PartAutocomplete from '../components/autocomplete/PartAutocomplete';
import ReceiptPreview from '../components/receipt/ReceiptPreview';

import {
getReceipt,
getSettings,
getVehicles,
saveCustomer,
saveReceipt,
saveVehicle,
listReceipts,
} from '../services/dataService';

import { nextReceiptNumber } from '../utils/calculations';

const blankVehicle = {
year: '',
make: '',
model: '',
color: '',
mileage_in: '',
mileage_out: '',
engine_size: '',
vin: '',
plate_number: '',
};

const createBlankReceipt = () => ({
id: null,
receipt_no: '',
status: 'active',
payment_status: 'unpaid',

arrive_date: new Date().toISOString().slice(0, 10),

customer: {
id: '',
name: '',
phone: '',
address: '',
email: '',
},

vehicle: {
...blankVehicle,
},

vehicle_details: '',
show_vehicle_details: false,

items: [
{
id: crypto.randomUUID(),
description: '',
qty: 1,
total: '',
},
],

discount: '',
tax_rate: 6,
guarantee: '',
notes: '',
signature: '',
});

export default function NewReceiptPage() {
const { id } = useParams();
const nav = useNavigate();

const [receipt, setReceipt] = useState(createBlankReceipt);
const [settings, setSettings] = useState(null);
const [vehicles, setVehicles] = useState([]);
const [saving, setSaving] = useState(false);

useEffect(() => {
let mounted = true;


async function loadData() {
  try {
    const appSettings = await getSettings();

    if (!mounted) return;

    setSettings(appSettings);

    if (id) {
      const existingReceipt = await getReceipt(id);

      if (!mounted) return;

      if (!existingReceipt) {
        alert('Receipt not found.');
        nav('/');
        return;
      }

      setReceipt({
        ...createBlankReceipt(),
        ...existingReceipt,

        status:
          existingReceipt.status || 'active',

        payment_status:
          existingReceipt.payment_status || 'unpaid',

        customer: {
          id: '',
          name: '',
          phone: '',
          address: '',
          email: '',
          ...(existingReceipt.customer || {}),
        },

        vehicle: {
          ...blankVehicle,
          ...(existingReceipt.vehicle || {}),
        },

        items:
          Array.isArray(existingReceipt.items) &&
          existingReceipt.items.length > 0
            ? existingReceipt.items
            : [
                {
                  id: crypto.randomUUID(),
                  description: '',
                  qty: 1,
                  total: '',
                },
              ],
      });

      return;
    }

    const receipts = await listReceipts();

    if (!mounted) return;

    setReceipt((current) => ({
      ...current,

      receipt_no: nextReceiptNumber(receipts),

      status: 'active',

      payment_status: 'unpaid',

      tax_rate:
        appSettings?.tax_rate ??
        current.tax_rate,

      guarantee:
        appSettings?.default_guarantee ??
        current.guarantee,

      notes:
        appSettings?.default_notes ??
        current.notes,
    }));
  } catch (error) {
    console.error(
      'Failed to load receipt:',
      error
    );
  }
}

loadData();

return () => {
  mounted = false;
};


}, [id, nav]);

useEffect(() => {
if (!receipt.customer?.id) {
setVehicles([]);
return;
}


getVehicles(receipt.customer.id)
  .then((data) => {
    setVehicles(data || []);
  })
  .catch((error) => {
    console.error(
      'Failed to load vehicles:',
      error
    );

    setVehicles([]);
  });


}, [receipt.customer?.id]);

const update = (key, value) => {
setReceipt((current) => ({
...current,
[key]: value,
}));
};

const updateCustomer = (key, value) => {
setReceipt((current) => ({
...current,


  customer: {
    ...current.customer,
    [key]: value,
  },
}));


};

const updateVehicle = (key, value) => {
setReceipt((current) => ({
...current,


  vehicle: {
    ...current.vehicle,
    [key]: value,
  },
}));


};

const subtotal = useMemo(() => {
return receipt.items.reduce(
(sum, item) =>
sum +
(Number(item.total) || 0),
0
);
}, [receipt.items]);

const selectCustomer = async (customer) => {
try {
const savedCustomer =
await saveCustomer(customer);


  setReceipt((current) => ({
    ...current,

    customer: savedCustomer,

    vehicle: {
      ...blankVehicle,
    },
  }));

  const savedVehicles =
    await getVehicles(savedCustomer.id);

  setVehicles(savedVehicles || []);
} catch (error) {
  console.error(
    'Failed to save customer:',
    error
  );

  alert(
    error?.message ||
      'Unable to save customer.'
  );
}


};

const selectVehicle = (vehicle) => {
setReceipt((current) => ({
...current,


  vehicle: {
    ...blankVehicle,
    ...vehicle,
  },
}));


};

const updateItem = (index, key, value) => {
setReceipt((current) => {
const items = [...current.items];


  items[index] = {
    ...items[index],
    [key]: value,
  };

  return {
    ...current,
    items,
  };
});


};

const addItem = () => {
setReceipt((current) => ({
...current,


  items: [
    ...current.items,

    {
      id: crypto.randomUUID(),
      description: '',
      qty: 1,
      total: '',
    },
  ],
}));


};

const removeItem = (itemId) => {
setReceipt((current) => ({
...current,


  items: current.items.filter(
    (item) =>
      item.id !== itemId
  ),
}));


};

const save = async () => {
if (saving) return;


if (!receipt.customer?.name?.trim()) {
  alert('Please enter customer name.');
  return;
}

setSaving(true);

try {
  const customer =
    await saveCustomer(
      receipt.customer
    );

  const vehicle =
    await saveVehicle({
      ...receipt.vehicle,
      customer_id: customer.id,
    });

  const saved =
    await saveReceipt({
      ...receipt,

      customer_id:
        customer.id,

      vehicle_id:
        vehicle.id,

      customer,

      vehicle,

      status:
        receipt.status ||
        'active',

      payment_status:
        receipt.payment_status ||
        'unpaid',

      items:
        Array.isArray(
          receipt.items
        )
          ? receipt.items
          : [],
    });

  setReceipt((current) => ({
    ...current,

    ...saved,

    status:
      saved.status ||
      current.status ||
      'active',

    payment_status:
      saved.payment_status ||
      current.payment_status ||
      'unpaid',
  }));

  nav(`/receipts/${saved.id}`);
} catch (error) {
  console.error(
    'Failed to save receipt:',
    error
  );

  alert(
    error?.message ||
      'Unable to save receipt.'
  );
} finally {
  setSaving(false);
}


};

return ( <div className="print:hidden">


  <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

    <div>
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-black"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <h1 className="page-title mt-2">
        {id
          ? 'Edit Receipt'
          : 'New Receipt'}
      </h1>
    </div>

    <button
      type="button"
      className="btn-primary w-full sm:w-auto"
      disabled={saving}
      onClick={save}
    >
      <Save size={17} />

      {saving
        ? 'Saving...'
        : 'Save Receipt'}
    </button>

  </div>

  <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(500px,1fr)_minmax(620px,0.95fr)]">

    <div className="space-y-5">

      <Section title="CUSTOMER">

        <div className="grid gap-4 md:grid-cols-2">

          <Field label="Customer">

            <CustomerAutocomplete
              value={
                receipt.customer?.name ||
                ''
              }

              onChange={(value) =>
                updateCustomer(
                  'name',
                  value
                )
              }

              onSelect={
                selectCustomer
              }
            />

          </Field>

          <Field label="Phone">

            <Input
              value={
                receipt.customer?.phone ||
                ''
              }

              onChange={(event) =>
                updateCustomer(
                  'phone',
                  event.target.value
                )
              }
            />

          </Field>

          <Field
            label="Address"
            className="md:col-span-2"
          >

            <AddressAutocomplete
              value={
                receipt.customer?.address ||
                ''
              }

              onChange={(value) =>
                updateCustomer(
                  'address',
                  value
                )
              }

              onSelect={(place) =>
                updateCustomer(
                  'address',
                  place?.formatted_address ||
                    place?.display_name ||
                    ''
                )
              }
            />

          </Field>

          <Field label="E-mail">

            <Input
              type="email"
              value={
                receipt.customer?.email ||
                ''
              }

              onChange={(event) =>
                updateCustomer(
                  'email',
                  event.target.value
                )
              }
            />

          </Field>

        </div>

      </Section>

      <Section title="VEHICLE">

        <div className="mb-4 flex flex-wrap gap-2">

          {vehicles.map(
            (vehicle) => (
              <button
                type="button"
                key={vehicle.id}
                onClick={() =>
                  selectVehicle(
                    vehicle
                  )
                }
                className="rounded-lg border px-3 py-2 text-xs font-bold hover:bg-slate-50"
              >
                {vehicle.year}{' '}
                {vehicle.make}{' '}
                {vehicle.model}
                {' · '}
                {vehicle.plate_number ||
                  vehicle.vin}
              </button>
            )
          )}

          {vehicles.length === 0 && (
            <span className="text-xs text-slate-400">
              No saved vehicles yet.
            </span>
          )}

        </div>

        <div className="grid gap-4 md:grid-cols-4">

          <Field label="Arrive Date">

            <Input
              type="date"
              value={
                receipt.arrive_date ||
                ''
              }

              onChange={(event) =>
                update(
                  'arrive_date',
                  event.target.value
                )
              }
            />

          </Field>

          <Field label="Plate Number">

            <Input
              value={
                receipt.vehicle
                  ?.plate_number ||
                ''
              }

              onChange={(event) =>
                updateVehicle(
                  'plate_number',
                  event.target.value
                )
              }
            />

          </Field>

          {[
            'year',
            'make',
            'model',
            'color',
            'mileage_in',
            'mileage_out',
            'engine_size',
            'vin',
          ].map((key) => (

            <Field
              key={key}
              label={key.replaceAll(
                '_',
                ' '
              )}
            >

              <Input
                value={
                  receipt.vehicle?.[
                    key
                  ] || ''
                }

                onChange={(event) =>
                  updateVehicle(
                    key,
                    event.target.value
                  )
                }
              />

            </Field>

          ))}

        </div>

      </Section>

      <Section title="VEHICLE DETAILS">

        <Textarea
          value={
            receipt.vehicle_details ||
            ''
          }

          onChange={(event) =>
            update(
              'vehicle_details',
              event.target.value
            )
          }

          placeholder="Customer-reported issue, symptoms, inspection notes..."
        />

        <label className="mt-3 flex items-center gap-2 text-xs font-bold">

          <input
            type="checkbox"
            checked={
              Boolean(
                receipt.show_vehicle_details
              )
            }

            onChange={(event) =>
              update(
                'show_vehicle_details',
                event.target.checked
              )
            }
          />

          Show Vehicle Details on printed receipt

        </label>

      </Section>

      <Section
        title="PARTS / SERVICES"
        actions={
          <span className="text-xs text-slate-400">
            Total is entered manually per line
          </span>
        }
      >

        <div className="space-y-2">

          {receipt.items.map(
            (item, index) => (

              <div
                key={item.id}
                className="grid grid-cols-[1fr_80px_120px_40px] items-center gap-2"
              >

                <PartAutocomplete
                  value={
                    item.description ||
                    ''
                  }

                  onChange={(value) =>
                    updateItem(
                      index,
                      'description',
                      value
                    )
                  }

                  onSelect={(part) =>
                    updateItem(
                      index,
                      'description',
                      part?.name || ''
                    )
                  }
                />

                <Input
                  type="number"
                  min="0"
                  value={
                    item.qty ?? 1
                  }

                  onChange={(event) =>
                    updateItem(
                      index,
                      'qty',
                      event.target.value
                    )
                  }
                />

                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={
                    item.total ?? ''
                  }

                  onChange={(event) =>
                    updateItem(
                      index,
                      'total',
                      event.target.value
                    )
                  }

                  placeholder="0.00"
                />

                <button
                  type="button"
                  className="icon-btn text-red-600"
                  onClick={() =>
                    removeItem(
                      item.id
                    )
                  }
                >
                  <Trash2 size={16} />
                </button>

              </div>

            )
          )}

          <button
            type="button"
            className="btn-secondary mt-2"
            onClick={addItem}
          >
            <Plus size={16} />
            Add Row
          </button>

        </div>

      </Section>

      <Section title="FINANCIALS">

        <div className="grid gap-4 md:grid-cols-3">

          <Field label="Subtotal">

            <Input
              value={
                subtotal.toFixed(2)
              }
              readOnly
            />

          </Field>

          <Field label="Discount">

            <Input
              type="number"
              step="0.01"
              min="0"
              value={
                receipt.discount ?? ''
              }

              onChange={(event) =>
                update(
                  'discount',
                  event.target.value
                )
              }
            />

          </Field>

          <Field label="Tax Rate %">

            <Input
              type="number"
              step="0.01"
              min="0"
              value={
                receipt.tax_rate ?? 6
              }

              onChange={(event) =>
                update(
                  'tax_rate',
                  event.target.value
                )
              }
            />

          </Field>

        </div>

      </Section>

      <Section title="RECEIPT STATUS">

        <div className="grid gap-4 md:grid-cols-2">

          <Field label="Receipt Status">

            <select
              value={
                receipt.status ||
                'active'
              }

              onChange={(event) =>
                update(
                  'status',
                  event.target.value
                )
              }

              className="input w-full"
            >

              <option value="active">
                Active
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="cancelled">
                Cancelled
              </option>

            </select>

          </Field>

          <Field label="Payment Status">

            <select
              value={
                receipt.payment_status ||
                'unpaid'
              }

              onChange={(event) =>
                update(
                  'payment_status',
                  event.target.value
                )
              }

              className="input w-full"
            >

              <option value="unpaid">
                Unpaid
              </option>

              <option value="partial">
                Partially Paid
              </option>

              <option value="paid">
                Paid
              </option>

            </select>

          </Field>

        </div>

      </Section>

      <Section title="GUARANTEE">

        <Textarea
          value={
            receipt.guarantee || ''
          }

          onChange={(event) =>
            update(
              'guarantee',
              event.target.value
            )
          }

          placeholder="Default guarantee text can be set in Settings."
        />

      </Section>

      <Section title="NOTES">

        <Textarea
          value={
            receipt.notes || ''
          }

          onChange={(event) =>
            update(
              'notes',
              event.target.value
            )
          }
        />

      </Section>

    </div>

    <div className="xl:sticky xl:top-24 xl:h-[calc(100vh-7rem)] xl:overflow-auto">

      <div className="mb-3 flex items-center justify-between print:hidden">

        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
          Live A4 Preview
        </span>

        <span className="text-xs text-slate-400">
          Same renderer used for print/PDF
        </span>

      </div>

      <ReceiptPreview
        receipt={receipt}
        settings={
          settings || {}
        }
      />

    </div>

  </div>

</div>


);
}
