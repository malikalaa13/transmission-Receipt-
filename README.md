# Transmission Receipt Manager

A React/Vite/Tailwind/Supabase receipt management system for an automotive transmission repair center. The receipt is rendered as real HTML/CSS at A4 dimensions and the same renderer is used for preview and printing. PDF export is generated from HTML with Puppeteer rather than a screenshot.

## Included
- A4 PAYMENT RECEIPT renderer closely matched to the supplied Mr. Transmission reference.
- Dynamic customer, vehicle, item, discount, tax, guarantee and notes fields.
- Manual line totals; quantity does **not** affect totals.
- Customer and parts/service autocomplete.
- Optional Google Places address autocomplete with manual fallback.
- Customer/vehicle database model and Supabase schema.
- Atomic database-safe receipt numbering.
- Dashboard with search and receipt actions.
- CSV/Excel parts importer that detects a likely name/description/part/service column.
- Company settings and defaults.
- Print stylesheet and Puppeteer HTML-to-PDF server.
- Demo/localStorage mode so the UI can be explored before Supabase credentials are added.

## Run locally

```bash
npm install
npm run dev
```

For PDF generation in a separate terminal:

```bash
npm run pdf-server
```

Then open `http://localhost:5173`.

## Supabase
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Enable Email/Password authentication.
5. Copy `.env.example` to `.env.local` and set:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GOOGLE_MAPS_API_KEY=...
VITE_PDF_API_URL=http://localhost:8787
```

## Logo / reference
The supplied reference receipt is included as `public/reference-receipt.png` for visual QA. The current `public/assets/mr-transmission-logo.png` is an exact crop of the logo/wordmark visible in the supplied reference because no separate standalone logo file was accessible at build time. If you have the original standalone logo file, replace that asset without changing the ReceiptRenderer API.

## Tax rule
The centralized calculation is:

`tax = max(subtotal - discount, 0) × taxRate / 100`

`total = subtotal - discount + tax`

`total after discount = subtotal - discount`

Each receipt line's `total` is manually entered and summed directly. Quantity is stored for display only.

## Important production note
The UI is complete and wired for Supabase, but live Supabase/Google credentials are intentionally not embedded in source. Add those credentials before production deployment. The PDF server must be deployed somewhere capable of running Puppeteer (a normal Node server/container is recommended).
