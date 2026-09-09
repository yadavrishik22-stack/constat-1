# ConStat — Construction Statistics Tracker

A local V1 beta built with Next.js App Router, TypeScript, Tailwind CSS, Radix accessible dialogs, React Hook Form, Zod, Lucide, and Recharts. Includes local demo authentication and explicit site permissions. No external backend, production authentication, cloud storage, or paid API is configured.

## Run locally

```sh
npm ci
npm run dev
```

Open http://localhost:3000. If occupied: `npm run dev -- --port 3001`.

## Verification

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

The end-to-end suite expects a running local server at port 3000 and installed Google Chrome. It runs in isolated browser contexts and does not change your normal browser data.

## Pages

- `/`: public construction landing page
- `/login`, `/signup`, `/account-status`: local account workflows
- `/buy`: ₹25,999 setup summary and low-friction request form
- `/buy/payment`: clearly labeled demo card, OTP and receipt flow
- `/dashboard`: authorized project dashboard, date filters, diesel and workforce charts, material stock
- `/users`: Super Admin approvals, employees, site grants/revocations and requests
- `/purchase-requests`: Super Admin view of locally submitted purchase requests
- `/my-sites`: assigned sites, available site names and access requests
- `/diesel`: diesel entry, required meter photo, filtering and machine summaries
- `/machinery`: project machinery registry
- `/employees`: technical employee registry
- `/attendance`: daily bulk technical attendance, historical viewing and clear-day action
- `/labour`: one labour headcount per project and date
- `/materials`: receipts and consumption transactions
- `/inventory`: calculated received, consumed and available stock by material
- `/projects`: company and project management and selection
- `/data`: JSON export/import, sample loading and reset

## Data architecture

`src/lib/models.ts` holds typed models and centralized Zod schemas. `src/lib/repository.ts` owns persistence through a `StorageAdapter`, validates relationships and unique daily records, and rejects changes that make material stock negative. A write is committed to the observable store only after storage succeeds. React subscribes through `src/components/store.tsx`; components never access localStorage directly.

All project operations are scoped by project ID. Deleting a company or project requires confirmation and cascades to its associated records. Deleting a machine with diesel history is blocked; deleting an employee also deletes their attendance history. Import validates the full dataset before replacing it. Stock validation applies to edits, deletes, and imports as well as new records.

`src/lib/statistics.ts` derives all totals from records. Diesel total cost and material units are derived rather than stored redundantly. Multi-day attendance and workforce totals are person-days, explicitly labeled. Attendance percentage is present / marked employees; unmarked employees remain visible. Dashboard material stock is current stock across all dates and is labeled independently of the activity date filter. Stock checks enforce total recorded balance, not an accounting ledger of historical running balances.

`src/lib/format.ts` uses local calendar `YYYY-MM-DD` dates with noon parsing to avoid UTC day shifts, and Indian rupee/number formatting.

## Local storage and photos

The database is a versioned JSON document under `constat.database.v1` in localStorage. It survives refresh but belongs to this browser and origin. Tabs listen for storage changes. This is a single-user local beta; simultaneous edits from different tabs are last-write-wins. Export before clearing site data or switching browsers.

`src/lib/images.ts` accepts JPEG, PNG, or WebP up to 25 MB, resizes to a maximum dimension of 1200 pixels, and encodes compressed JPEG. Saved images are capped at 450,000 data-URL characters. They are included in JSON backups. Quota failures leave the previous database intact and show an actionable error. Browser capacity varies; many photos can fill localStorage before text records do.

## Sample data and reset

`src/lib/seed.ts` is the single demo-data source. It seeds one company and project, three machines, six employees, seven days of activity, and four materials. Dates are relative to the day the sample loads. Demo meter images are clearly labeled illustrations. Sample data is loaded only when the database key has never been initialized. An intentional reset persists an empty database and stays empty after refresh.

Open Data Management to export, restore a previous ConStat JSON export, load sample data, or reset. Destructive replacements require confirmation.

## V2 boundary

Replace the storage/repository implementation with a cloud service while keeping the typed models, forms, and calculations. Appwrite production authentication, server-side permissions, remote image storage, multi-device sync and realtime collaboration are intentionally left for V2. See [Appwrite migration plan](docs/APPWRITE_MIGRATION.md).

## Deploy through GitHub to Vercel

