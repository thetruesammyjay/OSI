# OSI Model Learning Platform

An interactive learning platform for understanding the seven-layer OSI model. The application combines a learner-controlled protocol data unit (PDU) simulator, multiple-choice and drag-and-drop assessments, a contextual knowledge base, and a feedback interface. Content administration is included as a supporting operational feature.

The project implements the academic work **“An Open Systems Interconnection (OSI) Model Simulation Web Tool for Interactive and Educational Learning”**. The academic objectives and functional requirements are the source of truth for product scope. The move to Next.js, FastAPI, Neon, Vercel, and Render changes the implementation architecture, not the educational purpose or required learner experience.

This repository is being rebuilt as a monorepo with:

- **Frontend:** Next.js (App Router), TypeScript, React, Three.js, and GSAP
- **API:** Python, FastAPI, SQLAlchemy, Alembic, and Pydantic
- **Database:** Neon serverless PostgreSQL
- **Hosting:** Vercel for the web app and Render for the API
- **Workspace:** pnpm workspaces and Turborepo
- **Icons:** Hugeicons via `@hugeicons/react` and `@hugeicons/core-free-icons` (no Lucide)
- **Visual design:** [`DESIGN.md`](./DESIGN.md) is the light-theme visual source of truth


The canonical OSI brand asset is [`apps/web/public/OSI.png`](./apps/web/public/OSI.png). Preserve its aspect ratio and use it for the navigation/footer brand lockup. `DESIGN.md` contains the full color, typography, spacing, shape, layout, and component rules. Its “Ditto”/CSR wording is placeholder reference copy; OSI academic terminology and content remain authoritative.

## Product features

- View sender and receiver hosts with all seven OSI layers, including each layer's number, name, and PDU type.
- Enter application data and visualize encapsulation from Layer 7 to Layer 1, transmission through a network medium, and de-encapsulation from Layer 1 to Layer 7.
- Play, pause, step forward, step backward, and reset the simulation.
- Inspect representative headers as they are added and removed, including the Data Link trailer where applicable.
- Select any layer without interrupting the simulation to view its functions, example protocols, relevant hardware, layer identity, and PDU type.
- Use a dedicated accordion-style Learn screen as an independent OSI reference.
- Run a complete sender-to-receiver network communication simulation.
- Take 10 randomly selected questions from a minimum 20-question multiple-choice bank, with immediate correctness feedback and explanations.
- Complete randomized drag-and-drop protocol/technology-to-layer exercises; correct placements remain, while incorrect placements return to the source with error feedback.
- Review final scores, correct answers, explanations, and performance feedback.
- Submit qualitative feedback about the learning experience.
- Authenticate as an administrator.
- Create, edit, order, and delete quiz questions and FAQs.
- Continue serving built-in quiz content when the API is temporarily unavailable.

The simulation is illustrative rather than a byte-perfect network emulator. It does not perform packet capture, real packet transmission, physical routing, wireless simulation, advanced routing configuration, or full protocol emulation. It is a single-user introductory learning tool, not a replacement for Cisco Packet Tracer, GNS3, or professional protocol analysis software.

## Academic requirements traceability

| Requirement | Required behavior in the rebuild |
| --- | --- |
| FR1 — OSI layer representation | Display all seven layers for both sender and receiver; every layer shows number, name, and PDU type. |
| FR2 — Encapsulation/de-encapsulation | Animate user-entered data through sender Layers 7 → 1, across the medium, then receiver Layers 1 → 7. Provide Play, Pause, Step Forward, Step Backward, and Reset. |
| FR3 — Contextual layer information | Selecting a layer reveals functions, protocols, hardware, PDU, number, and name without changing or pausing simulation state. Provide an independent accordion-style Learn screen. |
| FR4 — Assessment | Provide MCQ and drag/drop assessments, immediate feedback, explanations/review, and scores. Randomly choose 10 MCQs from a bank of at least 20. |
| NFR1–2 — Accessibility | Run in a modern browser without specialized installation. |
| NFR3 — Learnability | Be understandable with minimal prior instruction and use contextual explanations. |
| NFR4, 7 — Performance | Animate smoothly on mid-range laboratory hardware and respond with minimal perceptible delay. |
| NFR5 — Responsive layout | Support desktop/tablet layouts; the three-panel simulation targets widths of about 768 px and above, with a clear larger-display notice or usable alternative below that width. |
| NFR6 — Lightweight deployment | Keep the browser client and API deployable on Vercel/Render without specialized client software. |
| NFR8 — Security | Use HTTPS in deployed environments. |

