# Project Context

This file is the durable engineering brief for rebuilding the OSI Model Learning Platform. It is intended for maintainers and coding agents who need to continue the migration without rediscovering the existing application or silently changing its behavior.

## Academic source of truth

The authoritative product specification is the April 2026 academic report **“An Open Systems Interconnection (OSI) Model Simulation Web Tool for Interactive and Educational Learning”** by Igbokwe Ifechukwu Francis, Department of Computer Science, Federal University of Technology, Owerri.

Keep Next.js as requested, but do not let the framework migration redefine the academic artefact. In priority order:

1. The academic aim, four objectives, scope, FR1–FR4, and non-functional requirements define mandatory learner-facing behavior.
2. The legacy applications are implementation references and reusable asset sources.
3. Admin CRUD, Neon persistence, generated clients, and deployment automation are supporting extensions.

Where the legacy application and academic report differ, implement the academic behavior unless a later explicit product decision supersedes it. Record such a decision here.

## Objective

Rebuild the current two-folder JavaScript project as a production-oriented monorepo:

- Next.js + TypeScript frontend in `apps/web`, hosted on Vercel
- Python FastAPI backend in `apps/api`, managed with uv, hosted on Render
- Neon PostgreSQL database managed through SQLAlchemy and Alembic
- Shared/generated tooling under `packages/`

This is a migration, not a greenfield product redesign. Preserve academically required behavior first, then useful legacy behavior; improve architecture and security where the new stack makes that practical.

The four academic objectives are:

1. A user-friendly web interface visually representing the seven layers with step-by-step interaction.
2. A controllable encapsulation/de-encapsulation animation that can start/play, pause, step forward, step backward, and reset.
3. A contextual knowledge base covering each layer's functions, protocols, hardware, PDU, number, and name.
4. Multiple-choice and drag-and-drop self-assessment with immediate feedback and scores.

## Design source of truth

`DESIGN.md` is the visual design authority for the Next.js web app. Adopt its visual system while retaining OSI-specific product language and academic content. The document currently uses “Ditto” and compliance/CSR examples as placeholder copy; those names, examples, and product claims must not leak into the OSI application.

### Visual tokens

- Theme: light, warm, optimistic, organic, and product-forward—not dark or clinical.
- Canvas: `#f9fbf2` (`--color-canvas`).
- Card/nav surface: `#eff2e5` (`--color-soft-meadow`).
- Primary text, borders, and dark action: `#130e30` (`--color-deep-ink`).
- Primary CTA/highlight: `#ffe228` (`--color-hi-yellow`).
- Muted copy: `#5f5c6e` (`--color-slate`).
- Decorative-only blob colors: moss `#59e25d` and fuchsia `#e261e5`; they must not be used for functional controls, statuses, badges, or icons.
- Reserve pure black `#000000` for the logo mark, input borders, and fine strokes. Do not use pure white as a card surface where Soft Meadow is specified.

### Typography and geometry

- Headings at 22px and above use Hedvig Letters Serif (700 for primary headings, 400 for pull quotes), with the documented serif fallback stack.
- Body/UI text uses Inter (400 body, 500 labels/nav, 600 emphasis); keep the strict heading/body role boundary.
- Use the documented type scale from 10px caption through 64px display, with tight negative tracking on headings and small caps.
- Base spacing is 8px; page max-width is 1200px; section gaps are 48–80px; card padding is 24–48px.
- Buttons, inputs, tags, nav items, and icon containers use full pill geometry (1440px radius). Cards use 24px radius; images use 24–48px radius.
- Do not add drop shadows to cards or buttons. Surface contrast supplies elevation.

### Layout and component direction

- Navigation is a non-sticky Soft Meadow bar with the OSI logo left, links centered, and a dark/yellow CTA pair at the right.
- The homepage hero is a breathable two-column composition: academic/product headline and copy on the left; simulation/product visual on the right, with flat organic blobs behind it.
- Use generous whitespace, three-column feature grids where appropriate, and Soft Meadow bands to separate sections.
- Decorative blobs are flat, irregular, and layered behind product visuals only. No people illustrations or decorative 3D renders in the brand layer.
- The OSI simulator remains an academic three-panel sender/medium/receiver experience. Apply the visual system without sacrificing layer labels, PDU details, controls, or the recommended ~768px usability threshold.
- Preserve accessibility and reduced-motion behavior when adding motion to the design system.

### Logo asset

