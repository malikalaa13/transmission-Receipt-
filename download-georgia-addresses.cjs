const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(
  process.cwd(),
  'public',
  'data'
);

const OUTPUT_FILE = path.join(
  OUTPUT_DIR,
  'georgia-addresses.json'
);

const TEST_ADDRESSES = [
  '422 West Pike St, Lawrenceville, GA 30045',
  '65 Lawrenceville St, Norcross, GA 30071',
  '100 Cherokee St, Marietta, GA 30090',
  '200 Piedmont Ave SE, Atlanta, GA 30334',
  '206 Washington St SW, Atlanta, GA 30334',
  '2500 Walton Way, Augusta, GA 30904',
  '823 Telfair St, Augusta, GA 30901',
  '2025 Baxter St, Athens, GA 30606',
  '1332 Southern Dr, Statesboro, GA 30458',
  '1601 Maple St, Carrollton, GA 30118',
];

async function geocode(address) {
  const url = new URL(
    'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress'
  );

  url.searchParams.set(
    'address',
    address
  );

  url.searchParams.set(
    'benchmark',
    'Public_AR_Current'
  );

  url.searchParams.set(
    'format',
    'json'
  );

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent':
        'GeorgiaAddressAutocomplete/1.0',
    },
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `Census API HTTP ${response.status}: ${text}`
    );
  }

  const data = JSON.parse(text);

  const matches =
    data?.result?.addressMatches || [];

  if (!matches.length) {
    return null;
  }

  const match = matches[0];

  const c =
    match.addressComponents || {};

  return {
    address,
    formatted:
      match.matchedAddress || address,

    city:
      c.city || '',

    state:
      c.state || 'GA',

    zip:
      c.zip || '',

    lat:
      match.coordinates?.y ?? null,

    lng:
      match.coordinates?.x ?? null,
  };
}

async function main() {
  console.log('');
  console.log(
    '=========================================='
  );
  console.log(
    ' Georgia Address Downloader'
  );
  console.log(
    ' U.S. Census Geocoder'
  );
  console.log(
    '=========================================='
  );
  console.log('');

  fs.mkdirSync(OUTPUT_DIR, {
    recursive: true,
  });

  const results = [];

  for (
    let i = 0;
    i < TEST_ADDRESSES.length;
    i++
  ) {
    const address =
      TEST_ADDRESSES[i];

    process.stdout.write(
      `[${i + 1}/${TEST_ADDRESSES.length}] ${address} ... `
    );

    try {
      const result =
        await geocode(address);

      if (!result) {
        console.log('NOT FOUND');
      } else {
        results.push(result);
        console.log('OK');
      }
    } catch (error) {
      console.log('FAILED');
      console.log(error.message);
    }

    await new Promise(
      resolve => setTimeout(resolve, 500)
    );
  }

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(
      results,
      null,
      2
    ),
    'utf8'
  );

  console.log('');
  console.log(
    '=========================================='
  );

  console.log(
    `Saved ${results.length} addresses`
  );

  console.log(
    `File: ${OUTPUT_FILE}`
  );

  console.log(
    '=========================================='
  );
}

main().catch(error => {
  console.error('');
  console.error(
    'DOWNLOAD FAILED'
  );
  console.error(error);
  process.exit(1);
});