Admin CRUD, Neon persistence, deployment automation, and API client generation are implementation/maintenance extensions. They must support the academic tool without turning it into a multi-user learning-management system, adaptive assessment platform, long-term learner tracker, or professional network emulator.

## Target repository structure

```text
.
├── apps/
│   ├── web/                         # Next.js frontend deployed to Vercel
│   │   ├── app/                     # App Router pages and layouts
│   │   ├── components/              # UI, quiz, admin, and 3D components
│   │   ├── lib/                     # API client, auth helpers, constants
│   │   ├── public/models/           # Existing GLB device models
│   │   └── tests/
│   └── api/                         # FastAPI service deployed to Render
│       ├── app/
│       │   ├── api/routes/          # HTTP route modules
│       │   ├── core/                # Settings, security, logging
│       │   ├── db/                  # Session, base, seeds
│       │   ├── models/              # SQLAlchemy models
│       │   ├── schemas/             # Pydantic request/response schemas
│       │   ├── services/            # PDU and domain logic
│       │   └── main.py
│       ├── alembic/                 # Database migrations
│       └── tests/
├── packages/
│   ├── api-client/                  # Generated TypeScript OpenAPI client
│   ├── config-eslint/               # Shared frontend lint configuration
│   └── config-typescript/           # Shared TypeScript configuration
├── render.yaml                      # Render blueprint
├── CONTEXT.md                       # Architecture decisions and migration brief
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

Python is not managed by pnpm. Root scripts should delegate frontend tasks through Turborepo and API tasks to the Python environment in `apps/api`.

## Prerequisites

- Node.js 20 or newer
- pnpm 9 or newer (`corepack enable` is recommended)
- Python 3.12 or newer
- uv 0.9 or newer
- A Neon project and PostgreSQL connection string
- Optional: Docker, if a local PostgreSQL fallback is later added

## Local setup

The commands below describe the current monorepo scaffold and its production workflow.

1. Install JavaScript dependencies from the repository root:

   ```bash
   pnpm install
   ```

2. Install the API dependencies with uv:

   ```bash
   cd apps/api
   uv sync
   cd ../..
   ```
   ```

3. Copy the example environment files:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   ```

   On PowerShell, use `Copy-Item` in place of `cp` if needed.

4. Add the Neon pooled connection string to `apps/api/.env`. Neon requires TLS, so retain `sslmode=require` in the URL.

5. Apply migrations and seed development content:

   ```bash
   cd apps/api
   uv run alembic upgrade head
   uv run python -m app.db.seed
   cd ../..
   ```

6. Start both applications in separate terminals:

   ```bash
   pnpm dev:web
   pnpm dev:api
   ```

   Expected local URLs:

   - Web: `http://localhost:3000`
   - API: `http://localhost:8000`
   - OpenAPI UI: `http://localhost:8000/docs`
   - Liveness: `http://localhost:8000/api/health`
   - Database readiness: `http://localhost:8000/api/ready`

## Environment variables

Never commit `.env`, `.env.local`, Neon credentials, JWT signing keys, or production admin passwords.

### API: `apps/api/.env`

```dotenv
ENVIRONMENT=development
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST/DBNAME?sslmode=require
JWT_SECRET=replace-with-at-least-32-random-bytes
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
JWT_ISSUER=osi-api
AUTH_COOKIE_NAME=osi_access_token
CSRF_COOKIE_NAME=osi_csrf_token
AUTH_COOKIE_SAMESITE=lax
AUTH_COOKIE_SECURE=false
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace-with-a-strong-password
CORS_ORIGINS=http://localhost:3000
LOG_LEVEL=INFO
REDIS_URL=
RATE_LIMIT_BACKEND=auto
DATABASE_POOL_SIZE=5
DATABASE_MAX_OVERFLOW=5
DATABASE_POOL_RECYCLE_SECONDS=1800
```