The canonical supplied logo is [`apps/web/public/OSI.png`](apps/web/public/OSI.png), a transparent 474×209 PNG containing the blue OSI stacked-layer mark and OSI wordmark. Treat it as a shared brand asset:

- Use it in the navigation and footer lockup, with an appropriate `alt="OSI Model Learning Platform"` when it conveys identity.
- Use `alt=""` when it is purely decorative beside an adjacent visible brand name.
- Preserve its aspect ratio; do not recolor, crop, stretch, or place it on a low-contrast background.
- Use Next.js `Image` for rendered UI instances and provide explicit dimensions or a responsive size policy.
- Keep the source file in `public/`; do not duplicate it in component directories or recreate it as inline SVG.

The current web implementation applies this system in `apps/web/app/globals.css`, with the supplied logo rendered through Next's `Image` component and Hugeicons used for interface icons. Keep future visual changes aligned with these tokens rather than reintroducing a dark or generic dashboard treatment.

## Current state

The repository currently contains two independent applications and no root Git repository metadata was visible when this brief was written.

### `osi-simulation/`

React 19 + Vite single-page frontend using React Router, CSS Modules, GSAP, Three.js, React Three Fiber, and Drei.

Current routes:

- `/`
- `/simulation`
- `/about`
- `/quiz/select`
- `/quiz/:type`
- `/admin`
- `/admin/dashboard`

The current route set does not include the academic report's dedicated accordion-style **Learn** screen or a feedback screen. The rebuild must add `/learn` and `/feedback`; `/about` is not automatically equivalent to the required layer reference.

The legacy app keeps the admin JWT and user object in `sessionStorage`; the rebuild must use the API's HttpOnly cookie session instead. Quiz loading merges API results with local fallback questions, removes duplicates by ID/title/question, shuffles them, and limits a session to ten questions.

Important reusable assets and logic:

- `src/data/osiLayers.js`: detailed seven-layer educational content
- `src/data/quizData.js`: offline/fallback question bank
- `src/utils/pduTransformer.js`: frontend transformation/display helpers
- `src/hooks/usePDUSimulation.js`: simulation state flow
- `src/components/three/DeviceScene.jsx`: 3D scene
- `public/models/*.glb`: desktop, laptop, phone, server rack/cabinet models
- page and component CSS modules: the visual baseline to preserve

### `osi-backend-/`

Node/Express API using SQLite, bcrypt, JWT, and an in-process login-attempt map.

The database is initialized on server startup and currently stores structured arrays/maps as JSON strings. Default admin, FAQ, multiple-choice, and drag-and-drop records are seeded when tables are empty. The rebuild must replace startup DDL with Alembic migrations and use PostgreSQL JSONB.

The PDU API is stateless. It synthesizes plausible headers and network metadata for all seven layers. The payload length limit is 10,000 characters. `PDU_API_DOCUMENTATION.md` contains example payloads and response shapes and is a migration reference.

### Confirmed legacy/report gaps

These are requirements to resolve, not optional ideas:

- The academic design specifies a three-panel sender host / network medium / receiver host view. The current simulation uses a staged full-screen journey. The Next.js build must make both endpoints and the medium visually explicit; a staged presentation is acceptable only if users can still understand sender versus receiver and the complete path.
- The academic controls are Play, Pause, Step Forward, Step Backward, and Reset. Existing previous/next and pause behavior does not by itself prove full play/history/reset semantics. Implement and test the full set.
- Selecting a layer must reveal contextual information without interrupting or mutating the active simulation.
- The report specifies an independent accordion Learn screen; add it.
- The MCQ bank must contain at least 20 academically relevant questions and select 10 randomly per attempt.
- Drag/drop source items must be randomized; correct placements stay; incorrect placements return with immediate visual error feedback; completion shows score, correct-answer review, and performance feedback.
- The report includes `POST /api/feedback` and a feedback interface. Neither is represented in the current route documentation; add both using FastAPI/Neon.
- The Data Link layer may add/remove a trailer in addition to a header. Make this explicit in the visual and domain model.
- The academic tool targets desktop/tablet and recommends approximately 768 px minimum for its three-panel layout. Below that width, provide either an intelligible alternate layout or an explicit larger-display notice.

## Target architecture

```text
Browser
  │
  ├── HTTPS ──> Vercel / Next.js (`apps/web`)
  │                 │
  │                 └── typed HTTPS requests
  │
  └────────────────> Render / FastAPI (`apps/api`)
                            │
                            └── TLS connection pool ──> Neon PostgreSQL
```

Responsibilities:

