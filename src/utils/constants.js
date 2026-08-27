export const DEFAULT_SETTINGS = {
  company_name: 'MR. TRANSMISSION',
  address: '422 WEST PIKE ST, LAWRENCEVILLE GA 30045',
  phone: '(770) 822-5800',
  fax: '(770) 822-0503',
  email: 'TRANSMISSION.LAWRENCEVILLE@GMAIL.COM',
  logo_url: '/assets/mr-transmission-logo.png',
  tax_rate: 6,
  default_guarantee: '',
  default_notes: 'At Mr. Transmission, we strive to deliver excellent service to all of our customers.\nIf you were satisfied with your experience, please don’t forget to leave us a positive review on Google. Your feedback helps us continue doing the best possible service to our community.\n\nThank you for your business.',
};

export const DEMO_CUSTOMERS = [
  { id: 'c1', name: 'Mike PoisOl', phone: '770-652-3907', address: 'NA', email: 'NA', created_at: '2026-08-26T00:00:00Z' },
  { id: 'c2', name: 'Mike Smith', phone: '770-555-1122', address: '422 West Pike St, Lawrenceville, GA 30045', email: 'mike@example.com', created_at: '2026-08-20T00:00:00Z' },
  { id: 'c3', name: 'Mike Johnson', phone: '770-555-3344', address: '100 Main St, Lawrenceville, GA 30046', email: 'mjohnson@example.com', created_at: '2026-08-15T00:00:00Z' },
];

export const DEMO_VEHICLES = [
  { id: 'v1', customer_id: 'c1', year: '2014', make: 'JEEP', model: 'CHAROKEE', color: 'BLACK', mileage_in: '125193', mileage_out: '125203', engine_size: '3.6', vin: '1C4RJEBG5EC290480', plate_number: 'CY12123' },
];

export const DEMO_PARTS = [
  'Banner Kit',
  'whatever it takes Forward Drum',
  'Selenoides',
  '6R80 TC Torque Converter',
  'Center Support',
  'Power Torque Automatic Transmission Mount',
  'Transtar Industries Transmission Oil Filter',
  'Rear Planet',
  'A750 Filter Filter',
  'Reverse servo and cover',
  'GM Bushing kit',
  'Planet Planet Planet Planet',
  'Piston Kit',
  'Torque Converter',
  'Valvebody',
  'Reprogramming',
  '4.5.6 druh 4.5.6 druh',
  'PUMP',
  '2nd Motor Mount',
  'WIT OIL AND FILTER',
  '99-Direct Drum',
  'Rear Shocks Rear Shocks',
  'Gasket /Seal',
  'Power Torque Automatic Transmission Torque Converter',
  'Duralast Transmission Oil Filter',
  'Valve Body Kit',
  'Reseal Transmission',
  'Auto Zone',
  'Bell Housing',
].map((name, i) => ({ id: `p${i + 1}`, name }));