`CORS_ORIGINS` should be parsed as a comma-separated list so preview and production domains can both be allowed. Use Neon's pooled URL for normal application traffic and, if Alembic has trouble through the pooler, expose a separate `MIGRATION_DATABASE_URL` using the direct connection.

### Web: `apps/web/.env.local`

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Only variables prefixed with `NEXT_PUBLIC_` are exposed to browser code. Do not put secrets in the web environment.

## Icon system

All web UI icons must use Hugeicons. Use the official [`HugeiconsIcon` React integration](https://hugeicons.com/docs/integrations/react/quick-start) and import only the specific icon needed from the selected Hugeicons package:

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification03Icon } from "@hugeicons/core-free-icons";

<HugeiconsIcon icon={Notification03Icon} size={24} color="currentColor" strokeWidth={1.5} />
```

Use `@hugeicons/core-free-icons` for the free Stroke Rounded set. If a paid style is approved later, document the license/registry setup and use the corresponding `@hugeicons-pro/core-*` package. Import individual icons for tree-shaking; do not use wildcard imports. Do not add Lucide, another icon library, or hand-authored replacement SVGs for interface icons. Decorative icons must have an empty accessible label; meaningful icons need an accessible name, tooltip, or visible text.

## Root commands

The root `package.json` exposes these commands:

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run all development tasks through Turbo |
| `pnpm dev:web` | Start Next.js on port 3000 |
| `pnpm dev:api` | Start Uvicorn with reload on port 8000 |
| `pnpm build` | Build all JavaScript workspaces |
| `pnpm lint` | Run frontend linting and Python Ruff checks |
| `pnpm typecheck` | Run TypeScript and Python type checks |
| `pnpm test` | Run frontend and API test suites |
| `pnpm openapi:generate` | Regenerate the typed frontend API client |

The web development script uses Next.js Turbopack and writes to `.next-dev` so development
artifacts cannot race with a production `.next` build. If a previously interrupted Next
process reports a missing manifest under `apps/web/.next-dev`, stop the dev server, remove
only that generated cache, and restart:

```powershell
Remove-Item -LiteralPath .\apps\web\.next-dev -Recurse -Force
pnpm dev:web
```

API commands may also be run directly from `apps/api`:

```bash
uv run uvicorn app.main:app --reload --port 8000
uv run pytest
uv run ruff check app tests
uv run mypy app
uv run alembic revision --autogenerate -m "describe change"
uv run alembic upgrade head
```

## Application routes

The Next.js rebuild should preserve the current user-facing route behavior:

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page and product introduction |
| `/simulation` | Public | Interactive OSI/PDU simulation |
| `/learn` | Public | Accordion-style seven-layer knowledge base |
| `/about` | Public | Project purpose, academic context, and FAQs |
| `/quiz` | Public | Redirect to quiz selection |
| `/quiz/select` | Public | Choose quiz type |
| `/quiz/[type]` | Public | Multiple-choice or drag-and-drop quiz |
| `/admin` | Public | Admin sign-in |
| `/admin/dashboard` | Admin | Manage questions and FAQs |
| `/feedback` | Public | Submit learning/usability feedback |

Use server components by default. Components using Three.js, GSAP, drag-and-drop, browser storage, or other browser APIs must be client components. Load large 3D scenes dynamically with SSR disabled.

## API contract

The FastAPI service should retain the `/api` prefix and the existing route shapes during migration to avoid coupling the UI rewrite to an unnecessary contract rewrite.

### System and authentication

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Cheap liveness response |
| `GET` | `/api/ready` | Public | Database-backed readiness response |
| `POST` | `/api/auth/login` | Public | Establish an HttpOnly admin session cookie |
| `POST` | `/api/auth/logout` | CSRF token | Clear the admin session cookies |
| `GET` | `/api/auth/verify` | Admin cookie | Verify the current admin session |

### FAQs

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/faq` | Public | List ordered FAQs |
| `POST` | `/api/faq` | Admin | Create an FAQ |
| `PUT` | `/api/faq/{id}` | Admin | Update an FAQ |
| `DELETE` | `/api/faq/{id}` | Admin | Delete an FAQ |

