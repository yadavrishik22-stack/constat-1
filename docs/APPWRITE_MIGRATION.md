# ConStat V2: Appwrite migration plan

Status: design only. No Appwrite SDK, server, credentials, database or buckets are connected in V1.

## Current local boundaries

- `Repository` validates and persists operational records through `StorageAdapter`.
- `AuthRepository` owns signup, password verification, account status, session, memberships and requests. Its observable public snapshot never includes password hashes.
- `StoreProvider` wires the two services. `AuthGuard` handles navigation; repository reads AND writes apply the current approved account's project access.
- `getSiteDirectory()` exposes only project ID, name and site name to approved accounts for requesting access; it never returns operational data or project details.
- `auth-models.ts` defines account schemas; `models.ts` and `operations-models.ts` define operational schemas. Calculations remain pure functions over permitted records.
- Replace these service implementations with asynchronous Appwrite services and observable caches. Retain form validation and calculation functions; add loading/error states for network operations.

## Local V1 is not production security

The browser owner can edit localStorage, source code or the session ID. Hashing passwords with salted PBKDF2/SHA-256 (210,000 iterations) avoids storing signup passwords in plaintext but does not establish trust. Demo credentials are public by design. The session is a locally persisted user ID, shared by same-origin tabs. There are no real emails, trusted roles, server authorization or cross-device approvals. Two people on different devices do NOT share accounts or site records. Use the same browser to test switching between admin and employee accounts.

Web Crypto requires HTTPS or localhost. Plain HTTP phone LAN addresses cannot run the password service; use HTTPS for phone login tests. Never deploy this demo as a secure client portal.

## Storage compatibility and migration

Operational JSON remains under `constat.database.v1`, schema version 2. Existing version-1 data is still passed through `migrations.ts`. Account setup does not write or reset an existing operational key. The additive account migration creates `constat.accounts.v1` (independently versioned at 1) ONLY when absent; it creates demo users and gives the demo employee the sample project, or the first existing project. No operational records are fabricated to initialize accounts. Invalid saved account or operational JSON is reported and is not silently replaced.

`constat.session.v1` persists the current session; logout clears its value. `constat.workspace.v1` remains a preference and is always checked against permitted projects. The obsolete `constat.testing-role.v1` is ignored. Removing or changing it cannot change account privileges.

Public purchase requests use a separate `constat.purchase-requests.v1` store. They are not included in operational resets/imports and do not modify construction records or user permissions.

Data Management exports/imports operational JSON, including compressed images. Operational reset/sample/import preserves accounts, memberships and request history. Memberships pointing at a deleted project confer no data access; revoked memberships are retained as history. Loading sample data later does not silently re-grant revoked access: the administrator can assign the sample site. The two demo accounts are permanent; the demo employee cannot be rejected/deactivated, but its site access can be changed for testing.

Before a V2 move, preserve an operational JSON export plus a controlled local account/membership migration snapshot. Do not transport local demo sessions or reuse published demo credentials. Create genuine Appwrite accounts and re-enroll users with production credentials. Do not assume local PBKDF2 hashes can be imported as Appwrite passwords. Map local IDs to Appwrite IDs explicitly and retain a migration audit.

## Planned data resources

Use a single Appwrite project for the product, with business companies/sites modeled as rows (not separate Appwrite projects). Table names below are proposals. Every operational row keeps `projectId`; derive/validate its company from Projects. Preserve existing IDs or maintain a consistent ID translation map across all foreign references.

| Current entity | Proposed resource | Key relationships / constraints |
| --- | --- | --- |
| Local users | Appwrite Auth + `profiles` | Auth user ID; full name; unique normalized username/email; role/status; approval timestamps/actor. No client-writable privileged fields. |
| Companies | `companies` | Name; created/updated timestamps; company-admin team ID. |
| Projects | `projects` | `companyId`, site name, location, status, start date, description, next account number. |
| Project memberships | `project_memberships` | Unique user/project pair, active/revoked, grant actor/time; maps to site team membership. |
| Site access requests | `site_access_requests` | Requester, project, pending/approved/rejected, message, resolution actor/time. Only one pending request per user/project. |
| Purchase requests | `purchase_requests` | Company/contact details, optional site count/notes, new/contacted/closed status and timestamps. Server-side admin visibility only. |
| Machines | `machines` | Project, machine type, status, identifier. |
| Diesel logs | `diesel_logs` | Project, machine, day, litres, price/litre, meter; meter/bill file IDs; notes and legacy missing-bill marker. |
| Technical employees | `technical_employees` | Project, name, flexible designation, code, active status. Separate from login profiles. |
| Technical attendance | `technical_attendance` | Unique project/employee/day; present/absent, notes. |
| Labour attendance | `labour_attendance` | Unique project/day; nonnegative integer count. |
| Material transactions | `material_transactions` | Project, material, received/consumed, quantity, day, supplier/reference/vehicle; steel area and legacy marker. |
| Steel consumption | Same `material_transactions` table | Filter Steel + Consumed. Do not create a duplicate ledger or subtract twice. |
| Store items | `store_items` | Project, name/specification, owned quantity/unit, active status. |
| Store usage | `store_usage` | Unique project/item/day, used flag, optional quantity/team; validate against ownership. |
| Work activity types | `work_activity_types` | Project, name, unit, active status; unique normalized name per project. |
| Daily work logs | `daily_work_logs` | Project/activity/day, optional quantity, notes. |
| Account categories | `account_categories` | Project, name, active status; unique normalized name per project. |
| Site accounts | `site_accounts` | Project/category/day, expense/receipt, amount, payment mode, receipt file, entry number. Unique project/entry number. |
| Site issues | `site_issues` | Project, day, category, priority, status, details, optional machine/store item, resolution date and photo. |
| Concrete consumption | `concrete_consumption` | Project, day, quantity, consumption area, notes. |
| Local session | Appwrite Account session | Replace completely; never trust/import local session IDs. |
| Workspace selection | Local preference or user preference | Revalidate against server-authorized memberships on every change. |

