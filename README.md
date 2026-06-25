# CutLab

CutLab is a self-running AI video studio that turns an idea into a trend-optimised short-form video package.

## Hackathon Brief

Built for the Cursor Hands Off London Hackathon, CutLab demonstrates a self-running business powered by agents. The business sells automated video generation and hook optimisation to creators, brands, and agencies.

The root route `/` opens directly into a complete seeded demo. There is no login, no empty state, and no external API required.

## Agent Workflow

The demo path is:

1. User asks for a video.
2. CutLab generates an initial rough concept.
3. A trend intelligence layer analyses seeded niche patterns.
4. The system compares the rough cut against trending hook/style fingerprints.
5. It improves openings, keyframes, scripts, and scene structure.
6. It outputs an optimised video package.
7. It simulates performance learning with seeded metrics.
8. It prepares export/payment, gated by human approval.

Agents shown in the timeline:

- Intake Agent
- Director Agent
- Video Generation Agent
- Trend Scout Agent
- Hook Analyst Agent
- Editor Agent
- Learning Agent
- Safety & Approval Agent
- Monetisation Agent

## Stack

- Cursor
- Next.js App Router
- TypeScript
- Tailwind CSS
- Modal optional trend endpoint
- Supabase optional persistence
- PayPal Sandbox optional checkout
- Vercel-ready deployment

## Demo Flow

The seeded campaign is for RepForm, a gymwear brand launching a new compression top for 18-30 gym-goers. The business objective is product page clicks and purchases.

The homepage shows:

- Hero with workflow chips and stack badges.
- User brief.
- Initial rough concept with title, scenes, hook, script, and keyframes.
- Agent timeline.
- Trend intelligence fingerprints.
- Our video vs trending comparison.
- Three improved hook variants.
- Final optimised cut based on Variant B.
- Simulated learning loop.
- Safety and oversight checks.
- Monetisation / PayPal Sandbox step.
- Chronological audit log.

## Live Vs Mocked

Live:

- Next.js dashboard.
- Typed deterministic `CutLabRun` data model.
- `/api/run-agent` route.
- `/api/checkout` route.
- Optional `/api/save-run` Supabase persistence route.

Mocked or seeded:

- Trend fingerprints.
- Retention, click-intent, and purchase-intent metrics.
- Learning loop feedback.
- Video rendering output, represented as storyboard, script, keyframes, and hook variants.
- Checkout when PayPal credentials are missing or sandbox order creation fails.

Not implemented tonight:

- Real YouTube scraping.
- Real publishing.
- Real video rendering.
- Autonomous payment execution.

## Safety And Oversight Design

CutLab copies structural patterns, not creator-specific footage, wording, faces, or protected assets.

The MVP allows agents to generate, analyse, score, and recommend. It blocks high-impact external actions until human approval. The safety panel covers copyright similarity risk, brand safety risk, misleading claims risk, platform policy risk, publishing approval, and payment/export approval.

Current demo status: approved for internal preview, requires human approval for external publishing.

## Fallback Design

`src/lib/demo-data.ts` is the judge-visible source of truth. The seeded data always works.

`/api/run-agent` accepts a POST body with brief, niche, and product fields. If `MODAL_TREND_ENDPOINT` exists, the route tries it with an 8-second timeout. If Modal is missing, slow, failed, or returns the wrong shape, the route returns deterministic seeded `CutLabRun` data.

`/api/checkout` returns PayPal Sandbox-shaped checkout data. If PayPal credentials are missing, it returns mock checkout data instead of failing the demo.

## Environment

No environment variables are required for the default demo.

Optional integrations:

```bash
MODAL_TREND_ENDPOINT=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_API_BASE_URL=https://api-m.sandbox.paypal.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## Run Locally

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run lint
npm run build
```

## Future Work

- Replace seeded trend fingerprints with a bounded trend-ingestion worker.
- Add creator-uploaded brand guidelines and claim substantiation.
- Persist run history, approvals, and feedback in Supabase.
- Render real videos after human approval.
- Add entitlement tracking after PayPal payment approval.
- Learn recommendations from real retention and conversion data.