### Feedback

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/feedback` | Public | Submit JSON-formatted learner feedback |

Feedback input should be bounded and validated. Store only the fields required for evaluation, avoid collecting sensitive personal data by default, and return a generic acknowledgement.

### Quizzes

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/quiz/questions` | Public | List multiple-choice questions |
| `POST` | `/api/quiz/questions` | Admin | Create a multiple-choice question |
| `PUT` | `/api/quiz/questions/{id}` | Admin | Update a question |
| `DELETE` | `/api/quiz/questions/{id}` | Admin | Delete a question |
| `GET` | `/api/quiz/drag-drop` | Public | List drag-and-drop questions |
| `POST` | `/api/quiz/drag-drop` | Admin | Create a drag-and-drop question |
| `PUT` | `/api/quiz/drag-drop/{id}` | Admin | Update a drag-and-drop question |
| `DELETE` | `/api/quiz/drag-drop/{id}` | Admin | Delete a drag-and-drop question |
| `POST` | `/api/quiz/attempt` | Public | Score submitted question IDs/answers server-side and record the attempt |

### PDU simulation

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/pdu/layers` | Return summaries of all seven layers |
| `GET` | `/api/pdu/layers/{layer}` | Return details for one layer (1–7) |
| `POST` | `/api/pdu/encapsulate` | Add simulated headers from Layer 7 to Layer 1 |
| `POST` | `/api/pdu/decapsulate` | Remove simulated headers from Layer 1 to Layer 7 |
| `POST` | `/api/pdu/simulate` | Run encapsulation, transmission, and decapsulation |

PDU payloads must be non-empty strings no longer than 10,000 characters. Define all request and response bodies as Pydantic models so FastAPI's OpenAPI schema is the contract source of truth.

## Database design

Use UUID primary keys for new PostgreSQL records, timezone-aware timestamps, and JSONB for structured quiz data. The initial schema should contain:

| Table | Important fields |
| --- | --- |
| `users` | `id`, unique `username`, `password_hash`, `created_at` |
| `faqs` | `id`, `question`, `answer`, `category`, `order_index`, timestamps |
| `quiz_questions` | `id`, `question`, `options` JSONB, `correct_answer`, `explanation`, `category`, `type`, `order_index`, timestamps |
| `drag_drop_questions` | `id`, `title`, `description`, `items` JSONB, `categories` JSONB, `correct_mappings` JSONB, `explanation`, `order_index`, timestamps |
| `quiz_attempts` | `id`, nullable `user_id`, `score`, `total_questions`, `answers` JSONB, `completed_at` |
| `feedback` | `id`, optional `experience`, `difficulties`, `suggestions`, `educational_value`, optional ratings JSONB, `created_at` |

Add check constraints for non-negative scores/order values, valid correct-answer indexes, and `score <= total_questions`. Add indexes on category/order columns and quiz-attempt completion time. Persist migrations with Alembic; do not create tables implicitly during application startup.

The seed command must be idempotent. It should insert the default admin only when credentials are configured and seed the legacy FAQs and quiz questions only when their tables are empty.

## Authentication and security

- Hash passwords with Argon2 (preferred) or bcrypt; never store plaintext passwords.
- Return short, generic errors for invalid credentials.
- Keep login and feedback rate limiting. The API uses an atomic Redis fixed-window limiter when `REDIS_URL` is configured, with a bounded in-memory fallback for local development or Redis outages. Configure Redis before running multiple Render workers.
- Validate JWT issuer, expiry, algorithm, and subject on every protected request.
- Use an `HttpOnly`, `Secure`, `SameSite=None` access cookie for the cross-origin Vercel/Render deployment and a non-HttpOnly CSRF cookie paired with the `X-CSRF-Token` header on admin mutations.
- Restrict CORS to the explicit Vercel production domain and expected preview/local origins.
- Validate request sizes and never return internal exception details in production.

The active contract uses cookies; the login response does not expose a usable bearer token. Browser
requests must opt into credentials (`credentials: "include"`) and send the CSRF cookie value in the
`X-CSRF-Token` header for admin create/update/delete and logout requests.

## Testing

Minimum acceptance coverage for the rebuild:

- API unit tests for every PDU layer transformation.
- API integration tests for auth, FAQ CRUD, both quiz types, and attempt recording.
- Migration test against PostgreSQL, not SQLite.
- Web component tests for scoring, drag-and-drop mappings, auth guards, and fallback data.
- Simulation state-machine tests covering Play, Pause, Forward, Backward, Reset, complete 7 → 1 → transmission → 1 → 7 traversal, and history restoration.
- Interaction tests proving that opening layer information does not mutate or pause simulation state.
- Playwright flows for landing → simulation, Learn, both quiz types, feedback submission, admin login, and admin CRUD.
- Contract generation check that fails CI when the committed TypeScript client differs from FastAPI OpenAPI.

Before merging:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Deployment

### Neon

1. Create a Neon project and database.
2. Copy the pooled connection string into Render's `DATABASE_URL` secret.
3. Keep TLS enabled with `sslmode=require`.
4. Run `uv run alembic upgrade head` as a Render pre-deploy command.
5. Seed once via a Render shell/job; the idempotent seed is safe to rerun.

### Render API

Create a Python web service rooted at `apps/api`.

- Build command: `uv sync --frozen --no-dev`
- Pre-deploy command: `uv run alembic upgrade head`
- Start command: `uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check: `/api/health`
- Readiness check: `/api/ready`
- Required secrets: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`
- Required setting: `CORS_ORIGINS=https://your-project.vercel.app`
- Configure `REDIS_URL` and set `RATE_LIMIT_BACKEND=redis` before scaling beyond one Render worker.
- Set `ENVIRONMENT=production` to enable production startup validation and disable interactive API docs.
- Use an explicit `MIGRATION_DATABASE_URL` when the Neon pooler is incompatible with migration tooling.