- **Next.js:** rendering, routing, interactive visualization, quiz UI, admin UI, accessibility, and API consumption.
- **FastAPI:** validation, auth, authorization, CRUD, scoring/attempt persistence, PDU domain logic, and OpenAPI.
- **Neon:** durable users, content, and attempt data. It does not store transient animation state or generated 3D state.
- **Generated API client:** compile-time bridge between Pydantic schemas and TypeScript. FastAPI OpenAPI is authoritative.
- **Icon system:** Hugeicons only, through `@hugeicons/react` and a Hugeicons icon package. Lucide is explicitly out of scope. Follow the official React integration and import individual icons for tree-shaking.

Avoid adding Next.js API routes as a second business-logic backend. The current rebuild uses FastAPI-managed HttpOnly cookies directly; a same-origin auth proxy is optional and must not introduce a second auth transport.

## Decisions already made

| Area | Decision | Reason |
| --- | --- | --- |
| Repository | `apps/` + `packages/` monorepo | Clear deploy boundaries and shared tooling |
| JS workspace | pnpm workspaces + Turbo | Efficient installs, caching, and task orchestration |
| Frontend | Next.js App Router + TypeScript | Requested stack and safer contracts |
| API | FastAPI with version-neutral `/api` prefix | Requested stack while preserving current URLs |
| Validation | Pydantic v2 schemas at the boundary | Explicit, generated API contract |
| ORM | SQLAlchemy 2.x | Mature async-capable PostgreSQL mapping |
| Migrations | Alembic | Versioned, reviewable schema changes |
| Database | Neon PostgreSQL with TLS | Requested managed persistence |
| Structured fields | PostgreSQL JSONB | Natural mapping for options, answers, and drag/drop mappings |
| IDs | UUID for new records | Distributed-safe and avoids exposed sequences |
| API client | Generate TypeScript from OpenAPI | Prevent frontend/backend contract drift |
| Deployment | Vercel web + Render API | Requested hosting split |
| Web icons | Hugeicons (`@hugeicons/react` + `@hugeicons/core-free-icons`) | User-selected icon system; consistent tree-shakeable imports |
| Legacy removal | Only after verified parity | Keeps a working behavioral reference and rollback path |

If implementation constraints require changing one of these decisions, update this table and record the reason before making broad changes.

## Behavioral invariants

The migration is not complete unless these remain true:

1. Users can inspect seven layers in the correct order and see the correct PDU names: Data (7–5), Segment (4), Packet (3), Frame (2), Bits (1).
2. Encapsulation traverses 7 → 1; decapsulation traverses 1 → 7 and recovers the original payload.
3. Complete simulation exposes sender, receiver, transmission metadata, encapsulation, and decapsulation.
4. Empty/non-string PDU input is rejected, and the maximum accepted payload is 10,000 characters.
5. Both quiz modes work: multiple-choice and drag-and-drop.
6. Quiz sessions remain randomized and capped at ten questions unless the product requirement is explicitly changed.
7. Built-in questions remain a read-only fallback when public quiz fetches fail.
8. Public users can read FAQs/questions and submit attempts; only authenticated admins can mutate content.
9. The admin dashboard can create, update, delete, and order FAQs and both question types.
10. All existing GLB models and meaningful animations remain available, with a reduced-motion/non-WebGL fallback.
11. The main simulator visibly distinguishes sender host, network medium, and receiver host.
12. Controls include Play, Pause, Step Forward, Step Backward, and Reset, backed by reversible state history.
13. Opening or closing layer details does not alter simulation progress or play/pause state.
14. A dedicated Learn screen presents all seven layers as an accordion reference.
15. The MCQ bank contains at least 20 questions across functions, PDUs, protocols, hardware, encapsulation, and de-encapsulation; each attempt selects 10 randomly.
16. Drag/drop behavior matches the report: randomized source, persistent correct placements, rejected incorrect placements, immediate feedback, final score, answer review, and performance feedback.
17. Users can submit bounded JSON feedback through `POST /api/feedback`.

## Proposed domain model

### User

- `id: UUID`
- `username: str` — normalized, unique, indexed
- `password_hash: str`
- `created_at: datetime` — timezone aware

There is currently only an administrator role. Do not introduce a full learner-account system merely because `quiz_attempts.user_id` exists. Keep `user_id` nullable until product requirements define learner accounts.

### FAQ

- `id: UUID`
- `question: str`
- `answer: str`
- `category: str | None`
- `order_index: int = 0`
- `created_at`, `updated_at`

### MultipleChoiceQuestion

