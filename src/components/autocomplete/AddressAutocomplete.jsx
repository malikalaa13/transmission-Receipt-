import { useEffect, useRef, useState } from 'react';
import { Input } from '../ui';

const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

export default function AddressAutocomplete({
  value = '',
  onChange,
  onSelect,
}) {
  const wrapperRef = useRef(null);

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!API_KEY) {
      console.error(
        'VITE_GEOAPIFY_API_KEY is missing'
      );
      return;
    }

    const query = value.trim();

    if (query.length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const url = new URL(
          'https://api.geoapify.com/v1/geocode/autocomplete'
        );

        url.searchParams.set('text', query);
        url.searchParams.set('apiKey', API_KEY);

        // Search inside USA
        url.searchParams.set(
          'filter',
          'countrycode:us'
        );

        // Georgia center - only for ranking
        url.searchParams.set(
          'bias',
          'proximity:-83.5,33.5'
        );

        url.searchParams.set('limit', '20');

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Geoapify HTTP ${response.status}`
          );
        }

        const data = await response.json();

        console.log(
          'Geoapify results:',
          data.features
        );

        // Georgia filtering
        const results = (data.features || []).filter(
          (feature) => {
            const p = feature.properties || {};

            const stateCode = String(
              p.state_code || ''
            ).toUpperCase();

            const state = String(
              p.state || ''
            ).toLowerCase();

            const county = String(
              p.county || ''
            ).toLowerCase();

            const formatted = String(
              p.formatted || ''
            ).toLowerCase();

            return (
              stateCode === 'GA' ||
              state === 'georgia' ||
              state.includes('georgia') ||
              county.includes('georgia') ||
              formatted.includes(', ga ')
            );
          }
        );

        setSuggestions(results);
        setOpen(results.length > 0);
      } catch (error) {
        console.error(
          'Geoapify autocomplete error:',
          error
        );

        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  function handleSelect(feature) {
    const p = feature.properties || {};

    const formatted =
      p.formatted || '';

    const address = {
      formatted_address: formatted,

      street:
        p.street || '',

      housenumber:
        p.housenumber || '',

      city:
        p.city ||
        p.town ||
        p.village ||
        '',

      state:
        p.state_code ||
        'GA',

      zip:
        p.postcode ||
        '',

      lat:
        p.lat ??
        feature.geometry?.coordinates?.[1] ??
        null,

      lng:
        p.lon ??
        feature.geometry?.coordinates?.[0] ??
        null,

      components: p,
    };

    onChange?.(formatted);
    onSelect?.(address);

    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <Input
        value={value}
        onChange={(e) => {
          onChange?.(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (suggestions.length > 0) {
            setOpen(true);
          }
        }}
        placeholder="Start typing an address"
        autoComplete="off"
      />

      {open && (
        <div className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">

          {loading && (
            <div className="px-4 py-3 text-sm text-slate-500">
              Searching...
            </div>
          )}

          {!loading &&
            suggestions.map(
              (feature, index) => {
                const p =
                  feature.properties || {};

                return (
                  <button
                    key={
                      p.place_id ||
                      `${p.formatted}-${index}`
                    }
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(feature);
                    }}
                    className="block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50"
                  >
                    <div className="text-sm font-semibold text-slate-800">
                      {p.formatted}
                    </div>
                  </button>
                );
              }
            )}

          {!loading &&
            suggestions.length === 0 &&
            value.trim().length >= 3 && (
              <div className="px-4 py-3 text-sm text-slate-500">
                No Georgia addresses found.
              </div>
            )}
        </div>
      )}
    </div>
  );
}