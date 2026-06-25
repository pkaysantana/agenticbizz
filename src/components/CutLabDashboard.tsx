"use client";

import { useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  BadgePoundSterling,
  CheckCircle2,
  Clapperboard,
  FileText,
  FlaskConical,
  Play,
  RotateCcw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import type {
  AgentStep,
  AuditEvent,
  CampaignBrief,
  CutLabRun,
  FinalCut,
  HookVariant,
  InitialVideoConcept,
  LearningLoop,
  MonetisationStep,
  SafetyCheck,
  TrendFingerprint,
  VideoComparison,
} from "@/lib/types";

export function CutLabDashboard({ initialRun }: { initialRun: CutLabRun }) {
  const [run, setRun] = useState(initialRun);
  const [isRunning, setIsRunning] = useState(false);
  const [activeAgentIndex, setActiveAgentIndex] = useState<number | undefined>();
  const [checkoutMessage, setCheckoutMessage] = useState<string>();
  const [approvalUrl, setApprovalUrl] = useState<string>();

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveAgentIndex((current) => {
        const next = current === undefined ? 0 : current + 1;

        if (next >= run.agentSteps.length) {
          window.clearInterval(interval);
          setIsRunning(false);
          return undefined;
        }

        return next;
      });
    }, 420);

    return () => window.clearInterval(interval);
  }, [isRunning, run.agentSteps.length]);

  async function runWorkflow() {
    setIsRunning(true);
    setActiveAgentIndex(0);
    setCheckoutMessage(undefined);
    setApprovalUrl(undefined);

    try {
      const response = await fetch("/api/run-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(run.brief),
      });

      if (response.ok) {
        setRun((await response.json()) as CutLabRun);
      }
    } catch {
      setRun(initialRun);
    }
  }

  async function prepareCheckout() {
    setCheckoutMessage("Preparing PayPal Sandbox handoff...");
    setApprovalUrl(undefined);

    try {
      const response = await fetch("/api/checkout", { method: "POST" });
      const checkout = (await response.json()) as {
        message?: string;
        approvalUrl?: string;
      };

      setCheckoutMessage(
        checkout.message ??
          "Mock checkout ready. Human approval is still required before payment execution.",
      );
      setApprovalUrl(checkout.approvalUrl);
    } catch {
      setCheckoutMessage(
        "Checkout service unavailable. Mock checkout remains ready and no payment is executed.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#22d3ee22,transparent_34%),radial-gradient(circle_at_top_right,#a855f722,transparent_30%),linear-gradient(135deg,#020617,#0f172a_52%,#111827)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Hero
          fallbackUsed={run.fallbackUsed}
          isRunning={isRunning}
          onRunWorkflow={runWorkflow}
        />

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
          <div className="space-y-6">
            <BriefPanel brief={run.brief} />
            <AgentTimeline
              steps={run.agentSteps}
              activeAgentIndex={activeAgentIndex}
            />
            <SafetyPanel safetyCheck={run.safetyCheck} />
            <MonetisationPanel
              monetisation={run.monetisation}
              checkoutMessage={checkoutMessage}
              approvalUrl={approvalUrl}
              onPrepareCheckout={prepareCheckout}
            />
          </div>

          <div className="space-y-6">
            <InitialConceptPanel concept={run.initialVideoConcept} />
            <TrendPanel fingerprints={run.trendFingerprints} />
            <ComparisonPanel comparison={run.comparison} />
            <HookVariantsPanel variants={run.hookVariants} />
            <FinalCutPanel finalCut={run.finalCut} />
            <LearningLoopPanel learningLoop={run.learningLoop} />
            <AuditLogPanel events={run.auditLog} />
          </div>
        </section>
      </div>
    </main>
  );
}

function Hero({
  fallbackUsed,
  isRunning,
  onRunWorkflow,
}: {
  fallbackUsed: boolean;
  isRunning: boolean;
  onRunWorkflow: () => void;
}) {
  const workflow = [
    "Idea",
    "Rough Cut",
    "Trend Scan",
    "Hook Upgrade",
    "Final Cut",
    "Export",
  ];
  const stack = [
    "Cursor",
    "Next.js",
    "Modal",
    "Supabase",
    "PayPal Sandbox",
    "Vercel",
  ];

  return (
    <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/30 lg:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-sm font-medium text-cyan-100">
            <Sparkles className="h-4 w-4" />
            Cursor Hands Off London Hackathon MVP
          </div>
          <h1 className="text-5xl font-black tracking-tight sm:text-7xl">
            CutLab
          </h1>
          <p className="mt-4 max-w-3xl text-xl leading-8 text-zinc-200">
            A self-running AI video studio: generate, trend-match, improve,
            export.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            CutLab turns an idea into a trend-optimised short-form video
            package: storyboard, first-3-second hook, script, keyframes, safety
            gate, and monetised export step.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onRunWorkflow}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200"
          >
            {isRunning ? (
              <RotateCcw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Replay autonomous workflow
          </button>
          <p className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-300">
            Demo status: {fallbackUsed ? "seeded fallback active" : "external trend endpoint used"}.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {workflow.map((step) => (
          <span
            key={step}
            className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100"
          >
            {step}
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {stack.map((badge) => (
          <span
            key={badge}
            className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-medium text-zinc-300"
          >
            {badge}
          </span>
        ))}
      </div>
    </header>
  );
}

function BriefPanel({ brief }: { brief: CampaignBrief }) {
  return (
    <Card eyebrow="User Brief" title={brief.brand} icon={FileText}>
      <Quote>{brief.userRequest}</Quote>
      <div className="mt-4 grid gap-3">
        <Detail label="Brand" value={brief.brand} />
        <Detail label="Niche" value={brief.niche} />
        <Detail label="Audience" value={brief.audience} />
        <Detail label="Business objective" value={brief.businessObjective} />
        <Detail label="Tone" value={brief.tone} />
      </div>
    </Card>
  );
}

function InitialConceptPanel({ concept }: { concept: InitialVideoConcept }) {
  return (
    <Card
      eyebrow="Initial Video Generation"
      title={concept.title}
      icon={Clapperboard}
    >
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Metric label="Duration" value={`${concept.durationSeconds}s`} />
          <Quote>{concept.openingHook}</Quote>
          <List title="20-second structure" items={concept.structure} />
          <List title="Script draft" items={concept.scriptDraft} />
        </div>
        <div className="space-y-3">
          {concept.scenes.map((scene) => (
            <SceneCard key={scene.id} scene={scene} />
          ))}
          <Keyframes keyframes={concept.keyframes} />
        </div>
      </div>
    </Card>
  );
}

function AgentTimeline({
  steps,
  activeAgentIndex,
}: {
  steps: AgentStep[];
  activeAgentIndex?: number;
}) {
  return (
    <Card eyebrow="Agent Timeline" title="Agents completing work" icon={FlaskConical}>
      <div className="space-y-3">
        {steps.map((step, index) => {
          const running = activeAgentIndex === index;
          return (
            <article
              key={step.id}
              className={`rounded-2xl border p-4 ${
                running
                  ? "border-cyan-300/70 bg-cyan-300/10"
                  : "border-white/10 bg-black/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className={`mt-1 h-4 w-4 ${
                    step.status === "needs_approval"
                      ? "text-amber-300"
                      : "text-emerald-300"
                  }`}
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">{step.agentName}</h3>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-300">
                      {running ? "running" : step.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-zinc-300">
                    {step.summary}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Card>
  );
}

function TrendPanel({ fingerprints }: { fingerprints: TrendFingerprint[] }) {
  return (
    <Card
      eyebrow="Trend Intelligence"
      title="Fitness apparel hook/style fingerprints"
      icon={ScanSearch}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {fingerprints.map((fingerprint) => (
          <article
            key={fingerprint.id}
            className="rounded-2xl border border-white/10 bg-black/20 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-white">{fingerprint.name}</h3>
              <span className="rounded-full bg-emerald-300/15 px-2 py-1 text-xs font-semibold text-emerald-100">
                {fingerprint.relevanceScore}% relevance
              </span>
            </div>
            <div className="mt-4 grid gap-3">
              <Detail label="Frame 1 visual" value={fingerprint.frameOneVisual} />
              <Detail label="First cut timing" value={fingerprint.firstCutTiming} />
              <Detail label="Text overlay pattern" value={fingerprint.textOverlayPattern} />
              <Detail label="Movement / pacing" value={fingerprint.movementPacing} />
              <Detail label="Emotional trigger" value={fingerprint.emotionalTrigger} />
              <Detail label="Why it works" value={fingerprint.whyItWorks} />
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}

function ComparisonPanel({ comparison }: { comparison: VideoComparison }) {
  return (
    <Card eyebrow="Our Video vs Trending" title="Hook diagnosis" icon={ScanSearch}>
      <div className="grid gap-3 md:grid-cols-2">
        <Detail label="Initial hook" value={comparison.initialHook} />
        <Detail label="Problem" value={comparison.problem} />
        <Detail label="Trending pattern" value={comparison.trendingPattern} />
        <Detail label="Improvement" value={comparison.improvement} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {comparison.matchedFingerprints.map((fingerprint) => (
          <span
            key={fingerprint}
            className="rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-3 py-1 text-xs font-semibold text-fuchsia-100"
          >
            {fingerprint}
          </span>
        ))}
      </div>
    </Card>
  );
}

function HookVariantsPanel({ variants }: { variants: HookVariant[] }) {
  return (
    <Card eyebrow="Improved Hook Variants" title="Three upgraded openings" icon={Trophy}>
      <div className="grid gap-4 lg:grid-cols-3">
        {variants.map((variant) => (
          <article
            key={variant.id}
            className={`rounded-2xl border p-4 ${
              variant.recommended
                ? "border-amber-300/70 bg-amber-300/10 shadow-xl shadow-amber-950/20"
                : "border-white/10 bg-black/20"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-white">{variant.name}</h3>
              {variant.recommended ? (
                <span className="rounded-full bg-amber-300 px-2 py-1 text-xs font-bold text-zinc-950">
                  Recommended
                </span>
              ) : null}
            </div>
            <Quote>{variant.firstThreeSecondsScript}</Quote>
            <Detail label="Frame 1" value={variant.frameOneDescription} />
            <Detail label="Text overlay" value={variant.textOverlay} />
            <Detail label="First cut" value={variant.firstCutTiming} />
            <List title="Shot sequence" items={variant.shotSequence} />
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Metric label="3s hold" value={`${variant.predictedThreeSecondHoldRate}%`} />
              <Metric label="30s retention" value={`${variant.predictedThirtySecondRetention}%`} />
              <Metric label="Intent" value={`${variant.predictedPurchaseIntent}%`} />
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              {variant.rationale}
            </p>
          </article>
        ))}
      </div>
    </Card>
  );
}

function FinalCutPanel({ finalCut }: { finalCut: FinalCut }) {
  return (
    <Card eyebrow="Final Optimised Cut" title={finalCut.title} icon={Clapperboard}>
      <Quote>{finalCut.hook}</Quote>
      <p className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">
        Why selected: {finalCut.selectedBecause}
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <List title="Final 20-second script" items={finalCut.script} />
        <div className="space-y-3">
          {finalCut.scenes.map((scene) => (
            <SceneCard key={scene.id} scene={scene} />
          ))}
          <Keyframes keyframes={finalCut.keyframes} />
        </div>
      </div>
    </Card>
  );
}

function LearningLoopPanel({ learningLoop }: { learningLoop: LearningLoop }) {
  return (
    <Card eyebrow="Learning Loop" title="Simulated performance feedback" icon={FlaskConical}>
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="3s hold" value={`${learningLoop.predictedThreeSecondHold}%`} />
        <Metric label="30s retention" value={`${learningLoop.predictedThirtySecondRetention}%`} />
        <Metric label="Click intent" value={`${learningLoop.predictedClickIntent}%`} />
        <Metric label="Confidence" value={`${learningLoop.confidenceScore}%`} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Detail label="What the system learned" value={learningLoop.whatTheSystemLearned} />
        <Detail label="Next generation improvement" value={learningLoop.nextGenerationImprovement} />
        <Detail label="Generation 1" value={learningLoop.generationOne} />
        <Detail label="Generation 10" value={learningLoop.generationTen} />
      </div>
    </Card>
  );
}

function SafetyPanel({ safetyCheck }: { safetyCheck: SafetyCheck }) {
  return (
    <Card eyebrow="Safety & Oversight" title="Approval-gated autonomy" icon={ShieldCheck}>
      <p className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm font-semibold leading-6 text-amber-50">
        {safetyCheck.policyLanguage}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Risk label="Copyright similarity" value={safetyCheck.copyrightSimilarityRisk} />
        <Risk label="Brand safety" value={safetyCheck.brandSafetyRisk} />
        <Risk label="Misleading claims" value={safetyCheck.misleadingClaimsRisk} />
        <Risk label="Platform policy" value={safetyCheck.platformPolicyRisk} />
      </div>
      <List title="Oversight rules" items={safetyCheck.notes} />
    </Card>
  );
}

function MonetisationPanel({
  monetisation,
  checkoutMessage,
  approvalUrl,
  onPrepareCheckout,
}: {
  monetisation: MonetisationStep;
  checkoutMessage?: string;
  approvalUrl?: string;
  onPrepareCheckout: () => void;
}) {
  return (
    <Card
      eyebrow="Monetisation / PayPal Sandbox"
      title="Export package checkout"
      icon={BadgePoundSterling}
    >
      <div className="grid gap-3">
        <Detail label="Product" value={monetisation.product} />
        <Detail label="Price" value={`£${monetisation.price}`} />
        <Detail label="Agency plan" value={monetisation.agencyPlan} />
        <Detail label="Payment provider" value={monetisation.paymentProvider} />
        <Detail label="Status" value={monetisation.checkoutStatus} />
        <Detail
          label="Approval"
          value={
            monetisation.approvalRequired
              ? "Human approval required before payment execution."
              : "Approval not required."
          }
        />
      </div>
      <button
        onClick={onPrepareCheckout}
        className="mt-4 rounded-full bg-lime-300 px-4 py-2 text-sm font-bold text-zinc-950 transition hover:bg-lime-200"
      >
        Prepare mock checkout
      </button>
      <p className="mt-3 text-sm leading-6 text-zinc-300">
        {checkoutMessage ?? monetisation.message}
      </p>
      {approvalUrl ? (
        <a
          href={approvalUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex rounded-full border border-lime-300/40 bg-lime-300/10 px-4 py-2 text-sm font-semibold text-lime-100"
        >
          Open PayPal Sandbox approval
        </a>
      ) : null}
    </Card>
  );
}

function AuditLogPanel({ events }: { events: AuditEvent[] }) {
  return (
    <Card eyebrow="Audit Log" title="Chronological agent actions" icon={CheckCircle2}>
      <div className="grid gap-3 md:grid-cols-3">
        {events.map((event) => (
          <article
            key={event.id}
            className="rounded-2xl border border-white/10 bg-black/20 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              {event.timestamp}
            </p>
            <h3 className="mt-2 font-semibold text-white">{event.action}</h3>
            <p className="mt-1 text-sm text-cyan-100">{event.agentName}</p>
            <p className="mt-2 text-xs capitalize text-zinc-400">
              {event.status.replace("_", " ")}
            </p>
          </article>
        ))}
      </div>
    </Card>
  );
}

function Card({
  eyebrow,
  title,
  icon: Icon,
  children,
}: {
  eyebrow: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/15">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
        </div>
        <Icon className="h-6 w-6 text-cyan-200" />
      </div>
      {children}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm leading-6 text-zinc-200">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function Quote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm font-semibold leading-6 text-white">
      &quot;{children}&quot;
    </p>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4 rounded-2xl bg-black/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

function SceneCard({
  scene,
}: {
  scene: { timestamp: string; visual: string; overlay: string; script: string; cameraNotes: string };
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-violet-300/15 px-3 py-1 text-xs font-semibold text-violet-100">
          {scene.timestamp}
        </span>
        <h3 className="font-semibold text-white">{scene.visual}</h3>
      </div>
      <p className="mt-2 text-sm text-cyan-100">Overlay: {scene.overlay}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-300">{scene.script}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Camera: {scene.cameraNotes}
      </p>
    </article>
  );
}

function Keyframes({
  keyframes,
}: {
  keyframes: Array<{ id: string; timestamp: string; description: string }>;
}) {
  return (
    <div className="rounded-2xl bg-black/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Keyframes
      </p>
      <div className="mt-3 grid gap-2">
        {keyframes.map((keyframe) => (
          <p key={keyframe.id} className="text-sm leading-6 text-zinc-300">
            <span className="font-semibold text-white">{keyframe.timestamp}</span>{" "}
            {keyframe.description}
          </p>
        ))}
      </div>
    </div>
  );
}

function Risk({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold capitalize text-white">{value}</p>
    </div>
  );
}
