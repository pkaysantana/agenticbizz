# CutLab

CutLab is a self-running short-form video growth business: a creator enters an idea and niche, then agents generate a storyboard, extract hook fingerprints, create opening variants, simulate retention, recommend the best business outcome, and prepare monetised export with human approval gates.

## Hackathon Brief

Built for the Cursor Hands Off London Hackathon: create a self-running business powered by AI agents. CutLab demonstrates agent autonomy, persistent run state, simulated decision-making, audit logs, graceful fallbacks, and safety oversight for a real creator-growth workflow.

Hackathon submission summary:

CutLab is a self-running short-form video growth business. A creator submits an idea and niche; agents generate a storyboard, extract hook fingerprints, create variants, simulate retention, recommend the best opening, and prepare monetised export. A safety layer checks copyright, brand, and policy risk, while human approval gates prevent unsafe autonomous publishing.

## Agents

- Brief Intake Agent: structures raw creator input into a campaign brief, assumptions, constraints, and risk flags.
- Scout Agent: simulates high-performing trend patterns for the niche using seeded demo data.
- Analyst Agent: extracts first-three-second hook fingerprints without copying creator-specific content.
- Director Agent: turns the brief into a 20-second storyboard.
- Editor Agent: creates three hook variants from the strongest fingerprints.
- Learning Agent: simulates retention, click intent, confidence, and recommends the best business outcome.
- Safety & Oversight Agent: checks copyright similarity, misleading claims, brand risk, platform risk, reputation, and approval needs.
- Monetisation Agent: prepares paid optimisation export through a sandboxed checkout flow.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- `lucide-react` for UI icons
- `zod` for light API input validation
- Supabase optional for run/audit persistence
- Modal optional for trend analysis endpoint
- PayPal sandbox optional for checkout preparation
- Vercel-ready deployment

## Demo Flow

The root route `/` opens directly into a completed seeded RepForm demo:

1. Creator brief for a fitness apparel compression top.
2. Sequential agent timeline.
3. Storyboard for a 20-second TikTok/Reel.
4. Trend fingerprints panel.
5. Three hook variant cards.
6. Learning loop with simulated retention and click-intent metrics.
7. Predict-before-publish safety and oversight layer.
8. Approval/export/payment panel.
9. Audit log of agent handoffs.
10. Architecture and autonomy-level summary.

The “Run autonomous workflow” button replays the timeline and calls `/api/run-agent`. The page remains useful even when all external services are unavailable.

## Safety And Oversight Design

CutLab uses “autonomy where risk is low, approval where risk is high.” Agents can generate, analyse, score, and recommend, but external publishing, export, and payment execution require human approval in the MVP.

The safety layer checks:

- Copyright similarity risk.
- Brand safety risk.
- Misleading claim risk.
- Platform policy risk.
- Reputational risk.
- Whether external actions are allowed.

The demo status is approved for internal preview only. Fully autonomous publishing/payment is disabled.

## Fallback Design

The deterministic seeded run in `src/lib/demo-data.ts` is the source of truth for the judge-visible demo. `/api/run-agent` tries `MODAL_TREND_ENDPOINT` with an 8-second timeout, validates the returned shape, and falls back to the seeded `CutLabRun` if the endpoint is missing, slow, failed, or malformed.

`/api/save-run` returns success with `persisted: false` if Supabase is not configured or the write fails. `/api/checkout` creates a PayPal sandbox order when sandbox credentials are configured, and otherwise returns a polished demo checkout state so the flow never blocks.

## Live Vs Sandboxed

- Live: Next.js dashboard, typed seeded data, `/api/run-agent`, `/api/save-run`, `/api/checkout`, replayable agent timeline.
- Optional live integration: Modal trend endpoint if `MODAL_TREND_ENDPOINT` is configured.
- Optional persistence: Supabase if `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` plus `SUPABASE_SERVICE_ROLE_KEY` are configured.
- Sandboxed: PayPal checkout preparation. With sandbox credentials, CutLab creates a real PayPal sandbox order and returns the approval URL.
- Demo-only: retention predictions, trend fingerprints, and safety scores are deterministic seeded simulations, not validated performance forecasts.

## Future Work

- Replace seeded trend fingerprints with a bounded trend-ingestion worker.
- Persist runs, approvals, and feedback loops in Supabase.
- Add creator-uploaded brand guidelines and claim substantiation.
- Add real video rendering/export after approval.
- Use real paid checkout and entitlement tracking.
- Train future recommendations from actual retention and conversion feedback.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Useful checks:

```bash
npm run lint
npm run build
```

## Environment

Copy `.env.local.example` to `.env.local` only if you want optional integrations:

```bash
SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MODAL_TREND_ENDPOINT=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_API_BASE_URL=https://api-m.sandbox.paypal.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

No environment variables are required for the default demo.

## PayPal Sandbox

The approval flow is safe by default. Clicking “Approve export” calls `/api/checkout`.

Without PayPal credentials, the UI shows “Demo checkout approved” and no money moves. With sandbox credentials, the API creates a PayPal sandbox order for `10 optimisation runs: GBP 19` and returns an approval URL.

To enable the real sandbox order path:

1. Create a PayPal sandbox app in the PayPal Developer Dashboard.
2. Add the sandbox client ID and secret to `.env.local`.
3. Restart `npm run dev`.
4. Click “Approve export”, then “Open PayPal sandbox checkout”.

## Deploy on Vercel

Deploy as a standard Next.js app. The fallback-first design means a Vercel deployment works without Supabase, Modal, or PayPal credentials.