- `id: UUID`
- `question: str`
- `options: list[str]` stored as JSONB
- `correct_answer: int` — zero-based, matching the legacy client
- `explanation: str | None`
- `category: str | None`
- `type: str = "multiple-choice"`
- `order_index: int = 0`
- timestamps

Validate that there are at least two non-empty options and that `correct_answer` is within bounds.

### DragDropQuestion

- `id: UUID`
- `title: str`
- `description: str | None`
- `items: list[str]` stored as JSONB
- `categories: list[str]` stored as JSONB
- `correct_mappings: dict[str, str]` stored as JSONB
- `explanation: str | None`
- `order_index: int = 0`
- timestamps

Validate uniqueness of items/categories, that every item has exactly one mapping, and every mapped value names an existing category.

### QuizAttempt

- `id: UUID`
- `user_id: UUID | None`
- `score: int`
- `total_questions: int`
- `answers: list | dict` stored as JSONB
- `completed_at: datetime`

The attempt endpoint accepts question IDs and answers and calculates the authoritative score from persisted MCQ/drag-drop records. Legacy `score` and `total_questions` fields remain optional input for payload compatibility but are ignored by the scorer.

### Feedback

- `id: UUID`
- `experience: str | None`
- `difficulties: str | None`
- `suggestions: str | None`
- `educational_value: str | None`
- `ratings: dict | None` stored as JSONB
- `created_at: datetime`

Keep feedback anonymous by default. Bound every text field, rate-limit submissions, and avoid collecting names, registration numbers, email addresses, or other personal data unless an approved evaluation protocol requires them. The academic questionnaire and task-completion study are research procedures; do not silently turn the application into a general analytics or surveillance system.

## API compatibility notes

Keep legacy paths initially. Normalize response/error envelopes only as a planned breaking change because the legacy API is inconsistent: FAQ/quiz list calls return arrays directly, while PDU calls return `{ success, message, data }`.

FastAPI modules should be separated by domain:

```text
app/api/routes/health.py
app/api/routes/auth.py
app/api/routes/faqs.py
app/api/routes/quizzes.py
app/api/routes/pdu.py
app/api/routes/feedback.py
```

Route handlers should validate and coordinate only. Put PDU calculations, password/token operations, seeding, and quiz scoring into services. Database access should be session-scoped and dependency-injected.

Keep PDU code deterministic under test. If production responses intentionally use randomized IPs, ports, sequence numbers, or IDs, inject the random generator/seed so tests can assert complete outputs.

## Frontend migration map

| Legacy | Target |
| --- | --- |
| `src/App.jsx` routes | `app/**/page.tsx` and route-group layouts |
| `react-router-dom` navigation | `next/link`, `next/navigation`, redirects |
| `VITE_API_URL` | `NEXT_PUBLIC_API_URL` |
| `src/utils/api.js` | generated client plus a thin `lib/api.ts` wrapper |
| `src/pages/*.jsx` | route-specific server/client components |
| `src/components/**` | typed components under `components/**` |
| `src/data/**` | typed constants/content under `lib/content` |
| `public/models/*.glb` | `apps/web/public/models/*.glb` |
| global Vite bootstrap CSS | `app/globals.css` and preserved CSS modules |

Next.js boundaries:

- Keep static educational data and non-interactive page shells server-rendered.
- Mark simulation, quiz, admin form, and storage-dependent components with `"use client"`.
- Dynamically import the WebGL scene with `{ ssr: false }`.
- Do not reference `window`, `sessionStorage`, or WebGL during server rendering.
- Preserve direct-link behavior for every route and provide explicit `loading.tsx`, `error.tsx`, and `not-found.tsx` states where useful.
- Keep quiz fallback behavior in the client wrapper, but log/observe failures rather than silently hiding all API problems.
- Use Hugeicons for every interface icon. Import `HugeiconsIcon` from `@hugeicons/react` and individual icons from the chosen Hugeicons package; never introduce Lucide or wildcard icon imports.
- The web `dev` script uses Next.js Turbopack. This avoids intermittent Windows webpack vendor-chunk races; a stale `.next` cache may be removed safely when a previous dev process was interrupted.
- Implement `/learn` as the academic accordion reference and keep `/about` for project context rather than conflating the two.
- Implement the simulation as an explicit finite-state machine with `idle`, `encapsulating(layer)`, `transmitting`, `decapsulating(layer)`, and `complete` states plus a history stack.
- Map controls to explicit actions: `PLAY`, `PAUSE`, `STEP_FORWARD`, `STEP_BACKWARD`, `RESET`, `SET_MESSAGE`, and `ANIMATION_COMPLETE`.
- Disable conflicting controls while a GSAP transition is active; animation completion advances state through one controlled transition.
- Treat the selected information layer as separate UI state so inspecting it never changes the simulation machine.