Add indexes on `projectId + date` for daily logs, and status/date for pending approvals/issues. Enforce uniqueness and stock invariants server-side, including edits and deletes. Allocate account entry numbers atomically. Bulk attendance must be committed as one validated operation. Enforce project ownership of every foreign key, not only the row's project ID. Dates stay calendar `YYYY-MM-DD`; audit times use UTC ISO timestamps.

## Planned file storage

| Category / bucket | Current source | Future handling |
| --- | --- | --- |
| `diesel-meter-photos` | Diesel `photo` data URL | Decode validated compressed image; upload; persist file ID. |
| `diesel-bill-photos` | Diesel `billPhoto` | Upload when present; preserve missing-bill marker for historical rows. |
| `site-account-receipts` | Account receipt photo | Optional upload linked to account and project. |
| `site-issue-photos` | Issue photo | Optional upload linked to issue and project. |
| `construction-attachments` | Future only | Define allowed MIME types, limits and ownership before enabling. |

Keep the existing client compression and MIME/size checks; repeat validation server-side. Apply site permissions to each file. Handle partial migration uploads with resumable mapping and orphan cleanup. Verify hashes/counts before deleting local source backups. The public landing image stays a static optimized asset, not a private site attachment.

## Intended backend authorization

Appwrite supports permissions on rows and files, scoped to users/teams. Table-level permissions also grant access to its rows, so broad employee access at table level would defeat site isolation. Configure narrow permissions and verify with two independent users. See [permissions](https://appwrite.io/docs/advanced/security/permissions), [database permissions](https://appwrite.io/docs/products/databases/tablesdb/permissions) and [Teams](https://appwrite.io/docs/products/auth/teams).

Proposed ConStat policy:

- Super Admin: company-wide access through a company admin team. Unlike the single local demo's global administrator, future multi-company administrators must not access unrelated companies.
- Employee: approved account plus explicit active site membership; use a per-site team for authorized row/file reads.
- Public signup: only create a pending employee profile. Role, approval and membership changes require a trusted server action.
- Pending/rejected/inactive users: own status/profile only, no operational records or storage access. Deactivation removes effective team access.
- Site requests: authenticated approved employee may submit their own request to a limited site directory. Only company administrators may approve/reject. The directory exposes names, not confidential site details.
- Approval/grant/revoke: one trusted workflow updates membership records and Appwrite team membership. Retries must be idempotent. Revocation must remove access to historical rows/files and invalidate client caches.
- Operational writes: server verifies approved status, active membership, record project, permitted module and cross-record invariants. Employees cannot configure masters or import/reset the global database. Do not give clients broad write permissions that bypass these checks.
- Keep server API keys off the client. Never trust client-provided role, approvedBy, userId or project membership. Route guards remain UX only.

## Rollout checks

1. Back up and validate local operational data. Inventory all ID and image references.
2. Create production accounts/profiles and company/site teams through a controlled enrollment process.
3. Import companies, projects and masters, then operational records, files and memberships. Compare counts and diesel, attendance, workforce, material, steel, concrete and account totals per site.
4. Replace local service methods behind the existing provider; retain offline data until import and verification complete.
5. Test anonymous, pending, rejected, inactive, employee and company-admin users through direct API calls as well as UI. Test cross-project foreign IDs, private file URLs, revoke-while-open, uniqueness, quotas and concurrent writes.
6. Enable cloud mode only after server authorization passes. Remove public demo accounts from the production tenant. Keep local demo mode separate and clearly labeled.
