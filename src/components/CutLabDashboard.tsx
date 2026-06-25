"use client";

import { useEffect, useState } from "react";
import { Activity, Play, RotateCcw, Sparkles } from "lucide-react";
import { AgentTimeline } from "@/components/AgentTimeline";
import { AuditLog } from "@/components/AuditLog";
import { BriefCard } from "@/components/BriefCard";
import { HookVariants } from "@/components/HookVariants";
import { LearningLoop } from "@/components/LearningLoop";
import { MonetisationPanel } from "@/components/MonetisationPanel";
import { SafetyPanel } from "@/components/SafetyPanel";
import { Storyboard } from "@/components/Storyboard";
import { TrendFingerprints } from "@/components/TrendFingerprints";
import type { CutLabRun } from "@/lib/types";

export function CutLabDashboard({ initialRun }: { initialRun: CutLabRun }) {
  const [run, setRun] = useState(initialRun);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | undefined>();
  const [approvalStatus, setApprovalStatus] = useState<
    "pending" | "approved" | "rejected"
  >("pending");
  const [checkoutMessage, setCheckoutMessage] = useState<string>();
  const [checkoutUrl, setCheckoutUrl] = useState<string>();

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveStepIndex((current) => {
        const next = current === undefined ? 0 : current + 1;

        if (next >= run.agentSteps.length) {
          window.clearInterval(interval);
          setIsRunning(false);
          return undefined;
        }

        return next;
      });
    }, 450);

    return () => window.clearInterval(interval);
  }, [isRunning, run.agentSteps.length]);

  async function handleRunWorkflow() {
    setActiveStepIndex(0);
    setIsRunning(true);
    setApprovalStatus("pending");
    setCheckoutMessage(undefined);
    setCheckoutUrl(undefined);

    try {
      const response = await fetch("/api/run-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(run.brief),
      });

      if (!response.ok) {
        return;
      }

      const nextRun = (await response.json()) as CutLabRun;
      setRun(nextRun);
    } catch {
      setRun(initialRun);
    }
  }

  async function handleApproveExport() {
    setApprovalStatus("approved");
    setCheckoutMessage("Preparing sandbox checkout...");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
      });

      if (!response.ok) {
        setCheckoutMessage(
          "Export approved. Sandbox checkout fallback remains available.",
        );
        return;
      }

      const checkout = (await response.json()) as {
        message?: string;
        checkoutUrl?: string;
      };
      setCheckoutMessage(
        checkout.message ??
          "Export approved. PayPal sandbox checkout prepared; no payment executed.",
      );
      setCheckoutUrl(checkout.checkoutUrl);
    } catch {
      setCheckoutMessage(
        "Export approved. Checkout service unavailable, so the demo keeps the sandbox placeholder.",
      );
      setCheckoutUrl(undefined);
    }
  }

  function handleRejectExport() {
    setApprovalStatus("rejected");
    setCheckoutMessage("Export rejected. Payment and publishing stay blocked.");
    setCheckoutUrl(undefined);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#164e63,transparent_35%),linear-gradient(135deg,#020617,#111827_55%,#18181b)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/30 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-sm font-medium text-cyan-100">
                <Sparkles className="h-4 w-4" />
                Self-running video growth workflow
              </div>
              <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">
                CutLab
              </h1>
              <p className="mt-4 max-w-2xl text-xl leading-8 text-zinc-200">
                A self-running video growth business: generate, optimise, test,
                learn.
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
                Idea → storyboard → hook variants → simulated retention →
                approval → export. Not just generation: generation,
                optimisation, testing, learning.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <button
                onClick={handleRunWorkflow}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200"
              >
                {isRunning ? (
                  <RotateCcw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Run autonomous workflow
              </button>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-300">
                <span className="font-semibold text-white">
                  Fallback active:
                </span>{" "}
                deterministic data is used if the external agent endpoint is
                unavailable.
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {["Next.js", "Supabase optional", "Modal optional", "PayPal Sandbox", "Vercel"].map(
              (badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-zinc-300"
                >
                  {badge}
                </span>
              ),
            )}
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr_0.9fr]">
          <div className="space-y-6">
            <BriefCard brief={run.brief} />
            <ArchitectureCard autonomyLevel={run.autonomyLevel} />
          </div>

          <div className="space-y-6">
            <AgentTimeline
              steps={run.agentSteps}
              activeStepIndex={activeStepIndex}
            />
            <Storyboard scenes={run.storyboard} />
            <TrendFingerprints fingerprints={run.fingerprints} />
            <HookVariants
              variants={run.hookVariants}
              predictions={run.predictions}
              selectedVariantId={run.selectedVariantId}
            />
            <LearningLoop
              predictions={run.predictions}
              variants={run.hookVariants}
              selectedVariantId={run.selectedVariantId}
            />
          </div>

          <div className="space-y-6">
            <SafetyPanel
              safetyCheck={run.safetyCheck}
              approvalStatus={approvalStatus}
              onApproveExport={handleApproveExport}
              onReject={handleRejectExport}
            />
            <MonetisationPanel
              monetisation={run.monetisation}
              approvalStatus={approvalStatus}
              checkoutMessage={checkoutMessage}
              checkoutUrl={checkoutUrl}
            />
            <AuditLog events={run.auditLog} />
          </div>
        </section>
      </div>
    </main>
  );
}

function ArchitectureCard({ autonomyLevel }: { autonomyLevel: string }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <div className="mb-4 flex items-center gap-3">
        <Activity className="h-5 w-5 text-cyan-200" />
        <h2 className="text-xl font-semibold text-white">Architecture</h2>
      </div>
      <p className="text-sm leading-6 text-zinc-300">
        Predict-before-publish agent workflow with typed seeded state, API
        fallback paths, optional Supabase persistence, optional Modal trend
        endpoint, and sandboxed monetisation.
      </p>
      <p className="mt-4 rounded-2xl bg-black/20 p-4 text-sm leading-6 text-cyan-100">
        Autonomy level: {autonomyLevel}
      </p>
      <div className="mt-4 space-y-2 text-sm leading-6 text-zinc-300">
        <p>Level 1: Assistive generation</p>
        <p>Level 2: Autonomous analysis</p>
        <p>Level 3: Autonomous optimisation</p>
        <p>Level 4: External action with approval</p>
        <p>Level 5: Fully autonomous publishing/payment, disabled in MVP</p>
      </div>
    </section>
  );
}
