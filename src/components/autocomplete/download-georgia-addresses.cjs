const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'data');
const OUTPUT_FILE = path.join(
  OUTPUT_DIR,
  'georgia-addresses.json'
);

// Official Census Geocoder
const GEOCODER_URL =
  'https://geocoding.geo.census.gov/geocoder/locations/address';

const TEST_ADDRESSES = [
  '422 West Pike St, Lawrenceville, GA 30045',
  '65 Lawrenceville St, Norcross, GA 30071',
  '100 Cherokee St, Marietta, GA 30090',
  '200 Piedmont Ave SE, Atlanta, GA 30334',
  '206 Washington St SW, Atlanta, GA 30334',
  '2500 Walton Way, Augusta, GA 30904',
  '823 Telfair Street, Augusta, GA 30901',
  '2025 Baxter St, Athens, GA 30606',
  '1332 Southern Dr, Statesboro, GA 30458',
  '1601 Maple St, Carrollton, GA 30118',
];

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[.,#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function geocode(address) {
  const params = new URLSearchParams({
    address,
    benchmark: 'Public_AR_Current',
    format: 'json',
  });

  const response = await fetch(
    `${GEOCODER_URL}?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(
      `Census API returned ${response.status}`
    );
  }

  const json = await response.json();

  const matches =
    json?.result?.addressMatches || [];

  if (!matches.length) {
    return null;
  }

  const match = matches[0];

  const addressComponents =
    match.addressComponents || {};

  return {
    address: addressComponents.streetName
      ? `${addressComponents.addressNumber || ''} ${addressComponents.streetName || ''} ${addressComponents.streetSuffix || ''}`
          .replace(/\s+/g, ' ')
          .trim()
      : address,

    city:
      addressComponents.city || '',

    state:
      addressComponents.state || 'GA',

    zip:
      addressComponents.zip || '',

    formatted:
      match.matchedAddress || address,

    lat:
      match.coordinates?.y ?? null,

    lng:
      match.coordinates?.x ?? null,
  };
}

async function main() {
  console.log('');
  console.log('==========================================');
  console.log(' Georgia Local Address Database');
  console.log(' U.S. Census Geocoder');
  console.log('==========================================');
  console.log('');

  fs.mkdirSync(OUTPUT_DIR, {
    recursive: true,
  });

  const results = [];

  for (let i = 0; i < TEST_ADDRESSES.length; i++) {
    const address = TEST_ADDRESSES[i];

    process.stdout.write(
      `[${i + 1}/${TEST_ADDRESSES.length}] ${address} ... `
    );

    try {
      const result = await geocode(address);

      if (!result) {
        console.log('NOT FOUND');
        continue;
      }

      results.push(result);

      console.log('OK');
    } catch (error) {
      console.log('FAILED');
      console.log(error.message);
    }

    // Don't hammer the public API
    await new Promise(resolve =>
      setTimeout(resolve, 300)
    );
  }

  const unique = Array.from(
    new Map(
      results.map(item => [
        normalize(item.formatted),
        item,
      ])
    ).values()
  );

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(unique, null, 2),
    'utf8'
  );

  console.log('');
  console.log('==========================================');
  console.log(`Saved: ${unique.length} addresses`);
  console.log(`File: ${OUTPUT_FILE}`);
  console.log('==========================================');
  console.log('');
}

main().catch(error => {
  console.error('');
  console.error('DOWNLOAD FAILED');
  console.error(error);
  process.exit(1);
});