1. In Vercel, choose **Add New → Project**, connect GitHub, and import `dingdong-vamshi/constat`.
2. Use the **Next.js** framework preset and repository root (`./`). Keep the default install and output settings. Build command: `npm run build`.
3. No environment variables or database connections are required. Click **Deploy**.
4. Open the production URL. A new browser starts with sample data. To transfer existing localhost records, export from localhost Data Management and import the JSON on the production URL.

Vercel hosts the application code, not the user's operational database. Records and photos remain in the visiting browser's localStorage. They survive refresh and normal redeploys on the same origin, but do not sync across devices, browsers, preview URLs, or custom domains. Clearing browser site data removes them. Use JSON backups to move or protect records.

## Expanded V1 modules

The local beta now includes `/stores` (owned equipment and daily usage), `/work` (activity types and work logs), `/accounts` (expenses, receipts and configurable categories), `/issues` (reporting and resolution), `/steel` (a filtered view of the shared material ledger), and `/concrete` (consumption by area). All module tables support CRUD, project-scoped filtering, and pagination. Dashboard operation totals and breakdowns come from these records.

- **Stores:** marking equipment used does not reduce owned quantity. One usage record per item/date; quantities cannot exceed ownership. Referenced items can be deactivated but not deleted. Reducing ownership below an existing recorded usage quantity is rejected.
- **Steel:** new consumption requires Foundation, Structural, or Super Structural. Entries share the material transaction collection and reduce its stock.
- **Accounts:** `SITE-0001`-style numbers are generated per project. A persisted project counter prevents reusing deleted numbers. Accounts are entered independently; recording diesel or a material receipt does not automatically add an account entry or double-count expenses.
- **Issues:** resolution dates are set when resolved, and cleared when reopened. Related machines/items must belong to the project.
- **Work:** quantities are optional; measured totals are grouped by activity and unit to avoid adding unlike units. New projects get Earthwork, Blasting and default account categories. Existing projects can load defaults in the configuration tabs or create custom ones.
- **Roles:** derive from the logged-in account. Approved employees can record operations only in explicitly assigned sites; master configuration, User Management and Data Management require Super Admin. The old testing role selector is removed. This is local workflow simulation, not a production security boundary.

### Saved-data compatibility

The JSON database schema is now version 2; the product remains V1 beta. The existing storage key is retained. `src/lib/migrations.ts` reads earlier version-1 backups and saved data without deleting records. Historical diesel entries without a bill are marked as missing, and historical steel consumption without an area is marked unclassified. Editing those records requires completing the newly required fields. No historical photo or area is invented. New collections start empty until populated or sample data is explicitly loaded.

A shared `PhotoUpload` component compresses meter photos, diesel bills, optional account receipts, and optional issue photos. Both meter and bill photos are required for new diesel entries. Backups include every new entity, project configuration, and stored image. `src/lib/seed.ts` remains the only sample-data source, with clearly labeled meter and receipt illustrations.

## Login and account testing

| Role        | Email / username                   | Password     |
| ----------- | ---------------------------------- | ------------ |
| Super Admin | admin@constat.in / superadmin      | Admin@123    |
| Employee    | employee@constat.in / siteemployee | Employee@123 |

Use the same browser for the entire flow: sign up → pending status → log in as admin → approve under User Management → optionally assign sites → log back in as employee. Approved users with no sites can request access through My Sites. Admins can approve requests, directly grant/revoke sites, reject or deactivate signup accounts. Both demo accounts remain available; test deactivation with a new signup.

Accounts, memberships and requests live in independently versioned `constat.accounts.v1`; the session uses `constat.session.v1`. Existing operational data is retained and never reset by account setup. Data Management operational imports/resets preserve accounts and access history. Signup passwords use salted PBKDF2 through Web Crypto; public snapshots exclude hashes. These are browser-local simulations, NOT production security: DevTools can bypass them. Accounts/approvals do not sync between devices. HTTPS or localhost is required for Web Crypto (plain HTTP LAN phone login is not supported).

Purchase intent submissions are stored separately under `constat.purchase-requests.v1`. `/buy` records the customer's essential contact details, then `/buy/payment` runs a clearly labeled card and OTP simulation before storing only the safe payment status and generated reference. Card number, CVV and OTP are never persisted or exported. Super Admin can review payment and setup status under Purchase Requests. This demo does not charge money, send email/SMS or send data across devices; a server-side payment provider such as Razorpay can replace `DemoPaymentProvider` later.

Public crane/building asset notes: [ATTRIBUTION.md](public/images/landing/ATTRIBUTION.md). Animation respects reduced motion.
