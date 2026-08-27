
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


// ==============================
// BLANK VEHICLE
// ==============================

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


// ==============================
// BLANK RECEIPT
// ==============================

const blank = {
  id: null,

  receipt_no: '',

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
};


// ==============================
// PAGE
// ==============================

export default function NewReceiptPage() {
  const { id } = useParams();

  const nav = useNavigate();

  const [receipt, setReceipt] = useState(blank);

  const [settings, setSettings] = useState(null);

  const [vehicles, setVehicles] = useState([]);

  const [saving, setSaving] = useState(false);


  // ==============================
  // LOAD DATA
  // ==============================

  useEffect(() => {
    (async () => {
      const s = await getSettings();

      setSettings(s);

      // EDIT RECEIPT
      if (id) {
        const r = await getReceipt(id);

        setReceipt({
          ...r,

          customer: r.customer || blank.customer,

          vehicle: {
            ...blankVehicle,
            ...(r.vehicle || {}),
          },

          items: r.items || blank.items,
        });

        return;
      }


      // NEW RECEIPT
      const rs = await listReceipts();

      setReceipt((r) => ({
        ...r,

        receipt_no: nextReceiptNumber(rs),

        tax_rate: s.tax_rate,

        guarantee: s.default_guarantee,

        notes: s.default_notes,
      }));
    })();
  }, [id]);


  // ==============================
  // LOAD CUSTOMER VEHICLES
  // ==============================

  useEffect(() => {
    if (receipt.customer?.id) {
      getVehicles(receipt.customer.id).then(setVehicles);
    } else {
      setVehicles([]);
    }
  }, [receipt.customer?.id]);


  // ==============================
  // UPDATE HELPERS
  // ==============================

  const update = (key, value) => {
    setReceipt((r) => ({
      ...r,
      [key]: value,
    }));
  };


  const updateCustomer = (key, value) => {
    setReceipt((r) => ({
      ...r,

      customer: {
        ...r.customer,
        [key]: value,
      },
    }));
  };


  const updateVehicle = (key, value) => {
    setReceipt((r) => ({
      ...r,

      vehicle: {
        ...r.vehicle,
        [key]: value,
      },
    }));
  };


  // ==============================
  // SUBTOTAL
  // ==============================

  const total = useMemo(() => {
    return receipt.items.reduce(
      (sum, item) => sum + (Number(item.total) || 0),
      0
    );
  }, [receipt.items]);


  // ==============================
  // SELECT CUSTOMER
  // ==============================

  const selectCustomer = async (customer) => {
    const saved = await saveCustomer(customer);

    setReceipt((r) => ({
      ...r,

      customer: saved,

      vehicle: {
        ...blankVehicle,
      },
    }));

    const vs = await getVehicles(saved.id);

    setVehicles(vs);
  };


  // ==============================
  // SELECT VEHICLE
  // ==============================

  const selectVehicle = (vehicle) => {
    setReceipt((r) => ({
      ...r,

      vehicle: {
        ...blankVehicle,
        ...vehicle,
      },
    }));
  };


  // ==============================
  // SAVE RECEIPT
  // ==============================

  const save = async () => {
    setSaving(true);

    try {
      const c = await saveCustomer(receipt.customer);

      const v = await saveVehicle({
        ...receipt.vehicle,

        customer_id: c.id,
      });

      const saved = await saveReceipt({
        ...receipt,

        customer_id: c.id,

        vehicle_id: v.id,

        customer: c,

        vehicle: v,
      });

      setReceipt(saved);

      nav(`/receipts/${saved.id}`);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };


  // ==============================
  // RENDER
  // ==============================

  return (
    <div className="print:hidden">

      {/* ==========================
          HEADER
      ========================== */}

      <div className="mb-5 flex items-center justify-between">

        <div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-black"
          >
            <ArrowLeft size={16} />

            Back
          </Link>

          <h1 className="page-title mt-2">
            {id ? 'Edit Receipt' : 'New Receipt'}
          </h1>

        </div>


        <button
          className="btn-primary"
          disabled={saving}
          onClick={save}
        >
          <Save size={17} />

          {saving ? 'Saving…' : 'Save Receipt'}
        </button>

      </div>


      {/* ==========================
          MAIN GRID
      ========================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(500px,1fr)_minmax(620px,0.95fr)]">

        {/* ========================
            LEFT SIDE
        ======================== */}

        <div className="space-y-5">


          {/* ======================
              CUSTOMER
          ====================== */}

          <Section title="CUSTOMER">

            <div className="grid gap-4 md:grid-cols-2">

              <Field label="Customer">

                <CustomerAutocomplete
                  value={receipt.customer.name}
                  onChange={(value) =>
                    updateCustomer('name', value)
                  }
                  onSelect={selectCustomer}
                />

              </Field>


              <Field label="Phone">

                <Input
                  value={receipt.customer.phone}
                  onChange={(e) =>
                    updateCustomer('phone', e.target.value)
                  }
                />

              </Field>


              <Field
                label="Address"
                className="md:col-span-2"
              >

                <AddressAutocomplete
                  value={receipt.customer.address}
                  onChange={(value) =>
                    updateCustomer('address', value)
                  }
                  onSelect={(place) =>
                    updateCustomer(
                      'address',
                      place.formatted_address
                    )
                  }
                />

              </Field>


              <Field label="E-mail">

                <Input
                  value={receipt.customer.email}
                  onChange={(e) =>
                    updateCustomer('email', e.target.value)
                  }
                />

              </Field>

            </div>

          </Section>


          {/* ======================
              VEHICLE
          ====================== */}

          <Section title="VEHICLE">

            {/* SAVED VEHICLES */}

            <div className="mb-4 flex flex-wrap gap-2">

              {vehicles.map((vehicle) => (

                <button
                  type="button"
                  key={vehicle.id}
                  onClick={() => selectVehicle(vehicle)}
                  className="rounded-lg border px-3 py-2 text-xs font-bold hover:bg-slate-50"
                >

                  {vehicle.year}{' '}

                  {vehicle.make}{' '}

                  {vehicle.model}

                  {' · '}

                  {vehicle.plate_number || vehicle.vin}

                </button>

              ))}


              {vehicles.length === 0 && (

                <span className="text-xs text-slate-400">
                  No saved vehicles yet.
                </span>

              )}

            </div>


            {/* VEHICLE FIELDS */}

            <div className="grid gap-4 md:grid-cols-4">

              {/* ARRIVE DATE */}

              <Field label="Arrive Date">

                <Input
                  type="date"
                  value={receipt.arrive_date}
                  onChange={(e) =>
                    update(
                      'arrive_date',
                      e.target.value
                    )
                  }
                />

              </Field>


              {/* PLATE NUMBER */}

              <Field label="Plate Number">

                <Input
                  value={receipt.vehicle.plate_number}
                  onChange={(e) =>
                    updateVehicle(
                      'plate_number',
                      e.target.value
                    )
                  }
                />

              </Field>


              {/* OTHER VEHICLE FIELDS */}

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
                  label={key.replaceAll('_', ' ')}
                >

                  <Input
                    value={receipt.vehicle[key]}
                    onChange={(e) =>
                      updateVehicle(
                        key,
                        e.target.value
                      )
                    }
                  />

                </Field>

              ))}

            </div>

          </Section>


          {/* ======================
              VEHICLE DETAILS
          ====================== */}

          <Section title="VEHICLE DETAILS">

            <Textarea
              value={receipt.vehicle_details}
              onChange={(e) =>
                update(
                  'vehicle_details',
                  e.target.value
                )
              }
              placeholder="Customer-reported issue, symptoms, inspection notes…"
            />


            <label className="mt-3 flex items-center gap-2 text-xs font-bold">

              <input
                type="checkbox"
                checked={receipt.show_vehicle_details}
                onChange={(e) =>
                  update(
                    'show_vehicle_details',
                    e.target.checked
                  )
                }
              />

              Show Vehicle Details on printed receipt

            </label>

          </Section>


          {/* ======================
              PARTS / SERVICES
          ====================== */}

          <Section
            title="PARTS / SERVICES"
            actions={
              <span className="text-xs text-slate-400">
                Total is entered manually per line
              </span>
            }
          >

            <div className="space-y-2">

              {receipt.items.map((item, index) => (

                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_80px_120px_40px] gap-2 items-center"
                >

                  <PartAutocomplete
                    value={item.description}
                    onChange={(value) => {

                      const items = [
                        ...receipt.items,
                      ];

                      items[index] = {
                        ...items[index],
                        description: value,
                      };

                      update('items', items);
                    }}
                    onSelect={(part) => {

                      const items = [
                        ...receipt.items,
                      ];

                      items[index] = {
                        ...items[index],
                        description: part.name,
                      };

                      update('items', items);
                    }}
                  />


                  <Input
                    type="number"
                    min="0"
                    value={item.qty}
                    onChange={(e) => {

                      const items = [
                        ...receipt.items,
                      ];

                      items[index] = {
                        ...items[index],
                        qty: e.target.value,
                      };

                      update('items', items);
                    }}
                  />


                  <Input
                    type="number"
                    step="0.01"
                    value={item.total}
                    onChange={(e) => {

                      const items = [
                        ...receipt.items,
                      ];

                      items[index] = {
                        ...items[index],
                        total: e.target.value,
                      };

                      update('items', items);
                    }}
                    placeholder="0.00"
                  />


                  <button
                    type="button"
                    className="icon-btn text-red-600"
                    onClick={() =>
                      update(
                        'items',
                        receipt.items.filter(
                          (x) => x.id !== item.id
                        )
                      )
                    }
                  >

                    <Trash2 size={16} />

                  </button>

                </div>

              ))}


              <button
                type="button"
                className="btn-secondary mt-2"
                onClick={() =>
                  update(
                    'items',
                    [
                      ...receipt.items,

                      {
                        id: crypto.randomUUID(),
                        description: '',
                        qty: 1,
                        total: '',
                      },
                    ]
                  )
                }
              >

                <Plus size={16} />

                Add Row

              </button>

            </div>

          </Section>


          {/* ======================
              FINANCIALS
          ====================== */}

          <Section title="FINANCIALS">

            <div className="grid gap-4 md:grid-cols-3">

              <Field label="Subtotal">

                <Input
                  value={total.toFixed(2)}
                  readOnly
                />

              </Field>


              <Field label="Discount">

                <Input
                  type="number"
                  step="0.01"
                  value={receipt.discount}
                  onChange={(e) =>
                    update(
                      'discount',
                      e.target.value
                    )
                  }
                />

              </Field>


              <Field label="Tax Rate %">

                <Input
                  type="number"
                  step="0.01"
                  value={receipt.tax_rate}
                  onChange={(e) =>
                    update(
                      'tax_rate',
                      e.target.value
                    )
                  }
                />

              </Field>

            </div>

          </Section>


          {/* ======================
              GUARANTEE
          ====================== */}

          <Section title="GUARANTEE">

            <Textarea
              value={receipt.guarantee}
              onChange={(e) =>
                update(
                  'guarantee',
                  e.target.value
                )
              }
              placeholder="Default guarantee text can be set in Settings."
            />

          </Section>


          {/* ======================
              NOTES
          ====================== */}

          <Section title="NOTES">

            <Textarea
              value={receipt.notes}
              onChange={(e) =>
                update(
                  'notes',
                  e.target.value
                )
              }
            />

          </Section>

        </div>


        {/* ========================
            RIGHT SIDE / PREVIEW
        ======================== */}

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
            settings={settings || {}}
          />

        </div>

      </div>

    </div>
  );
}

