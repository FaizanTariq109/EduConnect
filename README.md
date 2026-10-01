# EduConnect

A full-stack tutor-booking demonstration built with **Next.js App Router, React, TypeScript and MongoDB/Mongoose**. This is an evolved portfolio version of Web Engineering coursework, focused on a working student → tutor → completed session → verified review journey.

**Live Demo:** [EduConnect](https://edu-connect-ecru.vercel.app/)

**Publication status:** deployed on Vercel with MongoDB Atlas and verified end-to-end using synthetic accounts on 2026-10-01. This release does not claim to implement every original assignment requirement.

## What works

- **Students:** register/sign in, discover approved tutors, filter by name/subject, teaching mode, price range and minimum rating, inspect profiles and persisted reviews, request sessions, cancel/reschedule their own active sessions, review their own completed sessions once.
- **Tutors:** register with pending verification, edit their own profile, accept/reject assigned requests, cancel active sessions and declare accepted sessions completed. The dashboard derives counts and estimated completed-session value from saved bookings.
- **Administrators:** sign in through a server-provisioned account, inspect tutor profiles, approve/reject pending registrations with an optional comment, and view persisted status counts. Public admin registration is disabled.
- Shared synthetic demo accounts on the login page let visitors explore all three roles. Their passwords cannot be changed through the application.

**Demo scope:** no real lessons or payments are provided. Tutor approval is a decision in this demonstration, not an independently verified qualification or background check. Completion is a tutor declaration and can be exercised immediately for demonstration; attendance and payment are not verified. A “verified review” means that its author owns a session marked completed, not that its contents are independently verified.

## Architecture

```text
React dashboards / forms
        ↓ same-origin JSON requests + HttpOnly session cookie
Next.js Node.js route handlers
        ↓ JWT verification → account/role lookup → validation → ownership checks
Mongoose cached connection
        ↓ MongoDB transactions and unique indexes
MongoDB Atlas replica set
```

One Next.js deployment serves the UI and API. There is no separate Express service. Server components guard dashboard entry; every protected API independently authenticates and authorizes the request.

### Authentication and request handling

- Eight-hour HS256 JWTs include subject, role and token version, with fixed issuer/audience. Each protected request verifies the signature and resolves an existing account in its role collection. Client role cookies and submitted user IDs grant no authority.
- Cookies are `HttpOnly`, `SameSite=Lax`, scoped to `/`, and `Secure` in production. Tokens and password hashes are not returned in JSON responses.
- Passwords use bcryptjs with cost 12. Registration validates password length including the bcrypt UTF-8 byte limit. Password changes require the current password and invalidate existing tokens through a version increment.
- Mutations require an exact same-origin header and JSON content type. Bodies are limited to 16 KiB; Zod validates allowed fields. Mongo-backed limits cover login attempts, registrations and authenticated mutations. They are basic demo abuse controls, not comprehensive bot protection.
- Ownership and lifecycle conditions are included in update queries. Errors return concise messages; server logs contain exception categories, not request bodies, hashes, tokens or connection strings.

### Booking consistency

Starts must be aligned to 15-minute intervals, at least five minutes in the future and within 180 days. Durations are 30, 60, 90 or 120 minutes. The tutor must be approved and offer the selected subject/mode.

A transaction creates the session and reserves each occupied 15-minute interval for **both the student and tutor**. A unique `(owner, time)` index prevents competing bookings from reserving the same participant. Adjacent sessions can use different intervals. Rescheduling changes reservations atomically and returns the session to pending acceptance; a conflict rolls back the original reservations. Cancellation/rejection releases reservations.

The server snapshots the hourly rate and total price at booking. Rescheduling uses that original rate. The lifecycle is `pending → accepted → completed`, with `pending → rejected` and `pending/accepted → cancelled`. Only the assigned tutor can accept, reject or complete. Only a participant can cancel.

### Collections

| Collection | Purpose / important constraints |
| --- | --- |
| `students` | Student profile, unique email, password hash, demo flag, token version |
| `teachers` | Tutor profile, offered subjects/modes, rate, verification state/comment, derived review average/count |
| `admins` | Provisioned administrator accounts; no public creation endpoint |
| `sessions` | Participant references, UTC start, duration, subject/mode, status, price snapshot |
| `reservations` | Participant/time reservations with unique `(owner, time)` index |
| `reviews` | Completed-session reference with unique `sessionId`, author/tutor references, rating/text |
| `ratelimits` | Hashed bucket identifiers and counters with TTL expiry |

The seed creates required indexes. Runtime `autoIndex` is disabled. **Seed and run the configuration check before publishing**: the unique indexes are part of the concurrency guarantees. Use a new synthetic database; this release does not migrate the original coursework data.

## Stack and dependencies

Tested locally on Windows with Node.js **24.21.0** and npm 11.19.0. The package engine range supports Node 22.13+ and 24; choose **24.x** on Vercel. Only Node 24 was exercised in this validation.

Key dependencies: Next.js **15.5.27**, React/React DOM **18.2.0**, Mongoose **8.24.4**, bcryptjs **3.0.3**, Zod **4.3.6**, Axios **1.20.0**, jsonwebtoken, Tailwind CSS 4 and the existing Radix UI components. The lockfile records exact resolved versions.

Compatible security patches replace native bcrypt and update the Next.js 15 line. Targeted overrides pin PostCSS **8.5.28** and the legacy brace-expansion 1.x branch to **1.1.21**. These address transitive advisories without a forced framework major upgrade. Recheck advisory status when deploying.

## Local setup

1. Install Node.js 24 and run `npm ci`.
2. Create a **new synthetic** MongoDB Atlas database and a database user limited to it. Add the local development IP to the Atlas project IP access list.
3. Copy `.env.example` to `.env.local` and replace the placeholders locally:

```dotenv
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER/educonnect_demo
JWT_SECRET=replace-with-a-new-random-secret-at-least-32-characters
```

Use a newly generated high-entropy JWT secret of at least 32 characters. Never commit this file or prefix either variable with `NEXT_PUBLIC_`.

4. Seed only the new synthetic database and check the connection/indexes:

```sh
npm run seed -- --confirm-synthetic
npm run check:config
npm run dev
```

Open `http://localhost:3000`. A production run uses `npm run build` followed by `npm start`. Restart the server after changing environment variables.

The seed is idempotent: it inserts missing demo accounts and creates indexes. It preserves existing accounts, passwords, reviews, bookings and verification decisions, and refuses to modify an existing account not marked as demo. It does not repeatedly reset a reviewed tutor to pending.

### Synthetic demo accounts

| Role | Email | Shared password |
| --- | --- | --- |
| Student | `student@educonnect.example` | `EduConnect-Demo-2026!` |
| Tutor | `tutor@educonnect.example` | `EduConnect-Demo-2026!` |
| Admin | `admin@educonnect.example` | `EduConnect-Demo-2026!` |

`pending@educonnect.example` is also seeded as a tutor awaiting verification, with the same demo password. These intentionally public credentials access synthetic application records only; they are not MongoDB credentials. Visitors share these accounts and their changes. Do not store real personal information in this deployment.

## Testing

```sh
npm run typecheck
npm run lint
npm run build
npm test
npm run test:http
npm audit
```

`npm test` runs six integration scenarios with many assertions against an isolated, disposable **MongoDB replica set**, including real transactions and indexes. It covers forged/expired tokens, role and ownership checks, signup validation, password/token invalidation, pending tutor exclusion, conflicting concurrent bookings for both participants, lifecycle restrictions, completed-session reviews, duplicate reviews, rating aggregation, admin decisions, rescheduling rollback and cancellation/rejection slot release.

`npm run test:http` requires a completed production build. It starts the real Next.js server on port **3009**, exercises the complete journey through HTTP, checks production cookie attributes and protected-page redirects, restarts the Next.js process and confirms persisted session/review/approval state. It uses a separate temporary database and does not read `.env.local`.

For browser exploration with no Atlas credentials:

```sh
npm run dev:test
# Or, after npm run build:
npm run dev:test -- --production
```

This starts a synthetic replica set and the application on **http://localhost:3008**. Data is temporary and removed when the helper stops. The first test/helper run downloads a MongoDB binary through mongodb-memory-server; this development-only package is not used by deployed route handlers.

**Local validation (2026-10-01):** production build, standalone typecheck and ESLint passed with suppression removed; the integration and HTTP journeys passed. The same complete production HTTP journey passed against Atlas, including persistence after restarting Next.js and rerunning the idempotent seed. Browser checks covered student/tutor registration, profile editing, tutor filtering, booking, tutor acceptance/completion, persisted review expansion, admin verification and narrow-screen dashboards. The dependency audit reported zero known advisories at the time checked. These checks are not a penetration test or a load/performance benchmark.

**Public production validation (2026-10-01):** Student, Tutor and Admin HTTPS logins passed. Approved-only tutor discovery, booking, tutor acceptance/completion, persisted review/rating and admin verification passed against the public deployment. Unauthenticated, forged-cookie, wrong-role, cross-origin, invalid-lifecycle and duplicate-review requests were denied. Fresh logins/API reads and a browser full-page refresh preserved the results. Session responses set `Secure`, `HttpOnly` and `SameSite=Lax`; the browser retained its authenticated session across refresh, and logout cleared the cookie. A separate synthetic tutor was left pending for the admin demonstration. These are bounded smoke checks, not a load test or security certification.

## Screenshots

The images show the locally running production build using synthetic data.

![Persisted review on the tutor profile](docs/screenshots/verified-review.png)

![Administrator verification counts after approval](docs/screenshots/admin-verification.png)

![Atlas-backed tutor discovery with a persisted review rating](docs/screenshots/atlas-dashboard.png)

## Deployment: Vercel + MongoDB Atlas

The live application is deployed at [edu-connect-ecru.vercel.app](https://edu-connect-ecru.vercel.app/). The following settings describe how to reproduce the deployment.

1. Confirm the new Atlas database is reachable and run the seed/config checks locally. Atlas must support transactions; a standalone MongoDB server is unsuitable.
2. After the reviewed changes are pushed, import the existing EduConnect GitHub repository into Vercel. Select **Next.js**, repository root, **Node 24.x**, install `npm ci`, build `npm run build`, and leave the output directory at the Next.js default. No separate backend or custom `vercel.json` is required.
3. Add `MONGO_URI` and `JWT_SECRET` as server-only Vercel environment variables. Scope them deliberately: use a separate synthetic database for preview deployments, or disable preview deployments until preview secrets are configured.
4. Configure Atlas network access for the deployment's outbound connection method. Restrict addresses when static egress is available. A dynamic-egress setup needs a deliberately reviewed network-access policy; do not silently open the database network to all addresses. Keep the database user restricted to the synthetic database.
5. Deploy, then check HTTPS login/logout, all three roles, booking/acceptance/completion/review, admin verification, unauthenticated/incorrect-role denials and refresh persistence. Confirm the production `Secure` cookie is retained on HTTPS.
6. Add a Live Demo link only after that public smoke test passes.

The Mongoose connection promise is cached per server instance, uses a five-connection maximum pool, avoids repeated event listeners and clears a failed initialization promise. Instances can scale independently on Vercel; Atlas connection limits still matter. Database/network failures produce a generic service-unavailable API response.

References: [Vercel environment variables](https://vercel.com/kb/guide/how-to-add-vercel-environment-variables), [MongoDB Atlas connectivity](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/), [MongoDB Next.js deployment guidance](https://www.mongodb.com/docs/drivers/node/current/integrations/next-vercel/).

## Deliberately deferred / limitations

- Wishlist, rate-drop notifications, reporting/charts and CSV/PDF export.
- Payments, settlement and accounting; dashboard amounts are estimates, not earnings received.
- Profile-image storage, city filtering and a weekly tutor availability calendar. Tutor acceptance is required; selecting a time is not a promise of real availability.
- In-app video, chat, email verification and password-recovery delivery.
- Large-dataset pagination: discovery, admin lists and session history are capped at 200 records; profile reviews at 50. Dashboard session totals describe the loaded history, not unbounded accounting.
- Admin decisions are one-way for pending profiles in this release; profile content can be edited afterward. There is no credential-vetting or moderation service.
- Shared demo accounts allow visitors to affect the same synthetic data. Retained pending requests reserve time until cancelled/rejected; there is no background expiry/reset service.
- Local Windows and the hosted Vercel/Atlas production journey have been smoke-tested. Changes to runtime, dependencies, environment variables or networking should be followed by another production check.

The immutable recovered university archive was not changed. `.audit/`, local credentials, build output and dependency directories are excluded from publication.