## Academic scope boundaries

The tool models logical teaching behavior with illustrative header values; it does not claim byte-level protocol accuracy. Do not expand the academic claim to include:

- real network protocol implementation or full protocol emulation;
- live packet capture or real-time packet transmission;
- physical device routing or advanced routing configuration;
- wireless network simulation;
- collaborative/multi-user simulation;
- adaptive learning or long-term learner progress tracking;
- replacement of professional simulation/emulation platforms.

Neon-backed question/FAQ management and optional attempt storage are operational conveniences. The core learner experience must remain usable as a single-user, self-paced browser tool, including the built-in quiz fallback. Persistent anonymous attempts do not constitute a learner-progress feature.

## Authentication direction

The rebuild uses a FastAPI-managed HttpOnly JWT cookie (`osi_access_token`). Login also sets a
non-HttpOnly `osi_csrf_token` cookie; the browser must echo that value as `X-CSRF-Token` for admin
mutations and logout. Production cookies are Secure and SameSite=None for the Vercel/Render topology;
local development uses non-Secure SameSite=Lax cookies. The frontend must use `credentials: "include"`
and must not persist access tokens in `sessionStorage` or localStorage.

## Neon and connection handling

- Use the Neon pooled connection URL for application traffic.
- Configure conservative SQLAlchemy pool sizes because Render workers multiply connections.
- Enable pre-ping/recycle behavior appropriate for serverless connections.
- Always require TLS.
- Use the direct Neon URL for migrations if the pooler and prepared statements conflict.
- Never run schema creation from `main.py` startup.
- Never depend on local SQLite in tests that claim to validate Postgres behavior; JSONB, UUID, constraints, and concurrency differ.

The current API implementation uses SQLAlchemy's psycopg driver with conservative pool settings,
`pool_pre_ping`, and connection recycling. Alembic revision `0001_initial` is the source-controlled
baseline; the configured Neon database has been upgraded to that revision and seeded idempotently.
Rate limiting uses an atomic Redis fixed-window backend when `REDIS_URL` is configured. The in-memory
implementation remains an explicit fallback for local development and transient Redis outages; use the
Redis backend before running multiple Render workers.

## Seed and content migration

The current SQLite database may contain admin-edited content beyond code defaults. Before retiring it:

1. Stop writes or take a consistent copy.
2. Export `faqs`, `quiz_questions`, `drag_drop_questions`, and any desired `quiz_attempts` to JSON.
3. Transform JSON strings (`options`, `items`, `categories`, `correct_mappings`, `answers`) into actual JSON values.
4. Import through a one-off, version-controlled Python command using the same Pydantic validation as the API.
5. Compare row counts and sample records.
6. Do not migrate legacy password hashes unless they are verified compatible with the new password library; otherwise bootstrap/reset the admin securely.

The normal `app.db.seed` command is separate from this one-off migration and must remain idempotent.

## Deployment constraints

### Render

- The service must bind to `0.0.0.0:$PORT`.
- Local filesystem writes are not durable and must not contain application data.
- Migrations run in pre-deploy, once, rather than in every web worker.
- `/api/health` is the cheap liveness probe; `/api/ready` performs a database-backed readiness check.
- Render free/low-cost instances may cold-start; the web UI needs honest loading and retry states.

The API startup validates production settings, emits request IDs and structured request timing logs,
returns generic error envelopes, and adds baseline security headers. Login and feedback endpoints are
rate-limited per forwarded client address through the configured shared backend.

### Vercel

- The project root is `apps/web` unless a root configuration says otherwise.
- Browser-visible environment variables are compiled into deployments; set preview and production values separately.
- The API URL must use HTTPS in production.
- Three.js bundles and GLB models require performance attention: dynamic loading, compressed assets where safe, meaningful loading UI, and mobile testing.

### CORS

Allow only known origins. Local development needs `http://localhost:3000`. Production needs the canonical Vercel/custom domain. Preview deployments need either an explicitly managed allowlist or a tightly validated hostname rule; never use wildcard origins with credentials.

## Quality gates

A migration PR is ready only when relevant checks pass:

- Ruff formatting/lint and mypy for API code
- Pytest unit/integration suite
- ESLint and TypeScript strict checking
- Frontend unit/component tests
- Playwright smoke tests against production builds
- Next.js production build
- Alembic upgrade from an empty PostgreSQL database
- OpenAPI client regeneration produces no uncommitted diff
- No secrets appear in tracked files or build output

Manual parity review must include desktop and mobile layouts, all seven animation steps, both quiz types, offline quiz fallback, admin CRUD, keyboard operation, reduced-motion behavior, and a failed/cold API request.

Academic acceptance must additionally verify:

- both hosts show seven correctly labeled layers and PDUs;
- the complete sender 7 → 1 / medium / receiver 1 → 7 sequence;
- Play, Pause, Forward, Backward, and Reset from every valid state;
- header/trailer addition and removal plus original-message recovery;
- non-interrupting layer inspection and the independent Learn accordion;
- 20+ MCQs, random 10-question attempts, immediate feedback, explanations, and score summary;
- exact drag/drop placement/rejection/review behavior;
- feedback submission;
- smooth operation on representative mid-range lab hardware and a supported ≥768 px viewport;
- HTTPS and no specialized client installation.

## Suggested implementation sequence

### Phase 1 — Foundation

- Add root workspace files and shared commands.
- Scaffold strict TypeScript Next.js and FastAPI packages.
- Add linting, type checking, tests, environment examples, and CI.
- Do not delete or mechanically rewrite legacy folders.

### Phase 2 — Persistence and API

- Implement settings and database session handling.
- Create SQLAlchemy models and the initial Alembic migration.
- Add idempotent seed and SQLite export/import commands.
- Port auth and CRUD endpoints with tests.
- Add the validated/rate-limited feedback endpoint and persistence.
- Port PDU logic as pure Python functions with golden fixtures derived from legacy behavior.

### Phase 3 — Web migration

- Generate the TypeScript API client.
- Create App Router pages and navigation, including dedicated Learn and feedback pages.
- Port content, styles, quiz behavior, admin dashboard, and 3D assets.
- Implement the academically specified sender/medium/receiver state machine and complete control set.
- Add explicit loading/error/offline states and accessibility fallbacks.

### Phase 4 — Deployment and cutover

- Provision Neon and deploy Render staging.
- Deploy Vercel preview and configure CORS.
- Run migration, contract, and end-to-end tests.
- Validate legacy parity with stakeholders.
- Cut production traffic over and observe errors/latency.
- Remove legacy code only in a later cleanup change.

## Open decisions

These require product or implementation confirmation before they materially affect behavior:

- Whether learners will have accounts, or quiz attempts remain anonymous.
- Whether to add a same-origin BFF in front of the existing HttpOnly cookie flow; direct cookie auth is the current implementation.
- Whether Redis should be provisioned as a managed Render add-on or an external service; `REDIS_URL` is the stable contract.
- Whether admin-created OSI layer content should become database-managed; currently layer content is mostly code-defined.
- Whether API response envelopes should be standardized in a later versioned contract.
- The canonical production domains and whether Vercel preview deployments need live API access.
- Whether to retain historical quiz attempts during SQLite migration.
- Whether the small-screen experience should reflow the three panels or show the report's recommended larger-display notice; it must remain honest and understandable either way.

Until decided, choose the narrowest compatibility-preserving option and leave a documented issue rather than expanding scope.

## Do not do

- Do not delete `osi-simulation/` or `osi-backend-/` before parity and data migration are accepted.
- Do not commit credentials or copy the SQLite database into a public artifact.
- Do not use automatic `create_all()` as the production migration strategy.
- Do not duplicate business logic between FastAPI and Next.js.
- Do not manually maintain TypeScript types that can be generated from OpenAPI.
- Do not make the 3D scene the only way to understand or operate the simulator.
- Do not silently change zero-based correct-answer indexes while migrating.
- Do not assume Render local disk is persistent.
- Do not treat the admin dashboard, user accounts, or persistent analytics as academic objectives.
- Do not replace the required Learn screen with a general About page.
- Do not let opening layer information pause, advance, reset, or otherwise mutate the simulation.

## Definition of done

The rebuild is done when the monorepo is the primary development path; fresh setup works from documentation; an empty Neon-compatible Postgres database can be migrated and seeded; the FastAPI contract and generated web client agree; every academic requirement and behavioral invariant passes automated and manual checks; Vercel and Render production deployments communicate securely; existing editable content has been migrated or intentionally retired; secrets and observability are configured; and legacy folders can be removed without losing features, data, or rollback confidence.