Do not rely on Render's local disk for durable data. Neon is the system of record.

### Vercel web app

Import the same repository and set the root directory to `apps/web` (or use the repository's monorepo-aware Vercel configuration).

- Framework preset: Next.js
- Environment variable: `NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api`
- Deploy production from the main branch.
- Add preview domains to API CORS only when previews need live API access.

After both services deploy, verify the health endpoint, login, FAQ/quiz reads, an admin write, and a complete PDU simulation from the Vercel domain.

## Migration plan

1. Scaffold the workspace, Next.js app, and FastAPI app without deleting legacy code.
2. Define SQLAlchemy models, Alembic migrations, Neon connectivity, and idempotent seeds.
3. Port PDU logic to pure, deterministic Python services and implement the client-side finite-state simulation controls/history with tests.
4. Port auth and CRUD routes while preserving the current HTTP contract.
5. Generate the typed TypeScript API client from FastAPI OpenAPI.
6. Move routes, CSS modules, data, and GLB assets into `apps/web`; replace React Router with App Router and restore the required `/learn` and `/feedback` experiences.
7. Verify behavior and responsive/3D performance against the legacy app.
8. Deploy a staging API to Render and web app to Vercel; run end-to-end tests.
9. Remove the legacy directories only after parity is accepted and rollback is no longer needed.

See [CONTEXT.md](./CONTEXT.md) for detailed decisions, invariants, and the handoff checklist.

## Contributing

- Keep business rules out of route handlers and React components.
- Update Alembic migrations whenever database models change.
- Regenerate the frontend client whenever the public API schema changes.
- Keep commits scoped by app or shared package where practical.
- Do not edit generated API client files manually.
- Preserve accessibility: keyboard-operable quizzes, visible focus states, semantic labels, reduced-motion behavior, and non-3D explanations of simulated events.

## License

No license has been selected yet. Add a `LICENSE` file before distributing the project publicly.
